import { prayerService } from '../../src/services/prayerService';
import { supabase } from '../../src/services/authService';

describe('PrayerService', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  describe('createRequest', () => {
    it('should successfully create a prayer request', async () => {
      const mockUser = { id: 'test-user-id', email: 'test@example.com' };
      const mockPrayer = {
        id: 'prayer-1',
        title: 'Test Prayer',
        description: 'Pray for me',
        user_id: 'test-user-id',
        category: 'health',
        is_anonymous: false,
        privacy_level: 'public',
        urgency_level: 'medium',
        created_at: '2024-01-01T00:00:00Z',
        updated_at: '2024-01-01T00:00:00Z',
      };
      jest
        .spyOn(supabase.auth, 'getUser')
        .mockResolvedValue({ data: { user: mockUser }, error: null });
      jest.spyOn(supabase, 'from').mockReturnValue({
        insert: () => ({
          select: () => ({
            single: () => Promise.resolve({ data: mockPrayer, error: null }),
          }),
        }),
      } as any);
      const result = await prayerService.createRequest({
        title: 'Test Prayer',
        description: 'Pray for me',
        category: 'health',
        isAnonymous: false,
        privacyLevel: 'public',
        urgencyLevel: 'medium',
      });
      expect(result.title).toBe('Test Prayer');
      expect(result.user_id).toBe('test-user-id');
    });
    it('should fail to create a prayer request if not authenticated', async () => {
      jest
        .spyOn(supabase.auth, 'getUser')
        .mockResolvedValue({ data: { user: null }, error: null });
      await expect(
        prayerService.createRequest({
          title: 'Test Prayer',
          description: 'Pray for me',
          category: 'health',
          isAnonymous: false,
          privacyLevel: 'public',
          urgencyLevel: 'medium',
        })
      ).rejects.toThrow('Not authenticated');
    });
    it('should fail to create a prayer request on error', async () => {
      const mockUser = { id: 'test-user-id', email: 'test@example.com' };
      jest
        .spyOn(supabase.auth, 'getUser')
        .mockResolvedValue({ data: { user: mockUser }, error: null });
      jest.spyOn(supabase, 'from').mockReturnValue({
        insert: () => ({
          select: () => ({
            single: () =>
              Promise.resolve({ data: null, error: { message: 'DB error' } }),
          }),
        }),
      } as any);
      await expect(
        prayerService.createRequest({
          title: 'Test Prayer',
          description: 'Pray for me',
          category: 'health',
          isAnonymous: false,
          privacyLevel: 'public',
          urgencyLevel: 'medium',
        })
      ).rejects.toThrow('DB error');
    });
  });
});
