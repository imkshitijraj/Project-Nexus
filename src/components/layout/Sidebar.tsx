import React, { useState } from 'react';
import {
  LayoutDashboard,
  FolderKanban,
  Zap,
  AlertTriangle,
  MessagesSquare,
  BookOpen,
  Calendar,
  Layers,
  BarChart3,
  CircleDollarSign,
  ShieldCheck,
  FileText,
  Settings,
  Terminal,
  ScrollText,
  ChevronDown,
  Building2,
  Check,
  Sparkles,
  Bot,
  Lock,
  LogOut
} from 'lucide-react';
import { useNexus, NavigationView } from '../../context/NexusContext';

interface NavItem {
  id: NavigationView;
  label: string;
  icon: React.ElementType;
  badge?: string | number;
  highlight?: boolean;
}

export const Sidebar: React.FC = () => {
  const {
    currentView,
    setCurrentView,
    activeWorkspace,
    setActiveWorkspace,
    workspaces,
    currentUser,
    setIsAICopilotOpen,
    tasks,
    risks,
    logout,
    lockSession,
    lockWorkspace
  } = useNexus();

  const [workspaceMenuOpen, setWorkspaceMenuOpen] = useState(false);

  const urgentTasksCount = tasks.filter((t) => t.priority === 'Urgent' && t.status !== 'Completed').length;
  const highRisksCount = risks.filter((r) => r.impactScore >= 12 && r.status !== 'Closed').length;

  const coreNav: NavItem[] = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'projects', label: 'Projects & Tasks', icon: FolderKanban, badge: urgentTasksCount > 0 ? `${urgentTasksCount} urgent` : undefined },
    { id: 'automation', label: 'Automations', icon: Zap },
    { id: 'risks', label: 'Risk Matrix', icon: AlertTriangle, badge: highRisksCount > 0 ? `${highRisksCount} high` : undefined },
    { id: 'collaboration', label: 'Team Chat', icon: MessagesSquare },
    { id: 'docs', label: 'Knowledge Base', icon: BookOpen },
    { id: 'calendar', label: 'Calendar & SLA', icon: Calendar },
  ];

  const enterpriseNav: NavItem[] = [
    { id: 'analytics', label: 'Analytics & Reports', icon: BarChart3 },
    { id: 'budget', label: 'Budget Management', icon: CircleDollarSign },
    { id: 'integrations', label: 'Integrations Hub', icon: Layers },
    { id: 'security', label: 'Security & RBAC', icon: ShieldCheck },
    { id: 'audit', label: 'Audit Trail', icon: FileText },
    { id: 'admin', label: 'Admin Governance', icon: Settings },
  ];

  const developerNav: NavItem[] = [
    { id: 'api-docs', label: 'API & Schemas', icon: Terminal },
    { id: 'specs', label: 'Project 36 Specs', icon: ScrollText, highlight: true },
  ];

  return (
    <aside className="w-64 bg-[#0d131f] border-r border-slate-800/80 flex flex-col h-screen select-none z-30 shrink-0">
      {/* Brand Header */}
      <div className="h-16 px-4 flex items-center justify-between border-b border-slate-800/80">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/25">
            <Sparkles className="w-4 h-4 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="font-bold text-base tracking-tight text-white">NEXUS</span>
              <span className="text-[10px] font-semibold uppercase tracking-wider px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                PRO
              </span>
            </div>
            <p className="text-[10px] text-slate-400 leading-tight">Unified Work & Intelligence</p>
          </div>
        </div>
      </div>

      {/* Workspace Switcher */}
      <div className="p-3 relative">
        <button
          onClick={() => setWorkspaceMenuOpen(!workspaceMenuOpen)}
          className="w-full flex items-center justify-between px-3 py-2 rounded-lg bg-slate-900/80 hover:bg-slate-800 border border-slate-800 text-left transition-colors group"
        >
          <div className="flex items-center gap-2.5 overflow-hidden">
            <div className="w-7 h-7 rounded bg-indigo-950 border border-indigo-800/60 flex items-center justify-center shrink-0">
              <Building2 className="w-3.5 h-3.5 text-indigo-400" />
            </div>
            <div className="truncate">
              <div className="text-xs font-semibold text-slate-200 truncate">{activeWorkspace.name}</div>
              <div className="text-[10px] text-slate-400">{activeWorkspace.plan} Plan</div>
            </div>
          </div>
          <ChevronDown className="w-3.5 h-3.5 text-slate-400 group-hover:text-slate-200 transition-transform shrink-0" />
        </button>

        {/* Workspace Dropdown */}
        {workspaceMenuOpen && (
          <>
            <div
              className="fixed inset-0 z-40"
              onClick={() => setWorkspaceMenuOpen(false)}
            />
            <div className="absolute top-14 left-3 right-3 z-50 glass-dropdown rounded-xl p-1.5 shadow-2xl border border-slate-700/80 animate-in fade-in zoom-in-95 duration-100">
              <div className="px-2.5 py-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Select Workspace
              </div>
              {workspaces.map((ws) => (
                <button
                  key={ws.id}
                  onClick={() => {
                    setActiveWorkspace(ws);
                    setWorkspaceMenuOpen(false);
                  }}
                  className={`w-full flex items-center justify-between px-2.5 py-2 rounded-lg text-xs transition-colors ${
                    activeWorkspace.id === ws.id
                      ? 'bg-indigo-600/20 text-indigo-300 font-medium'
                      : 'text-slate-300 hover:bg-slate-800/80'
                  }`}
                >
                  <div className="truncate text-left flex items-center gap-2">
                    {ws.isPasswordProtected && (
                      <div className="w-5 h-5 rounded bg-indigo-950 border border-indigo-800/60 flex items-center justify-center shrink-0">
                        <Lock className="w-2.5 h-2.5 text-amber-400" />
                      </div>
                    )}
                    <div className="truncate">
                      <div>{ws.name}</div>
                      <div className="text-[10px] text-slate-500">{ws.organization}</div>
                    </div>
                  </div>
                  {activeWorkspace.id === ws.id && (
                    <Check className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  )}
                </button>
              ))}
            </div>
          </>
        )}
      </div>

      {/* Navigation Sections */}
      <div className="flex-1 overflow-y-auto px-3 space-y-6 py-2">
        {/* Core Workspace Section */}
        <div>
          <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Workspaces & Projects
          </div>
          <div className="space-y-0.5">
            {coreNav.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.badge && (
                    <span
                      className={`text-[10px] font-semibold px-1.5 py-0.2 rounded-full ${
                        isActive
                          ? 'bg-indigo-700/80 text-white'
                          : 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>

        {/* Enterprise Governance Section */}
        <div>
          <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Operations & Control
          </div>
          <div className="space-y-0.5">
            {enterpriseNav.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                </button>
              );
            })}
          </div>
        </div>

        {/* Developer Specification Section */}
        <div>
          <div className="px-3 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
            Handoff & Architecture
          </div>
          <div className="space-y-0.5">
            {developerNav.map((item) => {
              const Icon = item.icon;
              const isActive = currentView === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setCurrentView(item.id)}
                  className={`w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-indigo-600 text-white shadow-md shadow-indigo-600/25'
                      : item.highlight
                      ? 'text-indigo-300 bg-indigo-950/40 border border-indigo-800/40 hover:bg-indigo-900/60'
                      : 'text-slate-300 hover:text-white hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className={`w-4 h-4 ${isActive ? 'text-white' : item.highlight ? 'text-indigo-400' : 'text-slate-400'}`} />
                    <span>{item.label}</span>
                  </div>
                  {item.highlight && !isActive && (
                    <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                      Outline
                    </span>
                  )}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/* AI Copilot Quick Launcher banner */}
      <div className="px-3 py-2">
        <button
          onClick={() => setIsAICopilotOpen(true)}
          className="w-full flex items-center justify-between p-2.5 rounded-xl bg-gradient-to-r from-purple-950/60 via-indigo-950/60 to-slate-900 border border-indigo-500/30 hover:border-indigo-400 text-left transition-all group shadow-sm hover:shadow-indigo-500/10"
        >
          <div className="flex items-center gap-2">
            <div className="w-6 h-6 rounded-md bg-indigo-500/20 flex items-center justify-center text-indigo-400 group-hover:scale-105 transition-transform">
              <Bot className="w-3.5 h-3.5" />
            </div>
            <div>
              <div className="text-[11px] font-semibold text-indigo-200">AI Project Copilot</div>
              <div className="text-[9px] text-slate-400">Ask or generate tasks</div>
            </div>
          </div>
          <span className="text-[10px] font-mono text-indigo-400 bg-indigo-500/10 px-1.5 py-0.5 rounded border border-indigo-500/20">
            Open
          </span>
        </button>
      </div>

      {/* Current User Bar */}
      <div className="p-3 border-t border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center gap-2.5 overflow-hidden">
          <div className="relative shrink-0">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-8 h-8 rounded-full object-cover border border-slate-700"
            />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 rounded-full bg-emerald-500 ring-2 ring-[#0d131f]" />
          </div>
          <div className="truncate">
            <div className="text-xs font-semibold text-slate-200 truncate flex items-center gap-1">
              <span>{currentUser.name}</span>
              {currentUser.isProjectLead && (
                <span className="text-[9px] text-amber-400 font-bold">★</span>
              )}
            </div>
            <div className="text-[10px] text-slate-400 truncate">{currentUser.role}</div>
          </div>
        </div>

        {/* Security Controls */}
        <div className="flex items-center gap-1">
          {activeWorkspace.isPasswordProtected && (
            <button
              onClick={lockWorkspace}
              title="Lock Workspace Vault (Enforce Passkey)"
              className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
            >
              <ShieldCheck className="w-3.5 h-3.5" />
            </button>
          )}
          <button
            onClick={lockSession}
            title="Lock Session (PIN 1234)"
            className="p-1.5 rounded-lg text-slate-400 hover:text-amber-400 hover:bg-slate-800 transition-colors"
          >
            <Lock className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={logout}
            title="Sign Out"
            className="p-1.5 rounded-lg text-slate-400 hover:text-rose-400 hover:bg-slate-800 transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
};
