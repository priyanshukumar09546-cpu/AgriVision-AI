import React, { useState, useEffect } from 'react';
import { Navbar } from '../components/Navbar';
import { InsightsHero } from '../components/insights/InsightsHero';
import { InsightsTabs } from '../components/insights/InsightsTabs';
import type { InsightsTab } from '../components/insights/InsightsTabs';
import { WeatherRiskPanel } from '../components/insights/WeatherRiskPanel';
import { InsightsBottomBanner } from '../components/insights/InsightsBottomBanner';
import { InsightsModal } from '../components/insights/InsightsModal';
import type { ModalContent } from '../components/insights/InsightsModal';
import { fetchLiveWeather, type RealWeatherResult } from '../services/weatherService';
import { fetchRealInsights, type RealInsightsResult } from '../services/insightsService';
import { ArrowRight, BarChart3, AlertTriangle } from 'lucide-react';

interface AIInsightsPageProps {
  onRouteChange?: (route: string) => void;
}

export const AIInsightsPage: React.FC<AIInsightsPageProps> = ({ onRouteChange }) => {
  const [activeTab, setActiveTab] = useState<InsightsTab>('overview');
  const [selectedCrop, setSelectedCrop] = useState('Tomato');
  const [modalContent, setModalContent] = useState<ModalContent | null>(null);

  // Real weather state from Open-Meteo
  const [weatherData, setWeatherData] = useState<RealWeatherResult | null>(null);
  const [weatherLoading, setWeatherLoading] = useState(true);

  // Real insights state from SQLite scans
  const [insightsData, setInsightsData] = useState<RealInsightsResult>({
    hasData: false,
    totalScans: 0,
    avgConfidence: 0,
  });
  const [insightsLoading, setInsightsLoading] = useState(true);

  useEffect(() => {
    // Fetch live weather
    setWeatherLoading(true);
    fetchLiveWeather().then((res) => {
      setWeatherData(res);
      setWeatherLoading(false);
    });

    // Fetch real scans analytics
    setInsightsLoading(true);
    fetchRealInsights(selectedCrop).then((res) => {
      setInsightsData(res);
      setInsightsLoading(false);
    });
  }, [selectedCrop]);

  const handleViewPrecautions = () => {
    setModalContent({
      type: 'precautions',
      title: 'Real-Time Meteorological Disease Advisory',
      subtitle: `Actionable preventive protocols for ${weatherData?.current?.diseaseRisk || 'Moderate'} Risk conditions`,
      body: (
        <div className="space-y-3">
          <div className="bg-amber-50 border border-amber-200 rounded-xl p-3.5 text-amber-900">
            <div className="font-bold flex items-center gap-1.5 mb-1 text-xs">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
              Live Meteorological Assessment
            </div>
            <p className="text-[11px] leading-relaxed text-slate-700">
              Current temperature is {weatherData?.current?.temperature || '28°C'} with {weatherData?.current?.humidity || '60%'} relative humidity. Under current humidity thresholds, fungal spore sporulation risk is <strong>{weatherData?.current?.diseaseRisk || 'Moderate'}</strong>.
            </p>
          </div>
          <div>
            <h5 className="font-bold text-slate-800 text-xs mb-1.5">Action Steps for Current Weather:</h5>
            <ul className="list-disc pl-4 space-y-1 text-slate-600 text-[11px]">
              <li>Avoid evening overhead sprinkler irrigation to keep leaf canopies dry overnight.</li>
              <li>Ensure good plant spacing and canopy aeration to lower microclimate humidity.</li>
              <li>Apply protective organic bio-fungicide (Trichoderma or Bacillus subtilis) before expected precipitation.</li>
            </ul>
          </div>
        </div>
      ),
    });
  };

  const formattedForecastDays = weatherData?.forecast || [
    { day: 'Today', date: 'Live', temp: weatherData?.current?.temperature || '28°C', condition: weatherData?.current?.condition || 'sunny', conditionLabel: 'Live', risk: weatherData?.current?.diseaseRisk || 'Low' }
  ];

  return (
    <div className="min-h-screen bg-[#FAFDFB] flex flex-col selection:bg-emerald-100 selection:text-emerald-900 font-sans">
      {/* 1. Navbar */}
      <Navbar
        activeRoute="/insights"
        onRouteChange={onRouteChange}
      />

      {/* 2. Hero Header */}
      <InsightsHero />

      {/* 3. Horizontal Tabs Navigation */}
      <InsightsTabs
        activeTab={activeTab}
        onTabChange={setActiveTab}
        selectedCrop={selectedCrop}
        onSelectCrop={setSelectedCrop}
      />

      {/* 4. Main Dashboard Workspace */}
      <main className="flex-1 w-full max-w-[1240px] mx-auto px-6 py-5 space-y-4">
        {/* KPI Row based on REAL Scans */}
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3.5">
          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Total Scans</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-extrabold text-[#0F172A]">{insightsData.totalScans}</span>
              <span className="text-xs font-semibold text-emerald-700">Real Scans</span>
            </div>
            <p className="text-[10.5px] text-slate-400 mt-1">Total plant leaves processed</p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Avg Confidence</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-extrabold text-[#0F172A]">
                {insightsData.hasData ? `${insightsData.avgConfidence}%` : '—'}
              </span>
              <span className="text-xs font-semibold text-emerald-700">AI Pathology</span>
            </div>
            <p className="text-[10.5px] text-slate-400 mt-1">Confidence on diagnosed leaves</p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Live Weather Risk</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className={`text-2xl font-extrabold ${weatherData?.current?.diseaseRisk === 'High' ? 'text-rose-600' : weatherData?.current?.diseaseRisk === 'Moderate' ? 'text-amber-600' : 'text-emerald-700'}`}>
                {weatherData?.current?.diseaseRisk || 'Low'}
              </span>
              <span className="text-xs font-semibold text-slate-500">{weatherData?.current?.temperature}</span>
            </div>
            <p className="text-[10.5px] text-slate-400 mt-1">Open-Meteo satellite feed</p>
          </div>

          <div className="bg-white border border-slate-200/90 rounded-2xl p-4 shadow-2xs">
            <span className="text-[11px] font-bold text-slate-500 uppercase tracking-wider block">Selected Crop</span>
            <div className="flex items-baseline justify-between mt-1">
              <span className="text-2xl font-extrabold text-[#0F172A]">{selectedCrop}</span>
              <span className="text-xs font-semibold text-emerald-700">Core 8</span>
            </div>
            <p className="text-[10.5px] text-slate-400 mt-1">Active crop context</p>
          </div>
        </div>

        {/* Main Dashboard Row: Real Weather & Disease Risk + Real Scan Insights */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-3.5 items-stretch">
          {/* Panel 1: Live Real Weather & Disease Risk (Open-Meteo) */}
          <div className="lg:col-span-1">
            {weatherLoading ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-8 text-center text-xs text-slate-400">
                Loading live meteorological data...
              </div>
            ) : weatherData?.error ? (
              <div className="bg-white border border-rose-200 rounded-2xl p-6 text-center text-rose-700 text-xs font-medium">
                {weatherData.error}
              </div>
            ) : (
              <WeatherRiskPanel
                location={weatherData?.location || 'Regional Agricultural Zone'}
                forecastDays={formattedForecastDays as any}
                alert={{
                  title: `${weatherData?.current?.diseaseRisk} Disease Risk Weather Alert`,
                  description: `Current humidity (${weatherData?.current?.humidity}) and temperature (${weatherData?.current?.temperature}) indicate ${weatherData?.current?.diseaseRisk?.toLowerCase()} fungal pathogen pressure.`,
                  buttonText: 'View Precautions',
                }}
                onViewPrecautions={handleViewPrecautions}
              />
            )}
          </div>

          {/* Panel 2 & 3: Real Scan-Based Insights or Honest Empty State */}
          <div className="lg:col-span-2">
            {insightsLoading ? (
              <div className="bg-white border border-slate-200 rounded-2xl p-12 text-center text-xs text-slate-400">
                Compiling database analytics...
              </div>
            ) : !insightsData.hasData || insightsData.totalScans === 0 ? (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-8 sm:p-10 shadow-2xs flex flex-col items-center justify-center text-center h-full min-h-[320px]">
                <div className="w-14 h-14 rounded-2xl bg-emerald-50 text-[#15803D] flex items-center justify-center mb-4">
                  <BarChart3 className="w-7 h-7" />
                </div>
                <h4 className="text-lg font-bold text-[#0F172A]">
                  Not enough data available to generate insights yet.
                </h4>
                <p className="text-xs text-slate-500 max-w-md mt-1.5 leading-relaxed">
                  AgriVision AI adheres to strict data honesty. Disease trends, yield predictions, and regional risk curves are generated directly from real scan records in the database.
                </p>
                <div className="mt-6 flex flex-col sm:flex-row items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onRouteChange?.('/detect')}
                    className="inline-flex items-center gap-2 px-5 py-2.5 bg-[#15803D] hover:bg-[#166534] text-white text-xs font-bold rounded-xl shadow-xs transition-colors cursor-pointer"
                  >
                    <span>Scan a Crop Leaf</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => onRouteChange?.('/crops')}
                    className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-100 hover:bg-slate-200 text-slate-700 text-xs font-semibold rounded-xl transition-colors cursor-pointer"
                  >
                    <span>Browse Supported Crops</span>
                  </button>
                </div>
              </div>
            ) : (
              <div className="bg-white border border-slate-200/90 rounded-2xl p-5 shadow-2xs h-full flex flex-col justify-between">
                <div>
                  <h4 className="text-sm font-bold text-[#0F172A]">Real Scan Breakdown</h4>
                  <p className="text-xs text-slate-500 mt-0.5">Epidemiological distribution from {insightsData.totalScans} verified scans</p>
                </div>

                <div className="my-4 space-y-3">
                  {insightsData.diseaseBreakdown?.map((d, i) => (
                    <div key={i}>
                      <div className="flex justify-between text-xs font-bold text-slate-700 mb-1">
                        <span>{d.disease}</span>
                        <span>{d.count} scans ({Math.round((d.count / insightsData.totalScans) * 100)}%)</span>
                      </div>
                      <div className="w-full bg-slate-100 h-2.5 rounded-full overflow-hidden">
                        <div
                          className="bg-[#15803D] h-full rounded-full"
                          style={{ width: `${(d.count / insightsData.totalScans) * 100}%` }}
                        />
                      </div>
                    </div>
                  ))}
                </div>

                <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-xs text-slate-500">
                  <span>Primary detected crop: <strong>{insightsData.primaryCrop}</strong></span>
                  <button
                    type="button"
                    onClick={() => onRouteChange?.('/detect')}
                    className="font-bold text-[#15803D] hover:underline"
                  >
                    + Add New Scan
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>

      {/* 5. Bottom Agricultural Landscape Banner */}
      <InsightsBottomBanner />

      {/* 6. Interactive Modal Dialog */}
      <InsightsModal
        content={modalContent}
        onClose={() => setModalContent(null)}
        onNavigateToDetect={() => onRouteChange?.('/detect')}
      />
    </div>
  );
};
