import { and, desc, eq, inArray, isNull, or, sql } from "drizzle-orm";
import { getChatGPTUser } from "../../chatgpt-auth";
import { getDb } from "../../../db";
import {
  accessAuditEvents,
  operationRateLimits,
  projectActivity,
  projectMembers,
  projects,
  taskComments,
  tasks,
  workspaceMembers,
  workspaceNotifications,
} from "../../../db/schema";

type Db = Awaited<ReturnType<typeof getDb>>;

const taskStatuses = ["todo", "in_progress", "review", "done"] as const;
const taskPriorities = ["low", "medium", "high", "urgent"] as const;
const editableProjectRoles = new Set(["owner", "manager", "contributor"]);

function json(data: unknown, status = 200, requestId = crypto.randomUUID()) {
  return Response.json(data, {
    status,
    headers: {
      "cache-control": "no-store",
      "x-request-id": requestId,
    },
  });
}

function text(value: unknown, max: number) {
  return typeof value === "string" ? value.trim().slice(0, max) : "";
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

async function accessibleProjects(
  db: Db,
  email: string,
  workspaceRole: string,
) {
  if (workspaceRole === "administrator") {
    return db.select({ id: projects.id, name: projects.name }).from(projects);
  }
  return db
    .selectDistinct({ id: projects.id, name: projects.name })
    .from(projects)
    .leftJoin(
      projectMembers,
      and(
        eq(projectMembers.projectId, projects.id),
        eq(projectMembers.email, email),
      ),
    )
    .where(or(eq(projects.createdBy, email), eq(projectMembers.email, email)));
}

async function projectPolicy(
  db: Db,
  projectId: number,
  email: string,
  workspaceRole: string,
) {
  const [project] = await db
    .select({ id: projects.id, name: projects.name, createdBy: projects.createdBy })
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
    .where(
      and(
        eq(projectMembers.projectId, projectId),
        eq(projectMembers.email, email),
      ),
    )
    .limit(1);
  if (!assignment) return null;
  return {
    project,
    role: assignment.role,
    canEdit: editableProjectRoles.has(assignment.role),
  };
}

async function consumeWriteQuota(db: Db, email: string) {
  const bucket = Math.floor(Date.now() / 60000);
  const key = `${email}:${bucket}`;
  const [current] = await db
    .select({ count: operationRateLimits.count })
    .from(operationRateLimits)
    .where(eq(operationRateLimits.key, key))
    .limit(1);
  if (current && current.count >= 60) return false;
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

async function recordActivity(
  db: Db,
  projectId: number,
  actorEmail: string,
  action: string,
  entityType: string,
  entityId: number | null,
  detail: string,
) {
  await db.batch([
    db
      .insert(projectActivity)
      .values({ projectId, actorEmail, action, entityType, entityId, detail }),
    db
      .insert(accessAuditEvents)
      .values({
        actorEmail,
        action: `operations.${action}`,
        target: `${entityType}:${entityId ?? projectId}`,
        detail,
        risk: action === "task.delete" ? "medium" : "low",
      }),
  ]);
}

async function createNotification(
  db: Db,
  recipientEmail: string,
  projectId: number,
  taskId: number | null,
  type: string,
  title: string,
  body: string,
) {
  await db.insert(workspaceNotifications).values({
    recipientEmail,
    projectId,
    taskId,
    type,
    title,
    body,
  });
}

export async function GET() {
  const requestId = crypto.randomUUID();
  try {
    const resolved = await resolveContext();
    if ("error" in resolved) return json({ error: resolved.error }, resolved.status, requestId);
    const { db, email, membership } = resolved;
    const availableProjects = await accessibleProjects(db, email, membership.role);
    const projectIds = availableProjects.map((project) => project.id);

    if (projectIds.length === 0) {
      const notifications = await db
        .select()
        .from(workspaceNotifications)
        .where(eq(workspaceNotifications.recipientEmail, email))
        .orderBy(desc(workspaceNotifications.createdAt))
        .limit(50);
      return json({
        tasks: [],
        comments: [],
        activity: [],
        notifications,
        members: [],
        projects: [],
        metrics: { open: 0, overdue: 0, blocked: 0, unread: notifications.filter((item) => !item.readAt).length },
      }, 200, requestId);
    }

    const [taskRows, commentRows, activityRows, notifications, members] =
      await Promise.all([
        db
          .select({
            id: tasks.id,
            projectId: tasks.projectId,
            projectName: projects.name,
            title: tasks.title,
            description: tasks.description,
            status: tasks.status,
            priority: tasks.priority,
            assigneeEmail: tasks.assigneeEmail,
            dueDate: tasks.dueDate,
            parentTaskId: tasks.parentTaskId,
            dependsOnTaskId: tasks.dependsOnTaskId,
            createdBy: tasks.createdBy,
            createdAt: tasks.createdAt,
            updatedAt: tasks.updatedAt,
          })
          .from(tasks)
          .innerJoin(projects, eq(tasks.projectId, projects.id))
          .where(inArray(tasks.projectId, projectIds))
          .orderBy(desc(tasks.updatedAt), desc(tasks.id))
          .limit(300),
        db
          .select({
            id: taskComments.id,
            taskId: taskComments.taskId,
            body: taskComments.body,
            mentions: taskComments.mentions,
            authorEmail: taskComments.authorEmail,
            createdAt: taskComments.createdAt,
          })
          .from(taskComments)
          .innerJoin(tasks, eq(taskComments.taskId, tasks.id))
          .where(inArray(tasks.projectId, projectIds))
          .orderBy(taskComments.createdAt)
          .limit(600),
        db
          .select({
            id: projectActivity.id,
            projectId: projectActivity.projectId,
            projectName: projects.name,
            actorEmail: projectActivity.actorEmail,
            action: projectActivity.action,
            entityType: projectActivity.entityType,
            entityId: projectActivity.entityId,
            detail: projectActivity.detail,
            createdAt: projectActivity.createdAt,
          })
          .from(projectActivity)
          .innerJoin(projects, eq(projectActivity.projectId, projects.id))
          .where(inArray(projectActivity.projectId, projectIds))
          .orderBy(desc(projectActivity.createdAt))
          .limit(80),
        db
          .select()
          .from(workspaceNotifications)
          .where(eq(workspaceNotifications.recipientEmail, email))
          .orderBy(desc(workspaceNotifications.createdAt))
          .limit(50),
        db
          .select({
            email: workspaceMembers.email,
            displayName: workspaceMembers.displayName,
            role: workspaceMembers.role,
          })
          .from(workspaceMembers)
          .where(eq(workspaceMembers.status, "active"))
          .orderBy(workspaceMembers.displayName),
      ]);

    const now = new Date().toISOString().slice(0, 10);
    return json({
      tasks: taskRows,
      comments: commentRows.map((comment) => ({
        ...comment,
        mentions: JSON.parse(comment.mentions || "[]"),
      })),
      activity: activityRows,
      notifications,
      members,
      projects: availableProjects,
      metrics: {
        open: taskRows.filter((task) => task.status !== "done").length,
        overdue: taskRows.filter(
          (task) => task.status !== "done" && task.dueDate && task.dueDate < now,
        ).length,
        blocked: taskRows.filter((task) => task.dependsOnTaskId && task.status !== "done").length,
        unread: notifications.filter((item) => !item.readAt).length,
      },
    }, 200, requestId);
  } catch (error) {
    console.error("operations.GET", requestId, error);
    return json({ error: "Collaborative operations are temporarily unavailable.", requestId }, 500, requestId);
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
    const action = text(payload.action, 50);

    if (action === "createTask") {
      const projectId = Number(payload.projectId);
      const policy = Number.isInteger(projectId)
        ? await projectPolicy(db, projectId, email, membership.role)
        : null;
      if (!policy) return json({ error: "Project access denied." }, 403, requestId);
      if (!policy.canEdit) return json({ error: "Your project role is read-only." }, 403, requestId);
      const title = text(payload.title, 160);
      if (!title) return json({ error: "Task title is required." }, 400, requestId);
      const priority = taskPriorities.includes(payload.priority as typeof taskPriorities[number])
        ? (payload.priority as typeof taskPriorities[number])
        : "medium";
      const assigneeEmail = text(payload.assigneeEmail, 200).toLowerCase() || null;
      if (assigneeEmail) {
        const [assignee] = await db
          .select({ email: workspaceMembers.email, role: workspaceMembers.role })
          .from(workspaceMembers)
          .where(
            and(
              eq(workspaceMembers.email, assigneeEmail),
              eq(workspaceMembers.status, "active"),
            ),
          )
          .limit(1);
        const assigneePolicy = assignee
          ? await projectPolicy(db, projectId, assigneeEmail, assignee.role)
          : null;
        if (!assignee || !assigneePolicy) {
          return json({ error: "The assignee needs active access to this project." }, 400, requestId);
        }
      }
      const [task] = await db
        .insert(tasks)
        .values({
          projectId,
          title,
          description: text(payload.description, 4000),
          priority,
          assigneeEmail,
          dueDate: text(payload.dueDate, 10) || null,
          parentTaskId: Number(payload.parentTaskId) || null,
          dependsOnTaskId: Number(payload.dependsOnTaskId) || null,
          createdBy: email,
          updatedAt: new Date().toISOString(),
        })
        .returning();
      await recordActivity(
        db,
        projectId,
        email,
        "task.created",
        "task",
        task.id,
        `Created “${task.title}”.`,
      );
      if (assigneeEmail && assigneeEmail !== email) {
        await createNotification(
          db,
          assigneeEmail,
          projectId,
          task.id,
          "assignment",
          "New task assigned",
          `${policy.project.name}: ${task.title}`,
        );
      }
      return json({ ok: true, task }, 201, requestId);
    }

    if (action === "updateTask") {
      const taskId = Number(payload.taskId);
      const [current] = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);
      if (!current) return json({ error: "Task not found." }, 404, requestId);
      const policy = await projectPolicy(db, current.projectId, email, membership.role);
      if (!policy) return json({ error: "Project access denied." }, 403, requestId);
      if (!policy.canEdit) return json({ error: "Your project role is read-only." }, 403, requestId);

      const status = taskStatuses.includes(payload.status as typeof taskStatuses[number])
        ? (payload.status as typeof taskStatuses[number])
        : current.status;
      if (status !== "todo" && current.dependsOnTaskId) {
        const [dependency] = await db
          .select({ status: tasks.status })
          .from(tasks)
          .where(eq(tasks.id, current.dependsOnTaskId))
          .limit(1);
        if (dependency && dependency.status !== "done") {
          return json({ error: "Complete the dependency before advancing this task." }, 409, requestId);
        }
      }
      const nextAssignee = Object.hasOwn(payload, "assigneeEmail")
        ? text(payload.assigneeEmail, 200).toLowerCase() || null
        : current.assigneeEmail;
      await db
        .update(tasks)
        .set({
          status,
          priority: taskPriorities.includes(payload.priority as typeof taskPriorities[number])
            ? (payload.priority as typeof taskPriorities[number])
            : current.priority,
          assigneeEmail: nextAssignee,
          dueDate: Object.hasOwn(payload, "dueDate")
            ? text(payload.dueDate, 10) || null
            : current.dueDate,
          title: text(payload.title, 160) || current.title,
          description: Object.hasOwn(payload, "description")
            ? text(payload.description, 4000)
            : current.description,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(tasks.id, taskId));
      await recordActivity(
        db,
        current.projectId,
        email,
        "task.updated",
        "task",
        taskId,
        `Moved “${current.title}” to ${status.replace("_", " ")}.`,
      );
      if (nextAssignee && nextAssignee !== email && nextAssignee !== current.assigneeEmail) {
        await createNotification(
          db,
          nextAssignee,
          current.projectId,
          taskId,
          "assignment",
          "Task reassigned to you",
          `${policy.project.name}: ${current.title}`,
        );
      }
      return json({ ok: true }, 200, requestId);
    }

    if (action === "addComment") {
      const taskId = Number(payload.taskId);
      const body = text(payload.body, 2000);
      if (!body) return json({ error: "Comment cannot be empty." }, 400, requestId);
      const [task] = await db.select().from(tasks).where(eq(tasks.id, taskId)).limit(1);
      if (!task) return json({ error: "Task not found." }, 404, requestId);
      const policy = await projectPolicy(db, task.projectId, email, membership.role);
      if (!policy) return json({ error: "Project access denied." }, 403, requestId);
      if (!policy.canEdit) return json({ error: "Your project role cannot comment." }, 403, requestId);

      const mentions = Array.from(
        new Set(
          [...body.matchAll(/@([a-z0-9._%+-]+@[a-z0-9.-]+\.[a-z]{2,})/gi)].map(
            (match) => match[1].toLowerCase(),
          ),
        ),
      ).slice(0, 10);
      const [comment] = await db
        .insert(taskComments)
        .values({
          taskId,
          body,
          mentions: JSON.stringify(mentions),
          authorEmail: email,
        })
        .returning();
      await recordActivity(
        db,
        task.projectId,
        email,
        "comment.added",
        "task",
        taskId,
        `Commented on “${task.title}”.`,
      );
      const recipients = new Set(mentions);
      if (task.assigneeEmail && task.assigneeEmail !== email) recipients.add(task.assigneeEmail);
      for (const recipient of recipients) {
        if (recipient === email) continue;
        const [recipientMember] = await db
          .select({ role: workspaceMembers.role })
          .from(workspaceMembers)
          .where(
            and(
              eq(workspaceMembers.email, recipient),
              eq(workspaceMembers.status, "active"),
            ),
          )
          .limit(1);
        const recipientPolicy = recipientMember
          ? await projectPolicy(db, task.projectId, recipient, recipientMember.role)
          : null;
        if (!recipientPolicy) continue;
        await createNotification(
          db,
          recipient,
          task.projectId,
          taskId,
          mentions.includes(recipient) ? "mention" : "comment",
          mentions.includes(recipient) ? "You were mentioned" : "New task comment",
          `${policy.project.name}: ${task.title}`,
        );
      }
      return json({ ok: true, comment: { ...comment, mentions } }, 201, requestId);
    }

    if (action === "markNotificationRead") {
      const notificationId = Number(payload.notificationId);
      await db
        .update(workspaceNotifications)
        .set({ readAt: new Date().toISOString() })
        .where(
          and(
            eq(workspaceNotifications.id, notificationId),
            eq(workspaceNotifications.recipientEmail, email),
          ),
        );
      return json({ ok: true }, 200, requestId);
    }

    if (action === "markAllNotificationsRead") {
      await db
        .update(workspaceNotifications)
        .set({ readAt: new Date().toISOString() })
        .where(
          and(
            eq(workspaceNotifications.recipientEmail, email),
            isNull(workspaceNotifications.readAt),
          ),
        );
      return json({ ok: true }, 200, requestId);
    }

    return json({ error: "Unknown operations command." }, 400, requestId);
  } catch (error) {
    console.error("operations.POST", requestId, error);
    return json({ error: "The collaborative command failed.", requestId }, 500, requestId);
  }
}
