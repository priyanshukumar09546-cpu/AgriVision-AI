import React from 'react';

interface LeafDecorationProps {
  className?: string;
}

export const LeafDecoration: React.FC<LeafDecorationProps> = ({
  className = '',
}) => {
  return (
    <div
      className={`pointer-events-none absolute select-none z-20 ${className}`}
      aria-hidden="true"
    >
      <svg
        className="w-[140px] h-[155px] sm:w-[175px] sm:h-[190px] lg:w-[210px] lg:h-[230px]"
        viewBox="0 0 220 240"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Main Big Leaf Gradient: minty translucent green with light gradient */}
          <linearGradient id="mainLeafGrad" x1="100%" y1="100%" x2="20%" y2="15%">
            <stop offset="0%" stopColor="#16A34A" stopOpacity="0.8" />
            <stop offset="35%" stopColor="#4ADE80" stopOpacity="0.65" />
            <stop offset="70%" stopColor="#86EFAC" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#BBF7D0" stopOpacity="0.45" />
          </linearGradient>

          {/* Sub Leaf Gradient (lower left) */}
          <linearGradient id="subLeafGrad" x1="90%" y1="100%" x2="10%" y2="20%">
            <stop offset="0%" stopColor="#15803D" stopOpacity="0.75" />
            <stop offset="50%" stopColor="#34D399" stopOpacity="0.6" />
            <stop offset="100%" stopColor="#A7F3D0" stopOpacity="0.4" />
          </linearGradient>

          {/* Third background leaf edge (right) */}
          <linearGradient id="rightLeafGrad" x1="50%" y1="100%" x2="100%" y2="20%">
            <stop offset="0%" stopColor="#166534" stopOpacity="0.7" />
            <stop offset="60%" stopColor="#22C55E" stopOpacity="0.5" />
            <stop offset="100%" stopColor="#86EFAC" stopOpacity="0.35" />
          </linearGradient>
        </defs>

        <g id="leafGroup">
          {/* 0. Background right sliver leaf */}
          <path
            d="M 138 238 C 160 210, 195 160, 192 105 C 205 135, 202 185, 148 238 Z"
            fill="url(#rightLeafGrad)"
          />
          <path
            d="M 142 235 C 165 195, 185 150, 192 110"
            stroke="#FFFFFF"
            strokeWidth="1.8"
            strokeLinecap="round"
            strokeOpacity="0.6"
          />

          {/* 1. Lower Left Sub Leaf */}
          <path
            d="M 136 220 C 105 210, 50 190, 42 152 C 40 135, 62 125, 85 135 C 108 145, 128 175, 136 220 Z"
            fill="url(#subLeafGrad)"
          />
          {/* Sub Leaf Vein */}
          <path
            d="M 136 215 C 108 185, 78 160, 50 144"
            stroke="#FFFFFF"
            strokeWidth="2.2"
            strokeLinecap="round"
            strokeOpacity="0.85"
          />
          <path
            d="M 112 188 C 96 195, 75 192, 60 180"
            stroke="#FFFFFF"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeOpacity="0.6"
          />
          <path
            d="M 92 168 C 80 162, 70 152, 65 142"
            stroke="#FFFFFF"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeOpacity="0.6"
          />

          {/* 2. Main Large Leaf (Leaning Up-Left across card corner) */}
          <path
            d="M 138 230 C 95 180, 80 95, 155 35 C 190 70, 195 155, 138 230 Z"
            fill="url(#mainLeafGrad)"
          />

          {/* Main Stem (White base running down) */}
          <path
            d="M 138 238 C 137 215, 136 195, 135 180"
            stroke="#FFFFFF"
            strokeWidth="3.5"
            strokeLinecap="round"
            strokeOpacity="0.9"
          />

          {/* Main Leaf Central Spine (White curved line arching to tip) */}
          <path
            d="M 138 230 C 130 185, 126 125, 154 38"
            stroke="#FFFFFF"
            strokeWidth="2.8"
            strokeLinecap="round"
            strokeOpacity="0.9"
          />

          {/* Main Leaf Lateral Veins - Left side */}
          <path
            d="M 133 190 C 112 178, 98 162, 90 140"
            stroke="#FFFFFF"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeOpacity="0.8"
          />
          <path
            d="M 130 155 C 114 142, 104 125, 98 102"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeOpacity="0.75"
          />
          <path
            d="M 132 120 C 122 105, 116 90, 118 72"
            stroke="#FFFFFF"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeOpacity="0.7"
          />
          <path
            d="M 140 80 C 134 70, 132 60, 136 50"
            stroke="#FFFFFF"
            strokeWidth="1.2"
            strokeLinecap="round"
            strokeOpacity="0.65"
          />

          {/* Main Leaf Lateral Veins - Right side */}
          <path
            d="M 136 175 C 154 165, 170 152, 180 135"
            stroke="#FFFFFF"
            strokeWidth="1.6"
            strokeLinecap="round"
            strokeOpacity="0.8"
          />
          <path
            d="M 134 140 C 152 130, 168 115, 176 96"
            stroke="#FFFFFF"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeOpacity="0.75"
          />
          <path
            d="M 138 105 C 154 94, 166 82, 172 65"
            stroke="#FFFFFF"
            strokeWidth="1.4"
            strokeLinecap="round"
            strokeOpacity="0.7"
          />
        </g>
      </svg>
    </div>
  );
};
