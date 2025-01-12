import { createContext, useContext } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from './supabase';
import { Database } from '../types/database';

export type UserProfile = Database['public']['Tables']['users']['Row'];

export type AuthContextType = {
  user: User | null;
  profile: UserProfile | null;
  isLoading: boolean;
  signUp: (email: string, password: string, role: UserProfile['user_role']) => Promise<UserProfile>;
  signIn: (email: string, password: string) => Promise<UserProfile>;
  signOut: () => Promise<void>;
  resetPassword: (email: string) => Promise<void>;
  updateProfile: (data: Partial<UserProfile>) => Promise<void>;
};

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export async function signUp(email: string, password: string, role: UserProfile['user_role']): Promise<UserProfile> {
  const { data: auth, error: signUpError } = await supabase.auth.signUp({
    email,
    password
  });

  if (signUpError) throw signUpError;
  if (!auth.user) throw new Error('No user returned from signup');

  // Create user profile
  const { error: profileError } = await supabase
    .from('users')
    .insert([
      {
        user_id: auth.user.id,
        email: auth.user.email!,
        user_role: role,
        account_status: 'active',
        phone_number: null,
        first_name: null,
        last_name: null,
        profile_image_url: null,
        street_address: null,
        city: null,
        state: null,
        zip_code: null
      }
    ]);

  if (profileError) {
    // Rollback auth signup if profile creation fails
    await supabase.auth.signOut();
    throw profileError;
  }

  // Wait a moment for the database to propagate
  await new Promise(resolve => setTimeout(resolve, 1000));

  // Fetch the created profile
  const { data: profile, error: fetchError } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', auth.user.id)
    .single();

  if (fetchError) {
    await supabase.auth.signOut();
    throw new Error('Failed to fetch user profile after creation');
  }

  if (!profile) {
    await supabase.auth.signOut();
    throw new Error('No profile found after creation');
  }

  return profile;
}

export async function signIn(email: string, password: string): Promise<UserProfile> {
  console.log('Starting signIn process');
  const { data: { user }, error } = await supabase.auth.signInWithPassword({
    email,
    password,
  });

  if (error) {
    console.error('Auth error:', error);
    throw error;
  }
  
  if (!user) throw new Error('No user returned from sign in');
  console.log('User authenticated:', user.id);
  
  // Fetch the user profile after successful sign in
  const { data: profile, error: profileError } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', user.id)
    .single();

  if (profileError) {
    console.error('Profile fetch error:', profileError);
    throw profileError;
  }
  
  if (!profile) {
    console.error('No profile found for user:', user.id);
    throw new Error('No profile found for user');
  }

  console.log('Profile fetched successfully:', profile);

  return profile;
}

export async function signOut() {
  const { error } = await supabase.auth.signOut();
  if (error) throw error;
}

export async function resetPassword(email: string) {
  const { error } = await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${window.location.origin}/reset-password`,
  });

  if (error) throw error;
}

export async function updateProfile(userId: string, data: Partial<UserProfile>) {
  const { error } = await supabase
    .from('users')
    .update(data)
    .eq('user_id', userId);

  if (error) throw error;
}

export async function getUserProfile(userId: string) {
  const { data, error } = await supabase
    .from('users')
    .select('*')
    .eq('user_id', userId)
    .single();

  if (error) throw error;
  return data as UserProfile;
}