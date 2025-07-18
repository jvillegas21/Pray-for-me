import { createSlice, createAsyncThunk, PayloadAction } from '@reduxjs/toolkit';
import { LocationState } from '@/types';
import { locationService } from '@/services/locationService';

const initialState: LocationState = {
  current: null,
  permission: 'pending',
  error: null,
};

// Async thunks
export const requestLocationPermission = createAsyncThunk(
  'location/requestPermission',
  async (_, { rejectWithValue }) => {
    try {
      const permission = await locationService.requestPermission();
      return permission;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

export const getCurrentLocation = createAsyncThunk(
  'location/getCurrentLocation',
  async (_, { rejectWithValue }) => {
    try {
      const location = await locationService.getCurrentLocation();
      return location;
    } catch (error: any) {
      return rejectWithValue(error.message);
    }
  }
);

const locationSlice = createSlice({
  name: 'location',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    setCurrentLocation: (
      state,
      action: PayloadAction<{ latitude: number; longitude: number }>
    ) => {
      state.current = action.payload;
    },
  },
  extraReducers: (builder) => {
    builder
      // Request location permission
      .addCase(requestLocationPermission.pending, (state) => {
        state.permission = 'pending';
        state.error = null;
      })
      .addCase(requestLocationPermission.fulfilled, (state, action) => {
        state.permission = action.payload;
        state.error = null;
      })
      .addCase(requestLocationPermission.rejected, (state, action) => {
        state.permission = 'denied';
        state.error = action.payload as string;
      })
      // Get current location
      .addCase(getCurrentLocation.pending, (state) => {
        state.error = null;
      })
      .addCase(getCurrentLocation.fulfilled, (state, action) => {
        state.current = action.payload;
        state.error = null;
      })
      .addCase(getCurrentLocation.rejected, (state, action) => {
        state.error = action.payload as string;
      });
  },
});

export const { clearError, setCurrentLocation } = locationSlice.actions;
export default locationSlice.reducer;
