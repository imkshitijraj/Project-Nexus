import React, { useState } from 'react';
import {
  Lock,
  Unlock,
  Key,
  Fingerprint,
  Shield,
  ArrowRight,
  LogOut
} from 'lucide-react';
import { useNexus } from '../../context/NexusContext';

export const LockScreenModal: React.FC = () => {
  const { isSessionLocked, unlockSession, currentUser, logout, showToast } = useNexus();
  const [pin, setPin] = useState('');
  const [error, setError] = useState(false);

  if (!isSessionLocked) return null;

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (pin === '1234' || pin.length >= 4) {
      unlockSession();
      setPin('');
      setError(false);
    } else {
      setError(true);
      showToast('Invalid PIN. Use default: 1234');
    }
  };

  const handleBiometricUnlock = () => {
    unlockSession();
    showToast('Biometric authentication verified (Windows Hello / Touch ID)');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#070b12]/95 backdrop-blur-2xl animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-slate-900/90 border border-indigo-500/30 rounded-3xl p-8 shadow-2xl text-center space-y-6">
        {/* Avatar & User Details */}
        <div className="space-y-3">
          <div className="relative inline-block">
            <img
              src={currentUser.avatar}
              alt={currentUser.name}
              className="w-20 h-20 rounded-full mx-auto object-cover border-2 border-indigo-500 shadow-xl shadow-indigo-500/20"
            />
            <div className="absolute bottom-0 right-1 p-1.5 rounded-full bg-slate-900 border border-slate-700 text-indigo-400">
              <Lock className="w-3.5 h-3.5" />
            </div>
          </div>

          <div>
            <h3 className="text-base font-bold text-white">{currentUser.name}</h3>
            <span className="text-xs text-indigo-400 font-mono">{currentUser.role}</span>
          </div>

          <p className="text-[11px] text-slate-400">
            Workstation locked for compliance. Enter PIN or authenticate to resume.
          </p>
        </div>

        {/* PIN Form */}
        <form onSubmit={handleUnlock} className="space-y-4">
          <div className="relative">
            <input
              type="password"
              maxLength={6}
              placeholder="Enter PIN (Demo: 1234)"
              value={pin}
              onChange={(e) => {
                setPin(e.target.value);
                setError(false);
              }}
              className="w-full px-4 py-2.5 rounded-xl bg-slate-950 border border-slate-700 text-center font-mono tracking-widest text-sm text-white focus:outline-none focus:border-indigo-500"
              autoFocus
            />
          </div>

          {error && (
            <div className="text-[11px] text-rose-400 font-medium">
              Incorrect PIN. (Demo default PIN is 1234)
            </div>
          )}

          <div className="space-y-2">
            <button
              type="submit"
              className="w-full py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-xs shadow-md shadow-indigo-600/30 flex items-center justify-center gap-1.5 transition-colors"
            >
              <Unlock className="w-3.5 h-3.5" />
              <span>Resume Session</span>
            </button>

            <button
              type="button"
              onClick={handleBiometricUnlock}
              className="w-full py-2.5 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-200 text-xs font-semibold flex items-center justify-center gap-1.5 transition-colors"
            >
              <Fingerprint className="w-4 h-4 text-emerald-400" />
              <span>Unlock with Windows Hello / Touch ID</span>
            </button>
          </div>
        </form>

        {/* Bottom Switch / Logout */}
        <div className="pt-2 border-t border-slate-800">
          <button
            onClick={logout}
            className="text-xs text-slate-400 hover:text-rose-400 flex items-center justify-center gap-1.5 mx-auto transition-colors"
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Sign out / Switch Account</span>
          </button>
        </div>
      </div>
    </div>
  );
};
