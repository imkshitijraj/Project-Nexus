import { sql } from "drizzle-orm";
import { index, integer, sqliteTable, text, uniqueIndex } from "drizzle-orm/sqlite-core";

export const projects = sqliteTable("projects", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  name: text("name").notNull(),
  department: text("department").notNull().default("Product & Engineering"),
  priority: text("priority").notNull().default("High"),
  description: text("description").notNull().default(""),
  health: text("health").notNull().default("On track"),
  progress: integer("progress").notNull().default(0),
  budget: integer("budget").notNull().default(0),
  due: text("due").notNull().default("Oct 15"),
  color: text("color").notNull().default("#c8b8ff"),
  version: integer("version").notNull().default(1),
  createdBy: text("created_by").notNull(),
  updatedBy: text("updated_by").notNull().default(""),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const projectBudgets = sqliteTable(
  "project_budgets",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    allocatedAmount: integer("allocated_amount").notNull().default(0),
    spentAmount: integer("spent_amount").notNull().default(0),
    committedAmount: integer("committed_amount").notNull().default(0),
    forecastAmount: integer("forecast_amount").notNull().default(0),
    notes: text("notes").notNull().default(""),
    version: integer("version").notNull().default(1),
    updatedBy: text("updated_by").notNull(),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("project_budgets_project_unique").on(table.projectId),
    index("project_budgets_updated_idx").on(table.updatedAt),
  ],
);

export const budgetChangeLog = sqliteTable(
  "budget_change_log",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    actorEmail: text("actor_email").notNull(),
    changeType: text("change_type").notNull().default("budget.update"),
    beforeJson: text("before_json").notNull().default("{}"),
    afterJson: text("after_json").notNull().default("{}"),
    reason: text("reason").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("budget_change_log_project_idx").on(table.projectId, table.createdAt),
    index("budget_change_log_actor_idx").on(table.actorEmail, table.createdAt),
  ],
);

export const workspaceMembers = sqliteTable(
  "workspace_members",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    email: text("email").notNull(),
    displayName: text("display_name").notNull().default("Nexus member"),
    role: text("role").notNull().default("member"),
    status: text("status").notNull().default("active"),
    joinedAt: text("joined_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [uniqueIndex("workspace_members_email_unique").on(table.email)],
);

export const workspaceInvitations = sqliteTable(
  "workspace_invitations",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    email: text("email").notNull(),
    role: text("role").notNull().default("member"),
    projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }),
    projectRole: text("project_role").notNull().default("contributor"),
    status: text("status").notNull().default("pending"),
    invitedBy: text("invited_by").notNull(),
    expiresAt: text("expires_at").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [uniqueIndex("workspace_invitations_email_unique").on(table.email)],
);

export const projectMembers = sqliteTable(
  "project_members",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    email: text("email").notNull(),
    role: text("role").notNull().default("contributor"),
    addedBy: text("added_by").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("project_members_project_email_unique").on(
      table.projectId,
      table.email,
    ),
  ],
);

export const approvalRequests = sqliteTable("approval_requests", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }),
  title: text("title").notNull(),
  category: text("category").notNull().default("Delivery"),
  amount: integer("amount").notNull().default(0),
  status: text("status").notNull().default("pending"),
  requestedBy: text("requested_by").notNull(),
  decidedBy: text("decided_by"),
  decidedAt: text("decided_at"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const accessAuditEvents = sqliteTable("access_audit_events", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  actorEmail: text("actor_email").notNull(),
  action: text("action").notNull(),
  target: text("target").notNull(),
  detail: text("detail").notNull().default(""),
  risk: text("risk").notNull().default("low"),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const tasks = sqliteTable(
  "tasks",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    status: text("status").notNull().default("todo"),
    priority: text("priority").notNull().default("medium"),
    assigneeEmail: text("assignee_email"),
    dueDate: text("due_date"),
    parentTaskId: integer("parent_task_id"),
    dependsOnTaskId: integer("depends_on_task_id"),
    createdBy: text("created_by").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("tasks_project_status_idx").on(table.projectId, table.status),
    index("tasks_assignee_idx").on(table.assigneeEmail),
  ],
);

export const taskComments = sqliteTable(
  "task_comments",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    taskId: integer("task_id")
      .notNull()
      .references(() => tasks.id, { onDelete: "cascade" }),
    body: text("body").notNull(),
    mentions: text("mentions").notNull().default("[]"),
    authorEmail: text("author_email").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("task_comments_task_idx").on(table.taskId, table.createdAt)],
);

export const workspaceNotifications = sqliteTable(
  "workspace_notifications",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    recipientEmail: text("recipient_email").notNull(),
    projectId: integer("project_id").references(() => projects.id, { onDelete: "cascade" }),
    taskId: integer("task_id").references(() => tasks.id, { onDelete: "cascade" }),
    type: text("type").notNull().default("update"),
    title: text("title").notNull(),
    body: text("body").notNull().default(""),
    readAt: text("read_at"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("workspace_notifications_recipient_idx").on(
      table.recipientEmail,
      table.readAt,
      table.createdAt,
    ),
  ],
);

export const projectActivity = sqliteTable(
  "project_activity",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    actorEmail: text("actor_email").notNull(),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: integer("entity_id"),
    detail: text("detail").notNull().default(""),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("project_activity_project_idx").on(table.projectId, table.createdAt),
  ],
);

export const projectRisks = sqliteTable(
  "project_risks",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    probability: integer("probability").notNull().default(3),
    impact: integer("impact").notNull().default(3),
    status: text("status").notNull().default("open"),
    ownerEmail: text("owner_email"),
    mitigation: text("mitigation").notNull().default(""),
    targetDate: text("target_date"),
    version: integer("version").notNull().default(1),
    createdBy: text("created_by").notNull(),
    updatedBy: text("updated_by").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("project_risks_project_status_idx").on(table.projectId, table.status),
    index("project_risks_owner_idx").on(table.ownerEmail, table.targetDate),
  ],
);

export const projectMilestones = sqliteTable(
  "project_milestones",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    description: text("description").notNull().default(""),
    dueDate: text("due_date").notNull(),
    status: text("status").notNull().default("planned"),
    ownerEmail: text("owner_email"),
    version: integer("version").notNull().default(1),
    createdBy: text("created_by").notNull(),
    updatedBy: text("updated_by").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("project_milestones_project_due_idx").on(table.projectId, table.dueDate),
    index("project_milestones_status_due_idx").on(table.status, table.dueDate),
  ],
);

export const portfolioChangeLog = sqliteTable(
  "portfolio_change_log",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    actorEmail: text("actor_email").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: integer("entity_id"),
    action: text("action").notNull(),
    beforeJson: text("before_json").notNull().default("{}"),
    afterJson: text("after_json").notNull().default("{}"),
    reason: text("reason").notNull().default(""),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("portfolio_change_log_project_idx").on(table.projectId, table.createdAt),
    index("portfolio_change_log_entity_idx").on(table.entityType, table.entityId),
  ],
);

export const operationRateLimits = sqliteTable(
  "operation_rate_limits",
  {
    key: text("key").primaryKey(),
    bucket: integer("bucket").notNull(),
    count: integer("count").notNull().default(1),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
);

export const automationRules = sqliteTable(
  "automation_rules",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    triggerType: text("trigger_type").notNull(),
    actionType: text("action_type").notNull(),
    cadence: text("cadence").notNull().default("daily"),
    configJson: text("config_json").notNull().default("{}"),
    status: text("status").notNull().default("disabled"),
    lastRunAt: text("last_run_at"),
    nextRunAt: text("next_run_at"),
    createdBy: text("created_by").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("automation_rules_status_next_idx").on(table.status, table.nextRunAt),
  ],
);

export const automationRuns = sqliteTable(
  "automation_runs",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    ruleId: integer("rule_id")
      .notNull()
      .references(() => automationRules.id, { onDelete: "cascade" }),
    status: text("status").notNull().default("succeeded"),
    matchedCount: integer("matched_count").notNull().default(0),
    detail: text("detail").notNull().default(""),
    requestId: text("request_id").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [index("automation_runs_rule_idx").on(table.ruleId, table.createdAt)],
);

export const integrationConnections = sqliteTable(
  "integration_connections",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    provider: text("provider").notNull(),
    status: text("status").notNull().default("not_connected"),
    accountLabel: text("account_label").notNull().default(""),
    scopes: text("scopes").notNull().default("[]"),
    configJson: text("config_json").notNull().default("{}"),
    updatedBy: text("updated_by").notNull(),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("integration_connections_provider_unique").on(table.provider),
  ],
);

export const workspacePolicies = sqliteTable(
  "workspace_policies",
  {
    key: text("key").primaryKey(),
    valueJson: text("value_json").notNull(),
    updatedBy: text("updated_by").notNull(),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
);

export const workspaceCustomRoles = sqliteTable(
  "workspace_custom_roles",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    description: text("description").notNull().default(""),
    permissionsJson: text("permissions_json").notNull().default("[]"),
    createdBy: text("created_by").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("workspace_custom_roles_name_unique").on(table.name),
  ],
);

export const workspaceApiKeys = sqliteTable(
  "workspace_api_keys",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    name: text("name").notNull(),
    prefix: text("prefix").notNull(),
    secretHash: text("secret_hash").notNull(),
    scopesJson: text("scopes_json").notNull().default("[]"),
    status: text("status").notNull().default("active"),
    lastUsedAt: text("last_used_at"),
    expiresAt: text("expires_at"),
    createdBy: text("created_by").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("workspace_api_keys_prefix_unique").on(table.prefix),
  ],
);

export const operationalServices = sqliteTable(
  "operational_services",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    name: text("name").notNull(),
    tier: text("tier").notNull().default("tier_2"),
    status: text("status").notNull().default("operational"),
    ownerEmail: text("owner_email"),
    availabilityTargetBps: integer("availability_target_bps").notNull().default(9990),
    currentAvailabilityBps: integer("current_availability_bps").notNull().default(10000),
    rtoMinutes: integer("rto_minutes").notNull().default(60),
    rpoMinutes: integer("rpo_minutes").notNull().default(15),
    version: integer("version").notNull().default(1),
    createdBy: text("created_by").notNull(),
    updatedBy: text("updated_by").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("operational_services_project_name_unique").on(table.projectId, table.name),
    index("operational_services_status_idx").on(table.status, table.tier),
  ],
);

export const reliabilityIncidents = sqliteTable(
  "reliability_incidents",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    serviceId: integer("service_id")
      .notNull()
      .references(() => operationalServices.id, { onDelete: "cascade" }),
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    severity: text("severity").notNull().default("sev_3"),
    status: text("status").notNull().default("investigating"),
    commanderEmail: text("commander_email"),
    impact: text("impact").notNull().default(""),
    summary: text("summary").notNull().default(""),
    startedAt: text("started_at").notNull(),
    resolvedAt: text("resolved_at"),
    version: integer("version").notNull().default(1),
    createdBy: text("created_by").notNull(),
    updatedBy: text("updated_by").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("reliability_incidents_project_status_idx").on(table.projectId, table.status),
    index("reliability_incidents_service_started_idx").on(table.serviceId, table.startedAt),
  ],
);

export const reliabilityChanges = sqliteTable(
  "reliability_changes",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    serviceId: integer("service_id")
      .notNull()
      .references(() => operationalServices.id, { onDelete: "cascade" }),
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    riskLevel: text("risk_level").notNull().default("medium"),
    status: text("status").notNull().default("pending"),
    ownerEmail: text("owner_email"),
    windowStart: text("window_start").notNull(),
    windowEnd: text("window_end").notNull(),
    implementationPlan: text("implementation_plan").notNull().default(""),
    rollbackPlan: text("rollback_plan").notNull().default(""),
    decisionReason: text("decision_reason").notNull().default(""),
    decidedBy: text("decided_by"),
    decidedAt: text("decided_at"),
    version: integer("version").notNull().default(1),
    createdBy: text("created_by").notNull(),
    updatedBy: text("updated_by").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("reliability_changes_project_status_idx").on(table.projectId, table.status),
    index("reliability_changes_window_idx").on(table.windowStart, table.windowEnd),
  ],
);

export const recoveryRunbooks = sqliteTable(
  "recovery_runbooks",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    serviceId: integer("service_id")
      .notNull()
      .references(() => operationalServices.id, { onDelete: "cascade" }),
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    title: text("title").notNull(),
    status: text("status").notNull().default("ready"),
    ownerEmail: text("owner_email"),
    trigger: text("trigger").notNull().default(""),
    stepsJson: text("steps_json").notNull().default("[]"),
    lastTestedAt: text("last_tested_at"),
    nextReviewDate: text("next_review_date"),
    version: integer("version").notNull().default(1),
    createdBy: text("created_by").notNull(),
    updatedBy: text("updated_by").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("recovery_runbooks_service_idx").on(table.serviceId, table.status),
    index("recovery_runbooks_review_idx").on(table.nextReviewDate),
  ],
);

export const reliabilityEvents = sqliteTable(
  "reliability_events",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    projectId: integer("project_id")
      .notNull()
      .references(() => projects.id, { onDelete: "cascade" }),
    serviceId: integer("service_id").references(() => operationalServices.id, {
      onDelete: "set null",
    }),
    actorEmail: text("actor_email").notNull(),
    action: text("action").notNull(),
    targetType: text("target_type").notNull(),
    targetId: integer("target_id"),
    detail: text("detail").notNull().default(""),
    beforeJson: text("before_json").notNull().default("{}"),
    afterJson: text("after_json").notNull().default("{}"),
    risk: text("risk").notNull().default("low"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("reliability_events_project_idx").on(table.projectId, table.createdAt),
    index("reliability_events_target_idx").on(table.targetType, table.targetId),
  ],
);
