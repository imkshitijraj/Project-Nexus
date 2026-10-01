import React from 'react';
import {
  FolderKanban,
  CheckCircle2,
  AlertTriangle,
  Zap,
  TrendingUp,
  Clock,
  ArrowUpRight,
  ShieldAlert,
  Users,
  Layers,
  ChevronRight,
  Bot
} from 'lucide-react';
import { useNexus } from '../../context/NexusContext';

export const DashboardView: React.FC = () => {
  const {
    projects,
    tasks,
    risks,
    automations,
    setCurrentView,
    setSelectedTask,
    setIsAICopilotOpen
  } = useNexus();

  const totalTasks = tasks.length;
  const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
  const completionRate = Math.round((completedTasks / totalTasks) * 100);
  const inProgressTasks = tasks.filter((t) => t.status === 'In Progress').length;
  const urgentTasks = tasks.filter((t) => t.priority === 'Urgent' && t.status !== 'Completed');
  const criticalRisks = risks.filter((r) => r.impactScore >= 12 && r.status !== 'Closed');
  const activeAutomationsCount = automations.filter((a) => a.enabled).length;

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Top Banner / Welcome */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-purple-950/40 border border-indigo-500/20 shadow-xl relative overflow-hidden">
        <div className="relative z-10">
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
              Operations Center
            </span>
            <span className="text-xs text-slate-400">All systems operational</span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight">
            Welcome back, Sarah
          </h1>
          <p className="text-xs text-slate-300 max-w-xl mt-1 leading-relaxed">
            Nexus is orchestrating 4 cross-functional projects, {totalTasks} active tasks, and {activeAutomationsCount} automated event rules. No critical outages reported.
          </p>
        </div>

        <div className="flex items-center gap-3 relative z-10">
          <button
            onClick={() => setIsAICopilotOpen(true)}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-gradient-to-r from-purple-600 to-indigo-600 hover:from-purple-500 hover:to-indigo-500 text-white text-xs font-semibold shadow-lg shadow-indigo-600/30 transition-all"
          >
            <Bot className="w-4 h-4" />
            <span>AI Copilot Briefing</span>
          </button>
          <button
            onClick={() => setCurrentView('projects')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-all"
          >
            <span>View Board</span>
            <ArrowUpRight className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Metric Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Card 1: Active Projects */}
        <div
          onClick={() => setCurrentView('projects')}
          className="p-5 rounded-2xl glass-card hover:border-indigo-500/40 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Projects</span>
            <div className="p-2 rounded-xl bg-indigo-500/10 text-indigo-400 group-hover:scale-110 transition-transform">
              <FolderKanban className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{projects.length}</div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-emerald-400">
            <TrendingUp className="w-3.5 h-3.5" />
            <span>+2 new this quarter</span>
          </div>
        </div>

        {/* Card 2: Task Completion Rate */}
        <div
          onClick={() => setCurrentView('projects')}
          className="p-5 rounded-2xl glass-card hover:border-indigo-500/40 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Completion Velocity</span>
            <div className="p-2 rounded-xl bg-emerald-500/10 text-emerald-400 group-hover:scale-110 transition-transform">
              <CheckCircle2 className="w-4 h-4" />
            </div>
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-2xl font-black text-white">{completionRate}%</span>
            <span className="text-xs text-slate-400">({completedTasks}/{totalTasks} tasks)</span>
          </div>
          <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
            <div
              className="bg-emerald-500 h-full rounded-full transition-all"
              style={{ width: `${completionRate}%` }}
            />
          </div>
        </div>

        {/* Card 3: Critical Risks */}
        <div
          onClick={() => setCurrentView('risks')}
          className="p-5 rounded-2xl glass-card hover:border-rose-500/40 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Risk Matrix Status</span>
            <div className="p-2 rounded-xl bg-rose-500/10 text-rose-400 group-hover:scale-110 transition-transform">
              <AlertTriangle className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{criticalRisks.length} High Risks</div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-amber-400">
            <span>{risks.filter((r) => r.status === 'Mitigating').length} currently mitigating</span>
          </div>
        </div>

        {/* Card 4: Automated Rules */}
        <div
          onClick={() => setCurrentView('automation')}
          className="p-5 rounded-2xl glass-card hover:border-purple-500/40 cursor-pointer transition-all group"
        >
          <div className="flex items-center justify-between mb-3">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider">Active Automations</span>
            <div className="p-2 rounded-xl bg-purple-500/10 text-purple-400 group-hover:scale-110 transition-transform">
              <Zap className="w-4 h-4" />
            </div>
          </div>
          <div className="text-2xl font-black text-white">{activeAutomationsCount} Rules</div>
          <div className="flex items-center gap-1.5 mt-2 text-[11px] text-purple-400">
            <span>147 triggers dispatched today</span>
          </div>
        </div>
      </div>

      {/* Middle Section: Active Projects Breakdown & Urgent Attention */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left 2 Cols: Projects Overview */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <Layers className="w-4 h-4 text-indigo-400" />
              Strategic Projects Portfolio
            </h2>
            <button
              onClick={() => setCurrentView('projects')}
              className="text-xs text-indigo-400 hover:text-indigo-300 font-medium flex items-center gap-1"
            >
              <span>Explore all</span>
              <ChevronRight className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="space-y-3">
            {projects.map((proj) => (
              <div
                key={proj.id}
                onClick={() => setCurrentView('projects')}
                className="p-4 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800/80 hover:border-indigo-500/40 transition-all cursor-pointer"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-mono text-xs font-bold text-indigo-400">[{proj.key}]</span>
                      <h3 className="text-sm font-bold text-white">{proj.name}</h3>
                      <span
                        className={`text-[10px] font-semibold px-2 py-0.2 rounded-full ${
                          proj.health === 'Healthy'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {proj.health}
                      </span>
                    </div>
                    <p className="text-xs text-slate-400 mt-1 max-w-xl line-clamp-1">{proj.description}</p>
                  </div>
                  <div className="text-right shrink-0">
                    <span className="text-sm font-black text-white">{proj.progress}%</span>
                    <span className="text-[10px] text-slate-500 block">Due {proj.deadline}</span>
                  </div>
                </div>

                <div className="w-full bg-slate-800 h-1.5 rounded-full mt-3 overflow-hidden">
                  <div
                    className="bg-gradient-to-r from-indigo-500 to-purple-500 h-full rounded-full transition-all"
                    style={{ width: `${proj.progress}%` }}
                  />
                </div>

                <div className="flex items-center justify-between mt-3 text-xs text-slate-400">
                  <div className="flex items-center gap-2">
                    <img
                      src={proj.owner.avatar}
                      alt={proj.owner.name}
                      className="w-5 h-5 rounded-full object-cover"
                    />
                    <span className="text-[11px] text-slate-300">Lead: {proj.owner.name}</span>
                  </div>
                  <div className="flex items-center gap-3 text-[11px]">
                    <span>Budget: ${proj.budget.actual.toLocaleString()} / ${proj.budget.estimated.toLocaleString()}</span>
                    <span>•</span>
                    <span>{proj.milestones.filter((m) => m.completed).length}/{proj.milestones.length} Milestones</span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right 1 Col: Urgent Attention & SLA Monitor */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider flex items-center gap-2">
              <ShieldAlert className="w-4 h-4 text-rose-400" />
              SLA & Urgent Items
            </h2>
            <span className="text-[10px] text-rose-400 bg-rose-500/10 px-2 py-0.5 rounded border border-rose-500/20 font-bold">
              {urgentTasks.length} Escalations
            </span>
          </div>

          <div className="space-y-2.5">
            {urgentTasks.map((t) => (
              <div
                key={t.id}
                onClick={() => setSelectedTask(t)}
                className="p-3.5 rounded-xl bg-slate-900/60 hover:bg-slate-900 border border-slate-800 hover:border-rose-500/40 cursor-pointer transition-all"
              >
                <div className="flex items-center justify-between mb-1.5">
                  <span className="font-mono text-[10px] text-rose-400 font-bold bg-rose-500/10 px-1.5 py-0.5 rounded">
                    {t.id}
                  </span>
                  <span className="text-[10px] text-slate-500">Due {t.dueDate}</span>
                </div>
                <h4 className="text-xs font-semibold text-slate-100 line-clamp-1">{t.title}</h4>
                <div className="flex items-center justify-between mt-2.5 pt-2 border-t border-slate-800/60 text-[11px]">
                  <div className="flex items-center gap-1.5">
                    <img src={t.assignee.avatar} alt={t.assignee.name} className="w-4 h-4 rounded-full" />
                    <span className="text-slate-400">{t.assignee.name}</span>
                  </div>
                  <span className="text-indigo-400 font-medium">{t.status}</span>
                </div>
              </div>
            ))}

            {/* Quick Action Box */}
            <div className="p-4 rounded-xl bg-gradient-to-br from-indigo-950/40 to-slate-900 border border-indigo-500/30">
              <h4 className="text-xs font-bold text-white mb-1">Escalation Policy Active</h4>
              <p className="text-[11px] text-slate-400 leading-snug">
                Tier-1 automatically dispatches alerts to Team Leads when tasks exceed SLA by 12 hours.
              </p>
              <button
                onClick={() => setCurrentView('automation')}
                className="mt-3 w-full py-1.5 rounded-lg bg-indigo-600/30 hover:bg-indigo-600/50 border border-indigo-500/40 text-indigo-300 text-xs font-semibold transition-colors"
              >
                Manage Escalation Rules
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
