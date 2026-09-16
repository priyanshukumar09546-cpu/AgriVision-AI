import React, { useState } from 'react';
import { BarChart2 } from 'lucide-react';
import type { YieldMonth } from '../../data/insightsData';

interface YieldPredictionPanelProps {
  cropName: string;
  growthPercentage: string;
  growthText: string;
  data: YieldMonth[];
}

export const YieldPredictionPanel: React.FC<YieldPredictionPanelProps> = ({
  cropName,
  growthPercentage,
  growthText,
  data,
}) => {
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);

  // SVG dimensions
  const chartW = 340;
  const chartH = 135;
  const paddingLeft = 32;
  const paddingRight = 15;
  const paddingTop = 12;
  const paddingBottom = 22;

  const innerW = chartW - paddingLeft - paddingRight;
  const innerH = chartH - paddingTop - paddingBottom;
  const maxVal = 30;

  const getY = (val: number) => {
    return paddingTop + innerH - (val / maxVal) * innerH;
  };

  const getBarHeight = (val: number) => {
    return (val / maxVal) * innerH;
  };

  const groupWidth = innerW / data.length;
  const barWidth = 10;
  const barGap = 2;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-[#15803D] text-white flex items-center justify-center shrink-0">
            <BarChart2 className="w-3 h-3 text-white" />
          </div>
          <div>
            <h3 className="text-[12.5px] font-bold text-[#0F172A] leading-tight">
              Yield Prediction ({cropName})
            </h3>
            <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
              Estimated yield based on current crop health and conditions
            </p>
          </div>
        </div>

        {/* Growth badge & text */}
        <div className="flex items-center gap-1.5 shrink-0 text-right">
          <span className="bg-[#22C55E] text-white text-[10px] font-bold px-1.5 py-0.5 rounded-md">
            {growthPercentage}
          </span>
          <span className="text-[9px] text-slate-500 max-w-[110px] leading-tight hidden sm:inline-block">
            {growthText}
          </span>
        </div>
      </div>

      {/* SVG Grouped Bar Chart */}
      <div className="relative w-full aspect-[2.4/1] select-none my-1">
        <svg
          viewBox={`0 0 ${chartW} ${chartH}`}
          className="w-full h-full overflow-visible"
        >
          {/* Y-axis label */}
          <text
            x={10}
            y={chartH / 2}
            textAnchor="middle"
            transform={`rotate(-90, 10, ${chartH / 2})`}
            fontSize="7"
            fill="#94A3B8"
            fontWeight="600"
          >
            Yield (tons/acre)
          </text>

          {/* Grid lines & Y-ticks */}
          {[0, 10, 20, 30].map((tick) => {
            const y = getY(tick);
            return (
              <g key={tick}>
                <line
                  x1={paddingLeft}
                  y1={y}
                  x2={chartW - paddingRight}
                  y2={y}
                  stroke="#F1F5F9"
                  strokeWidth="1"
                />
                <text
                  x={paddingLeft - 5}
                  y={y + 2.5}
                  textAnchor="end"
                  fontSize="8"
                  fill="#94A3B8"
                  fontWeight="500"
                >
                  {tick}
                </text>
              </g>
            );
          })}

          {/* Bars */}
          {data.map((d, i) => {
            const groupCenterX = paddingLeft + i * groupWidth + groupWidth / 2;
            const predX = groupCenterX - barWidth - barGap / 2;
            const actX = groupCenterX + barGap / 2;

            const predH = getBarHeight(d.predicted);
            const actH = getBarHeight(d.actual);

            const isHovered = hoveredIndex === i;

            return (
              <g
                key={d.month}
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                className="cursor-pointer"
              >
                {/* Predicted Bar (light mint green) */}
                <rect
                  x={predX}
                  y={getY(d.predicted)}
                  width={barWidth}
                  height={predH}
                  rx="2"
                  fill="#A7F3D0"
                  opacity={isHovered ? 0.9 : 0.8}
                />

                {/* Actual Bar (darker emerald green) */}
                <rect
                  x={actX}
                  y={getY(d.actual)}
                  width={barWidth}
                  height={actH}
                  rx="2"
                  fill="#059669"
                  opacity={isHovered ? 1 : 0.9}
                />

                {/* Month label */}
                <text
                  x={groupCenterX}
                  y={chartH - 4}
                  textAnchor="middle"
                  fontSize="8.5"
                  fill="#64748B"
                  fontWeight="500"
                >
                  {d.month}
                </text>
              </g>
            );
          })}
        </svg>

        {/* Hover Tooltip */}
        {hoveredIndex !== null && (
          <div
            className="absolute z-20 pointer-events-none bg-slate-900 text-white rounded-lg px-2 py-1 text-[9px] shadow-md"
            style={{
              left: `${((paddingLeft + hoveredIndex * groupWidth + groupWidth / 2) / chartW) * 100}%`,
              top: '10%',
              transform: 'translate(-50%, -100%)',
            }}
          >
            <div className="font-bold mb-0.5">{data[hoveredIndex].month}</div>
            <div className="text-emerald-300">Pred: {data[hoveredIndex].predicted} t/ac</div>
            <div className="text-emerald-400">Act: {data[hoveredIndex].actual} t/ac</div>
          </div>
        )}
      </div>

      {/* Legend matching reference */}
      <div className="flex items-center justify-center gap-4 pt-1.5 border-t border-slate-100 text-[10px] font-medium text-slate-600">
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-xs bg-[#A7F3D0]" />
          <span>Predicted Yield</span>
        </div>
        <div className="flex items-center gap-1.5">
          <span className="w-2.5 h-2.5 rounded-xs bg-[#059669]" />
          <span>Actual Yield</span>
        </div>
      </div>
    </div>
  );
};
