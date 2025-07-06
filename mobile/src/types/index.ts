export interface User {
  id: string;
  name: string;
  email: string;
  location?: {
    type: string;
    coordinates: [number, number];
  };
  city?: string;
  country?: string;
  prayersSubmitted?: string[];
  prayersLiked?: string[];
}

export interface Prayer {
  _id: string;
  user: User | string;
  title: string;
  content: string;
  category: 'healing' | 'guidance' | 'thanksgiving' | 'protection' | 'family' | 'financial' | 'spiritual' | 'other';
  location: {
    type: string;
    coordinates: [number, number];
  };
  city?: string;
  country?: string;
  likes: string[];
  likeCount: number;
  prayerCount: number;
  bibleVerses: BibleVerse[];
  visibility: 'public' | 'local' | 'private';
  answered: boolean;
  answeredDate?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface BibleVerse {
  reference: string;
  text: string;
  version: string;
}

export interface BibleStudy {
  _id: string;
  user: string;
  prayer: string;
  title: string;
  theme: string;
  introduction: string;
  verses: BibleStudyVerse[];
  questions: StudyQuestion[];
  keyTakeaways: string[];
  prayerPoints: string[];
  additionalResources: Resource[];
  progress: number;
  completed: boolean;
  completedAt?: Date;
  duration: number;
  createdAt: Date;
  lastAccessedAt: Date;
}

export interface BibleStudyVerse extends BibleVerse {
  explanation: string;
  reflection: string;
}

export interface StudyQuestion {
  question: string;
  userAnswer?: string;
  answeredAt?: Date;
}

export interface Resource {
  title: string;
  url: string;
  type: 'article' | 'video' | 'book' | 'podcast';
}

export interface Location {
  latitude: number;
  longitude: number;
  city?: string;
  country?: string;
}

export interface AuthContextData {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  signIn: (email: string, password: string) => Promise<void>;
  signUp: (name: string, email: string, password: string, location?: Location) => Promise<void>;
  signOut: () => Promise<void>;
  updateLocation: (location: Location) => Promise<void>;
}

export interface LocationContextData {
  location: Location | null;
  isLoading: boolean;
  error: string | null;
  requestLocationPermission: () => Promise<void>;
  getCurrentLocation: () => Promise<void>;
}

export interface PrayerContextData {
  prayers: Prayer[];
  nearbyPrayers: Prayer[];
  trendingPrayers: Prayer[];
  userPrayers: Prayer[];
  isLoading: boolean;
  error: string | null;
  createPrayer: (prayerData: CreatePrayerData) => Promise<void>;
  fetchNearbyPrayers: (location: Location, maxDistance?: number) => Promise<void>;
  fetchTrendingPrayers: () => Promise<void>;
  fetchUserPrayers: (userId: string) => Promise<void>;
  likePrayer: (prayerId: string) => Promise<void>;
  incrementPrayerCount: (prayerId: string) => Promise<void>;
  markAsAnswered: (prayerId: string) => Promise<void>;
}

export interface CreatePrayerData {
  title: string;
  content: string;
  category: Prayer['category'];
  visibility: Prayer['visibility'];
  location: Location;
}