import React, { useState } from 'react';
import {
  Terminal,
  Database,
  Send,
  CheckCircle2,
  Copy,
  Layers,
  Code
} from 'lucide-react';
import { useNexus } from '../../context/NexusContext';

export const ApiDocView: React.FC = () => {
  const { showToast } = useNexus();
  const [activeTab, setActiveTab] = useState<'api' | 'db'>('api');
  const [selectedEndpoint, setSelectedEndpoint] = useState<string>('get_projects');
  const [apiResponse, setApiResponse] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const endpoints = [
    {
      id: 'get_projects',
      method: 'GET',
      path: '/v1/projects',
      summary: 'List all accessible projects with progress and budget metadata',
      curl: 'curl -X GET "https://api.nexus.io/v1/projects" \\\n  -H "Authorization: Bearer nx_live_79a2fc8b..."',
      mockResponse: {
        status: 200,
        data: [
          { id: 'proj-1', key: 'WAE', name: 'Workflow Automation Engine & Rules Engine', progress: 74, status: 'Active' },
          { id: 'proj-2', key: 'AIC', name: 'Nexus AI Intelligence & Copilot Suite', progress: 58, status: 'Active' },
          { id: 'proj-3', key: 'K8S', name: 'Multi-Region Kubernetes & Zero-Trust Mesh', progress: 89, status: 'Active' }
        ]
      }
    },
    {
      id: 'create_task',
      method: 'POST',
      path: '/v1/tasks',
      summary: 'Programmatically create a task with subtasks, assignees, and SLA triggers',
      curl: 'curl -X POST "https://api.nexus.io/v1/tasks" \\\n  -H "Authorization: Bearer nx_live_79a2fc8b..." \\\n  -H "Content-Type: application/json" \\\n  -d \'{"title": "Verify cross-region backup", "priority": "High", "projectId": "proj-3"}\'',
      mockResponse: {
        status: 201,
        message: 'Task created successfully',
        task: {
          id: 'TASK-109',
          title: 'Verify cross-region backup',
          status: 'To Do',
          priority: 'High',
          slaThresholdHours: 24
        }
      }
    },
    {
      id: 'list_risks',
      method: 'GET',
      path: '/v1/risks',
      summary: 'Query active risk register sorted by impact score (Severity × Probability)',
      curl: 'curl -X GET "https://api.nexus.io/v1/risks?status=Mitigating" \\\n  -H "Authorization: Bearer nx_live_79a2fc8b..."',
      mockResponse: {
        status: 200,
        count: 2,
        risks: [
          { id: 'RSK-01', impactScore: 12, severity: 4, probability: 3, status: 'Mitigating' },
          { id: 'RSK-02', impactScore: 16, severity: 4, probability: 4, status: 'Identified' }
        ]
      }
    },
    {
      id: 'register_webhook',
      method: 'POST',
      path: '/v1/webhooks',
      summary: 'Register external HTTP endpoint for task escalation and milestone events',
      curl: 'curl -X POST "https://api.nexus.io/v1/webhooks" \\\n  -H "Authorization: Bearer nx_live_79a2fc8b..." \\\n  -d \'{"url": "https://hooks.slack.com/...", "events": ["task.escalated", "milestone.completed"]}\'',
      mockResponse: {
        status: 200,
        webhookId: 'wh_99a8b10',
        active: true,
        secret: 'whsec_7894a82fca91'
      }
    }
  ];

  const currentEp = endpoints.find((e) => e.id === selectedEndpoint) || endpoints[0];

  const handleTestEndpoint = () => {
    setIsLoading(true);
    setTimeout(() => {
      setApiResponse(JSON.stringify(currentEp.mockResponse, null, 2));
      setIsLoading(false);
      showToast(`200 OK — API simulated response returned`);
    }, 400);
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    showToast('Copied cURL command to clipboard');
  };

  const dbEntities = [
    { name: 'User', fields: 'id, name, email, role, department, status, avatar, createdAt' },
    { name: 'Organization', fields: 'id, name, plan, billingStatus, createdAt' },
    { name: 'Workspace', fields: 'id, orgId, name, slug, retentionPolicyDays' },
    { name: 'Team', fields: 'id, workspaceId, name, leadId' },
    { name: 'Project', fields: 'id, workspaceId, name, key, ownerId, budgetEst, budgetAct' },
    { name: 'Task', fields: 'id, projectId, title, status, priority, assigneeId, dueDate, loggedHours' },
    { name: 'Subtask', fields: 'id, taskId, title, completed' },
    { name: 'Milestone', fields: 'id, projectId, title, dueDate, completed' },
    { name: 'Risk', fields: 'id, projectId, severity, probability, impactScore, mitigationPlan' },
    { name: 'WorkflowAutomation', fields: 'id, workspaceId, trigger, condition, action, enabled' },
    { name: 'AuditLog', fields: 'id, timestamp, actorId, action, entity, prevValue, newValue, ip' },
    { name: 'APIKey', fields: 'id, workspaceId, keyHash, role, scopes, lastUsedAt' }
  ];

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div>
        <div className="flex items-center gap-2 mb-1">
          <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
            Developer Ecosystem
          </span>
        </div>
        <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
          <Terminal className="w-6 h-6 text-indigo-400" />
          Interactive REST API & Database Schema Explorer
        </h1>
        <p className="text-xs text-slate-400 max-w-2xl mt-1">
          Comprehensive OpenAPI documentation, cURL testing playground, and 24-entity relational data model.
        </p>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setActiveTab('api')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'api' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Code className="w-3.5 h-3.5" />
          <span>REST API Endpoints & Playground</span>
        </button>
        <button
          onClick={() => setActiveTab('db')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
            activeTab === 'db' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Database className="w-3.5 h-3.5" />
          <span>Database Architecture (24 Core Entities)</span>
        </button>
      </div>

      {/* ================= TAB 1: REST API PLAYGROUND ================= */}
      {activeTab === 'api' && (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Endpoints List */}
          <div className="space-y-2">
            <span className="text-xs font-bold text-slate-400 uppercase tracking-wider block mb-2">
              Endpoints
            </span>
            {endpoints.map((ep) => (
              <button
                key={ep.id}
                onClick={() => {
                  setSelectedEndpoint(ep.id);
                  setApiResponse(null);
                }}
                className={`w-full text-left p-3 rounded-xl border transition-all ${
                  selectedEndpoint === ep.id
                    ? 'bg-indigo-600/20 border-indigo-500/50 text-white'
                    : 'bg-slate-900/60 border-slate-800 text-slate-300 hover:bg-slate-900'
                }`}
              >
                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono text-[10px] font-bold px-1.5 py-0.5 rounded ${
                      ep.method === 'GET'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    {ep.method}
                  </span>
                  <span className="font-mono text-xs font-semibold">{ep.path}</span>
                </div>
                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1">{ep.summary}</p>
              </button>
            ))}
          </div>

          {/* Playground & Try-It-Out */}
          <div className="lg:col-span-2 space-y-4">
            <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono text-xs font-bold px-2 py-0.5 rounded ${
                      currentEp.method === 'GET'
                        ? 'bg-blue-500/20 text-blue-400'
                        : 'bg-emerald-500/20 text-emerald-400'
                    }`}
                  >
                    {currentEp.method}
                  </span>
                  <span className="font-mono text-sm font-bold text-white">{currentEp.path}</span>
                </div>

                <button
                  onClick={handleTestEndpoint}
                  disabled={isLoading}
                  className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold shadow-md shadow-indigo-600/30 transition-colors"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>{isLoading ? 'Executing...' : 'Try It Out'}</span>
                </button>
              </div>

              <p className="text-xs text-slate-300">{currentEp.summary}</p>

              {/* cURL Snippet */}
              <div>
                <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400 mb-1">
                  <span>cURL Command</span>
                  <button
                    onClick={() => copyToClipboard(currentEp.curl)}
                    className="flex items-center gap-1 text-indigo-400 hover:underline"
                  >
                    <Copy className="w-3 h-3" /> Copy
                  </button>
                </div>
                <pre className="p-3 rounded-xl bg-slate-950 border border-slate-800 font-mono text-xs text-indigo-300 overflow-x-auto">
                  {currentEp.curl}
                </pre>
              </div>

              {/* Live Response Box */}
              {apiResponse && (
                <div className="animate-in fade-in">
                  <div className="flex items-center justify-between text-[10px] uppercase font-bold text-slate-400 mb-1">
                    <span className="text-emerald-400 flex items-center gap-1">
                      <CheckCircle2 className="w-3 h-3" /> Response (HTTP 200 OK)
                    </span>
                  </div>
                  <pre className="p-4 rounded-xl bg-slate-950 border border-emerald-500/30 font-mono text-xs text-emerald-300 overflow-x-auto max-h-60">
                    {apiResponse}
                  </pre>
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ================= TAB 2: DATABASE ENTITIES ================= */}
      {activeTab === 'db' && (
        <div className="space-y-4">
          <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/20 text-xs text-slate-300">
            Nexus data model is engineered around multi-tenant isolation with PostgreSQL Row-Level Security (RLS) and Prisma ORM schemas.
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {dbEntities.map((ent) => (
              <div key={ent.name} className="p-4 rounded-xl bg-slate-900 border border-slate-800 space-y-2">
                <div className="flex items-center gap-2">
                  <Database className="w-4 h-4 text-indigo-400" />
                  <span className="font-bold text-white text-xs">{ent.name}</span>
                </div>
                <div className="font-mono text-[11px] text-slate-400 bg-slate-950 p-2.5 rounded-lg border border-slate-800/80 leading-relaxed">
                  {ent.fields}
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};
