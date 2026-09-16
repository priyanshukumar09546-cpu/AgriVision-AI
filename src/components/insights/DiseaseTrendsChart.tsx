import React, { useState } from 'react';
import { BarChart2, ChevronDown } from 'lucide-react';
import type { DiseaseTrendPoint } from '../../data/insightsData';

interface DiseaseTrendsChartProps {
  data: DiseaseTrendPoint[];
  cropName: string;
}

export const DiseaseTrendsChart: React.FC<DiseaseTrendsChartProps> = ({
  data,
  cropName,
}) => {
  const [timeRange, setTimeRange] = useState('Last 6 Months');
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(3); // Jun is index 3, pinned by default like screenshot

  // Coordinate mapping for SVG
  const chartW = 340;
  const chartH = 140;
  const paddingLeft = 32;
  const paddingRight = 18;
  const paddingTop = 15;
  const paddingBottom = 22;

  const innerW = chartW - paddingLeft - paddingRight;
  const innerH = chartH - paddingTop - paddingBottom;
  const maxVal = 200;

  const getX = (index: number) => {
    return paddingLeft + (index / (data.length - 1)) * innerW;
  };

  const getY = (val: number) => {
    return paddingTop + innerH - (val / maxVal) * innerH;
  };

  // Build SVG path strings
  const getPath = (key: keyof Omit<DiseaseTrendPoint, 'month'>) => {
    return data
      .map((d, i) => `${i === 0 ? 'M' : 'L'} ${getX(i)} ${getY(d[key] as number)}`)
      .join(' ');
  };

  const activePoint = hoveredIndex !== null ? data[hoveredIndex] : null;

  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
      {/* Header */}
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <div className="w-5 h-5 rounded-md bg-[#15803D] text-white flex items-center justify-center shrink-0">
            <BarChart2 className="w-3 h-3 text-white" />
          </div>
          <div>
            <h3 className="text-[12.5px] font-bold text-[#0F172A] leading-tight">
              Disease Trends
            </h3>
            <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
              Detected disease cases over time ({cropName})
            </p>
          </div>
        </div>

        {/* Dropdown */}
        <div className="relative">
          <select
            value={timeRange}
            onChange={(e) => setTimeRange(e.target.value)}
            className="pl-2 pr-6 py-1 bg-white border border-slate-200 rounded-md text-[10px] font-semibold text-slate-700 focus:outline-none appearance-none cursor-pointer"
          >
            <option value="Last 6 Months">Last 6 Months</option>
            <option value="Last 30 Days">Last 30 Days</option>
            <option value="Last Year">Last Year</option>
          </select>
          <ChevronDown className="w-3 h-3 text-slate-400 absolute right-1.5 top-1/2 -translate-y-1/2 pointer-events-none" />
        </div>
      </div>

      {/* SVG Chart Container */}
      <div className="relative w-full aspect-[2.3/1] select-none my-1">
        <svg
          viewBox={`0 0 ${chartW} ${chartH}`}
          className="w-full h-full overflow-visible"
        >
          {/* Grid lines & Y-axis labels */}
          {[0, 50, 100, 150, 200].map((tick) => {
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
                  x={paddingLeft - 6}
                  y={y + 3}
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

          {/* X-axis labels */}
          {data.map((d, i) => (
            <text
              key={d.month}
              x={getX(i)}
              y={chartH - 4}
              textAnchor="middle"
              fontSize="8.5"
              fill="#64748B"
              fontWeight="500"
            >
              {d.month}
            </text>
          ))}

          {/* Series Lines */}
          {/* Healthy (Green) */}
          <path
            d={getPath('healthy')}
            fill="none"
            stroke="#10B981"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Early Blight (Red) */}
          <path
            d={getPath('earlyBlight')}
            fill="none"
            stroke="#EF4444"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Leaf Mold (Orange) */}
          <path
            d={getPath('leafMold')}
            fill="none"
            stroke="#F97316"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {/* Septoria (Yellow) */}
          <path
            d={getPath('septoria')}
            fill="none"
            stroke="#EAB308"
            strokeWidth="1.7"
            strokeLinecap="round"
            strokeLinejoin="round"
          />

          {/* Interactive Dots for each data point */}
          {data.map((d, i) => {
            const cx = getX(i);
            const isHovered = hoveredIndex === i;
            return (
              <g key={d.month} className="cursor-pointer" onClick={() => setHoveredIndex(i)}>
                {/* Invisible wider hit area */}
                <rect
                  x={cx - 15}
                  y={paddingTop}
                  width={30}
                  height={innerH}
                  fill="transparent"
                  onMouseEnter={() => setHoveredIndex(i)}
                />

                {/* Healthy Dot */}
                <circle
                  cx={cx}
                  cy={getY(d.healthy)}
                  r={isHovered ? 4 : 2.5}
                  fill="#10B981"
                  stroke="#FFFFFF"
                  strokeWidth={isHovered ? 1.5 : 1}
                />
                {/* Early Blight Dot */}
                <circle
                  cx={cx}
                  cy={getY(d.earlyBlight)}
                  r={isHovered ? 4 : 2.5}
                  fill="#EF4444"
                  stroke="#FFFFFF"
                  strokeWidth={isHovered ? 1.5 : 1}
                />
                {/* Leaf Mold Dot */}
                <circle
                  cx={cx}
                  cy={getY(d.leafMold)}
                  r={isHovered ? 4 : 2.5}
                  fill="#F97316"
                  stroke="#FFFFFF"
                  strokeWidth={isHovered ? 1.5 : 1}
                />
                {/* Septoria Dot */}
                <circle
                  cx={cx}
                  cy={getY(d.septoria)}
                  r={isHovered ? 4 : 2.5}
                  fill="#EAB308"
                  stroke="#FFFFFF"
                  strokeWidth={isHovered ? 1.5 : 1}
                />
              </g>
            );
          })}
        </svg>

        {/* Hover / Pinned Tooltip matching reference screenshot */}
        {activePoint && (
          <div
            className="absolute z-20 pointer-events-none transition-all duration-150"
            style={{
              left: `${(getX(hoveredIndex ?? 3) / chartW) * 100}%`,
              top: '5%',
              transform: 'translate(-50%, -10px)',
            }}
          >
            <div className="bg-white/95 backdrop-blur-sm border border-slate-200/90 rounded-xl p-2 shadow-[0_4px_12px_rgba(0,0,0,0.08)] text-left min-w-[105px]">
              <span className="block text-[9.5px] font-bold text-slate-800 border-b border-slate-100 pb-1 mb-1">
                {activePoint.month} 2026
              </span>
              <div className="space-y-0.5 text-[9px] font-medium leading-tight">
                <div className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EF4444] shrink-0" />
                  <span>Early Blight: <strong className="text-slate-900">{activePoint.earlyBlight}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#F97316] shrink-0" />
                  <span>Leaf Mold: <strong className="text-slate-900">{activePoint.leafMold}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#EAB308] shrink-0" />
                  <span>Septoria: <strong className="text-slate-900">{activePoint.septoria}</strong></span>
                </div>
                <div className="flex items-center gap-1.5 text-slate-700">
                  <span className="w-1.5 h-1.5 rounded-full bg-[#10B981] shrink-0" />
                  <span>Healthy: <strong className="text-slate-900">{activePoint.healthy}</strong></span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Legend matching reference screenshot */}
      <div className="flex items-center justify-center gap-3 pt-2 border-t border-slate-100 text-[10px] font-medium text-slate-600">
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#EF4444]" />
          <span>Early Blight</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#F97316]" />
          <span>Leaf Mold</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#EAB308]" />
          <span>Septoria</span>
        </div>
        <div className="flex items-center gap-1">
          <span className="w-2 h-2 rounded-full bg-[#10B981]" />
          <span>Healthy</span>
        </div>
      </div>
    </div>
  );
};
