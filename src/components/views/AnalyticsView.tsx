import React from 'react';
import {
  BarChart3,
  Download,
  TrendingUp,
  Clock,
  Users,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight
} from 'lucide-react';
import { useNexus } from '../../context/NexusContext';

export const AnalyticsView: React.FC = () => {
  const { tasks, projects, showToast } = useNexus();

  const handleExportCSV = () => {
    const csvContent =
      'data:text/csv;charset=utf-8,' +
      ['Task ID,Title,Status,Priority,Assignee,Logged Hours,Estimated Hours']
        .concat(
          tasks.map(
            (t) =>
              `"${t.id}","${t.title}","${t.status}","${t.priority}","${t.assignee.name}",${t.loggedHours},${t.estimatedHours}`
          )
        )
        .join('\n');

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement('a');
    link.setAttribute('href', encodedUri);
    link.setAttribute('download', `nexus_project_analytics_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    showToast('Analytics dataset exported to CSV');
  };

  const totalLogged = tasks.reduce((acc, t) => acc + t.loggedHours, 0);
  const totalEstimated = tasks.reduce((acc, t) => acc + t.estimatedHours, 0);

  // Workload aggregation
  const workloadMap: Record<string, { name: string; hours: number; count: number; avatar: string }> = {};
  tasks.forEach((t) => {
    if (!workloadMap[t.assignee.id]) {
      workloadMap[t.assignee.id] = {
        name: t.assignee.name,
        hours: 0,
        count: 0,
        avatar: t.assignee.avatar
      };
    }
    workloadMap[t.assignee.id].hours += t.loggedHours;
    workloadMap[t.assignee.id].count += 1;
  });

  const workloads = Object.values(workloadMap);

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
              Intelligence Metrics
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <BarChart3 className="w-6 h-6 text-emerald-400" />
            Productivity, Velocity & Workload Analytics
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            Real-time telemetry measuring sprint velocity, capacity utilization, and delivery variance across all active squads.
          </p>
        </div>

        <button
          onClick={handleExportCSV}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all shrink-0"
        >
          <Download className="w-4 h-4" />
          <span>Export Dataset (CSV)</span>
        </button>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Sprint Efficiency Ratio
          </span>
          <div className="text-2xl font-black text-white">92.4%</div>
          <p className="text-[11px] text-emerald-400 mt-2 flex items-center gap-1">
            <TrendingUp className="w-3.5 h-3.5" /> +4.1% above historical baseline
          </p>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Total Hours Logged vs Est.
          </span>
          <div className="text-2xl font-black text-white">
            {totalLogged.toFixed(1)}h <span className="text-sm text-slate-400 font-normal">/ {totalEstimated}h</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-indigo-500 h-full rounded-full"
              style={{ width: `${Math.min(100, (totalLogged / totalEstimated) * 100)}%` }}
            />
          </div>
        </div>

        <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800">
          <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-1">
            Mean Time to Resolution (MTTR)
          </span>
          <div className="text-2xl font-black text-white">18.6 Hours</div>
          <p className="text-[11px] text-slate-400 mt-2">
            Average time between In Progress to Review
          </p>
        </div>
      </div>

      {/* Charts Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Team Workload Distribution */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <Users className="w-4 h-4 text-indigo-400" />
              Team Workload & Capacity Allocation
            </h3>
            <span className="text-xs text-slate-400 font-mono">Current Sprint</span>
          </div>

          <div className="space-y-4 pt-2">
            {workloads.map((w) => (
              <div key={w.name} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-2">
                    <img src={w.avatar} alt={w.name} className="w-5 h-5 rounded-full object-cover" />
                    <span className="font-semibold text-white">{w.name}</span>
                  </div>
                  <span className="text-slate-400 font-mono">
                    {w.hours}h ({w.count} {w.count === 1 ? 'task' : 'tasks'})
                  </span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full transition-all"
                    style={{ width: `${Math.min(100, (w.hours / 40) * 100)}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Project Delivery Health Breakdown */}
        <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              Project Progress & Completion Milestones
            </h3>
          </div>

          <div className="space-y-4 pt-2">
            {projects.map((p) => (
              <div key={p.id} className="space-y-1.5">
                <div className="flex items-center justify-between text-xs">
                  <span className="font-semibold text-white">{p.name}</span>
                  <span className="text-emerald-400 font-mono font-bold">{p.progress}%</span>
                </div>
                <div className="w-full bg-slate-800 h-2 rounded-full overflow-hidden">
                  <div
                    className="bg-emerald-500 h-full rounded-full transition-all"
                    style={{ width: `${p.progress}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};
