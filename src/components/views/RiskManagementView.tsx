import React, { useState } from 'react';
import {
  AlertTriangle,
  Plus,
  Shield,
  ShieldAlert,
  Calendar,
  CheckCircle2,
  TrendingUp,
  User,
  X
} from 'lucide-react';
import { useNexus } from '../../context/NexusContext';
import { RiskItem } from '../../types';

export const RiskManagementView: React.FC = () => {
  const { risks, addRisk, projects, showToast } = useNexus();

  const [newRiskModal, setNewRiskModal] = useState(false);
  const [selectedCell, setSelectedCell] = useState<{ s: number; p: number } | null>(null);

  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [severity, setSeverity] = useState<number>(3);
  const [probability, setProbability] = useState<number>(3);
  const [mitigationPlan, setMitigationPlan] = useState('');

  const handleAddRisk = (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim()) return;
    addRisk({
      title: title.trim(),
      description: description.trim(),
      severity: severity as any,
      probability: probability as any,
      mitigationPlan: mitigationPlan.trim()
    });
    setNewRiskModal(false);
    setTitle('');
    setDescription('');
    setMitigationPlan('');
  };

  const filteredRisks = selectedCell
    ? risks.filter((r) => r.severity === selectedCell.s && r.probability === selectedCell.p)
    : risks;

  const getHeatmapColor = (score: number) => {
    if (score >= 15) return 'bg-rose-600/40 text-rose-300 border-rose-500/50 hover:bg-rose-600/60';
    if (score >= 10) return 'bg-amber-600/30 text-amber-300 border-amber-500/40 hover:bg-amber-600/50';
    if (score >= 6) return 'bg-blue-600/20 text-blue-300 border-blue-500/30 hover:bg-blue-600/40';
    return 'bg-emerald-600/20 text-emerald-300 border-emerald-500/30 hover:bg-emerald-600/40';
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20">
              Risk Governance
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <AlertTriangle className="w-6 h-6 text-rose-400" />
            Enterprise Risk Matrix & Mitigation Register
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            Evaluate probability against operational impact, formulate proactive contingency plans, and track resolution timelines.
          </p>
        </div>

        <button
          onClick={() => setNewRiskModal(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-rose-600 hover:bg-rose-500 text-white text-xs font-semibold shadow-lg shadow-rose-600/30 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Identify New Risk</span>
        </button>
      </div>

      {/* 5x5 Severity-Probability Heatmap Matrix */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Heatmap Grid (2 cols) */}
        <div className="lg:col-span-2 p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              5×5 Risk Heatmap Matrix (Probability × Severity)
            </h3>
            {selectedCell && (
              <button
                onClick={() => setSelectedCell(null)}
                className="text-[11px] text-indigo-400 hover:underline"
              >
                Clear cell filter ({selectedCell.s}×{selectedCell.p})
              </button>
            )}
          </div>

          <div className="space-y-1.5">
            {/* Probability Rows 5 down to 1 */}
            {[5, 4, 3, 2, 1].map((prob) => (
              <div key={prob} className="flex items-center gap-2">
                <span className="w-16 text-right text-[10px] font-mono text-slate-400">
                  P-{prob}
                </span>
                <div className="flex-1 grid grid-cols-5 gap-2">
                  {[1, 2, 3, 4, 5].map((sev) => {
                    const score = prob * sev;
                    const cellRisks = risks.filter((r) => r.severity === sev && r.probability === prob);
                    const isSelected = selectedCell?.s === sev && selectedCell?.p === prob;

                    return (
                      <div
                        key={sev}
                        onClick={() => setSelectedCell(isSelected ? null : { s: sev, p: prob })}
                        className={`h-14 rounded-xl border flex flex-col items-center justify-center cursor-pointer transition-all ${getHeatmapColor(
                          score
                        )} ${isSelected ? 'ring-2 ring-white scale-105' : ''}`}
                      >
                        <span className="text-xs font-black">{score}</span>
                        {cellRisks.length > 0 && (
                          <span className="text-[10px] font-mono font-bold px-1.5 py-0.2 rounded-full bg-slate-950/80 text-white mt-0.5">
                            {cellRisks.length} {cellRisks.length === 1 ? 'risk' : 'risks'}
                          </span>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>
            ))}

            {/* Severity Bottom Column Labels */}
            <div className="flex items-center gap-2 pt-2">
              <span className="w-16" />
              <div className="flex-1 grid grid-cols-5 gap-2 text-center text-[10px] font-mono text-slate-400">
                <div>S-1 (Low)</div>
                <div>S-2 (Minor)</div>
                <div>S-3 (Mod)</div>
                <div>S-4 (Major)</div>
                <div>S-5 (Critical)</div>
              </div>
            </div>
          </div>
        </div>

        {/* Risk Summary Widget */}
        <div className="p-6 rounded-2xl bg-gradient-to-br from-slate-900 to-rose-950/20 border border-slate-800 flex flex-col justify-between space-y-4">
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-2">
              Risk Profile Breakdown
            </h3>
            <p className="text-xs text-slate-400 leading-relaxed">
              Real-time calculations based on active engineering tasks, third-party API dependencies, and infrastructure telemetry.
            </p>

            <div className="mt-6 space-y-3">
              <div className="flex items-center justify-between text-xs">
                <span className="text-slate-400">Total Registered Risks:</span>
                <span className="font-bold text-white font-mono">{risks.length}</span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-rose-400">High / Critical Impact:</span>
                <span className="font-bold text-rose-400 font-mono">
                  {risks.filter((r) => r.impactScore >= 12).length}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-amber-400">Under Active Mitigation:</span>
                <span className="font-bold text-amber-400 font-mono">
                  {risks.filter((r) => r.status === 'Mitigating').length}
                </span>
              </div>
              <div className="flex items-center justify-between text-xs">
                <span className="text-emerald-400">Closed / Resolved:</span>
                <span className="font-bold text-emerald-400 font-mono">
                  {risks.filter((r) => r.status === 'Closed').length}
                </span>
              </div>
            </div>
          </div>

          <div className="p-3 rounded-xl bg-slate-900/90 border border-slate-800 text-[11px] text-slate-300">
            <span className="text-indigo-400 font-bold block mb-1">AI Recommendation</span>
            Trigger auto-scaling worker groups to mitigate latency degradation on webhook endpoints before Oct 4.
          </div>
        </div>
      </div>

      {/* Risk Register Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Risk Register Ledger ({filteredRisks.length})
          </h3>
          {selectedCell && (
            <span className="text-xs text-indigo-400 font-mono">
              Filtered: Severity {selectedCell.s}, Probability {selectedCell.p}
            </span>
          )}
        </div>

        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/80 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            <tr>
              <th className="px-4 py-3">Risk ID</th>
              <th className="px-4 py-3">Title & Impact</th>
              <th className="px-4 py-3">Project</th>
              <th className="px-4 py-3">Score (S × P)</th>
              <th className="px-4 py-3">Status</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Mitigation Plan</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60">
            {filteredRisks.map((r) => (
              <tr key={r.id} className="hover:bg-slate-800/40 transition-colors">
                <td className="px-4 py-3 font-mono text-rose-400 font-bold">{r.id}</td>
                <td className="px-4 py-3">
                  <div className="font-semibold text-white">{r.title}</div>
                  <div className="text-[11px] text-slate-400 max-w-sm line-clamp-1">{r.description}</div>
                </td>
                <td className="px-4 py-3 text-slate-400">{r.projectName}</td>
                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-0.5 rounded-full font-mono font-bold text-[10px] ${
                      r.impactScore >= 12
                        ? 'bg-rose-500/20 text-rose-400 border border-rose-500/30'
                        : 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                    }`}
                  >
                    {r.impactScore} ({r.severity}×{r.probability})
                  </span>
                </td>
                <td className="px-4 py-3">
                  <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px]">
                    {r.status}
                  </span>
                </td>
                <td className="px-4 py-3">
                  <div className="flex items-center gap-1.5">
                    <img src={r.owner.avatar} alt={r.owner.name} className="w-5 h-5 rounded-full" />
                    <span>{r.owner.name}</span>
                  </div>
                </td>
                <td className="px-4 py-3 max-w-xs truncate text-slate-400">
                  {r.mitigationPlan}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* New Risk Modal */}
      {newRiskModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#0f172a] border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between pb-2 border-b border-slate-800">
              <h3 className="text-base font-bold text-white flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-rose-400" />
                Register New Operational Risk
              </h3>
              <button onClick={() => setNewRiskModal(false)} className="text-slate-400 hover:text-white">
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleAddRisk} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Risk Title</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Cross-cloud network latency spike..."
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-rose-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  placeholder="Explain operational consequences..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-rose-500 resize-none"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Severity: {severity} (1-5)
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={severity}
                    onChange={(e) => setSeverity(+e.target.value)}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">
                    Probability: {probability} (1-5)
                  </label>
                  <input
                    type="range"
                    min={1}
                    max={5}
                    value={probability}
                    onChange={(e) => setProbability(+e.target.value)}
                    className="w-full"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Mitigation Plan</label>
                <textarea
                  rows={2}
                  value={mitigationPlan}
                  onChange={(e) => setMitigationPlan(e.target.value)}
                  placeholder="Steps to reduce or avoid impact..."
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-rose-500 resize-none"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setNewRiskModal(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-rose-600 hover:bg-rose-500 text-white font-semibold shadow-md shadow-rose-600/30"
                >
                  Save to Risk Register
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
