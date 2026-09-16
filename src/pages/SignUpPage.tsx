import React, { useState } from 'react';
import { User, Mail, Lock, Eye, EyeOff, ArrowLeft, Loader2, Sprout, GraduationCap, Users, CheckCircle2 } from 'lucide-react';
import { AuthHeroLeft } from '../components/auth/AuthHeroLeft';
import { LeafDecoration } from '../components/auth/LeafDecoration';
import { TermsModal } from '../components/auth/TermsModal';
import { registerUser } from '../services/authService';

interface SignUpPageProps {
  onRouteChange?: (route: string) => void;
}

type UserRole = 'farmer' | 'student' | 'expert';

export const SignUpPage: React.FC<SignUpPageProps> = ({ onRouteChange }) => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [selectedRole, setSelectedRole] = useState<UserRole>('farmer');
  const [agreeTerms, setAgreeTerms] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  // Modals for Terms & Privacy
  const [isTermsOpen, setIsTermsOpen] = useState(false);
  const [termsTab, setTermsTab] = useState<'terms' | 'privacy'>('terms');

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

    if (!fullName.trim()) {
      setErrorMessage('Please enter your full name.');
      return;
    }

    if (!email.trim()) {
      setErrorMessage('Please enter your email address.');
      return;
    }

    if (password.length < 6) {
      setErrorMessage('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage('Passwords do not match.');
      return;
    }

    if (!agreeTerms) {
      setErrorMessage('You must agree to the Terms of Service and Privacy Policy.');
      return;
    }

    setIsLoading(true);
    try {
      const res = await registerUser(fullName, email, password, selectedRole);
      if (res.success) {
        handleNavigate('/dashboard');
      } else {
        setErrorMessage(res.error || 'Failed to create account.');
      }
    } catch {
      setErrorMessage('An unexpected error occurred. Please try again.');
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

      {/* Terms & Privacy Policy Modal */}
      <TermsModal
        isOpen={isTermsOpen}
        onClose={() => setIsTermsOpen(false)}
        tab={termsTab}
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
      <main className="w-full max-w-[1360px] mx-auto px-4 sm:px-10 lg:px-12 py-3 sm:py-5 flex-1 flex flex-col lg:flex-row items-center justify-between gap-6 lg:gap-14 z-10">
        {/* Left Column: Marketing / Features Section */}
        <div className="hidden lg:block lg:w-[48%] xl:w-[50%]">
          <AuthHeroLeft />
        </div>

        {/* Right Column: Floating White Authentication Card */}
        <div className="w-full lg:w-[48%] xl:w-[46%] flex justify-center lg:justify-end">
          <div className="w-full max-w-[440px] relative">
            <div className="w-full bg-white rounded-3xl border border-slate-200/90 shadow-[0_16px_50px_rgba(0,0,0,0.08)] p-6 sm:p-8 xl:p-9 relative z-10">
              {/* Form Title & Subtitle matching reference */}
              <div className="mb-5 sm:mb-6 text-left">
                <h1 className="text-2xl sm:text-[26px] font-extrabold text-[#0F172A] tracking-tight">
                  Create Your Account
                </h1>
                <p className="text-xs sm:text-[13px] text-slate-500 font-medium mt-1">
                  Join AgriVision AI and be part of a greener future
                </p>
              </div>

            {/* Error notification */}
            {errorMessage && (
              <div className="mb-3.5 p-2.5 rounded-xl bg-rose-50 border border-rose-200 text-rose-700 text-xs font-medium animate-in fade-in">
                {errorMessage}
              </div>
            )}

            {/* Sign Up Form */}
            <form onSubmit={handleSubmit} className="space-y-3">
              {/* 1. Full Name Field */}
              <div>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                    <User className="w-4 h-4 stroke-[1.8]" />
                  </div>
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="Full Name"
                    autoComplete="name"
                    className="w-full h-10 sm:h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#15803D] focus:ring-2 focus:ring-[#15803D]/20 transition-all"
                  />
                </div>
              </div>

              {/* 2. Email Address Field */}
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
                    className="w-full h-10 sm:h-11 pl-10 pr-4 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#15803D] focus:ring-2 focus:ring-[#15803D]/20 transition-all"
                  />
                </div>
              </div>

              {/* 3. Password Field */}
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
                    autoComplete="new-password"
                    className="w-full h-10 sm:h-11 pl-10 pr-11 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#15803D] focus:ring-2 focus:ring-[#15803D]/20 transition-all"
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

              {/* 4. Confirm Password Field */}
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
                    placeholder="Confirm Password"
                    autoComplete="new-password"
                    className="w-full h-10 sm:h-11 pl-10 pr-11 bg-white border border-slate-200 rounded-xl text-xs sm:text-sm text-slate-800 placeholder:text-slate-400 focus:outline-none focus:border-[#15803D] focus:ring-2 focus:ring-[#15803D]/20 transition-all"
                  />
                  <button
                    type="button"
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute inset-y-0 right-0 pr-3.5 flex items-center text-slate-400 hover:text-slate-600 focus:outline-none cursor-pointer"
                    aria-label={showConfirmPassword ? 'Hide password' : 'Show password'}
                  >
                    {showConfirmPassword ? (
                      <EyeOff className="w-4 h-4" />
                    ) : (
                      <Eye className="w-4 h-4" />
                    )}
                  </button>
                </div>
              </div>

              {/* 5. Role Selection: "I am a" */}
              <div className="pt-1">
                <span className="text-xs font-semibold text-[#0F172A] mb-1.5 block">
                  I am a
                </span>

                <div className="grid grid-cols-3 gap-2 sm:gap-2.5">
                  {/* Role 1: Farmer */}
                  <button
                    type="button"
                    onClick={() => setSelectedRole('farmer')}
                    className={`relative flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedRole === 'farmer'
                        ? 'border-[#15803D] bg-emerald-50/70 text-[#15803D] ring-1 ring-[#15803D]/30 shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    {selectedRole === 'farmer' && (
                      <span className="absolute top-1.5 right-1.5 text-[#15803D]">
                        <CheckCircle2 className="w-3.5 h-3.5 fill-[#15803D] text-white" />
                      </span>
                    )}
                    <Sprout className="w-5 h-5 mb-1 stroke-[2]" />
                    <span className="text-[11.5px] sm:text-xs font-bold leading-tight">
                      Farmer
                    </span>
                  </button>

                  {/* Role 2: Student */}
                  <button
                    type="button"
                    onClick={() => setSelectedRole('student')}
                    className={`relative flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedRole === 'student'
                        ? 'border-[#15803D] bg-emerald-50/70 text-[#15803D] ring-1 ring-[#15803D]/30 shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    {selectedRole === 'student' && (
                      <span className="absolute top-1.5 right-1.5 text-[#15803D]">
                        <CheckCircle2 className="w-3.5 h-3.5 fill-[#15803D] text-white" />
                      </span>
                    )}
                    <GraduationCap className="w-5 h-5 mb-1 stroke-[2]" />
                    <span className="text-[11.5px] sm:text-xs font-bold leading-tight">
                      Student
                    </span>
                  </button>

                  {/* Role 3: Agri Expert */}
                  <button
                    type="button"
                    onClick={() => setSelectedRole('expert')}
                    className={`relative flex flex-col items-center justify-center p-2.5 sm:p-3 rounded-xl border text-center transition-all cursor-pointer ${
                      selectedRole === 'expert'
                        ? 'border-[#15803D] bg-emerald-50/70 text-[#15803D] ring-1 ring-[#15803D]/30 shadow-2xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white text-slate-700'
                    }`}
                  >
                    {selectedRole === 'expert' && (
                      <span className="absolute top-1.5 right-1.5 text-[#15803D]">
                        <CheckCircle2 className="w-3.5 h-3.5 fill-[#15803D] text-white" />
                      </span>
                    )}
                    <Users className="w-5 h-5 mb-1 stroke-[2]" />
                    <span className="text-[11.5px] sm:text-xs font-bold leading-tight">
                      Agri Expert
                    </span>
                  </button>
                </div>
              </div>

              {/* 6. Terms of Service & Privacy Policy Checkbox */}
              <div className="pt-1">
                <label className="flex items-start gap-2 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={agreeTerms}
                    onChange={(e) => setAgreeTerms(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded-md border-slate-300 text-[#15803D] focus:ring-[#15803D] accent-[#15803D] cursor-pointer shrink-0"
                  />
                  <span className="text-[11.5px] sm:text-xs text-slate-600 font-medium leading-snug">
                    I agree to the{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setTermsTab('terms');
                        setIsTermsOpen(true);
                      }}
                      className="text-[#15803D] font-semibold hover:underline cursor-pointer"
                    >
                      Terms of Service
                    </button>{' '}
                    and{' '}
                    <button
                      type="button"
                      onClick={(e) => {
                        e.preventDefault();
                        setTermsTab('privacy');
                        setIsTermsOpen(true);
                      }}
                      className="text-[#15803D] font-semibold hover:underline cursor-pointer"
                    >
                      Privacy Policy
                    </button>
                  </span>
                </label>
              </div>

              {/* 7. Primary Green Sign Up Button */}
              <button
                type="submit"
                disabled={isLoading}
                className="w-full h-11 mt-1 bg-[#15803D] hover:bg-[#166534] active:bg-[#14532D] text-white font-bold text-xs sm:text-sm rounded-xl shadow-xs hover:shadow-sm transition-all active:scale-[0.99] flex items-center justify-center gap-2 cursor-pointer disabled:opacity-60"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    <span>Creating Account...</span>
                  </>
                ) : (
                  <span>Sign Up</span>
                )}
              </button>

              {/* 8. Bottom Navigation Link to Login */}
              <div className="text-center pt-2 sm:pt-3">
                <p className="text-xs text-slate-600 font-medium">
                  Already have an account?{' '}
                  <button
                    type="button"
                    onClick={() => handleNavigate('/login')}
                    className="font-bold text-[#15803D] hover:text-[#166534] hover:underline cursor-pointer"
                  >
                    Login
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

export default SignUpPage;
