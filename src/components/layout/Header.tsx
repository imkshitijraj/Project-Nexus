import React, { useState } from 'react';
import {
  Search,
  Plus,
  Bell,
  Sparkles,
  ChevronDown,
  Layers,
  Activity,
  CheckCircle2,
  X,
  Lock,
  LogOut,
  User as UserIcon,
  Shield
} from 'lucide-react';
import { useNexus } from '../../context/NexusContext';

export const Header: React.FC = () => {
  const {
    currentView,
    projects,
    activeProjectId,
    setActiveProjectId,
    setIsCommandPaletteOpen,
    setIsNotificationDrawerOpen,
    unreadNotificationsCount,
    setIsAICopilotOpen,
    addTask,
    showToast,
    currentUser,
    users,
    switchUser,
    logout,
    lockSession,
    activeWorkspace,
    lockWorkspace
  } = useNexus();

  const [projectMenuOpen, setProjectMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const [quickTaskModalOpen, setQuickTaskModalOpen] = useState(false);
  const [taskTitle, setTaskTitle] = useState('');
  const [taskPriority, setTaskPriority] = useState<'Urgent' | 'High' | 'Medium' | 'Low'>('High');

  const activeProject = projects.find((p) => p.id === activeProjectId);

  const handleQuickCreateTask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!taskTitle.trim()) return;
    addTask({
      title: taskTitle.trim(),
      priority: taskPriority,
      projectId: activeProjectId || projects[0].id,
      status: 'To Do'
    });
    setTaskTitle('');
    setQuickTaskModalOpen(false);
  };

  const viewTitles: Record<string, string> = {
    dashboard: 'Executive Mission Control',
    projects: 'Project & Workflow Management',
    automation: 'Workflow Automation & Rules Engine',
    risks: 'Enterprise Risk Register & Matrix',
    collaboration: 'Real-Time Team Collaboration',
    docs: 'Knowledge Base & Architecture Docs',
    calendar: 'Chronological Calendar & Deadlines',
    integrations: 'Integrations & Webhook Hub',
    analytics: 'Performance & Velocity Analytics',
    budget: 'Budget & Financial Governance',
    security: 'Security, RBAC & Policy Controls',
    audit: 'Immutable Audit Trail & Activity Logs',
    admin: 'Organization & Workspace Administration',
    'api-docs': 'REST API & Database Schema Explorer',
    specs: 'Project Nexus 36-Section Full Specification'
  };

  return (
    <>
      <header className="h-16 px-6 bg-[#0d131f]/90 backdrop-blur-md border-b border-slate-800/80 flex items-center justify-between sticky top-0 z-20">
        {/* Left: Breadcrumb / Project Selector */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="text-sm font-semibold text-slate-100">
              {viewTitles[currentView] || 'Project Nexus'}
            </span>
          </div>

          <span className="text-slate-600">/</span>

          {/* Project Dropdown */}
          <div className="relative">
            <button
              onClick={() => setProjectMenuOpen(!projectMenuOpen)}
              className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-300 transition-colors"
            >
              <Layers className="w-3.5 h-3.5 text-indigo-400" />
              <span className="max-w-[180px] truncate">
                {activeProject ? activeProject.name : 'All Projects'}
              </span>
              <ChevronDown className="w-3 h-3 text-slate-400" />
            </button>

            {projectMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setProjectMenuOpen(false)} />
                <div className="absolute top-10 left-0 w-64 glass-dropdown rounded-xl p-1.5 shadow-2xl z-50 border border-slate-700/80">
                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                    Filter by Project
                  </div>
                  <button
                    onClick={() => {
                      setActiveProjectId(null);
                      setProjectMenuOpen(false);
                    }}
                    className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-left ${
                      activeProjectId === null ? 'bg-indigo-600/20 text-indigo-300 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                    }`}
                  >
                    <span>All Projects (Overview)</span>
                  </button>
                  {projects.map((proj) => (
                    <button
                      key={proj.id}
                      onClick={() => {
                        setActiveProjectId(proj.id);
                        setProjectMenuOpen(false);
                      }}
                      className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs text-left truncate ${
                        activeProjectId === proj.id ? 'bg-indigo-600/20 text-indigo-300 font-semibold' : 'text-slate-300 hover:bg-slate-800'
                      }`}
                    >
                      <div className="truncate">
                        <span className="font-mono text-[10px] text-slate-400 mr-1.5">[{proj.key}]</span>
                        <span>{proj.name}</span>
                      </div>
                    </button>
                  ))}
                </div>
              </>
            )}
          </div>
        </div>

        {/* Center: Omnisearch bar trigger */}
        <div className="hidden md:flex items-center">
          <button
            onClick={() => setIsCommandPaletteOpen(true)}
            className="flex items-center justify-between w-80 px-3 py-1.5 rounded-lg bg-slate-900/90 hover:bg-slate-800/90 border border-slate-800 text-xs text-slate-400 hover:text-slate-300 transition-colors shadow-inner"
          >
            <div className="flex items-center gap-2">
              <Search className="w-3.5 h-3.5 text-slate-400" />
              <span>Search projects, tasks, docs...</span>
            </div>
            <kbd className="text-[10px] font-mono bg-slate-800 border border-slate-700 px-1.5 py-0.5 rounded text-slate-400">
              ⌘K
            </kbd>
          </button>
        </div>

        {/* Right: Actions & Tools */}
        <div className="flex items-center gap-2.5">
          {/* System Pulse */}
          <div className="hidden lg:flex items-center gap-1.5 px-2 py-1 rounded bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-[11px] font-medium">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            <span>Operational (28ms)</span>
          </div>

          {/* AI Copilot Button */}
          <button
            onClick={() => setIsAICopilotOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gradient-to-r from-purple-600/20 to-indigo-600/20 hover:from-purple-600/30 hover:to-indigo-600/30 border border-indigo-500/40 text-indigo-300 text-xs font-semibold transition-all shadow-sm shadow-indigo-500/10"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400" />
            <span className="hidden sm:inline">AI Copilot</span>
          </button>

          {/* New Task Button */}
          <button
            onClick={() => setQuickTaskModalOpen(true)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold transition-colors shadow-md shadow-indigo-600/30"
          >
            <Plus className="w-3.5 h-3.5" />
            <span className="hidden sm:inline">New Task</span>
          </button>

          {/* Notification Bell */}
          <button
            onClick={() => setIsNotificationDrawerOpen(true)}
            className="relative p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-white transition-colors"
          >
            <Bell className="w-4 h-4" />
            {unreadNotificationsCount > 0 && (
              <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-rose-500 ring-2 ring-[#0d131f]" />
            )}
          </button>

          {/* Workspace Password-Protection Lock Button */}
          {activeWorkspace.isPasswordProtected && (
            <button
              onClick={lockWorkspace}
              title={`Lock ${activeWorkspace.name} (Requires passkey to re-open)`}
              className="hidden lg:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-indigo-950/70 hover:bg-indigo-900/90 border border-indigo-500/40 text-indigo-300 hover:text-white text-xs font-semibold transition-all group shadow-sm"
            >
              <Shield className="w-3.5 h-3.5 text-indigo-400 group-hover:hidden" />
              <Lock className="w-3.5 h-3.5 text-amber-400 hidden group-hover:inline" />
              <span>Lock Workspace</span>
            </button>
          )}

          {/* Workstation Lock Button */}
          <button
            onClick={lockSession}
            title="Lock Workstation (PIN: 1234)"
            className="p-2 rounded-lg bg-slate-900 hover:bg-slate-800 border border-slate-800 text-slate-300 hover:text-amber-400 transition-colors"
          >
            <Lock className="w-4 h-4" />
          </button>

          {/* User Profile Pill & Dropdown */}
          <div className="relative">
            <button
              onClick={() => setUserMenuOpen(!userMenuOpen)}
              className="flex items-center gap-2 pl-2 pr-2.5 py-1 rounded-xl bg-slate-900 hover:bg-slate-800 border border-slate-800 text-xs font-medium text-slate-200 transition-colors group"
            >
              <img
                src={currentUser.avatar}
                alt={currentUser.name}
                className="w-6 h-6 rounded-full object-cover border border-slate-700"
              />
              <span className="hidden sm:inline font-semibold">{currentUser.name.split(' ')[0]}</span>
              <ChevronDown className="w-3 h-3 text-slate-400 group-hover:text-slate-200" />
            </button>

            {userMenuOpen && (
              <>
                <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                <div className="absolute top-11 right-0 w-64 glass-dropdown rounded-2xl p-2 shadow-2xl z-50 border border-slate-700/80 animate-in fade-in zoom-in-95">
                  <div className="p-2.5 border-b border-slate-800/80 mb-1">
                    <div className="font-bold text-xs text-white flex items-center gap-1.5">
                      <span>{currentUser.name}</span>
                      {currentUser.isProjectLead && (
                        <span className="text-[9px] px-1 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                          Lead
                        </span>
                      )}
                    </div>
                    <div className="text-[10px] text-slate-400 font-mono mt-0.5">{currentUser.email}</div>
                    <div className="text-[10px] font-semibold text-indigo-400 mt-1">{currentUser.role}</div>
                  </div>

                  <div className="px-2 py-1 text-[10px] font-bold uppercase tracking-wider text-slate-500">
                    Switch Evaluator Persona
                  </div>
                  <div className="space-y-0.5 max-h-36 overflow-y-auto">
                    {users.map((u) => (
                      <button
                        key={u.id}
                        onClick={() => {
                          switchUser(u);
                          setUserMenuOpen(false);
                        }}
                        className={`w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                          currentUser.id === u.id
                            ? 'bg-indigo-600/20 text-indigo-300 font-semibold'
                            : 'text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span className="truncate">{u.name}</span>
                        <span className="text-[10px] text-slate-500">{u.role}</span>
                      </button>
                    ))}
                  </div>

                  <div className="pt-1.5 mt-1 border-t border-slate-800/80 space-y-0.5">
                    {activeWorkspace.isPasswordProtected && (
                      <button
                        onClick={() => {
                          lockWorkspace();
                          setUserMenuOpen(false);
                        }}
                        className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-indigo-300 hover:bg-indigo-500/10 transition-colors"
                      >
                        <Shield className="w-3.5 h-3.5" />
                        <span>Lock Workspace Vault</span>
                      </button>
                    )}
                    <button
                      onClick={() => {
                        lockSession();
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-amber-300 hover:bg-amber-500/10 transition-colors"
                    >
                      <Lock className="w-3.5 h-3.5" />
                      <span>Lock Workstation (PIN: 1234)</span>
                    </button>
                    <button
                      onClick={() => {
                        logout();
                        setUserMenuOpen(false);
                      }}
                      className="w-full flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-xs text-rose-400 hover:bg-rose-500/10 transition-colors"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Sign Out</span>
                    </button>
                  </div>
                </div>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Quick Task Modal */}
      {quickTaskModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#111827] border border-slate-700/80 rounded-2xl w-full max-w-lg p-5 shadow-2xl relative">
            <div className="flex items-center justify-between pb-3 border-b border-slate-800">
              <h3 className="text-base font-bold text-slate-100 flex items-center gap-2">
                <Plus className="w-4 h-4 text-indigo-400" />
                Create New Task
              </h3>
              <button
                onClick={() => setQuickTaskModalOpen(false)}
                className="p-1 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <form onSubmit={handleQuickCreateTask} className="mt-4 space-y-4">
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Task Title <span className="text-rose-400">*</span>
                </label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Implement resilient Redis retry mechanism..."
                  value={taskTitle}
                  onChange={(e) => setTaskTitle(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 text-sm focus:outline-none focus:border-indigo-500 placeholder:text-slate-500"
                  autoFocus
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Priority
                  </label>
                  <select
                    value={taskPriority}
                    onChange={(e) => setTaskPriority(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-indigo-500"
                  >
                    <option value="Urgent">Urgent</option>
                    <option value="High">High</option>
                    <option value="Medium">Medium</option>
                    <option value="Low">Low</option>
                  </select>
                </div>
                <div>
                  <label className="block text-xs font-medium text-slate-300 mb-1.5">
                    Project Destination
                  </label>
                  <select
                    value={activeProjectId || projects[0].id}
                    onChange={(e) => setActiveProjectId(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-200 text-xs focus:outline-none focus:border-indigo-500 truncate"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setQuickTaskModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-300"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-xs font-semibold text-white shadow-md shadow-indigo-600/30"
                >
                  Create Task
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </>
  );
};
