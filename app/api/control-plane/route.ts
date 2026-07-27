import { and, desc, eq, sql } from "drizzle-orm";
import { getWorkspaceUser } from "../../session-auth";
import { getDb } from "../../../db";
import {
  accessAuditEvents,
  approvalRequests,
  automationRules,
  automationRuns,
  integrationConnections,
  projects,
  tasks,
  workspaceApiKeys,
  workspaceCustomRoles,
  workspaceMembers,
  workspacePolicies,
} from "../../../db/schema";
import {
  evaluateDueAutomations,
  executeAutomation,
} from "../../../lib/automation-engine";

const providers = [
  "google_calendar",
  "gmail",
  "slack",
  "github",
  "google_drive",
  "webhooks",
  "gitlab",
  "discord",
  "teams",
  "zoom",
  "google_meet",
  "rest_api",
] as const;
const automationActions = [
  "deadline_reminder",
  "approval_escalation",
  "recurring_task",
  "risk_alert",
  "status_update",
] as const;
const cadences = ["hourly", "daily", "weekly", "monthly"] as const;
const allowedPermissions = [
  "projects.view",
  "projects.create",
  "projects.update",
  "projects.assign",
  "tasks.manage",
  "approvals.request",
  "approvals.decide",
  "budget.manage",
  "reports.view",
  "reports.export",
  "automation.manage",
  "integrations.manage",
  "security.manage",
] as const;

function json(data: unknown, status = 200, requestId = crypto.randomUUID()) {
  return Response.json(data, {
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

function safeParse<T>(value: string, fallback: T): T {
  try {
    return JSON.parse(value) as T;
  } catch {
    return fallback;
  }
}

async function resolveAdministrator() {
  const user = await getWorkspaceUser();
  if (!user) return { error: "Sign in to continue.", status: 401 as const };
  const db = await getDb();
  const email = user.email.toLowerCase();
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
  if (!["administrator", "manager"].includes(membership.role)) {
    return {
      error: "Enterprise controls require administrator or manager access.",
      status: 403 as const,
    };
  }
  return { db, email, membership };
}

async function audit(
  db: Awaited<ReturnType<typeof getDb>>,
  actorEmail: string,
  action: string,
  target: string,
  detail: string,
  risk = "medium",
) {
  await db.insert(accessAuditEvents).values({
    actorEmail,
    action,
    target,
    detail,
    risk,
  });
}

async function seedControlPlane(
  db: Awaited<ReturnType<typeof getDb>>,
  email: string,
) {
  const [{ rules }] = await db
    .select({ rules: sql<number>`count(*)` })
    .from(automationRules);
  if (Number(rules) === 0) {
    const tomorrow = new Date(Date.now() + 86_400_000).toISOString();
    await db.insert(automationRules).values([
      {
        name: "Deadline safety net",
        triggerType: "schedule",
        actionType: "deadline_reminder",
        cadence: "daily",
        configJson: JSON.stringify({ leadDays: 2 }),
        status: "active",
        nextRunAt: tomorrow,
        createdBy: email,
      },
      {
        name: "Approval SLA escalation",
        triggerType: "schedule",
        actionType: "approval_escalation",
        cadence: "hourly",
        configJson: JSON.stringify({ thresholdHours: 24 }),
        status: "disabled",
        createdBy: email,
      },
      {
        name: "Portfolio risk sentinel",
        triggerType: "threshold",
        actionType: "risk_alert",
        cadence: "daily",
        configJson: JSON.stringify({ budgetThreshold: 80 }),
        status: "disabled",
        createdBy: email,
      },
      {
        name: "Automatic health update",
        triggerType: "schedule",
        actionType: "status_update",
        cadence: "daily",
        configJson: "{}",
        status: "disabled",
        createdBy: email,
      },
    ]);
  }

  for (const provider of providers) {
    await db.insert(integrationConnections).values(
      {
        provider,
        status: "not_connected",
        updatedBy: email,
      },
    ).onConflictDoNothing();
  }

  const defaults = [
    ["session_timeout_minutes", 480],
    ["data_retention_days", 365],
    ["approval_mfa_required", true],
    ["external_sharing_allowed", false],
    ["api_ip_allowlist", false],
    ["sso_mode", "disabled"],
  ] as const;
  for (const [key, value] of defaults) {
    await db
      .insert(workspacePolicies)
      .values({ key, valueJson: JSON.stringify(value), updatedBy: email })
      .onConflictDoNothing();
  }
}

async function analytics(db: Awaited<ReturnType<typeof getDb>>) {
  const [taskRows, projectRows, memberRows, pendingApprovals] = await Promise.all([
    db.select().from(tasks).limit(1000),
    db.select().from(projects).limit(300),
    db
      .select({
        email: workspaceMembers.email,
        displayName: workspaceMembers.displayName,
        role: workspaceMembers.role,
        status: workspaceMembers.status,
      })
      .from(workspaceMembers),
    db
      .select({ id: approvalRequests.id })
      .from(approvalRequests)
      .where(eq(approvalRequests.status, "pending")),
  ]);
  const today = new Date().toISOString().slice(0, 10);
  const open = taskRows.filter((task) => task.status !== "done");
  const overdue = open.filter((task) => task.dueDate && task.dueDate < today);
  const done = taskRows.filter((task) => task.status === "done");
  const utilization = memberRows
    .filter((member) => member.status === "active")
    .map((member) => {
      const assigned = open.filter((task) => task.assigneeEmail === member.email);
      const urgent = assigned.filter(
        (task) => task.priority === "urgent" || task.priority === "high",
      ).length;
      const forecastHours = assigned.length * 6 + urgent * 2;
      return {
        ...member,
        assigned: assigned.length,
        forecastHours,
        utilization: Math.min(125, Math.round((forecastHours / 40) * 100)),
      };
    })
    .sort((a, b) => b.utilization - a.utilization);
  const averageProgress = projectRows.length
    ? Math.round(
        projectRows.reduce((total, project) => total + project.progress, 0) /
          projectRows.length,
      )
    : 0;
  const averageBudget = projectRows.length
    ? Math.round(
        projectRows.reduce((total, project) => total + project.budget, 0) /
          projectRows.length,
      )
    : 0;
  return {
    metrics: {
      activeProjects: projectRows.length,
      completionRate: taskRows.length
        ? Math.round((done.length / taskRows.length) * 100)
        : 0,
      overdue: overdue.length,
      pendingApprovals: pendingApprovals.length,
      averageProgress,
      averageBudget,
      budgetVariance: Math.round((averageProgress - averageBudget) * 10) / 10,
      forecastConfidence: Math.max(
        35,
        Math.min(
          98,
          92 -
            overdue.length * 3 -
            projectRows.filter((project) => project.health !== "On track").length *
              2,
        ),
      ),
    },
    utilization,
    projects: projectRows.map((project) => ({
      id: project.id,
      name: project.name,
      progress: project.progress,
      budget: project.budget,
      health: project.health,
      variance: project.progress - project.budget,
    })),
  };
}

export async function GET() {
  const requestId = crypto.randomUUID();
  try {
    const resolved = await resolveAdministrator();
    if ("error" in resolved) return json({ error: resolved.error }, resolved.status, requestId);
    const { db, email, membership } = resolved;
    await seedControlPlane(db, email);
    await evaluateDueAutomations(db);
    const [
      rules,
      runs,
      connections,
      policies,
      roles,
      apiKeys,
      reportAnalytics,
    ] = await Promise.all([
      db.select().from(automationRules).orderBy(desc(automationRules.createdAt)),
      db
        .select({
          id: automationRuns.id,
          ruleId: automationRuns.ruleId,
          ruleName: automationRules.name,
          status: automationRuns.status,
          matchedCount: automationRuns.matchedCount,
          detail: automationRuns.detail,
          requestId: automationRuns.requestId,
          createdAt: automationRuns.createdAt,
        })
        .from(automationRuns)
        .innerJoin(automationRules, eq(automationRuns.ruleId, automationRules.id))
        .orderBy(desc(automationRuns.createdAt))
        .limit(30),
      db
        .select()
        .from(integrationConnections)
        .orderBy(integrationConnections.provider),
      db.select().from(workspacePolicies).orderBy(workspacePolicies.key),
      db
        .select()
        .from(workspaceCustomRoles)
        .orderBy(desc(workspaceCustomRoles.createdAt)),
      db
        .select({
          id: workspaceApiKeys.id,
          name: workspaceApiKeys.name,
          prefix: workspaceApiKeys.prefix,
          scopesJson: workspaceApiKeys.scopesJson,
          status: workspaceApiKeys.status,
          lastUsedAt: workspaceApiKeys.lastUsedAt,
          expiresAt: workspaceApiKeys.expiresAt,
          createdBy: workspaceApiKeys.createdBy,
          createdAt: workspaceApiKeys.createdAt,
        })
        .from(workspaceApiKeys)
        .orderBy(desc(workspaceApiKeys.createdAt)),
      analytics(db),
    ]);
    return json(
      {
        role: membership.role,
        automations: rules.map((rule) => ({
          ...rule,
          config: safeParse(rule.configJson, {}),
        })),
        runs,
        integrations: connections.map((connection) => ({
          ...connection,
          scopes: safeParse<string[]>(connection.scopes, []),
          config: safeParse<Record<string, unknown>>(
            connection.configJson,
            {},
          ),
        })),
        policies: Object.fromEntries(
          policies.map((policy) => [
            policy.key,
            safeParse(policy.valueJson, null),
          ]),
        ),
        customRoles: roles.map((role) => ({
          ...role,
          permissions: safeParse<string[]>(role.permissionsJson, []),
        })),
        apiKeys: apiKeys.map((key) => ({
          ...key,
          scopes: safeParse<string[]>(key.scopesJson, []),
        })),
        analytics: reportAnalytics,
      },
      200,
      requestId,
    );
  } catch (error) {
    console.error("control-plane.GET", requestId, error);
    return json(
      { error: "The enterprise control plane is temporarily unavailable.", requestId },
      500,
      requestId,
    );
  }
}

export async function POST(request: Request) {
  const requestId = crypto.randomUUID();
  try {
    const resolved = await resolveAdministrator();
    if ("error" in resolved) return json({ error: resolved.error }, resolved.status, requestId);
    const { db, email, membership } = resolved;
    const payload = (await request.json()) as Record<string, unknown>;
    const action = clean(payload.action, 60);
    const isAdmin = membership.role === "administrator";

    if (action === "createAutomation") {
      const name = clean(payload.name, 120);
      const actionType = automationActions.includes(
        payload.actionType as (typeof automationActions)[number],
      )
        ? (payload.actionType as (typeof automationActions)[number])
        : null;
      const cadence = cadences.includes(payload.cadence as (typeof cadences)[number])
        ? (payload.cadence as (typeof cadences)[number])
        : "daily";
      if (!name || !actionType) {
        return json({ error: "Automation name and action are required." }, 400, requestId);
      }
      const config =
        payload.config && typeof payload.config === "object" ? payload.config : {};
      const [rule] = await db
        .insert(automationRules)
        .values({
          name,
          triggerType:
            actionType === "risk_alert" ? "threshold" : "schedule",
          actionType,
          cadence,
          configJson: JSON.stringify(config).slice(0, 4000),
          status: payload.enabled === true ? "active" : "disabled",
          nextRunAt:
            payload.enabled === true
              ? new Date(Date.now() + 3_600_000).toISOString()
              : null,
          createdBy: email,
        })
        .returning();
      await audit(
        db,
        email,
        "automation.create",
        `automation:${rule.id}`,
        `Created ${actionType} rule “${name}”.`,
      );
      return json({ ok: true, rule }, 201, requestId);
    }

    if (action === "toggleAutomation") {
      const id = Number(payload.id);
      const status = payload.enabled === true ? "active" : "disabled";
      await db
        .update(automationRules)
        .set({
          status,
          nextRunAt:
            status === "active"
              ? new Date(Date.now() + 3_600_000).toISOString()
              : null,
        })
        .where(eq(automationRules.id, id));
      await audit(
        db,
        email,
        "automation.toggle",
        `automation:${id}`,
        `Automation ${status}.`,
      );
      return json({ ok: true }, 200, requestId);
    }

    if (action === "runAutomation") {
      const id = Number(payload.id);
      const [rule] = await db
        .select()
        .from(automationRules)
        .where(eq(automationRules.id, id))
        .limit(1);
      if (!rule) return json({ error: "Automation rule not found." }, 404, requestId);
      const result = await executeAutomation(db, rule, requestId);
      await audit(
        db,
        email,
        "automation.run",
        `automation:${id}`,
        result.detail,
        result.status === "failed" ? "high" : "low",
      );
      return json({ ok: result.status === "succeeded", result }, result.status === "succeeded" ? 200 : 422, requestId);
    }

    if (action === "configureIntegration") {
      if (!isAdmin) {
        return json({ error: "Only administrators can configure integrations." }, 403, requestId);
      }
      const provider = providers.includes(payload.provider as (typeof providers)[number])
        ? (payload.provider as (typeof providers)[number])
        : null;
      if (!provider) return json({ error: "Unsupported integration." }, 400, requestId);
      const endpoint = clean(payload.endpoint, 500);
      if (provider === "webhooks") {
        let parsed: URL;
        try {
          parsed = new URL(endpoint);
        } catch {
          return json({ error: "Enter a valid HTTPS webhook endpoint." }, 400, requestId);
        }
        if (parsed.protocol !== "https:") {
          return json({ error: "Webhook endpoints must use HTTPS." }, 400, requestId);
        }
      }
      const status = provider === "webhooks" ? "active" : "pending_configuration";
      const scopes = Array.isArray(payload.scopes)
        ? payload.scopes.map((scope) => clean(scope, 80)).filter(Boolean).slice(0, 20)
        : [];
      await db
        .update(integrationConnections)
        .set({
          status,
          accountLabel:
            provider === "webhooks"
              ? new URL(endpoint).hostname
              : "Administrator approval required",
          scopes: JSON.stringify(scopes),
          configJson: JSON.stringify(
            provider === "webhooks" ? { endpoint } : { oauthRequired: true },
          ),
          updatedBy: email,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(integrationConnections.provider, provider));
      await audit(
        db,
        email,
        "integration.configure",
        provider,
        provider === "webhooks"
          ? "Registered a secured webhook endpoint."
          : "Started administrator-controlled OAuth setup.",
        "medium",
      );
      return json({ ok: true, status }, 200, requestId);
    }

    if (action === "disconnectIntegration") {
      if (!isAdmin) {
        return json({ error: "Only administrators can disconnect integrations." }, 403, requestId);
      }
      const provider = clean(payload.provider, 50);
      await db
        .update(integrationConnections)
        .set({
          status: "not_connected",
          accountLabel: "",
          scopes: "[]",
          configJson: "{}",
          updatedBy: email,
          updatedAt: new Date().toISOString(),
        })
        .where(eq(integrationConnections.provider, provider));
      await audit(
        db,
        email,
        "integration.disconnect",
        provider,
        "Integration access removed.",
        "high",
      );
      return json({ ok: true }, 200, requestId);
    }

    if (action === "savePolicy") {
      if (!isAdmin) {
        return json({ error: "Only administrators can change workspace policy." }, 403, requestId);
      }
      const key = clean(payload.key, 80);
      const allowedKeys = new Set([
        "session_timeout_minutes",
        "data_retention_days",
        "approval_mfa_required",
        "external_sharing_allowed",
        "api_ip_allowlist",
        "sso_mode",
      ]);
      if (!allowedKeys.has(key)) {
        return json({ error: "Unsupported workspace policy." }, 400, requestId);
      }
      await db
        .insert(workspacePolicies)
        .values({
          key,
          valueJson: JSON.stringify(payload.value).slice(0, 2000),
          updatedBy: email,
          updatedAt: new Date().toISOString(),
        })
        .onConflictDoUpdate({
          target: workspacePolicies.key,
          set: {
            valueJson: JSON.stringify(payload.value).slice(0, 2000),
            updatedBy: email,
            updatedAt: new Date().toISOString(),
          },
        });
      await audit(
        db,
        email,
        "policy.update",
        key,
        "Workspace policy updated.",
        "high",
      );
      return json({ ok: true }, 200, requestId);
    }

    if (action === "createRole") {
      if (!isAdmin) {
        return json({ error: "Only administrators can create custom roles." }, 403, requestId);
      }
      const name = clean(payload.name, 80);
      const description = clean(payload.description, 500);
      const permissions = Array.isArray(payload.permissions)
        ? payload.permissions.filter((permission): permission is string =>
            allowedPermissions.includes(
              permission as (typeof allowedPermissions)[number],
            ),
          )
        : [];
      if (!name || permissions.length === 0) {
        return json({ error: "Role name and at least one permission are required." }, 400, requestId);
      }
      const [role] = await db
        .insert(workspaceCustomRoles)
        .values({
          name,
          description,
          permissionsJson: JSON.stringify(Array.from(new Set(permissions))),
          createdBy: email,
        })
        .returning();
      await audit(
        db,
        email,
        "role.create",
        `custom-role:${role.id}`,
        `Created custom role “${name}”.`,
        "high",
      );
      return json({ ok: true, role }, 201, requestId);
    }

    if (action === "createApiKey") {
      if (!isAdmin) {
        return json({ error: "Only administrators can issue API keys." }, 403, requestId);
      }
      const name = clean(payload.name, 100);
      const scopes = Array.isArray(payload.scopes)
        ? payload.scopes
            .map((scope) => clean(scope, 80))
            .filter((scope) => allowedPermissions.includes(scope as (typeof allowedPermissions)[number]))
        : ["projects.view"];
      if (!name) return json({ error: "API key name is required." }, 400, requestId);
      const secretBytes = crypto.getRandomValues(new Uint8Array(24));
      const tokenPart = Array.from(secretBytes, (byte) =>
        byte.toString(16).padStart(2, "0"),
      ).join("");
      const secret = `nexus_key_${tokenPart}`;
      const prefix = secret.slice(0, 16);
      const digest = await crypto.subtle.digest(
        "SHA-256",
        new TextEncoder().encode(secret),
      );
      const secretHash = Array.from(new Uint8Array(digest), (byte) =>
        byte.toString(16).padStart(2, "0"),
      ).join("");
      const [key] = await db
        .insert(workspaceApiKeys)
        .values({
          name,
          prefix,
          secretHash,
          scopesJson: JSON.stringify(Array.from(new Set(scopes))),
          expiresAt: new Date(Date.now() + 90 * 86_400_000).toISOString(),
          createdBy: email,
        })
        .returning({ id: workspaceApiKeys.id });
      await audit(
        db,
        email,
        "api_key.create",
        `api-key:${key.id}`,
        `Issued API key “${name}” with ${scopes.length} scope(s).`,
        "high",
      );
      return json({ ok: true, secret, prefix }, 201, requestId);
    }

    if (action === "revokeApiKey") {
      if (!isAdmin) {
        return json({ error: "Only administrators can revoke API keys." }, 403, requestId);
      }
      const id = Number(payload.id);
      await db
        .update(workspaceApiKeys)
        .set({ status: "revoked" })
        .where(eq(workspaceApiKeys.id, id));
      await audit(
        db,
        email,
        "api_key.revoke",
        `api-key:${id}`,
        "API credential revoked.",
        "high",
      );
      return json({ ok: true }, 200, requestId);
    }

    return json({ error: "Unknown enterprise command." }, 400, requestId);
  } catch (error) {
    console.error("control-plane.POST", requestId, error);
    const message =
      error instanceof Error && error.message.includes("UNIQUE")
        ? "A record with that name already exists."
        : "The enterprise command failed.";
    return json({ error: message, requestId }, 500, requestId);
  }
}
