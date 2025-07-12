import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { PrayerState, PrayerRequest, PrayerResponse } from '@/types';
import { prayerService } from '@/services/prayerService';

const initialState: PrayerState = {
  requests: [],
  myRequests: [],
  loading: false,
  error: null,
  filters: {
    radius: 10, // Default 10km radius
  },
};

// Async thunks
export const fetchPrayerRequests = createAsyncThunk(
  'prayer/fetchRequests',
  async (filters: { latitude?: number; longitude?: number; radius?: number }, { rejectWithValue }) => {
    try {
      const response = await prayerService.fetchRequests(filters);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const fetchMyPrayerRequests = createAsyncThunk(
  'prayer/fetchMyRequests',
  async (_, { rejectWithValue }) => {
    try {
      const response = await prayerService.fetchMyRequests();
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const createPrayerRequest = createAsyncThunk(
  'prayer/createRequest',
  async (requestData: Omit<PrayerRequest, 'id' | 'responses' | 'createdAt' | 'updatedAt'>, { rejectWithValue }) => {
    try {
      const response = await prayerService.createRequest(requestData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const respondToPrayerRequest = createAsyncThunk(
  'prayer/respondToRequest',
  async (responseData: Omit<PrayerResponse, 'id' | 'createdAt'>, { rejectWithValue }) => {
    try {
      const response = await prayerService.respondToRequest(responseData);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const updatePrayerRequest = createAsyncThunk(
  'prayer/updateRequest',
  async ({ id, updates }: { id: string; updates: Partial<PrayerRequest> }, { rejectWithValue }) => {
    try {
      const response = await prayerService.updateRequest(id, updates);
      return response;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const prayerSlice = createSlice({
  name: 'prayer',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setFilters: (state, action: PayloadAction<Partial<PrayerState['filters']>>) => {
      state.filters = { ...state.filters, ...action.payload };
    },
    addPrayerResponse: (state, action: PayloadAction<{ requestId: string; response: PrayerResponse }>) => {
      const { requestId, response } = action.payload;
      const request = state.requests.find(req => req.id === requestId);
      if (request) {
        request.responses.push(response);
      }
    },
  },
  extraReducers: (builder) => {
    builder
      // Fetch prayer requests
      .addCase(fetchPrayerRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPrayerRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.requests = action.payload;
        state.error = null;
      })
      .addCase(fetchPrayerRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch my prayer requests
      .addCase(fetchMyPrayerRequests.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMyPrayerRequests.fulfilled, (state, action) => {
        state.loading = false;
        state.myRequests = action.payload;
        state.error = null;
      })
      .addCase(fetchMyPrayerRequests.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create prayer request
      .addCase(createPrayerRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createPrayerRequest.fulfilled, (state, action) => {
        state.loading = false;
        state.myRequests.unshift(action.payload);
        state.error = null;
      })
      .addCase(createPrayerRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Respond to prayer request
      .addCase(respondToPrayerRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(respondToPrayerRequest.fulfilled, (state, action) => {
        state.loading = false;
        const { requestId, response } = action.payload;
        const request = state.requests.find(req => req.id === requestId);
        if (request) {
          request.responses.push(response);
        }
        state.error = null;
      })
      .addCase(respondToPrayerRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update prayer request
      .addCase(updatePrayerRequest.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updatePrayerRequest.fulfilled, (state, action) => {
        state.loading = false;
        const updatedRequest = action.payload;
        const index = state.myRequests.findIndex(req => req.id === updatedRequest.id);
        if (index !== -1) {
          state.myRequests[index] = updatedRequest;
        }
        state.error = null;
      })
      .addCase(updatePrayerRequest.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setFilters, addPrayerResponse } = prayerSlice.actions;
export default prayerSlice.reducer;