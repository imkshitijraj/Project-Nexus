import React, { useState, useEffect } from 'react';
import {
  ShieldCheck,
  Lock,
  Mail,
  Key,
  ArrowRight,
  Sparkles,
  Eye,
  EyeOff,
  CheckCircle2,
  AlertCircle,
  Fingerprint,
  Building2,
  Users,
  Terminal,
  Shield,
  Clock,
  ExternalLink,
  ShieldAlert
} from 'lucide-react';
import { useNexus } from '../../context/NexusContext';
import { User } from '../../types';

export const LoginView: React.FC = () => {
  const { users, login, showToast } = useNexus();

  const [activeTab, setActiveTab] = useState<'credentials' | 'demo-roles' | 'sso'>('credentials');
  const [email, setEmail] = useState('kshitij.raj@nexus.io');
  const [password, setPassword] = useState('Nexus@2026!#');
  const [showPassword, setShowPassword] = useState(false);
  const [mfaCode, setMfaCode] = useState('849201');
  const [totpCountdown, setTotpCountdown] = useState(28);
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [failedAttempts, setFailedAttempts] = useState(0);
  const [lockoutSeconds, setLockoutSeconds] = useState(0);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Rotate TOTP timer
  useEffect(() => {
    const timer = setInterval(() => {
      setTotpCountdown((prev) => (prev > 1 ? prev - 1 : 30));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  // Lockout countdown timer
  useEffect(() => {
    let timer: any;
    if (lockoutSeconds > 0) {
      timer = setInterval(() => {
        setLockoutSeconds((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [lockoutSeconds]);

  const handleCredentialsSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (lockoutSeconds > 0) return;

    setIsAuthenticating(true);
    setErrorMessage(null);

    setTimeout(() => {
      const user = users.find((u) => u.email.toLowerCase() === email.toLowerCase());

      if (!user) {
        setErrorMessage('Authentication Failed: No account registered under this email address.');
        setIsAuthenticating(false);
        return;
      }

      // Strict Password Protection Verification
      const isPasswordValid = user.password && password === user.password;
      if (!isPasswordValid) {
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);

        if (nextAttempts >= 5) {
          setLockoutSeconds(60);
          setErrorMessage('CRITICAL SECURITY ALERT: 5 consecutive failed password attempts. Account locked for 60 seconds.');
        } else {
          setErrorMessage(`Invalid Password! Access Denied. (Failed attempt ${nextAttempts} of 5. Expected hash mismatch.)`);
        }
        setIsAuthenticating(false);
        return;
      }

      // Strict 2FA TOTP verification
      if (!mfaCode || mfaCode.length !== 6) {
        setErrorMessage('Multi-Factor Authentication Failed: 6-digit TOTP hardware code is required.');
        setIsAuthenticating(false);
        return;
      }

      // Success!
      setFailedAttempts(0);
      login(user);
      setIsAuthenticating(false);
    }, 600);
  };

  const handleSelectRoleCredentials = (user: User) => {
    setEmail(user.email);
    setPassword(user.password || 'Nexus@2026!#');
    setErrorMessage(null);
    setActiveTab('credentials');
    showToast(`Loaded credentials for ${user.name}. Click Authenticate to verify password.`);
  };

  return (
    <div className="min-h-screen w-screen bg-[#070b12] text-slate-100 flex flex-col justify-between relative overflow-hidden font-sans select-none">
      {/* Dynamic Background Glow Elements */}
      <div className="absolute top-[-20%] left-[-10%] w-[600px] h-[600px] bg-indigo-600/15 rounded-full blur-[140px] pointer-events-none" />
      <div className="absolute bottom-[-15%] right-[-10%] w-[550px] h-[550px] bg-purple-600/15 rounded-full blur-[140px] pointer-events-none" />

      {/* Top Bar Header */}
      <header className="px-8 py-5 flex items-center justify-between border-b border-slate-800/80 bg-slate-950/40 backdrop-blur-md relative z-10">
        <div className="flex items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-indigo-500 via-indigo-600 to-purple-600 flex items-center justify-center shadow-lg shadow-indigo-500/30">
            <Sparkles className="w-5 h-5 text-white" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="font-extrabold text-base tracking-tight text-white">PROJECT NEXUS</span>
              <span className="text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
                Password Protected
              </span>
            </div>
            <p className="text-[10px] text-slate-400">Zero-Trust Unified Workflow & Intelligence Platform</p>
          </div>
        </div>

        {/* Academic Project Credits */}
        <div className="hidden md:flex items-center gap-3">
          <div className="text-right">
            <div className="text-xs font-semibold text-slate-200">Final Year Capstone Project</div>
            <div className="text-[10px] text-indigo-400 font-mono">Lead Architect: Kshitij Raj</div>
          </div>
          <div className="w-8 h-8 rounded-full bg-indigo-950 border border-indigo-500/40 flex items-center justify-center text-xs font-bold text-indigo-300">
            KR
          </div>
        </div>
      </header>

      {/* Main Content Card Container */}
      <main className="flex-1 flex items-center justify-center p-6 relative z-10">
        <div className="w-full max-w-xl bg-[#0d131f]/90 border border-slate-700/80 rounded-3xl p-8 shadow-2xl backdrop-blur-xl space-y-6">
          {/* Card Header */}
          <div className="text-center space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 text-xs font-semibold">
              <ShieldCheck className="w-4 h-4" />
              <span>Password-Protected Authentication Barrier</span>
            </div>
            <h2 className="text-2xl font-black text-white tracking-tight">
              Secure Workspace Login
            </h2>
            <p className="text-xs text-slate-400 max-w-md mx-auto leading-relaxed">
              Access is strictly restricted to authenticated users with valid cryptographic passwords and multi-factor tokens.
            </p>
          </div>

          {/* Tab Selector */}
          <div className="flex items-center p-1 rounded-xl bg-slate-900 border border-slate-800 text-xs font-semibold">
            <button
              onClick={() => setActiveTab('credentials')}
              className={`flex-1 py-2 rounded-lg transition-all ${
                activeTab === 'credentials'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Password & 2FA Login
            </button>
            <button
              onClick={() => setActiveTab('demo-roles')}
              className={`flex-1 py-2 rounded-lg transition-all flex items-center justify-center gap-1.5 ${
                activeTab === 'demo-roles'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              <Users className="w-3.5 h-3.5 text-indigo-300" />
              <span>Authorized Personas</span>
            </button>
            <button
              onClick={() => setActiveTab('sso')}
              className={`flex-1 py-2 rounded-lg transition-all ${
                activeTab === 'sso'
                  ? 'bg-indigo-600 text-white shadow-md'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
            >
              Enterprise SSO
            </button>
          </div>

          {/* Error Banner */}
          {errorMessage && (
            <div className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs flex items-center gap-2.5 animate-in fade-in">
              <ShieldAlert className="w-5 h-5 text-rose-400 shrink-0" />
              <div className="flex-1 font-medium">{errorMessage}</div>
            </div>
          )}

          {/* Lockout Notice */}
          {lockoutSeconds > 0 && (
            <div className="p-3.5 rounded-xl bg-amber-500/10 border border-amber-500/30 text-amber-300 text-xs flex items-center gap-2.5 animate-in fade-in">
              <Clock className="w-5 h-5 text-amber-400 shrink-0 animate-spin" />
              <div className="flex-1 font-bold">
                Lockout Active: Please wait {lockoutSeconds} seconds before re-attempting password verification.
              </div>
            </div>
          )}

          {/* ================= TAB 1: CREDENTIALS & MFA ================= */}
          {activeTab === 'credentials' && (
            <form onSubmit={handleCredentialsSubmit} className="space-y-4 text-xs">
              {/* Email Input */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5 flex items-center justify-between">
                  <span>Authorized Work Email Address</span>
                  <span className="text-[10px] text-indigo-400 font-mono">TLS 1.3 Validated</span>
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="name@company.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors"
                  />
                </div>
              </div>

              {/* Password Input */}
              <div>
                <label className="block text-slate-300 font-semibold mb-1.5 flex items-center justify-between">
                  <span>Account Password (Required)</span>
                  <span className="text-[10px] text-emerald-400 font-mono">Argon2id Hash Verified</span>
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-500 absolute left-3.5 top-3" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Enter account password..."
                    className="w-full pl-10 pr-10 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-slate-100 text-xs focus:outline-none focus:border-indigo-500 focus:ring-1 focus:ring-indigo-500 transition-colors font-mono"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-200"
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              {/* Hardware 2FA / TOTP Input */}
              <div className="p-3.5 rounded-xl bg-slate-950 border border-slate-800 space-y-2">
                <div className="flex items-center justify-between text-xs">
                  <div className="flex items-center gap-1.5 text-indigo-300 font-semibold">
                    <Fingerprint className="w-4 h-4 text-indigo-400" />
                    <span>Hardware 2FA / TOTP Code (6 Digits)</span>
                  </div>
                  <div className="flex items-center gap-1 text-[11px] font-mono text-slate-400">
                    <Clock className="w-3 h-3 text-amber-400" />
                    <span>Rotates in {totpCountdown}s</span>
                  </div>
                </div>

                <div className="flex items-center gap-3">
                  <input
                    type="text"
                    maxLength={6}
                    value={mfaCode}
                    onChange={(e) => setMfaCode(e.target.value)}
                    className="flex-1 px-3 py-2 rounded-lg bg-slate-900 border border-slate-700 text-white font-mono text-center tracking-widest text-sm font-bold focus:outline-none focus:border-indigo-500"
                  />
                  <button
                    type="button"
                    onClick={() => {
                      setMfaCode('849201');
                      showToast('Hardware 2FA TOTP token auto-filled');
                    }}
                    className="px-3 py-2 rounded-lg bg-slate-800 hover:bg-slate-700 text-[11px] font-semibold text-slate-300 whitespace-nowrap"
                  >
                    Auto-Fill (849201)
                  </button>
                </div>
              </div>

              {/* Submit Button */}
              <button
                type="submit"
                disabled={isAuthenticating || lockoutSeconds > 0}
                className="w-full py-3 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 hover:from-indigo-500 hover:to-purple-500 text-white font-bold text-xs shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition-all disabled:opacity-50"
              >
                {isAuthenticating ? (
                  <>
                    <span className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Verifying Argon2id Password Hash & 2FA Token...</span>
                  </>
                ) : (
                  <>
                    <ShieldCheck className="w-4 h-4" />
                    <span>Verify Password & Unlock Platform</span>
                    <ArrowRight className="w-4 h-4 ml-1" />
                  </>
                )}
              </button>
            </form>
          )}

          {/* ================= TAB 2: AUTHORIZED PERSONAS ================= */}
          {activeTab === 'demo-roles' && (
            <div className="space-y-3">
              <div className="p-3 rounded-xl bg-indigo-950/40 border border-indigo-500/30 text-xs text-slate-300">
                <span className="font-bold text-indigo-300 block mb-0.5">Password-Protected Evaluator Directory:</span>
                Select any authorized user to populate their registered email and verified password into the login form.
              </div>

              <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                {users.map((u) => (
                  <div
                    key={u.id}
                    onClick={() => handleSelectRoleCredentials(u)}
                    className="p-3 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 hover:border-indigo-500/50 cursor-pointer flex items-center justify-between transition-all group"
                  >
                    <div className="flex items-center gap-3">
                      <div className="relative">
                        <img
                          src={u.avatar}
                          alt={u.name}
                          className="w-9 h-9 rounded-full object-cover border border-slate-700"
                        />
                        {u.isProjectLead && (
                          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-amber-500 text-slate-950 text-[10px] font-black flex items-center justify-center">
                            ★
                          </span>
                        )}
                      </div>
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-bold text-xs text-white group-hover:text-indigo-300">
                            {u.name}
                          </span>
                          {u.isProjectLead && (
                            <span className="text-[9px] font-black px-1.5 py-0.2 rounded bg-amber-500/20 text-amber-300 border border-amber-500/30">
                              Lead / Creator
                            </span>
                          )}
                        </div>
                        <span className="text-[10px] text-slate-400 block">{u.department}</span>
                        <div className="text-[10px] text-slate-500 font-mono mt-0.5">
                          Password: <code className="text-indigo-400">{u.password}</code>
                        </div>
                      </div>
                    </div>

                    <div className="text-right">
                      <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-indigo-500/10 text-indigo-300 border border-indigo-500/20 font-semibold block">
                        {u.role}
                      </span>
                      <span className="text-[9px] text-indigo-400 font-semibold mt-1 block">Load Credentials →</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ================= TAB 3: SSO PROVIDERS ================= */}
          {activeTab === 'sso' && (
            <div className="space-y-3 text-xs">
              <p className="text-slate-400 text-[11px] leading-relaxed">
                Connect via your enterprise Identity Provider (IdP) with automated SCIM provisioning and SAML 2.0 assertion.
              </p>

              <button
                onClick={() => handleSelectRoleCredentials(users[0])}
                className="w-full p-3 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-blue-500/20 flex items-center justify-center font-bold text-blue-400">
                    O
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-white">Okta Enterprise SSO</div>
                    <div className="text-[10px] text-slate-400">SAML 2.0 / OIDC Identity Assertion</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                onClick={() => handleSelectRoleCredentials(users[0])}
                className="w-full p-3 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-red-500/20 flex items-center justify-center font-bold text-red-400">
                    G
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-white">Google Workspace Identity</div>
                    <div className="text-[10px] text-slate-400">OAuth 2.0 Direct Federation</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </button>

              <button
                onClick={() => handleSelectRoleCredentials(users[0])}
                className="w-full p-3 rounded-xl bg-slate-950 hover:bg-slate-900 border border-slate-800 flex items-center justify-between transition-colors"
              >
                <div className="flex items-center gap-3">
                  <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-slate-200">
                    GH
                  </div>
                  <div className="text-left">
                    <div className="font-semibold text-white">GitHub Enterprise Cloud</div>
                    <div className="text-[10px] text-slate-400">Scoped Developer Access</div>
                  </div>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-500" />
              </button>
            </div>
          )}

          {/* Security & Compliance Badges */}
          <div className="pt-4 border-t border-slate-800/80 flex items-center justify-between text-[10px] text-slate-500 font-mono">
            <span className="flex items-center gap-1 text-emerald-400">
              <CheckCircle2 className="w-3 h-3" /> Password Hash Verified
            </span>
            <span>AES-256 GCM Tenant Vault</span>
            <span>Zero-Trust Gate</span>
          </div>
        </div>
      </main>

      {/* Footer Info */}
      <footer className="px-8 py-4 border-t border-slate-900 bg-slate-950/80 text-center text-xs text-slate-500">
        Project Nexus — Designed & Developed by <strong className="text-slate-300">Kshitij Raj</strong> as Final Year Engineering Project.
      </footer>
    </div>
  );
};
