import React, { useState, useEffect, useRef } from 'react';
import { ShieldCheck, Lock, Mail, Eye, EyeOff, Loader2, ArrowRight, ArrowLeft, AlertCircle, CheckCircle2, X } from 'lucide-react';
import { LeafDecoration } from '../../components/auth/LeafDecoration';
import { adminSignIn, isAdminAuthenticated } from '../../services/adminService';

interface AdminLoginPageProps {
  onRouteChange?: (route: string) => void;
}

interface ToastState {
  type: 'success' | 'error' | 'info';
  message: string;
}

export const AdminLoginPage: React.FC<AdminLoginPageProps> = ({ onRouteChange }) => {
  const [email, setEmail] = useState('admin@agrivision.ai');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [toast, setToast] = useState<ToastState | null>(null);
  const toastTimeoutRef = useRef<any>(null);

  const showToast = (type: 'success' | 'error' | 'info', message: string) => {
    if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    setToast({ type, message });
    toastTimeoutRef.current = setTimeout(() => {
      setToast(null);
    }, 4500);
  };

  const handleNavigate = (route: string) => {
    if (onRouteChange) {
      onRouteChange(route);
    } else {
      window.location.href = route;
    }
  };

  useEffect(() => {
    if (isAdminAuthenticated()) {
      handleNavigate('/admin/dashboard');
    }
    return () => {
      if (toastTimeoutRef.current) clearTimeout(toastTimeoutRef.current);
    };
  }, [onRouteChange]);

  const handleAuthenticate = async (e?: React.FormEvent | React.MouseEvent) => {
    if (e) {
      e.preventDefault();
      e.stopPropagation();
    }
    console.log('[AdminLoginPage] Authenticate button clicked:', { email, passwordLength: password.length });

    if (!email.trim()) {
      const err = 'Please enter administrator email address.';
      setErrorMsg(err);
      showToast('error', err);
      return;
    }

    if (!password) {
      const err = 'Please enter administrator password.';
      setErrorMsg(err);
      showToast('error', err);
      return;
    }

    setErrorMsg(null);
    setIsLoading(true);

    try {
      const res = await adminSignIn(email, password);
      console.log('[AdminLoginPage] adminSignIn response:', res);
      setIsLoading(false);

      if (res.success && res.admin) {
        showToast('success', 'Authentication successful! Accessing Dashboard...');
        
        // Confirm token in localStorage
        const token = localStorage.getItem('agrivision_admin_token') || localStorage.getItem('admin_token');
        console.log('[AdminLoginPage] Token stored in localStorage:', token);

        setTimeout(() => {
          handleNavigate('/admin/dashboard');
        }, 350);
      } else {
        const errorText = res.error || 'Invalid credentials. Please verify your email and password.';
        console.warn('[AdminLoginPage] Authentication rejected:', errorText);
        setErrorMsg(errorText);
        showToast('error', errorText);
      }
    } catch (err: any) {
      setIsLoading(false);
      const netError = err?.message || 'Server not reachable. Please check your connection.';
      console.error('[AdminLoginPage] Exception during sign in:', err);
      setErrorMsg(netError);
      showToast('error', netError);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col justify-between overflow-x-hidden selection:bg-emerald-100 selection:text-emerald-900 font-sans text-[#0F172A]">
      {/* Floating Toast Notification */}
      {toast && (
        <div
          role="alert"
          className={`fixed top-5 left-1/2 -translate-x-1/2 z-50 flex items-center gap-3 px-5 py-3 rounded-2xl shadow-xl border text-xs sm:text-sm font-semibold transition-all duration-300 animate-in slide-in-from-top-4 ${
            toast.type === 'error'
              ? 'bg-rose-50 border-rose-200 text-rose-800'
              : 'bg-emerald-50 border-emerald-200 text-emerald-800'
          }`}
        >
          {toast.type === 'error' ? (
            <AlertCircle className="w-5 h-5 text-rose-600 shrink-0" />
          ) : (
            <CheckCircle2 className="w-5 h-5 text-emerald-600 shrink-0" />
          )}
          <span>{toast.message}</span>
          <button
            type="button"
            onClick={() => setToast(null)}
            className="ml-2 text-slate-400 hover:text-slate-600 cursor-pointer p-0.5"
            aria-label="Close notification"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

      {/* 1. Continuous Full-Screen Agricultural Background spanning Edge-to-Edge */}
      <div
        className="fixed inset-0 bg-cover bg-center -z-20 scale-[1.01]"
        style={{
          backgroundImage: "url('/auth_assets/auth_hero_desktop.jpg')",
        }}
      />

      {/* 2. Top Header Bar spanning full width matching SignIn / SignUp */}
      <header className="w-full max-w-[1360px] mx-auto px-5 sm:px-10 lg:px-12 pt-5 sm:pt-7 pb-2 flex items-center justify-between z-10">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            handleNavigate('/');
          }}
          className="flex items-center gap-2.5 select-none group cursor-pointer"
          aria-label="AgriVision AI - Healthy Crops. Brighter Tomorrow."
        >
          <img
            src="/branding/logo.png"
            alt="AgriVision AI Logo"
            className="w-9 h-9 sm:w-10 sm:h-10 object-contain drop-shadow-sm transition-transform group-hover:scale-105"
            onError={(e) => {
              (e.currentTarget as HTMLElement).style.display = 'none';
            }}
          />
          <div className="flex flex-col">
            <span className="text-lg sm:text-xl font-bold tracking-tight text-[#0F172A] group-hover:text-[#15803D] transition-colors leading-none">
              AgriVision<span className="text-[#15803D]"> AI</span>
            </span>
            <span className="text-[10px] sm:text-[11px] font-semibold text-slate-500 tracking-normal mt-0.5">
              System Administration
            </span>
          </div>
        </a>

        <button
          type="button"
          onClick={() => handleNavigate('/')}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-900 hover:text-[#15803D] transition-colors cursor-pointer group px-2 py-1"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </button>
      </header>

      {/* 3. Main Center Admin Login Card Area */}
      <main className="w-full max-w-[1360px] mx-auto px-4 sm:px-10 lg:px-12 py-4 sm:py-8 flex-1 flex items-center justify-center z-10">
        <div className="w-full max-w-[440px] relative">
          {/* Floating White Authentication Card matching SignIn / SignUp */}
          <div className="w-full bg-white rounded-3xl border border-slate-200/90 shadow-[0_16px_50px_rgba(0,0,0,0.12)] p-7 sm:p-9 relative z-10 animate-in fade-in zoom-in-95">
            {/* Header Branding */}
            <div className="text-center mb-6">
              <div className="w-12 h-12 rounded-2xl bg-[#15803D] text-white flex items-center justify-center mx-auto mb-3 shadow-sm">
                <ShieldCheck className="w-7 h-7" />
              </div>
              <h1 className="text-2xl sm:text-[26px] font-extrabold text-[#0F172A] tracking-tight">
                Admin Portal
              </h1>
              <p className="text-xs font-bold text-[#15803D] uppercase tracking-wider mt-1">
                Restricted System Access
              </p>
              <p className="text-xs text-slate-500 mt-1.5">
                Authorized administrators only. Real authentication required.
              </p>
            </div>

            {/* Error Alert */}
            {errorMsg && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-semibold animate-in shake flex items-start gap-2">
                <AlertCircle className="w-4 h-4 text-rose-500 shrink-0 mt-0.5" />
                <span>{errorMsg}</span>
              </div>
            )}

            <form onSubmit={handleAuthenticate} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Administrator Email
                </label>
                <div className="relative">
                  <Mail className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    placeholder="admin@agrivision.ai"
                    className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#15803D] focus:ring-2 focus:ring-[#15803D]/20 transition-all font-medium"
                  />
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Administrator Password
                </label>
                <div className="relative">
                  <Lock className="w-4 h-4 text-slate-400 absolute left-3.5 top-3.5" />
                  <input
                    type={showPassword ? 'text' : 'password'}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    placeholder="••••••••••••"
                    className="w-full h-11 pl-10 pr-11 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#15803D] focus:ring-2 focus:ring-[#15803D]/20 transition-all font-medium"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-3 text-slate-400 hover:text-slate-600 p-0.5 cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                onClick={handleAuthenticate}
                disabled={isLoading}
                className="w-full h-11 bg-[#15803D] hover:bg-[#166534] active:bg-[#14532D] disabled:bg-slate-300 text-white text-xs sm:text-sm font-bold rounded-xl shadow-sm hover:shadow transition-all flex items-center justify-center gap-2 cursor-pointer mt-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Authenticating...</span>
                  </>
                ) : (
                  <>
                    <span>Authenticate & Access Dashboard</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-100 text-center">
              <button
                type="button"
                onClick={() => handleNavigate('/')}
                className="text-xs font-semibold text-slate-500 hover:text-[#15803D] transition-colors cursor-pointer"
              >
                ← Return to AgriVision AI Public Site
              </button>
            </div>
          </div>

          {/* Large Semi-Transparent Decorative Green Leaf in Bottom-Right Corner overlapping card */}
          <LeafDecoration className="-bottom-5 -right-5 sm:-bottom-7 sm:-right-7 lg:-bottom-8 lg:-right-8 pointer-events-none" />
        </div>
      </main>

      {/* Bottom spacing */}
      <div className="h-6 sm:h-8" />
    </div>
  );
};

export default AdminLoginPage;
