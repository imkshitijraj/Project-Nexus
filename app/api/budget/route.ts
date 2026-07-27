import { and, desc, eq, inArray } from "drizzle-orm";
import { getWorkspaceUser } from "../../session-auth";
import { getDb } from "../../../db";
import {
  accessAuditEvents,
  budgetChangeLog,
  projectBudgets,
  projectMembers,
  projects,
  workspaceMembers,
} from "../../../db/schema";

type BudgetSnapshot = {
  allocatedAmount: number;
  spentAmount: number;
  committedAmount: number;
  forecastAmount: number;
  notes: string;
};

function json(body: unknown, status = 200, requestId = crypto.randomUUID()) {
  return Response.json(body, {
    status,
    headers: { "x-request-id": requestId },
  });
}

function amount(value: unknown) {
  const parsed = Number(value);
  return Number.isInteger(parsed) && parsed >= 0 && parsed <= 100_000_000_000
    ? parsed
    : null;
}

function clean(value: unknown, max = 500) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
}

function fallbackBudget(project: typeof projects.$inferSelect): BudgetSnapshot {
  const allocatedAmount = 840_000;
  const spentAmount = Math.round((allocatedAmount * project.budget) / 100);
  return {
    allocatedAmount,
    spentAmount,
    committedAmount: 0,
    forecastAmount: Math.max(spentAmount, allocatedAmount),
    notes: "",
  };
}

async function resolveAccess() {
  const user = await getWorkspaceUser();
  if (!user) return { error: "Sign in to continue.", status: 401 as const };
  const email = user.email.toLowerCase();
  const db = await getDb();
  const [membership] = await db
    .select()
    .from(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.email, email),
        eq(workspaceMembers.status, "active"),
      ),
    )
    .limit(1);
  if (!membership) {
    return { error: "Active workspace membership is required.", status: 403 as const };
  }
  return { db, email, membership };
}

async function accessibleProjects(
  db: Awaited<ReturnType<typeof getDb>>,
  email: string,
  role: string,
) {
  const allProjects = await db
    .select()
    .from(projects)
    .orderBy(desc(projects.createdAt), desc(projects.id))
    .limit(200);
  if (role === "administrator") return allProjects;
  const assignments = await db
    .select({ projectId: projectMembers.projectId })
    .from(projectMembers)
    .where(eq(projectMembers.email, email));
  const ids = new Set(assignments.map((item) => item.projectId));
  return allProjects.filter(
    (project) => project.createdBy === email || ids.has(project.id),
  );
}

export async function GET() {
  const requestId = crypto.randomUUID();
  try {
    const resolved = await resolveAccess();
    if ("error" in resolved) return json({ error: resolved.error }, resolved.status, requestId);
    const { db, email, membership } = resolved;
    const allowedProjects = await accessibleProjects(db, email, membership.role);
    const ids = allowedProjects.map((project) => project.id);
    const [storedBudgets, logs] = ids.length
      ? await Promise.all([
          db
            .select()
            .from(projectBudgets)
            .where(inArray(projectBudgets.projectId, ids)),
          db
            .select({
              id: budgetChangeLog.id,
              projectId: budgetChangeLog.projectId,
              projectName: projects.name,
              actorEmail: budgetChangeLog.actorEmail,
              changeType: budgetChangeLog.changeType,
              beforeJson: budgetChangeLog.beforeJson,
              afterJson: budgetChangeLog.afterJson,
              reason: budgetChangeLog.reason,
              createdAt: budgetChangeLog.createdAt,
            })
            .from(budgetChangeLog)
            .innerJoin(projects, eq(budgetChangeLog.projectId, projects.id))
            .where(inArray(budgetChangeLog.projectId, ids))
            .orderBy(desc(budgetChangeLog.createdAt), desc(budgetChangeLog.id))
            .limit(100),
        ])
      : [[], []];
    const byProject = new Map(storedBudgets.map((item) => [item.projectId, item]));
    return json(
      {
        canManage: ["administrator", "manager"].includes(membership.role),
        budgets: allowedProjects.map((project) => {
          const stored = byProject.get(project.id);
          return {
            projectId: project.id,
            projectName: project.name,
            department: project.department,
            health: project.health,
            ...(stored ?? {
              id: null,
              ...fallbackBudget(project),
              version: 0,
              updatedBy: project.createdBy,
              updatedAt: project.createdAt,
            }),
          };
        }),
        logs: logs.map((log) => ({
          ...log,
          before: JSON.parse(log.beforeJson || "{}"),
          after: JSON.parse(log.afterJson || "{}"),
        })),
      },
      200,
      requestId,
    );
  } catch (error) {
    console.error("budget.GET", requestId, error);
    return json(
      { error: "Budget records are temporarily unavailable.", requestId },
      500,
      requestId,
    );
  }
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  try {
    const resolved = await resolveAccess();
    if ("error" in resolved) return json({ error: resolved.error }, resolved.status, requestId);
    const { db, email, membership } = resolved;
    if (!["administrator", "manager"].includes(membership.role)) {
      return json({ error: "Your role cannot edit project budgets." }, 403, requestId);
    }
    const payload = (await request.json()) as Record<string, unknown>;
    if (payload.action !== "updateBudget") {
      return json({ error: "Unknown budget command." }, 400, requestId);
    }
    const projectId = Number(payload.projectId);
    const allowedProjects = await accessibleProjects(db, email, membership.role);
    const project = allowedProjects.find((item) => item.id === projectId);
    if (!project) {
      return json({ error: "Project budget access denied." }, 403, requestId);
    }
    const allocatedAmount = amount(payload.allocatedAmount);
    const spentAmount = amount(payload.spentAmount);
    const committedAmount = amount(payload.committedAmount);
    const forecastAmount = amount(payload.forecastAmount);
    const reason = clean(payload.reason, 300);
    const notes = clean(payload.notes, 1000);
    if (
      allocatedAmount === null ||
      spentAmount === null ||
      committedAmount === null ||
      forecastAmount === null
    ) {
      return json({ error: "Budget values must be valid whole-rupee amounts." }, 400, requestId);
    }
    if (reason.length < 4) {
      return json({ error: "Add a short reason for this budget change." }, 400, requestId);
    }
    const [existing] = await db
      .select()
      .from(projectBudgets)
      .where(eq(projectBudgets.projectId, projectId))
      .limit(1);
    const expectedVersion = Number(payload.version ?? 0);
    if (existing && expectedVersion !== existing.version) {
      return json(
        { error: "This budget changed after you opened it. Refresh and review the latest values." },
        409,
        requestId,
      );
    }
    const before: BudgetSnapshot = existing
      ? {
          allocatedAmount: existing.allocatedAmount,
          spentAmount: existing.spentAmount,
          committedAmount: existing.committedAmount,
          forecastAmount: existing.forecastAmount,
          notes: existing.notes,
        }
      : fallbackBudget(project);
    const after: BudgetSnapshot = {
      allocatedAmount,
      spentAmount,
      committedAmount,
      forecastAmount,
      notes,
    };
    const nextVersion = (existing?.version ?? 0) + 1;
    const now = new Date().toISOString();
    await db
      .insert(projectBudgets)
      .values({
        projectId,
        ...after,
        version: nextVersion,
        updatedBy: email,
        updatedAt: now,
      })
      .onConflictDoUpdate({
        target: projectBudgets.projectId,
        set: {
          ...after,
          version: nextVersion,
          updatedBy: email,
          updatedAt: now,
        },
      });
    await db.insert(budgetChangeLog).values({
      projectId,
      actorEmail: email,
      changeType: existing ? "budget.update" : "budget.baseline",
      beforeJson: JSON.stringify(before),
      afterJson: JSON.stringify(after),
      reason,
    });
    await db.insert(accessAuditEvents).values({
      actorEmail: email,
      action: existing ? "budget.update" : "budget.baseline",
      target: project.name,
      detail: `Budget revision ${nextVersion} recorded with reason: ${reason}`,
      risk: forecastAmount > allocatedAmount ? "medium" : "low",
    });
    return json({ ok: true, version: nextVersion }, 200, requestId);
  } catch (error) {
    console.error("budget.POST", requestId, error);
    return json(
      { error: "The budget change could not be saved.", requestId },
      500,
      requestId,
    );
  }
}
