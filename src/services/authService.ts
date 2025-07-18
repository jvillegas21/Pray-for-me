import { createClient } from '@supabase/supabase-js';
import AsyncStorage from '@react-native-async-storage/async-storage';
import 'react-native-url-polyfill/auto';
import { User } from '@/types';
import { SUPABASE_URL, SUPABASE_ANON_KEY } from '@env';

// Debug logging
console.log('🔍 Environment Variables Debug:');
console.log(
  'SUPABASE_URL:',
  SUPABASE_URL ? `${SUPABASE_URL.substring(0, 20)}...` : 'NOT SET'
);
console.log(
  'SUPABASE_ANON_KEY:',
  SUPABASE_ANON_KEY ? `${SUPABASE_ANON_KEY.substring(0, 20)}...` : 'NOT SET'
);

// Validate Supabase configuration
if (!SUPABASE_URL || SUPABASE_URL === 'https://your-project.supabase.co') {
  console.error('❌ SUPABASE_URL is not configured!');
  console.error('📝 Please:');
  console.error('1. Go to https://supabase.com and create a new project');
  console.error('2. Copy your Project URL from Settings > API');
  console.error('3. Update SUPABASE_URL in your .env file');
  console.error('4. Restart Metro and rebuild the app');
}

if (!SUPABASE_ANON_KEY || SUPABASE_ANON_KEY === 'your_anon_key_here') {
  console.error('❌ SUPABASE_ANON_KEY is not configured!');
  console.error('📝 Please:');
  console.error('1. Go to your Supabase project Settings > API');
  console.error('2. Copy the "anon public" key');
  console.error('3. Update SUPABASE_ANON_KEY in your .env file');
  console.error('4. Restart Metro and rebuild the app');
}

// Create Supabase client with actual values
console.log('🔧 Creating Supabase client with:');
console.log('URL:', SUPABASE_URL);
console.log('Key length:', SUPABASE_ANON_KEY.length);
console.log('Key starts with:', SUPABASE_ANON_KEY.substring(0, 20));

export const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
  auth: {
    storage: AsyncStorage,
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: true,
  },
});

console.log('✅ Supabase client created successfully');

export interface AuthUser {
  id: string;
  email: string;
  name: string;
  avatar_url?: string;
  created_at: string;
  updated_at: string;
}

export interface AuthResponse {
  user: AuthUser;
  session: any;
}

export const authService = {
  async login(credentials: {
    email: string;
    password: string;
  }): Promise<AuthResponse> {
    try {
      console.log('🔐 Attempting login for:', credentials.email);

      const { data, error } = await supabase.auth.signInWithPassword({
        email: credentials.email,
        password: credentials.password,
      });

      if (error) {
        console.error('❌ Login error:', error);
        throw new Error(error.message);
      }

      if (!data.user) {
        console.error('❌ Login failed - no user returned');
        throw new Error('Login failed - no user returned');
      }

      console.log('✅ Login successful for user:', data.user.id);

      // Get user profile from the profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', data.user.id)
        .single();

      if (profileError) {
        console.warn('Profile fetch error:', profileError);
        // If profile doesn't exist, create it
        if (profileError.code === 'PGRST116') {
          console.log('🔄 Creating missing user profile during login...');
          const { error: createError } = await supabase
            .from('profiles')
            .insert([
              {
                id: data.user.id,
                name: data.user.user_metadata?.name || 'User',
                email: data.user.email!,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            ]);

          if (createError) {
            console.error(
              '❌ Failed to create profile during login:',
              createError
            );
          } else {
            console.log('✅ Profile created successfully during login');
          }
        }
      }

      const authUser: AuthUser = {
        id: data.user.id,
        email: data.user.email!,
        name: profile?.name || data.user.user_metadata?.name || '',
        avatar_url: profile?.avatar_url || data.user.user_metadata?.avatar_url,
        created_at: data.user.created_at,
        updated_at: data.user.updated_at || data.user.created_at,
      };

      return {
        user: authUser,
        session: data.session,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Login failed');
    }
  },

  async register(userData: {
    email: string;
    password: string;
    name: string;
  }): Promise<AuthResponse> {
    try {
      console.log('📝 Attempting registration for:', userData.email);
      console.log('🔧 Using Supabase client for registration');

      const { data, error } = await supabase.auth.signUp({
        email: userData.email,
        password: userData.password,
        options: {
          data: {
            name: userData.name,
          },
          emailRedirectTo: 'prayforMe://auth/callback',
        },
      });

      if (error) {
        console.error('❌ Registration error:', error);
        throw new Error(error.message);
      }

      if (!data.user) {
        console.error('❌ Registration failed - no user returned');
        throw new Error('Registration failed - no user returned');
      }

      console.log('✅ Registration successful for user:', data.user.id);

      // Check if email confirmation is required
      if (data.session === null) {
        console.log(
          '📧 Email confirmation required - user needs to confirm email before signing in'
        );
        throw new Error(
          'Please check your email and confirm your account before signing in.'
        );
      }

      // Create user profile
      console.log('👤 Creating user profile...');
      const { error: profileError } = await supabase.from('profiles').insert([
        {
          id: data.user.id,
          name: userData.name,
          email: userData.email,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString(),
        },
      ]);

      if (profileError) {
        console.error('❌ Profile creation error:', profileError);
        // Don't throw error here, as the user is already created in auth
        // The profile can be created later if needed
      } else {
        console.log('✅ User profile created successfully');
      }

      const authUser: AuthUser = {
        id: data.user.id,
        email: data.user.email!,
        name: userData.name,
        created_at: data.user.created_at,
        updated_at: data.user.updated_at || data.user.created_at,
      };

      return {
        user: authUser,
        session: data.session,
      };
    } catch (error: any) {
      throw new Error(error.message || 'Registration failed');
    }
  },

  async logout(): Promise<void> {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        throw new Error(error.message);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Logout failed');
    }
  },

  async updateProfile(userData: Partial<AuthUser>): Promise<AuthUser> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        throw new Error('No authenticated user');
      }

      // Update auth metadata if name is being changed
      if (userData.name) {
        const { error: authError } = await supabase.auth.updateUser({
          data: { name: userData.name },
        });

        if (authError) {
          throw new Error(authError.message);
        }
      }

      // Update profile table
      const { data, error } = await supabase
        .from('profiles')
        .update({
          ...userData,
          updated_at: new Date().toISOString(),
        })
        .eq('id', user.id)
        .select()
        .single();

      if (error) {
        throw new Error(error.message);
      }

      return data;
    } catch (error: any) {
      throw new Error(error.message || 'Profile update failed');
    }
  },

  async forgotPassword(email: string): Promise<void> {
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: 'prayforMe://auth/reset-password',
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Password reset failed');
    }
  },

  async resetPassword(newPassword: string): Promise<void> {
    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) {
        throw new Error(error.message);
      }
    } catch (error: any) {
      throw new Error(error.message || 'Password reset failed');
    }
  },

  async getCurrentUser(): Promise<AuthUser | null> {
    try {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (!user) {
        return null;
      }

      // Get user profile from the profiles table
      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();

      if (profileError) {
        console.warn('Profile fetch error:', profileError);
        // If profile doesn't exist, create it
        if (profileError.code === 'PGRST116') {
          console.log('🔄 Creating missing user profile...');
          const { error: createError } = await supabase
            .from('profiles')
            .insert([
              {
                id: user.id,
                name: user.user_metadata?.name || 'User',
                email: user.email!,
                created_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
              },
            ]);

          if (createError) {
            console.error('❌ Failed to create profile:', createError);
          } else {
            console.log('✅ Profile created successfully');
            // Return user with basic info
            return {
              id: user.id,
              email: user.email!,
              name: user.user_metadata?.name || 'User',
              avatar_url: user.user_metadata?.avatar_url,
              created_at: user.created_at,
              updated_at: user.updated_at || user.created_at,
            };
          }
        }
      }

      return {
        id: user.id,
        email: user.email!,
        name: profile?.name || user.user_metadata?.name || 'User',
        avatar_url: profile?.avatar_url || user.user_metadata?.avatar_url,
        created_at: user.created_at,
        updated_at: user.updated_at || user.created_at,
      };
    } catch (error) {
      console.error('Get current user error:', error);
      return null;
    }
  },

  async getSession() {
    try {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      return session;
    } catch (error) {
      console.error('Get session error:', error);
      return null;
    }
  },

  // Listen to auth state changes
  onAuthStateChange(callback: (event: string, session: any) => void) {
    return supabase.auth.onAuthStateChange(callback);
  },

  // Upload avatar image
  async uploadAvatar(file: any, userId: string): Promise<string> {
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `${userId}-${Math.random()}.${fileExt}`;
      const filePath = `avatars/${fileName}`;

      const { error: uploadError } = await supabase.storage
        .from('avatars')
        .upload(filePath, file);

      if (uploadError) {
        throw new Error(uploadError.message);
      }

      const { data } = supabase.storage.from('avatars').getPublicUrl(filePath);

      return data.publicUrl;
    } catch (error: any) {
      throw new Error(error.message || 'Avatar upload failed');
    }
  },
};
