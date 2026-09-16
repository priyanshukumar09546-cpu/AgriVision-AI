import React from 'react';

interface SocialLoginButtonsProps {
  onSelectProvider: (provider: 'google' | 'microsoft' | 'apple') => void;
  disabled?: boolean;
  variant?: 'full' | 'icons' | 'responsive';
}

export const GoogleIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.66-5.17 3.66-9.17z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.15C3.27 21.39 7.35 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.26C.46 8.16 0 9.98 0 12s.46 3.84 1.26 5.42l4.02-3.15z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.35 0 3.27 2.61 1.26 6.58l4.02 3.15c.95-2.83 3.6-4.98 6.72-4.98z"
    />
  </svg>
);

export const MicrosoftIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 21 21">
    <rect x="1" y="1" width="9" height="9" fill="#F25022" />
    <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
    <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
    <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
  </svg>
);

export const AppleIcon: React.FC<{ className?: string }> = ({ className = 'w-4 h-4' }) => (
  <svg className={className} viewBox="0 0 170 170" fill="currentColor">
    <path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.03-7.6-7.85-11.75-14.44-6.41-10.15-11.41-21.57-15-34.28-3.59-12.71-5.39-24.51-5.39-35.4 0-14.73 3.65-27.18 10.95-37.35 7.3-10.17 16.5-15.34 27.6-15.51 4.58 0 9.87 1.25 15.86 3.75 5.99 2.5 9.94 3.79 11.85 3.87 1.52-.08 5.76-1.46 12.72-4.14 6.96-2.68 12.5-3.87 16.63-3.56 12.4.98 22.25 5.86 29.54 14.64-10.9 6.57-16.23 15.69-16 27.34.23 9.4 3.78 17.26 10.64 23.58 6.86 6.32 15.09 9.97 24.69 10.95-2.07 6.43-4.58 13.06-7.53 19.89zm-32.84-107.5c0-6.84 2.45-13.3 7.35-19.38 4.9-6.08 11.08-10.12 18.54-12.12.87 6.72-.82 13.12-5.07 19.2-4.25 6.08-10.42 10.12-18.52 12.12-.66-.46-1.42-.69-2.3-1.08z" />
  </svg>
);

export const SocialLoginButtons: React.FC<SocialLoginButtonsProps> = ({
  onSelectProvider,
  disabled = false,
  variant = 'full',
}) => {
  if (variant === 'icons') {
    return (
      <div className="flex items-center justify-center gap-3">
        <button
          type="button"
          disabled={disabled}
          onClick={() => onSelectProvider('google')}
          className="w-11 h-11 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 flex items-center justify-center transition-all shadow-2xs hover:shadow-xs active:scale-95 disabled:opacity-60"
          title="Continue with Google"
        >
          <GoogleIcon className="w-5 h-5" />
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onSelectProvider('microsoft')}
          className="w-11 h-11 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 flex items-center justify-center transition-all shadow-2xs hover:shadow-xs active:scale-95 disabled:opacity-60"
          title="Continue with Microsoft"
        >
          <MicrosoftIcon className="w-5 h-5" />
        </button>
        <button
          type="button"
          disabled={disabled}
          onClick={() => onSelectProvider('apple')}
          className="w-11 h-11 rounded-full border border-slate-200 hover:border-slate-300 hover:bg-slate-50 flex items-center justify-center transition-all shadow-2xs hover:shadow-xs active:scale-95 disabled:opacity-60 text-slate-800"
          title="Continue with Apple"
        >
          <AppleIcon className="w-5 h-5" />
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-2.5 w-full">
      <button
        type="button"
        disabled={disabled}
        onClick={() => onSelectProvider('google')}
        className="w-full h-11 px-4 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs sm:text-[13px] rounded-xl flex items-center justify-center gap-3 transition-all active:scale-[0.99] shadow-2xs disabled:opacity-60 cursor-pointer"
      >
        <GoogleIcon className="w-4 h-4 shrink-0" />
        <span>Continue with Google</span>
      </button>

      <button
        type="button"
        disabled={disabled}
        onClick={() => onSelectProvider('microsoft')}
        className="w-full h-11 px-4 border border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50 text-slate-700 font-medium text-xs sm:text-[13px] rounded-xl flex items-center justify-center gap-3 transition-all active:scale-[0.99] shadow-2xs disabled:opacity-60 cursor-pointer"
      >
        <MicrosoftIcon className="w-4 h-4 shrink-0" />
        <span>Continue with Microsoft</span>
      </button>
    </div>
  );
};
