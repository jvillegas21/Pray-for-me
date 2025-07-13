import { supabase } from './authService';
import { PrayerRequest, PrayerResponse } from '@/types';

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
}

export const prayerService = {
  async fetchRequests(filters: PrayerFilter = {}): Promise<PrayerRequestWithResponses[]> {
    try {
      // First, check if the prayer_requests table exists
      const { data: tableCheck, error: tableError } = await supabase
        .from('prayer_requests')
        .select('id')
        .limit(1);

      if (tableError) {
        console.log('📋 Prayer requests table not found, returning empty array');
        return [];
      }

      let query = supabase
        .from('prayer_requests')
        .select('*')
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

      const { data, error } = await query;
      
      if (error) {
        console.error('❌ Error fetching prayer requests:', error);
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
            console.warn('⚠️ Could not fetch profile for user:', request.user_id);
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
                    console.warn('⚠️ Could not fetch profile for response user:', response.user_id);
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
            console.warn('⚠️ Could not fetch responses for prayer request:', request.id);
          }

          return {
            ...request,
            user: userProfile || {
              id: request.user_id,
              name: 'Unknown User',
              avatar_url: null,
            },
            responses,
          };
        })
      );

      return requestsWithProfiles;
    } catch (error: any) {
      console.error('❌ Error in fetchRequests:', error);
      return [];
    }
  },

  async fetchMyRequests(): Promise<PrayerRequestWithResponses[]> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      // Check if the prayer_requests table exists
      const { data: tableCheck, error: tableError } = await supabase
        .from('prayer_requests')
        .select('id')
        .limit(1);

      if (tableError) {
        console.log('📋 Prayer requests table not found, returning empty array');
        return [];
      }

      const { data, error } = await supabase
        .from('prayer_requests')
        .select('*')
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });

      if (error) {
        console.error('❌ Error fetching my prayer requests:', error);
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
            console.warn('⚠️ Could not fetch profile for user:', request.user_id);
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
                    console.warn('⚠️ Could not fetch profile for response user:', response.user_id);
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
            console.warn('⚠️ Could not fetch responses for prayer request:', request.id);
          }

          return {
            ...request,
            user: userProfile || {
              id: request.user_id,
              name: 'Unknown User',
              avatar_url: null,
            },
            responses,
          };
        })
      );

      return requestsWithProfiles;
    } catch (error: any) {
      console.error('❌ Error in fetchMyRequests:', error);
      return [];
    }
  },

  async createRequest(requestData: CreatePrayerRequestData): Promise<PrayerRequest> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('prayer_requests')
        .insert([
          {
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
          },
        ])
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

  async updateRequest(id: string, updates: Partial<PrayerRequest>): Promise<PrayerRequest> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
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
      const { data: { user } } = await supabase.auth.getUser();
      
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

  async respondToRequest(prayerRequestId: string, message: string): Promise<PrayerResponse> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
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
        console.warn('⚠️ Could not fetch profile for user:', data.user_id);
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
                console.warn('⚠️ Could not fetch profile for response user:', response.user_id);
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
        console.warn('⚠️ Could not fetch responses for prayer request:', id);
      }

      return {
        ...data,
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
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { error } = await supabase
        .from('prayer_reports')
        .insert([
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
  async getRequestsByCategory(category: string): Promise<PrayerRequestWithResponses[]> {
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
            console.warn('⚠️ Could not fetch profile for user:', request.user_id);
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
      throw new Error(error.message || 'Failed to fetch prayer requests by category');
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
            console.warn('⚠️ Could not fetch profile for user:', request.user_id);
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
      throw new Error(error.message || 'Failed to fetch urgent prayer requests');
    }
  },

  async markAsAnswered(id: string): Promise<boolean> {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      
      if (!user) {
        throw new Error('Not authenticated');
      }

      const { error } = await supabase
        .from('prayer_requests')
        .update({
          is_answered: true,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('user_id', user.id); // Only allow users to mark their own requests as answered

      if (error) {
        throw new Error(error.message);
      }

      return true;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to mark prayer request as answered');
    }
  },

  // Get prayer requests by location (simplified)
  async getRequestsByLocation(latitude: number, longitude: number, radius: number): Promise<PrayerRequestWithResponses[]> {
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
            console.warn('⚠️ Could not fetch profile for user:', request.user_id);
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
      throw new Error(error.message || 'Failed to fetch prayer requests by location');
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
      const { data: { user } } = await supabase.auth.getUser();
      
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