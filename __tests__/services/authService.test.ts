import { authService, supabase } from '../../src/services/authService';

describe('AuthService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('login', () => {
    it('should successfully login a user', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        user_metadata: { name: 'Test User' },
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };
      const mockSession = { access_token: 'test-token', user: mockUser };
      const mockProfile = { name: 'Test User', avatar_url: null };
      jest.spyOn(supabase.auth, 'signInWithPassword').mockResolvedValue({ data: { user: mockUser, session: mockSession }, error: null });
      jest.spyOn(supabase, 'from').mockReturnValue({
        select: () => ({ eq: () => ({ single: () => Promise.resolve({ data: mockProfile, error: null }) }) })
      } as any);
      const result = await authService.login({ email: 'test@example.com', password: 'password123' });
      expect(result.user.email).toBe('test@example.com');
      expect(result.session).toBe(mockSession);
    });
    it('should fail login with error', async () => {
      jest.spyOn(supabase.auth, 'signInWithPassword').mockResolvedValue({ data: { user: null, session: null }, error: { message: 'Invalid credentials' } });
      await expect(authService.login({ email: 'test@example.com', password: 'wrong' })).rejects.toThrow('Invalid credentials');
    });
  });

  describe('register', () => {
    it('should successfully register a user', async () => {
      const mockUser = {
        id: 'test-user-id',
        email: 'test@example.com',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };
      jest.spyOn(supabase.auth, 'signUp').mockResolvedValue({ data: { user: mockUser, session: null }, error: null });
      jest.spyOn(supabase, 'from').mockReturnValue({
        insert: () => ({ error: null })
      } as any);
      const result = await authService.register({ email: 'test@example.com', password: 'password123', name: 'Test User' });
      expect(result.user.email).toBe('test@example.com');
    });
    it('should fail register with error', async () => {
      jest.spyOn(supabase.auth, 'signUp').mockResolvedValue({ data: { user: null, session: null }, error: { message: 'Email already registered' } });
      await expect(authService.register({ email: 'existing@example.com', password: 'password123', name: 'Test User' })).rejects.toThrow('Email already registered');
    });
  });

  describe('logout', () => {
    it('should successfully logout', async () => {
      jest.spyOn(supabase.auth, 'signOut').mockResolvedValue({ error: null });
      await expect(authService.logout()).resolves.toBeUndefined();
    });
    it('should fail logout with error', async () => {
      jest.spyOn(supabase.auth, 'signOut').mockResolvedValue({ error: { message: 'Logout failed' } });
      await expect(authService.logout()).rejects.toThrow('Logout failed');
    });
  });
}); 