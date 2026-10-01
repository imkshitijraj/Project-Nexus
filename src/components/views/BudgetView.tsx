import React from 'react';
import {
  CircleDollarSign,
  TrendingDown,
  TrendingUp,
  PieChart,
  DollarSign,
  AlertCircle,
  FileSpreadsheet
} from 'lucide-react';
import { useNexus } from '../../context/NexusContext';

export const BudgetView: React.FC = () => {
  const { projects } = useNexus();

  const totalEstimated = projects.reduce((acc, p) => acc + p.budget.estimated, 0);
  const totalActual = projects.reduce((acc, p) => acc + p.budget.actual, 0);
  const remaining = totalEstimated - totalActual;
  const burnPercent = Math.round((totalActual / totalEstimated) * 100);

  const categories = [
    { name: 'Cloud Infrastructure & VPC Compute (AWS/GCP)', allocated: 140000, spent: 96000, color: 'bg-indigo-500' },
    { name: 'Core Engineering & Architecture Salaries', allocated: 220000, spent: 154000, color: 'bg-purple-500' },
    { name: 'Third-Party LLM & AI GPU Compute Tokens', allocated: 80000, spent: 44000, color: 'bg-blue-500' },
    { name: 'Security Audits & SOC2 Compliance Certification', allocated: 40000, spent: 15900, color: 'bg-emerald-500' }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-amber-400 bg-amber-500/10 px-2 py-0.5 rounded border border-amber-500/20">
            Financial Governance
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <CircleDollarSign className="w-6 h-6 text-amber-400" />
          Budget Allocation & Expenditure Tracking
        </h1>
        <p className="text-xs text-slate-400 max-w-2xl mt-1">
          Track multi-project burn rates, capital expenditure variance, and cloud resource cost projections.
        </p>
      </div>

      {/* Overview Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Total Authorized Budget
          </span>
          <div className="text-2xl font-black text-white font-mono">
            ${totalEstimated.toLocaleString()}
          </div>
          <span className="text-[11px] text-slate-500 mt-2 block">Allocated across 4 enterprise projects</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Actual Expenditure to Date
          </span>
          <div className="text-2xl font-black text-white font-mono">
            ${totalActual.toLocaleString()}
          </div>
          <span className="text-[11px] text-indigo-400 mt-2 block">{burnPercent}% utilization rate</span>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Remaining Runway Surplus
          </span>
          <div className="text-2xl font-black text-emerald-400 font-mono">
            ${remaining.toLocaleString()}
          </div>
          <span className="text-[11px] text-emerald-400 mt-2 block">Projected runway: +18 weeks</span>
        </div>
      </div>

      {/* Category Breakdown */}
      <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
        <h3 className="text-sm font-bold text-white uppercase tracking-wider">
          Expenditure by Operational Category
        </h3>
        <div className="space-y-4 pt-2">
          {categories.map((c) => {
            const pct = Math.round((c.spent / c.allocated) * 100);
            return (
              <div key={c.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">{c.name}</span>
                  <span className="text-slate-400 font-mono">
                    ${c.spent.toLocaleString()} / ${c.allocated.toLocaleString()} ({pct}%)
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className={`${c.color} h-full rounded-full transition-all`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Project Financial Variance Table */}
      <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
        <div className="p-4 bg-slate-900 border-b border-slate-800">
          <h3 className="text-xs font-bold text-white uppercase tracking-wider">
            Project-Level Budget vs Actual Variance
          </h3>
        </div>
        <table className="w-full text-left text-xs text-slate-300">
          <thead className="bg-slate-900/80 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
            <tr>
              <th className="px-4 py-3">Project</th>
              <th className="px-4 py-3">Owner</th>
              <th className="px-4 py-3">Estimated Budget</th>
              <th className="px-4 py-3">Actual Spent</th>
              <th className="px-4 py-3">Variance</th>
              <th className="px-4 py-3">Burn Status</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-800/60 font-mono">
            {projects.map((p) => {
              const diff = p.budget.estimated - p.budget.actual;
              const ratio = p.budget.actual / p.budget.estimated;
              return (
                <tr key={p.id} className="hover:bg-slate-800/40 transition-colors">
                  <td className="px-4 py-3 font-sans font-semibold text-white">{p.name}</td>
                  <td className="px-4 py-3 font-sans text-slate-400">{p.owner.name}</td>
                  <td className="px-4 py-3">${p.budget.estimated.toLocaleString()}</td>
                  <td className="px-4 py-3 text-white">${p.budget.actual.toLocaleString()}</td>
                  <td className="px-4 py-3 text-emerald-400">+${diff.toLocaleString()}</td>
                  <td className="px-4 py-3 font-sans">
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        ratio > 0.85
                          ? 'bg-amber-500/20 text-amber-400 border border-amber-500/30'
                          : 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      }`}
                    >
                      {Math.round(ratio * 100)}% Spent
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
