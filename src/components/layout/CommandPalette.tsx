import React, { useState, useEffect } from 'react';
import {
  Search,
  FolderKanban,
  CheckSquare,
  FileText,
  AlertTriangle,
  Zap,
  Users,
  Settings,
  ArrowRight,
  X
} from 'lucide-react';
import { useNexus, NavigationView } from '../../context/NexusContext';

export const CommandPalette: React.FC = () => {
  const {
    isCommandPaletteOpen,
    setIsCommandPaletteOpen,
    projects,
    tasks,
    documents,
    setCurrentView,
    setSelectedTask,
    setActiveDocument
  } = useNexus();

  const [query, setQuery] = useState('');

  useEffect(() => {
    if (!isCommandPaletteOpen) {
      setQuery('');
    }
  }, [isCommandPaletteOpen]);

  if (!isCommandPaletteOpen) return null;

  const filteredProjects = projects.filter((p) =>
    p.name.toLowerCase().includes(query.toLowerCase()) || p.key.toLowerCase().includes(query.toLowerCase())
  );

  const filteredTasks = tasks.filter((t) =>
    t.title.toLowerCase().includes(query.toLowerCase()) || t.id.toLowerCase().includes(query.toLowerCase())
  );

  const filteredDocs = documents.filter((d) =>
    d.title.toLowerCase().includes(query.toLowerCase()) || d.category.toLowerCase().includes(query.toLowerCase())
  );

  const quickNavItems: { label: string; view: NavigationView; icon: React.ElementType }[] = [
    { label: 'Go to Kanban Board & Gantt', view: 'projects', icon: FolderKanban },
    { label: 'View Automation Engine', view: 'automation', icon: Zap },
    { label: 'Open Risk Register & 5x5 Matrix', view: 'risks', icon: AlertTriangle },
    { label: 'View Architecture Specifications', view: 'specs', icon: FileText },
    { label: 'Admin & Role Permissions', view: 'admin', icon: Settings },
  ];

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 p-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-100">
      <div
        className="fixed inset-0"
        onClick={() => setIsCommandPaletteOpen(false)}
      />

      <div className="relative w-full max-w-2xl bg-[#0f172a] border border-slate-700 rounded-2xl shadow-2xl overflow-hidden z-10">
        {/* Search input header */}
        <div className="flex items-center px-4 py-3.5 border-b border-slate-800 gap-3">
          <Search className="w-5 h-5 text-indigo-400 shrink-0" />
          <input
            type="text"
            placeholder="Type a command, project, task, or document..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-slate-100 placeholder:text-slate-500 text-sm focus:outline-none"
            autoFocus
          />
          <kbd className="text-[10px] font-mono bg-slate-800 border border-slate-700 px-2 py-0.5 rounded text-slate-400">
            ESC
          </kbd>
          <button
            onClick={() => setIsCommandPaletteOpen(false)}
            className="text-slate-400 hover:text-slate-200"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results Container */}
        <div className="max-h-[60vh] overflow-y-auto p-3 space-y-4">
          {/* Quick Nav if no query or general */}
          {!query && (
            <div>
              <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Quick Navigation
              </div>
              <div className="space-y-1">
                {quickNavItems.map((item) => {
                  const Icon = item.icon;
                  return (
                    <button
                      key={item.view}
                      onClick={() => {
                        setCurrentView(item.view);
                        setIsCommandPaletteOpen(false);
                      }}
                      className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-slate-800/80 hover:text-white transition-colors"
                    >
                      <div className="flex items-center gap-2.5">
                        <Icon className="w-4 h-4 text-indigo-400" />
                        <span>{item.label}</span>
                      </div>
                      <ArrowRight className="w-3.5 h-3.5 text-slate-500" />
                    </button>
                  );
                })}
              </div>
            </div>
          )}

          {/* Tasks Results */}
          {filteredTasks.length > 0 && (
            <div>
              <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Tasks ({filteredTasks.length})
              </div>
              <div className="space-y-1">
                {filteredTasks.slice(0, 5).map((t) => (
                  <button
                    key={t.id}
                    onClick={() => {
                      setSelectedTask(t);
                      setCurrentView('projects');
                      setIsCommandPaletteOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-slate-800/80 hover:text-white transition-colors group"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <span className="font-mono text-[10px] px-1.5 py-0.5 rounded bg-slate-800 text-indigo-300 border border-slate-700">
                        {t.id}
                      </span>
                      <span className="truncate">{t.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-500 uppercase">{t.status}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Projects Results */}
          {filteredProjects.length > 0 && (
            <div>
              <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Projects ({filteredProjects.length})
              </div>
              <div className="space-y-1">
                {filteredProjects.map((p) => (
                  <button
                    key={p.id}
                    onClick={() => {
                      setCurrentView('projects');
                      setIsCommandPaletteOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-slate-800/80 hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <FolderKanban className="w-4 h-4 text-purple-400" />
                      <span className="truncate">{p.name}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">{p.progress}% progress</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Docs Results */}
          {filteredDocs.length > 0 && (
            <div>
              <div className="px-2 pb-1.5 text-[10px] font-bold uppercase tracking-wider text-slate-400">
                Documents & RFCs ({filteredDocs.length})
              </div>
              <div className="space-y-1">
                {filteredDocs.map((d) => (
                  <button
                    key={d.id}
                    onClick={() => {
                      setActiveDocument(d);
                      setCurrentView('docs');
                      setIsCommandPaletteOpen(false);
                    }}
                    className="w-full flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-300 hover:bg-slate-800/80 hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-2.5 truncate">
                      <FileText className="w-4 h-4 text-emerald-400" />
                      <span className="truncate">{d.title}</span>
                    </div>
                    <span className="text-[10px] text-slate-500">{d.category}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {filteredTasks.length === 0 && filteredProjects.length === 0 && filteredDocs.length === 0 && query && (
            <div className="text-center py-8 text-xs text-slate-500">
              No matching tasks, projects, or documents found for "{query}".
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2 bg-slate-950/80 border-t border-slate-800 flex items-center justify-between text-[11px] text-slate-500">
          <div className="flex items-center gap-3">
            <span>Navigate: <kbd className="font-mono bg-slate-800 px-1 py-0.5 rounded text-slate-400">↑↓</kbd></span>
            <span>Select: <kbd className="font-mono bg-slate-800 px-1 py-0.5 rounded text-slate-400">↵</kbd></span>
          </div>
          <span>Project Nexus Command Engine</span>
        </div>
      </div>
    </div>
  );
};
