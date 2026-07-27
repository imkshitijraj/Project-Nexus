"use client";

import { useMemo, useState } from "react";
import type { CSSProperties } from "react";

export type ReliabilityProject = {
  id: number;
  name: string;
  canEdit: boolean;
  canApprove: boolean;
};

export type ReliabilityService = {
  id: number;
  projectId: number;
  projectName: string;
  name: string;
  tier: string;
  status: string;
  ownerEmail: string | null;
  availabilityTargetBps: number;
  currentAvailabilityBps: number;
  rtoMinutes: number;
  rpoMinutes: number;
  version: number;
  updatedAt: string;
  canEdit: boolean;
  canApprove: boolean;
};

export type ReliabilityIncident = {
  id: number;
  serviceId: number;
  serviceName: string;
  projectId: number;
  projectName: string;
  title: string;
  severity: string;
  status: string;
  commanderEmail: string | null;
  impact: string;
  summary: string;
  startedAt: string;
  resolvedAt: string | null;
  version: number;
  createdBy: string;
  updatedBy: string;
  updatedAt: string;
};

export type ReliabilityChange = {
  id: number;
  serviceId: number;
  serviceName: string;
  projectId: number;
  projectName: string;
  title: string;
  riskLevel: string;
  status: string;
  ownerEmail: string | null;
  windowStart: string;
  windowEnd: string;
  implementationPlan: string;
  rollbackPlan: string;
  decisionReason: string;
  decidedBy: string | null;
  decidedAt: string | null;
  version: number;
  createdBy: string;
  updatedAt: string;
};

export type RecoveryRunbook = {
  id: number;
  serviceId: number;
  serviceName: string;
  projectId: number;
  projectName: string;
  title: string;
  status: string;
  ownerEmail: string | null;
  trigger: string;
  steps: string[];
  lastTestedAt: string | null;
  nextReviewDate: string | null;
  version: number;
  updatedAt: string;
};

export type ReliabilityEvent = {
  id: number;
  projectId: number;
  projectName: string;
  serviceId: number | null;
  actorEmail: string;
  action: string;
  targetType: string;
  targetId: number | null;
  detail: string;
  risk: string;
  createdAt: string;
};

export type ReliabilityData = {
  projects: ReliabilityProject[];
  services: ReliabilityService[];
  incidents: ReliabilityIncident[];
  changes: ReliabilityChange[];
  runbooks: RecoveryRunbook[];
  events: ReliabilityEvent[];
  members: Array<{ email: string; displayName: string; role: string }>;
  metrics: {
    averageAvailability: number;
    activeIncidents: number;
    criticalIncidents: number;
    pendingChanges: number;
    recoveryCoverage: number;
  };
};

export const emptyReliability: ReliabilityData = {
  projects: [],
  services: [],
  incidents: [],
  changes: [],
  runbooks: [],
  events: [],
  members: [],
  metrics: {
    averageAvailability: 100,
    activeIncidents: 0,
    criticalIncidents: 0,
    pendingChanges: 0,
    recoveryCoverage: 100,
  },
};

type ReliabilityCommand = (payload: Record<string, unknown>) => Promise<boolean>;

const human = (value: string) =>
  value.replaceAll("_", " ").replace(/^\w/, (letter) => letter.toUpperCase());

const shortDateTime = (value: string) =>
  new Date(value).toLocaleString(undefined, {
    month: "short",
    day: "numeric",
    hour: "numeric",
    minute: "2-digit",
  });

const toLocalInput = (date = new Date()) => {
  const shifted = new Date(date.getTime() - date.getTimezoneOffset() * 60_000);
  return shifted.toISOString().slice(0, 16);
};

function Metric({
  label,
  value,
  detail,
  tone = "",
}: {
  label: string;
  value: string | number;
  detail: string;
  tone?: string;
}) {
  return (
    <article>
      <span>{label}</span>
      <strong className={tone}>{value}</strong>
      <small>{detail}</small>
    </article>
  );
}

function ReliabilityLedger({ events }: { events: ReliabilityEvent[] }) {
  const [query, setQuery] = useState("");
  const visible = events.filter((event) =>
    `${event.projectName} ${event.action} ${event.actorEmail} ${event.detail}`
      .toLowerCase()
      .includes(query.toLowerCase()),
  );
  return (
    <section className="panel reliability-ledger">
      <div className="panel-head">
        <div>
          <span className="section-kicker">Operational evidence</span>
          <h2>Reliability event ledger</h2>
        </div>
        <label className="reliability-search">
          <span>⌕</span>
          <input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Filter operational history"
          />
        </label>
      </div>
      <div className="reliability-event-list">
        {visible.slice(0, 14).map((event) => (
          <article key={event.id}>
            <i className={event.risk} />
            <div>
              <strong>{event.action.replaceAll(".", " → ")}</strong>
              <p>{event.detail}</p>
              <small>
                {event.projectName} · {event.actorEmail}
              </small>
            </div>
            <time>{shortDateTime(event.createdAt)}</time>
          </article>
        ))}
        {!visible.length && (
          <div className="reliability-empty compact">
            <strong>No reliability events yet</strong>
            <span>Controlled service, incident, change, and recovery actions will appear here.</span>
          </div>
        )}
      </div>
    </section>
  );
}

export function ReliabilityControl({
  data,
  command,
  notify,
}: {
  data: ReliabilityData;
  command: ReliabilityCommand;
  notify: (message: string) => void;
}) {
  const [tab, setTab] = useState("Overview");
  const [working, setWorking] = useState("");
  const [serviceOpen, setServiceOpen] = useState(false);
  const [incidentOpen, setIncidentOpen] = useState(false);
  const [changeOpen, setChangeOpen] = useState(false);
  const [runbookOpen, setRunbookOpen] = useState(false);
  const [selectedService, setSelectedService] = useState<ReliabilityService | null>(null);
  const [selectedIncident, setSelectedIncident] = useState<ReliabilityIncident | null>(null);
  const [selectedChange, setSelectedChange] = useState<ReliabilityChange | null>(null);
  const [drillRunbook, setDrillRunbook] = useState<RecoveryRunbook | null>(null);
  const [decision, setDecision] = useState("approved");
  const [decisionReason, setDecisionReason] = useState("");
  const [serviceStatus, setServiceStatus] = useState("operational");
  const [serviceReason, setServiceReason] = useState("");
  const [incidentEdit, setIncidentEdit] = useState({
    status: "investigating",
    commanderEmail: "",
    summary: "",
    reason: "",
  });
  const [drillReason, setDrillReason] = useState("");

  const [serviceDraft, setServiceDraft] = useState({
    projectId: "",
    name: "",
    tier: "tier_2",
    ownerEmail: "",
    availability: "99.90",
    rtoMinutes: "60",
    rpoMinutes: "15",
  });
  const [incidentDraft, setIncidentDraft] = useState({
    serviceId: "",
    title: "",
    severity: "sev_2",
    commanderEmail: "",
    impact: "",
    startedAt: toLocalInput(),
  });
  const [changeDraft, setChangeDraft] = useState({
    serviceId: "",
    title: "",
    riskLevel: "medium",
    ownerEmail: "",
    windowStart: "",
    windowEnd: "",
    implementationPlan: "",
    rollbackPlan: "",
  });
  const [runbookDraft, setRunbookDraft] = useState({
    serviceId: "",
    title: "",
    ownerEmail: "",
    trigger: "",
    steps: "",
    nextReviewDate: "",
  });

  const editableProjects = data.projects.filter((project) => project.canEdit);
  const editableServices = data.services.filter((service) => service.canEdit);
  const servicesById = useMemo(
    () => new Map(data.services.map((service) => [service.id, service])),
    [data.services],
  );
  const activeIncidents = data.incidents.filter((incident) => incident.status !== "resolved");

  const run = async (
    key: string,
    payload: Record<string, unknown>,
    successMessage: string,
  ) => {
    setWorking(key);
    const ok = await command(payload);
    setWorking("");
    if (ok) notify(successMessage);
    return ok;
  };

  const openChangeModal = () => {
    const now = Date.now();
    setChangeDraft((current) => ({
      ...current,
      windowStart: toLocalInput(new Date(now + 86_400_000)),
      windowEnd: toLocalInput(new Date(now + 88_200_000)),
    }));
    setChangeOpen(true);
  };

  const createService = async () => {
    const availabilityTargetBps = Math.round(Number(serviceDraft.availability) * 100);
    if (!serviceDraft.projectId || !serviceDraft.name.trim()) return;
    const ok = await run(
      "service",
      {
        action: "createService",
        projectId: Number(serviceDraft.projectId),
        name: serviceDraft.name,
        tier: serviceDraft.tier,
        ownerEmail: serviceDraft.ownerEmail || null,
        availabilityTargetBps,
        rtoMinutes: Number(serviceDraft.rtoMinutes),
        rpoMinutes: Number(serviceDraft.rpoMinutes),
      },
      "Service registered with recovery objectives",
    );
    if (ok) {
      setServiceOpen(false);
      setServiceDraft({
        projectId: "",
        name: "",
        tier: "tier_2",
        ownerEmail: "",
        availability: "99.90",
        rtoMinutes: "60",
        rpoMinutes: "15",
      });
    }
  };

  const declareIncident = async () => {
    if (!incidentDraft.serviceId || !incidentDraft.title.trim() || !incidentDraft.impact.trim())
      return;
    const ok = await run(
      "incident",
      {
        action: "declareIncident",
        ...incidentDraft,
        serviceId: Number(incidentDraft.serviceId),
      },
      "Incident declared and command routing activated",
    );
    if (ok) {
      setIncidentOpen(false);
      setIncidentDraft({
        serviceId: "",
        title: "",
        severity: "sev_2",
        commanderEmail: "",
        impact: "",
        startedAt: toLocalInput(),
      });
      setTab("Incidents");
    }
  };

  const scheduleChange = async () => {
    if (
      !changeDraft.serviceId ||
      !changeDraft.title.trim() ||
      changeDraft.implementationPlan.trim().length < 10 ||
      changeDraft.rollbackPlan.trim().length < 10
    )
      return;
    const ok = await run(
      "change",
      {
        action: "createChange",
        ...changeDraft,
        serviceId: Number(changeDraft.serviceId),
      },
      "Change submitted to the approval gate",
    );
    if (ok) {
      setChangeOpen(false);
      setChangeDraft({
        serviceId: "",
        title: "",
        riskLevel: "medium",
        ownerEmail: "",
        windowStart: "",
        windowEnd: "",
        implementationPlan: "",
        rollbackPlan: "",
      });
      setTab("Changes");
    }
  };

  const createRunbook = async () => {
    if (
      !runbookDraft.serviceId ||
      !runbookDraft.title.trim() ||
      runbookDraft.steps.split(/\r?\n/).filter(Boolean).length < 2
    )
      return;
    const ok = await run(
      "runbook",
      {
        action: "createRunbook",
        ...runbookDraft,
        serviceId: Number(runbookDraft.serviceId),
      },
      "Recovery runbook stored and tracked",
    );
    if (ok) {
      setRunbookOpen(false);
      setRunbookDraft({
        serviceId: "",
        title: "",
        ownerEmail: "",
        trigger: "",
        steps: "",
        nextReviewDate: "",
      });
      setTab("Recovery");
    }
  };

  const openIncident = (incident: ReliabilityIncident) => {
    setSelectedIncident(incident);
    setIncidentEdit({
      status: incident.status,
      commanderEmail: incident.commanderEmail ?? "",
      summary: incident.summary,
      reason: "",
    });
  };

  const updateIncident = async () => {
    if (!selectedIncident || incidentEdit.reason.trim().length < 4) return;
    const ok = await run(
      "incident-update",
      {
        action: "updateIncident",
        incidentId: selectedIncident.id,
        version: selectedIncident.version,
        ...incidentEdit,
      },
      "Incident command update recorded",
    );
    if (ok) setSelectedIncident(null);
  };

  const decideChange = async () => {
    if (!selectedChange || decisionReason.trim().length < 4) return;
    const ok = await run(
      "decision",
      {
        action: "decideChange",
        changeId: selectedChange.id,
        version: selectedChange.version,
        decision,
        reason: decisionReason,
      },
      `Change ${decision} with evidence`,
    );
    if (ok) {
      setSelectedChange(null);
      setDecisionReason("");
    }
  };

  const updateService = async () => {
    if (!selectedService || serviceReason.trim().length < 4) return;
    const ok = await run(
      "service-status",
      {
        action: "updateServiceStatus",
        serviceId: selectedService.id,
        version: selectedService.version,
        status: serviceStatus,
        reason: serviceReason,
      },
      "Service status updated and logged",
    );
    if (ok) {
      setSelectedService(null);
      setServiceReason("");
    }
  };

  const recordDrill = async () => {
    if (!drillRunbook || drillReason.trim().length < 4) return;
    const ok = await run(
      "drill",
      {
        action: "recordRunbookTest",
        runbookId: drillRunbook.id,
        version: drillRunbook.version,
        reason: drillReason,
      },
      "Recovery drill recorded with a 90-day review cycle",
    );
    if (ok) {
      setDrillRunbook(null);
      setDrillReason("");
    }
  };

  return (
    <section className="reliability-workspace">
      <section className="reliability-hero">
        <div>
          <span className="reliability-live"><i /> Production control active</span>
          <h2>Protect service continuity from signal to recovery.</h2>
          <p>
            Service health, incident command, controlled change, and recovery evidence share
            one project-scoped operating model.
          </p>
        </div>
        <div className="reliability-hero-actions">
          <button
            disabled={!editableServices.length}
            onClick={() => setIncidentOpen(true)}
          >
            Declare incident
          </button>
          <button
            className="primary"
            disabled={!editableServices.length}
            onClick={openChangeModal}
          >
            Schedule change
          </button>
        </div>
      </section>

      <section className="reliability-metrics">
        <Metric
          label="Fleet availability"
          value={`${data.metrics.averageAvailability.toFixed(2)}%`}
          detail="Across registered services"
        />
        <Metric
          label="Active incidents"
          value={data.metrics.activeIncidents}
          detail={`${data.metrics.criticalIncidents} critical severity`}
          tone={data.metrics.criticalIncidents ? "coral-text" : ""}
        />
        <Metric
          label="Change approvals"
          value={data.metrics.pendingChanges}
          detail="Waiting for controlled decision"
        />
        <Metric
          label="Recovery coverage"
          value={`${data.metrics.recoveryCoverage}%`}
          detail="Services with a runbook"
          tone={data.metrics.recoveryCoverage < 80 ? "coral-text" : ""}
        />
      </section>

      <div className="reliability-tabs" role="tablist" aria-label="Reliability command views">
        {["Overview", "Incidents", "Changes", "Recovery"].map((item) => (
          <button
            key={item}
            className={tab === item ? "active" : ""}
            onClick={() => setTab(item)}
          >
            {item}
            {item === "Incidents" && activeIncidents.length > 0 && <em>{activeIncidents.length}</em>}
            {item === "Changes" && data.metrics.pendingChanges > 0 && (
              <em>{data.metrics.pendingChanges}</em>
            )}
          </button>
        ))}
      </div>

      {tab === "Overview" && (
        <>
          <section className="reliability-overview">
            <article className="panel service-catalog">
              <div className="panel-head">
                <div>
                  <span className="section-kicker">Live topology</span>
                  <h2>Service health</h2>
                </div>
                <button
                  className="outline-action"
                  disabled={!editableProjects.length}
                  onClick={() => setServiceOpen(true)}
                >
                  + Register service
                </button>
              </div>
              <div className="service-grid">
                {data.services.map((service) => {
                  const open = activeIncidents.filter(
                    (incident) => incident.serviceId === service.id,
                  ).length;
                  return (
                    <button
                      key={service.id}
                      className="service-card"
                      onClick={() => {
                        setSelectedService(service);
                        setServiceStatus(service.status);
                        setServiceReason("");
                      }}
                    >
                      <span className={`service-state ${service.status}`}>
                        <i />
                        {human(service.status)}
                      </span>
                      <strong>{service.name}</strong>
                      <small>{service.projectName}</small>
                      <div>
                        <span>
                          Availability
                          <b>{(service.currentAvailabilityBps / 100).toFixed(2)}%</b>
                        </span>
                        <span>
                          RTO
                          <b>{service.rtoMinutes}m</b>
                        </span>
                        <span>
                          Incidents
                          <b className={open ? "coral-text" : ""}>{open}</b>
                        </span>
                      </div>
                    </button>
                  );
                })}
                {!data.services.length && (
                  <div className="reliability-empty">
                    <span className="reliability-empty-mark">⌁</span>
                    <strong>Register the first operational service</strong>
                    <span>
                      Attach service health, recovery objectives, and ownership to a live project.
                    </span>
                    <button
                      className="primary"
                      disabled={!editableProjects.length}
                      onClick={() => setServiceOpen(true)}
                    >
                      Register service
                    </button>
                  </div>
                )}
              </div>
            </article>

            <aside className="panel reliability-posture">
              <span className="section-kicker">Control posture</span>
              <div
                className="reliability-ring"
                style={{ "--recovery": `${data.metrics.recoveryCoverage}%` } as CSSProperties}
              >
                <div>
                  <strong>{data.metrics.recoveryCoverage}</strong>
                  <span>/100</span>
                </div>
              </div>
              <h2>Recovery readiness</h2>
              <p>
                Coverage combines runbook presence, service objectives, current incidents, and
                pending change exposure.
              </p>
              <ul>
                <li className={data.services.length ? "pass" : "warn"}>
                  <i />
                  <span>
                    <strong>Service catalog</strong>
                    <small>{data.services.length} governed services</small>
                  </span>
                </li>
                <li className={data.metrics.recoveryCoverage === 100 ? "pass" : "warn"}>
                  <i />
                  <span>
                    <strong>Runbook coverage</strong>
                    <small>{data.metrics.recoveryCoverage}% protected</small>
                  </span>
                </li>
                <li className={data.metrics.criticalIncidents ? "critical" : "pass"}>
                  <i />
                  <span>
                    <strong>Critical exposure</strong>
                    <small>{data.metrics.criticalIncidents} open SEV-1/2 incidents</small>
                  </span>
                </li>
              </ul>
            </aside>
          </section>
          <ReliabilityLedger events={data.events} />
        </>
      )}

      {tab === "Incidents" && (
        <section className="panel incident-command">
          <div className="panel-head">
            <div>
              <span className="section-kicker">Major incident management</span>
              <h2>Incident command board</h2>
            </div>
            <button
              className="primary"
              disabled={!editableServices.length}
              onClick={() => setIncidentOpen(true)}
            >
              Declare incident
            </button>
          </div>
          <div className="incident-board">
            {["investigating", "identified", "monitoring", "resolved"].map((status) => (
              <section key={status}>
                <div className="incident-column-head">
                  <span>{human(status)}</span>
                  <em>{data.incidents.filter((incident) => incident.status === status).length}</em>
                </div>
                {data.incidents
                  .filter((incident) => incident.status === status)
                  .map((incident) => (
                    <button key={incident.id} onClick={() => openIncident(incident)}>
                      <span className={`severity ${incident.severity}`}>
                        {incident.severity.replace("_", "-").toUpperCase()}
                      </span>
                      <strong>{incident.title}</strong>
                      <small>
                        {incident.serviceName} · {incident.projectName}
                      </small>
                      <p>{incident.impact}</p>
                      <div>
                        <span>{incident.commanderEmail ?? "Commander unassigned"}</span>
                        <time>{shortDateTime(incident.startedAt)}</time>
                      </div>
                    </button>
                  ))}
                {!data.incidents.some((incident) => incident.status === status) && (
                  <div className="incident-empty">No incidents</div>
                )}
              </section>
            ))}
          </div>
        </section>
      )}

      {tab === "Changes" && (
        <section className="panel change-control">
          <div className="panel-head">
            <div>
              <span className="section-kicker">Release protection</span>
              <h2>Controlled change register</h2>
            </div>
            <button
              className="primary"
              disabled={!editableServices.length}
              onClick={openChangeModal}
            >
              Schedule change
            </button>
          </div>
          <div className="change-table">
            <div className="change-head">
              <span>Change</span>
              <span>Window</span>
              <span>Risk</span>
              <span>Owner</span>
              <span>Status</span>
              <span />
            </div>
            {data.changes.map((change) => {
              const service = servicesById.get(change.serviceId);
              return (
                <article key={change.id}>
                  <div>
                    <strong>{change.title}</strong>
                    <small>
                      {change.serviceName} · {change.projectName}
                    </small>
                  </div>
                  <time>
                    {shortDateTime(change.windowStart)}
                    <small>to {shortDateTime(change.windowEnd)}</small>
                  </time>
                  <span className={`change-risk ${change.riskLevel}`}>
                    {human(change.riskLevel)}
                  </span>
                  <span>{change.ownerEmail ?? "Unassigned"}</span>
                  <span className={`change-status ${change.status}`}>{human(change.status)}</span>
                  {change.status === "pending" && service?.canApprove ? (
                    <button
                      onClick={() => {
                        setSelectedChange(change);
                        setDecision("approved");
                        setDecisionReason("");
                      }}
                    >
                      Decide
                    </button>
                  ) : (
                    <button
                      onClick={() => {
                        setSelectedChange(change);
                        setDecision(change.status === "rejected" ? "rejected" : "approved");
                        setDecisionReason(change.decisionReason);
                      }}
                    >
                      View
                    </button>
                  )}
                </article>
              );
            })}
            {!data.changes.length && (
              <div className="reliability-empty compact">
                <strong>No controlled changes scheduled</strong>
                <span>Every release window will require a plan, rollback path, and decision.</span>
              </div>
            )}
          </div>
        </section>
      )}

      {tab === "Recovery" && (
        <section className="recovery-layout">
          <article className="panel runbook-register">
            <div className="panel-head">
              <div>
                <span className="section-kicker">Business continuity</span>
                <h2>Recovery runbooks</h2>
              </div>
              <button
                className="primary"
                disabled={!editableServices.length}
                onClick={() => setRunbookOpen(true)}
              >
                Create runbook
              </button>
            </div>
            <div className="runbook-grid">
              {data.runbooks.map((runbook) => (
                <article key={runbook.id}>
                  <div className="runbook-head">
                    <span className={`runbook-status ${runbook.status}`}>{human(runbook.status)}</span>
                    <em>{runbook.steps.length} steps</em>
                  </div>
                  <h3>{runbook.title}</h3>
                  <p>{runbook.trigger}</p>
                  <div className="runbook-meta">
                    <span>
                      <small>Service</small>
                      <strong>{runbook.serviceName}</strong>
                    </span>
                    <span>
                      <small>Last drill</small>
                      <strong>
                        {runbook.lastTestedAt ? shortDateTime(runbook.lastTestedAt) : "Not tested"}
                      </strong>
                    </span>
                  </div>
                  <button
                    disabled={!servicesById.get(runbook.serviceId)?.canEdit}
                    onClick={() => {
                      setDrillRunbook(runbook);
                      setDrillReason("");
                    }}
                  >
                    Record recovery drill
                  </button>
                </article>
              ))}
              {!data.runbooks.length && (
                <div className="reliability-empty">
                  <span className="reliability-empty-mark">↺</span>
                  <strong>No recovery runbooks yet</strong>
                  <span>Document triggers, ordered actions, ownership, and recurring drills.</span>
                  <button
                    className="primary"
                    disabled={!editableServices.length}
                    onClick={() => setRunbookOpen(true)}
                  >
                    Create runbook
                  </button>
                </div>
              )}
            </div>
          </article>
          <aside className="panel recovery-objectives">
            <span className="section-kicker">Recovery objectives</span>
            <h2>RTO / RPO commitments</h2>
            <div>
              {data.services.map((service) => (
                <article key={service.id}>
                  <span className={`objective-dot ${service.status}`} />
                  <div>
                    <strong>{service.name}</strong>
                    <small>{service.tier.replace("_", " ").toUpperCase()}</small>
                  </div>
                  <span>
                    <small>RTO</small>
                    <b>{service.rtoMinutes}m</b>
                  </span>
                  <span>
                    <small>RPO</small>
                    <b>{service.rpoMinutes}m</b>
                  </span>
                </article>
              ))}
            </div>
          </aside>
        </section>
      )}

      {serviceOpen && (
        <div className="modal-backdrop" onMouseDown={() => setServiceOpen(false)}>
          <section
            className="modal reliability-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="service-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <span className="section-kicker">Service catalog</span>
                <h2 id="service-title">Register operational service</h2>
              </div>
              <button onClick={() => setServiceOpen(false)}>×</button>
            </div>
            <p className="modal-copy">
              Recovery objectives and ownership become project-scoped control commitments.
            </p>
            <div className="modal-grid">
              <label>
                Project
                <select
                  value={serviceDraft.projectId}
                  onChange={(event) =>
                    setServiceDraft({ ...serviceDraft, projectId: event.target.value })
                  }
                >
                  <option value="">Choose project</option>
                  {editableProjects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Criticality
                <select
                  value={serviceDraft.tier}
                  onChange={(event) =>
                    setServiceDraft({ ...serviceDraft, tier: event.target.value })
                  }
                >
                  <option value="tier_1">Tier 1 · Mission critical</option>
                  <option value="tier_2">Tier 2 · Business critical</option>
                  <option value="tier_3">Tier 3 · Supporting</option>
                </select>
              </label>
            </div>
            <label>
              Service name
              <input
                autoFocus
                value={serviceDraft.name}
                onChange={(event) =>
                  setServiceDraft({ ...serviceDraft, name: event.target.value })
                }
                placeholder="Nexus API Gateway"
              />
            </label>
            <label>
              Service owner
              <select
                value={serviceDraft.ownerEmail}
                onChange={(event) =>
                  setServiceDraft({ ...serviceDraft, ownerEmail: event.target.value })
                }
              >
                <option value="">Unassigned</option>
                {data.members.map((member) => (
                  <option key={member.email} value={member.email}>
                    {member.displayName} · {member.email}
                  </option>
                ))}
              </select>
            </label>
            <div className="modal-grid three">
              <label>
                Availability target
                <input
                  type="number"
                  min="90"
                  max="100"
                  step=".01"
                  value={serviceDraft.availability}
                  onChange={(event) =>
                    setServiceDraft({ ...serviceDraft, availability: event.target.value })
                  }
                />
              </label>
              <label>
                RTO minutes
                <input
                  type="number"
                  min="1"
                  value={serviceDraft.rtoMinutes}
                  onChange={(event) =>
                    setServiceDraft({ ...serviceDraft, rtoMinutes: event.target.value })
                  }
                />
              </label>
              <label>
                RPO minutes
                <input
                  type="number"
                  min="0"
                  value={serviceDraft.rpoMinutes}
                  onChange={(event) =>
                    setServiceDraft({ ...serviceDraft, rpoMinutes: event.target.value })
                  }
                />
              </label>
            </div>
            <div className="reliability-safety">
              <span>✓</span>
              <div>
                <strong>Project isolation enforced</strong>
                <small>Only verified project members can operate this service.</small>
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={() => setServiceOpen(false)}>Cancel</button>
              <button
                className="primary"
                disabled={
                  !serviceDraft.projectId || !serviceDraft.name.trim() || working === "service"
                }
                onClick={createService}
              >
                {working === "service" ? "Registering…" : "Register service"}
              </button>
            </div>
          </section>
        </div>
      )}

      {incidentOpen && (
        <div className="modal-backdrop" onMouseDown={() => setIncidentOpen(false)}>
          <section
            className="modal reliability-modal incident-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="incident-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <span className="section-kicker">Incident command</span>
                <h2 id="incident-title">Declare production incident</h2>
              </div>
              <button onClick={() => setIncidentOpen(false)}>×</button>
            </div>
            <div className="modal-grid">
              <label>
                Service
                <select
                  value={incidentDraft.serviceId}
                  onChange={(event) =>
                    setIncidentDraft({ ...incidentDraft, serviceId: event.target.value })
                  }
                >
                  <option value="">Choose service</option>
                  {editableServices.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} · {service.projectName}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Severity
                <select
                  value={incidentDraft.severity}
                  onChange={(event) =>
                    setIncidentDraft({ ...incidentDraft, severity: event.target.value })
                  }
                >
                  <option value="sev_1">SEV-1 · Critical outage</option>
                  <option value="sev_2">SEV-2 · Major degradation</option>
                  <option value="sev_3">SEV-3 · Limited impact</option>
                  <option value="sev_4">SEV-4 · Minor issue</option>
                </select>
              </label>
            </div>
            <label>
              Incident title
              <input
                autoFocus
                value={incidentDraft.title}
                onChange={(event) =>
                  setIncidentDraft({ ...incidentDraft, title: event.target.value })
                }
                placeholder="Checkout requests failing in production"
              />
            </label>
            <div className="modal-grid">
              <label>
                Incident commander
                <select
                  value={incidentDraft.commanderEmail}
                  onChange={(event) =>
                    setIncidentDraft({ ...incidentDraft, commanderEmail: event.target.value })
                  }
                >
                  <option value="">Unassigned</option>
                  {data.members.map((member) => (
                    <option key={member.email} value={member.email}>
                      {member.displayName}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Detected at
                <input
                  type="datetime-local"
                  value={incidentDraft.startedAt}
                  onChange={(event) =>
                    setIncidentDraft({ ...incidentDraft, startedAt: event.target.value })
                  }
                />
              </label>
            </div>
            <label>
              Customer and business impact
              <textarea
                value={incidentDraft.impact}
                onChange={(event) =>
                  setIncidentDraft({ ...incidentDraft, impact: event.target.value })
                }
                placeholder="Describe who is affected, what is unavailable, and the current scope."
              />
            </label>
            <div className="reliability-safety critical">
              <span>!</span>
              <div>
                <strong>Immediate operational signal</strong>
                <small>
                  The service state, commander routing, project activity, and audit evidence update
                  together.
                </small>
              </div>
            </div>
            <div className="modal-actions">
              <button onClick={() => setIncidentOpen(false)}>Cancel</button>
              <button
                className="primary danger-command"
                disabled={
                  !incidentDraft.serviceId ||
                  !incidentDraft.title.trim() ||
                  !incidentDraft.impact.trim() ||
                  working === "incident"
                }
                onClick={declareIncident}
              >
                {working === "incident" ? "Declaring…" : "Declare incident"}
              </button>
            </div>
          </section>
        </div>
      )}

      {changeOpen && (
        <div className="modal-backdrop" onMouseDown={() => setChangeOpen(false)}>
          <section
            className="modal reliability-modal change-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="change-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <span className="section-kicker">Change protection</span>
                <h2 id="change-title">Schedule controlled change</h2>
              </div>
              <button onClick={() => setChangeOpen(false)}>×</button>
            </div>
            <div className="modal-grid">
              <label>
                Service
                <select
                  value={changeDraft.serviceId}
                  onChange={(event) =>
                    setChangeDraft({ ...changeDraft, serviceId: event.target.value })
                  }
                >
                  <option value="">Choose service</option>
                  {editableServices.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name} · {service.projectName}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Change risk
                <select
                  value={changeDraft.riskLevel}
                  onChange={(event) =>
                    setChangeDraft({ ...changeDraft, riskLevel: event.target.value })
                  }
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                  <option value="critical">Critical</option>
                </select>
              </label>
            </div>
            <label>
              Change title
              <input
                autoFocus
                value={changeDraft.title}
                onChange={(event) =>
                  setChangeDraft({ ...changeDraft, title: event.target.value })
                }
                placeholder="Deploy API rate-limit policy v2"
              />
            </label>
            <label>
              Change owner
              <select
                value={changeDraft.ownerEmail}
                onChange={(event) =>
                  setChangeDraft({ ...changeDraft, ownerEmail: event.target.value })
                }
              >
                <option value="">Unassigned</option>
                {data.members.map((member) => (
                  <option key={member.email} value={member.email}>
                    {member.displayName}
                  </option>
                ))}
              </select>
            </label>
            <div className="modal-grid">
              <label>
                Window start
                <input
                  type="datetime-local"
                  value={changeDraft.windowStart}
                  onChange={(event) =>
                    setChangeDraft({ ...changeDraft, windowStart: event.target.value })
                  }
                />
              </label>
              <label>
                Window end
                <input
                  type="datetime-local"
                  value={changeDraft.windowEnd}
                  onChange={(event) =>
                    setChangeDraft({ ...changeDraft, windowEnd: event.target.value })
                  }
                />
              </label>
            </div>
            <label>
              Implementation plan
              <textarea
                value={changeDraft.implementationPlan}
                onChange={(event) =>
                  setChangeDraft({ ...changeDraft, implementationPlan: event.target.value })
                }
                placeholder="Ordered implementation steps and validation criteria."
              />
            </label>
            <label>
              Rollback plan
              <textarea
                value={changeDraft.rollbackPlan}
                onChange={(event) =>
                  setChangeDraft({ ...changeDraft, rollbackPlan: event.target.value })
                }
                placeholder="Exact rollback trigger, steps, and recovery validation."
              />
            </label>
            <div className="modal-actions">
              <button onClick={() => setChangeOpen(false)}>Cancel</button>
              <button
                className="primary"
                disabled={
                  !changeDraft.serviceId ||
                  !changeDraft.title.trim() ||
                  changeDraft.implementationPlan.trim().length < 10 ||
                  changeDraft.rollbackPlan.trim().length < 10 ||
                  working === "change"
                }
                onClick={scheduleChange}
              >
                {working === "change" ? "Submitting…" : "Submit for approval"}
              </button>
            </div>
          </section>
        </div>
      )}

      {runbookOpen && (
        <div className="modal-backdrop" onMouseDown={() => setRunbookOpen(false)}>
          <section
            className="modal reliability-modal runbook-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="runbook-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <span className="section-kicker">Recovery control</span>
                <h2 id="runbook-title">Create recovery runbook</h2>
              </div>
              <button onClick={() => setRunbookOpen(false)}>×</button>
            </div>
            <div className="modal-grid">
              <label>
                Service
                <select
                  value={runbookDraft.serviceId}
                  onChange={(event) =>
                    setRunbookDraft({ ...runbookDraft, serviceId: event.target.value })
                  }
                >
                  <option value="">Choose service</option>
                  {editableServices.map((service) => (
                    <option key={service.id} value={service.id}>
                      {service.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                Owner
                <select
                  value={runbookDraft.ownerEmail}
                  onChange={(event) =>
                    setRunbookDraft({ ...runbookDraft, ownerEmail: event.target.value })
                  }
                >
                  <option value="">Unassigned</option>
                  {data.members.map((member) => (
                    <option key={member.email} value={member.email}>
                      {member.displayName}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            <label>
              Runbook title
              <input
                autoFocus
                value={runbookDraft.title}
                onChange={(event) =>
                  setRunbookDraft({ ...runbookDraft, title: event.target.value })
                }
                placeholder="Restore primary API service"
              />
            </label>
            <label>
              Activation trigger
              <textarea
                value={runbookDraft.trigger}
                onChange={(event) =>
                  setRunbookDraft({ ...runbookDraft, trigger: event.target.value })
                }
                placeholder="Conditions that require this recovery procedure."
              />
            </label>
            <label>
              Ordered recovery steps
              <textarea
                className="steps-textarea"
                value={runbookDraft.steps}
                onChange={(event) =>
                  setRunbookDraft({ ...runbookDraft, steps: event.target.value })
                }
                placeholder={"One action per line\nVerify replica health\nFail traffic to healthy region\nValidate customer transactions"}
              />
            </label>
            <label>
              Next review date
              <input
                type="date"
                value={runbookDraft.nextReviewDate}
                onChange={(event) =>
                  setRunbookDraft({ ...runbookDraft, nextReviewDate: event.target.value })
                }
              />
            </label>
            <div className="modal-actions">
              <button onClick={() => setRunbookOpen(false)}>Cancel</button>
              <button
                className="primary"
                disabled={
                  !runbookDraft.serviceId ||
                  !runbookDraft.title.trim() ||
                  runbookDraft.steps.split(/\r?\n/).filter(Boolean).length < 2 ||
                  working === "runbook"
                }
                onClick={createRunbook}
              >
                {working === "runbook" ? "Saving…" : "Create runbook"}
              </button>
            </div>
          </section>
        </div>
      )}

      {selectedIncident && (
        <div className="detail-backdrop" onMouseDown={() => setSelectedIncident(null)}>
          <aside
            className="project-detail reliability-detail"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="detail-hero incident-detail-hero">
              <button className="detail-close" onClick={() => setSelectedIncident(null)}>
                ×
              </button>
              <span className={`severity ${selectedIncident.severity}`}>
                {selectedIncident.severity.replace("_", "-").toUpperCase()}
              </span>
              <h2>{selectedIncident.title}</h2>
              <p>
                {selectedIncident.serviceName} · Started {shortDateTime(selectedIncident.startedAt)}
              </p>
            </div>
            <div className="detail-body">
              <section className="detail-section incident-impact">
                <span className="section-kicker">Declared impact</span>
                <p>{selectedIncident.impact}</p>
              </section>
              <section className="detail-section reliability-command-form">
                <span className="section-kicker">Incident command update</span>
                <div className="status-command reliability-status-command">
                  {["investigating", "identified", "monitoring", "resolved"].map((status) => (
                    <button
                      key={status}
                      className={incidentEdit.status === status ? "active" : ""}
                      onClick={() => setIncidentEdit({ ...incidentEdit, status })}
                    >
                      {human(status)}
                    </button>
                  ))}
                </div>
                <label>
                  Incident commander
                  <select
                    value={incidentEdit.commanderEmail}
                    onChange={(event) =>
                      setIncidentEdit({ ...incidentEdit, commanderEmail: event.target.value })
                    }
                  >
                    <option value="">Unassigned</option>
                    {data.members.map((member) => (
                      <option key={member.email} value={member.email}>
                        {member.displayName}
                      </option>
                    ))}
                  </select>
                </label>
                <label>
                  Current technical summary
                  <textarea
                    value={incidentEdit.summary}
                    onChange={(event) =>
                      setIncidentEdit({ ...incidentEdit, summary: event.target.value })
                    }
                    placeholder="Known cause, containment, and next action."
                  />
                </label>
                <label>
                  Command update
                  <textarea
                    value={incidentEdit.reason}
                    onChange={(event) =>
                      setIncidentEdit({ ...incidentEdit, reason: event.target.value })
                    }
                    placeholder="Record what changed and why."
                  />
                </label>
                <button
                  className="primary"
                  disabled={incidentEdit.reason.trim().length < 4 || working === "incident-update"}
                  onClick={updateIncident}
                >
                  {working === "incident-update" ? "Recording…" : "Record command update"}
                </button>
              </section>
            </div>
          </aside>
        </div>
      )}

      {selectedService && (
        <div className="modal-backdrop" onMouseDown={() => setSelectedService(null)}>
          <section
            className="modal reliability-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="service-status-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <span className="section-kicker">Service command</span>
                <h2 id="service-status-title">{selectedService.name}</h2>
              </div>
              <button onClick={() => setSelectedService(null)}>×</button>
            </div>
            <div className="service-objective-summary">
              <span>
                <small>Target</small>
                <strong>{(selectedService.availabilityTargetBps / 100).toFixed(2)}%</strong>
              </span>
              <span>
                <small>RTO</small>
                <strong>{selectedService.rtoMinutes}m</strong>
              </span>
              <span>
                <small>RPO</small>
                <strong>{selectedService.rpoMinutes}m</strong>
              </span>
            </div>
            <label>
              Service status
              <select
                value={serviceStatus}
                onChange={(event) => setServiceStatus(event.target.value)}
              >
                <option value="operational">Operational</option>
                <option value="degraded">Degraded</option>
                <option value="outage">Outage</option>
                <option value="maintenance">Maintenance</option>
              </select>
            </label>
            <label>
              Reason for change
              <textarea
                value={serviceReason}
                onChange={(event) => setServiceReason(event.target.value)}
                placeholder="Record the evidence behind this status."
              />
            </label>
            <div className="modal-actions">
              <button onClick={() => setSelectedService(null)}>Cancel</button>
              <button
                className="primary"
                disabled={
                  !selectedService.canEdit ||
                  serviceReason.trim().length < 4 ||
                  working === "service-status"
                }
                onClick={updateService}
              >
                {working === "service-status" ? "Saving…" : "Save and log status"}
              </button>
            </div>
          </section>
        </div>
      )}

      {selectedChange && (
        <div className="modal-backdrop" onMouseDown={() => setSelectedChange(null)}>
          <section
            className="modal reliability-modal decision-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="decision-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <span className="section-kicker">Change decision</span>
                <h2 id="decision-title">{selectedChange.title}</h2>
              </div>
              <button onClick={() => setSelectedChange(null)}>×</button>
            </div>
            <div className="decision-evidence">
              <article>
                <span>Implementation</span>
                <p>{selectedChange.implementationPlan}</p>
              </article>
              <article>
                <span>Rollback</span>
                <p>{selectedChange.rollbackPlan}</p>
              </article>
            </div>
            {selectedChange.status === "pending" ? (
              <>
                <div className="decision-switch">
                  <button
                    className={decision === "approved" ? "active approve" : ""}
                    onClick={() => setDecision("approved")}
                  >
                    Approve
                  </button>
                  <button
                    className={decision === "rejected" ? "active reject" : ""}
                    onClick={() => setDecision("rejected")}
                  >
                    Reject
                  </button>
                </div>
                <label>
                  Decision rationale
                  <textarea
                    value={decisionReason}
                    onChange={(event) => setDecisionReason(event.target.value)}
                    placeholder="Record the evidence and conditions for this decision."
                  />
                </label>
                <div className="modal-actions">
                  <button onClick={() => setSelectedChange(null)}>Cancel</button>
                  <button
                    className="primary"
                    disabled={decisionReason.trim().length < 4 || working === "decision"}
                    onClick={decideChange}
                  >
                    {working === "decision" ? "Recording…" : `Record ${decision}`}
                  </button>
                </div>
              </>
            ) : (
              <div className="recorded-decision">
                <span className={`change-status ${selectedChange.status}`}>
                  {human(selectedChange.status)}
                </span>
                <p>{selectedChange.decisionReason || "No decision rationale recorded."}</p>
                <small>
                  {selectedChange.decidedBy
                    ? `${selectedChange.decidedBy} · ${selectedChange.decidedAt ? shortDateTime(selectedChange.decidedAt) : ""}`
                    : "Awaiting decision evidence"}
                </small>
              </div>
            )}
          </section>
        </div>
      )}

      {drillRunbook && (
        <div className="modal-backdrop" onMouseDown={() => setDrillRunbook(null)}>
          <section
            className="modal reliability-modal"
            role="dialog"
            aria-modal="true"
            aria-labelledby="drill-title"
            onMouseDown={(event) => event.stopPropagation()}
          >
            <div className="modal-head">
              <div>
                <span className="section-kicker">Recovery evidence</span>
                <h2 id="drill-title">Record recovery drill</h2>
              </div>
              <button onClick={() => setDrillRunbook(null)}>×</button>
            </div>
            <p className="modal-copy">
              {drillRunbook.title} · {drillRunbook.serviceName}
            </p>
            <ol className="drill-steps">
              {drillRunbook.steps.map((step, index) => (
                <li key={`${step}-${index}`}>
                  <span>{index + 1}</span>
                  {step}
                </li>
              ))}
            </ol>
            <label>
              Drill outcome
              <textarea
                value={drillReason}
                onChange={(event) => setDrillReason(event.target.value)}
                placeholder="Record results, timing, evidence, and any follow-up action."
              />
            </label>
            <div className="modal-actions">
              <button onClick={() => setDrillRunbook(null)}>Cancel</button>
              <button
                className="primary"
                disabled={drillReason.trim().length < 4 || working === "drill"}
                onClick={recordDrill}
              >
                {working === "drill" ? "Recording…" : "Confirm tested"}
              </button>
            </div>
          </section>
        </div>
      )}
    </section>
  );
}
