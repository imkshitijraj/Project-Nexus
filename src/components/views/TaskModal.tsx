import React, { useState, useEffect } from 'react';
import {
  X,
  Calendar,
  Clock,
  User,
  AlertCircle,
  CheckSquare,
  Plus,
  Trash2,
  Play,
  Pause,
  MessageSquare,
  Send,
  ShieldAlert,
  Link,
  Tag
} from 'lucide-react';
import { Task, TaskStatus, TaskPriority } from '../../types';
import { useNexus } from '../../context/NexusContext';

export const TaskModal: React.FC = () => {
  const { selectedTask, setSelectedTask, updateTask, currentUser, showToast } = useNexus();

  const [activeTab, setActiveTab] = useState<'details' | 'comments' | 'history'>('details');
  const [isTimerRunning, setIsTimerRunning] = useState(false);
  const [newSubtask, setNewSubtask] = useState('');
  const [newChecklist, setNewChecklist] = useState('');
  const [commentText, setCommentText] = useState('');

  // Timer simulation
  useEffect(() => {
    let interval: any;
    if (isTimerRunning && selectedTask) {
      interval = setInterval(() => {
        updateTask({
          ...selectedTask,
          loggedHours: +(selectedTask.loggedHours + 0.05).toFixed(2)
        });
      }, 3000);
    }
    return () => clearInterval(interval);
  }, [isTimerRunning, selectedTask]);

  if (!selectedTask) return null;

  const handleStatusChange = (newStatus: TaskStatus) => {
    updateTask({ ...selectedTask, status: newStatus });
  };

  const handlePriorityChange = (newPriority: TaskPriority) => {
    updateTask({ ...selectedTask, priority: newPriority });
  };

  const handleToggleSubtask = (subtaskId: string) => {
    const updated = selectedTask.subtasks.map((st) =>
      st.id === subtaskId ? { ...st, completed: !st.completed } : st
    );
    updateTask({ ...selectedTask, subtasks: updated });
  };

  const handleAddSubtask = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newSubtask.trim()) return;
    const newSt = {
      id: `st-${Date.now()}`,
      title: newSubtask.trim(),
      completed: false
    };
    updateTask({
      ...selectedTask,
      subtasks: [...selectedTask.subtasks, newSt]
    });
    setNewSubtask('');
  };

  const handleToggleChecklist = (checkId: string) => {
    const updated = selectedTask.checklists.map((cl) =>
      cl.id === checkId ? { ...cl, done: !cl.done } : cl
    );
    updateTask({ ...selectedTask, checklists: updated });
  };

  const handleAddChecklist = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newChecklist.trim()) return;
    const newCl = {
      id: `cl-${Date.now()}`,
      text: newChecklist.trim(),
      done: false
    };
    updateTask({
      ...selectedTask,
      checklists: [...selectedTask.checklists, newCl]
    });
    setNewChecklist('');
  };

  const handleAddComment = (e: React.FormEvent) => {
    e.preventDefault();
    if (!commentText.trim()) return;
    const newC = {
      id: `c-${Date.now()}`,
      userId: currentUser.id,
      userName: currentUser.name,
      userAvatar: currentUser.avatar,
      content: commentText.trim(),
      createdAt: 'Just now'
    };
    updateTask({
      ...selectedTask,
      comments: [...selectedTask.comments, newC]
    });
    setCommentText('');
    showToast('Comment added');
  };

  const completedSubtasksCount = selectedTask.subtasks.filter((s) => s.completed).length;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md animate-in fade-in duration-150">
      <div
        className="fixed inset-0"
        onClick={() => setSelectedTask(null)}
      />

      <div className="relative w-full max-w-3xl bg-[#0f172a] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] z-10">
        {/* Header Bar */}
        <div className="p-4 px-6 border-b border-slate-800 flex items-center justify-between bg-slate-900/60">
          <div className="flex items-center gap-3">
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
              {selectedTask.id}
            </span>
            <span className="text-xs text-slate-400">in {selectedTask.projectName}</span>
            {selectedTask.escalationTier && selectedTask.escalationTier > 0 ? (
              <span className="flex items-center gap-1 text-[10px] font-bold px-2 py-0.5 rounded-full bg-rose-500/20 text-rose-400 border border-rose-500/30">
                <ShieldAlert className="w-3 h-3" /> Tier {selectedTask.escalationTier} Escalated
              </span>
            ) : null}
          </div>
          <button
            onClick={() => setSelectedTask(null)}
            className="p-1 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content Body */}
        <div className="flex-1 overflow-y-auto p-6 space-y-6">
          {/* Title & Description */}
          <div>
            <input
              type="text"
              value={selectedTask.title}
              onChange={(e) => updateTask({ ...selectedTask, title: e.target.value })}
              className="w-full text-lg font-bold text-white bg-transparent border-none focus:outline-none focus:ring-1 focus:ring-indigo-500 rounded p-1"
            />
            <textarea
              rows={3}
              value={selectedTask.description}
              onChange={(e) => updateTask({ ...selectedTask, description: e.target.value })}
              className="w-full mt-2 text-xs text-slate-300 bg-slate-900/60 border border-slate-800 rounded-lg p-2.5 focus:outline-none focus:border-indigo-500 resize-none"
            />
          </div>

          {/* Quick Properties Grid */}
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 text-xs">
            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Status</span>
              <select
                value={selectedTask.status}
                onChange={(e) => handleStatusChange(e.target.value as TaskStatus)}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none"
              >
                <option value="Backlog">Backlog</option>
                <option value="To Do">To Do</option>
                <option value="In Progress">In Progress</option>
                <option value="In Review">In Review</option>
                <option value="Completed">Completed</option>
                <option value="Archived">Archived</option>
              </select>
            </div>

            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Priority</span>
              <select
                value={selectedTask.priority}
                onChange={(e) => handlePriorityChange(e.target.value as TaskPriority)}
                className="w-full bg-slate-800 border border-slate-700 rounded px-2 py-1 text-slate-200 text-xs focus:outline-none"
              >
                <option value="Urgent">🔴 Urgent</option>
                <option value="High">🟠 High</option>
                <option value="Medium">🟡 Medium</option>
                <option value="Low">🟢 Low</option>
              </select>
            </div>

            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Assignee</span>
              <div className="flex items-center gap-1.5 py-1">
                <img
                  src={selectedTask.assignee.avatar}
                  alt={selectedTask.assignee.name}
                  className="w-5 h-5 rounded-full object-cover"
                />
                <span className="text-slate-200 text-xs truncate">{selectedTask.assignee.name}</span>
              </div>
            </div>

            <div>
              <span className="text-slate-400 text-[10px] uppercase font-bold block mb-1">Due Date</span>
              <div className="flex items-center gap-1.5 py-1 text-slate-200 text-xs">
                <Calendar className="w-3.5 h-3.5 text-indigo-400" />
                <span>{selectedTask.dueDate}</span>
              </div>
            </div>
          </div>

          {/* Time Tracking Widget */}
          <div className="p-3.5 rounded-xl bg-slate-900/70 border border-slate-800 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-indigo-500/10 text-indigo-400">
                <Clock className="w-4 h-4" />
              </div>
              <div>
                <div className="text-xs font-semibold text-slate-200">
                  Time Logged: {selectedTask.loggedHours}h / {selectedTask.estimatedHours}h
                </div>
                <div className="w-48 bg-slate-800 h-1.5 rounded-full mt-1.5 overflow-hidden">
                  <div
                    className="bg-indigo-500 h-full rounded-full transition-all"
                    style={{
                      width: `${Math.min(
                        100,
                        (selectedTask.loggedHours / selectedTask.estimatedHours) * 100
                      )}%`
                    }}
                  />
                </div>
              </div>
            </div>

            <button
              onClick={() => {
                setIsTimerRunning(!isTimerRunning);
                showToast(isTimerRunning ? 'Stopwatch paused' : 'Stopwatch tracking started');
              }}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                isTimerRunning
                  ? 'bg-rose-500 text-white animate-pulse'
                  : 'bg-indigo-600 hover:bg-indigo-500 text-white'
              }`}
            >
              {isTimerRunning ? (
                <>
                  <Pause className="w-3.5 h-3.5" /> Pause Timer
                </>
              ) : (
                <>
                  <Play className="w-3.5 h-3.5" /> Start Timer
                </>
              )}
            </button>
          </div>

          {/* Tabs: Details / Comments */}
          <div>
            <div className="flex items-center gap-4 border-b border-slate-800 pb-2">
              <button
                onClick={() => setActiveTab('details')}
                className={`text-xs font-semibold pb-2 border-b-2 transition-colors ${
                  activeTab === 'details'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Subtasks & Checklists ({selectedTask.subtasks.length + selectedTask.checklists.length})
              </button>
              <button
                onClick={() => setActiveTab('comments')}
                className={`text-xs font-semibold pb-2 border-b-2 transition-colors ${
                  activeTab === 'comments'
                    ? 'border-indigo-500 text-indigo-400'
                    : 'border-transparent text-slate-400 hover:text-slate-200'
                }`}
              >
                Discussion & Comments ({selectedTask.comments.length})
              </button>
            </div>

            {activeTab === 'details' && (
              <div className="mt-4 space-y-6">
                {/* Subtasks */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Subtasks ({completedSubtasksCount}/{selectedTask.subtasks.length})
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {selectedTask.subtasks.map((st) => (
                      <div
                        key={st.id}
                        onClick={() => handleToggleSubtask(st.id)}
                        className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900/50 hover:bg-slate-900 border border-slate-800/80 cursor-pointer text-xs"
                      >
                        <input
                          type="checkbox"
                          checked={st.completed}
                          onChange={() => {}}
                          className="rounded border-slate-700 text-indigo-600 focus:ring-indigo-500"
                        />
                        <span className={st.completed ? 'line-through text-slate-500' : 'text-slate-200'}>
                          {st.title}
                        </span>
                      </div>
                    ))}

                    <form onSubmit={handleAddSubtask} className="flex gap-2 mt-2">
                      <input
                        type="text"
                        placeholder="Add a new subtask..."
                        value={newSubtask}
                        onChange={(e) => setNewSubtask(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200"
                      >
                        Add
                      </button>
                    </form>
                  </div>
                </div>

                {/* Quality Checklists */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider">
                      Acceptance Criteria & Checklists
                    </span>
                  </div>

                  <div className="space-y-1.5">
                    {selectedTask.checklists.map((cl) => (
                      <div
                        key={cl.id}
                        onClick={() => handleToggleChecklist(cl.id)}
                        className="flex items-center gap-2.5 p-2 rounded-lg bg-slate-900/50 hover:bg-slate-900 border border-slate-800/80 cursor-pointer text-xs"
                      >
                        <CheckSquare className={`w-3.5 h-3.5 ${cl.done ? 'text-emerald-400' : 'text-slate-600'}`} />
                        <span className={cl.done ? 'line-through text-slate-500' : 'text-slate-200'}>
                          {cl.text}
                        </span>
                      </div>
                    ))}

                    <form onSubmit={handleAddChecklist} className="flex gap-2 mt-2">
                      <input
                        type="text"
                        placeholder="Add an acceptance criteria item..."
                        value={newChecklist}
                        onChange={(e) => setNewChecklist(e.target.value)}
                        className="flex-1 px-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                      />
                      <button
                        type="submit"
                        className="px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-medium text-slate-200"
                      >
                        Add
                      </button>
                    </form>
                  </div>
                </div>

                {/* Tags */}
                <div>
                  <span className="text-xs font-bold text-slate-300 uppercase tracking-wider block mb-2">
                    Architectural Tags
                  </span>
                  <div className="flex flex-wrap gap-1.5">
                    {selectedTask.tags.map((tag) => (
                      <span
                        key={tag}
                        className="text-[11px] px-2.5 py-0.5 rounded-full bg-slate-800 text-slate-300 border border-slate-700 flex items-center gap-1"
                      >
                        <Tag className="w-2.5 h-2.5 text-indigo-400" />
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'comments' && (
              <div className="mt-4 space-y-4">
                {selectedTask.comments.length === 0 ? (
                  <div className="text-center py-6 text-xs text-slate-500">
                    No comments yet. Start the conversation below.
                  </div>
                ) : (
                  selectedTask.comments.map((c) => (
                    <div key={c.id} className="p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-xs">
                      <div className="flex items-center justify-between mb-1.5">
                        <div className="flex items-center gap-2">
                          <img src={c.userAvatar} alt={c.userName} className="w-5 h-5 rounded-full object-cover" />
                          <span className="font-semibold text-white">{c.userName}</span>
                        </div>
                        <span className="text-[10px] text-slate-500">{c.createdAt}</span>
                      </div>
                      <p className="text-slate-300 leading-relaxed pl-7">{c.content}</p>
                    </div>
                  ))
                )}

                <form onSubmit={handleAddComment} className="flex gap-2 pt-2">
                  <input
                    type="text"
                    placeholder="Write a comment or mention @team..."
                    value={commentText}
                    onChange={(e) => setCommentText(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-xl bg-slate-900 border border-slate-800 text-xs text-slate-200 focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="submit"
                    className="p-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white"
                  >
                    <Send className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div className="p-4 px-6 border-t border-slate-800 bg-slate-900/80 flex items-center justify-between text-xs text-slate-400">
          <span>Created on {selectedTask.createdAt}</span>
          <button
            onClick={() => setSelectedTask(null)}
            className="px-4 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-200 font-medium"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
