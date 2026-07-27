"use client";

import { useMemo, useState } from "react";

export type GovernanceProject = {
  id: number;
  name: string;
  department: string;
  health: string;
  progress: number;
  due: string;
  version: number;
  canEdit: boolean;
};

export type GovernanceRisk = {
  id: number;
  projectId: number;
  projectName: string;
  title: string;
  description: string;
  probability: number;
  impact: number;
  status: string;
  ownerEmail: string | null;
  mitigation: string;
  targetDate: string | null;
  version: number;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
};

export type GovernanceMilestone = {
  id: number;
  projectId: number;
  projectName: string;
  title: string;
  description: string;
  dueDate: string;
  status: string;
  ownerEmail: string | null;
  version: number;
  createdBy: string;
  updatedBy: string;
  createdAt: string;
  updatedAt: string;
};

export type GovernanceLog = {
  id: number;
  projectId: number;
  projectName: string;
  actorEmail: string;
  entityType: string;
  entityId: number | null;
  action: string;
  before: Record<string, unknown>;
  after: Record<string, unknown>;
  reason: string;
  createdAt: string;
};

export type GovernanceData = {
  projects: GovernanceProject[];
  risks: GovernanceRisk[];
  milestones: GovernanceMilestone[];
  logs: GovernanceLog[];
  members: Array<{ email: string; displayName: string; role: string }>;
  metrics: {
    openRisks: number;
    highRisks: number;
    dueRisks: number;
    mitigationCoverage: number;
    upcomingMilestones: number;
    blockedMilestones: number;
  };
};

export const emptyGovernance: GovernanceData = {
  projects: [],
  risks: [],
  milestones: [],
  logs: [],
  members: [],
  metrics: {
    openRisks: 0,
    highRisks: 0,
    dueRisks: 0,
    mitigationCoverage: 100,
    upcomingMilestones: 0,
    blockedMilestones: 0,
  },
};

export type GovernanceCommand = (payload: Record<string, unknown>) => Promise<boolean>;

const statusLabel = (value: string) =>
  value.replaceAll("_", " ").replace(/^\w/, (letter) => letter.toUpperCase());

const shortDate = (value: string | null) =>
  value
    ? new Date(`${value}T00:00:00`).toLocaleDateString(undefined, {
        month: "short",
        day: "numeric",
      })
    : "No target";

const personInitials = (email: string | null) =>
  email ? email.slice(0, 2).toUpperCase() : "—";

function ChangeLedger({ logs }: { logs: GovernanceLog[] }) {
  const [query, setQuery] = useState("");
  const visible = logs.filter((log) =>
    `${log.projectName} ${log.action} ${log.actorEmail} ${log.reason}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <section className="panel governance-ledger">
      <div className="panel-head">
        <div>
          <span className="section-kicker">Immutable evidence</span>
          <h2>Governance change log</h2>
        </div>
        <label className="governance-search">
          <span>⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter change history"
          />
        </label>
      </div>
      <div className="governance-log-list">
        {visible.slice(0, 12).map((log) => (
          <article key={log.id}>
            <i className={log.entityType} />
            <div>
              <strong>{log.action.replaceAll(".", " → ")}</strong>
              <p>{log.reason || "Controlled portfolio update"}</p>
              <small>
                {log.projectName} · {log.actorEmail}
              </small>
            </div>
            <time>{new Date(log.createdAt).toLocaleString()}</time>
          </article>
        ))}
        {!visible.length && (
          <div className="governance-empty compact">
            <strong>No matching change records</strong>
            <span>Every governed update will appear here automatically.</span>
          </div>
        )}
      </div>
    </section>
  );
}

function RiskGovernance({
  data,
  command,
  notify,
}: {
  data: GovernanceData;
  command: GovernanceCommand;
  notify: (message: string) => void;
}) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState("active");
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<GovernanceRisk | null>(null);
  const [working, setWorking] = useState(false);
  const [draft, setDraft] = useState({
    projectId: "",
    title: "",
    description: "",
    probability: "3",
    impact: "3",
    ownerEmail: "",
    targetDate: "",
    mitigation: "",
  });
  const [edit, setEdit] = useState({
    status: "open",
    probability: "3",
    impact: "3",
    ownerEmail: "",
    targetDate: "",
    mitigation: "",
    reason: "",
  });

  const openRisk = (risk: GovernanceRisk) => {
    setSelected(risk);
    setEdit({
      status: risk.status,
      probability: String(risk.probability),
      impact: String(risk.impact),
      ownerEmail: risk.ownerEmail ?? "",
      targetDate: risk.targetDate ?? "",
      mitigation: risk.mitigation,
      reason: "",
    });
  };

  const projectById = useMemo(
    () => new Map(data.projects.map((project) => [project.id, project])),
    [data.projects],
  );
  const visible = data.risks
    .filter((risk) => {
      if (filter === "active" && risk.status === "closed") return false;
      if (filter === "high" && risk.probability * risk.impact < 15) return false;
      if (filter !== "all" && filter !== "active" && filter !== "high" && risk.status !== filter)
        return false;
      return `${risk.title} ${risk.projectName} ${risk.ownerEmail ?? ""}`
        .toLowerCase()
        .includes(query.toLowerCase());
    })
    .sort((a, b) => b.probability * b.impact - a.probability * a.impact);

  const createRisk = async () => {
    if (!draft.projectId || !draft.title.trim()) return;
    setWorking(true);
    const ok = await command({
      action: "createRisk",
      ...draft,
      projectId: Number(draft.projectId),
      probability: Number(draft.probability),
      impact: Number(draft.impact),
    });
    setWorking(false);
    if (!ok) return;
    setCreateOpen(false);
    setDraft({
      projectId: "",
      title: "",
      description: "",
      probability: "3",
      impact: "3",
      ownerEmail: "",
      targetDate: "",
      mitigation: "",
    });
    notify("Risk registered with ownership and audit evidence");
  };

  const updateRisk = async () => {
    if (!selected || edit.reason.trim().length < 4) return;
    setWorking(true);
    const ok = await command({
      action: "updateRisk",
      projectId: selected.projectId,
      riskId: selected.id,
      version: selected.version,
      ...edit,
      probability: Number(edit.probability),
      impact: Number(edit.impact),
    });
    setWorking(false);
    if (!ok) return;
    setSelected(null);
    notify("Risk control updated and revision recorded");
  };

  return (
    <section className="governance-workspace">
      <section className="governance-hero risk-hero">
        <div>
          <span className="governance-live"><i /> Portfolio risk control active</span>
          <h2>Turn uncertainty into owned, time-bound action.</h2>
          <p>Exposure, mitigation, ownership, and every change are enforced per project.</p>
        </div>
        <button
          className="primary"
          disabled={!data.projects.some((project) => project.canEdit)}
          onClick={() => setCreateOpen(true)}
        >
          + Register risk
        </button>
      </section>
      <section className="governance-metrics">
        <article><span>Open exposure</span><strong>{data.metrics.openRisks}</strong><small>Across accessible projects</small></article>
        <article><span>High severity</span><strong className="coral-text">{data.metrics.highRisks}</strong><small>Score 15 or greater</small></article>
        <article><span>Due this week</span><strong>{data.metrics.dueRisks}</strong><small>Needs an owner response</small></article>
        <article><span>Mitigation coverage</span><strong className="positive">{data.metrics.mitigationCoverage}%</strong><small>Risks with active controls</small></article>
      </section>
      <section className="risk-command-grid">
        <article className="panel governed-heatmap">
          <div className="panel-head">
            <div><span className="section-kicker">Live exposure</span><h2>Probability-impact matrix</h2></div>
            <span className="policy-chip">Project isolated</span>
          </div>
          <div className="governed-matrix">
            <span className="matrix-y">Impact</span>
            {[5, 4, 3, 2, 1].map((impact) =>
              [1, 2, 3, 4, 5].map((probability) => {
                const count = data.risks.filter(
                  (risk) =>
                    risk.status !== "closed" &&
                    risk.impact === impact &&
                    risk.probability === probability,
                ).length;
                const score = impact * probability;
                return (
                  <button
                    className={`matrix-cell score-${score >= 15 ? "high" : score >= 8 ? "medium" : "low"}`}
                    key={`${impact}-${probability}`}
                    onClick={() => setFilter(score >= 15 ? "high" : "active")}
                    aria-label={`Impact ${impact}, probability ${probability}, ${count} risks`}
                  >
                    {count ? <strong>{count}</strong> : null}
                  </button>
                );
              }),
            )}
            <span className="matrix-x">Probability</span>
          </div>
        </article>
        <article className="panel governed-register">
          <div className="panel-head">
            <div><span className="section-kicker">Controlled register</span><h2>Risk queue</h2></div>
            <span>{visible.length} records</span>
          </div>
          <div className="governance-toolbar">
            <label className="governance-search"><span>⌕</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search risk or owner" /></label>
            <select value={filter} onChange={(event) => setFilter(event.target.value)}>
              <option value="active">Active</option>
              <option value="high">High severity</option>
              <option value="open">Open</option>
              <option value="mitigating">Mitigating</option>
              <option value="accepted">Accepted</option>
              <option value="closed">Closed</option>
              <option value="all">All risks</option>
            </select>
          </div>
          <div className="governed-risk-list">
            {visible.map((risk) => {
              const score = risk.probability * risk.impact;
              return (
                <button key={risk.id} onClick={() => openRisk(risk)}>
                  <span className={`exposure-score ${score >= 15 ? "high" : score >= 8 ? "medium" : "low"}`}>{score}</span>
                  <span><strong>{risk.title}</strong><small>{risk.projectName} · {statusLabel(risk.status)}</small></span>
                  <i>{personInitials(risk.ownerEmail)}</i>
                  <time>{shortDate(risk.targetDate)}</time>
                  <b>›</b>
                </button>
              );
            })}
            {!visible.length && <div className="governance-empty"><strong>No risks in this view</strong><span>Adjust the filter or register the first controlled risk.</span></div>}
          </div>
        </article>
      </section>
      <ChangeLedger logs={data.logs.filter((log) => log.entityType === "risk" || log.entityType === "project")} />

      {createOpen && (
        <div className="enterprise-backdrop" onMouseDown={() => !working && setCreateOpen(false)}>
          <section className="enterprise-modal governance-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
            <button className="enterprise-close" onClick={() => setCreateOpen(false)}>×</button>
            <span className="enterprise-kicker">Controlled risk command</span>
            <h2>Register portfolio risk</h2>
            <p>Ownership, exposure, mitigation, and change evidence will be stored against the selected project.</p>
            <label>Project<select value={draft.projectId} onChange={(event) => setDraft({ ...draft, projectId: event.target.value })}><option value="">Choose project</option>{data.projects.filter((project) => project.canEdit).map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>
            <label>Risk title<input autoFocus value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="Describe the uncertain event" /></label>
            <div className="enterprise-form-grid">
              <label>Probability<select value={draft.probability} onChange={(event) => setDraft({ ...draft, probability: event.target.value })}>{[1,2,3,4,5].map((value) => <option key={value}>{value}</option>)}</select></label>
              <label>Impact<select value={draft.impact} onChange={(event) => setDraft({ ...draft, impact: event.target.value })}>{[1,2,3,4,5].map((value) => <option key={value}>{value}</option>)}</select></label>
              <label>Owner<select value={draft.ownerEmail} onChange={(event) => setDraft({ ...draft, ownerEmail: event.target.value })}><option value="">Unassigned</option>{data.members.map((member) => <option key={member.email} value={member.email}>{member.displayName}</option>)}</select></label>
              <label>Target date<input type="date" value={draft.targetDate} onChange={(event) => setDraft({ ...draft, targetDate: event.target.value })} /></label>
            </div>
            <label>Description<textarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} placeholder="Cause, event, and expected consequence" /></label>
            <label>Mitigation plan<textarea value={draft.mitigation} onChange={(event) => setDraft({ ...draft, mitigation: event.target.value })} placeholder="Preventive action, fallback, or acceptance criteria" /></label>
            <div className="enterprise-safety"><strong>Server-governed record</strong><span>Project access, owner validity, rate limits, notifications, and audit evidence are checked before creation.</span></div>
            <div className="enterprise-modal-actions"><button onClick={() => setCreateOpen(false)}>Cancel</button><button className="enterprise-primary" disabled={working || !draft.projectId || !draft.title.trim()} onClick={createRisk}>{working ? "Registering…" : "Register risk"}</button></div>
          </section>
        </div>
      )}

      {selected && (
        <div className="detail-backdrop" onMouseDown={() => !working && setSelected(null)}>
          <aside className="project-detail governance-detail" onMouseDown={(event) => event.stopPropagation()}>
            <div className="detail-hero">
              <button className="detail-close" onClick={() => setSelected(null)}>×</button>
              <span className={`exposure-pill ${selected.probability * selected.impact >= 15 ? "high" : "medium"}`}>Exposure {selected.probability * selected.impact}</span>
              <h2>{selected.title}</h2>
              <p>{selected.projectName} · Version {selected.version}</p>
            </div>
            <div className="detail-body governance-editor">
              <div className="governance-editor-grid">
                <label>Status<select value={edit.status} onChange={(event) => setEdit({ ...edit, status: event.target.value })}>{["open","mitigating","accepted","closed"].map((value) => <option value={value} key={value}>{statusLabel(value)}</option>)}</select></label>
                <label>Owner<select value={edit.ownerEmail} onChange={(event) => setEdit({ ...edit, ownerEmail: event.target.value })}><option value="">Unassigned</option>{data.members.map((member) => <option key={member.email} value={member.email}>{member.displayName}</option>)}</select></label>
                <label>Probability<select value={edit.probability} onChange={(event) => setEdit({ ...edit, probability: event.target.value })}>{[1,2,3,4,5].map((value) => <option key={value}>{value}</option>)}</select></label>
                <label>Impact<select value={edit.impact} onChange={(event) => setEdit({ ...edit, impact: event.target.value })}>{[1,2,3,4,5].map((value) => <option key={value}>{value}</option>)}</select></label>
                <label>Target date<input type="date" value={edit.targetDate} onChange={(event) => setEdit({ ...edit, targetDate: event.target.value })} /></label>
              </div>
              <label>Mitigation plan<textarea value={edit.mitigation} onChange={(event) => setEdit({ ...edit, mitigation: event.target.value })} placeholder="Document the active control" /></label>
              <label>Reason for change<textarea value={edit.reason} onChange={(event) => setEdit({ ...edit, reason: event.target.value })} placeholder="Required for the revision log" /></label>
              <div className="policy-note"><span><strong>Optimistic conflict protection</strong><small>If another manager changes this risk first, your save is rejected until you review the latest version.</small></span></div>
            </div>
            <div className="detail-footer"><button onClick={() => setSelected(null)}>Cancel</button><button className="primary" disabled={working || !projectById.get(selected.projectId)?.canEdit || edit.reason.trim().length < 4} onClick={updateRisk}>{working ? "Saving…" : "Save controlled change"}</button></div>
          </aside>
        </div>
      )}
    </section>
  );
}

function CalendarGovernance({
  data,
  command,
  notify,
}: {
  data: GovernanceData;
  command: GovernanceCommand;
  notify: (message: string) => void;
}) {
  const [month, setMonth] = useState(() => {
    const now = new Date();
    return new Date(now.getFullYear(), now.getMonth(), 1);
  });
  const [view, setView] = useState<"month" | "agenda">("month");
  const [createOpen, setCreateOpen] = useState(false);
  const [selected, setSelected] = useState<GovernanceMilestone | null>(null);
  const [working, setWorking] = useState(false);
  const [draft, setDraft] = useState({
    projectId: "",
    title: "",
    description: "",
    dueDate: "",
    ownerEmail: "",
  });
  const [edit, setEdit] = useState({
    status: "planned",
    dueDate: "",
    ownerEmail: "",
    reason: "",
  });

  const openMilestone = (milestone: GovernanceMilestone) => {
    setSelected(milestone);
    setEdit({
      status: milestone.status,
      dueDate: milestone.dueDate,
      ownerEmail: milestone.ownerEmail ?? "",
      reason: "",
    });
  };

  const monthKey = `${month.getFullYear()}-${String(month.getMonth() + 1).padStart(2, "0")}`;
  const firstOffset = (month.getDay() + 6) % 7;
  const days = Array.from({ length: 42 }, (_, index) => {
    const date = new Date(month.getFullYear(), month.getMonth(), index - firstOffset + 1);
    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
    return { date, iso, current: date.getMonth() === month.getMonth() };
  });
  const upcoming = [...data.milestones]
    .filter((milestone) => milestone.status !== "completed")
    .sort((a, b) => a.dueDate.localeCompare(b.dueDate));

  const createMilestone = async () => {
    if (!draft.projectId || !draft.title.trim() || !draft.dueDate) return;
    setWorking(true);
    const ok = await command({
      action: "createMilestone",
      ...draft,
      projectId: Number(draft.projectId),
    });
    setWorking(false);
    if (!ok) return;
    setCreateOpen(false);
    setDraft({ projectId: "", title: "", description: "", dueDate: "", ownerEmail: "" });
    notify("Milestone scheduled and project timeline updated");
  };

  const updateMilestone = async () => {
    if (!selected || edit.reason.trim().length < 4) return;
    setWorking(true);
    const ok = await command({
      action: "updateMilestone",
      projectId: selected.projectId,
      milestoneId: selected.id,
      version: selected.version,
      ...edit,
    });
    setWorking(false);
    if (!ok) return;
    setSelected(null);
    notify("Milestone updated with revision evidence");
  };

  return (
    <section className="governance-workspace">
      <section className="calendar-command">
        <div>
          <span className="governance-live"><i /> Controlled delivery timeline</span>
          <h2>{month.toLocaleDateString(undefined, { month: "long", year: "numeric" })}</h2>
          <p>{data.metrics.upcomingMilestones} due this week · {data.metrics.blockedMilestones} blocked</p>
        </div>
        <div className="calendar-command-actions">
          <div><button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() - 1, 1))}>‹</button><button onClick={() => setMonth(new Date())}>Today</button><button onClick={() => setMonth(new Date(month.getFullYear(), month.getMonth() + 1, 1))}>›</button></div>
          <div className="filter-tabs"><button className={view === "month" ? "selected" : ""} onClick={() => setView("month")}>Month</button><button className={view === "agenda" ? "selected" : ""} onClick={() => setView("agenda")}>Agenda</button></div>
          <button className="primary" disabled={!data.projects.some((project) => project.canEdit)} onClick={() => setCreateOpen(true)}>+ Add milestone</button>
        </div>
      </section>
      <section className="governance-metrics calendar-metrics">
        <article><span>Milestones</span><strong>{data.milestones.length}</strong><small>Across accessible projects</small></article>
        <article><span>Due this week</span><strong>{data.metrics.upcomingMilestones}</strong><small>Requires delivery confirmation</small></article>
        <article><span>Blocked</span><strong className="coral-text">{data.metrics.blockedMilestones}</strong><small>Escalation candidates</small></article>
        <article><span>Timeline policy</span><strong className="positive">Enforced</strong><small>Owners and revisions verified</small></article>
      </section>
      {view === "month" ? (
        <section className="panel governed-calendar">
          <div className="governed-calendar-head">{["Mon","Tue","Wed","Thu","Fri","Sat","Sun"].map((day) => <span key={day}>{day}</span>)}</div>
          <div className="governed-calendar-grid">
            {days.map((day) => {
              const events = data.milestones.filter((milestone) => milestone.dueDate === day.iso);
              const today = day.iso === new Date().toISOString().slice(0, 10);
              return (
                <div className={`${day.current ? "" : "outside"} ${today ? "today" : ""}`} key={day.iso}>
                  <time>{day.date.getDate()}</time>
                  {events.slice(0, 3).map((milestone) => (
                    <button className={`milestone-event ${milestone.status}`} key={milestone.id} onClick={() => openMilestone(milestone)}>
                      <i /> <span>{milestone.title}</span>
                    </button>
                  ))}
                  {events.length > 3 && <small>+{events.length - 3} more</small>}
                </div>
              );
            })}
          </div>
        </section>
      ) : (
        <section className="agenda-layout">
          <article className="panel agenda-list">
            <div className="panel-head"><div><span className="section-kicker">Delivery agenda</span><h2>Upcoming milestones</h2></div><span>{monthKey}</span></div>
            {upcoming.map((milestone) => (
              <button key={milestone.id} onClick={() => openMilestone(milestone)}>
                <time><strong>{new Date(`${milestone.dueDate}T00:00:00`).getDate()}</strong><span>{new Date(`${milestone.dueDate}T00:00:00`).toLocaleDateString(undefined, { month: "short" })}</span></time>
                <i className={milestone.status} />
                <span><strong>{milestone.title}</strong><small>{milestone.projectName} · {milestone.ownerEmail ?? "Unassigned"}</small></span>
                <em>{statusLabel(milestone.status)}</em>
                <b>›</b>
              </button>
            ))}
            {!upcoming.length && <div className="governance-empty"><strong>No upcoming milestones</strong><span>Create the first governed delivery date.</span></div>}
          </article>
          <ChangeLedger logs={data.logs.filter((log) => log.entityType === "milestone")} />
        </section>
      )}

      {view === "month" && <ChangeLedger logs={data.logs.filter((log) => log.entityType === "milestone")} />}

      {createOpen && (
        <div className="enterprise-backdrop" onMouseDown={() => !working && setCreateOpen(false)}>
          <section className="enterprise-modal governance-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
            <button className="enterprise-close" onClick={() => setCreateOpen(false)}>×</button>
            <span className="enterprise-kicker">Controlled timeline command</span>
            <h2>Schedule milestone</h2>
            <p>The milestone is stored against a project with an accountable owner, notification, and revision history.</p>
            <label>Project<select value={draft.projectId} onChange={(event) => setDraft({ ...draft, projectId: event.target.value })}><option value="">Choose project</option>{data.projects.filter((project) => project.canEdit).map((project) => <option key={project.id} value={project.id}>{project.name}</option>)}</select></label>
            <label>Milestone title<input autoFocus value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="Define the delivery outcome" /></label>
            <div className="enterprise-form-grid">
              <label>Due date<input type="date" value={draft.dueDate} onChange={(event) => setDraft({ ...draft, dueDate: event.target.value })} /></label>
              <label>Owner<select value={draft.ownerEmail} onChange={(event) => setDraft({ ...draft, ownerEmail: event.target.value })}><option value="">Unassigned</option>{data.members.map((member) => <option key={member.email} value={member.email}>{member.displayName}</option>)}</select></label>
            </div>
            <label>Description<textarea value={draft.description} onChange={(event) => setDraft({ ...draft, description: event.target.value })} placeholder="Acceptance criteria, dependencies, or required evidence" /></label>
            <div className="enterprise-safety"><strong>Timeline integrity</strong><span>Project access and owner validity are checked before this delivery date is accepted.</span></div>
            <div className="enterprise-modal-actions"><button onClick={() => setCreateOpen(false)}>Cancel</button><button className="enterprise-primary" disabled={working || !draft.projectId || !draft.title.trim() || !draft.dueDate} onClick={createMilestone}>{working ? "Scheduling…" : "Schedule milestone"}</button></div>
          </section>
        </div>
      )}

      {selected && (
        <div className="detail-backdrop" onMouseDown={() => !working && setSelected(null)}>
          <aside className="project-detail governance-detail" onMouseDown={(event) => event.stopPropagation()}>
            <div className="detail-hero">
              <button className="detail-close" onClick={() => setSelected(null)}>×</button>
              <span className={`milestone-status ${selected.status}`}>{statusLabel(selected.status)}</span>
              <h2>{selected.title}</h2>
              <p>{selected.projectName} · Due {shortDate(selected.dueDate)}</p>
            </div>
            <div className="detail-body governance-editor">
              <label>Status<select value={edit.status} onChange={(event) => setEdit({ ...edit, status: event.target.value })}>{["planned","in_progress","blocked","completed"].map((value) => <option value={value} key={value}>{statusLabel(value)}</option>)}</select></label>
              <label>Due date<input type="date" value={edit.dueDate} onChange={(event) => setEdit({ ...edit, dueDate: event.target.value })} /></label>
              <label>Owner<select value={edit.ownerEmail} onChange={(event) => setEdit({ ...edit, ownerEmail: event.target.value })}><option value="">Unassigned</option>{data.members.map((member) => <option key={member.email} value={member.email}>{member.displayName}</option>)}</select></label>
              <label>Reason for change<textarea value={edit.reason} onChange={(event) => setEdit({ ...edit, reason: event.target.value })} placeholder="Required for the revision log" /></label>
              <div className="policy-note"><span><strong>Accountable delivery</strong><small>Blocked milestones notify their owner and become visible in the portfolio exception metrics.</small></span></div>
            </div>
            <div className="detail-footer"><button onClick={() => setSelected(null)}>Cancel</button><button className="primary" disabled={working || edit.reason.trim().length < 4} onClick={updateMilestone}>{working ? "Saving…" : "Save milestone change"}</button></div>
          </aside>
        </div>
      )}
    </section>
  );
}

export function GovernanceControl({
  mode,
  data,
  command,
  notify,
}: {
  mode: "Risks" | "Calendar";
  data: GovernanceData;
  command: GovernanceCommand;
  notify: (message: string) => void;
}) {
  return mode === "Risks" ? (
    <RiskGovernance data={data} command={command} notify={notify} />
  ) : (
    <CalendarGovernance data={data} command={command} notify={notify} />
  );
}

export function DeliveryStatusEditor({
  project,
  command,
  onClose,
  onSaved,
}: {
  project: GovernanceProject;
  command: GovernanceCommand;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [working, setWorking] = useState(false);
  const [draft, setDraft] = useState({
    health: project.health,
    progress: String(project.progress),
    due: project.due,
    reason: "",
  });
  const save = async () => {
    if (draft.reason.trim().length < 4) return;
    setWorking(true);
    const ok = await command({
      action: "updateProjectStatus",
      projectId: project.id,
      version: project.version,
      health: draft.health,
      progress: Number(draft.progress),
      due: draft.due,
      reason: draft.reason,
    });
    setWorking(false);
    if (ok) onSaved();
  };
  return (
    <div className="enterprise-backdrop" onMouseDown={() => !working && onClose()}>
      <section className="enterprise-modal governance-modal" role="dialog" aria-modal="true" onMouseDown={(event) => event.stopPropagation()}>
        <button className="enterprise-close" onClick={onClose}>×</button>
        <span className="enterprise-kicker">Project command</span>
        <h2>Update delivery status</h2>
        <p>{project.name} · Version {project.version}. Every change is written to the portfolio ledger.</p>
        <div className="enterprise-form-grid">
          <label>Health<select value={draft.health} onChange={(event) => setDraft({ ...draft, health: event.target.value })}>{["On track","At risk","Delayed","Completed"].map((value) => <option key={value}>{value}</option>)}</select></label>
          <label>Progress<input type="number" min="0" max="100" value={draft.progress} onChange={(event) => setDraft({ ...draft, progress: event.target.value })} /></label>
        </div>
        <label>Due date or target<input value={draft.due} onChange={(event) => setDraft({ ...draft, due: event.target.value })} placeholder="2026-09-18 or Sep 18" /></label>
        <label>Reason for change<textarea value={draft.reason} onChange={(event) => setDraft({ ...draft, reason: event.target.value })} placeholder="Required for the project status log" /></label>
        <div className="enterprise-safety"><strong>Conflict protected</strong><span>A stale edit is rejected if another manager updates the project first.</span></div>
        <div className="enterprise-modal-actions"><button onClick={onClose}>Cancel</button><button className="enterprise-primary" disabled={working || draft.reason.trim().length < 4 || Number(draft.progress) < 0 || Number(draft.progress) > 100} onClick={save}>{working ? "Saving…" : "Save and log change"}</button></div>
      </section>
    </div>
  );
}
