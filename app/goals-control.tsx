"use client";

import { useEffect, useMemo, useState } from "react";

type GoalStatus = "on_track" | "at_risk" | "complete";
type KeyResult = { id: number; title: string; progress: number; target: string };
type Objective = {
  id: number;
  title: string;
  owner: string;
  cycle: string;
  status: GoalStatus;
  project: string;
  keyResults: KeyResult[];
};

const initialObjectives: Objective[] = [
  {
    id: 1,
    title: "Ship a trusted enterprise operating system",
    owner: "Kshitij Raj",
    cycle: "Q3 2026",
    status: "on_track",
    project: "Nexus Mobile App",
    keyResults: [
      { id: 11, title: "Reach 99.95% command availability", progress: 78, target: "99.95%" },
      { id: 12, title: "Close all critical access findings", progress: 86, target: "100%" },
      { id: 13, title: "Cut decision turnaround below 4 hours", progress: 64, target: "<4h" },
    ],
  },
  {
    id: 2,
    title: "Deliver the campus league with zero critical failure",
    owner: "Maya Sharma",
    cycle: "Q3 2026",
    status: "at_risk",
    project: "Campus Esports League",
    keyResults: [
      { id: 21, title: "Lock venue and operating permissions", progress: 48, target: "100%" },
      { id: 22, title: "Complete tournament recovery drill", progress: 72, target: "2 drills" },
      { id: 23, title: "Confirm 32 participating teams", progress: 81, target: "32 teams" },
    ],
  },
  {
    id: 3,
    title: "Build predictable portfolio economics",
    owner: "Finance Operations",
    cycle: "Q3 2026",
    status: "on_track",
    project: "Portfolio-wide",
    keyResults: [
      { id: 31, title: "Keep forecast variance below 5%", progress: 91, target: "<5%" },
      { id: 32, title: "Log a reason for every budget revision", progress: 100, target: "100%" },
    ],
  },
];

const statusLabel: Record<GoalStatus, string> = {
  on_track: "On track",
  at_risk: "At risk",
  complete: "Complete",
};

function objectiveProgress(objective: Objective) {
  if (!objective.keyResults.length) return 0;
  return Math.round(
    objective.keyResults.reduce((total, result) => total + result.progress, 0) /
      objective.keyResults.length,
  );
}

export function GoalsControl({ notify }: { notify: (message: string) => void }) {
  const [objectives, setObjectives] = useState<Objective[]>(initialObjectives);
  const [filter, setFilter] = useState<"all" | GoalStatus>("all");
  const [expanded, setExpanded] = useState<number | null>(1);
  const [createOpen, setCreateOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [owner, setOwner] = useState("");
  const [project, setProject] = useState("Nexus Mobile App");

  useEffect(() => {
    const stored = localStorage.getItem("nexus-goals");
    if (!stored) return;
    try {
      const parsed = JSON.parse(stored) as Objective[];
      if (Array.isArray(parsed) && parsed.length) {
        queueMicrotask(() => setObjectives(parsed));
      }
    } catch {
      // Keep the governed seed if device-local state is invalid.
    }
  }, []);

  useEffect(() => {
    localStorage.setItem("nexus-goals", JSON.stringify(objectives));
  }, [objectives]);

  const visible = objectives.filter(
    (objective) => filter === "all" || objective.status === filter,
  );
  const metrics = useMemo(() => {
    const progress = objectives.length
      ? Math.round(
          objectives.reduce((total, objective) => total + objectiveProgress(objective), 0) /
            objectives.length,
        )
      : 0;
    return {
      progress,
      atRisk: objectives.filter((objective) => objective.status === "at_risk").length,
      complete: objectives.filter((objective) => objective.status === "complete").length,
      keyResults: objectives.reduce((total, objective) => total + objective.keyResults.length, 0),
    };
  }, [objectives]);

  const updateKeyResult = (objectiveId: number, keyResultId: number, progress: number) => {
    setObjectives((current) =>
      current.map((objective) => {
        if (objective.id !== objectiveId) return objective;
        const keyResults = objective.keyResults.map((result) =>
          result.id === keyResultId ? { ...result, progress } : result,
        );
        const average = keyResults.reduce((sum, result) => sum + result.progress, 0) / keyResults.length;
        return {
          ...objective,
          keyResults,
          status: average >= 100 ? "complete" : average < 55 ? "at_risk" : objective.status === "complete" ? "on_track" : objective.status,
        };
      }),
    );
  };

  const createObjective = () => {
    if (!title.trim() || !owner.trim()) return;
    const id = Date.now();
    setObjectives((current) => [
      {
        id,
        title: title.trim(),
        owner: owner.trim(),
        cycle: "Q3 2026",
        status: "on_track",
        project,
        keyResults: [
          { id: id + 1, title: "Define the first measurable key result", progress: 0, target: "Set target" },
        ],
      },
      ...current,
    ]);
    setTitle("");
    setOwner("");
    setCreateOpen(false);
    setExpanded(id);
    notify("Objective created and aligned to the portfolio");
  };

  return (
    <section className="goals-workspace">
      <section className="goals-hero">
        <div>
          <span className="goals-live"><i /> Strategy execution</span>
          <h2>Connect every project to a measurable business outcome.</h2>
          <p>Objectives, key results, owners, and delivery signals stay aligned in one executive view.</p>
        </div>
        <button className="primary" onClick={() => setCreateOpen(true)}>＋ New objective</button>
      </section>

      <section className="goals-metrics">
        <article><span>Portfolio progress</span><strong>{metrics.progress}%</strong><small>Weighted objective delivery</small></article>
        <article><span>Key results</span><strong>{metrics.keyResults}</strong><small>Measurable outcomes tracked</small></article>
        <article><span>At risk</span><strong className={metrics.atRisk ? "coral-text" : ""}>{metrics.atRisk}</strong><small>Needs executive intervention</small></article>
        <article><span>Completed</span><strong>{metrics.complete}</strong><small>This operating cycle</small></article>
      </section>

      <div className="goals-toolbar">
        <div>
          {(["all", "on_track", "at_risk", "complete"] as const).map((status) => (
            <button key={status} className={filter === status ? "active" : ""} onClick={() => setFilter(status)}>
              {status === "all" ? "All objectives" : statusLabel[status]}
            </button>
          ))}
        </div>
        <span>Q3 2026 operating cycle</span>
      </div>

      <section className="goals-list">
        {visible.map((objective) => {
          const progress = objectiveProgress(objective);
          const isOpen = expanded === objective.id;
          return (
            <article className="goal-card" key={objective.id}>
              <button className="goal-summary" onClick={() => setExpanded(isOpen ? null : objective.id)}>
                <span className={`goal-state ${objective.status}`}>{statusLabel[objective.status]}</span>
                <div className="goal-title"><small>{objective.project}</small><strong>{objective.title}</strong><span>{objective.owner} · {objective.cycle}</span></div>
                <div className="goal-progress"><strong>{progress}%</strong><div><i style={{ width: `${progress}%` }} /></div></div>
                <span className="goal-toggle">{isOpen ? "−" : "+"}</span>
              </button>
              {isOpen && (
                <div className="key-results">
                  <div className="key-results-head"><span>Key result</span><span>Target</span><span>Progress</span></div>
                  {objective.keyResults.map((result) => (
                    <div className="key-result" key={result.id}>
                      <span><i className={result.progress === 100 ? "complete" : ""}>{result.progress === 100 ? "✓" : ""}</i><strong>{result.title}</strong></span>
                      <em>{result.target}</em>
                      <label>
                        <input aria-label={`${result.title} progress`} type="range" min="0" max="100" value={result.progress} onChange={(event) => updateKeyResult(objective.id, result.id, Number(event.target.value))} />
                        <b>{result.progress}%</b>
                      </label>
                    </div>
                  ))}
                  <p className="goal-evidence">Progress changes are retained on this device and immediately reflected in portfolio alignment.</p>
                </div>
              )}
            </article>
          );
        })}
      </section>

      {createOpen && (
        <div className="modal-backdrop" onMouseDown={() => setCreateOpen(false)}>
          <section className="modal goal-modal" role="dialog" aria-modal="true" aria-labelledby="goal-create-title" onMouseDown={(event) => event.stopPropagation()}>
            <div className="modal-head"><div><span className="section-kicker">Portfolio alignment</span><h2 id="goal-create-title">Create objective</h2></div><button onClick={() => setCreateOpen(false)}>×</button></div>
            <p className="modal-copy">Define the outcome first. Add measurable key results, delivery evidence, and governance after creation.</p>
            <label>Objective<input autoFocus value={title} onChange={(event) => setTitle(event.target.value)} placeholder="What must the portfolio accomplish?" /></label>
            <div className="modal-grid">
              <label>Owner<input value={owner} onChange={(event) => setOwner(event.target.value)} placeholder="Accountable owner" /></label>
              <label>Aligned project<select value={project} onChange={(event) => setProject(event.target.value)}><option>Nexus Mobile App</option><option>Campus Esports League</option><option>APAC Brand Refresh</option><option>Portfolio-wide</option></select></label>
            </div>
            <div className="modal-actions"><button onClick={() => setCreateOpen(false)}>Cancel</button><button className="primary" disabled={!title.trim() || !owner.trim()} onClick={createObjective}>Create objective</button></div>
          </section>
        </div>
      )}
    </section>
  );
}
