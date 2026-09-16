import React, { useState, useEffect } from 'react';
import { Users, Leaf, Shield, Globe } from 'lucide-react';
import { ABOUT_STATS } from '../../data/aboutData';
import type { AboutStatItem } from '../../data/aboutData';
import { fetchPlatformStats } from '../../services/insightsService';

export const AboutStatsRow: React.FC = () => {
  const [statsList, setStatsList] = useState<AboutStatItem[]>(ABOUT_STATS);

  useEffect(() => {
    fetchPlatformStats().then((data) => {
      setStatsList([
        {
          id: 'stat-1',
          value: data.farmersRegistered > 0 ? `${data.farmersRegistered}` : 'Open',
          title: data.farmersRegistered > 0 ? 'Registered Farmers' : 'Farmer Community',
          description: 'Verified platform members',
          iconName: 'users',
        },
        {
          id: 'stat-2',
          value: `${data.totalCropsCataloged || 20}+`,
          title: 'Crops Cataloged',
          description: 'From grains to vegetables',
          iconName: 'leaf',
        },
        {
          id: 'stat-3',
          value: `${data.verifiedDiseases || 18}`,
          title: 'Verified Pathologies',
          description: 'ICAR-aligned disease library',
          iconName: 'shield',
        },
        {
          id: 'stat-4',
          value: data.scansCompleted > 0 ? `${data.scansCompleted}` : '100%',
          title: data.scansCompleted > 0 ? 'Scans Analyzed' : 'Real-Time AI',
          description: 'Instant botanical computer vision',
          iconName: 'globe',
        },
      ]);
    }).catch(() => {});
  }, []);

  const getIcon = (iconName: AboutStatItem['iconName']) => {
    switch (iconName) {
      case 'users':
        return <Users className="w-5 h-5 text-[#15803D]" />;
      case 'leaf':
        return <Leaf className="w-5 h-5 text-[#15803D] fill-[#15803D]" />;
      case 'shield':
        return <Shield className="w-5 h-5 text-[#15803D] fill-[#15803D]" />;
      case 'globe':
        return <Globe className="w-5 h-5 text-[#15803D]" />;
    }
  };

  return (
    <section className="w-full py-5 sm:py-6 bg-white">
      <div className="max-w-[1240px] mx-auto px-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {statsList.map((stat) => (
            <div
              key={stat.id}
              className="flex items-center gap-3.5 p-4 rounded-xl bg-[#F4FBF7] border border-[#E5F5EC] transition-all hover:border-[#D0EEDC] hover:shadow-xs"
            >
              <div className="w-11 h-11 rounded-full bg-[#DCFCE7] flex items-center justify-center shrink-0">
                {getIcon(stat.iconName)}
              </div>

              <div className="flex flex-col">
                <span className="text-[21px] sm:text-[23px] font-extrabold text-[#0F172A] leading-tight tracking-tight">
                  {stat.value}
                </span>
                <span className="text-[12px] sm:text-[12.5px] font-bold text-[#0F172A] leading-snug mt-0.5">
                  {stat.title}
                </span>
                <span className="text-[10.5px] text-slate-500 leading-tight mt-0.5">
                  {stat.description}
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};
