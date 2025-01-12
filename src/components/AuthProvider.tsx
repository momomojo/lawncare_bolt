import React, { createContext, useEffect, useState } from 'react';
import { User } from '@supabase/supabase-js';
import { supabase } from '../lib/supabase';
import { AuthContext, UserProfile, signUp, signIn, signOut, resetPassword, updateProfile, getUserProfile } from '../lib/auth';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    async function initializeAuth() {
      try {
        console.log('Initializing auth...');
        const { data: { session } } = await supabase.auth.getSession();
        console.log('Got session:', session?.user?.id);
        setUser(session?.user ?? null);
        
        if (session?.user) {
          try {
            const profile = await getUserProfile(session.user.id);
            console.log('Got profile:', profile);
            setProfile(profile);
          } catch (error) {
            console.error('Error fetching initial profile:', error);
            setProfile(null);
          }
        }
      } catch (error) {
        console.error('Error initializing auth:', error);
      } finally {
        setIsLoading(false);
      }
    }

    initializeAuth();

    // Listen for auth changes
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event, session?.user?.id);
      setUser(session?.user ?? null);
      setIsLoading(true);
      
      if (session?.user) {
        try {
          const profile = await getUserProfile(session.user.id);
          console.log('Profile updated on auth change:', profile);
          setProfile(profile);
        } catch (error) {
          console.error('Error fetching user profile:', error);
          setProfile(null);
        }
      } else {
        console.log('No session, clearing profile');
        setProfile(null);
      }
      setIsLoading(false);
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  const value = {
    user,
    profile,
    isLoading,
    signUp: async (email: string, password: string, role: UserProfile['user_role']): Promise<UserProfile> => {
      setIsLoading(true);
      try {
        const profile = await signUp(email, password, role);
        setProfile(profile);
        return profile;
      } finally {
        setIsLoading(false);
      }
    },
    signIn: async (email: string, password: string): Promise<UserProfile> => {
      setIsLoading(true);
      try {
        const profile = await signIn(email, password);
        setProfile(profile);
        return profile;
      } finally {
        setIsLoading(false);
      }
    },
    signOut: async () => {
      setIsLoading(true);
      try {
        await signOut();
        setUser(null);
        setProfile(null);
      } finally {
        setIsLoading(false);
      }
    },
    resetPassword: async (email: string) => {
      await resetPassword(email);
    },
    updateProfile: async (data: Partial<UserProfile>) => {
      if (!user) throw new Error('No user logged in');
      await updateProfile(user.id, data);
      setProfile(prev => prev ? { ...prev, ...data } : null);
    },
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}