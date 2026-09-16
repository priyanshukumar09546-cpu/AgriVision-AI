import React from 'react';
import { Leaf } from 'lucide-react';

interface FooterProps {
  activeRoute?: string;
  onRouteChange?: (route: string) => void;
}

export const Footer: React.FC<FooterProps> = ({
  activeRoute = '/',
  onRouteChange,
}) => {
  const footerLinks = [
    { name: 'Home', href: '/' },
    { name: 'Detect Disease', href: '/detect' },
    { name: 'Crops', href: '/crops' },
    { name: 'Disease Library', href: '/library' },
    { name: 'AI Insights', href: '/insights' },
    { name: 'Community', href: '/community' },
    { name: 'About', href: '/about' },
  ];

  const handleLinkClick = (e: React.MouseEvent, href: string) => {
    e.preventDefault();
    if (onRouteChange) {
      onRouteChange(href);
    }
  };

  return (
    <footer className="w-full bg-white border-t border-slate-100 py-4 select-none mt-auto">
      <div className="max-w-[1240px] mx-auto px-6 flex flex-col md:flex-row items-center justify-between gap-4">
        {/* Left: Brand Logo & Tagline matching reference */}
        <a
          href="/"
          onClick={(e) => handleLinkClick(e, '/')}
          className="flex items-center gap-2 group shrink-0"
          aria-label="AgriVision AI"
        >
          <img
            src="/assets/leaf_logo_vector.svg"
            alt="AgriVision AI Leaf Logo"
            className="w-7 h-7 object-contain shrink-0"
            width="28"
            height="28"
          />
          <div className="flex flex-col text-left leading-none">
            <div className="flex items-baseline tracking-tight">
              <span className="text-[15px] font-bold text-[#0F172A] tracking-[-0.02em]">
                AgriVision
              </span>
              <span className="text-[15px] font-bold text-[#15803D] ml-1 tracking-[-0.02em]">
                AI
              </span>
            </div>
            <span className="text-[9.5px] font-normal text-slate-500 tracking-tight mt-[2px]">
              Healthy Crops. Brighter Tomorrow.
            </span>
          </div>
        </a>

        {/* Center: Navigation Links matching reference */}
        <nav
          className="flex flex-wrap items-center justify-center gap-5 sm:gap-6"
          aria-label="Footer Navigation"
        >
          {footerLinks.map((link) => {
            const isActive =
              activeRoute === link.href ||
              (link.href === '/about' && activeRoute.startsWith('/about')) ||
              (link.href === '/community' && activeRoute.startsWith('/community')) ||
              (link.href === '/insights' && activeRoute.startsWith('/insights')) ||
              (link.href === '/library' && (activeRoute.startsWith('/library') || activeRoute.startsWith('/diseases')));
            return (
              <a
                key={link.name}
                href={link.href}
                onClick={(e) => handleLinkClick(e, link.href)}
                className={`relative py-1 text-xs transition-colors ${
                  isActive
                    ? 'text-[#15803D] font-bold'
                    : 'font-medium text-slate-600 hover:text-slate-900'
                }`}
              >
                <span>{link.name}</span>
                {isActive && (
                  <span
                    aria-hidden="true"
                    className="absolute -bottom-[2px] left-0 right-0 h-[2px] bg-[#15803D] rounded-full"
                  />
                )}
              </a>
            );
          })}
        </nav>

        {/* Right: Social Media Icons + Tagline matching reference */}
        <div className="flex items-center gap-4 shrink-0">
          {/* Social Icons: Instagram, YouTube, LinkedIn, X */}
          <div className="flex items-center gap-3 text-slate-700">
            {/* Instagram SVG */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#15803D] transition-colors p-1"
              aria-label="Instagram"
            >
              <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <rect width="20" height="20" x="2" y="2" rx="5" ry="5" />
                <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
                <line x1="17.5" x2="17.51" y1="6.5" y2="6.5" />
              </svg>
            </a>

            {/* YouTube SVG */}
            <a
              href="https://youtube.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#15803D] transition-colors p-1"
              aria-label="YouTube"
            >
              <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <path d="M2.5 17a24.12 24.12 0 0 1 0-10 2 2 0 0 1 1.4-1.4 49.56 49.56 0 0 1 16.2 0A2 2 0 0 1 21.5 7a24.12 24.12 0 0 1 0 10 2 2 0 0 1-1.4 1.4 49.55 49.55 0 0 1-16.2 0A2 2 0 0 1 2.5 17" />
                <polygon points="10 15 15 12 10 9 10 15" fill="currentColor" stroke="none" />
              </svg>
            </a>

            {/* LinkedIn SVG */}
            <a
              href="https://linkedin.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#15803D] transition-colors p-1"
              aria-label="LinkedIn"
            >
              <svg className="w-4 h-4 fill-none stroke-current stroke-2" viewBox="0 0 24 24" strokeLinecap="round" strokeLinejoin="round">
                <path d="M16 8a6 6 0 0 1 6 6v7h-4v-7a2 2 0 0 0-2-2 2 2 0 0 0-2 2v7h-4v-7a6 6 0 0 1 6-6z" />
                <rect width="4" height="12" x="2" y="9" />
                <circle cx="4" cy="4" r="2" />
              </svg>
            </a>

            {/* X (Twitter) SVG */}
            <a
              href="https://x.com"
              target="_blank"
              rel="noreferrer"
              className="hover:text-[#15803D] transition-colors p-1"
              aria-label="X"
            >
              <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>
          </div>

          <div className="h-4 w-px bg-slate-200 hidden sm:block" />

          {/* Far Right Tagline matching reference */}
          <div className="flex items-center gap-1.5 text-right">
            <div className="flex flex-col text-right leading-none">
              <span className="text-[11px] font-semibold text-slate-700">Farming Today</span>
              <span className="text-[9.5px] text-slate-500 mt-[2px]">For a Brighter Tomorrow</span>
            </div>
            <Leaf className="w-3.5 h-3.5 text-[#15803D] fill-[#15803D]" />
          </div>
        </div>
      </div>
    </footer>
  );
};
