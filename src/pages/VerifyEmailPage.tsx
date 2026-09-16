import React, { useState, useEffect } from 'react';
import { Mail, CheckCircle2, AlertCircle, ArrowLeft, Loader2 } from 'lucide-react';
import { AuthHeroLeft } from '../components/auth/AuthHeroLeft';
import { LeafDecoration } from '../components/auth/LeafDecoration';
import { verifyEmailToken, resendEmailVerification, getStoredAuthUser } from '../services/authService';

interface VerifyEmailPageProps {
  onRouteChange?: (route: string) => void;
}

export const VerifyEmailPage: React.FC<VerifyEmailPageProps> = ({ onRouteChange }) => {
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  // Resend verification state
  const [resendEmail, setResendEmail] = useState('');
  const [isResending, setIsResending] = useState(false);
  const [resendMessage, setResendMessage] = useState<string | null>(null);

  const handleNavigate = (route: string) => {
    if (onRouteChange) {
      onRouteChange(route);
    } else {
      window.location.href = route;
    }
  };

  useEffect(() => {
    const doVerify = async () => {
      if (typeof window !== 'undefined') {
        const params = new URLSearchParams(window.location.search);
        const token = params.get('token');

        if (!token) {
          setStatus('error');
          setErrorMessage('Missing verification token in URL.');
          return;
        }

        try {
          const res = await verifyEmailToken(token);
          if (res.success) {
            setStatus('success');
            setSuccessMessage(res.message || 'Email verified successfully!');
            // Update stored user emailVerified flag if user is logged in
            const stored = getStoredAuthUser();
            if (stored) {
              stored.emailVerified = true;
              localStorage.setItem('agrivision_auth_user', JSON.stringify(stored));
            }
          } else {
            setStatus('error');
            setErrorMessage(res.error || 'Verification link is invalid or has expired.');
          }
        } catch {
          setStatus('error');
          setErrorMessage('An unexpected error occurred during verification.');
        }
      }
    };

    doVerify();
  }, []);

  const handleResend = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!resendEmail || !resendEmail.includes('@')) {
      setResendMessage('Please enter a valid email address.');
      return;
    }

    setIsResending(true);
    setResendMessage(null);
    try {
      const res = await resendEmailVerification(resendEmail);
      if (res.success) {
        setResendMessage(res.message || 'Verification email sent! Check your inbox.');
      } else {
        setResendMessage(res.error || 'Failed to resend verification email.');
      }
    } catch {
      setResendMessage('An unexpected error occurred.');
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col justify-between overflow-x-hidden selection:bg-emerald-100 selection:text-emerald-900 font-sans text-[#0F172A]">
      <div
        className="fixed inset-0 bg-cover bg-center -z-20 scale-[1.01]"
        style={{
          backgroundImage: "url('/auth_assets/auth_hero_desktop.jpg')",
        }}
      />

      <header className="w-full max-w-[1360px] mx-auto px-5 sm:px-10 lg:px-12 pt-5 sm:pt-7 pb-2 flex items-center justify-between z-10">
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            handleNavigate('/');
          }}
          className="flex items-center gap-2.5 select-none group cursor-pointer"
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

      <main className="w-full max-w-[1360px] mx-auto px-4 sm:px-10 lg:px-12 py-3 sm:py-6 flex-1 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-14 z-10">
        <div className="hidden lg:block lg:w-[48%] xl:w-[50%]">
          <AuthHeroLeft />
        </div>

        <div className="w-full lg:w-[48%] xl:w-[46%] flex justify-center lg:justify-end">
          <div className="w-full max-w-[430px] relative">
            <div className="w-full bg-white rounded-3xl border border-slate-200/90 shadow-[0_16px_50px_rgba(0,0,0,0.08)] p-6 sm:p-8 xl:p-9 relative z-10">
              
              {status === 'verifying' && (
                <div className="text-center py-6 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-50 text-[#15803D] flex items-center justify-center mx-auto animate-pulse">
                    <Loader2 className="w-8 h-8 animate-spin stroke-[2.2]" />
                  </div>
                  <div>
                    <h2 className="text-2xl font-bold text-[#0F172A]">Verifying Email</h2>
                    <p className="text-xs sm:text-sm text-slate-500 mt-2 font-medium">
                      Please wait while we verify your email token...
                    </p>
                  </div>
                </div>
              )}

              {status === 'success' && (
                <div className="text-center py-4 space-y-4">
                  <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#15803D] flex items-center justify-center mx-auto">
                    <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
                  </div>

                  <div>
                    <h2 className="text-2xl font-bold text-[#0F172A]">Email Verified!</h2>
                    <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                      {successMessage || 'Your email address has been successfully verified.'} You now have full access to AgriVision AI.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleNavigate('/dashboard')}
                    className="w-full h-11 bg-[#15803D] hover:bg-[#166534] text-white font-bold rounded-xl text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
                  >
                    Go to Dashboard
                  </button>
                </div>
              )}

              {status === 'error' && (
                <div className="space-y-4">
                  <div className="text-center">
                    <div className="w-14 h-14 rounded-full bg-rose-100 text-rose-600 flex items-center justify-center mx-auto mb-3">
                      <AlertCircle className="w-8 h-8 stroke-[2.2]" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#0F172A]">Verification Failed</h2>
                    <p className="text-xs sm:text-sm text-slate-600 mt-2 leading-relaxed">
                      {errorMessage || 'The verification link is invalid or has expired.'}
                    </p>
                  </div>

                  <div className="border-t border-slate-200 pt-4">
                    <h3 className="text-sm font-bold text-[#0F172A] mb-1">Resend Verification Email</h3>
                    <p className="text-xs text-slate-500 mb-3">
                      Enter your email address below to receive a new verification link.
                    </p>

                    {resendMessage && (
                      <div className="mb-3 p-2.5 rounded-xl bg-slate-50 border border-slate-200 text-slate-700 text-xs font-medium">
                        {resendMessage}
                      </div>
                    )}

                    <form onSubmit={handleResend} className="space-y-3">
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          type="email"
                          required
                          value={resendEmail}
                          onChange={(e) => setResendEmail(e.target.value)}
                          placeholder="Registered Email address"
                          className="w-full h-11 pl-10 pr-3.5 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#15803D] focus:ring-2 focus:ring-[#15803D]/20 transition-all"
                        />
                      </div>

                      <button
                        type="submit"
                        disabled={isResending}
                        className="w-full h-11 bg-[#15803D] hover:bg-[#166534] text-white font-bold rounded-xl text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
                      >
                        {isResending ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Sending Email...</span>
                          </>
                        ) : (
                          <span>Send New Verification Link</span>
                        )}
                      </button>
                    </form>
                  </div>
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

export default VerifyEmailPage;
