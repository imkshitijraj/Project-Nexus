import React, { useState } from 'react';
import {
  Layers,
  CheckCircle2,
  AlertCircle,
  RefreshCw,
  ExternalLink,
  Power,
  GitBranch,
  MessageSquare,
  Folder,
  Calendar,
  Video
} from 'lucide-react';
import { useNexus } from '../../context/NexusContext';

export const IntegrationsView: React.FC = () => {
  const { integrations, toggleIntegration, showToast } = useNexus();
  const [activeCategory, setActiveCategory] = useState<string>('all');

  const categories = ['all', 'Development', 'Communication', 'Cloud Storage', 'Productivity'];

  const filtered = integrations.filter((i) =>
    activeCategory === 'all' ? true : i.category === activeCategory
  );

  const getCategoryIcon = (category: string) => {
    switch (category) {
      case 'Development':
        return <GitBranch className="w-5 h-5 text-indigo-400" />;
      case 'Communication':
        return <MessageSquare className="w-5 h-5 text-purple-400" />;
      case 'Cloud Storage':
        return <Folder className="w-5 h-5 text-blue-400" />;
      case 'Productivity':
        return <Calendar className="w-5 h-5 text-emerald-400" />;
      default:
        return <Layers className="w-5 h-5 text-slate-400" />;
    }
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
            Ecosystem Mesh
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Layers className="w-6 h-6 text-indigo-400" />
          Third-Party Integrations & Webhooks Hub
        </h1>
        <p className="text-xs text-slate-400 max-w-2xl mt-1">
          Bi-directionally bridge Nexus with your code repositories, team messaging channels, cloud assets, and calendar schedules.
        </p>
      </div>

      {/* Category Filter */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        {categories.map((cat) => (
          <button
            key={cat}
            onClick={() => setActiveCategory(cat)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold capitalize transition-colors ${
              activeCategory === cat
                ? 'bg-indigo-600 text-white'
                : 'text-slate-400 hover:text-slate-200 hover:bg-slate-900'
            }`}
          >
            {cat}
          </button>
        ))}
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
        {filtered.map((int) => (
          <div
            key={int.id}
            className={`p-5 rounded-2xl border transition-all flex flex-col justify-between space-y-4 ${
              int.connected
                ? 'bg-slate-900/70 border-slate-800 hover:border-indigo-500/40'
                : 'bg-slate-950/40 border-slate-800/40 opacity-75'
            }`}
          >
            <div>
              <div className="flex items-start justify-between">
                <div className="p-2.5 rounded-xl bg-slate-900 border border-slate-800">
                  {getCategoryIcon(int.category)}
                </div>
                <span
                  className={`text-[10px] font-semibold px-2 py-0.5 rounded-full flex items-center gap-1 ${
                    int.connected
                      ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  <span className={`w-1.5 h-1.5 rounded-full ${int.connected ? 'bg-emerald-400' : 'bg-slate-500'}`} />
                  {int.status}
                </span>
              </div>

              <h3 className="text-sm font-bold text-white mt-3">{int.name}</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">{int.description}</p>
            </div>

            <div className="pt-3 border-t border-slate-800/80 flex items-center justify-between">
              <span className="text-[10px] text-slate-500 font-mono">
                {int.lastSynced ? `Synced ${int.lastSynced}` : 'Not connected'}
              </span>

              <button
                onClick={() => toggleIntegration(int.id)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                  int.connected
                    ? 'bg-rose-500/10 text-rose-400 hover:bg-rose-500/20 border border-rose-500/30'
                    : 'bg-indigo-600 hover:bg-indigo-500 text-white'
                }`}
              >
                <Power className="w-3 h-3" />
                <span>{int.connected ? 'Disconnect' : 'Connect'}</span>
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};
