import React, { useState } from 'react';
import { X, Mail, CheckCircle2, ArrowLeft, Loader2 } from 'lucide-react';

import { resetPassword } from '../../services/authService';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultEmail?: string;
}

export const ForgotPasswordModal: React.FC<ForgotPasswordModalProps> = ({
  isOpen,
  onClose,
  defaultEmail = '',
}) => {
  const [email, setEmail] = useState(defaultEmail);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSent, setIsSent] = useState(false);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !email.includes('@')) {
      setError('Please enter a valid email address.');
      return;
    }

    setError(null);
    setIsSubmitting(true);

    try {
      const res = await resetPassword(email);
      if (res.success) {
        setSuccessMessage(res.message);
        setIsSent(true);
      } else {
        setError(res.error || 'Failed to send reset link. Please try again.');
      }
    } catch {
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleResetState = () => {
    setIsSent(false);
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/60 backdrop-blur-xs animate-in fade-in">
      <div className="bg-white w-full max-w-md rounded-3xl shadow-2xl border border-slate-100 p-6 sm:p-7 relative animate-in zoom-in-95">
        <button
          type="button"
          onClick={handleResetState}
          className="absolute top-5 right-5 text-slate-400 hover:text-slate-600 p-1 rounded-full hover:bg-slate-100 transition-colors"
          aria-label="Close modal"
        >
          <X className="w-5 h-5" />
        </button>

        {!isSent ? (
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-[#15803D] flex items-center justify-center mb-1">
              <Mail className="w-6 h-6 stroke-[2]" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-[#0F172A]">Reset Password</h3>
              <p className="text-xs text-slate-500 mt-1 leading-relaxed">
                Enter the email address associated with your AgriVision AI account and we'll send you a link to reset your password.
              </p>
            </div>

            {error && (
              <div className="p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium">
                {error}
              </div>
            )}

            <div className="relative">
              <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                <Mail className="w-4 h-4" />
              </div>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="Email address"
                className="w-full h-11 pl-10 pr-3.5 bg-white border border-slate-200 focus:border-[#15803D] focus:ring-2 focus:ring-[#15803D]/20 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none transition-all"
              />
            </div>

            <button
              type="submit"
              disabled={isSubmitting}
              className="w-full h-11 bg-[#15803D] hover:bg-[#166534] active:bg-[#14532D] text-white font-bold rounded-xl text-xs sm:text-sm shadow-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="w-4 h-4 animate-spin" />
                  <span>Sending Link...</span>
                </>
              ) : (
                <span>Send Reset Link</span>
              )}
            </button>

            <div className="text-center pt-2">
              <button
                type="button"
                onClick={handleResetState}
                className="text-xs font-semibold text-slate-600 hover:text-[#15803D] inline-flex items-center gap-1.5 transition-colors cursor-pointer"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Back to Login</span>
              </button>
            </div>
          </form>
        ) : (
          <div className="text-center py-2 space-y-4">
            <div className="w-14 h-14 rounded-full bg-emerald-100 text-[#15803D] flex items-center justify-center mx-auto">
              <CheckCircle2 className="w-8 h-8 stroke-[2.2]" />
            </div>

            <div>
              <h3 className="text-xl font-bold text-[#0F172A]">Check Your Inbox</h3>
              <p className="text-xs text-slate-600 mt-2 leading-relaxed">
                {successMessage || (
                  <>
                    We've sent a password reset link to <strong className="text-[#0F172A]">{email}</strong>. Please check your spam folder if you don't see it within a few minutes.
                  </>
                )}
              </p>
            </div>

            <button
              type="button"
              onClick={handleResetState}
              className="w-full h-11 bg-[#15803D] hover:bg-[#166534] text-white font-bold rounded-xl text-xs sm:text-sm shadow-xs transition-all cursor-pointer"
            >
              Return to Login
            </button>
          </div>
        )}
      </div>
    </div>
  );
};
