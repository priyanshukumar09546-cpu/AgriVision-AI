import React from 'react';
import type { RegionalIssue } from '../../data/insightsData';

interface CommonIssuesPanelProps {
  issues: RegionalIssue[];
}

export const CommonIssuesPanel: React.FC<CommonIssuesPanelProps> = ({ issues }) => {
  return (
    <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-[0_1px_3px_rgba(0,0,0,0.02)] flex flex-col justify-between">
      {/* Header */}
      <div className="mb-3 text-left">
        <h3 className="text-[12.5px] font-bold text-[#0F172A] leading-tight">
          Common Issues in Your Area
        </h3>
        <p className="text-[10px] text-slate-500 leading-tight mt-0.5">
          Most detected diseases in your region (last 30 days)
        </p>
      </div>

      {/* Ranked List */}
      <div className="space-y-2.5 flex-1 flex flex-col justify-between select-none">
        {issues.map((issue) => {
          const isFirst = issue.rank === 1;
          return (
            <div key={issue.rank} className="flex items-center gap-2.5">
              {/* Number Circle */}
              <div
                className={`w-5 h-5 rounded-full flex items-center justify-center text-[9.5px] shrink-0 ${
                  isFirst
                    ? 'bg-[#064E3B] text-white font-bold'
                    : 'border border-slate-300 text-slate-600 font-medium'
                }`}
              >
                {issue.rank}
              </div>

              {/* Disease Name */}
              <span className="text-[11px] font-medium text-slate-800 min-w-[100px] text-left truncate">
                {issue.name}
              </span>

              {/* Percentage */}
              <span className="text-[10.5px] font-bold text-slate-700 w-8 text-right shrink-0">
                {issue.percentage}%
              </span>

              {/* Progress Bar */}
              <div className="flex-1 h-2 bg-slate-100 rounded-full overflow-hidden shrink-0">
                <div
                  className={`h-full rounded-full transition-all duration-500 ${issue.colorClass}`}
                  style={{ width: `${issue.percentage * 2.5}%` }}
                />
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};
