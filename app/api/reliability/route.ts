import { and, desc, eq, inArray, sql } from "drizzle-orm";
import { getChatGPTUser } from "../../chatgpt-auth";
import { getDb } from "../../../db";
import {
  accessAuditEvents,
  operationRateLimits,
  operationalServices,
  projectActivity,
  projectMembers,
  projects,
  recoveryRunbooks,
  reliabilityChanges,
  reliabilityEvents,
  reliabilityIncidents,
  workspaceMembers,
  workspaceNotifications,
} from "../../../db/schema";

type Db = Awaited<ReturnType<typeof getDb>>;

const editableProjectRoles = new Set(["owner", "manager", "contributor"]);
const serviceStatuses = new Set(["operational", "degraded", "outage", "maintenance"]);
const incidentStatuses = new Set(["investigating", "identified", "monitoring", "resolved"]);
const incidentSeverities = new Set(["sev_1", "sev_2", "sev_3", "sev_4"]);
const changeRiskLevels = new Set(["low", "medium", "high", "critical"]);
const changeDecisions = new Set(["approved", "rejected"]);

function json(body: unknown, status = 200, requestId = crypto.randomUUID()) {
  return Response.json(body, {
    status,
    headers: {
      "cache-control": "no-store",
      "x-request-id": requestId,
    },
  });
}

function clean(value: unknown, maximum: number) {
  return typeof value === "string" ? value.trim().slice(0, maximum) : "";
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

function timestamp(value: unknown) {
  const parsed = clean(value, 40);
  const date = new Date(parsed);
  return parsed && Number.isFinite(date.getTime()) ? date.toISOString() : null;
}

function parseJsonArray(value: string) {
  try {
    const parsed = JSON.parse(value || "[]");
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function resolveContext() {
  const user = await getChatGPTUser();
  if (!user) return { error: "Sign in with ChatGPT to continue.", status: 401 as const };
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
  const rows = await db.select().from(projects).orderBy(desc(projects.updatedAt)).limit(200);
  if (workspaceRole === "administrator") {
    return rows.map((project) => ({
      ...project,
      accessRole: "administrator",
      canEdit: true,
      canApprove: true,
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
      return {
        ...project,
        accessRole: role,
        canEdit: editableProjectRoles.has(role),
        canApprove: role === "owner" || role === "manager" || workspaceRole === "manager",
      };
    });
}

async function projectPolicy(db: Db, projectId: number, email: string, workspaceRole: string) {
  const [project] = await db.select().from(projects).where(eq(projects.id, projectId)).limit(1);
  if (!project) return null;
  if (workspaceRole === "administrator") {
    return { project, role: "administrator", canEdit: true, canApprove: true };
  }
  if (project.createdBy === email) {
    return { project, role: "owner", canEdit: true, canApprove: true };
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
    canEdit: editableProjectRoles.has(assignment.role),
    canApprove: assignment.role === "manager" || workspaceRole === "manager",
  };
}

async function servicePolicy(
  db: Db,
  serviceId: number,
  email: string,
  workspaceRole: string,
) {
  const [service] = await db
    .select()
    .from(operationalServices)
    .where(eq(operationalServices.id, serviceId))
    .limit(1);
  if (!service) return null;
  const policy = await projectPolicy(db, service.projectId, email, workspaceRole);
  return policy ? { ...policy, service } : null;
}

async function validateOwner(db: Db, projectId: number, ownerEmail: string | null) {
  if (!ownerEmail) return true;
  const [member] = await db
    .select({ role: workspaceMembers.role })
    .from(workspaceMembers)
    .where(and(eq(workspaceMembers.email, ownerEmail), eq(workspaceMembers.status, "active")))
    .limit(1);
  if (!member) return false;
  return Boolean(await projectPolicy(db, projectId, ownerEmail, member.role));
}

async function consumeWriteQuota(db: Db, email: string) {
  const bucket = Math.floor(Date.now() / 60_000);
  const key = `reliability:${email}:${bucket}`;
  const [current] = await db
    .select({ count: operationRateLimits.count })
    .from(operationRateLimits)
    .where(eq(operationRateLimits.key, key))
    .limit(1);
  if (current && current.count >= 40) return false;
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

async function notify(
  db: Db,
  recipientEmail: string | null,
  actorEmail: string,
  projectId: number,
  type: string,
  title: string,
  body: string,
) {
  if (!recipientEmail || recipientEmail === actorEmail) return;
  await db.insert(workspaceNotifications).values({
    recipientEmail,
    projectId,
    taskId: null,
    type,
    title,
    body,
  });
}

async function recordEvent(
  db: Db,
  input: {
    projectId: number;
    serviceId: number | null;
    actorEmail: string;
    action: string;
    targetType: string;
    targetId: number | null;
    detail: string;
    before?: Record<string, unknown>;
    after?: Record<string, unknown>;
    risk?: string;
  },
) {
  await db.batch([
    db.insert(reliabilityEvents).values({
      projectId: input.projectId,
      serviceId: input.serviceId,
      actorEmail: input.actorEmail,
      action: input.action,
      targetType: input.targetType,
      targetId: input.targetId,
      detail: input.detail,
      beforeJson: JSON.stringify(input.before ?? {}),
      afterJson: JSON.stringify(input.after ?? {}),
      risk: input.risk ?? "low",
    }),
    db.insert(projectActivity).values({
      projectId: input.projectId,
      actorEmail: input.actorEmail,
      action: `reliability.${input.action}`,
      entityType: input.targetType,
      entityId: input.targetId,
      detail: input.detail,
    }),
    db.insert(accessAuditEvents).values({
      actorEmail: input.actorEmail,
      action: `reliability.${input.action}`,
      target: `${input.targetType}:${input.targetId ?? input.projectId}`,
      detail: input.detail,
      risk: input.risk ?? "low",
    }),
  ]);
}

export async function GET() {
  const requestId = crypto.randomUUID();
  try {
    const resolved = await resolveContext();
    if ("error" in resolved) return json({ error: resolved.error }, resolved.status, requestId);
    const { db, email, membership } = resolved;
    const availableProjects = await accessibleProjects(db, email, membership.role);
    const projectIds = availableProjects.map((project) => project.id);
    const projectMap = new Map(availableProjects.map((project) => [project.id, project]));

    const [services, incidents, changes, runbooks, events, members] = projectIds.length
      ? await Promise.all([
          db
            .select({
              id: operationalServices.id,
              projectId: operationalServices.projectId,
              projectName: projects.name,
              name: operationalServices.name,
              tier: operationalServices.tier,
              status: operationalServices.status,
              ownerEmail: operationalServices.ownerEmail,
              availabilityTargetBps: operationalServices.availabilityTargetBps,
              currentAvailabilityBps: operationalServices.currentAvailabilityBps,
              rtoMinutes: operationalServices.rtoMinutes,
              rpoMinutes: operationalServices.rpoMinutes,
              version: operationalServices.version,
              updatedAt: operationalServices.updatedAt,
            })
            .from(operationalServices)
            .innerJoin(projects, eq(operationalServices.projectId, projects.id))
            .where(inArray(operationalServices.projectId, projectIds))
            .orderBy(operationalServices.tier, operationalServices.name),
          db
            .select({
              id: reliabilityIncidents.id,
              serviceId: reliabilityIncidents.serviceId,
              serviceName: operationalServices.name,
              projectId: reliabilityIncidents.projectId,
              projectName: projects.name,
              title: reliabilityIncidents.title,
              severity: reliabilityIncidents.severity,
              status: reliabilityIncidents.status,
              commanderEmail: reliabilityIncidents.commanderEmail,
              impact: reliabilityIncidents.impact,
              summary: reliabilityIncidents.summary,
              startedAt: reliabilityIncidents.startedAt,
              resolvedAt: reliabilityIncidents.resolvedAt,
              version: reliabilityIncidents.version,
              createdBy: reliabilityIncidents.createdBy,
              updatedBy: reliabilityIncidents.updatedBy,
              updatedAt: reliabilityIncidents.updatedAt,
            })
            .from(reliabilityIncidents)
            .innerJoin(operationalServices, eq(reliabilityIncidents.serviceId, operationalServices.id))
            .innerJoin(projects, eq(reliabilityIncidents.projectId, projects.id))
            .where(inArray(reliabilityIncidents.projectId, projectIds))
            .orderBy(desc(reliabilityIncidents.startedAt), desc(reliabilityIncidents.id))
            .limit(250),
          db
            .select({
              id: reliabilityChanges.id,
              serviceId: reliabilityChanges.serviceId,
              serviceName: operationalServices.name,
              projectId: reliabilityChanges.projectId,
              projectName: projects.name,
              title: reliabilityChanges.title,
              riskLevel: reliabilityChanges.riskLevel,
              status: reliabilityChanges.status,
              ownerEmail: reliabilityChanges.ownerEmail,
              windowStart: reliabilityChanges.windowStart,
              windowEnd: reliabilityChanges.windowEnd,
              implementationPlan: reliabilityChanges.implementationPlan,
              rollbackPlan: reliabilityChanges.rollbackPlan,
              decisionReason: reliabilityChanges.decisionReason,
              decidedBy: reliabilityChanges.decidedBy,
              decidedAt: reliabilityChanges.decidedAt,
              version: reliabilityChanges.version,
              createdBy: reliabilityChanges.createdBy,
              updatedAt: reliabilityChanges.updatedAt,
            })
            .from(reliabilityChanges)
            .innerJoin(operationalServices, eq(reliabilityChanges.serviceId, operationalServices.id))
            .innerJoin(projects, eq(reliabilityChanges.projectId, projects.id))
            .where(inArray(reliabilityChanges.projectId, projectIds))
            .orderBy(desc(reliabilityChanges.windowStart), desc(reliabilityChanges.id))
            .limit(250),
          db
            .select({
              id: recoveryRunbooks.id,
              serviceId: recoveryRunbooks.serviceId,
              serviceName: operationalServices.name,
              projectId: recoveryRunbooks.projectId,
              projectName: projects.name,
              title: recoveryRunbooks.title,
              status: recoveryRunbooks.status,
              ownerEmail: recoveryRunbooks.ownerEmail,
              trigger: recoveryRunbooks.trigger,
              stepsJson: recoveryRunbooks.stepsJson,
              lastTestedAt: recoveryRunbooks.lastTestedAt,
              nextReviewDate: recoveryRunbooks.nextReviewDate,
              version: recoveryRunbooks.version,
              updatedAt: recoveryRunbooks.updatedAt,
            })
            .from(recoveryRunbooks)
            .innerJoin(operationalServices, eq(recoveryRunbooks.serviceId, operationalServices.id))
            .innerJoin(projects, eq(recoveryRunbooks.projectId, projects.id))
            .where(inArray(recoveryRunbooks.projectId, projectIds))
            .orderBy(recoveryRunbooks.nextReviewDate, recoveryRunbooks.title)
            .limit(250),
          db
            .select({
              id: reliabilityEvents.id,
              projectId: reliabilityEvents.projectId,
              projectName: projects.name,
              serviceId: reliabilityEvents.serviceId,
              actorEmail: reliabilityEvents.actorEmail,
              action: reliabilityEvents.action,
              targetType: reliabilityEvents.targetType,
              targetId: reliabilityEvents.targetId,
              detail: reliabilityEvents.detail,
              risk: reliabilityEvents.risk,
              createdAt: reliabilityEvents.createdAt,
            })
            .from(reliabilityEvents)
            .innerJoin(projects, eq(reliabilityEvents.projectId, projects.id))
            .where(inArray(reliabilityEvents.projectId, projectIds))
            .orderBy(desc(reliabilityEvents.createdAt), desc(reliabilityEvents.id))
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
      : [[], [], [], [], [], []];

    const activeIncidents = incidents.filter((incident) => incident.status !== "resolved");
    const serviceIdsWithRunbooks = new Set(runbooks.map((runbook) => runbook.serviceId));
    const averageAvailability = services.length
      ? services.reduce((sum, service) => sum + service.currentAvailabilityBps, 0) /
        services.length /
        100
      : 100;

    return json(
      {
        projects: availableProjects.map((project) => ({
          id: project.id,
          name: project.name,
          canEdit: project.canEdit,
          canApprove: project.canApprove,
        })),
        services: services.map((service) => ({
          ...service,
          canEdit: projectMap.get(service.projectId)?.canEdit ?? false,
          canApprove: projectMap.get(service.projectId)?.canApprove ?? false,
        })),
        incidents,
        changes,
        runbooks: runbooks.map((runbook) => ({
          ...runbook,
          steps: parseJsonArray(runbook.stepsJson),
        })),
        events,
        members,
        metrics: {
          averageAvailability: Number(averageAvailability.toFixed(2)),
          activeIncidents: activeIncidents.length,
          criticalIncidents: activeIncidents.filter(
            (incident) => incident.severity === "sev_1" || incident.severity === "sev_2",
          ).length,
          pendingChanges: changes.filter((change) => change.status === "pending").length,
          recoveryCoverage: services.length
            ? Math.round((serviceIdsWithRunbooks.size / services.length) * 100)
            : 100,
        },
      },
      200,
      requestId,
    );
  } catch (error) {
    console.error("reliability.GET", requestId, error);
    return json(
      { error: "Reliability command data is temporarily unavailable.", requestId },
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

    if (action === "createService") {
      const projectId = Number(payload.projectId);
      const policy = await projectPolicy(db, projectId, email, membership.role);
      if (!policy?.canEdit) {
        return json({ error: "Your project role cannot register services." }, 403, requestId);
      }
      const name = clean(payload.name, 120);
      const tier = clean(payload.tier, 16);
      const ownerEmail = clean(payload.ownerEmail, 254).toLowerCase() || null;
      const availabilityTargetBps = wholeNumber(payload.availabilityTargetBps, 9000, 10000);
      const rtoMinutes = wholeNumber(payload.rtoMinutes, 1, 10080);
      const rpoMinutes = wholeNumber(payload.rpoMinutes, 0, 10080);
      if (!name || !["tier_1", "tier_2", "tier_3"].includes(tier)) {
        return json({ error: "Add a service name and valid criticality tier." }, 400, requestId);
      }
      if (availabilityTargetBps === null || rtoMinutes === null || rpoMinutes === null) {
        return json({ error: "Check the availability and recovery objectives." }, 400, requestId);
      }
      if (!(await validateOwner(db, projectId, ownerEmail))) {
        return json({ error: "The service owner must have access to this project." }, 400, requestId);
      }
      const now = new Date().toISOString();
      const [service] = await db
        .insert(operationalServices)
        .values({
          projectId,
          name,
          tier,
          ownerEmail,
          availabilityTargetBps,
          rtoMinutes,
          rpoMinutes,
          createdBy: email,
          updatedBy: email,
          updatedAt: now,
        })
        .returning();
      await recordEvent(db, {
        projectId,
        serviceId: service.id,
        actorEmail: email,
        action: "service.registered",
        targetType: "service",
        targetId: service.id,
        detail: `Registered ${service.name} as ${tier.replace("_", " ")}.`,
        after: service,
      });
      await notify(
        db,
        ownerEmail,
        email,
        projectId,
        "reliability",
        "Service ownership assigned",
        `${policy.project.name}: ${service.name}`,
      );
      return json({ ok: true, service }, 201, requestId);
    }

    if (action === "declareIncident") {
      const serviceId = Number(payload.serviceId);
      const policy = await servicePolicy(db, serviceId, email, membership.role);
      if (!policy?.canEdit) {
        return json({ error: "Your project role cannot declare incidents." }, 403, requestId);
      }
      const title = clean(payload.title, 160);
      const severity = clean(payload.severity, 12);
      const commanderEmail = clean(payload.commanderEmail, 254).toLowerCase() || null;
      const impact = clean(payload.impact, 1600);
      const startedAt = timestamp(payload.startedAt) ?? new Date().toISOString();
      if (!title || !incidentSeverities.has(severity) || !impact) {
        return json({ error: "Add an incident title, severity, and impact statement." }, 400, requestId);
      }
      if (!(await validateOwner(db, policy.service.projectId, commanderEmail))) {
        return json({ error: "The incident commander must have project access." }, 400, requestId);
      }
      const now = new Date().toISOString();
      const [incident] = await db
        .insert(reliabilityIncidents)
        .values({
          serviceId,
          projectId: policy.service.projectId,
          title,
          severity,
          commanderEmail,
          impact,
          startedAt,
          createdBy: email,
          updatedBy: email,
          updatedAt: now,
        })
        .returning();
      const serviceStatus = severity === "sev_1" ? "outage" : "degraded";
      await db
        .update(operationalServices)
        .set({
          status: serviceStatus,
          version: policy.service.version + 1,
          updatedBy: email,
          updatedAt: now,
        })
        .where(and(eq(operationalServices.id, serviceId), eq(operationalServices.version, policy.service.version)));
      await recordEvent(db, {
        projectId: policy.service.projectId,
        serviceId,
        actorEmail: email,
        action: "incident.declared",
        targetType: "incident",
        targetId: incident.id,
        detail: `${severity.replace("_", " ").toUpperCase()} declared: ${incident.title}.`,
        after: incident,
        risk: severity === "sev_1" || severity === "sev_2" ? "high" : "medium",
      });
      await notify(
        db,
        commanderEmail,
        email,
        policy.service.projectId,
        "incident",
        `${severity.replace("_", " ").toUpperCase()} incident command`,
        `${policy.service.name}: ${title}`,
      );
      return json({ ok: true, incident }, 201, requestId);
    }

    if (action === "updateIncident") {
      const incidentId = Number(payload.incidentId);
      const [current] = await db
        .select()
        .from(reliabilityIncidents)
        .where(eq(reliabilityIncidents.id, incidentId))
        .limit(1);
      if (!current) return json({ error: "Incident not found." }, 404, requestId);
      const policy = await servicePolicy(db, current.serviceId, email, membership.role);
      if (!policy?.canEdit) {
        return json({ error: "Your project role cannot command this incident." }, 403, requestId);
      }
      if (Number(payload.version) !== current.version) {
        return json({ error: "This incident changed after you opened it. Refresh first." }, 409, requestId);
      }
      const status = clean(payload.status, 20);
      const commanderEmail =
        clean(payload.commanderEmail ?? current.commanderEmail ?? "", 254).toLowerCase() || null;
      const summary = clean(payload.summary, 2000);
      const reason = clean(payload.reason, 500);
      if (!incidentStatuses.has(status) || reason.length < 4) {
        return json({ error: "Choose a valid status and add an incident update." }, 400, requestId);
      }
      if (!(await validateOwner(db, current.projectId, commanderEmail))) {
        return json({ error: "The incident commander must have project access." }, 400, requestId);
      }
      const now = new Date().toISOString();
      const [updated] = await db
        .update(reliabilityIncidents)
        .set({
          status,
          commanderEmail,
          summary,
          resolvedAt: status === "resolved" ? now : null,
          version: current.version + 1,
          updatedBy: email,
          updatedAt: now,
        })
        .where(
          and(eq(reliabilityIncidents.id, incidentId), eq(reliabilityIncidents.version, current.version)),
        )
        .returning();
      if (!updated) {
        return json({ error: "Another commander updated this incident. Refresh and retry." }, 409, requestId);
      }
      if (status === "resolved") {
        const [remaining] = await db
          .select({ count: sql<number>`count(*)` })
          .from(reliabilityIncidents)
          .where(
            and(
              eq(reliabilityIncidents.serviceId, current.serviceId),
              inArray(reliabilityIncidents.status, ["investigating", "identified", "monitoring"]),
            ),
          );
        if (!remaining?.count) {
          await db
            .update(operationalServices)
            .set({
              status: "operational",
              version: policy.service.version + 1,
              updatedBy: email,
              updatedAt: now,
            })
            .where(eq(operationalServices.id, current.serviceId));
        }
      }
      await recordEvent(db, {
        projectId: current.projectId,
        serviceId: current.serviceId,
        actorEmail: email,
        action: "incident.updated",
        targetType: "incident",
        targetId: incidentId,
        detail: `${current.title} moved to ${status}. ${reason}`,
        before: current,
        after: updated,
        risk: status === "resolved" ? "low" : "medium",
      });
      await notify(
        db,
        commanderEmail,
        email,
        current.projectId,
        "incident",
        "Incident status updated",
        `${current.title} is now ${status}.`,
      );
      return json({ ok: true, incident: updated }, 200, requestId);
    }

    if (action === "createChange") {
      const serviceId = Number(payload.serviceId);
      const policy = await servicePolicy(db, serviceId, email, membership.role);
      if (!policy?.canEdit) {
        return json({ error: "Your project role cannot schedule changes." }, 403, requestId);
      }
      const title = clean(payload.title, 160);
      const riskLevel = clean(payload.riskLevel, 16);
      const ownerEmail = clean(payload.ownerEmail, 254).toLowerCase() || null;
      const windowStart = timestamp(payload.windowStart);
      const windowEnd = timestamp(payload.windowEnd);
      const implementationPlan = clean(payload.implementationPlan, 3000);
      const rollbackPlan = clean(payload.rollbackPlan, 3000);
      if (
        !title ||
        !changeRiskLevels.has(riskLevel) ||
        !windowStart ||
        !windowEnd ||
        windowEnd <= windowStart ||
        implementationPlan.length < 10 ||
        rollbackPlan.length < 10
      ) {
        return json(
          { error: "Add a valid window, implementation plan, and rollback plan." },
          400,
          requestId,
        );
      }
      if (!(await validateOwner(db, policy.service.projectId, ownerEmail))) {
        return json({ error: "The change owner must have project access." }, 400, requestId);
      }
      const now = new Date().toISOString();
      const [change] = await db
        .insert(reliabilityChanges)
        .values({
          serviceId,
          projectId: policy.service.projectId,
          title,
          riskLevel,
          ownerEmail,
          windowStart,
          windowEnd,
          implementationPlan,
          rollbackPlan,
          createdBy: email,
          updatedBy: email,
          updatedAt: now,
        })
        .returning();
      await recordEvent(db, {
        projectId: policy.service.projectId,
        serviceId,
        actorEmail: email,
        action: "change.requested",
        targetType: "change",
        targetId: change.id,
        detail: `${riskLevel} risk change requested: ${title}.`,
        after: change,
        risk: riskLevel === "critical" || riskLevel === "high" ? "high" : "medium",
      });
      return json({ ok: true, change }, 201, requestId);
    }

    if (action === "decideChange") {
      const changeId = Number(payload.changeId);
      const [current] = await db
        .select()
        .from(reliabilityChanges)
        .where(eq(reliabilityChanges.id, changeId))
        .limit(1);
      if (!current) return json({ error: "Change request not found." }, 404, requestId);
      const policy = await servicePolicy(db, current.serviceId, email, membership.role);
      if (!policy?.canApprove) {
        return json({ error: "Only an owner or manager can decide this change." }, 403, requestId);
      }
      if (current.status !== "pending" || Number(payload.version) !== current.version) {
        return json({ error: "This change is no longer awaiting this decision." }, 409, requestId);
      }
      const decision = clean(payload.decision, 16);
      const reason = clean(payload.reason, 600);
      if (!changeDecisions.has(decision) || reason.length < 4) {
        return json({ error: "Choose a decision and record the reason." }, 400, requestId);
      }
      const now = new Date().toISOString();
      const [updated] = await db
        .update(reliabilityChanges)
        .set({
          status: decision,
          decisionReason: reason,
          decidedBy: email,
          decidedAt: now,
          version: current.version + 1,
          updatedBy: email,
          updatedAt: now,
        })
        .where(
          and(eq(reliabilityChanges.id, changeId), eq(reliabilityChanges.version, current.version)),
        )
        .returning();
      if (!updated) {
        return json({ error: "This change was decided by someone else. Refresh first." }, 409, requestId);
      }
      await recordEvent(db, {
        projectId: current.projectId,
        serviceId: current.serviceId,
        actorEmail: email,
        action: `change.${decision}`,
        targetType: "change",
        targetId: changeId,
        detail: `${current.title} was ${decision}. ${reason}`,
        before: current,
        after: updated,
        risk: decision === "rejected" ? "medium" : "low",
      });
      await notify(
        db,
        current.ownerEmail,
        email,
        current.projectId,
        "change",
        `Change ${decision}`,
        `${current.title}: ${reason}`,
      );
      return json({ ok: true, change: updated }, 200, requestId);
    }

    if (action === "createRunbook") {
      const serviceId = Number(payload.serviceId);
      const policy = await servicePolicy(db, serviceId, email, membership.role);
      if (!policy?.canEdit) {
        return json({ error: "Your project role cannot create recovery runbooks." }, 403, requestId);
      }
      const title = clean(payload.title, 160);
      const trigger = clean(payload.trigger, 1000);
      const ownerEmail = clean(payload.ownerEmail, 254).toLowerCase() || null;
      const nextReviewDate = optionalDate(payload.nextReviewDate);
      const steps = clean(payload.steps, 6000)
        .split(/\r?\n/)
        .map((step) => step.trim())
        .filter(Boolean)
        .slice(0, 30);
      if (!title || !trigger || steps.length < 2 || nextReviewDate === undefined) {
        return json({ error: "Add a trigger and at least two recovery steps." }, 400, requestId);
      }
      if (!(await validateOwner(db, policy.service.projectId, ownerEmail))) {
        return json({ error: "The runbook owner must have project access." }, 400, requestId);
      }
      const now = new Date().toISOString();
      const [runbook] = await db
        .insert(recoveryRunbooks)
        .values({
          serviceId,
          projectId: policy.service.projectId,
          title,
          trigger,
          ownerEmail,
          stepsJson: JSON.stringify(steps),
          nextReviewDate,
          createdBy: email,
          updatedBy: email,
          updatedAt: now,
        })
        .returning();
      await recordEvent(db, {
        projectId: policy.service.projectId,
        serviceId,
        actorEmail: email,
        action: "runbook.created",
        targetType: "runbook",
        targetId: runbook.id,
        detail: `Recovery runbook created: ${title}.`,
        after: runbook,
      });
      return json({ ok: true, runbook }, 201, requestId);
    }

    if (action === "recordRunbookTest") {
      const runbookId = Number(payload.runbookId);
      const [current] = await db
        .select()
        .from(recoveryRunbooks)
        .where(eq(recoveryRunbooks.id, runbookId))
        .limit(1);
      if (!current) return json({ error: "Runbook not found." }, 404, requestId);
      const policy = await servicePolicy(db, current.serviceId, email, membership.role);
      if (!policy?.canEdit) {
        return json({ error: "Your project role cannot record recovery drills." }, 403, requestId);
      }
      if (Number(payload.version) !== current.version) {
        return json({ error: "This runbook changed after you opened it. Refresh first." }, 409, requestId);
      }
      const reason = clean(payload.reason, 600);
      if (reason.length < 4) {
        return json({ error: "Record the drill outcome before confirming the test." }, 400, requestId);
      }
      const now = new Date().toISOString();
      const nextReviewDate = new Date(Date.now() + 90 * 86_400_000).toISOString().slice(0, 10);
      const [updated] = await db
        .update(recoveryRunbooks)
        .set({
          status: "ready",
          lastTestedAt: now,
          nextReviewDate,
          version: current.version + 1,
          updatedBy: email,
          updatedAt: now,
        })
        .where(and(eq(recoveryRunbooks.id, runbookId), eq(recoveryRunbooks.version, current.version)))
        .returning();
      if (!updated) {
        return json({ error: "This runbook was updated by someone else. Refresh first." }, 409, requestId);
      }
      await recordEvent(db, {
        projectId: current.projectId,
        serviceId: current.serviceId,
        actorEmail: email,
        action: "runbook.tested",
        targetType: "runbook",
        targetId: runbookId,
        detail: `${current.title} recovery drill passed. ${reason}`,
        before: current,
        after: updated,
      });
      return json({ ok: true, runbook: updated }, 200, requestId);
    }

    if (action === "updateServiceStatus") {
      const serviceId = Number(payload.serviceId);
      const policy = await servicePolicy(db, serviceId, email, membership.role);
      if (!policy?.canEdit) {
        return json({ error: "Your project role cannot change service state." }, 403, requestId);
      }
      const status = clean(payload.status, 20);
      const reason = clean(payload.reason, 500);
      if (!serviceStatuses.has(status) || reason.length < 4) {
        return json({ error: "Choose a valid status and record the reason." }, 400, requestId);
      }
      if (Number(payload.version) !== policy.service.version) {
        return json({ error: "This service changed after you opened it. Refresh first." }, 409, requestId);
      }
      const now = new Date().toISOString();
      const [updated] = await db
        .update(operationalServices)
        .set({
          status,
          version: policy.service.version + 1,
          updatedBy: email,
          updatedAt: now,
        })
        .where(
          and(eq(operationalServices.id, serviceId), eq(operationalServices.version, policy.service.version)),
        )
        .returning();
      if (!updated) {
        return json({ error: "Another operator updated this service. Refresh first." }, 409, requestId);
      }
      await recordEvent(db, {
        projectId: policy.service.projectId,
        serviceId,
        actorEmail: email,
        action: "service.status_updated",
        targetType: "service",
        targetId: serviceId,
        detail: `${policy.service.name} moved to ${status}. ${reason}`,
        before: policy.service,
        after: updated,
        risk: status === "outage" ? "high" : status === "degraded" ? "medium" : "low",
      });
      return json({ ok: true, service: updated }, 200, requestId);
    }

    return json({ error: "Unknown reliability command." }, 400, requestId);
  } catch (error) {
    console.error("reliability.POST", requestId, error);
    return json({ error: "The reliability command failed.", requestId }, 500, requestId);
  }
}
