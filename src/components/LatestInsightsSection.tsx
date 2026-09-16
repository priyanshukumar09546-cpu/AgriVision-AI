import React from 'react';
import { ArrowRight, BookOpen } from 'lucide-react';

interface InsightArticle {
  id: string;
  title: string;
  image?: string;
}

interface LatestInsightsSectionProps {
  articles?: InsightArticle[];
  onViewAllClick?: () => void;
  onArticleClick?: (articleId: string) => void;
}

export const LatestInsightsSection: React.FC<LatestInsightsSectionProps> = ({
  articles = [],
  onViewAllClick,
  onArticleClick,
}) => {
  return (
    <section className="py-5 bg-[#F8FAFC]">
      <div className="max-w-[1240px] mx-auto px-6">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <BookOpen className="w-5 h-5 text-emerald-700" />
            <h3 className="text-base font-extrabold text-[#0F172A] tracking-tight">
              Latest Insights
            </h3>
          </div>
          <button
            type="button"
            onClick={onViewAllClick}
            className="text-xs font-bold text-emerald-700 hover:text-emerald-800 hover:underline flex items-center gap-1 cursor-pointer"
          >
            <span>View All</span>
            <ArrowRight className="w-3.5 h-3.5" />
          </button>
        </div>

        {articles.length > 0 ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
            {articles.map((art) => (
              <div
                key={art.id}
                onClick={() => onArticleClick?.(art.id)}
                className="bg-white border border-slate-200/80 rounded-2xl p-3.5 shadow-2xs hover:border-emerald-500 hover:shadow-md transition-all cursor-pointer flex items-center gap-3.5 group"
              >
                {art.image && (
                  <div className="w-16 h-16 rounded-xl overflow-hidden shrink-0 border border-slate-100 bg-slate-100">
                    <img
                      src={art.image}
                      alt={art.title}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform"
                    />
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <h4 className="text-xs sm:text-sm font-bold text-[#0F172A] leading-snug group-hover:text-emerald-700 transition-colors line-clamp-2">
                    {art.title}
                  </h4>
                </div>
                <ArrowRight className="w-4 h-4 text-slate-400 group-hover:text-emerald-700 group-hover:translate-x-0.5 transition-all shrink-0" />
              </div>
            ))}
          </div>
        ) : (
          /* Honest Empty State matching prompt rules */
          <div className="bg-white border border-slate-200/80 rounded-2xl p-6 text-center shadow-2xs">
            <BookOpen className="w-8 h-8 text-slate-300 mx-auto mb-2" />
            <p className="text-xs font-bold text-[#0F172A]">No published insights yet</p>
            <p className="text-[11px] text-slate-500 mt-1 max-w-sm mx-auto">
              Verified agronomic research articles and seasonal guides will appear here when published.
            </p>
          </div>
        )}
      </div>
    </section>
  );
};

export default LatestInsightsSection;
