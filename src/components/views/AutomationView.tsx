import React, { useState } from 'react';
import {
  Zap,
  Play,
  Plus,
  ShieldAlert,
  ArrowRight,
  CheckCircle2,
  Clock,
  Bell,
  Send,
  Webhook,
  Sliders,
  Check,
  Power
} from 'lucide-react';
import { useNexus } from '../../context/NexusContext';
import { WorkflowAutomation } from '../../types';

export const AutomationView: React.FC = () => {
  const {
    automations,
    toggleAutomation,
    runAutomationTest,
    escalationRules,
    showToast
  } = useNexus();

  const [newRuleModalOpen, setNewRuleModalOpen] = useState(false);
  const [ruleName, setRuleName] = useState('');
  const [ruleTrigger, setRuleTrigger] = useState<WorkflowAutomation['trigger']>('task_overdue');
  const [ruleAction, setRuleAction] = useState<WorkflowAutomation['action']>('escalate_tier');
  const [ruleCondition, setRuleCondition] = useState('Priority == "Urgent" && HoursOverdue >= 12');

  const handleCreateRule = (e: React.FormEvent) => {
    e.preventDefault();
    if (!ruleName.trim()) return;
    showToast(`Created workflow automation: "${ruleName}"`);
    setNewRuleModalOpen(false);
    setRuleName('');
  };

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-purple-400 bg-purple-500/10 px-2 py-0.5 rounded border border-purple-500/20">
              Autonomous Orchestrator
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <Zap className="w-6 h-6 text-purple-400" />
            Workflow Automation & Escalation Engine
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            Build event-driven triggers, conditional dispatch pipelines, and SLA escalation policies to eliminate manual busywork.
          </p>
        </div>

        <button
          onClick={() => setNewRuleModalOpen(true)}
          className="flex items-center gap-2 px-4 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white text-xs font-semibold shadow-lg shadow-purple-600/30 transition-all shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>New Automation Rule</span>
        </button>
      </div>

      {/* 3-Tier Escalation SLA Pipeline Banner */}
      <div className="p-6 rounded-2xl bg-gradient-to-r from-slate-900 via-purple-950/30 to-slate-900 border border-purple-500/20 space-y-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <ShieldAlert className="w-5 h-5 text-rose-400" />
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Autonomous 3-Tier SLA Escalation Hierarchy
            </h3>
          </div>
          <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
            Active Policy
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {escalationRules.map((rule, idx) => (
            <div
              key={rule.id}
              className="p-4 rounded-xl bg-slate-900/80 border border-slate-800 flex flex-col justify-between space-y-3"
            >
              <div>
                <div className="flex items-center justify-between text-xs font-bold text-slate-400 mb-1">
                  <span>Tier {idx + 1}</span>
                  <span className="text-rose-400">{rule.overdueThresholdHours}h Overdue</span>
                </div>
                <h4 className="text-sm font-bold text-white">{rule.name}</h4>
                <p className="text-xs text-slate-400 mt-1">
                  Alert target: <span className="text-indigo-300 font-semibold">{rule.targetRole}</span>
                </p>
              </div>

              <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[10px]">
                <span className="text-slate-500">Channels: {rule.notificationChannels.join(', ')}</span>
                <span className="text-emerald-400 font-bold flex items-center gap-1">
                  <Check className="w-3 h-3" /> Enforced
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Active Rules List */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-sm font-bold text-slate-200 uppercase tracking-wider">
            Active Event Triggers & Actions ({automations.length})
          </h2>
          <span className="text-xs text-slate-400">Evaluated every 60 seconds</span>
        </div>

        <div className="space-y-3">
          {automations.map((auto) => (
            <div
              key={auto.id}
              className={`p-5 rounded-2xl border transition-all ${
                auto.enabled
                  ? 'bg-slate-900/60 border-slate-800 hover:border-purple-500/40'
                  : 'bg-slate-950/40 border-slate-800/40 opacity-60'
              }`}
            >
              <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                {/* Trigger Flow Graphic */}
                <div className="space-y-2">
                  <div className="flex items-center gap-2.5">
                    <span className="text-xs font-bold text-white">{auto.name}</span>
                    <span
                      className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                        auto.enabled
                          ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                          : 'bg-slate-800 text-slate-400'
                      }`}
                    >
                      {auto.enabled ? 'Active' : 'Disabled'}
                    </span>
                  </div>

                  {/* Flow Pills */}
                  <div className="flex flex-wrap items-center gap-2 text-xs font-mono">
                    <span className="px-2.5 py-1 rounded-lg bg-indigo-500/10 text-indigo-300 border border-indigo-500/30 flex items-center gap-1.5">
                      <Clock className="w-3 h-3 text-indigo-400" />
                      Trigger: {auto.trigger}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                    <span className="px-2.5 py-1 rounded-lg bg-slate-800 text-slate-300 border border-slate-700">
                      IF {auto.condition}
                    </span>
                    <ArrowRight className="w-3.5 h-3.5 text-slate-600" />
                    <span className="px-2.5 py-1 rounded-lg bg-purple-500/10 text-purple-300 border border-purple-500/30 flex items-center gap-1.5">
                      <Zap className="w-3 h-3 text-purple-400" />
                      Action: {auto.action}
                    </span>
                  </div>
                </div>

                {/* Controls & Metrics */}
                <div className="flex items-center gap-4 shrink-0">
                  <div className="text-right text-xs">
                    <span className="text-white font-bold block">{auto.executionsCount} triggers</span>
                    <span className="text-[10px] text-slate-500">Last run: {auto.lastRun || 'Never'}</span>
                  </div>

                  <button
                    onClick={() => runAutomationTest(auto.id)}
                    title="Execute test run"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-xs font-semibold text-slate-200 border border-slate-700 transition-colors"
                  >
                    <Play className="w-3 h-3 text-emerald-400 fill-emerald-400" />
                    <span>Test</span>
                  </button>

                  <button
                    onClick={() => toggleAutomation(auto.id)}
                    className={`p-2 rounded-lg transition-colors ${
                      auto.enabled
                        ? 'bg-purple-600/20 text-purple-400 hover:bg-purple-600/30 border border-purple-500/30'
                        : 'bg-slate-800 text-slate-500 hover:bg-slate-700'
                    }`}
                  >
                    <Power className="w-4 h-4" />
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Rule Modal */}
      {newRuleModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
          <div className="bg-[#0f172a] border border-slate-700 rounded-2xl w-full max-w-lg p-6 shadow-2xl space-y-4">
            <h3 className="text-base font-bold text-white flex items-center gap-2">
              <Zap className="w-5 h-5 text-purple-400" />
              Create Custom Automation Rule
            </h3>

            <form onSubmit={handleCreateRule} className="space-y-4 text-xs">
              <div>
                <label className="block font-semibold text-slate-300 mb-1">Rule Name</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. Notify DevOps Channel on SLA breach"
                  value={ruleName}
                  onChange={(e) => setRuleName(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Trigger Event</label>
                  <select
                    value={ruleTrigger}
                    onChange={(e) => setRuleTrigger(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-purple-500"
                  >
                    <option value="task_overdue">Task Overdue</option>
                    <option value="status_changed">Status Changed</option>
                    <option value="milestone_reached">Milestone Reached</option>
                    <option value="priority_urgent">Priority Set to Urgent</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-slate-300 mb-1">Target Action</label>
                  <select
                    value={ruleAction}
                    onChange={(e) => setRuleAction(e.target.value as any)}
                    className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 focus:outline-none focus:border-purple-500"
                  >
                    <option value="escalate_tier">Escalate SLA Tier</option>
                    <option value="notify_slack">Broadcast to Slack</option>
                    <option value="assign_lead">Assign to Team Lead</option>
                    <option value="webhook_post">Dispatch Outbound Webhook</option>
                  </select>
                </div>
              </div>

              <div>
                <label className="block font-semibold text-slate-300 mb-1">Condition Expression</label>
                <input
                  type="text"
                  value={ruleCondition}
                  onChange={(e) => setRuleCondition(e.target.value)}
                  className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-slate-100 font-mono text-[11px] focus:outline-none focus:border-purple-500"
                />
              </div>

              <div className="pt-2 flex justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setNewRuleModalOpen(false)}
                  className="px-4 py-2 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-lg bg-purple-600 hover:bg-purple-500 text-white font-semibold shadow-md shadow-purple-600/30"
                >
                  Save Automation Rule
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};
