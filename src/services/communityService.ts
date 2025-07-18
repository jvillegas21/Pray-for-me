import { supabase } from './authService';
import { Community } from '@/types';

export interface CommunityWithMembers extends Community {
  members: Array<{
    id: string;
    name: string;
    avatar_url?: string;
    joined_at: string;
  }>;
  creator: {
    id: string;
    name: string;
    avatar_url?: string;
  };
}

export interface CreateCommunityData {
  name: string;
  description: string;
  category: string;
  location?: {
    latitude: number;
    longitude: number;
  };
  isPrivate: boolean;
  maxMembers?: number;
}

export interface CommunityFilter {
  latitude?: number;
  longitude?: number;
  radius?: number; // in meters
  category?: string;
  isPrivate?: boolean;
}

export const communityService = {
  async fetchCommunities(
    filters: CommunityFilter = {}
  ): Promise<CommunityWithMembers[]> {
    try {
      let query = supabase
        .from('communities')
        .select(
          `
          *,
          creator:profiles!communities_creator_id_fkey (
            id,
            name,
            avatar_url
          ),
          members:community_members (
            id,
            joined_at,
            user:profiles!community_members_user_id_fkey (
              id,
              name,
              avatar_url
            )
          )
        `
        )
        .eq('is_private', false)
        .order('created_at', { ascending: false });

      // Apply filters
      if (filters.category) {
        query = query.eq('category', filters.category);
      }

      // Location-based filtering would require PostGIS extension
      // For now, we'll do basic filtering
      if (filters.latitude && filters.longitude && filters.radius) {
        query = query.not('location', 'is', null);
      }

      const { data, error } = await query;

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch communities');
    }
  },

  async fetchMyCommunities(): Promise<CommunityWithMembers[]> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('community_members')
        .select(
          `
          community:communities (
            *,
            creator:profiles!communities_creator_id_fkey (
              id,
              name,
              avatar_url
            ),
            members:community_members (
              id,
              joined_at,
              user:profiles!community_members_user_id_fkey (
                id,
                name,
                avatar_url
              )
            )
          )
        `
        )
        .eq('user_id', user.id);

      if (error) {
        throw new Error(error.message);
      }

      return (data?.map((item) => item.community).filter(Boolean) as any) || [];
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch your communities');
    }
  },

  async createCommunity(
    communityData: CreateCommunityData
  ): Promise<Community> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('communities')
        .insert([
          {
            creator_id: user.id,
            name: communityData.name,
            description: communityData.description,
            category: communityData.category,
            location: communityData.location,
            is_private: communityData.isPrivate,
            max_members: communityData.maxMembers,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
          },
        ])
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      // Auto-join the creator to the community
      await this.joinCommunity(data.id);

      return data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to create community');
    }
  },

  async joinCommunity(communityId: string): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      // Check if already a member
      const { data: existingMember } = await supabase
        .from('community_members')
        .select('id')
        .eq('community_id', communityId)
        .eq('user_id', user.id)
        .single();

      if (existingMember) {
        throw new Error('Already a member of this community');
      }

      // Check community capacity
      const { data: community } = await supabase
        .from('communities')
        .select('max_members')
        .eq('id', communityId)
        .single();

      if (community?.max_members) {
        const { count } = await supabase
          .from('community_members')
          .select('id', { count: 'exact' })
          .eq('community_id', communityId);

        if (count && count >= community.max_members) {
          throw new Error('Community is full');
        }
      }

      const { error } = await supabase.from('community_members').insert([
        {
          community_id: communityId,
          user_id: user.id,
          joined_at: new Date().toISOString(),
        },
      ]);

      if (error) {
        throw new Error(error.message);
      }

      return true;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to join community');
    }
  },

  async leaveCommunity(communityId: string): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      const { error } = await supabase
        .from('community_members')
        .delete()
        .eq('community_id', communityId)
        .eq('user_id', user.id);

      if (error) {
        throw new Error(error.message);
      }

      return true;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to leave community');
    }
  },

  async getCommunityById(id: string): Promise<CommunityWithMembers | null> {
    try {
      const { data, error } = await supabase
        .from('communities')
        .select(
          `
          *,
          creator:profiles!communities_creator_id_fkey (
            id,
            name,
            avatar_url
          ),
          members:community_members (
            id,
            joined_at,
            user:profiles!community_members_user_id_fkey (
              id,
              name,
              avatar_url
            )
          )
        `
        )
        .eq('id', id)
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch community');
    }
  },

  async updateCommunity(
    id: string,
    updates: Partial<Community>
  ): Promise<Community> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      const { data, error } = await supabase
        .from('communities')
        .update({
          ...updates,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id)
        .eq('creator_id', user.id) // Only allow creators to update their communities
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to update community');
    }
  },

  async deleteCommunity(id: string): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      const { error } = await supabase
        .from('communities')
        .delete()
        .eq('id', id)
        .eq('creator_id', user.id); // Only allow creators to delete their communities

      if (error) {
        throw new Error(error.message);
      }

      return true;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to delete community');
    }
  },

  async getCommunityMembers(id: string): Promise<
    Array<{
      id: string;
      name: string;
      avatar_url?: string;
      joined_at: string;
    }>
  > {
    try {
      const { data, error } = await supabase
        .from('community_members')
        .select(
          `
          id,
          joined_at,
          user:profiles!community_members_user_id_fkey (
            id,
            name,
            avatar_url
          )
        `
        )
        .eq('community_id', id)
        .order('joined_at', { ascending: true });

      if (error) {
        throw new Error(error.message);
      }

      return (
        data?.map((member: any) => ({
          id: member.user?.id || '',
          name: member.user?.name || '',
          avatar_url: member.user?.avatar_url,
          joined_at: member.joined_at,
        })) || []
      );
    } catch (error: any) {
      throw new Error(error.message || 'Failed to fetch community members');
    }
  },

  // Get communities by category
  async getCommunitiesByCategory(
    category: string
  ): Promise<CommunityWithMembers[]> {
    try {
      const { data, error } = await supabase
        .from('communities')
        .select(
          `
          *,
          creator:profiles!communities_creator_id_fkey (
            id,
            name,
            avatar_url
          ),
          members:community_members (
            id,
            joined_at,
            user:profiles!community_members_user_id_fkey (
              id,
              name,
              avatar_url
            )
          )
        `
        )
        .eq('category', category)
        .eq('is_private', false)
        .order('created_at', { ascending: false });

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (error: any) {
      throw new Error(
        error.message || 'Failed to fetch communities by category'
      );
    }
  },

  // Check if user is a member of a community
  async isMemberOfCommunity(communityId: string): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return false;
      }

      const { data, error } = await supabase
        .from('community_members')
        .select('id')
        .eq('community_id', communityId)
        .eq('user_id', user.id)
        .single();

      if (error) {
        return false;
      }

      return !!data;
    } catch (error) {
      return false;
    }
  },

  // Remove member from community (admin only)
  async removeMember(communityId: string, userId: string): Promise<boolean> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('Not authenticated');
      }

      // Check if the current user is the creator
      const { data: community } = await supabase
        .from('communities')
        .select('creator_id')
        .eq('id', communityId)
        .single();

      if (!community || community.creator_id !== user.id) {
        throw new Error('Only community creators can remove members');
      }

      const { error } = await supabase
        .from('community_members')
        .delete()
        .eq('community_id', communityId)
        .eq('user_id', userId);

      if (error) {
        throw new Error(error.message);
      }

      return true;
    } catch (error: any) {
      throw new Error(error.message || 'Failed to remove member');
    }
  },
};
