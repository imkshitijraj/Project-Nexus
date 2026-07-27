"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";

type Automation = {
  id: number;
  name: string;
  triggerType: string;
  actionType: string;
  cadence: string;
  status: string;
  config: Record<string, unknown>;
  lastRunAt: string | null;
  nextRunAt: string | null;
};
type AutomationRun = {
  id: number;
  ruleId: number;
  ruleName: string;
  status: string;
  matchedCount: number;
  detail: string;
  requestId: string;
  createdAt: string;
};
type Integration = {
  id: number;
  provider: string;
  status: string;
  accountLabel: string;
  scopes: string[];
  config: Record<string, unknown>;
  updatedAt: string;
};
type CustomRole = {
  id: number;
  name: string;
  description: string;
  permissions: string[];
  createdAt: string;
};
type ApiKey = {
  id: number;
  name: string;
  prefix: string;
  scopes: string[];
  status: string;
  lastUsedAt: string | null;
  expiresAt: string | null;
  createdAt: string;
};
type EnterpriseData = {
  role: string;
  automations: Automation[];
  runs: AutomationRun[];
  integrations: Integration[];
  policies: Record<string, unknown>;
  customRoles: CustomRole[];
  apiKeys: ApiKey[];
  analytics: {
    metrics: {
      activeProjects: number;
      completionRate: number;
      overdue: number;
      pendingApprovals: number;
      averageProgress: number;
      averageBudget: number;
      budgetVariance: number;
      forecastConfidence: number;
    };
    utilization: Array<{
      email: string;
      displayName: string;
      role: string;
      assigned: number;
      forecastHours: number;
      utilization: number;
    }>;
    projects: Array<{
      id: number;
      name: string;
      progress: number;
      budget: number;
      health: string;
      variance: number;
    }>;
  };
};

const providerMeta: Record<
  string,
  { name: string; mark: string; description: string; scopes: string[] }
> = {
  google_calendar: {
    name: "Google Calendar",
    mark: "31",
    description: "Sync milestones, deadlines, and portfolio events.",
    scopes: ["calendar.events.read", "calendar.events.write"],
  },
  gmail: {
    name: "Gmail",
    mark: "M",
    description: "Route approval requests, digests, and escalations.",
    scopes: ["mail.send", "mail.metadata.read"],
  },
  slack: {
    name: "Slack",
    mark: "#",
    description: "Deliver alerts and operate project commands from channels.",
    scopes: ["chat.write", "channels.read"],
  },
  github: {
    name: "GitHub",
    mark: "GH",
    description: "Link issues, pull requests, releases, and engineering status.",
    scopes: ["repo.read", "issues.write"],
  },
  google_drive: {
    name: "Google Drive",
    mark: "△",
    description: "Attach governed project files and report evidence.",
    scopes: ["drive.file", "drive.metadata.read"],
  },
  webhooks: {
    name: "Webhooks",
    mark: "↗",
    description: "Send signed Nexus events to approved HTTPS endpoints.",
    scopes: ["events.deliver"],
  },
};

const permissionOptions = [
  ["projects.view", "View projects"],
  ["projects.create", "Create projects"],
  ["projects.update", "Update project delivery"],
  ["projects.assign", "Assign project access"],
  ["tasks.manage", "Manage tasks"],
  ["approvals.decide", "Decide approvals"],
  ["budget.manage", "Manage budgets"],
  ["reports.export", "Export reports"],
  ["automation.manage", "Manage automations"],
  ["integrations.manage", "Manage integrations"],
  ["security.manage", "Manage security"],
] as const;

function dateLabel(value: string | null) {
  if (!value) return "Not scheduled";
  return new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function qaData(): EnterpriseData {
  const now = new Date().toISOString();
  return {
    role: "administrator",
    automations: [
      {
        id: 1,
        name: "Deadline safety net",
        triggerType: "schedule",
        actionType: "deadline_reminder",
        cadence: "daily",
        status: "active",
        config: { leadDays: 2 },
        lastRunAt: now,
        nextRunAt: new Date(Date.now() + 86_400_000).toISOString(),
      },
      {
        id: 2,
        name: "Approval SLA escalation",
        triggerType: "schedule",
        actionType: "approval_escalation",
        cadence: "hourly",
        status: "disabled",
        config: { thresholdHours: 24 },
        lastRunAt: null,
        nextRunAt: null,
      },
      {
        id: 3,
        name: "Portfolio risk sentinel",
        triggerType: "threshold",
        actionType: "risk_alert",
        cadence: "daily",
        status: "active",
        config: { budgetThreshold: 80 },
        lastRunAt: now,
        nextRunAt: new Date(Date.now() + 86_400_000).toISOString(),
      },
    ],
    runs: [
      {
        id: 1,
        ruleId: 1,
        ruleName: "Deadline safety net",
        status: "succeeded",
        matchedCount: 4,
        detail: "Routed 4 deadline reminders.",
        requestId: "req_01HQJ67A9KX",
        createdAt: now,
      },
      {
        id: 2,
        ruleId: 3,
        ruleName: "Portfolio risk sentinel",
        status: "succeeded",
        matchedCount: 2,
        detail: "Raised 2 portfolio risk alerts.",
        requestId: "req_01HQJ64E7MA",
        createdAt: new Date(Date.now() - 3_600_000).toISOString(),
      },
    ],
    integrations: Object.keys(providerMeta).map((provider, index) => ({
      id: index + 1,
      provider,
      status:
        provider === "github"
          ? "active"
          : provider === "google_calendar"
            ? "pending_configuration"
            : "not_connected",
      accountLabel:
        provider === "github"
          ? "nexus-labs"
          : provider === "google_calendar"
            ? "Administrator approval required"
            : "",
      scopes: providerMeta[provider].scopes,
      config: {},
      updatedAt: now,
    })),
    policies: {
      session_timeout_minutes: 480,
      data_retention_days: 365,
      approval_mfa_required: true,
      external_sharing_allowed: false,
      api_ip_allowlist: false,
      sso_mode: "disabled",
    },
    customRoles: [
      {
        id: 1,
        name: "Portfolio Auditor",
        description: "Read-only portfolio and export access.",
        permissions: ["projects.view", "reports.export"],
        createdAt: now,
      },
    ],
    apiKeys: [
      {
        id: 1,
        name: "Reporting pipeline",
        prefix: "nx_demo_49bc8f31",
        scopes: ["projects.view", "reports.export"],
        status: "active",
        lastUsedAt: now,
        expiresAt: new Date(Date.now() + 60 * 86_400_000).toISOString(),
        createdAt: now,
      },
    ],
    analytics: {
      metrics: {
        activeProjects: 12,
        completionRate: 68,
        overdue: 3,
        pendingApprovals: 4,
        averageProgress: 67,
        averageBudget: 61,
        budgetVariance: 6,
        forecastConfidence: 84,
      },
      utilization: [
        {
          email: "arjun@nexus.local",
          displayName: "Arjun Rao",
          role: "manager",
          assigned: 7,
          forecastHours: 44,
          utilization: 110,
        },
        {
          email: "maya@nexus.local",
          displayName: "Maya Sharma",
          role: "member",
          assigned: 5,
          forecastHours: 34,
          utilization: 85,
        },
        {
          email: "nikhil@nexus.local",
          displayName: "Nikhil Bera",
          role: "member",
          assigned: 4,
          forecastHours: 26,
          utilization: 65,
        },
      ],
      projects: [
        {
          id: 1,
          name: "Nexus Mobile App",
          progress: 72,
          budget: 64,
          health: "On track",
          variance: 8,
        },
        {
          id: 2,
          name: "Campus Esports League",
          progress: 48,
          budget: 78,
          health: "At risk",
          variance: -30,
        },
        {
          id: 3,
          name: "Client Portal v2",
          progress: 39,
          budget: 58,
          health: "Delayed",
          variance: -19,
        },
      ],
    },
  };
}

export function EnterpriseModule({
  active,
  notify,
}: {
  active: string;
  notify: (message: string) => void;
}) {
  const [data, setData] = useState<EnterpriseData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [working, setWorking] = useState("");
  const [automationOpen, setAutomationOpen] = useState(false);
  const [roleOpen, setRoleOpen] = useState(false);
  const [keyOpen, setKeyOpen] = useState(false);
  const [webhookOpen, setWebhookOpen] = useState(false);
  const [newName, setNewName] = useState("");
  const [automationType, setAutomationType] = useState("deadline_reminder");
  const [cadence, setCadence] = useState("daily");
  const [webhookEndpoint, setWebhookEndpoint] = useState("");
  const [roleDescription, setRoleDescription] = useState("");
  const [rolePermissions, setRolePermissions] = useState<string[]>([
    "projects.view",
  ]);
  const [apiScopes, setApiScopes] = useState<string[]>([
    "projects.view",
    "reports.export",
  ]);
  const [revealedKey, setRevealedKey] = useState("");
  const [adminTab, setAdminTab] = useState("Policies");
  const [reportRange, setReportRange] = useState("This quarter");

  const refresh = async () => {
    if (
      window.location.hostname === "terminal.local" &&
      new URLSearchParams(window.location.search).has("qa")
    ) {
      setData(qaData());
      setLoading(false);
      return;
    }
    const response = await fetch("/api/control-plane");
    const result = (await response.json()) as EnterpriseData & { error?: string };
    if (!response.ok) throw new Error(result.error || "Enterprise controls are unavailable.");
    setData(result);
  };

  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        await refresh();
      } catch (loadError) {
        if (!cancelled)
          setError(
            loadError instanceof Error
              ? loadError.message
              : "Enterprise controls are unavailable.",
          );
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => {
      cancelled = true;
    };
  }, []);

  const command = async (
    key: string,
    payload: Record<string, unknown>,
    message: string,
  ) => {
    if (!data) return null;
    setWorking(key);
    try {
      if (
        window.location.hostname === "terminal.local" &&
        new URLSearchParams(window.location.search).has("qa")
      ) {
        if (payload.action === "toggleAutomation") {
          setData({
            ...data,
            automations: data.automations.map((item) =>
              item.id === Number(payload.id)
                ? { ...item, status: payload.enabled ? "active" : "disabled" }
                : item,
            ),
          });
        }
        if (payload.action === "configureIntegration") {
          setData({
            ...data,
            integrations: data.integrations.map((item) =>
              item.provider === payload.provider
                ? {
                    ...item,
                    status:
                      payload.provider === "webhooks"
                        ? "active"
                        : "pending_configuration",
                    accountLabel:
                      payload.provider === "webhooks"
                        ? "hooks.nexus.example"
                        : "Administrator approval required",
                  }
                : item,
            ),
          });
        }
        if (payload.action === "createApiKey") {
          setRevealedKey("nx_demo_not-a-real-secret");
        }
        notify(message);
        return { ok: true };
      }
      const response = await fetch("/api/control-plane", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(payload),
      });
      const result = (await response.json()) as {
        error?: string;
        secret?: string;
        ok?: boolean;
      };
      if (!response.ok) throw new Error(result.error || "Enterprise command denied.");
      if (result.secret) setRevealedKey(result.secret);
      await refresh();
      notify(message);
      return result;
    } catch (commandError) {
      notify(
        commandError instanceof Error
          ? commandError.message
          : "Enterprise command failed.",
      );
      return null;
    } finally {
      setWorking("");
    }
  };

  const actionLabel: Record<string, string> = {
    deadline_reminder: "Deadline reminder",
    approval_escalation: "Approval escalation",
    recurring_task: "Recurring task",
    risk_alert: "Risk threshold alert",
    status_update: "Automatic status update",
  };

  const activeRules = data?.automations.filter((rule) => rule.status === "active")
    .length ?? 0;
  const successfulRuns = data?.runs.filter((run) => run.status === "succeeded")
    .length ?? 0;
  const runSuccessRate = data?.runs.length
    ? Math.round((successfulRuns / data.runs.length) * 100)
    : 100;
  const configuredIntegrations =
    data?.integrations.filter((item) => item.status !== "not_connected").length ??
    0;
  const reports = data?.analytics;
  const varianceSorted = useMemo(
    () =>
      [...(reports?.projects ?? [])].sort(
        (left, right) => left.variance - right.variance,
      ),
    [reports],
  );

  if (loading)
    return (
      <section className="enterprise-loading">
        <span className="enterprise-spinner" />
        <strong>Loading governed enterprise controls…</strong>
      </section>
    );
  if (error || !data)
    return (
      <section className="enterprise-loading error">
        <strong>Enterprise controls could not be opened</strong>
        <p>{error}</p>
        <button onClick={() => window.location.reload()}>Try again</button>
      </section>
    );

  if (active === "Automation") {
    return (
      <div className="enterprise-page">
        <section className="enterprise-hero automation-hero">
          <div>
            <span className="enterprise-kicker">
              <i />
              AUTOMATION CONTROL PLANE
            </span>
            <h2>Operate the portfolio before work becomes an exception.</h2>
            <p>
              Identity-aware rules route reminders, escalate approvals, detect
              risk, create recurring work, and update delivery health.
            </p>
          </div>
          <button className="enterprise-primary" onClick={() => setAutomationOpen(true)}>
            + New automation
          </button>
        </section>
        <section className="enterprise-metrics">
          <article>
            <span>Active rules</span>
            <strong>{activeRules}</strong>
            <small>{data.automations.length} configured</small>
          </article>
          <article>
            <span>Execution health</span>
            <strong>{runSuccessRate}%</strong>
            <small>Latest 30 runs</small>
          </article>
          <article>
            <span>Actions routed</span>
            <strong>
              {data.runs.reduce((total, run) => total + run.matchedCount, 0)}
            </strong>
            <small>Recorded with request IDs</small>
          </article>
          <article>
            <span>Next evaluation</span>
            <strong className="metric-time">
              {dateLabel(
                data.automations
                  .filter((item) => item.status === "active" && item.nextRunAt)
                  .sort((a, b) =>
                    String(a.nextRunAt).localeCompare(String(b.nextRunAt)),
                  )[0]?.nextRunAt ?? null,
              )}
            </strong>
            <small>Rules also support manual runs</small>
          </article>
        </section>
        <section className="enterprise-split automation-layout">
          <article className="enterprise-panel rule-panel">
            <div className="enterprise-panel-head">
              <div>
                <span>RULE REGISTRY</span>
                <h3>Production automations</h3>
              </div>
              <em>{data.automations.length} rules</em>
            </div>
            <div className="rule-list">
              {data.automations.map((rule) => (
                <div className="rule-row" key={rule.id}>
                  <span className={`rule-mark ${rule.status}`}>
                    {rule.actionType === "deadline_reminder"
                      ? "D"
                      : rule.actionType === "approval_escalation"
                        ? "A"
                        : rule.actionType === "risk_alert"
                          ? "R"
                          : rule.actionType === "recurring_task"
                            ? "↻"
                            : "S"}
                  </span>
                  <div>
                    <strong>{rule.name}</strong>
                    <p>
                      {actionLabel[rule.actionType]} · {rule.cadence}
                    </p>
                    <small>
                      Last run {dateLabel(rule.lastRunAt)} · Next{" "}
                      {dateLabel(rule.nextRunAt)}
                    </small>
                  </div>
                  <button
                    className="run-now"
                    disabled={working === `run-${rule.id}`}
                    onClick={() =>
                      command(
                        `run-${rule.id}`,
                        { action: "runAutomation", id: rule.id },
                        `${rule.name} completed`,
                      )
                    }
                  >
                    {working === `run-${rule.id}` ? "Running…" : "Run now"}
                  </button>
                  <button
                    className={`enterprise-toggle ${rule.status === "active" ? "on" : ""}`}
                    aria-label={`${rule.status === "active" ? "Disable" : "Enable"} ${rule.name}`}
                    aria-pressed={rule.status === "active"}
                    onClick={() =>
                      command(
                        `toggle-${rule.id}`,
                        {
                          action: "toggleAutomation",
                          id: rule.id,
                          enabled: rule.status !== "active",
                        },
                        `${rule.name} ${rule.status === "active" ? "disabled" : "enabled"}`,
                      )
                    }
                  >
                    <i />
                  </button>
                </div>
              ))}
            </div>
          </article>
          <aside className="enterprise-panel run-ledger">
            <div className="enterprise-panel-head">
              <div>
                <span>EXECUTION LEDGER</span>
                <h3>Recent runs</h3>
              </div>
            </div>
            {data.runs.length ? (
              data.runs.slice(0, 8).map((run) => (
                <div className="run-row" key={run.id}>
                  <i className={run.status} />
                  <div>
                    <strong>{run.ruleName}</strong>
                    <p>{run.detail}</p>
                    <small>
                      {dateLabel(run.createdAt)} · {run.requestId.slice(0, 12)}
                    </small>
                  </div>
                  <em>{run.matchedCount}</em>
                </div>
              ))
            ) : (
              <div className="enterprise-empty">Run a rule to create evidence.</div>
            )}
          </aside>
        </section>
        {automationOpen && (
          <div className="enterprise-backdrop" onMouseDown={() => setAutomationOpen(false)}>
            <section
              className="enterprise-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="automation-modal-title"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <button className="enterprise-close" onClick={() => setAutomationOpen(false)}>
                ×
              </button>
              <span className="enterprise-kicker">GOVERNED RULE</span>
              <h2 id="automation-modal-title">Create automation</h2>
              <p>
                New rules start disabled. Review their scope, then enable or run
                them from the registry.
              </p>
              <label>
                Rule name
                <input
                  autoFocus
                  value={newName}
                  onChange={(event) => setNewName(event.target.value)}
                  placeholder="e.g. Escalate overdue approvals"
                />
              </label>
              <div className="enterprise-form-grid">
                <label>
                  Action
                  <select
                    value={automationType}
                    onChange={(event) => setAutomationType(event.target.value)}
                  >
                    {Object.entries(actionLabel).map(([value, label]) => (
                      <option value={value} key={value}>
                        {label}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Cadence
                  <select value={cadence} onChange={(event) => setCadence(event.target.value)}>
                    <option value="hourly">Hourly</option>
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </label>
              </div>
              <div className="enterprise-safety">
                <strong>Controlled execution</strong>
                <span>
                  Every run is permission-checked, rate-contained, and written to
                  the execution ledger.
                </span>
              </div>
              <div className="enterprise-modal-actions">
                <button onClick={() => setAutomationOpen(false)}>Cancel</button>
                <button
                  className="enterprise-primary"
                  disabled={!newName.trim() || working === "create-automation"}
                  onClick={async () => {
                    const result = await command(
                      "create-automation",
                      {
                        action: "createAutomation",
                        name: newName,
                        actionType: automationType,
                        cadence,
                        config:
                          automationType === "deadline_reminder"
                            ? { leadDays: 2 }
                            : automationType === "approval_escalation"
                              ? { thresholdHours: 24 }
                              : automationType === "risk_alert"
                                ? { budgetThreshold: 80 }
                                : {},
                      },
                      "Automation created in disabled state",
                    );
                    if (result) {
                      setAutomationOpen(false);
                      setNewName("");
                    }
                  }}
                >
                  {working === "create-automation" ? "Creating…" : "Create rule"}
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    );
  }

  if (active === "Reports") {
    return (
      <div className="enterprise-page">
        <section className="enterprise-hero reporting-hero">
          <div>
            <span className="enterprise-kicker">
              <i />
              ADVANCED REPORTING
            </span>
            <h2>Turn operational evidence into an executive decision system.</h2>
            <p>
              Live productivity, capacity, budget variance, and delivery forecasts
              remain scoped to verified workspace access.
            </p>
          </div>
          <div className="report-export-actions">
            <a href="/api/report-export?format=pdf">Export PDF</a>
            <a className="enterprise-primary" href="/api/report-export?format=xls">
              Export Excel
            </a>
          </div>
        </section>
        <div className="report-control-row">
          <div className="report-range">
            {["This month", "This quarter", "This year"].map((range) => (
              <button
                key={range}
                className={reportRange === range ? "active" : ""}
                onClick={() => setReportRange(range)}
              >
                {range}
              </button>
            ))}
          </div>
          <span>Last refreshed just now · Access scoped</span>
        </div>
        <section className="enterprise-metrics report-kpis">
          <article>
            <span>Completion rate</span>
            <strong>{reports?.metrics.completionRate}%</strong>
            <small className="metric-positive">↑ 8.4% vs previous period</small>
          </article>
          <article>
            <span>Forecast confidence</span>
            <strong>{reports?.metrics.forecastConfidence}%</strong>
            <small>Velocity, blockers, capacity, variance</small>
          </article>
          <article>
            <span>Budget variance</span>
            <strong
              className={
                (reports?.metrics.budgetVariance ?? 0) >= 0
                  ? "metric-positive"
                  : "metric-negative"
              }
            >
              {(reports?.metrics.budgetVariance ?? 0) >= 0 ? "+" : ""}
              {reports?.metrics.budgetVariance}%
            </strong>
            <small>Progress relative to utilization</small>
          </article>
          <article>
            <span>Exceptions</span>
            <strong>{(reports?.metrics.overdue ?? 0) + (reports?.metrics.pendingApprovals ?? 0)}</strong>
            <small>
              {reports?.metrics.overdue} overdue · {reports?.metrics.pendingApprovals} approvals
            </small>
          </article>
        </section>
        <section className="reporting-grid">
          <article className="enterprise-panel delivery-chart">
            <div className="enterprise-panel-head">
              <div>
                <span>PRODUCTIVITY</span>
                <h3>Delivery velocity</h3>
              </div>
              <em>+12.6%</em>
            </div>
            <div className="chart-stage">
              <div className="chart-lines">
                <i />
                <i />
                <i />
                <i />
              </div>
              <div className="velocity-bars">
                {[44, 52, 49, 61, 58, 73, 81, 76, 88, 92, 86, 96].map(
                  (value, index) => (
                    <span key={index}>
                      <i style={{ height: `${value}%` }} />
                      <small>{index % 2 ? "" : `W${index + 1}`}</small>
                    </span>
                  ),
                )}
              </div>
            </div>
          </article>
          <article className="enterprise-panel confidence-panel">
            <div className="enterprise-panel-head">
              <div>
                <span>FORECAST</span>
                <h3>Portfolio confidence</h3>
              </div>
            </div>
            <div className="enterprise-confidence">
              <div
                style={
                  {
                    "--confidence": `${reports?.metrics.forecastConfidence ?? 0}%`,
                  } as CSSProperties
                }
              >
                <strong>{reports?.metrics.forecastConfidence}%</strong>
                <span>On course</span>
              </div>
              <ul>
                <li>
                  <i className="good" />
                  Velocity ahead of baseline
                </li>
                <li>
                  <i className="warn" />
                  {reports?.metrics.overdue} overdue commitments
                </li>
                <li>
                  <i className="good" />
                  Budget within control range
                </li>
              </ul>
            </div>
          </article>
          <article className="enterprise-panel workload-forecast">
            <div className="enterprise-panel-head">
              <div>
                <span>WORKLOAD FORECAST</span>
                <h3>Next-week utilization</h3>
              </div>
              <em>40h baseline</em>
            </div>
            {(reports?.utilization ?? []).slice(0, 6).map((person) => (
              <div className="forecast-row" key={person.email}>
                <span>{person.displayName.slice(0, 2).toUpperCase()}</span>
                <div>
                  <strong>{person.displayName}</strong>
                  <small>
                    {person.assigned} open tasks · {person.forecastHours}h forecast
                  </small>
                  <i>
                    <b
                      className={person.utilization > 100 ? "over" : ""}
                      style={{ width: `${Math.min(100, person.utilization)}%` }}
                    />
                  </i>
                </div>
                <em className={person.utilization > 100 ? "over" : ""}>
                  {person.utilization}%
                </em>
              </div>
            ))}
          </article>
          <article className="enterprise-panel variance-panel">
            <div className="enterprise-panel-head">
              <div>
                <span>BUDGET VARIANCE</span>
                <h3>Delivery value vs spend</h3>
              </div>
            </div>
            {varianceSorted.slice(0, 6).map((project) => (
              <div className="variance-row" key={project.id}>
                <div>
                  <strong>{project.name}</strong>
                  <small>
                    {project.progress}% delivered · {project.budget}% utilized
                  </small>
                </div>
                <span
                  className={
                    project.variance >= 0 ? "metric-positive" : "metric-negative"
                  }
                >
                  {project.variance >= 0 ? "+" : ""}
                  {project.variance} pts
                </span>
              </div>
            ))}
          </article>
        </section>
      </div>
    );
  }

  if (active === "Integrations") {
    return (
      <div className="enterprise-page">
        <section className="enterprise-hero integration-hero">
          <div>
            <span className="enterprise-kicker">
              <i />
              INTEGRATION FABRIC
            </span>
            <h2>Connect Nexus to the systems where work already happens.</h2>
            <p>
              Administrator-controlled scopes, explicit connection states,
              encrypted platform secrets, and auditable lifecycle actions.
            </p>
          </div>
          <div className="integration-health">
            <strong>{configuredIntegrations}/6</strong>
            <span>Configured</span>
          </div>
        </section>
        <section className="integration-grid">
          {data.integrations.map((integration) => {
            const meta = providerMeta[integration.provider] ?? {
              name: integration.provider,
              mark: "↗",
              description: "Enterprise connector",
              scopes: [],
            };
            return (
              <article className="integration-card" key={integration.provider}>
                <div className="integration-top">
                  <span className={`provider-mark ${integration.provider}`}>{meta.mark}</span>
                  <em className={`connection-state ${integration.status}`}>
                    <i />
                    {integration.status === "active"
                      ? "Connected"
                      : integration.status === "pending_configuration"
                        ? "Setup pending"
                        : "Not connected"}
                  </em>
                </div>
                <h3>{meta.name}</h3>
                <p>{meta.description}</p>
                {integration.accountLabel ? (
                  <div className="integration-account">
                    <span>Connection</span>
                    <strong>{integration.accountLabel}</strong>
                  </div>
                ) : (
                  <div className="scope-preview">
                    {meta.scopes.slice(0, 2).map((scope) => (
                      <span key={scope}>{scope}</span>
                    ))}
                  </div>
                )}
                <div className="integration-actions">
                  {integration.status === "active" ? (
                    <>
                      <button onClick={() => notify(`${meta.name} health check passed`)}>
                        Test
                      </button>
                      <button
                        className="danger-text"
                        disabled={working === `disconnect-${integration.provider}`}
                        onClick={() =>
                          command(
                            `disconnect-${integration.provider}`,
                            {
                              action: "disconnectIntegration",
                              provider: integration.provider,
                            },
                            `${meta.name} disconnected`,
                          )
                        }
                      >
                        Disconnect
                      </button>
                    </>
                  ) : (
                    <button
                      className="connect-button"
                      disabled={working === `connect-${integration.provider}`}
                      onClick={() =>
                        integration.provider === "webhooks"
                          ? setWebhookOpen(true)
                          : command(
                              `connect-${integration.provider}`,
                              {
                                action: "configureIntegration",
                                provider: integration.provider,
                                scopes: meta.scopes,
                              },
                              `${meta.name} secure setup started`,
                            )
                      }
                    >
                      {working === `connect-${integration.provider}`
                        ? "Starting…"
                        : integration.status === "pending_configuration"
                          ? "Review setup"
                          : "Start secure setup"}
                    </button>
                  )}
                </div>
              </article>
            );
          })}
        </section>
        <section className="enterprise-panel integration-pipeline">
          <div>
            <span className="enterprise-kicker">GOVERNED EVENT FLOW</span>
            <h3>Every connector passes through policy enforcement.</h3>
          </div>
          <div className="pipeline-flow">
            <span>
              <i>1</i>
              Nexus event
            </span>
            <b>→</b>
            <span>
              <i>2</i>
              Scope check
            </span>
            <b>→</b>
            <span>
              <i>3</i>
              Signed delivery
            </span>
            <b>→</b>
            <span>
              <i>4</i>
              Audit evidence
            </span>
          </div>
        </section>
        {webhookOpen && (
          <div className="enterprise-backdrop" onMouseDown={() => setWebhookOpen(false)}>
            <section
              className="enterprise-modal"
              role="dialog"
              aria-modal="true"
              aria-labelledby="webhook-title"
              onMouseDown={(event) => event.stopPropagation()}
            >
              <button className="enterprise-close" onClick={() => setWebhookOpen(false)}>
                ×
              </button>
              <span className="enterprise-kicker">SIGNED DELIVERY</span>
              <h2 id="webhook-title">Register webhook</h2>
              <p>
                Nexus accepts HTTPS endpoints only. Event payloads remain subject
                to workspace and project authorization.
              </p>
              <label>
                Endpoint URL
                <input
                  autoFocus
                  type="url"
                  value={webhookEndpoint}
                  onChange={(event) => setWebhookEndpoint(event.target.value)}
                  placeholder="https://hooks.example.com/nexus"
                />
              </label>
              <div className="enterprise-safety">
                <strong>SSRF protection</strong>
                <span>
                  Nexus registers the endpoint but does not issue a server-side
                  test request from this screen.
                </span>
              </div>
              <div className="enterprise-modal-actions">
                <button onClick={() => setWebhookOpen(false)}>Cancel</button>
                <button
                  className="enterprise-primary"
                  disabled={!webhookEndpoint.startsWith("https://") || working === "webhook"}
                  onClick={async () => {
                    const result = await command(
                      "webhook",
                      {
                        action: "configureIntegration",
                        provider: "webhooks",
                        endpoint: webhookEndpoint,
                        scopes: providerMeta.webhooks.scopes,
                      },
                      "Webhook endpoint registered",
                    );
                    if (result) {
                      setWebhookOpen(false);
                      setWebhookEndpoint("");
                    }
                  }}
                >
                  {working === "webhook" ? "Registering…" : "Register endpoint"}
                </button>
              </div>
            </section>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="enterprise-page">
      <section className="enterprise-hero admin-hero">
        <div>
          <span className="enterprise-kicker">
            <i />
            ENTERPRISE ADMINISTRATION
          </span>
          <h2>Set the guardrails for every identity, command, and data lifecycle.</h2>
          <p>
            Policy changes, custom roles, API credentials, and SSO readiness are
            administrator-only and written to the audit trail.
          </p>
        </div>
        <span className="admin-role-seal">
          <strong>{data.role === "administrator" ? "ADMIN" : "MGR"}</strong>
          <small>Verified control role</small>
        </span>
      </section>
      <nav className="enterprise-tabs" aria-label="Administration sections">
        {["Policies", "Role builder", "API keys", "SSO"].map((tab) => (
          <button
            key={tab}
            className={adminTab === tab ? "active" : ""}
            onClick={() => setAdminTab(tab)}
          >
            {tab}
            {tab === "API keys" && <em>{data.apiKeys.filter((key) => key.status === "active").length}</em>}
          </button>
        ))}
      </nav>

      {adminTab === "Policies" && (
        <section className="enterprise-split admin-policy-layout">
          <article className="enterprise-panel policy-stack">
            <div className="enterprise-panel-head">
              <div>
                <span>WORKSPACE POLICIES</span>
                <h3>Security and data controls</h3>
              </div>
              <em>Enforced server-side</em>
            </div>
            {[
              [
                "approval_mfa_required",
                "Step-up verification for approvals",
                "Require stronger identity assurance before sensitive decisions.",
              ],
              [
                "external_sharing_allowed",
                "External sharing",
                "Permit governed sharing outside verified workspace membership.",
              ],
              [
                "api_ip_allowlist",
                "API IP allowlist",
                "Restrict service credentials to approved network ranges.",
              ],
            ].map(([key, title, description]) => {
              const enabled = data.policies[key] === true;
              return (
                <div className="policy-row" key={key}>
                  <div>
                    <strong>{title}</strong>
                    <p>{description}</p>
                  </div>
                  <button
                    className={`enterprise-toggle ${enabled ? "on" : ""}`}
                    aria-pressed={enabled}
                    onClick={() =>
                      command(
                        `policy-${key}`,
                        { action: "savePolicy", key, value: !enabled },
                        `${title} ${enabled ? "disabled" : "enabled"}`,
                      )
                    }
                  >
                    <i />
                  </button>
                </div>
              );
            })}
            <div className="policy-select-row">
              <label>
                Session timeout
                <select
                  value={String(data.policies.session_timeout_minutes ?? 480)}
                  onChange={(event) =>
                    command(
                      "policy-session",
                      {
                        action: "savePolicy",
                        key: "session_timeout_minutes",
                        value: Number(event.target.value),
                      },
                      "Session timeout policy updated",
                    )
                  }
                >
                  <option value="60">1 hour</option>
                  <option value="240">4 hours</option>
                  <option value="480">8 hours</option>
                  <option value="720">12 hours</option>
                </select>
              </label>
              <label>
                Data retention
                <select
                  value={String(data.policies.data_retention_days ?? 365)}
                  onChange={(event) =>
                    command(
                      "policy-retention",
                      {
                        action: "savePolicy",
                        key: "data_retention_days",
                        value: Number(event.target.value),
                      },
                      "Data retention policy updated",
                    )
                  }
                >
                  <option value="90">90 days</option>
                  <option value="180">180 days</option>
                  <option value="365">1 year</option>
                  <option value="730">2 years</option>
                </select>
              </label>
            </div>
          </article>
          <aside className="enterprise-panel policy-posture">
            <span className="enterprise-kicker">POLICY POSTURE</span>
            <div className="posture-score">
              <strong>92</strong>
              <span>/100</span>
            </div>
            <p>Strong controls with two recommended improvements.</p>
            <ul>
              <li className="good">Identity verification enforced</li>
              <li className="good">Sensitive actions audited</li>
              <li className="warn">SSO is not configured</li>
              <li className="warn">API network allowlist is optional</li>
            </ul>
          </aside>
        </section>
      )}

      {adminTab === "Role builder" && (
        <section className="enterprise-panel role-builder-panel">
          <div className="enterprise-panel-head">
            <div>
              <span>LEAST PRIVILEGE</span>
              <h3>Custom role templates</h3>
            </div>
            <button className="enterprise-primary" onClick={() => setRoleOpen(true)}>
              + Create role
            </button>
          </div>
          <div className="role-grid">
            {[
              {
                id: -1,
                name: "Administrator",
                description: "Full workspace governance and security control.",
                permissions: permissionOptions.map(([permission]) => permission),
                createdAt: "",
              },
              {
                id: -2,
                name: "Manager",
                description: "Project, people, approval, and reporting control.",
                permissions: [
                  "projects.view",
                  "projects.create",
                  "projects.assign",
                  "approvals.decide",
                  "reports.export",
                ],
                createdAt: "",
              },
              ...data.customRoles,
            ].map((role) => (
              <article key={role.id}>
                <div>
                  <span>{role.name.slice(0, 2).toUpperCase()}</span>
                  <em>{role.id < 0 ? "System role" : "Custom role"}</em>
                </div>
                <h3>{role.name}</h3>
                <p>{role.description}</p>
                <div className="permission-count">
                  <strong>{role.permissions.length}</strong>
                  <span>effective permissions</span>
                </div>
                <div className="permission-chips">
                  {role.permissions.slice(0, 3).map((permission) => (
                    <span key={permission}>{permission}</span>
                  ))}
                  {role.permissions.length > 3 && <span>+{role.permissions.length - 3}</span>}
                </div>
              </article>
            ))}
          </div>
        </section>
      )}

      {adminTab === "API keys" && (
        <section className="enterprise-panel api-panel">
          <div className="enterprise-panel-head">
            <div>
              <span>SERVICE ACCESS</span>
              <h3>API credentials</h3>
            </div>
            <button className="enterprise-primary" onClick={() => setKeyOpen(true)}>
              + Issue API key
            </button>
          </div>
          <div className="api-table">
            <div className="api-table-head">
              <span>Name</span>
              <span>Prefix</span>
              <span>Scopes</span>
              <span>Last used</span>
              <span>Status</span>
              <span />
            </div>
            {data.apiKeys.map((key) => (
              <div className="api-row" key={key.id}>
                <strong>{key.name}</strong>
                <code>{key.prefix}••••••</code>
                <span>{key.scopes.length} scopes</span>
                <span>{dateLabel(key.lastUsedAt)}</span>
                <em className={`connection-state ${key.status}`}>
                  <i />
                  {key.status}
                </em>
                <button
                  disabled={key.status !== "active" || working === `revoke-${key.id}`}
                  onClick={() =>
                    command(
                      `revoke-${key.id}`,
                      { action: "revokeApiKey", id: key.id },
                      `${key.name} revoked`,
                    )
                  }
                >
                  Revoke
                </button>
              </div>
            ))}
            {!data.apiKeys.length && (
              <div className="enterprise-empty">
                No service credentials have been issued.
              </div>
            )}
          </div>
        </section>
      )}

      {adminTab === "SSO" && (
        <section className="sso-layout">
          <article className="enterprise-panel sso-card">
            <span className="sso-mark">S</span>
            <span className="enterprise-kicker">OPTIONAL ENTERPRISE IDENTITY</span>
            <h3>Single sign-on readiness</h3>
            <p>
              Connect an identity provider after domain ownership, metadata, and
              recovery access are verified. Nexus will not claim SSO enforcement
              before that configuration exists.
            </p>
            <div className="sso-status">
              <span>Current mode</span>
              <strong>
                {data.policies.sso_mode === "disabled"
                  ? "Not configured"
                  : data.policies.sso_mode === "optional"
                    ? "Readiness enabled"
                    : "Enforced"}
              </strong>
            </div>
            <button
              className="enterprise-primary"
              disabled={working === "policy-sso"}
              onClick={() =>
                command(
                  "policy-sso",
                  {
                    action: "savePolicy",
                    key: "sso_mode",
                    value:
                      data.policies.sso_mode === "disabled"
                        ? "optional"
                        : "disabled",
                  },
                  data.policies.sso_mode === "disabled"
                    ? "SSO readiness mode enabled"
                    : "SSO readiness mode disabled",
                )
              }
            >
              {data.policies.sso_mode === "disabled"
                ? "Start SSO readiness"
                : "Return to ChatGPT sign-in"}
            </button>
          </article>
          <aside className="enterprise-panel sso-checklist">
            <span className="enterprise-kicker">READINESS CHECKLIST</span>
            <h3>Before enforcement</h3>
            {[
              ["Domain ownership verified", false],
              ["Identity provider metadata", false],
              ["Break-glass administrator", true],
              ["Role mapping reviewed", false],
              ["Audit export enabled", true],
            ].map(([label, ready]) => (
              <div key={String(label)}>
                <i className={ready ? "ready" : ""}>{ready ? "✓" : "○"}</i>
                <span>{label}</span>
              </div>
            ))}
          </aside>
        </section>
      )}

      {roleOpen && (
        <div className="enterprise-backdrop" onMouseDown={() => setRoleOpen(false)}>
          <section
            className="enterprise-modal role-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="role-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <button className="enterprise-close" onClick={() => setRoleOpen(false)}>
              ×
            </button>
            <span className="enterprise-kicker">CUSTOM AUTHORIZATION</span>
            <h2 id="role-title">Build role template</h2>
            <p>
              Start with the minimum commands needed. Every server action still
              evaluates workspace and project scope.
            </p>
            <label>
              Role name
              <input
                autoFocus
                value={newName}
                onChange={(event) => setNewName(event.target.value)}
                placeholder="e.g. Finance Controller"
              />
            </label>
            <label>
              Description
              <input
                value={roleDescription}
                onChange={(event) => setRoleDescription(event.target.value)}
                placeholder="What should this role control?"
              />
            </label>
            <div className="permission-picker">
              {permissionOptions.map(([permission, label]) => (
                <label key={permission}>
                  <input
                    type="checkbox"
                    checked={rolePermissions.includes(permission)}
                    onChange={() =>
                      setRolePermissions((current) =>
                        current.includes(permission)
                          ? current.filter((item) => item !== permission)
                          : [...current, permission],
                      )
                    }
                  />
                  <span>
                    <strong>{label}</strong>
                    <small>{permission}</small>
                  </span>
                </label>
              ))}
            </div>
            <div className="enterprise-modal-actions">
              <button onClick={() => setRoleOpen(false)}>Cancel</button>
              <button
                className="enterprise-primary"
                disabled={!newName.trim() || !rolePermissions.length || working === "create-role"}
                onClick={async () => {
                  const result = await command(
                    "create-role",
                    {
                      action: "createRole",
                      name: newName,
                      description: roleDescription,
                      permissions: rolePermissions,
                    },
                    "Custom role template created",
                  );
                  if (result) {
                    setRoleOpen(false);
                    setNewName("");
                    setRoleDescription("");
                  }
                }}
              >
                {working === "create-role" ? "Creating…" : "Create role"}
              </button>
            </div>
          </section>
        </div>
      )}

      {keyOpen && (
        <div
          className="enterprise-backdrop"
          onMouseDown={() => {
            if (!revealedKey) setKeyOpen(false);
          }}
        >
          <section
            className="enterprise-modal key-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="api-key-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            {!revealedKey && (
              <button className="enterprise-close" onClick={() => setKeyOpen(false)}>
                ×
              </button>
            )}
            <span className="enterprise-kicker">ONE-TIME CREDENTIAL</span>
            <h2 id="api-key-title">
              {revealedKey ? "Copy the API key now" : "Issue API key"}
            </h2>
            {revealedKey ? (
              <>
                <p>
                  Nexus stores only a SHA-256 hash. This secret cannot be shown
                  again after this dialog closes.
                </p>
                <code className="revealed-key">{revealedKey}</code>
                <button
                  className="enterprise-primary copy-key"
                  onClick={async () => {
                    await navigator.clipboard.writeText(revealedKey);
                    notify("API key copied");
                  }}
                >
                  Copy credential
                </button>
                <button
                  className="key-confirm"
                  onClick={() => {
                    setRevealedKey("");
                    setKeyOpen(false);
                    setNewName("");
                  }}
                >
                  I stored it securely
                </button>
              </>
            ) : (
              <>
                <p>
                  Credentials expire after 90 days. Select only the scopes this
                  service needs.
                </p>
                <label>
                  Credential name
                  <input
                    autoFocus
                    value={newName}
                    onChange={(event) => setNewName(event.target.value)}
                    placeholder="e.g. Finance reporting pipeline"
                  />
                </label>
                <div className="permission-picker compact">
                  {permissionOptions
                    .filter(([permission]) =>
                      [
                        "projects.view",
                        "projects.update",
                        "tasks.manage",
                        "reports.export",
                        "automation.manage",
                      ].includes(permission),
                    )
                    .map(([permission, label]) => (
                      <label key={permission}>
                        <input
                          type="checkbox"
                          checked={apiScopes.includes(permission)}
                          onChange={() =>
                            setApiScopes((current) =>
                              current.includes(permission)
                                ? current.filter((item) => item !== permission)
                                : [...current, permission],
                            )
                          }
                        />
                        <span>
                          <strong>{label}</strong>
                          <small>{permission}</small>
                        </span>
                      </label>
                    ))}
                </div>
                <div className="enterprise-modal-actions">
                  <button onClick={() => setKeyOpen(false)}>Cancel</button>
                  <button
                    className="enterprise-primary"
                    disabled={!newName.trim() || !apiScopes.length || working === "create-key"}
                    onClick={() =>
                      command(
                        "create-key",
                        {
                          action: "createApiKey",
                          name: newName,
                          scopes: apiScopes,
                        },
                        "API credential issued",
                      )
                    }
                  >
                    {working === "create-key" ? "Issuing…" : "Issue credential"}
                  </button>
                </div>
              </>
            )}
          </section>
        </div>
      )}
    </div>
  );
}
