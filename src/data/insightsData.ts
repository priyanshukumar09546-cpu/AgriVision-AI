export interface KpiMetric {
  id: string;
  title: string;
  value: string;
  trend: string;
  trendDirection: 'up' | 'down';
  trendContext: string;
  iconName: 'sprout' | 'alert' | 'barChart' | 'leaf';
}

export interface DiseaseTrendPoint {
  month: string;
  earlyBlight: number;
  leafMold: number;
  septoria: number;
  healthy: number;
}

export interface RecommendationItem {
  id: string;
  iconType: 'leaf' | 'droplet' | 'sprout' | 'shield';
  title: string;
  description: string;
  buttonText: string;
  buttonVariant: 'primary' | 'outline';
  actionType: 'action' | 'learn' | 'guide' | 'products';
}

export interface WeatherDay {
  day: string;
  date: string;
  temp: string;
  condition: 'sunny' | 'partly-cloudy' | 'rainy';
  risk: 'Low' | 'Moderate' | 'High';
}

export interface YieldMonth {
  month: string;
  predicted: number;
  actual: number;
}

export interface SoilParameter {
  name: string;
  value: string;
  status: 'Optimal' | 'Good' | 'Moderate' | 'Low';
  iconType: 'ph' | 'nitrogen' | 'phosphorus' | 'potassium';
}

export interface RegionalIssue {
  rank: number;
  name: string;
  percentage: number;
  colorClass: string;
}

export interface CropInsightsData {
  cropName: string;
  kpis: KpiMetric[];
  diseaseTrends: DiseaseTrendPoint[];
  recommendations: RecommendationItem[];
  weatherRisk: {
    location: string;
    forecastDays: WeatherDay[];
    alert: {
      title: string;
      description: string;
      buttonText: string;
    };
  };
  yieldPrediction: {
    growthPercentage: string;
    growthText: string;
    data: YieldMonth[];
  };
  soilHealth: {
    parameters: SoilParameter[];
    insightText: string;
  };
  commonIssues: RegionalIssue[];
}

export const TOMATO_INSIGHTS: CropInsightsData = {
  cropName: 'Tomato',
  kpis: [
    {
      id: 'scans',
      title: 'Total Scans Analyzed',
      value: '—',
      trend: 'Live',
      trendDirection: 'up',
      trendContext: 'database records',
      iconName: 'sprout',
    },
    {
      id: 'incidence',
      title: 'Disease Incidence',
      value: '—',
      trend: 'Real-Time',
      trendDirection: 'down',
      trendContext: 'pathology trends',
      iconName: 'alert',
    },
    {
      id: 'accuracy',
      title: 'Prediction Accuracy',
      value: '—',
      trend: 'Verified',
      trendDirection: 'up',
      trendContext: 'AI model confidence',
      iconName: 'barChart',
    },
    {
      id: 'healthy-rate',
      title: 'Healthy Crop Rate',
      value: '—',
      trend: 'Active',
      trendDirection: 'up',
      trendContext: 'seasonal baseline',
      iconName: 'leaf',
    },
  ],
  diseaseTrends: [
    { month: 'Mar', earlyBlight: 100, leafMold: 85, septoria: 55, healthy: 82 },
    { month: 'Apr', earlyBlight: 92, leafMold: 102, septoria: 68, healthy: 80 },
    { month: 'May', earlyBlight: 65, leafMold: 65, septoria: 38, healthy: 115 },
    { month: 'Jun', earlyBlight: 120, leafMold: 80, septoria: 45, healthy: 160 },
    { month: 'Jul', earlyBlight: 38, leafMold: 38, septoria: 22, healthy: 25 },
    { month: 'Aug', earlyBlight: 80, leafMold: 52, septoria: 32, healthy: 42 },
  ],
  recommendations: [
    {
      id: 'rec-1',
      iconType: 'leaf',
      title: 'Monitor for Early Blight',
      description: 'Higher risk expected in next 7 days due to high humidity.',
      buttonText: 'Take Action',
      buttonVariant: 'primary',
      actionType: 'action',
    },
    {
      id: 'rec-2',
      iconType: 'droplet',
      title: 'Improve Irrigation Schedule',
      description: 'Reduce overhead watering to prevent fungal growth.',
      buttonText: 'Learn More',
      buttonVariant: 'outline',
      actionType: 'learn',
    },
    {
      id: 'rec-3',
      iconType: 'sprout',
      title: 'Use Balanced Fertilizers',
      description: 'Maintain proper nutrient levels for stronger plant immunity.',
      buttonText: 'View Guide',
      buttonVariant: 'outline',
      actionType: 'guide',
    },
    {
      id: 'rec-4',
      iconType: 'shield',
      title: 'Apply Preventive Fungicide',
      description: 'Recommended for current weather conditions.',
      buttonText: 'See Products',
      buttonVariant: 'outline',
      actionType: 'products',
    },
  ],
  weatherRisk: {
    location: 'New Delhi',
    forecastDays: [
      { day: 'Mon', date: 'Sep 7', temp: '28°C', condition: 'sunny', risk: 'Low' },
      { day: 'Tue', date: 'Sep 8', temp: '30°C', condition: 'partly-cloudy', risk: 'Moderate' },
      { day: 'Wed', date: 'Sep 9', temp: '27°C', condition: 'rainy', risk: 'High' },
      { day: 'Thu', date: 'Sep 10', temp: '26°C', condition: 'rainy', risk: 'High' },
      { day: 'Fri', date: 'Sep 11', temp: '29°C', condition: 'sunny', risk: 'Moderate' },
      { day: 'Sat', date: 'Sep 12', temp: '31°C', condition: 'sunny', risk: 'Low' },
      { day: 'Sun', date: 'Sep 13', temp: '30°C', condition: 'partly-cloudy', risk: 'Low' },
    ],
    alert: {
      title: 'Higher Disease Risk Ahead',
      description:
        'Increased humidity and rainfall may lead to higher chances of fungal diseases in the next 3 days.',
      buttonText: 'View Precautions',
    },
  },
  yieldPrediction: {
    growthPercentage: '+12%',
    growthText: 'Higher yield expected compared to last season',
    data: [
      { month: 'Mar', predicted: 20, actual: 17 },
      { month: 'Apr', predicted: 17.5, actual: 19 },
      { month: 'May', predicted: 23, actual: 19 },
      { month: 'Jun', predicted: 31, actual: 27 },
      { month: 'Jul', predicted: 28, actual: 30 },
      { month: 'Aug', predicted: 28, actual: 30.5 },
    ],
  },
  soilHealth: {
    parameters: [
      { name: 'pH Level', value: '6.8', status: 'Optimal', iconType: 'ph' },
      { name: 'Nitrogen (N)', value: '42 ppm', status: 'Good', iconType: 'nitrogen' },
      { name: 'Phosphorus (P)', value: '28 ppm', status: 'Moderate', iconType: 'phosphorus' },
      { name: 'Potassium (K)', value: '310 ppm', status: 'Good', iconType: 'potassium' },
    ],
    insightText:
      'Soil is suitable for tomato cultivation. Consider adding organic matter to improve phosphorus levels.',
  },
  commonIssues: [
    { rank: 1, name: 'Early Blight', percentage: 32, colorClass: 'bg-[#F87171]' },
    { rank: 2, name: 'Leaf Mold', percentage: 24, colorClass: 'bg-[#FB923C]' },
    { rank: 3, name: 'Septoria Leaf Spot', percentage: 18, colorClass: 'bg-[#FBBF24]' },
    { rank: 4, name: 'Bacterial Spot', percentage: 14, colorClass: 'bg-[#86EFAC]' },
    { rank: 5, name: 'Late Blight', percentage: 12, colorClass: 'bg-[#86EFAC]' },
  ],
};

export const AVAILABLE_INSIGHT_CROPS = [
  'Tomato',
  'Potato',
  'Chili',
  'Cotton',
  'Wheat',
  'Rice',
];
