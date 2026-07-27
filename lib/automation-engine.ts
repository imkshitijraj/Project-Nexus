import {
  and,
  asc,
  eq,
  gte,
  isNotNull,
  isNull,
  lte,
  ne,
  or,
} from "drizzle-orm";
import type { getDb } from "../db";
import {
  approvalRequests,
  automationRules,
  automationRuns,
  projects,
  tasks,
  workspaceMembers,
  workspaceNotifications,
} from "../db/schema";

type Db = Awaited<ReturnType<typeof getDb>>;
type AutomationRule = typeof automationRules.$inferSelect;

const DAY = 86_400_000;

function parseConfig(value: string) {
  try {
    return JSON.parse(value) as Record<string, unknown>;
  } catch {
    return {};
  }
}

function nextRun(cadence: string) {
  const delay =
    cadence === "hourly"
      ? 3_600_000
      : cadence === "weekly"
        ? 7 * DAY
        : cadence === "monthly"
          ? 30 * DAY
          : DAY;
  return new Date(Date.now() + delay).toISOString();
}

async function notifyAdministrators(
  db: Db,
  type: string,
  title: string,
  body: string,
  projectId: number | null = null,
) {
  const administrators = await db
    .select({ email: workspaceMembers.email })
    .from(workspaceMembers)
    .where(
      and(
        eq(workspaceMembers.role, "administrator"),
        eq(workspaceMembers.status, "active"),
      ),
    );
  if (!administrators.length) return;
  await db.insert(workspaceNotifications).values(
    administrators.map(({ email }) => ({
      recipientEmail: email,
      projectId,
      type,
      title,
      body,
    })),
  );
}

export async function executeAutomation(
  db: Db,
  rule: AutomationRule,
  requestId = crypto.randomUUID(),
) {
  const config = parseConfig(rule.configJson);
  let matchedCount = 0;
  let detail = "No matching records.";

  try {
    if (rule.actionType === "deadline_reminder") {
      const leadDays = Math.min(30, Math.max(0, Number(config.leadDays) || 2));
      const today = new Date().toISOString().slice(0, 10);
      const until = new Date(Date.now() + leadDays * DAY)
        .toISOString()
        .slice(0, 10);
      const dueTasks = await db
        .select({
          id: tasks.id,
          projectId: tasks.projectId,
          title: tasks.title,
          dueDate: tasks.dueDate,
          assigneeEmail: tasks.assigneeEmail,
          projectName: projects.name,
        })
        .from(tasks)
        .innerJoin(projects, eq(tasks.projectId, projects.id))
        .where(
          and(
            ne(tasks.status, "done"),
            isNotNull(tasks.dueDate),
            gte(tasks.dueDate, today),
            lte(tasks.dueDate, until),
          ),
        )
        .orderBy(asc(tasks.dueDate))
        .limit(100);
      for (const task of dueTasks) {
        if (!task.assigneeEmail) continue;
        await db.insert(workspaceNotifications).values({
          recipientEmail: task.assigneeEmail,
          projectId: task.projectId,
          taskId: task.id,
          type: "deadline",
          title: "Deadline approaching",
          body: `${task.projectName}: ${task.title} is due ${task.dueDate}.`,
        });
      }
      matchedCount = dueTasks.filter((task) => task.assigneeEmail).length;
      detail = `Routed ${matchedCount} deadline reminder${matchedCount === 1 ? "" : "s"}.`;
    } else if (rule.actionType === "approval_escalation") {
      const pending = await db
        .select({
          id: approvalRequests.id,
          title: approvalRequests.title,
          projectId: approvalRequests.projectId,
          createdAt: approvalRequests.createdAt,
        })
        .from(approvalRequests)
        .where(eq(approvalRequests.status, "pending"))
        .orderBy(asc(approvalRequests.createdAt))
        .limit(100);
      const thresholdHours = Math.max(
        1,
        Math.min(720, Number(config.thresholdHours) || 24),
      );
      const threshold = Date.now() - thresholdHours * 3_600_000;
      const escalated = pending.filter(
        (item) => new Date(item.createdAt).getTime() <= threshold,
      );
      for (const item of escalated) {
        await notifyAdministrators(
          db,
          "approval_escalation",
          "Approval SLA breached",
          `${item.title} has waited longer than ${thresholdHours} hours.`,
          item.projectId,
        );
      }
      matchedCount = escalated.length;
      detail = `Escalated ${matchedCount} approval${matchedCount === 1 ? "" : "s"} outside SLA.`;
    } else if (rule.actionType === "risk_alert") {
      const budgetThreshold = Math.max(
        1,
        Math.min(100, Number(config.budgetThreshold) || 80),
      );
      const exposed = await db
        .select({
          id: projects.id,
          name: projects.name,
          health: projects.health,
          budget: projects.budget,
        })
        .from(projects)
        .where(
          or(
            ne(projects.health, "On track"),
            gte(projects.budget, budgetThreshold),
          ),
        )
        .limit(100);
      for (const project of exposed) {
        await notifyAdministrators(
          db,
          "risk_alert",
          "Portfolio risk threshold crossed",
          `${project.name}: ${project.health}, ${project.budget}% budget utilized.`,
          project.id,
        );
      }
      matchedCount = exposed.length;
      detail = `Raised ${matchedCount} portfolio risk alert${matchedCount === 1 ? "" : "s"}.`;
    } else if (rule.actionType === "status_update") {
      const projectRows = await db
        .select({ id: projects.id, name: projects.name, health: projects.health })
        .from(projects)
        .limit(200);
      const today = new Date().toISOString().slice(0, 10);
      for (const project of projectRows) {
        const openTasks = await db
          .select({
            status: tasks.status,
            dueDate: tasks.dueDate,
          })
          .from(tasks)
          .where(
            and(
              eq(tasks.projectId, project.id),
              ne(tasks.status, "done"),
            ),
          );
        const overdue = openTasks.filter(
          (task) => task.dueDate && task.dueDate < today,
        ).length;
        const nextHealth =
          overdue >= 2 ? "Delayed" : overdue === 1 ? "At risk" : "On track";
        if (nextHealth === project.health) continue;
        await db
          .update(projects)
          .set({ health: nextHealth })
          .where(eq(projects.id, project.id));
        matchedCount += 1;
      }
      detail = `Recalculated health for ${matchedCount} project${matchedCount === 1 ? "" : "s"}.`;
    } else if (rule.actionType === "recurring_task") {
      const projectId = Number(config.projectId);
      const title =
        typeof config.title === "string" ? config.title.trim().slice(0, 160) : "";
      if (!Number.isInteger(projectId) || !title) {
        throw new Error("Recurring task rules require a project and task title.");
      }
      const [project] = await db
        .select({ id: projects.id, name: projects.name, createdBy: projects.createdBy })
        .from(projects)
        .where(eq(projects.id, projectId))
        .limit(1);
      if (!project) throw new Error("The recurring task project no longer exists.");
      await db.insert(tasks).values({
        projectId,
        title,
        description:
          typeof config.description === "string"
            ? config.description.slice(0, 4000)
            : "Created by Nexus Automation.",
        priority:
          typeof config.priority === "string" ? config.priority : "medium",
        assigneeEmail:
          typeof config.assigneeEmail === "string"
            ? config.assigneeEmail.toLowerCase()
            : null,
        dueDate: new Date(Date.now() + (Number(config.dueInDays) || 7) * DAY)
          .toISOString()
          .slice(0, 10),
        createdBy: project.createdBy,
        updatedAt: new Date().toISOString(),
      });
      matchedCount = 1;
      detail = `Created recurring task “${title}” in ${project.name}.`;
    } else {
      throw new Error("Unsupported automation action.");
    }

    const now = new Date().toISOString();
    await db.batch([
      db.insert(automationRuns).values({
        ruleId: rule.id,
        status: "succeeded",
        matchedCount,
        detail,
        requestId,
      }),
      db
        .update(automationRules)
        .set({
          lastRunAt: now,
          nextRunAt: nextRun(rule.cadence),
        })
        .where(eq(automationRules.id, rule.id)),
    ]);
    return { status: "succeeded", matchedCount, detail, requestId };
  } catch (error) {
    const failure =
      error instanceof Error ? error.message.slice(0, 500) : "Automation failed.";
    await db.batch([
      db.insert(automationRuns).values({
        ruleId: rule.id,
        status: "failed",
        matchedCount,
        detail: failure,
        requestId,
      }),
      db
        .update(automationRules)
        .set({
          lastRunAt: new Date().toISOString(),
          nextRunAt: nextRun(rule.cadence),
        })
        .where(eq(automationRules.id, rule.id)),
    ]);
    return { status: "failed", matchedCount, detail: failure, requestId };
  }
}

export async function evaluateDueAutomations(db: Db) {
  const now = new Date().toISOString();
  const rules = await db
    .select()
    .from(automationRules)
    .where(
      and(
        eq(automationRules.status, "active"),
        or(
          isNull(automationRules.nextRunAt),
          lte(automationRules.nextRunAt, now),
        ),
      ),
    )
    .orderBy(asc(automationRules.nextRunAt))
    .limit(20);
  for (const rule of rules) await executeAutomation(db, rule);
  return rules.length;
}
