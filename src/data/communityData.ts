export interface AuthorInfo {
  name: string;
  role: string;
  avatar: string;
  location: string;
  timeAgo: string;
}

export interface PostItem {
  id: string;
  author: AuthorInfo;
  title: string;
  content: string;
  images?: string[];
  cropTag?: string;
  categoryBadge: {
    text: string;
    variant: 'help' | 'discussion' | 'expert';
  };
  likesCount: number;
  commentsCount: number;
  isLiked?: boolean;
}

export interface TopicItem {
  id: string;
  name: string;
  iconName: string;
}

export interface EventItem {
  id: string;
  month: string;
  day: string;
  title: string;
  time: string;
  mode: string;
}

export interface ContributorItem {
  rank: number;
  name: string;
  points: string;
  avatar: string;
  crownType?: 'gold' | 'silver' | 'bronze';
}

export const COMMUNITY_TOPICS: TopicItem[] = [
  { id: 'general-farming', name: 'General Farming', iconName: 'tractor' },
  { id: 'crop-specific', name: 'Crop-specific', iconName: 'sprout' },
  { id: 'pest-disease', name: 'Pest & Disease Help', iconName: 'bug' },
  { id: 'techniques', name: 'Farming Techniques', iconName: 'wrench' },
  { id: 'soil-fertilizers', name: 'Soil & Fertilizers', iconName: 'layers' },
  { id: 'irrigation-water', name: 'Irrigation & Water', iconName: 'droplets' },
  { id: 'organic-farming', name: 'Organic Farming', iconName: 'leaf' },
  { id: 'market-pricing', name: 'Market & Pricing', iconName: 'trending-up' },
  { id: 'govt-schemes', name: 'Government Schemes', iconName: 'landmark' },
  { id: 'success-stories', name: 'Success Stories', iconName: 'award' },
];

export const INITIAL_COMMUNITY_POSTS: PostItem[] = [
  {
    id: 'post-1',
    author: {
      name: 'Ramesh Kumar',
      role: 'Verified Farmer',
      avatar: '/community_assets/avatar_ramesh.jpg',
      location: 'Uttar Pradesh',
      timeAgo: '2 hours ago',
    },
    title: 'What disease is this on my tomato plant?',
    content:
      'I noticed these brown spots on the leaves of my tomato plant. Can anyone identify the disease and suggest a treatment? The plants are 3 months old.',
    images: [
      '/community_assets/leaf1_2x.jpg',
      '/community_assets/leaf2_2x.jpg',
    ],
    cropTag: 'Tomato',
    categoryBadge: {
      text: 'Help Needed',
      variant: 'help',
    },
    likesCount: 12,
    commentsCount: 8,
    isLiked: false,
  },
  {
    id: 'post-2',
    author: {
      name: 'Priya Sharma',
      role: 'Agriculture Student',
      avatar: '/community_assets/avatar_priya.jpg',
      location: 'Delhi',
      timeAgo: '5 hours ago',
    },
    title: 'Best organic fertilizer for maize?',
    content:
      'I am planning to grow maize this season. Which organic fertilizers work best for higher yield? Any suggestions based on your experience?',
    cropTag: 'Maize',
    categoryBadge: {
      text: 'Discussion',
      variant: 'discussion',
    },
    likesCount: 18,
    commentsCount: 12,
    isLiked: false,
  },
  {
    id: 'post-3',
    author: {
      name: 'Dr. Anil Mehta',
      role: 'Agronomist',
      avatar: '/community_assets/avatar_anil.jpg',
      location: 'ICAR',
      timeAgo: '1 day ago',
    },
    title: 'How to prevent early blight in potatoes?',
    content:
      'Early blight is common during humid weather. Here are some proven preventive measures that can help keep your potato crop healthy...',
    categoryBadge: {
      text: 'Expert Advice',
      variant: 'expert',
    },
    likesCount: 34,
    commentsCount: 9,
    isLiked: false,
  },
];

export const COMMUNITY_EVENTS: EventItem[] = [
  {
    id: 'evt-1',
    month: 'SEP',
    day: '15',
    title: 'Live Webinar: Managing Fall Armyworm',
    time: '5:00 PM IST',
    mode: 'Online',
  },
  {
    id: 'evt-2',
    month: 'SEP',
    day: '20',
    title: 'Expert AMA: Soil Health & Fertility',
    time: '6:00 PM IST',
    mode: 'Online',
  },
  {
    id: 'evt-3',
    month: 'SEP',
    day: '28',
    title: 'Community Meetup (Virtual)',
    time: '4:00 PM IST',
    mode: 'Online',
  },
];

export const TOP_CONTRIBUTORS: ContributorItem[] = [
  {
    rank: 1,
    name: 'Ramesh Kumar',
    points: '1.2K points',
    avatar: '/community_assets/avatar_ramesh.jpg',
    crownType: 'gold',
  },
  {
    rank: 2,
    name: 'Dr. Anil Mehta',
    points: '980 points',
    avatar: '/community_assets/avatar_anil.jpg',
    crownType: 'silver',
  },
  {
    rank: 3,
    name: 'Priya Sharma',
    points: '840 points',
    avatar: '/community_assets/avatar_priya.jpg',
    crownType: 'bronze',
  },
  {
    rank: 4,
    name: 'Suresh Patel',
    points: '760 points',
    avatar: '/community_assets/avatar_suresh.jpg',
  },
  {
    rank: 5,
    name: 'Neha Verma',
    points: '650 points',
    avatar: '/community_assets/avatar_neha.jpg',
  },
];
