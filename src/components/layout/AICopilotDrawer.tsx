import React, { useState } from 'react';
import {
  Sparkles,
  X,
  Send,
  Bot,
  User,
  Plus,
  AlertTriangle,
  FileText,
  Clock,
  TrendingUp,
  CheckCircle2,
  Cpu
} from 'lucide-react';
import { useNexus } from '../../context/NexusContext';

interface AIMessage {
  id: string;
  sender: 'ai' | 'user';
  text: string;
  timestamp: string;
  actionPayload?: {
    type: 'task' | 'risk' | 'summary';
    data: any;
  };
}

export const AICopilotDrawer: React.FC = () => {
  const {
    isAICopilotOpen,
    setIsAICopilotOpen,
    projects,
    tasks,
    risks,
    addTask,
    addRisk,
    showToast
  } = useNexus();

  const [input, setInput] = useState('');
  const [messages, setMessages] = useState<AIMessage[]>([
    {
      id: 'ai-init',
      sender: 'ai',
      text: 'Hello Sarah! I am **Nexus Copilot**, your autonomous project & workflow intelligence engine. How can I assist you today? You can ask me to analyze risks, synthesize executive reports, or generate new task trees from specs.',
      timestamp: 'Just now'
    }
  ]);
  const [isTyping, setIsTyping] = useState(false);

  if (!isAICopilotOpen) return null;

  const handleSend = (textToSend?: string) => {
    const query = textToSend || input;
    if (!query.trim()) return;

    const userMsg: AIMessage = {
      id: `usr-${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    };

    setMessages((prev) => [...prev, userMsg]);
    if (!textToSend) setInput('');
    setIsTyping(true);

    setTimeout(() => {
      generateAIResponse(query);
      setIsTyping(false);
    }, 700);
  };

  const generateAIResponse = (userQuery: string) => {
    const q = userQuery.toLowerCase();
    let aiText = '';
    let payload: any = undefined;

    if (q.includes('risk') || q.includes('detect') || q.includes('vulnerabilit')) {
      aiText = `Based on active telemetry and deadline variance, I identified **1 emerging operational risk** in the Workflow Automation Engine. Third-party HTTP response times average 380ms but spike to 4.2s under load.`;
      payload = {
        type: 'risk',
        data: {
          title: 'Third-Party Webhook Latency Degradation',
          description: 'Observed intermittent HTTP 504 timeouts from external consumer endpoints during peak load.',
          severity: 4,
          probability: 3,
          mitigationPlan: 'Implement exponential backoff retry and asynchronous worker segregation.',
          dueDate: '2026-10-15'
        }
      };
    } else if (q.includes('generate task') || q.includes('create task') || q.includes('task') || q.includes('feature')) {
      aiText = `I analyzed your request and synthesized a fully formed task with estimates and architectural tags ready to inject into your board.`;
      payload = {
        type: 'task',
        data: {
          title: 'Implement Dead-Letter Queue & Circuit Breaker for Redis Streams',
          description: 'Automatically quarantine unprocessable messages after 5 failed retries to avoid consumer poison pills.',
          priority: 'High',
          estimatedHours: 28,
          tags: ['Backend', 'Redis', 'Resilience']
        }
      };
    } else if (q.includes('summary') || q.includes('status') || q.includes('report') || q.includes('progress')) {
      const activeProjCount = projects.filter((p) => p.status === 'Active').length;
      const completedTasks = tasks.filter((t) => t.status === 'Completed').length;
      aiText = `### Project Nexus Executive Snapshot
- **Active Projects**: ${activeProjCount} currently in flight across the organization.
- **Task Velocity**: ${completedTasks} of ${tasks.length} total tasks completed (${Math.round((completedTasks / tasks.length) * 100)}%).
- **SLA Health**: 1 task in active Tier-1 escalation (TASK-103).
- **Budget Burn**: $309,900 utilized out of $480,000 allocated (64.5% burn rate — well within expected envelope).
- **Recommendation**: Deploy circuit breaker PR #142 to safeguard webhook delivery before end of sprint.`;
    } else {
      aiText = `I have analyzed the workspace state across all ${projects.length} projects and ${tasks.length} tasks. Everything is indexed in real-time. Try asking me:
1. *"Generate a backend task for caching"*
2. *"Run an automated risk detection scan"*
3. *"Synthesize an executive sprint summary"*`;
    }

    const aiMsg: AIMessage = {
      id: `ai-${Date.now()}`,
      sender: 'ai',
      text: aiText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actionPayload: payload
    };

    setMessages((prev) => [...prev, aiMsg]);
  };

  const handleApplyPayload = (payload: any) => {
    if (payload.type === 'task') {
      addTask({
        title: payload.data.title,
        description: payload.data.description,
        priority: payload.data.priority,
        estimatedHours: payload.data.estimatedHours,
        tags: payload.data.tags
      });
      showToast('AI Task successfully created and added to Board!');
    } else if (payload.type === 'risk') {
      addRisk({
        title: payload.data.title,
        description: payload.data.description,
        severity: payload.data.severity,
        probability: payload.data.probability,
        mitigationPlan: payload.data.mitigationPlan,
        dueDate: payload.data.dueDate
      });
      showToast('AI Risk successfully added to Risk Register!');
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-hidden bg-black/60 backdrop-blur-sm animate-in fade-in duration-100">
      <div
        className="fixed inset-0"
        onClick={() => setIsAICopilotOpen(false)}
      />

      <div className="fixed inset-y-0 right-0 max-w-full flex pl-10">
        <div className="w-screen max-w-lg bg-[#0f172a] border-l border-slate-800 shadow-2xl flex flex-col">
          {/* Header */}
          <div className="p-4 border-b border-slate-800 flex items-center justify-between bg-gradient-to-r from-purple-950/30 to-indigo-950/30">
            <div className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/20">
                <Sparkles className="w-4 h-4 text-white" />
              </div>
              <div>
                <h2 className="text-sm font-bold text-white flex items-center gap-1.5">
                  Nexus Intelligence Copilot
                </h2>
                <p className="text-[10px] text-slate-400">Autonomous Project Manager & Risk Analyst</p>
              </div>
            </div>
            <button
              onClick={() => setIsAICopilotOpen(false)}
              className="p-1.5 rounded-lg text-slate-400 hover:text-slate-200 hover:bg-slate-800"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          {/* Quick Prompts Bar */}
          <div className="px-4 py-2 bg-slate-900/60 border-b border-slate-800/80 flex items-center gap-2 overflow-x-auto text-[11px]">
            <button
              onClick={() => handleSend('Generate a backend resilience task')}
              className="px-2.5 py-1 rounded-full bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/30 whitespace-nowrap"
            >
              + Generate Task
            </button>
            <button
              onClick={() => handleSend('Scan for high risks')}
              className="px-2.5 py-1 rounded-full bg-rose-500/10 hover:bg-rose-500/20 text-rose-300 border border-rose-500/30 whitespace-nowrap"
            >
              ⚠️ Risk Scan
            </button>
            <button
              onClick={() => handleSend('Generate executive summary')}
              className="px-2.5 py-1 rounded-full bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 whitespace-nowrap"
            >
              📊 Exec Summary
            </button>
          </div>

          {/* Chat Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((m) => (
              <div
                key={m.id}
                className={`flex gap-3 ${m.sender === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {m.sender === 'ai' && (
                  <div className="w-7 h-7 rounded-lg bg-indigo-600/30 border border-indigo-500/40 flex items-center justify-center shrink-0 mt-0.5">
                    <Bot className="w-3.5 h-3.5 text-indigo-400" />
                  </div>
                )}

                <div
                  className={`max-w-[85%] rounded-2xl p-3.5 text-xs leading-relaxed ${
                    m.sender === 'user'
                      ? 'bg-indigo-600 text-white shadow-md'
                      : 'bg-slate-900 border border-slate-800 text-slate-200'
                  }`}
                >
                  <div className="whitespace-pre-line prose prose-invert prose-xs">{m.text}</div>

                  {/* AI Action Card (e.g. Generated Task or Risk) */}
                  {m.actionPayload && (
                    <div className="mt-3 p-3 rounded-xl bg-slate-950/80 border border-indigo-500/30 space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-[10px] font-bold uppercase tracking-wider text-indigo-400 flex items-center gap-1">
                          {m.actionPayload.type === 'task' ? (
                            <>
                              <Plus className="w-3 h-3" /> Synthesized Task
                            </>
                          ) : (
                            <>
                              <AlertTriangle className="w-3 h-3 text-rose-400" /> Detected Risk
                            </>
                          )}
                        </span>
                        <span className="text-[10px] font-mono text-slate-400">
                          {m.actionPayload.data.priority || `Severity ${m.actionPayload.data.severity}`}
                        </span>
                      </div>
                      <div className="text-xs font-semibold text-white">
                        {m.actionPayload.data.title}
                      </div>
                      <p className="text-[11px] text-slate-400 leading-snug">
                        {m.actionPayload.data.description}
                      </p>
                      <button
                        onClick={() => handleApplyPayload(m.actionPayload)}
                        className="w-full mt-2 py-1.5 px-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium text-xs flex items-center justify-center gap-1.5 transition-colors shadow-sm"
                      >
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        Apply to Project Workspace
                      </button>
                    </div>
                  )}

                  <div className="text-[10px] text-slate-500 mt-1.5 text-right">{m.timestamp}</div>
                </div>

                {m.sender === 'user' && (
                  <div className="w-7 h-7 rounded-lg bg-slate-800 flex items-center justify-center shrink-0 mt-0.5">
                    <User className="w-3.5 h-3.5 text-slate-300" />
                  </div>
                )}
              </div>
            ))}

            {isTyping && (
              <div className="flex items-center gap-2 text-xs text-indigo-400 pl-10">
                <Cpu className="w-3.5 h-3.5 animate-spin" />
                <span>Copilot is analyzing project graph...</span>
              </div>
            )}
          </div>

          {/* Input Bar */}
          <div className="p-4 border-t border-slate-800 bg-slate-900/40">
            <div className="relative">
              <textarea
                rows={2}
                placeholder="Ask anything or prompt: 'Breakdown feature into 4 subtasks'..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' && !e.shiftKey) {
                    e.preventDefault();
                    handleSend();
                  }
                }}
                className="w-full pr-10 pl-3 py-2.5 rounded-xl bg-slate-900 border border-slate-700 text-slate-100 text-xs placeholder:text-slate-500 focus:outline-none focus:border-indigo-500 resize-none"
              />
              <button
                onClick={() => handleSend()}
                disabled={!input.trim()}
                className="absolute right-2.5 bottom-3.5 p-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:hover:bg-indigo-600 text-white transition-colors"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </div>
            <div className="text-[10px] text-slate-500 text-center mt-2">
              Powered by Nexus Semantic Graph & LLM Orchestrator
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
