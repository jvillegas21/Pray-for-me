import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { CommunityState, Community } from '@/types';
import {
  communityService,
  CreateCommunityData,
} from '@/services/communityService';

const initialState: CommunityState = {
  communities: [],
  myCommunities: [],
  loading: false,
  error: null,
};

// Async thunks
export const fetchCommunities = createAsyncThunk(
  'community/fetchCommunities',
  async (
    filters: { latitude?: number; longitude?: number; radius?: number },
    { rejectWithValue }
  ) => {
    try {
      const response = await communityService.fetchCommunities(filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMyCommunities = createAsyncThunk(
  'community/fetchMyCommunities',
  async (_, { rejectWithValue }) => {
    try {
      const response = await communityService.fetchMyCommunities();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const joinCommunity = createAsyncThunk(
  'community/joinCommunity',
  async (communityId: string, { rejectWithValue }) => {
    try {
      const success = await communityService.joinCommunity(communityId);
      if (success) {
        // Fetch the community details to add to myCommunities
        const community = await communityService.getCommunityById(communityId);
        if (!community) {
          throw new Error('Community not found after joining');
        }
        return community;
      }
      throw new Error('Failed to join community');
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const leaveCommunity = createAsyncThunk(
  'community/leaveCommunity',
  async (communityId: string, { rejectWithValue }) => {
    try {
      await communityService.leaveCommunity(communityId);
      return communityId;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createCommunity = createAsyncThunk(
  'community/createCommunity',
  async (communityData: CreateCommunityData, { rejectWithValue }) => {
    try {
      const response = await communityService.createCommunity(communityData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const communitySlice = createSlice({
  name: 'community',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch communities
      .addCase(fetchCommunities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCommunities.fulfilled, (state, action) => {
        state.loading = false;
        state.communities = action.payload;
        state.error = null;
      })
      .addCase(fetchCommunities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch my communities
      .addCase(fetchMyCommunities.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyCommunities.fulfilled, (state, action) => {
        state.loading = false;
        state.myCommunities = action.payload;
        state.error = null;
      })
      .addCase(fetchMyCommunities.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Join community
      .addCase(joinCommunity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(joinCommunity.fulfilled, (state, action) => {
        state.loading = false;
        state.myCommunities.push(action.payload);
        state.error = null;
      })
      .addCase(joinCommunity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Leave community
      .addCase(leaveCommunity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(leaveCommunity.fulfilled, (state, action) => {
        state.loading = false;
        state.myCommunities = state.myCommunities.filter(
          (c) => c.id !== action.payload
        );
        state.error = null;
      })
      .addCase(leaveCommunity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create community
      .addCase(createCommunity.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createCommunity.fulfilled, (state, action) => {
        state.loading = false;
        state.myCommunities.push(action.payload);
        state.error = null;
      })
      .addCase(createCommunity.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError } = communitySlice.actions;
export default communitySlice.reducer;
