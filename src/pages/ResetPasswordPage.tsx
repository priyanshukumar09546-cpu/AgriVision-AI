import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, ArrowLeft, Loader2, CheckCircle2, AlertCircle } from 'lucide-react';
import { AuthHeroLeft } from '../components/auth/AuthHeroLeft';
import { LeafDecoration } from '../components/auth/LeafDecoration';
import { confirmPasswordReset } from '../services/authService';

interface ResetPasswordPageProps {
  onRouteChange?: (route: string) => void;
}

export const ResetPasswordPage: React.FC<ResetPasswordPageProps> = ({ onRouteChange }) => {
  const [token, setToken] = useState<string>('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  useEffect(() => {
    if (typeof window !== 'undefined') {
      const params = new URLSearchParams(window.location.search);
      const tokenParam = params.get('token');
      if (tokenParam) {
        setToken(tokenParam);
      } else {
        setErrorMessage('Invalid or missing password reset token. Please check your email link.');
      }
    }
  }, []);

  const handleNavigate = (route: string) => {
    if (onRouteChange) {
      onRouteChange(route);
    } else {
      window.location.href = route;
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!token) {
      setErrorMessage('Missing password reset token.');
      return;
    }

    if (!newPassword || newPassword.length < 6) {
      setErrorMessage('Password must be at least 6 characters long.');
      return;
    }

    if (newPassword !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await confirmPasswordReset(token, newPassword);
      if (res.success) {
        setIsSuccess(true);
      } else {
        setErrorMessage(res.error || 'Failed to reset password. Token may be invalid or expired.');
      }
    } catch {
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col justify-between overflow-x-hidden selection:bg-emerald-100 selection:text-emerald-900 font-sans text-[#0F172A]">
      {/* 1. Continuous Full-Screen Agricultural Background */}
      <div
        className="fixed inset-0 bg-cover bg-center -z-20 scale-[1.01]"
        style={{
          backgroundImage: "url('/auth_assets/auth_hero_desktop.jpg')",
        }}
      />

      {/* 2. Top Header Bar */}
      <header className="w-full max-w-[1360px] mx-auto px-5 sm:px-10 lg:px-12 pt-5 sm:pt-7 pb-2 flex items-center justify-between z-10">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            handleNavigate('/');
          }}
          className="flex items-center gap-2.5 select-none group cursor-pointer"
          aria-label="AgriVision AI"
        >
          <img
            src="/assets/leaf_logo_vector.svg"
            alt="AgriVision AI Leaf Logo"
            className="w-9 h-9 sm:w-10 sm:h-10 object-contain drop-shadow-xs group-hover:scale-105 transition-transform duration-200"
            width="40"
            height="40"
          />
          <div className="flex flex-col text-left leading-none">
            <div className="flex items-baseline tracking-tight">
              <span className="text-xl sm:text-[22px] font-extrabold text-[#0F172A] tracking-[-0.02em]">
                AgriVision
              </span>
              <span className="text-xl sm:text-[22px] font-extrabold text-[#15803D] ml-1 tracking-[-0.02em]">
                AI
              </span>
            </div>
            <span className="text-[10.5px] sm:text-xs font-medium text-slate-700 tracking-tight mt-1">
              Healthy Crops. Brighter Tomorrow.
            </span>
          </div>
        </a>

        <button
          type="button"
          onClick={() => handleNavigate('/signin')}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-900 hover:text-[#15803D] transition-colors cursor-pointer group px-2 py-1"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Sign In</span>
        </button>
      </header>

      {/* 3. Main Center Content Area */}
      <main className="w-full max-w-[1360px] mx-auto px-4 sm:px-10 lg:px-12 py-3 sm:py-6 flex-1 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-14 z-10">
        <div className="hidden lg:block lg:w-[48%] xl:w-[50%]">
          <AuthHeroLeft />
        </div>

        <div className="w-full lg:w-[48%] xl:w-[46%] flex justify-center lg:justify-end">
          <div className="w-full max-w-[430px] relative">
            <div className="w-full bg-white rounded-3xl border border-slate-200/90 shadow-[0_16px_50px_rgba(0,0,0,0.08)] p-6 sm:p-8 xl:p-9 relative z-10">
              
              {!isSuccess ? (
                <>
                  <div className="mb-5 sm:mb-6 text-left">
                    <h1 className="text-2xl sm:text-[26px] font-extrabold text-[#0F172A] tracking-tight">
                      Set New Password
                    </h1>
                    <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-1">
                      Enter your new secure password below to complete the reset process.
                    </p>
                  </div>

                  {errorMessage && (
                    <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium flex items-start gap-2">
                      <AlertCircle className="w-4 h-4 text-rose-600 shrink-0 mt-0.5" />
                      <span>{errorMessage}</span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* New Password Field */}
                    <div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Lock className="w-4 h-4 stroke-[1.8]" />
                        </div>
                        <input
                          type={showPassword ? 'text' : 'password'}
                          required
                          value={newPassword}
                          onChange={(e) => setNewPassword(e.target.value)}
                          placeholder="New Password (min. 6 characters)"
                          className="w-full h-11 pl-10 pr-11 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#15803D] focus:ring-2 focus:ring-[#15803D]/20 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                        >
                          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Confirm Password Field */}
                    <div>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Lock className="w-4 h-4 stroke-[1.8]" />
                        </div>
                        <input
                          type={showConfirmPassword ? 'text' : 'password'}
                          required
                          value={confirmPassword}
                          onChange={(e) => setConfirmPassword(e.target.value)}
                          placeholder="Confirm New Password"
                          className="w-full h-11 pl-10 pr-11 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#15803D] focus:ring-2 focus:ring-[#15803D]/20 transition-all"
                        />
                        <button
                          type="button"
                          onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                          className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                        >
                          {showConfirmPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>

                    {/* Submit Button */}
                    <button
                      type="submit"
                      disabled={isLoading || !token}
                      className="w-full h-11 bg-[#15803D] hover:bg-[#166534] active:bg-[#14532D] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs hover:shadow-sm transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Resetting Password...</span>
                        </>
                      ) : (
                        <span>Update Password</span>
                      )}
                    </button>
                  </form>
                </>
              ) : (
                <div className="text-center py-4 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#15803D] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-[#0F172A]">Password Reset Complete</h2>
                    <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                      Your AgriVision AI account password has been updated successfully. You can now sign in with your new password.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleNavigate('/signin')}
                    className="w-full h-11 bg-[#15803D] hover:bg-[#166534] text-white font-bold rounded-xl text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
                  >
                    Proceed to Login
                  </button>
                </div>
              )}
            </div>

            <LeafDecoration className="-bottom-5 -right-5 sm:-bottom-7 sm:-right-7 lg:-bottom-8 lg:-right-8" />
          </div>
        </div>
      </main>

      <div className="h-4 sm:h-6" />
    </div>
  );
};

export default ResetPasswordPage;
