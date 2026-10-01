import React, { useState } from 'react';
import {
  ShieldCheck,
  FileText,
  Key,
  Users,
  Lock,
  Plus,
  Check,
  X,
  AlertTriangle,
  RefreshCw,
  Search,
  Fingerprint,
  Smartphone,
  Laptop,
  Globe,
  Clock,
  ShieldAlert,
  LogOut,
  Power
} from 'lucide-react';
import { useNexus } from '../../context/NexusContext';
import { RoleType } from '../../types';

export const SecurityAdminView: React.FC = () => {
  const {
    auditLogs,
    apiKeys,
    generateApiKey,
    userSessions,
    revokeSession,
    securityEvents,
    mfaEnabled,
    toggleMfa,
    lockSession,
    currentUser,
    switchUser,
    users,
    showToast
  } = useNexus();

  const [activeTab, setActiveTab] = useState<'dashboard' | 'audit' | 'rbac' | 'api-keys' | 'policies'>('dashboard');
  const [newKeyName, setNewKeyName] = useState('');
  const [newKeyRole, setNewKeyRole] = useState('Read & Write');
  const [isGeneratingKey, setIsGeneratingKey] = useState(false);
  const [auditSearch, setAuditSearch] = useState('');

  const roles: RoleType[] = [
    'Super Admin',
    'Organization Admin',
    'Workspace Admin',
    'Project Manager',
    'Team Lead',
    'Member',
    'Viewer/Guest'
  ];

  const permissions = [
    { key: 'create_project', label: 'Create Projects', allowed: ['Super Admin', 'Organization Admin', 'Workspace Admin', 'Project Manager'] },
    { key: 'delete_project', label: 'Delete Projects', allowed: ['Super Admin', 'Organization Admin'] },
    { key: 'modify_budget', label: 'Approve Budgets', allowed: ['Super Admin', 'Organization Admin', 'Project Manager'] },
    { key: 'manage_automations', label: 'Configure Automations', allowed: ['Super Admin', 'Workspace Admin', 'Project Manager', 'Team Lead'] },
    { key: 'manage_api_keys', label: 'Generate API Keys', allowed: ['Super Admin', 'Workspace Admin'] },
    { key: 'view_audit_logs', label: 'Inspect Audit Logs', allowed: ['Super Admin', 'Organization Admin', 'Workspace Admin'] },
    { key: 'modify_tasks', label: 'Edit & Move Tasks', allowed: ['Super Admin', 'Organization Admin', 'Workspace Admin', 'Project Manager', 'Team Lead', 'Member'] },
    { key: 'read_only_access', label: 'View-Only Access', allowed: ['Super Admin', 'Organization Admin', 'Workspace Admin', 'Project Manager', 'Team Lead', 'Member', 'Viewer/Guest'] }
  ];

  const handleGenerateKey = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newKeyName.trim()) return;
    generateApiKey(newKeyName.trim(), newKeyRole);
    setNewKeyName('');
    setIsGeneratingKey(false);
  };

  const filteredLogs = auditLogs.filter(
    (log) =>
      log.user.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.action.toLowerCase().includes(auditSearch.toLowerCase()) ||
      log.entity.toLowerCase().includes(auditSearch.toLowerCase())
  );

  return (
    <div className="p-8 max-w-7xl mx-auto space-y-8 animate-in fade-in duration-200">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="text-[11px] font-bold uppercase tracking-wider text-indigo-400 bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-500/20">
              Security Governance & Sessions
            </span>
            <span className="text-[11px] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded">
              Zero-Trust Level 3
            </span>
          </div>
          <h1 className="text-2xl font-extrabold text-white tracking-tight flex items-center gap-2.5">
            <ShieldCheck className="w-6 h-6 text-indigo-400" />
            Security Center, Active Sessions & RBAC Matrix
          </h1>
          <p className="text-xs text-slate-400 max-w-2xl mt-1">
            Zero-Trust identity verification, session revocation, immutable cryptographic audit logging, and dynamic role enforcement.
          </p>
        </div>

        {/* Lock Workstation Quick Action */}
        <div className="flex items-center gap-2.5 shrink-0">
          <button
            onClick={lockSession}
            className="flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold border border-slate-700 transition-colors shadow-sm"
          >
            <Lock className="w-3.5 h-3.5 text-amber-400" />
            <span>Lock Workstation</span>
          </button>
        </div>
      </div>

      {/* Tabs */}
      <div className="flex items-center gap-2 border-b border-slate-800 pb-3 overflow-x-auto">
        <button
          onClick={() => setActiveTab('dashboard')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'dashboard' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Fingerprint className="w-3.5 h-3.5" />
          <span>Security Health & Sessions ({userSessions.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('audit')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'audit' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <FileText className="w-3.5 h-3.5" />
          <span>Immutable Audit Logs ({auditLogs.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('rbac')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'rbac' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Users className="w-3.5 h-3.5" />
          <span>RBAC Matrix</span>
        </button>
        <button
          onClick={() => setActiveTab('api-keys')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'api-keys' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Key className="w-3.5 h-3.5" />
          <span>API Tokens ({apiKeys.length})</span>
        </button>
        <button
          onClick={() => setActiveTab('policies')}
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors ${
            activeTab === 'policies' ? 'bg-indigo-600 text-white' : 'text-slate-400 hover:text-slate-200'
          }`}
        >
          <Lock className="w-3.5 h-3.5" />
          <span>Policies & MFA</span>
        </button>
      </div>

      {/* ================= TAB 0: SECURITY HEALTH & SESSIONS ================= */}
      {activeTab === 'dashboard' && (
        <div className="space-y-6">
          {/* Security Score Banner */}
          <div className="p-6 rounded-2xl bg-gradient-to-r from-indigo-950/60 via-slate-900 to-emerald-950/40 border border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div className="space-y-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-400 flex items-center gap-1.5">
                <Check className="w-3.5 h-3.5" /> Defense-in-Depth Architecture
              </span>
              <h3 className="text-xl font-black text-white">
                Workspace Security Health Score: 98% (Hardened)
              </h3>
              <p className="text-xs text-slate-300 max-w-xl leading-relaxed">
                Hardware 2FA active, TLS 1.3 mTLS inter-service mesh enabled, Argon2id salted credentials, and Row-Level Security enforced on tenant databases.
              </p>
            </div>

            <div className="flex items-center gap-4 shrink-0">
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                <span className="text-2xl font-black text-emerald-400">0</span>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">Vulnerabilities</span>
              </div>
              <div className="p-3 rounded-2xl bg-slate-900/80 border border-slate-800 text-center">
                <span className="text-2xl font-black text-indigo-400 font-mono">256-bit</span>
                <span className="text-[10px] text-slate-400 block uppercase font-bold">AES Encryption</span>
              </div>
            </div>
          </div>

          {/* Active Sessions Grid */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <Laptop className="w-4 h-4 text-indigo-400" />
                Active Workstation & Client Sessions ({userSessions.length})
              </h3>
              <span className="text-xs text-slate-400 font-mono">Real-Time IP Telemetry</span>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {userSessions.map((sess) => (
                <div
                  key={sess.id}
                  className={`p-4 rounded-xl border flex flex-col justify-between space-y-3 ${
                    sess.isCurrent
                      ? 'bg-slate-900/90 border-indigo-500/50 shadow-md shadow-indigo-500/5'
                      : 'bg-slate-900/50 border-slate-800'
                  }`}
                >
                  <div>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-xs font-bold text-white flex items-center gap-1.5 truncate">
                        {sess.device.includes('iPhone') ? (
                          <Smartphone className="w-3.5 h-3.5 text-purple-400" />
                        ) : (
                          <Laptop className="w-3.5 h-3.5 text-indigo-400" />
                        )}
                        <span className="truncate">{sess.device}</span>
                      </span>
                      {sess.isCurrent && (
                        <span className="text-[9px] font-bold px-1.5 py-0.2 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                          Current
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-slate-400 font-mono">{sess.browser}</p>
                    <div className="text-[11px] text-slate-500 mt-2 space-y-0.5">
                      <div>IP: <span className="font-mono text-slate-300">{sess.ipAddress}</span></div>
                      <div>Location: <span className="text-slate-300">{sess.location}</span></div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t border-slate-800 text-[11px]">
                    <span className="text-slate-400">{sess.lastActive}</span>
                    {!sess.isCurrent && (
                      <button
                        onClick={() => revokeSession(sess.id)}
                        className="text-rose-400 hover:text-rose-300 font-semibold"
                      >
                        Revoke
                      </button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Security Telemetry Event Log */}
          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden space-y-2">
            <div className="p-4 bg-slate-900 border-b border-slate-800 flex items-center justify-between">
              <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 text-amber-400" />
                Zero-Trust Authentication Events & Step-Up Challenges
              </h3>
              <span className="text-[10px] font-mono text-slate-400">Live Stream</span>
            </div>

            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 font-mono">
                <tr>
                  <th className="px-4 py-2.5">Timestamp</th>
                  <th className="px-4 py-2.5">Event Type</th>
                  <th className="px-4 py-2.5">Client IP</th>
                  <th className="px-4 py-2.5">Details</th>
                  <th className="px-4 py-2.5">Severity</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {securityEvents.map((ev) => (
                  <tr key={ev.id} className="hover:bg-slate-800/40">
                    <td className="px-4 py-2.5 text-slate-400">{ev.timestamp}</td>
                    <td className="px-4 py-2.5 text-white font-bold">{ev.type}</td>
                    <td className="px-4 py-2.5 text-slate-400">{ev.ipAddress}</td>
                    <td className="px-4 py-2.5 font-sans text-slate-300">{ev.details}</td>
                    <td className="px-4 py-2.5 font-sans">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          ev.severity === 'info'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-amber-500/10 text-amber-400 border border-amber-500/20'
                        }`}
                      >
                        {ev.severity}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 1: AUDIT LOGS ================= */}
      {activeTab === 'audit' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="relative w-72">
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
              <input
                type="text"
                placeholder="Search actor, action, or entity..."
                value={auditSearch}
                onChange={(e) => setAuditSearch(e.target.value)}
                className="w-full pl-8 pr-3 py-1.5 rounded-lg bg-slate-900 border border-slate-800 text-xs text-slate-200 placeholder:text-slate-500 focus:outline-none focus:border-indigo-500"
              />
            </div>
            <span className="text-xs text-slate-400 font-mono">
              Immutable append-only ledger
            </span>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-hidden">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider font-mono">
                <tr>
                  <th className="px-4 py-3">Timestamp</th>
                  <th className="px-4 py-3">Actor</th>
                  <th className="px-4 py-3">Action</th>
                  <th className="px-4 py-3">Entity</th>
                  <th className="px-4 py-3">Previous Value → New Value</th>
                  <th className="px-4 py-3">Client IP</th>
                  <th className="px-4 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60 font-mono">
                {filteredLogs.map((log) => (
                  <tr key={log.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 text-slate-400">{log.timestamp}</td>
                    <td className="px-4 py-3 font-sans font-semibold text-white">{log.user}</td>
                    <td className="px-4 py-3 text-indigo-300 font-bold">{log.action}</td>
                    <td className="px-4 py-3 text-slate-300">{log.entity}</td>
                    <td className="px-4 py-3 text-[11px]">
                      <span className="text-rose-400">{log.previousValue}</span>
                      <span className="text-slate-500 mx-1.5">→</span>
                      <span className="text-emerald-400">{log.newValue}</span>
                    </td>
                    <td className="px-4 py-3 text-slate-500">{log.ipAddress}</td>
                    <td className="px-4 py-3 font-sans">
                      <span
                        className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                          log.status === 'Success'
                            ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20'
                            : 'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                        }`}
                      >
                        {log.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 2: RBAC MATRIX ================= */}
      {activeTab === 'rbac' && (
        <div className="space-y-4">
          <div className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between text-xs">
            <span className="text-slate-300">
              Active Evaluation Persona: <strong className="text-indigo-400">{currentUser.name}</strong> ({currentUser.role})
            </span>
            <div className="flex items-center gap-2">
              <span className="text-slate-400">Switch Persona:</span>
              <select
                value={currentUser.id}
                onChange={(e) => {
                  const target = users.find((u) => u.id === e.target.value);
                  if (target) switchUser(target);
                }}
                className="px-2.5 py-1 rounded bg-slate-950 border border-slate-700 text-white text-xs"
              >
                {users.map((u) => (
                  <option key={u.id} value={u.id}>
                    {u.name} ({u.role})
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div className="rounded-2xl border border-slate-800 bg-slate-900/60 overflow-x-auto">
            <table className="w-full text-left text-xs text-slate-300">
              <thead className="bg-slate-900/90 border-b border-slate-800 text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                <tr>
                  <th className="px-4 py-3 w-56">Permission Capability</th>
                  {roles.map((r) => (
                    <th key={r} className="px-3 py-3 text-center">
                      {r}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {permissions.map((p) => (
                  <tr key={p.key} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-3 font-semibold text-white">{p.label}</td>
                    {roles.map((r) => {
                      const isAllowed = p.allowed.includes(r);
                      return (
                        <td key={r} className="px-3 py-3 text-center">
                          {isAllowed ? (
                            <div className="w-5 h-5 mx-auto rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
                              <Check className="w-3 h-3" />
                            </div>
                          ) : (
                            <div className="w-5 h-5 mx-auto rounded-full bg-slate-800 text-slate-600 flex items-center justify-center">
                              <X className="w-3 h-3" />
                            </div>
                          )}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ================= TAB 3: API KEYS ================= */}
      {activeTab === 'api-keys' && (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Authorized Service Tokens & Webhook API Keys
            </h3>
            <button
              onClick={() => setIsGeneratingKey(true)}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-semibold"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Generate New API Key</span>
            </button>
          </div>

          <div className="space-y-3">
            {apiKeys.map((k) => (
              <div
                key={k.id}
                className="p-4 rounded-xl bg-slate-900 border border-slate-800 flex items-center justify-between gap-4"
              >
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-bold text-white">{k.name}</span>
                    <span className="text-[10px] px-1.5 py-0.2 rounded bg-indigo-500/10 text-indigo-400 border border-indigo-500/20">
                      {k.role}
                    </span>
                  </div>
                  <div className="font-mono text-xs text-slate-400 mt-1">{k.keyMasked}</div>
                </div>

                <div className="text-right text-xs text-slate-400">
                  <div>Last used: {k.lastUsed}</div>
                  <div className="text-[10px] text-slate-500">Created: {k.createdAt}</div>
                </div>
              </div>
            ))}
          </div>

          {isGeneratingKey && (
            <div className="p-4 rounded-xl bg-slate-900 border border-indigo-500/40 animate-in fade-in">
              <form onSubmit={handleGenerateKey} className="flex items-end gap-3 text-xs">
                <div className="flex-1">
                  <label className="block text-slate-300 font-semibold mb-1">Key Description Name</label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Production CI Runner"
                    value={newKeyName}
                    onChange={(e) => setNewKeyName(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none focus:border-indigo-500"
                  />
                </div>
                <div className="w-48">
                  <label className="block text-slate-300 font-semibold mb-1">Scope</label>
                  <select
                    value={newKeyRole}
                    onChange={(e) => setNewKeyRole(e.target.value)}
                    className="w-full px-3 py-1.5 rounded-lg bg-slate-950 border border-slate-700 text-white focus:outline-none"
                  >
                    <option value="Full Admin">Full Admin</option>
                    <option value="Read & Write">Read & Write</option>
                    <option value="Read Only">Read Only</option>
                  </select>
                </div>
                <button
                  type="submit"
                  className="px-4 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-semibold"
                >
                  Generate
                </button>
                <button
                  type="button"
                  onClick={() => setIsGeneratingKey(false)}
                  className="px-3 py-1.5 rounded-lg bg-slate-800 text-slate-300 hover:bg-slate-700"
                >
                  Cancel
                </button>
              </form>
            </div>
          )}
        </div>
      )}

      {/* ================= TAB 4: POLICIES & MFA ================= */}
      {activeTab === 'policies' && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Data Retention & Compliance
            </h3>
            <p className="text-xs text-slate-400">
              Configure automated purges and cold storage archive duration for audit logs and chat records.
            </p>
            <div className="space-y-3 pt-2 text-xs">
              <label className="block text-slate-300 font-semibold">Audit Log Retention Policy</label>
              <select className="w-full px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white focus:outline-none">
                <option value="365">365 Days (SOC2 Compliant Standard)</option>
                <option value="730">730 Days (2 Years Enterprise)</option>
                <option value="unlimited">Indefinite Immutable Storage</option>
              </select>
            </div>
          </div>

          <div className="p-6 rounded-2xl bg-slate-900/60 border border-slate-800 space-y-4">
            <h3 className="text-sm font-bold text-white uppercase tracking-wider">
              Authentication Security & 2FA
            </h3>
            <p className="text-xs text-slate-400">
              Enforce mandatory multi-factor authentication (MFA) and Session Timeouts.
            </p>
            <div className="space-y-3 pt-2 text-xs">
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div>
                  <span className="font-semibold text-white block">Require Hardware 2FA / TOTP</span>
                  <span className="text-[10px] text-slate-400">Protects against credential stuffing</span>
                </div>
                <button
                  onClick={toggleMfa}
                  className={`px-3 py-1 rounded-full text-[10px] font-bold transition-colors ${
                    mfaEnabled
                      ? 'bg-emerald-500/20 text-emerald-400 border border-emerald-500/30'
                      : 'bg-slate-800 text-slate-400'
                  }`}
                >
                  {mfaEnabled ? 'Enforced' : 'Disabled'}
                </button>
              </div>
              <div className="flex items-center justify-between p-3 rounded-lg bg-slate-900 border border-slate-800">
                <div>
                  <span className="font-semibold text-white block">Session Idle Invalidation (4 Hours)</span>
                  <span className="text-[10px] text-slate-400">Forces PIN verification after idle period</span>
                </div>
                <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                  Active
                </span>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
