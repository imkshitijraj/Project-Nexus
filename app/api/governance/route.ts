import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { getWorkspaceUser } from "../../session-auth";
import { getDb } from "../../../db";
import {
  accessAuditEvents,
  operationRateLimits,
  portfolioChangeLog,
  projectActivity,
  projectMembers,
  projectMilestones,
  projectRisks,
  projects,
  workspaceMembers,
  workspaceNotifications,
} from "../../../db/schema";

type Db = Awaited<ReturnType<typeof getDb>>;

const riskStatuses = new Set(["open", "mitigating", "accepted", "closed"]);
const milestoneStatuses = new Set(["planned", "in_progress", "blocked", "completed"]);
const projectHealth = new Set(["On track", "At risk", "Delayed", "Completed"]);
const editableRoles = new Set(["owner", "manager", "contributor"]);

function json(body: unknown, status = 200, requestId = crypto.randomUUID()) {
  return Response.json(body, {
    status,
    headers: {
      "cache-control": "no-store",
      "x-request-id": requestId,
    },
  });
}

function clean(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function wholeNumber(value: unknown, minimum: number, maximum: number) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= minimum && parsed <= maximum
    ? parsed
    : null;
}

function optionalDate(value: unknown) {
  const parsed = clean(value, 10);
  return !parsed || /^\d{4}-\d{2}-\d{2}$/.test(parsed) ? parsed || null : undefined;
}

function parseJson(value: string) {
  try {
    return JSON.parse(value || "{}") as Record<string, unknown>;
  } catch {
    return {};
  }
}

async function resolveContext() {
  const user = await getWorkspaceUser();
  if (!user) return { error: "Sign in to continue.", status: 401 as const };
  const db = await getDb();
  const email = user.email.toLowerCase();
  const [membership] = await db
    .select()
    .from(workspaceMembers)
    .where(and(eq(workspaceMembers.email, email), eq(workspaceMembers.status, "active")))
    .limit(1);
  if (!membership) {
    return { error: "An active Nexus workspace membership is required.", status: 403 as const };
  }
  return { db, email, membership };
}

async function accessibleProjects(db: Db, email: string, workspaceRole: string) {
  const rows = await db
    .select()
    .from(projects)
    .orderBy(desc(projects.createdAt), desc(projects.id))
    .limit(200);
  if (workspaceRole === "administrator") {
    return rows.map((project) => ({
      ...project,
      accessRole: "administrator",
      canEdit: true,
    }));
  }
  const assignments = await db
    .select({ projectId: projectMembers.projectId, role: projectMembers.role })
    .from(projectMembers)
    .where(eq(projectMembers.email, email));
  const roles = new Map(assignments.map((item) => [item.projectId, item.role]));
  return rows
    .filter((project) => project.createdBy === email || roles.has(project.id))
    .map((project) => {
      const role = project.createdBy === email ? "owner" : roles.get(project.id) ?? "viewer";
      return { ...project, accessRole: role, canEdit: editableRoles.has(role) };
    });
}

async function projectPolicy(
  db: Db,
  projectId: number,
  email: string,
  workspaceRole: string,
) {
  const [project] = await db
    .select()
    .from(projects)
    .where(eq(projects.id, projectId))
    .limit(1);
  if (!project) return null;
  if (workspaceRole === "administrator") {
    return { project, role: "administrator", canEdit: true };
  }
  if (project.createdBy === email) {
    return { project, role: "owner", canEdit: true };
  }
  const [assignment] = await db
    .select({ role: projectMembers.role })
    .from(projectMembers)
    .where(and(eq(projectMembers.projectId, projectId), eq(projectMembers.email, email)))
    .limit(1);
  if (!assignment) return null;
  return {
    project,
    role: assignment.role,
    canEdit: editableRoles.has(assignment.role),
  };
}

async function consumeWriteQuota(db: Db, email: string) {
  const bucket = Math.floor(Date.now() / 60_000);
  const key = `governance:${email}:${bucket}`;
  const [current] = await db
    .select({ count: operationRateLimits.count })
    .from(operationRateLimits)
    .where(eq(operationRateLimits.key, key))
    .limit(1);
  if (current && current.count >= 45) return false;
  await db
    .insert(operationRateLimits)
    .values({ key, bucket, count: 1, updatedAt: new Date().toISOString() })
    .onConflictDoUpdate({
      target: operationRateLimits.key,
      set: {
        count: sql`${operationRateLimits.count} + 1`,
        updatedAt: new Date().toISOString(),
      },
    });
  return true;
}

async function validateOwner(db: Db, projectId: number, ownerEmail: string | null) {
  if (!ownerEmail) return true;
  const [member] = await db
    .select({ role: workspaceMembers.role })
    .from(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.email, ownerEmail),
        eq(workspaceMembers.status, "active"),
      ),
    )
    .limit(1);
  if (!member) return false;
  return Boolean(await projectPolicy(db, projectId, ownerEmail, member.role));
}

async function notifyOwner(
  db: Db,
  ownerEmail: string | null,
  actorEmail: string,
  projectId: number,
  type: string,
  title: string,
  body: string,
) {
  if (!ownerEmail || ownerEmail === actorEmail) return;
  await db.insert(workspaceNotifications).values({
    recipientEmail: ownerEmail,
    projectId,
    taskId: null,
    type,
    title,
    body,
  });
}

async function recordChange(
  db: Db,
  input: {
    projectId: number;
    actorEmail: string;
    entityType: string;
    entityId: number | null;
    action: string;
    before: Record<string, unknown>;
    after: Record<string, unknown>;
    reason: string;
    detail: string;
    risk?: string;
  },
) {
  await db.insert(portfolioChangeLog).values({
    projectId: input.projectId,
    actorEmail: input.actorEmail,
    entityType: input.entityType,
    entityId: input.entityId,
    action: input.action,
    beforeJson: JSON.stringify(input.before),
    afterJson: JSON.stringify(input.after),
    reason: input.reason,
  });
  await db.insert(projectActivity).values({
    projectId: input.projectId,
    actorEmail: input.actorEmail,
    action: input.action,
    entityType: input.entityType,
    entityId: input.entityId,
    detail: input.detail,
  });
  await db.insert(accessAuditEvents).values({
    actorEmail: input.actorEmail,
    action: `governance.${input.action}`,
    target: `${input.entityType}:${input.entityId ?? input.projectId}`,
    detail: input.detail,
    risk: input.risk ?? "low",
  });
}

export async function GET() {
  const requestId = crypto.randomUUID();
  try {
    const resolved = await resolveContext();
    if ("error" in resolved) return json({ error: resolved.error }, resolved.status, requestId);
    const { db, email, membership } = resolved;
    const availableProjects = await accessibleProjects(db, email, membership.role);
    const ids = availableProjects.map((project) => project.id);
    const [riskRows, milestoneRows, logRows, members] = ids.length
      ? await Promise.all([
          db
            .select({
              id: projectRisks.id,
              projectId: projectRisks.projectId,
              projectName: projects.name,
              title: projectRisks.title,
              description: projectRisks.description,
              probability: projectRisks.probability,
              impact: projectRisks.impact,
              status: projectRisks.status,
              ownerEmail: projectRisks.ownerEmail,
              mitigation: projectRisks.mitigation,
              targetDate: projectRisks.targetDate,
              version: projectRisks.version,
              createdBy: projectRisks.createdBy,
              updatedBy: projectRisks.updatedBy,
              createdAt: projectRisks.createdAt,
              updatedAt: projectRisks.updatedAt,
            })
            .from(projectRisks)
            .innerJoin(projects, eq(projectRisks.projectId, projects.id))
            .where(inArray(projectRisks.projectId, ids))
            .orderBy(desc(projectRisks.updatedAt), desc(projectRisks.id))
            .limit(300),
          db
            .select({
              id: projectMilestones.id,
              projectId: projectMilestones.projectId,
              projectName: projects.name,
              title: projectMilestones.title,
              description: projectMilestones.description,
              dueDate: projectMilestones.dueDate,
              status: projectMilestones.status,
              ownerEmail: projectMilestones.ownerEmail,
              version: projectMilestones.version,
              createdBy: projectMilestones.createdBy,
              updatedBy: projectMilestones.updatedBy,
              createdAt: projectMilestones.createdAt,
              updatedAt: projectMilestones.updatedAt,
            })
            .from(projectMilestones)
            .innerJoin(projects, eq(projectMilestones.projectId, projects.id))
            .where(inArray(projectMilestones.projectId, ids))
            .orderBy(projectMilestones.dueDate, projectMilestones.id)
            .limit(300),
          db
            .select({
              id: portfolioChangeLog.id,
              projectId: portfolioChangeLog.projectId,
              projectName: projects.name,
              actorEmail: portfolioChangeLog.actorEmail,
              entityType: portfolioChangeLog.entityType,
              entityId: portfolioChangeLog.entityId,
              action: portfolioChangeLog.action,
              beforeJson: portfolioChangeLog.beforeJson,
              afterJson: portfolioChangeLog.afterJson,
              reason: portfolioChangeLog.reason,
              createdAt: portfolioChangeLog.createdAt,
            })
            .from(portfolioChangeLog)
            .innerJoin(projects, eq(portfolioChangeLog.projectId, projects.id))
            .where(inArray(portfolioChangeLog.projectId, ids))
            .orderBy(desc(portfolioChangeLog.createdAt), desc(portfolioChangeLog.id))
            .limit(120),
          db
            .select({
              email: workspaceMembers.email,
              displayName: workspaceMembers.displayName,
              role: workspaceMembers.role,
            })
            .from(workspaceMembers)
            .where(eq(workspaceMembers.status, "active"))
            .orderBy(workspaceMembers.displayName),
        ])
      : [[], [], [], []];
    const today = new Date().toISOString().slice(0, 10);
    const week = new Date(Date.now() + 7 * 86_400_000).toISOString().slice(0, 10);
    const activeRisks = riskRows.filter((risk) => risk.status !== "closed");
    const activeMilestones = milestoneRows.filter((milestone) => milestone.status !== "completed");
    return json(
      {
        projects: availableProjects.map((project) => ({
          id: project.id,
          name: project.name,
          department: project.department,
          health: project.health,
          progress: project.progress,
          due: project.due,
          version: project.version,
          canEdit: project.canEdit,
        })),
        risks: riskRows,
        milestones: milestoneRows,
        logs: logRows.map((log) => ({
          ...log,
          before: parseJson(log.beforeJson),
          after: parseJson(log.afterJson),
        })),
        members,
        metrics: {
          openRisks: activeRisks.length,
          highRisks: activeRisks.filter((risk) => risk.probability * risk.impact >= 15).length,
          dueRisks: activeRisks.filter(
            (risk) => risk.targetDate && risk.targetDate >= today && risk.targetDate <= week,
          ).length,
          mitigationCoverage: activeRisks.length
            ? Math.round(
                (activeRisks.filter((risk) => risk.mitigation.trim()).length /
                  activeRisks.length) *
                  100,
              )
            : 100,
          upcomingMilestones: activeMilestones.filter(
            (milestone) => milestone.dueDate >= today && milestone.dueDate <= week,
          ).length,
          blockedMilestones: activeMilestones.filter(
            (milestone) => milestone.status === "blocked",
          ).length,
        },
      },
      200,
      requestId,
    );
  } catch (error) {
    console.error("governance.GET", requestId, error);
    return json(
      { error: "Portfolio governance data is temporarily unavailable.", requestId },
      500,
      requestId,
    );
  }
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  try {
    const resolved = await resolveContext();
    if ("error" in resolved) return json({ error: resolved.error }, resolved.status, requestId);
    const { db, email, membership } = resolved;
    if (!(await consumeWriteQuota(db, email))) {
      return json({ error: "Command rate limit reached. Try again in one minute." }, 429, requestId);
    }
    const payload = (await request.json()) as Record<string, unknown>;
    const action = clean(payload.action, 40);
    const projectId = Number(payload.projectId);

    if (action === "createRisk") {
      const policy = await projectPolicy(db, projectId, email, membership.role);
      if (!policy || !policy.canEdit) {
        return json({ error: "Your project role cannot create risks." }, 403, requestId);
      }
      const title = clean(payload.title, 160);
      const description = clean(payload.description, 1500);
      const probability = wholeNumber(payload.probability, 1, 5);
      const impact = wholeNumber(payload.impact, 1, 5);
      const mitigation = clean(payload.mitigation, 2000);
      const targetDate = optionalDate(payload.targetDate);
      const ownerEmail = clean(payload.ownerEmail, 254).toLowerCase() || null;
      if (!title || probability === null || impact === null || targetDate === undefined) {
        return json({ error: "Add a title, valid score, and valid target date." }, 400, requestId);
      }
      if (!(await validateOwner(db, projectId, ownerEmail))) {
        return json({ error: "The risk owner must have access to this project." }, 400, requestId);
      }
      const now = new Date().toISOString();
      const [risk] = await db
        .insert(projectRisks)
        .values({
          projectId,
          title,
          description,
          probability,
          impact,
          mitigation,
          targetDate,
          ownerEmail,
          createdBy: email,
          updatedBy: email,
          updatedAt: now,
        })
        .returning();
      await recordChange(db, {
        projectId,
        actorEmail: email,
        entityType: "risk",
        entityId: risk.id,
        action: "risk.created",
        before: {},
        after: risk,
        reason: "Risk registered",
        detail: `Registered “${risk.title}” with exposure ${risk.probability * risk.impact}.`,
        risk: risk.probability * risk.impact >= 15 ? "high" : "low",
      });
      await notifyOwner(
        db,
        ownerEmail,
        email,
        projectId,
        "risk",
        "Risk ownership assigned",
        `${policy.project.name}: ${risk.title}`,
      );
      return json({ ok: true, risk }, 201, requestId);
    }

    if (action === "updateRisk") {
      const riskId = Number(payload.riskId);
      const [current] = await db
        .select()
        .from(projectRisks)
        .where(eq(projectRisks.id, riskId))
        .limit(1);
      if (!current) return json({ error: "Risk not found." }, 404, requestId);
      const policy = await projectPolicy(db, current.projectId, email, membership.role);
      if (!policy || !policy.canEdit) {
        return json({ error: "Your project role cannot update this risk." }, 403, requestId);
      }
      if (Number(payload.version) !== current.version) {
        return json(
          { error: "This risk changed after you opened it. Refresh before saving." },
          409,
          requestId,
        );
      }
      const status = clean(payload.status, 20) || current.status;
      const probability = wholeNumber(payload.probability ?? current.probability, 1, 5);
      const impact = wholeNumber(payload.impact ?? current.impact, 1, 5);
      const targetDate = optionalDate(payload.targetDate ?? current.targetDate ?? "");
      const ownerEmail = clean(payload.ownerEmail ?? current.ownerEmail ?? "", 254).toLowerCase() || null;
      const mitigation = clean(payload.mitigation ?? current.mitigation, 2000);
      const reason = clean(payload.reason, 400);
      if (
        !riskStatuses.has(status) ||
        probability === null ||
        impact === null ||
        targetDate === undefined ||
        reason.length < 4
      ) {
        return json({ error: "Check the risk values and add a reason for the change." }, 400, requestId);
      }
      if (!(await validateOwner(db, current.projectId, ownerEmail))) {
        return json({ error: "The risk owner must have access to this project." }, 400, requestId);
      }
      const now = new Date().toISOString();
      const next = {
        status,
        probability,
        impact,
        targetDate,
        ownerEmail,
        mitigation,
        version: current.version + 1,
        updatedBy: email,
        updatedAt: now,
      };
      const [updated] = await db
        .update(projectRisks)
        .set(next)
        .where(and(eq(projectRisks.id, riskId), eq(projectRisks.version, current.version)))
        .returning();
      if (!updated) {
        return json({ error: "This risk was updated by someone else. Refresh and try again." }, 409, requestId);
      }
      await recordChange(db, {
        projectId: current.projectId,
        actorEmail: email,
        entityType: "risk",
        entityId: riskId,
        action: "risk.updated",
        before: current,
        after: updated,
        reason,
        detail: `Updated “${current.title}” to ${status}.`,
        risk: probability * impact >= 15 ? "medium" : "low",
      });
      await notifyOwner(
        db,
        ownerEmail,
        email,
        current.projectId,
        "risk",
        "Risk control updated",
        `${policy.project.name}: ${current.title} is now ${status}.`,
      );
      return json({ ok: true, risk: updated }, 200, requestId);
    }

    if (action === "createMilestone") {
      const policy = await projectPolicy(db, projectId, email, membership.role);
      if (!policy || !policy.canEdit) {
        return json({ error: "Your project role cannot create milestones." }, 403, requestId);
      }
      const title = clean(payload.title, 160);
      const description = clean(payload.description, 1500);
      const dueDate = optionalDate(payload.dueDate);
      const ownerEmail = clean(payload.ownerEmail, 254).toLowerCase() || null;
      if (!title || !dueDate) {
        return json({ error: "Milestone title and due date are required." }, 400, requestId);
      }
      if (!(await validateOwner(db, projectId, ownerEmail))) {
        return json({ error: "The milestone owner must have access to this project." }, 400, requestId);
      }
      const now = new Date().toISOString();
      const [milestone] = await db
        .insert(projectMilestones)
        .values({
          projectId,
          title,
          description,
          dueDate,
          ownerEmail,
          createdBy: email,
          updatedBy: email,
          updatedAt: now,
        })
        .returning();
      await recordChange(db, {
        projectId,
        actorEmail: email,
        entityType: "milestone",
        entityId: milestone.id,
        action: "milestone.created",
        before: {},
        after: milestone,
        reason: "Milestone scheduled",
        detail: `Scheduled “${milestone.title}” for ${milestone.dueDate}.`,
      });
      await notifyOwner(
        db,
        ownerEmail,
        email,
        projectId,
        "milestone",
        "Milestone ownership assigned",
        `${policy.project.name}: ${milestone.title} is due ${milestone.dueDate}.`,
      );
      return json({ ok: true, milestone }, 201, requestId);
    }

    if (action === "updateMilestone") {
      const milestoneId = Number(payload.milestoneId);
      const [current] = await db
        .select()
        .from(projectMilestones)
        .where(eq(projectMilestones.id, milestoneId))
        .limit(1);
      if (!current) return json({ error: "Milestone not found." }, 404, requestId);
      const policy = await projectPolicy(db, current.projectId, email, membership.role);
      if (!policy || !policy.canEdit) {
        return json({ error: "Your project role cannot update this milestone." }, 403, requestId);
      }
      if (Number(payload.version) !== current.version) {
        return json(
          { error: "This milestone changed after you opened it. Refresh before saving." },
          409,
          requestId,
        );
      }
      const status = clean(payload.status, 24) || current.status;
      const dueDate = optionalDate(payload.dueDate ?? current.dueDate);
      const ownerEmail = clean(payload.ownerEmail ?? current.ownerEmail ?? "", 254).toLowerCase() || null;
      const reason = clean(payload.reason, 400);
      if (!milestoneStatuses.has(status) || !dueDate || reason.length < 4) {
        return json({ error: "Check the milestone values and add a reason." }, 400, requestId);
      }
      if (!(await validateOwner(db, current.projectId, ownerEmail))) {
        return json({ error: "The milestone owner must have access to this project." }, 400, requestId);
      }
      const now = new Date().toISOString();
      const next = {
        status,
        dueDate,
        ownerEmail,
        version: current.version + 1,
        updatedBy: email,
        updatedAt: now,
      };
      const [updated] = await db
        .update(projectMilestones)
        .set(next)
        .where(
          and(
            eq(projectMilestones.id, milestoneId),
            eq(projectMilestones.version, current.version),
          ),
        )
        .returning();
      if (!updated) {
        return json(
          { error: "This milestone was updated by someone else. Refresh and try again." },
          409,
          requestId,
        );
      }
      await recordChange(db, {
        projectId: current.projectId,
        actorEmail: email,
        entityType: "milestone",
        entityId: milestoneId,
        action: "milestone.updated",
        before: current,
        after: updated,
        reason,
        detail: `Updated “${current.title}” to ${status.replace("_", " ")}.`,
        risk: status === "blocked" ? "medium" : "low",
      });
      await notifyOwner(
        db,
        ownerEmail,
        email,
        current.projectId,
        "milestone",
        status === "blocked" ? "Milestone blocked" : "Milestone updated",
        `${policy.project.name}: ${current.title} is ${status.replace("_", " ")}.`,
      );
      return json({ ok: true, milestone: updated }, 200, requestId);
    }

    if (action === "updateProjectStatus") {
      const policy = await projectPolicy(db, projectId, email, membership.role);
      if (!policy || !policy.canEdit) {
        return json({ error: "Your project role cannot update delivery status." }, 403, requestId);
      }
      const progress = wholeNumber(payload.progress, 0, 100);
      const health = clean(payload.health, 24);
      const due = clean(payload.due, 20);
      const reason = clean(payload.reason, 400);
      if (progress === null || !projectHealth.has(health) || !due || reason.length < 4) {
        return json({ error: "Add valid delivery values and a reason for the change." }, 400, requestId);
      }
      if (Number(payload.version) !== policy.project.version) {
        return json(
          { error: "Project status changed after you opened it. Refresh before saving." },
          409,
          requestId,
        );
      }
      const now = new Date().toISOString();
      const next = {
        progress,
        health,
        due,
        version: policy.project.version + 1,
        updatedBy: email,
        updatedAt: now,
      };
      const [updated] = await db
        .update(projects)
        .set(next)
        .where(and(eq(projects.id, projectId), eq(projects.version, policy.project.version)))
        .returning();
      if (!updated) {
        return json(
          { error: "Project status was updated by someone else. Refresh and try again." },
          409,
          requestId,
        );
      }
      await recordChange(db, {
        projectId,
        actorEmail: email,
        entityType: "project",
        entityId: projectId,
        action: "project.status_updated",
        before: policy.project,
        after: updated,
        reason,
        detail: `Set ${policy.project.name} to ${health} at ${progress}% complete.`,
        risk: health === "Delayed" ? "medium" : "low",
      });
      return json({ ok: true, project: updated }, 200, requestId);
    }

    return json({ error: "Unknown governance command." }, 400, requestId);
  } catch (error) {
    console.error("governance.POST", requestId, error);
    return json({ error: "The governance command failed.", requestId }, 500, requestId);
  }
}
