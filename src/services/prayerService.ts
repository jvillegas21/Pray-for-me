import { supabase } from './authService';
import { PrayerRequest, PrayerResponse } from '@/types';
import axios from 'axios';

export interface PrayerRequestWithResponses extends PrayerRequest {
  responses: PrayerResponse[];
  user: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

export interface CreatePrayerRequestData {
  title: string;
  description: string;
  category: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  isAnonymous: boolean;
  privacyLevel: 'public' | 'community' | 'private';
  urgencyLevel: 'low' | 'medium' | 'high' | 'crisis';
}

export interface PrayerFilter {
  latitude?: number;
  longitude?: number;
  radius?: number; // in meters
  category?: string;
  urgencyLevel?: string;
  privacyLevel?: string;
  offset?: number; // For pagination
  limit?: number; // For pagination
}


export const prayerService = {
  async fetchRequests(
    filters: PrayerFilter = {}
  ): Promise<PrayerRequestWithResponses[]> {
    try {
      
      // First, check if the prayer_requests table exists
      const { data: tableCheck, error: tableError } = await supabase
        .from('prayer_requests')
        .select('id')
        .limit(1);

      if (tableError) {
        // Prayer requests table error
        return [];
      }


      let query = supabase
        .from('prayer_requests')
        .select(
          'id, title, description, category, urgency_level, privacy_level, is_anonymous, location, tags, status, created_at, updated_at, expires_at, user_id'
        )
        .eq('privacy_level', 'public')
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.category) {
        query = query.eq('category', filters.category);
      }
      if (filters.urgencyLevel) {
        query = query.eq('urgency_level', filters.urgencyLevel);
      }

      // Location-based filtering would require PostGIS extension
      // For now, we'll do basic filtering
      if (filters.latitude && filters.longitude && filters.radius) {
        // This is a simplified distance calculation
        // In production, use PostGIS for accurate geospatial queries
        query = query.not('location', 'is', null);
      }

      // Add pagination support
      if (filters.offset !== undefined && filters.limit !== undefined) {
        const from = filters.offset;
        const to = filters.offset + filters.limit - 1;
        query = query.range(from, to);
      }

      const { data, error } = await query;

      if (error) {
        // Error fetching prayer requests:', error);
        return [];
      }

      // If no data, return empty array
      if (!data || data.length === 0) {
        
        return [];
      }

      // For each prayer request, fetch the user profile separately
      const requestsWithProfiles = await Promise.all(
        data.map(async (request) => {
          let userProfile = null;
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('id, name, avatar_url')
              .eq('id', request.user_id)
              .single();

            userProfile = profile;
          } catch (profileError) {
            // Could not fetch profile
          }

          // Fetch responses for this prayer request
          let responses = [];
          try {
            const { data: responseData } = await supabase
              .from('prayer_responses')
              .select('*')
              .eq('prayer_request_id', request.id)
              .order('created_at', { ascending: true });

            if (responseData) {
              // For each response, fetch the user profile
              responses = await Promise.all(
                responseData.map(async (response) => {
                  let responseUserProfile = null;
                  try {
                    const { data: profile } = await supabase
                      .from('profiles')
                      .select('id, name, avatar_url')
                      .eq('id', response.user_id)
                      .single();

                    responseUserProfile = profile;
                  } catch (profileError) {
                    // Could not fetch profile
                  }

                  return {
                    ...response,
                    user: responseUserProfile || {
                      id: response.user_id,
                      name: 'Unknown User',
                      avatar_url: null,
                    },
                  };
                })
              );
            }
          } catch (responseError) {
            // Could not fetch responses
          }

          return {
            id: request.id,
            userId: request.user_id,
            title: request.title,
            description: request.description,
            category: request.category,
            urgency: request.urgency_level,
            isAnonymous: request.is_anonymous,
            location: request.location,
            tags: request.tags || [],
            responses,
            status: request.status,
            createdAt: request.created_at,
            updatedAt: request.updated_at,
            expiresAt: request.expires_at,
            user: userProfile || {
              id: request.user_id,
              name: 'Unknown User',
              avatar_url: null,
            },
          };
        })
      );

      return requestsWithProfiles;
    } catch (error: any) {
      // Error in fetchRequests:', error);
      return [];
    }
  },

  async fetchMyRequests(): Promise<PrayerRequestWithResponses[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      // Check if the prayer_requests table exists
      const { data: tableCheck, error: tableError } = await supabase
        .from('prayer_requests')
        .select('id')
        .limit(1);

      if (tableError) {
        // Prayer requests table not found
        return [];
      }

      const { data, error } = await supabase
        .from('prayer_requests')
        .select(
          'id, title, description, category, urgency_level, privacy_level, is_anonymous, location, tags, status, created_at, updated_at, expires_at, user_id'
        )
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        // Error fetching my prayer requests:', error);
        return [];
      }

      if (!data || data.length === 0) {
        return [];
      }

      // For each prayer request, fetch the user profile and responses
      const requestsWithProfiles = await Promise.all(
        data.map(async (request) => {
          let userProfile = null;
          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('id, name, avatar_url')
              .eq('id', request.user_id)
              .single();

            userProfile = profile;
          } catch (profileError) {
            // Could not fetch profile
          }

          // Fetch responses for this prayer request
          let responses = [];
          try {
            const { data: responseData } = await supabase
              .from('prayer_responses')
              .select('*')
              .eq('prayer_request_id', request.id)
              .order('created_at', { ascending: true });

            if (responseData) {
              responses = await Promise.all(
                responseData.map(async (response) => {
                  let responseUserProfile = null;
                  try {
                    const { data: profile } = await supabase
                      .from('profiles')
                      .select('id, name, avatar_url')
                      .eq('id', response.user_id)
                      .single();

                    responseUserProfile = profile;
                  } catch (profileError) {
                    // Could not fetch profile
                  }

                  return {
                    ...response,
                    user: responseUserProfile || {
                      id: response.user_id,
                      name: 'Unknown User',
                      avatar_url: null,
                    },
                  };
                })
              );
            }
          } catch (responseError) {
            // Could not fetch responses
          }

          return {
            id: request.id,
            userId: request.user_id,
            title: request.title,
            description: request.description,
            category: request.category,
            urgency: request.urgency_level,
            isAnonymous: request.is_anonymous,
            location: request.location,
            tags: request.tags || [],
            responses,
            status: request.status,
            createdAt: request.created_at,
            updatedAt: request.updated_at,
            expiresAt: request.expires_at,
            user: userProfile || {
              id: request.user_id,
              name: 'Unknown User',
              avatar_url: null,
            },
          };
        })
      );

      return requestsWithProfiles;
    } catch (error: any) {
      // Error in fetchMyRequests:', error);
      return [];
    }
  },

  async createRequest(
    requestData: CreatePrayerRequestData
  ): Promise<PrayerRequest> {
    try {
      const {
        data: { user },
        error: authError
      } = await supabase.auth.getUser();

      if (authError) {
        throw new Error(`Auth error: ${authError.message}`);
      }

      if (!user) {
        throw new Error('Not authenticated');
      }


      const insertData = {
        user_id: user.id,
        title: requestData.title,
        description: requestData.description,
        category: requestData.category,
        location: requestData.location,
        is_anonymous: requestData.isAnonymous,
        privacy_level: requestData.privacyLevel,
        urgency_level: requestData.urgencyLevel,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      };

      const { data, error } = await supabase
        .from('prayer_requests')
        .insert([insertData])
        .select()
        .single();


      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create prayer request');
    }
  },

  async updateRequest(
    id: string,
    updates: Partial<PrayerRequest>
  ): Promise<PrayerRequest> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('prayer_requests')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id) // Only allow users to update their own requests
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update prayer request');
    }
  },

  async deleteRequest(id: string): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      const { error } = await supabase
        .from('prayer_requests')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id); // Only allow users to delete their own requests

      if (error) {
        throw new Error(error.message);
      }

      return true;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete prayer request');
    }
  },

  async respondToRequest(
    prayerRequestId: string,
    message: string
  ): Promise<PrayerResponse> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('prayer_responses')
        .insert([
          {
            prayer_request_id: prayerRequestId,
            user_id: user.id,
            message: message,
            created_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to respond to prayer request');
    }
  },

  async getRequestById(id: string): Promise<PrayerRequestWithResponses | null> {
    try {
      const { data, error } = await supabase
        .from('prayer_requests')
        .select('*')
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      if (!data) {
        return null;
      }

      // Fetch user profile
      let userProfile = null;
      try {
        const { data: profile } = await supabase
          .from('profiles')
          .select('id, name, avatar_url')
          .eq('id', data.user_id)
          .single();

        userProfile = profile;
      } catch (profileError) {
        // Could not fetch profile
      }

      // Fetch responses
      let responses = [];
      try {
        const { data: responseData } = await supabase
          .from('prayer_responses')
          .select('*')
          .eq('prayer_request_id', id)
          .order('created_at', { ascending: true });

        if (responseData) {
          responses = await Promise.all(
            responseData.map(async (response) => {
              let responseUserProfile = null;
              try {
                const { data: profile } = await supabase
                  .from('profiles')
                  .select('id, name, avatar_url')
                  .eq('id', response.user_id)
                  .single();

                responseUserProfile = profile;
              } catch (profileError) {
                // Could not fetch profile
              }

              return {
                ...response,
                user: responseUserProfile || {
                  id: response.user_id,
                  name: 'Unknown User',
                  avatar_url: null,
                },
              };
            })
          );
        }
      } catch (responseError) {
        // Could not fetch responses
      }

      return {
        id: data.id,
        userId: data.user_id,
        title: data.title,
        description: data.description,
        category: data.category,
        urgency: data.urgency_level,
        isAnonymous: data.is_anonymous,
        location: data.location,
        tags: data.tags || [],
        status: data.status,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
        expiresAt: data.expires_at,
        user: userProfile || {
          id: data.user_id,
          name: 'Unknown User',
          avatar_url: null,
        },
        responses,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch prayer request');
    }
  },

  async reportRequest(id: string, reason: string): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      const { error } = await supabase.from('prayer_reports').insert([
        {
          prayer_request_id: id,
          reported_by: user.id,
          reason: reason,
          created_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        throw new Error(error.message);
      }

      return true;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to report prayer request');
    }
  },

  // Get prayer requests by category
  async getRequestsByCategory(
    category: string
  ): Promise<PrayerRequestWithResponses[]> {
    try {
      const { data, error } = await supabase
        .from('prayer_requests')
        .select('*')
        .eq('category', category)
        .eq('privacy_level', 'public')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      if (!data || data.length === 0) {
        return [];
      }

      // For each prayer request, fetch the user profile
      const requestsWithProfiles = await Promise.all(
        data.map(async (request) => {
          let userProfile = null;

          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('id, name, avatar_url')
              .eq('id', request.user_id)
              .single();

            userProfile = profile;
          } catch (profileError) {
            // Could not fetch profile
          }

          return {
            ...request,
            user: userProfile || {
              id: request.user_id,
              name: 'Unknown User',
              avatar_url: null,
            },
            responses: [], // Simplified for category requests
          };
        })
      );

      return requestsWithProfiles;
    } catch (error: any) {
      throw new Error(
        error.message || 'Failed to fetch prayer requests by category'
      );
    }
  },

  // Get urgent prayer requests
  async getUrgentRequests(): Promise<PrayerRequestWithResponses[]> {
    try {
      const { data, error } = await supabase
        .from('prayer_requests')
        .select('*')
        .in('urgency_level', ['high', 'crisis'])
        .eq('privacy_level', 'public')
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      if (!data || data.length === 0) {
        return [];
      }

      // For each prayer request, fetch the user profile
      const requestsWithProfiles = await Promise.all(
        data.map(async (request) => {
          let userProfile = null;

          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('id, name, avatar_url')
              .eq('id', request.user_id)
              .single();

            userProfile = profile;
          } catch (profileError) {
            // Could not fetch profile
          }

          return {
            ...request,
            user: userProfile || {
              id: request.user_id,
              name: 'Unknown User',
              avatar_url: null,
            },
            responses: [], // Simplified for urgent requests
          };
        })
      );

      return requestsWithProfiles;
    } catch (error: any) {
      throw new Error(
        error.message || 'Failed to fetch urgent prayer requests'
      );
    }
  },

  async markAsAnswered(id: string): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      const { error } = await supabase
        .from('prayer_requests')
        .update({
          is_answered: true,
          status: 'answered',
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id); // Only allow users to mark their own requests as answered

      if (error) {
        throw new Error(error.message);
      }

      return true;
    } catch (error: any) {
      throw new Error(
        error.message || 'Failed to mark prayer request as answered'
      );
    }
  },

  // Get prayer requests by location (simplified)
  async getRequestsByLocation(
    latitude: number,
    longitude: number,
    radius: number
  ): Promise<PrayerRequestWithResponses[]> {
    try {
      // For now, we'll just get all public requests
      // In production, implement proper geospatial queries with PostGIS
      const { data, error } = await supabase
        .from('prayer_requests')
        .select('*')
        .eq('privacy_level', 'public')
        .not('location', 'is', null)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      if (!data || data.length === 0) {
        return [];
      }

      // For each prayer request, fetch the user profile
      const requestsWithProfiles = await Promise.all(
        data.map(async (request) => {
          let userProfile = null;

          try {
            const { data: profile } = await supabase
              .from('profiles')
              .select('id, name, avatar_url')
              .eq('id', request.user_id)
              .single();

            userProfile = profile;
          } catch (profileError) {
            // Could not fetch profile
          }

          return {
            ...request,
            user: userProfile || {
              id: request.user_id,
              name: 'Unknown User',
              avatar_url: null,
            },
            responses: [], // Simplified for location requests
          };
        })
      );

      return requestsWithProfiles;
    } catch (error: any) {
      throw new Error(
        error.message || 'Failed to fetch prayer requests by location'
      );
    }
  },

  // Get prayer statistics
  async getPrayerStats(): Promise<{
    totalRequests: number;
    answeredRequests: number;
    myRequests: number;
    myResponses: number;
  }> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      // Get total requests
      const { count: totalRequests } = await supabase
        .from('prayer_requests')
        .select('*', { count: 'exact', head: true })
        .eq('privacy_level', 'public');

      // Get answered requests
      const { count: answeredRequests } = await supabase
        .from('prayer_requests')
        .select('*', { count: 'exact', head: true })
        .eq('privacy_level', 'public')
        .eq('is_answered', true);

      // Get my requests
      const { count: myRequests } = await supabase
        .from('prayer_requests')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      // Get my responses
      const { count: myResponses } = await supabase
        .from('prayer_responses')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', user.id);

      return {
        totalRequests: totalRequests || 0,
        answeredRequests: answeredRequests || 0,
        myRequests: myRequests || 0,
        myResponses: myResponses || 0,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch prayer statistics');
    }
  },
};

// New methods for encouragements and prayer actions
export const submitEncouragement = async (encouragementData: {
  prayerRequestId: string;
  message: string;
}) => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
      .from('encouragements')
      .insert({
        prayer_request_id: encouragementData.prayerRequestId,
        user_id: user.id,
        message: encouragementData.message,
      })
      .select()
      .single();

    if (error) {
      // Error submitting encouragement
      throw error;
    }

    return data;
  } catch (error: any) {
    // Error in submitEncouragement:', error);
    throw error;
  }
};

export const getEncouragements = async (prayerRequestId: string, sortNewestFirst: boolean = true) => {
  try {
    const { data, error } = await supabase
      .from('encouragements')
      .select(
        `
        *,
        users!encouragements_user_id_fkey (
          id,
          email,
          display_name
        )
      `
      )
      .eq('prayer_request_id', prayerRequestId)
      .order('created_at', { ascending: !sortNewestFirst });

    if (error) {
      // Error fetching encouragements:', error);
      return [];
    }

    // Map database fields to camelCase to match the Encouragement interface
    const mappedData = (data || []).map((encouragement: any) => ({
      id: encouragement.id,
      prayerRequestId: encouragement.prayer_request_id,
      userId: encouragement.user_id,
      message: encouragement.message,
      createdAt: encouragement.created_at,
      isAnonymous: encouragement.is_anonymous,
      moderationStatus: encouragement.moderation_status,
      flaggedBy: encouragement.flagged_by,
      flaggedReason: encouragement.flagged_reason,
      user: encouragement.users
    }));

    return mappedData;
  } catch (error: any) {
    // Error in getEncouragements:', error);
    return [];
  }
};

export const deleteEncouragement = async (encouragementId: string) => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Not authenticated');
    }

    const { error } = await supabase
      .from('encouragements')
      .delete()
      .eq('id', encouragementId)
      .eq('user_id', user.id);

    if (error) {
      // Error deleting encouragement:', error);
      throw error;
    }

    return true;
  } catch (error: any) {
    // Error in deleteEncouragement:', error);
    throw error;
  }
};

// Prayer actions methods
export const addPrayerAction = async (prayerRequestId: string) => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Not authenticated');
    }

    const { data, error } = await supabase
      .from('prayer_actions')
      .insert({
        prayer_request_id: prayerRequestId,
        user_id: user.id,
      })
      .select()
      .single();

    if (error) {
      // Error adding prayer action:', error);
      throw error;
    }

    return data;
  } catch (error: any) {
    // Error in addPrayerAction:', error);
    throw error;
  }
};

export const removePrayerAction = async (prayerRequestId: string) => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      throw new Error('Not authenticated');
    }

    const { error } = await supabase
      .from('prayer_actions')
      .delete()
      .eq('prayer_request_id', prayerRequestId)
      .eq('user_id', user.id);

    if (error) {
      // Error removing prayer action:', error);
      throw error;
    }

    return true;
  } catch (error: any) {
    // Error in removePrayerAction:', error);
    throw error;
  }
};

export const hasUserPrayed = async (
  prayerRequestId: string
): Promise<boolean> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return false;
    }

    const { data, error } = await supabase
      .from('prayer_actions')
      .select('id')
      .eq('prayer_request_id', prayerRequestId)
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found"
      // Error checking prayer action:', error);
      return false;
    }

    return !!data;
  } catch (error: any) {
    // Error in hasUserPrayed:', error);
    return false;
  }
};

export const hasUserEncouraged = async (
  prayerRequestId: string
): Promise<boolean> => {
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (!user) {
      return false;
    }

    const { data, error } = await supabase
      .from('encouragements')
      .select('id')
      .eq('prayer_request_id', prayerRequestId)
      .eq('user_id', user.id)
      .single();

    if (error && error.code !== 'PGRST116') {
      // PGRST116 is "not found"
      // Error checking encouragement:', error);
      return false;
    }

    return !!data;
  } catch (error: any) {
    // Error in hasUserEncouraged:', error);
    return false;
  }
};

// Get counts for prayer requests
export const getEncouragementCount = async (
  prayerRequestId: string
): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('encouragements')
      .select('*', { count: 'exact', head: true })
      .eq('prayer_request_id', prayerRequestId);

    if (error) {
      // Error getting encouragement count:', error);
      return 0;
    }

    return count || 0;
  } catch (error: any) {
    // Error in getEncouragementCount:', error);
    return 0;
  }
};

export const getPrayerCount = async (
  prayerRequestId: string
): Promise<number> => {
  try {
    const { count, error } = await supabase
      .from('prayer_actions')
      .select('*', { count: 'exact', head: true })
      .eq('prayer_request_id', prayerRequestId);

    if (error) {
      // Error getting prayer count:', error);
      return 0;
    }

    return count || 0;
  } catch (error: any) {
    // Error in getPrayerCount:', error);
    return 0;
  }
};

export const getRequestById = prayerService.getRequestById;
