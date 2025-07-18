import authReducer, {
  login,
  register,
  logout,
  updateProfile,
  clearError,
  setLoading,
} from '../../../src/store/slices/authSlice';

describe('Auth Slice', () => {
  const mockUser = {
    id: 'test-user-id',
    email: 'test@example.com',
    name: 'Test User',
    avatar_url: null,
    created_at: '2024-01-01T00:00:00Z',
    updated_at: '2024-01-01T00:00:00Z',
  };

  const initialState = {
    user: null,
    token: null,
    isAuthenticated: false,
    loading: false,
    error: null,
  };

  describe('Initial State', () => {
    it('should return initial state', () => {
      const state = authReducer(undefined, { type: 'unknown' });
      expect(state).toEqual(initialState);
    });
  });

  describe('Login Actions', () => {
    it('should handle login pending', () => {
      const action = { type: login.pending.type };
      const state = authReducer(initialState, action);

      expect(state.loading).toBe(true);
      expect(state.error).toBe(null);
    });

    it('should handle login fulfilled', () => {
      const action = {
        type: login.fulfilled.type,
        payload: {
          user: mockUser,
          token: 'test-token',
        },
      };
      const state = authReducer(initialState, action);

      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe('test-token');
      expect(state.isAuthenticated).toBe(true);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
    });

    it('should handle login rejected', () => {
      const errorMessage = 'Invalid credentials';
      const action = {
        type: login.rejected.type,
        payload: errorMessage,
      };
      const state = authReducer(initialState, action);

      expect(state.user).toBe(null);
      expect(state.token).toBe(null);
      expect(state.isAuthenticated).toBe(false);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('Register Actions', () => {
    it('should handle register pending', () => {
      const action = { type: register.pending.type };
      const state = authReducer(initialState, action);

      expect(state.loading).toBe(true);
      expect(state.error).toBe(null);
    });

    it('should handle register fulfilled', () => {
      const action = {
        type: register.fulfilled.type,
        payload: {
          user: mockUser,
          token: 'test-token',
        },
      };
      const state = authReducer(initialState, action);

      expect(state.user).toEqual(mockUser);
      expect(state.token).toBe('test-token');
      expect(state.isAuthenticated).toBe(true);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
    });

    it('should handle register rejected', () => {
      const errorMessage = 'Email already exists';
      const action = {
        type: register.rejected.type,
        payload: errorMessage,
      };
      const state = authReducer(initialState, action);

      expect(state.user).toBe(null);
      expect(state.token).toBe(null);
      expect(state.isAuthenticated).toBe(false);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('Logout Actions', () => {
    const authenticatedState = {
      ...initialState,
      user: mockUser,
      token: 'test-token',
      isAuthenticated: true,
    };

    it('should handle logout fulfilled', () => {
      const action = { type: logout.fulfilled.type };
      const state = authReducer(authenticatedState, action);

      expect(state.user).toBe(null);
      expect(state.token).toBe(null);
      expect(state.isAuthenticated).toBe(false);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
    });
  });

  describe('Update Profile Actions', () => {
    const authenticatedState = {
      ...initialState,
      user: mockUser,
      token: 'test-token',
      isAuthenticated: true,
    };

    it('should handle update profile pending', () => {
      const action = { type: updateProfile.pending.type };
      const state = authReducer(authenticatedState, action);

      expect(state.loading).toBe(true);
      expect(state.error).toBe(null);
    });

    it('should handle update profile fulfilled', () => {
      const updatedUser = { ...mockUser, name: 'Updated Name' };
      const action = {
        type: updateProfile.fulfilled.type,
        payload: updatedUser,
      };
      const state = authReducer(authenticatedState, action);

      expect(state.user).toEqual(updatedUser);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(null);
    });

    it('should handle update profile rejected', () => {
      const errorMessage = 'Update failed';
      const action = {
        type: updateProfile.rejected.type,
        payload: errorMessage,
      };
      const state = authReducer(authenticatedState, action);

      expect(state.user).toEqual(mockUser);
      expect(state.loading).toBe(false);
      expect(state.error).toBe(errorMessage);
    });
  });

  describe('Clear Error Action', () => {
    const errorState = {
      ...initialState,
      error: 'Some error message',
    };

    it('should clear error', () => {
      const action = clearError();
      const state = authReducer(errorState, action);

      expect(state.error).toBe(null);
    });
  });

  describe('Set Loading Action', () => {
    it('should set loading state', () => {
      const action = setLoading(true);
      const state = authReducer(initialState, action);

      expect(state.loading).toBe(true);
    });

    it('should clear loading state', () => {
      const loadingState = { ...initialState, loading: true };
      const action = setLoading(false);
      const state = authReducer(loadingState, action);

      expect(state.loading).toBe(false);
    });
  });

  describe('State Transitions', () => {
    it('should transition from login pending to fulfilled', () => {
      let state = authReducer(initialState, { type: login.pending.type });
      expect(state.loading).toBe(true);

      state = authReducer(state, {
        type: login.fulfilled.type,
        payload: { user: mockUser, token: 'test-token' },
      });
      expect(state.loading).toBe(false);
      expect(state.isAuthenticated).toBe(true);
      expect(state.user).toEqual(mockUser);
    });

    it('should transition from login pending to rejected', () => {
      let state = authReducer(initialState, { type: login.pending.type });
      expect(state.loading).toBe(true);

      state = authReducer(state, {
        type: login.rejected.type,
        payload: 'Invalid credentials',
      });
      expect(state.loading).toBe(false);
      expect(state.isAuthenticated).toBe(false);
      expect(state.error).toBe('Invalid credentials');
    });

    it('should maintain user data during profile update', () => {
      const authenticatedState = {
        ...initialState,
        user: mockUser,
        token: 'test-token',
        isAuthenticated: true,
      };

      let state = authReducer(authenticatedState, {
        type: updateProfile.pending.type,
      });
      expect(state.loading).toBe(true);
      expect(state.user).toEqual(mockUser); // User data should remain during update

      const updatedUser = { ...mockUser, name: 'Updated Name' };
      state = authReducer(state, {
        type: updateProfile.fulfilled.type,
        payload: updatedUser,
      });
      expect(state.loading).toBe(false);
      expect(state.user).toEqual(updatedUser);
    });
  });

  describe('Error Handling', () => {
    it('should clear error when starting new action', () => {
      const errorState = {
        ...initialState,
        error: 'Previous error',
      };

      const state = authReducer(errorState, { type: login.pending.type });
      expect(state.error).toBe(null);
    });

    it('should preserve error state when action fails', () => {
      const errorState = {
        ...initialState,
        error: 'Previous error',
      };

      const state = authReducer(errorState, {
        type: login.rejected.type,
        payload: 'New error',
      });
      expect(state.error).toBe('New error');
    });
  });
});
