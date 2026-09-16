import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2 } from 'lucide-react';
import { AuthHeroLeft } from '../components/auth/AuthHeroLeft';
import { SocialLoginButtons } from '../components/auth/SocialLoginButtons';
import { LeafDecoration } from '../components/auth/LeafDecoration';
import { ForgotPasswordModal } from '../components/auth/ForgotPasswordModal';
import { loginUser, socialLogin } from '../services/authService';

interface SignInPageProps {
  onRouteChange?: (route: string) => void;
}

export const SignInPage: React.FC<SignInPageProps> = ({ onRouteChange }) => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isForgotPasswordOpen, setIsForgotPasswordOpen] = useState(false);

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

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (!password) {
      setErrorMessage('Please enter your password.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await loginUser(email, password, rememberMe);
      if (res.success) {
        handleNavigate('/dashboard');
      } else {
        setErrorMessage(res.error || 'Failed to sign in. Please try again.');
      }
    } catch {
      setErrorMessage('An unexpected error occurred. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSocial = async (provider: 'google' | 'microsoft' | 'apple') => {
    setIsLoading(true);
    setErrorMessage(null);
    try {
      const res = await socialLogin(provider);
      if (res.success) {
        handleNavigate('/dashboard');
      } else if (res.error) {
        setErrorMessage(res.error);
      }
    } catch (err: any) {
      setErrorMessage(err?.message || `Failed to connect with ${provider}.`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full relative flex flex-col justify-between overflow-x-hidden selection:bg-emerald-100 selection:text-emerald-900 font-sans text-[#0F172A]">
      {/* 1. Continuous Full-Screen Agricultural Background spanning Edge-to-Edge */}
      <div
        className="fixed inset-0 bg-cover bg-center -z-20 scale-[1.01]"
        style={{
          backgroundImage: "url('/auth_assets/auth_hero_desktop.jpg')",
        }}
      />

      {/* Forgot Password Modal */}
      <ForgotPasswordModal
        isOpen={isForgotPasswordOpen}
        onClose={() => setIsForgotPasswordOpen(false)}
        defaultEmail={email}
      />

      {/* 2. Top Header Bar spanning full width */}
      <header className="w-full max-w-[1360px] mx-auto px-5 sm:px-10 lg:px-12 pt-5 sm:pt-7 pb-2 flex items-center justify-between z-10">
        {/* Brand Logo & Tagline */}
        <a
          href="/"
          onClick={(e) => {
            e.preventDefault();
            handleNavigate('/dashboard');
          }}
          className="flex items-center gap-2.5 select-none group cursor-pointer"
          aria-label="AgriVision AI - Healthy Crops. Brighter Tomorrow."
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

        {/* Back to Home Button */}
        <button
          type="button"
          onClick={() => handleNavigate('/')}
          className="inline-flex items-center gap-1.5 text-xs sm:text-sm font-semibold text-slate-900 hover:text-[#15803D] transition-colors cursor-pointer group px-2 py-1"
        >
          <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
          <span>Back to Home</span>
        </button>
      </header>

      {/* 3. Main Center Content Area */}
      <main className="w-full max-w-[1360px] mx-auto px-4 sm:px-10 lg:px-12 py-3 sm:py-6 flex-1 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-14 z-10">
        {/* Left Column: Marketing / Features Section */}
        <div className="hidden lg:block lg:w-[48%] xl:w-[50%]">
          <AuthHeroLeft />
        </div>

        {/* Right Column: Floating White Authentication Card */}
        <div className="w-full lg:w-[48%] xl:w-[46%] flex justify-center lg:justify-end">
          <div className="w-full max-w-[430px] relative">
            <div className="w-full bg-white rounded-3xl border border-slate-200/90 shadow-[0_16px_50px_rgba(0,0,0,0.08)] p-6 sm:p-8 xl:p-9 relative z-10">
              {/* Form Title & Subtitle matching reference */}
              <div className="mb-5 sm:mb-6 text-left">
                <h1 className="text-2xl sm:text-[26px] font-extrabold text-[#0F172A] tracking-tight">
                  Welcome Back
                </h1>
                <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-1">
                  Login to continue to AgriVision AI
                </p>
              </div>

            {/* Error notification */}
            {errorMessage && (
              <div className="mb-4 p-3 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium animate-in fade-in">
                {errorMessage}
              </div>
            )}

            {/* Sign In Form */}
            <form onSubmit={handleSubmit} className="space-y-3.5 sm:space-y-4">
              {/* 1. Email Address Field */}
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Mail className="w-4 h-4 stroke-[1.8]" />
                  </div>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Email address"
                    autoComplete="email"
                    className="w-full h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#15803D] focus:ring-2 focus:ring-[#15803D]/20 transition-all"
                  />
                </div>
              </div>

              {/* 2. Password Field with Toggle Eye Icon */}
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <Lock className="w-4 h-4 stroke-[1.8]" />
                  </div>
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="Password"
                    autoComplete="current-password"
                    className="w-full h-11 pl-10 pr-11 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#15803D] focus:ring-2 focus:ring-[#15803D]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                  >
                    {showPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* 3. Remember Me Checkbox & Forgot Password Link */}
              <div className="flex items-center justify-between pt-0.5 pb-1">
                <label className="flex items-center gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded-md border-slate-300 text-[#15803D] focus:ring-[#15803D] accent-[#15803D] cursor-pointer"
                  />
                  <span className="text-xs text-slate-600 font-medium">
                    Remember me
                  </span>
                </label>

                <button
                  type="button"
                  onClick={() => setIsForgotPasswordOpen(true)}
                  className="text-xs font-semibold text-[#15803D] hover:text-[#166534] hover:underline cursor-pointer"
                >
                  Forgot password?
                </button>
              </div>

              {/* 4. Primary Green Login Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 bg-[#15803D] hover:bg-[#166534] active:bg-[#14532D] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs hover:shadow-sm transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Login</span>
                )}
              </button>

              {/* 5. OR Divider matching reference */}
              <div className="relative my-3 sm:my-4 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-slate-200" />
                </div>
                <span className="relative bg-white px-3 text-[11px] font-semibold text-slate-400 tracking-wider">
                  OR
                </span>
              </div>

              {/* 6. Social Login Buttons */}
              <SocialLoginButtons
                variant="full"
                disabled={isLoading}
                onSelectProvider={handleSocial}
              />

              {/* 7. Bottom Navigation Link to Sign Up */}
              <div className="text-center pt-2 sm:pt-3">
                <p className="text-xs text-slate-600 font-medium">
                  Don't have an account?{' '}
                  <button
                    type="button"
                    onClick={() => handleNavigate('/signup')}
                    className="font-bold text-[#15803D] hover:text-[#166534] hover:underline cursor-pointer"
                  >
                    Sign up
                  </button>
                </p>
              </div>
            </form>
          </div>

          {/* 4. Large Semi-Transparent Decorative Green Leaf in Bottom-Right Corner overlapping card */}
          <LeafDecoration className="-bottom-5 -right-5 sm:-bottom-7 sm:-right-7 lg:-bottom-8 lg:-right-8" />
        </div>
      </div>
    </main>

    {/* Bottom breathing space */}
    <div className="h-4 sm:h-6" />
  </div>
);
};

export default SignInPage;
