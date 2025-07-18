export interface User {
  id: string;
  email: string;
  name: string;
  avatar?: string;
  denomination?: string;
  bio?: string;
  location?: {
    latitude: number;
    longitude: number;
    city?: string;
    state?: string;
  };
  privacySettings: {
    shareLocation: boolean;
    allowAnonymous: boolean;
    communityLevel: 'public' | 'faith' | 'local';
  };
  createdAt: string;
  updatedAt: string;
}

export interface PrayerRequest {
  id: string;
  userId: string;
  title: string;
  description: string;
  category: PrayerCategory;
  urgency: 'low' | 'medium' | 'high' | 'urgent';
  isAnonymous: boolean;
  location?: {
    latitude: number;
    longitude: number;
    radius?: number; // in kilometers
  };
  tags: string[];
  responses: PrayerResponse[];
  status: 'active' | 'answered' | 'closed';
  createdAt: string;
  updatedAt: string;
  expiresAt?: string;
  encouragements?: Encouragement[];
  aiGenerated?: boolean;
  aiFields?: {
    bibleStudy?: {
      title: string;
      devotional: string;
      reflectionQuestions: string[];
      crossReferences?: { reference: string; text: string }[];
    } | null;
    localResources?: any[];
    wordsOfEncouragement?: string[];
    followUpFramework?: string;
  };
}

export interface PrayerResponse {
  id: string;
  prayerRequestId: string;
  userId: string;
  message: string;
  isAnonymous: boolean;
  createdAt: string;
}

export interface Community {
  id: string;
  name: string;
  description: string;
  denomination?: string;
  location?: {
    latitude: number;
    longitude: number;
    radius: number;
  };
  memberCount: number;
  isPublic: boolean;
  adminIds: string[];
  createdAt: string;
  updatedAt: string;
}

export type PrayerCategory =
  | 'health'
  | 'family'
  | 'work'
  | 'relationships'
  | 'spiritual'
  | 'financial'
  | 'grief'
  | 'guidance'
  | 'gratitude'
  | 'other';

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  error: string | null;
}

export interface PrayerState {
  requests: PrayerRequest[];
  myRequests: PrayerRequest[];
  loading: boolean;
  error: string | null;
  filters: {
    category?: PrayerCategory;
    urgency?: string;
    radius?: number;
  };
  lastRefresh: number;
}

export interface CommunityState {
  communities: Community[];
  myCommunities: Community[];
  loading: boolean;
  error: string | null;
}

export interface LocationState {
  current: {
    latitude: number;
    longitude: number;
  } | null;
  permission: 'granted' | 'denied' | 'pending';
  error: string | null;
}

export interface RootState {
  auth: AuthState;
  prayer: PrayerState;
  community: CommunityState;
  location: LocationState;
}

export type NavigationProps = {
  // Navigation stack types
  Auth: undefined;
  Main: undefined;
  Welcome: undefined;
  Login: undefined;
  Register: undefined;
  Home: undefined;
  PrayerRequest: { requestId?: string };
  CreatePrayerRequest: undefined;
  Profile: { userId?: string };
  Communities: undefined;
  CommunityDetail: { communityId: string };
  Settings: undefined;
  Notifications: undefined;
  Map: undefined;
  PrayerRequestTransition: {
    prayerData: {
      prayerText: string;
      location: {
        city: string;
        state: string;
        country: string;
      };
      wantsBibleStudy: boolean;
      wantsResources: boolean;
    };
  };
  PrayerRequestResults: {
    aiResults: {
      sentimentSummary: string;
      bibleVerses: {
        reference: string;
        text: string;
        whyItHelps: string;
      }[];
      bibleStudy?: {
        title: string;
        devotional: string;
        reflectionQuestions: string[];
      } | null;
      localResources?: any[];
      raw?: string;
    };
  };
  // Tab screen names
  HomeTab: undefined;
  CommunitiesTab: undefined;
  MapTab: undefined;
  ProfileTab: undefined;
};

export type ModerationStatus = 'pending' | 'approved' | 'rejected' | 'flagged';

export interface Encouragement {
  id: string;
  prayerRequestId: string;
  userId: string;
  message: string;
  createdAt: string;
  isAnonymous: boolean;
  moderationStatus: ModerationStatus;
  flaggedBy?: string[]; // userIds who reported
  flaggedReason?: string;
}
