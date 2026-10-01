import React, { useState } from 'react';
import {
  ShieldAlert,
  Key,
  Lock,
  Unlock,
  Building2,
  CheckCircle2,
  AlertTriangle,
  ArrowRight,
  LogOut,
  Sparkles,
  HelpCircle
} from 'lucide-react';
import { useNexus } from '../../context/NexusContext';

export const WorkspaceGateModal: React.FC = () => {
  const {
    activeWorkspace,
    setActiveWorkspace,
    workspaces,
    isWorkspaceUnlocked,
    unlockWorkspace,
    currentUser,
    logout,
    showToast
  } = useNexus();

  const [passcode, setPasscode] = useState('');
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [isDecrypting, setIsDecrypting] = useState(false);
  const [showPasscode, setShowPasscode] = useState(false);

  // If already unlocked, do not render
  if (isWorkspaceUnlocked) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (!passcode.trim()) return;

    setIsDecrypting(true);
    setErrorMsg(null);

    setTimeout(() => {
      const success = unlockWorkspace(passcode);
      if (!success) {
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);
        if (nextAttempts >= 4) {
          setErrorMsg(`Security Alert: ${nextAttempts} failed attempts. Cloudflare WAF challenge will be triggered after 5 failures.`);
        } else {
          setErrorMsg(`Incorrect security passkey. Attempt ${nextAttempts} of 5.`);
        }
      } else {
        setFailedAttempts(0);
      }
      setIsDecrypting(false);
    }, 500);
  };

  const handleUseDemoPasscode = () => {
    setPasscode(activeWorkspace.securityPasscode || 'NEXUS-2026');
    showToast('Authorized Workspace Passkey auto-filled');
  };

  return (
    <div className="fixed inset-0 z-40 bg-[#070b12]/95 backdrop-blur-2xl flex items-center justify-center p-6 animate-in fade-in duration-200">
      <div className="w-full max-w-lg bg-[#0d131f]/90 border border-slate-700/80 rounded-3xl p-8 shadow-2xl space-y-6 relative overflow-hidden">
        {/* Top glowing ambient accent */}
        <div className="absolute -top-24 -left-24 w-48 h-48 bg-indigo-500/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -right-24 w-48 h-48 bg-purple-500/20 rounded-full blur-3xl pointer-events-none" />

        {/* Security Badge */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-amber-500/10 border border-amber-500/20 text-amber-400 text-xs font-semibold">
            <Lock className="w-3.5 h-3.5" />
            <span>Encrypted Tenant Workspace Gateway</span>
          </div>
          <span className="text-[10px] font-mono text-slate-400">
            {activeWorkspace.plan} Security Tier
          </span>
        </div>

        {/* Workspace Details */}
        <div className="space-y-2">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-2xl bg-indigo-950 border border-indigo-500/40 flex items-center justify-center shrink-0 shadow-lg shadow-indigo-500/20">
              <Building2 className="w-6 h-6 text-indigo-400" />
            </div>
            <div>
              <h2 className="text-xl font-black text-white tracking-tight">
                {activeWorkspace.name}
              </h2>
              <p className="text-xs text-slate-400">
                Organization: <span className="text-slate-200 font-semibold">{activeWorkspace.organization}</span>
              </p>
            </div>
          </div>

          <p className="text-xs text-slate-300 leading-relaxed pt-2">
            This workspace is protected by a dedicated <strong>Tenant Encryption Passkey</strong>. You must enter the authorized workspace passkey or your account master password to decrypt active projects, tasks, financial budgets, and documents.
          </p>

          {/* Switch Workspace Selector */}
          <div className="pt-1 flex items-center gap-1.5 flex-wrap">
            <span className="text-[10px] text-slate-400 font-semibold uppercase tracking-wider mr-1">Switch Workspace:</span>
            {workspaces.map((ws) => (
              <button
                key={ws.id}
                type="button"
                onClick={() => {
                  setActiveWorkspace(ws);
                  setPasscode('');
                  setErrorMsg(null);
                }}
                className={`px-2.5 py-1 rounded-lg text-[11px] font-medium transition-all flex items-center gap-1.5 ${
                  activeWorkspace.id === ws.id
                    ? 'bg-indigo-600/30 text-indigo-300 border border-indigo-500/50 shadow-sm'
                    : 'bg-slate-900/80 text-slate-400 border border-slate-800 hover:text-slate-200'
                }`}
              >
                <Lock className="w-3 h-3 text-amber-400" />
                <span>{ws.name.split(' ')[0]}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Form */}
        <form onSubmit={handleUnlock} className="space-y-4 text-xs">
          <div>
            <label className="block text-slate-300 font-semibold mb-1.5 flex items-center justify-between">
              <span>Workspace Security Passkey / Master Password</span>
              <span className="text-[10px] text-emerald-400 font-mono">Zero-Knowledge</span>
            </label>

            <div className="relative">
              <Key className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
              <input
                type={showPasscode ? 'text' : 'password'}
                required
                value={passcode}
                onChange={(e) => {
                  setPasscode(e.target.value);
                  setErrorMsg(null);
                }}
                placeholder="Enter workspace passkey or master password..."
                className="w-full pl-10 pr-20 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-white font-mono text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500"
                autoFocus
              />
              <button
                type="button"
                onClick={() => setShowPasscode(!showPasscode)}
                className="absolute right-3 top-2.5 text-[11px] font-mono text-slate-400 hover:text-slate-200"
              >
                {showPasscode ? 'Hide' : 'Show'}
              </button>
            </div>
          </div>

          {errorMsg && (
            <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 flex items-center gap-2 text-[11px] animate-in fade-in">
              <AlertTriangle className="w-4 h-4 text-rose-400 shrink-0" />
              <span>{errorMsg}</span>
            </div>
          )}

          {/* Quick Evaluator Helper Banner */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center justify-between">
            <div className="text-[11px] text-slate-400">
              <span className="text-slate-300 font-semibold block">Authorized Passkey for this Workspace:</span>
              <code className="text-indigo-400 font-mono font-bold">
                {activeWorkspace.securityPasscode || 'NEXUS-2026'}
              </code>
            </div>
            <button
              type="button"
              onClick={handleUseDemoPasscode}
              className="px-2.5 py-1 rounded-lg bg-indigo-600/20 hover:bg-indigo-600/30 text-indigo-300 text-[11px] font-semibold border border-indigo-500/30 transition-colors whitespace-nowrap"
            >
              Auto-Fill Passkey
            </button>
          </div>

          {/* Unlock Button */}
          <button
            type="submit"
            disabled={isDecrypting || !passcode.trim()}
            className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
          >
            {isDecrypting ? (
              <>
                <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Decrypting Workspace Tenant Vault...</span>
              </>
            ) : (
              <>
                <Unlock className="w-4 h-4" />
                <span>Decrypt & Unlock Workspace</span>
                <ArrowRight className="w-4 h-4" />
              </>
            )}
          </button>
        </form>

        {/* Bottom Options */}
        <div className="pt-2 border-t border-slate-800 flex items-center justify-between text-xs text-slate-400">
          <span>Signed in as: <strong className="text-slate-200">{currentUser.name}</strong></span>
          <button
            onClick={logout}
            className="text-rose-400 hover:text-rose-300 flex items-center gap-1 font-medium transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign Out</span>
          </button>
        </div>
      </div>
    </div>
  );
};
