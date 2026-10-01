import React, { useState } from 'react';
import {
  Bell,
  X,
  CheckCheck,
  AlertOctagon,
  AtSign,
  Calendar,
  Zap,
  CheckCircle2
} from 'lucide-react';
import { useNexus } from '../../context/NexusContext';

export const NotificationDrawer: React.FC = () => {
  const {
    isNotificationDrawerOpen,
    setIsNotificationDrawerOpen,
    notifications,
    markNotificationAsRead,
    markAllNotificationsAsRead,
    unreadNotificationsCount
  } = useNexus();

  const [filter, setFilter] = useState<'all' | 'unread' | 'escalation'>('all');

  if (!isNotificationDrawerOpen) return null;

  const filtered = notifications.filter((n) => {
    if (filter === 'unread') return !n.read;
    if (filter === 'escalation') return n.type === 'escalation';
    return true;
  });

  const getIcon = (type: string) => {
    switch (type) {
      case 'escalation':
        return <AlertOctagon className="w-4 h-4 text-rose-400" />;
      case 'mention':
        return <AtSign className="w-4 h-4 text-indigo-400" />;
      case 'deadline':
        return <Calendar className="w-4 h-4 text-amber-400" />;
      case 'automation':
        return <Zap className="w-4 h-4 text-purple-400" />;
      default:
        return <Bell className="w-4 h-4 text-slate-400" />;
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-in fade-in duration-100">
      <div
        className="fixed inset-0"
        onClick={() => setIsNotificationDrawerOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-md bg-[#0f172a] border-l border-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Bell className="w-5 h-5 text-indigo-400" />
              <h2 className="text-base font-bold text-slate-100">Notifications</h2>
              {unreadNotificationsCount > 0 && (
                <span className="px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30 text-xs font-semibold">
                  {unreadNotificationsCount} unread
                </span>
              )}
            </div>
            <div className="flex items-center gap-2">
              {unreadNotificationsCount > 0 && (
                <button
                  onClick={markAllNotificationsAsRead}
                  title="Mark all as read"
                  className="p-1.5 rounded-lg text-slate-400 hover:text-indigo-400 hover:bg-slate-800 transition-colors"
                >
                  <CheckCheck className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => setIsNotificationDrawerOpen(false)}
                className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800/80 flex items-center gap-2">
            <button
              onClick={() => setFilter('all')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                filter === 'all' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              All ({notifications.length})
            </button>
            <button
              onClick={() => setFilter('unread')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                filter === 'unread' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Unread ({unreadNotificationsCount})
            </button>
            <button
              onClick={() => setFilter('escalation')}
              className={`px-2.5 py-1 rounded-md text-xs font-medium transition-colors ${
                filter === 'escalation' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Escalations
            </button>
          </div>

          {/* List */}
          <div className="flex-1 overflow-y-auto p-4 space-y-2.5">
            {filtered.length === 0 ? (
              <div className="text-center py-12 text-slate-500 text-xs">
                <CheckCircle2 className="w-8 h-8 mx-auto mb-2 text-slate-600" />
                No notifications to display in this view.
              </div>
            ) : (
              filtered.map((n) => (
                <div
                  key={n.id}
                  onClick={() => markNotificationAsRead(n.id)}
                  className={`p-3 rounded-xl border transition-all cursor-pointer ${
                    !n.read
                      ? 'bg-slate-800/70 border-indigo-500/40 shadow-sm'
                      : 'bg-slate-900/50 border-slate-800/80 hover:bg-slate-800/40'
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="p-2 rounded-lg bg-slate-900 border border-slate-800 shrink-0">
                      {getIcon(n.type)}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between mb-0.5">
                        <span className={`text-xs font-semibold ${!n.read ? 'text-white' : 'text-slate-300'}`}>
                          {n.title}
                        </span>
                        <span className="text-[10px] text-slate-500 shrink-0">{n.timestamp}</span>
                      </div>
                      <p className="text-xs text-slate-400 line-clamp-2">{n.description}</p>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
