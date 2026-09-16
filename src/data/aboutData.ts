export interface AboutStatItem {
  id: string;
  value: string;
  title: string;
  description: string;
  iconName: 'users' | 'leaf' | 'shield' | 'globe';
}

export interface WhyBuiltItem {
  id: string;
  title: string;
  description: string;
  iconName: 'leaf' | 'chart' | 'users' | 'sprout';
}

export interface TeamPillarItem {
  id: string;
  title: string;
  subtitle: string;
  iconName: 'brain' | 'sprout' | 'palette' | 'users';
}

export const ABOUT_STATS: AboutStatItem[] = [
  {
    id: 'stat-1',
    value: 'Open',
    title: 'Farmer Community',
    description: 'Built for growers & agronomists',
    iconName: 'users',
  },
  {
    id: 'stat-2',
    value: '20+',
    title: 'Crops Cataloged',
    description: 'From grains to vegetables',
    iconName: 'leaf',
  },
  {
    id: 'stat-3',
    value: '18',
    title: 'Verified Pathologies',
    description: 'ICAR-aligned disease library',
    iconName: 'shield',
  },
  {
    id: 'stat-4',
    value: '100%',
    title: 'Real-Time AI',
    description: 'Instant botanical computer vision',
    iconName: 'globe',
  },
];

export const WHY_BUILT_ITEMS: WhyBuiltItem[] = [
  {
    id: 'why-1',
    title: 'Early Detection',
    description: 'Help farmers identify crop diseases before they spread.',
    iconName: 'leaf',
  },
  {
    id: 'why-2',
    title: 'Data-Driven Insights',
    description: 'Provide personalized recommendations for better yields.',
    iconName: 'chart',
  },
  {
    id: 'why-3',
    title: 'Knowledge Sharing',
    description: 'Build a community of farmers, experts, and learners.',
    iconName: 'users',
  },
  {
    id: 'why-4',
    title: 'Sustainable Future',
    description: 'Promote eco-friendly and profitable farming practices.',
    iconName: 'sprout',
  },
];

export const TEAM_PILLARS: TeamPillarItem[] = [
  {
    id: 'team-1',
    title: 'AI & Tech Experts',
    subtitle: 'Building intelligent solutions',
    iconName: 'brain',
  },
  {
    id: 'team-2',
    title: 'Agriculture Specialists',
    subtitle: 'Ensuring real-world impact',
    iconName: 'sprout',
  },
  {
    id: 'team-3',
    title: 'Designers',
    subtitle: 'Creating simple and intuitive experiences',
    iconName: 'palette',
  },
  {
    id: 'team-4',
    title: 'Community Support',
    subtitle: 'Connecting and empowering farmers',
    iconName: 'users',
  },
];
