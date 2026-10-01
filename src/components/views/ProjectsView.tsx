import React, { useState } from 'react';
import {
  Kanban,
  ListFilter,
  Table as TableIcon,
  Calendar as CalendarIcon,
  Clock,
  GitBranch,
  Plus,
  Filter,
  Search,
  MoreVertical,
  CheckCircle2,
  Clock3,
  Calendar,
  AlertCircle,
  Tag,
  ArrowRight
} from 'lucide-react';
import { useNexus } from '../../context/NexusContext';
import { Task, TaskStatus, TaskPriority } from '../../types';

type ProjectViewMode = 'kanban' | 'list' | 'table' | 'calendar' | 'timeline' | 'gantt';

export const ProjectsView: React.FC = () => {
  const {
    tasks,
    projects,
    activeProjectId,
    updateTaskStatus,
    setSelectedTask,
    addTask
  } = useNexus();

  const [viewMode, setViewMode] = useState<ProjectViewMode>('kanban');
  const [searchQuery, setSearchQuery] = useState('');
  const [priorityFilter, setPriorityFilter] = useState<string>('all');

  const activeProject = projects.find((p) => p.id === activeProjectId);

  // Filter tasks by active project and filters
  const filteredTasks = tasks.filter((t) => {
    if (activeProjectId && t.projectId !== activeProjectId) return false;
    if (priorityFilter !== 'all' && t.priority !== priorityFilter) return false;
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      return (
        t.title.toLowerCase().includes(q) ||
        t.id.toLowerCase().includes(q) ||
        t.tags.some((tag) => tag.toLowerCase().includes(q))
      );
    }
    return true;
  });

  const columns: { status: TaskStatus; label: string; color: string }[] = [
    { status: 'Backlog', label: 'Backlog', color: 'border-slate-700' },
    { status: 'To Do', label: 'To Do', color: 'border-blue-500/40' },
    { status: 'In Progress', label: 'In Progress', color: 'border-amber-500/40' },
    { status: 'In Review', label: 'In Review', color: 'border-purple-500/40' },
    { status: 'Completed', label: 'Completed', color: 'border-emerald-500/40' }
  ];

  const getPriorityBadge = (p: TaskPriority) => {
    switch (p) {
      case 'Urgent':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-rose-500/20 text-rose-400 border border-rose-500/30">Urgent</span>;
      case 'High':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-bold bg-amber-500/20 text-amber-400 border border-amber-500/30">High</span>;
      case 'Medium':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-blue-500/20 text-blue-400 border border-blue-500/30">Medium</span>;
      case 'Low':
        return <span className="px-1.5 py-0.5 rounded text-[10px] font-medium bg-slate-700 text-slate-400">Low</span>;
    }
  };

  return (
    <div className="flex flex-col h-full overflow-hidden animate-in fade-in duration-200">
      {/* View Sub-Header / Controls */}
      <div className="px-6 py-3 border-b border-slate-800/80 bg-[#0d131f]/70 flex flex-wrap items-center justify-between gap-4 shrink-0">
        {/* Left: View Tabs */}
        <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-xl border border-slate-800">
          <button
            onClick={() => setViewMode('kanban')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'kanban' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Kanban className="w-3.5 h-3.5" />
            <span>Kanban</span>
          </button>
          <button
            onClick={() => setViewMode('list')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'list' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <ListFilter className="w-3.5 h-3.5" />
            <span>List</span>
          </button>
          <button
            onClick={() => setViewMode('table')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'table' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <TableIcon className="w-3.5 h-3.5" />
            <span>Table</span>
          </button>
          <button
            onClick={() => setViewMode('calendar')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'calendar' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <CalendarIcon className="w-3.5 h-3.5" />
            <span>Calendar</span>
          </button>
          <button
            onClick={() => setViewMode('timeline')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'timeline' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Clock className="w-3.5 h-3.5" />
            <span>Timeline</span>
          </button>
          <button
            onClick={() => setViewMode('gantt')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              viewMode === 'gantt' ? 'bg-indigo-600 text-white shadow-sm' : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <GitBranch className="w-3.5 h-3.5" />
            <span>Gantt</span>
          </button>
        </div>

        {/* Right: Filters and Search */}
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
            <input
              type="text"
              placeholder="Filter tasks..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
            />
          </div>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="px-2.5 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-300 focus:outline-none"
          >
            <option value="all">All Priorities</option>
            <option value="Urgent">Urgent</option>
            <option value="High">High</option>
            <option value="Medium">Medium</option>
            <option value="Low">Low</option>
          </select>

          <span className="text-xs text-slate-400 font-mono">
            {filteredTasks.length} tasks
          </span>
        </div>
      </div>

      {/* Main View Area */}
      <div className="flex-1 overflow-auto p-6">
        {/* ================= 1. KANBAN BOARD VIEW ================= */}
        {viewMode === 'kanban' && (
          <div className="flex gap-4 h-full min-w-max pb-4">
            {columns.map((col) => {
              const colTasks = filteredTasks.filter((t) => t.status === col.status);
              return (
                <div
                  key={col.status}
                  className="w-72 flex flex-col rounded-2xl bg-slate-900/40 border border-slate-800/80 p-3"
                >
                  {/* Column Header */}
                  <div className="flex items-center justify-between pb-3 px-1 border-b border-slate-800/60 mb-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-slate-200 uppercase tracking-wider">
                        {col.label}
                      </span>
                      <span className="text-[11px] font-semibold font-mono text-slate-400 px-1.5 py-0.2 rounded-full bg-slate-800">
                        {colTasks.length}
                      </span>
                    </div>
                    <button
                      onClick={() =>
                        addTask({
                          status: col.status,
                          projectId: activeProjectId || projects[0].id
                        })
                      }
                      className="p-1 rounded text-slate-400 hover:text-white hover:bg-slate-800"
                    >
                      <Plus className="w-3.5 h-3.5" />
                    </button>
                  </div>

                  {/* Task Cards Column */}
                  <div className="flex-1 overflow-y-auto space-y-2.5 pr-1">
                    {colTasks.map((task) => (
                      <div
                        key={task.id}
                        onClick={() => setSelectedTask(task)}
                        className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/50 hover:shadow-lg hover:shadow-indigo-500/5 transition-all cursor-pointer group"
                      >
                        <div className="flex items-center justify-between mb-2">
                          <span className="font-mono text-[10px] text-indigo-400 font-bold">
                            {task.id}
                          </span>
                          {getPriorityBadge(task.priority)}
                        </div>

                        <h4 className="text-xs font-semibold text-white group-hover:text-indigo-300 transition-colors line-clamp-2">
                          {task.title}
                        </h4>

                        {/* Tags */}
                        {task.tags.length > 0 && (
                          <div className="flex flex-wrap gap-1 mt-2.5">
                            {task.tags.slice(0, 2).map((t) => (
                              <span
                                key={t}
                                className="text-[10px] px-1.5 py-0.2 rounded bg-slate-800 text-slate-400"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        )}

                        {/* Card Footer */}
                        <div className="flex items-center justify-between mt-3 pt-2.5 border-t border-slate-800/80 text-[11px] text-slate-400">
                          <div className="flex items-center gap-1.5">
                            <img
                              src={task.assignee.avatar}
                              alt={task.assignee.name}
                              className="w-4 h-4 rounded-full object-cover"
                            />
                            <span className="truncate max-w-[80px]">{task.assignee.name.split(' ')[0]}</span>
                          </div>

                          <div className="flex items-center gap-2 text-[10px]">
                            {task.subtasks.length > 0 && (
                              <span className="flex items-center gap-1">
                                <CheckCircle2 className="w-3 h-3 text-slate-500" />
                                {task.subtasks.filter((s) => s.completed).length}/{task.subtasks.length}
                              </span>
                            )}
                            <span className="flex items-center gap-1 text-slate-500">
                              <Calendar className="w-3 h-3" />
                              {task.dueDate.slice(5)}
                            </span>
                          </div>
                        </div>

                        {/* Move Stage Quick Actions */}
                        <div
                          onClick={(e) => e.stopPropagation()}
                          className="mt-2.5 pt-2 border-t border-slate-800/40 flex items-center justify-between opacity-0 group-hover:opacity-100 transition-opacity text-[10px]"
                        >
                          <span className="text-slate-500">Move:</span>
                          <div className="flex gap-1">
                            {col.status !== 'To Do' && (
                              <button
                                onClick={() => updateTaskStatus(task.id, 'To Do')}
                                className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                              >
                                To Do
                              </button>
                            )}
                            {col.status !== 'In Progress' && (
                              <button
                                onClick={() => updateTaskStatus(task.id, 'In Progress')}
                                className="px-1.5 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300"
                              >
                                Work
                              </button>
                            )}
                            {col.status !== 'Completed' && (
                              <button
                                onClick={() => updateTaskStatus(task.id, 'Completed')}
                                className="px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-400 hover:bg-emerald-900"
                              >
                                Done
                              </button>
                            )}
                          </div>
                        </div>
                      </div>
                    ))}

                    {colTasks.length === 0 && (
                      <div className="text-center py-8 text-xs text-slate-600 border border-dashed border-slate-800 rounded-xl">
                        No tasks in {col.label}
                      </div>
                    )}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ================= 2. LIST VIEW ================= */}
        {viewMode === 'list' && (
          <div className="max-w-5xl mx-auto space-y-4">
            {columns.map((col) => {
              const colTasks = filteredTasks.filter((t) => t.status === col.status);
              if (colTasks.length === 0) return null;
              return (
                <div key={col.status} className="rounded-xl border border-slate-800 bg-slate-900/50 overflow-hidden">
                  <div className="px-4 py-2.5 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      {col.label} ({colTasks.length})
                    </span>
                  </div>
                  <div className="divide-y divide-slate-800/60">
                    {colTasks.map((t) => (
                      <div
                        key={t.id}
                        onClick={() => setSelectedTask(t)}
                        className="px-4 py-3 hover:bg-slate-800/40 flex items-center justify-between gap-4 cursor-pointer text-xs"
                      >
                        <div className="flex items-center gap-3 min-w-0">
                          <span className="font-mono text-[10px] text-indigo-400 font-bold shrink-0">{t.id}</span>
                          <span className="font-medium text-slate-100 truncate">{t.title}</span>
                        </div>
                        <div className="flex items-center gap-4 shrink-0 text-slate-400">
                          {getPriorityBadge(t.priority)}
                          <div className="flex items-center gap-1.5">
                            <img src={t.assignee.avatar} alt={t.assignee.name} className="w-5 h-5 rounded-full" />
                            <span className="text-slate-300">{t.assignee.name}</span>
                          </div>
                          <span>Due {t.dueDate}</span>
                          <span>{t.loggedHours}h / {t.estimatedHours}h</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* ================= 3. TABLE VIEW ================= */}
        {viewMode === 'table' && (
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <tr>
                  <th className="px-4 py-3">Task ID</th>
                  <th className="px-4 py-3">Title</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="px-4 py-3">Priority</th>
                  <th className="px-4 py-3">Assignee</th>
                  <th className="px-4 py-3">Due Date</th>
                  <th className="px-4 py-3">Logged</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {filteredTasks.map((t) => (
                  <tr
                    key={t.id}
                    onClick={() => setSelectedTask(t)}
                    className="hover:bg-slate-800/50 cursor-pointer transition-colors"
                  >
                    <td className="px-4 py-3 font-mono text-indigo-400 font-bold">{t.id}</td>
                    <td className="px-4 py-3 font-medium text-white max-w-xs truncate">{t.title}</td>
                    <td className="px-4 py-3">
                      <span className="px-2 py-0.5 rounded-full bg-slate-800 text-slate-300 text-[10px]">
                        {t.status}
                      </span>
                    </td>
                    <td className="px-4 py-3">{getPriorityBadge(t.priority)}</td>
                    <td className="px-4 py-3">
                      <div className="flex items-center gap-1.5">
                        <img src={t.assignee.avatar} alt={t.assignee.name} className="w-4 h-4 rounded-full" />
                        <span>{t.assignee.name}</span>
                      </div>
                    </td>
                    <td className="px-4 py-3 font-mono">{t.dueDate}</td>
                    <td className="px-4 py-3 font-mono">{t.loggedHours}h / {t.estimatedHours}h</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        {/* ================= 4. CALENDAR VIEW ================= */}
        {viewMode === 'calendar' && (
          <div className="max-w-6xl mx-auto space-y-4">
            <div className="flex items-center justify-between pb-2">
              <h3 className="text-sm font-bold text-white">October 2026 Deliverables Schedule</h3>
              <span className="text-xs text-slate-400">All dates synced with Google Calendar</span>
            </div>
            <div className="grid grid-cols-7 gap-2">
              {['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'].map((day) => (
                <div key={day} className="text-center text-[10px] uppercase font-bold text-slate-400 py-1">
                  {day}
                </div>
              ))}
              {Array.from({ length: 31 }, (_, i) => i + 1).map((day) => {
                const dateStr = `2026-10-${day < 10 ? '0' + day : day}`;
                const dayTasks = tasks.filter((t) => t.dueDate === dateStr);
                return (
                  <div
                    key={day}
                    className="min-h-[90px] p-2 rounded-xl bg-slate-900/60 border border-slate-800 flex flex-col justify-between"
                  >
                    <span className="text-xs font-mono font-bold text-slate-400">{day}</span>
                    <div className="space-y-1 my-1">
                      {dayTasks.map((t) => (
                        <div
                          key={t.id}
                          onClick={() => setSelectedTask(t)}
                          className="px-1.5 py-0.5 rounded bg-indigo-600/40 border border-indigo-500/50 text-[10px] text-white truncate cursor-pointer hover:bg-indigo-600"
                        >
                          {t.title}
                        </div>
                      ))}
                    </div>
                    <div />
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* ================= 5. TIMELINE VIEW ================= */}
        {viewMode === 'timeline' && (
          <div className="max-w-5xl mx-auto space-y-4">
            <div className="flex items-center justify-between pb-2">
              <h3 className="text-sm font-bold text-white">Chronological Delivery Timeline</h3>
              <span className="text-xs text-slate-400">September — November 2026</span>
            </div>
            <div className="space-y-3">
              {filteredTasks.map((t) => (
                <div
                  key={t.id}
                  onClick={() => setSelectedTask(t)}
                  className="p-3.5 rounded-xl bg-slate-900 border border-slate-800 hover:border-indigo-500/40 cursor-pointer flex items-center justify-between gap-4"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-xs text-indigo-400 font-bold">{t.id}</span>
                    <div>
                      <h4 className="text-xs font-semibold text-white">{t.title}</h4>
                      <span className="text-[10px] text-slate-400">Assigned to {t.assignee.name}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-4 text-xs font-mono">
                    <span className="text-slate-400">{t.startDate || '2026-09-20'}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-indigo-400" />
                    <span className="text-indigo-300 font-semibold">{t.dueDate}</span>
                    {getPriorityBadge(t.priority)}
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* ================= 6. GANTT CHART VIEW ================= */}
        {viewMode === 'gantt' && (
          <div className="max-w-6xl mx-auto rounded-2xl border border-slate-800 bg-slate-900/60 p-4 space-y-4 overflow-x-auto">
            <div className="flex items-center justify-between pb-2">
              <div>
                <h3 className="text-sm font-bold text-white flex items-center gap-2">
                  <GitBranch className="w-4 h-4 text-indigo-400" />
                  Interactive Gantt & Critical Path Schedule
                </h3>
                <p className="text-[11px] text-slate-400">
                  Visual dependencies and milestone markers across current sprint
                </p>
              </div>
              <div className="flex items-center gap-4 text-[10px] font-mono">
                <span className="flex items-center gap-1.5 text-indigo-400">
                  <span className="w-3 h-2 rounded bg-indigo-500" /> In Progress
                </span>
                <span className="flex items-center gap-1.5 text-emerald-400">
                  <span className="w-3 h-2 rounded bg-emerald-500" /> Completed
                </span>
                <span className="flex items-center gap-1.5 text-amber-400">
                  <span className="w-2.5 h-2.5 rotate-45 bg-amber-400" /> Milestone
                </span>
              </div>
            </div>

            {/* Gantt Matrix */}
            <div className="min-w-[800px] border border-slate-800 rounded-xl overflow-hidden bg-slate-950/70">
              {/* Timeline Header Weeks */}
              <div className="grid grid-cols-6 border-b border-slate-800 bg-slate-900/90 text-center py-2 text-[10px] uppercase font-bold text-slate-400">
                <div>Week 1 (Oct 1)</div>
                <div>Week 2 (Oct 8)</div>
                <div>Week 3 (Oct 15)</div>
                <div>Week 4 (Oct 22)</div>
                <div>Week 5 (Oct 29)</div>
                <div>Week 6 (Nov 5)</div>
              </div>

              {/* Task Gantt Rows */}
              <div className="divide-y divide-slate-800/60">
                {filteredTasks.map((t, idx) => {
                  const offsetPercent = (idx * 8) % 45;
                  const widthPercent = 25 + ((idx * 7) % 35);
                  const isCompleted = t.status === 'Completed';

                  return (
                    <div
                      key={t.id}
                      onClick={() => setSelectedTask(t)}
                      className="flex items-center h-12 px-4 hover:bg-slate-900/50 cursor-pointer group"
                    >
                      <div className="w-64 shrink-0 flex items-center gap-2">
                        <span className="font-mono text-[10px] text-indigo-400 font-bold">{t.id}</span>
                        <span className="text-xs text-white truncate max-w-[160px] group-hover:text-indigo-300">
                          {t.title}
                        </span>
                      </div>

                      {/* Bar Container */}
                      <div className="flex-1 relative h-6">
                        <div
                          className={`absolute top-0.5 bottom-0.5 rounded-lg flex items-center px-2 text-[10px] font-bold text-white shadow-md transition-all ${
                            isCompleted
                              ? 'bg-emerald-600/80 border border-emerald-400/50'
                              : 'bg-indigo-600/80 border border-indigo-400/50'
                          }`}
                          style={{
                            left: `${offsetPercent}%`,
                            width: `${widthPercent}%`
                          }}
                        >
                          <span className="truncate">{t.assignee.name.split(' ')[0]}</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
