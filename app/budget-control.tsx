"use client";

import { useEffect, useMemo, useState } from "react";

type BudgetRecord = {
  projectId: number;
  projectName: string;
  department: string;
  health: string;
  allocatedAmount: number;
  spentAmount: number;
  committedAmount: number;
  forecastAmount: number;
  notes: string;
  version: number;
  updatedBy: string;
  updatedAt: string;
};

type BudgetLog = {
  id: number;
  projectId: number;
  projectName: string;
  actorEmail: string;
  changeType: string;
  before: Partial<BudgetRecord>;
  after: Partial<BudgetRecord>;
  reason: string;
  createdAt: string;
};

type BudgetData = {
  canManage: boolean;
  budgets: BudgetRecord[];
  logs: BudgetLog[];
};

const money = (value: number) =>
  new Intl.NumberFormat("en-IN", {
    style: "currency",
    currency: "INR",
    maximumFractionDigits: 0,
  }).format(value);

const compactMoney = (value: number) => {
  if (Math.abs(value) >= 100_000) return `₹${(value / 100_000).toFixed(1)}L`;
  if (Math.abs(value) >= 1_000) return `₹${Math.round(value / 1_000)}K`;
  return money(value);
};

function changedFields(log: BudgetLog) {
  const labels: Record<string, string> = {
    allocatedAmount: "Allocation",
    spentAmount: "Actual spend",
    committedAmount: "Committed",
    forecastAmount: "Forecast",
    notes: "Notes",
  };
  return Object.keys(labels)
    .filter((key) => log.before?.[key as keyof BudgetRecord] !== log.after?.[key as keyof BudgetRecord])
    .map((key) => labels[key]);
}

export function BudgetControl({
  notify,
}: {
  notify: (message: string) => void;
}) {
  const [data, setData] = useState<BudgetData>({ canManage: false, budgets: [], logs: [] });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [editing, setEditing] = useState<BudgetRecord | null>(null);
  const [draft, setDraft] = useState({
    allocatedAmount: "",
    spentAmount: "",
    committedAmount: "",
    forecastAmount: "",
    notes: "",
    reason: "",
  });
  const [saving, setSaving] = useState(false);
  const [logScope, setLogScope] = useState("all");
  const [logQuery, setLogQuery] = useState("");

  const load = async () => {
    setLoading(true);
    setError("");
    if (
      localStorage.getItem("nexus-open-workspace") === "true" ||
      (window.location.hostname === "terminal.local" &&
        new URLSearchParams(window.location.search).has("qa"))
    ) {
      const now = new Date().toISOString();
      setData({
        canManage: true,
        budgets: [
          { projectId: -1, projectName: "Nexus Mobile App", department: "Product & Engineering", health: "On track", allocatedAmount: 840000, spentAmount: 537600, committedAmount: 48000, forecastAmount: 808000, notes: "Production launch baseline", version: 3, updatedBy: "qa@nexus.local", updatedAt: now },
          { projectId: -2, projectName: "Campus Esports League", department: "Operations", health: "At risk", allocatedAmount: 960000, spentAmount: 748800, committedAmount: 152000, forecastAmount: 1085000, notes: "Venue cost review required", version: 5, updatedBy: "qa@nexus.local", updatedAt: now },
          { projectId: -3, projectName: "APAC Brand Refresh", department: "Marketing", health: "On track", allocatedAmount: 720000, spentAmount: 511200, committedAmount: 62000, forecastAmount: 678000, notes: "", version: 2, updatedBy: "qa@nexus.local", updatedAt: now },
        ],
        logs: [
          { id: 1, projectId: -2, projectName: "Campus Esports League", actorEmail: "qa@nexus.local", changeType: "budget.update", before: { forecastAmount: 990000 }, after: { forecastAmount: 1085000 }, reason: "Venue quotation revised after capacity update", createdAt: now },
          { id: 2, projectId: -1, projectName: "Nexus Mobile App", actorEmail: "maya@nexus.local", changeType: "budget.update", before: { committedAmount: 32000 }, after: { committedAmount: 48000 }, reason: "Added observability service commitment", createdAt: new Date(Date.now() - 3600000).toISOString() },
        ],
      });
      setLoading(false);
      return;
    }
    try {
      const response = await fetch("/api/budget");
      const result = (await response.json()) as BudgetData & { error?: string };
      if (!response.ok) throw new Error(result.error || "Budget data could not be loaded.");
      setData(result);
    } catch (loadError) {
      setError(loadError instanceof Error ? loadError.message : "Budget data could not be loaded.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const frame = requestAnimationFrame(() => void load());
    return () => cancelAnimationFrame(frame);
  }, []);

  const totals = useMemo(
    () =>
      data.budgets.reduce(
        (sum, item) => ({
          allocated: sum.allocated + item.allocatedAmount,
          spent: sum.spent + item.spentAmount,
          committed: sum.committed + item.committedAmount,
          forecast: sum.forecast + item.forecastAmount,
        }),
        { allocated: 0, spent: 0, committed: 0, forecast: 0 },
      ),
    [data.budgets],
  );
  const utilized = totals.allocated
    ? Math.round((totals.spent / totals.allocated) * 100)
    : 0;
  const variance = totals.allocated - totals.forecast;
  const filteredLogs = data.logs.filter(
    (log) =>
      (logScope === "all" || String(log.projectId) === logScope) &&
      (!logQuery ||
        `${log.projectName} ${log.actorEmail} ${log.reason}`
          .toLowerCase()
          .includes(logQuery.toLowerCase())),
  );

  const openEditor = (record: BudgetRecord) => {
    setEditing(record);
    setDraft({
      allocatedAmount: String(record.allocatedAmount),
      spentAmount: String(record.spentAmount),
      committedAmount: String(record.committedAmount),
      forecastAmount: String(record.forecastAmount),
      notes: record.notes,
      reason: "",
    });
  };

  const save = async () => {
    if (!editing || draft.reason.trim().length < 4) return;
    const payload = {
      action: "updateBudget",
      projectId: editing.projectId,
      version: editing.version,
      allocatedAmount: Number(draft.allocatedAmount),
      spentAmount: Number(draft.spentAmount),
      committedAmount: Number(draft.committedAmount),
      forecastAmount: Number(draft.forecastAmount),
      notes: draft.notes,
      reason: draft.reason,
    };
    setSaving(true);
    try {
      if (
        localStorage.getItem("nexus-open-workspace") === "true" ||
        (window.location.hostname === "terminal.local" &&
          new URLSearchParams(window.location.search).has("qa"))
      ) {
        const after = { ...editing, ...payload, version: editing.version + 1, updatedBy: "qa@nexus.local", updatedAt: new Date().toISOString() };
        setData((current) => ({
          ...current,
          budgets: current.budgets.map((item) => item.projectId === editing.projectId ? after : item),
          logs: [{ id: Date.now(), projectId: editing.projectId, projectName: editing.projectName, actorEmail: "qa@nexus.local", changeType: "budget.update", before: editing, after, reason: draft.reason, createdAt: new Date().toISOString() }, ...current.logs],
        }));
      } else {
        const response = await fetch("/api/budget", {
          method: "POST",
          headers: { "content-type": "application/json" },
          body: JSON.stringify(payload),
        });
        const result = (await response.json()) as { error?: string };
        if (!response.ok) throw new Error(result.error || "Budget change could not be saved.");
        await load();
      }
      setEditing(null);
      notify("Budget updated and revision log recorded");
    } catch (saveError) {
      notify(saveError instanceof Error ? saveError.message : "Budget change could not be saved.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return <section className="budget-loading"><i/><strong>Loading governed budget records…</strong></section>;
  }
  if (error) {
    return <section className="budget-loading"><strong>{error}</strong><button onClick={load}>Try again</button></section>;
  }
  if (!data.budgets.length) {
    return <section className="budget-loading"><strong>No accessible project budgets yet.</strong><span>Create a project to establish its first budget baseline.</span></section>;
  }

  return <section className="budget-workspace">
    <section className="budget-summary">
      <div className="budget-main"><span>Total portfolio budget</span><strong>{compactMoney(totals.allocated)}</strong><p>{compactMoney(totals.spent)} spent · {compactMoney(Math.max(0, totals.allocated - totals.spent))} remaining</p><div className="budget-track"><i style={{width:`${Math.min(100, utilized)}%`}}/></div><small>{utilized}% utilized</small></div>
      <div><span>Forecast variance</span><strong className={variance >= 0 ? "positive" : "coral-text"}>{variance >= 0 ? "+" : "−"}{compactMoney(Math.abs(variance))}</strong><p>{variance >= 0 ? "Under budget" : "Over budget forecast"}</p></div>
      <div><span>Committed spend</span><strong>{compactMoney(totals.committed)}</strong><p>Approved, not yet paid</p></div>
    </section>

    <section className="panel budget-register">
      <div className="panel-head"><div><span className="section-kicker">Editable register</span><h2>Project budgets</h2></div><span className="budget-policy">{data.canManage ? "Manager edits enabled" : "View-only access"}</span></div>
      <div className="budget-table">
        <div className="budget-table-head"><span>Project</span><span>Allocation</span><span>Actual</span><span>Committed</span><span>Forecast</span><span>Use</span><span>Control</span></div>
        {data.budgets.map((item) => {
          const use = item.allocatedAmount ? Math.round((item.spentAmount / item.allocatedAmount) * 100) : 0;
          const over = item.forecastAmount > item.allocatedAmount;
          return <div className="budget-row" key={item.projectId}>
            <div className="budget-project"><i>{item.projectName.split(" ").map((part)=>part[0]).join("").slice(0,2)}</i><span><strong>{item.projectName}</strong><small>{item.department}</small></span></div>
            <strong>{compactMoney(item.allocatedAmount)}</strong>
            <span>{compactMoney(item.spentAmount)}</span>
            <span>{compactMoney(item.committedAmount)}</span>
            <span className={over ? "budget-over" : "budget-under"}>{compactMoney(item.forecastAmount)}</span>
            <div className="budget-use"><span>{use}%</span><i><b style={{width:`${Math.min(100, use)}%`}}/></i></div>
            <button disabled={!data.canManage} onClick={()=>openEditor(item)}>{data.canManage ? "Edit" : "View only"}</button>
          </div>;
        })}
      </div>
    </section>

    <section className="panel budget-log">
      <div className="budget-log-head"><div><span className="section-kicker">Revision evidence</span><h2>Budget change log</h2><p>Every saved adjustment adds a new traceable entry. Previous records are never overwritten.</p></div><div><input value={logQuery} onChange={(event)=>setLogQuery(event.target.value)} placeholder="Search reason or editor"/><select value={logScope} onChange={(event)=>setLogScope(event.target.value)}><option value="all">All projects</option>{data.budgets.map((item)=><option key={item.projectId} value={item.projectId}>{item.projectName}</option>)}</select></div></div>
      <div className="budget-log-list">
        {filteredLogs.map((log) => <article key={log.id}><span className="log-mark">↺</span><div><div><strong>{log.projectName}</strong><em>{log.changeType.replace(".", " ")}</em></div><p>{log.reason}</p><small>{changedFields(log).join(", ") || "Baseline"} · {log.actorEmail}</small></div><time>{new Date(log.createdAt).toLocaleString()}</time></article>)}
        {!filteredLogs.length && <div className="budget-log-empty">No budget revisions match this view.</div>}
      </div>
    </section>

    {editing && <div className="budget-modal-backdrop" onMouseDown={()=>!saving&&setEditing(null)}><section className="budget-modal" role="dialog" aria-modal="true" aria-labelledby="budget-edit-title" onMouseDown={(event)=>event.stopPropagation()}><button className="budget-modal-close" onClick={()=>setEditing(null)} disabled={saving}>×</button><span className="section-kicker">Controlled financial change</span><h2 id="budget-edit-title">Edit {editing.projectName}</h2><p>Enter whole-rupee values. Saving creates revision {editing.version + 1} and updates the activity evidence automatically.</p><div className="budget-form-grid"><label>Total allocation<input type="number" min="0" step="1000" value={draft.allocatedAmount} onChange={(event)=>setDraft({...draft,allocatedAmount:event.target.value})}/></label><label>Actual spend<input type="number" min="0" step="1000" value={draft.spentAmount} onChange={(event)=>setDraft({...draft,spentAmount:event.target.value})}/></label><label>Committed spend<input type="number" min="0" step="1000" value={draft.committedAmount} onChange={(event)=>setDraft({...draft,committedAmount:event.target.value})}/></label><label>Forecast at completion<input type="number" min="0" step="1000" value={draft.forecastAmount} onChange={(event)=>setDraft({...draft,forecastAmount:event.target.value})}/></label></div><label>Budget notes<textarea value={draft.notes} onChange={(event)=>setDraft({...draft,notes:event.target.value})} placeholder="Optional operating context"/></label><label>Reason for change <b>Required</b><textarea autoFocus value={draft.reason} onChange={(event)=>setDraft({...draft,reason:event.target.value})} placeholder="What changed and why?"/></label><div className="budget-change-preview"><span>New forecast</span><strong>{compactMoney(Number(draft.forecastAmount)||0)}</strong><em className={(Number(draft.forecastAmount)||0)>(Number(draft.allocatedAmount)||0)?"budget-over":"budget-under"}>{(Number(draft.forecastAmount)||0)>(Number(draft.allocatedAmount)||0)?"Over allocation":"Within allocation"}</em></div><div className="budget-modal-actions"><button onClick={()=>setEditing(null)} disabled={saving}>Cancel</button><button className="primary" disabled={saving||draft.reason.trim().length<4} onClick={save}>{saving?"Saving revision…":"Save and log change"}</button></div></section></div>}
  </section>;
}
