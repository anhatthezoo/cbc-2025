import { supabase, Profile } from '@/lib/supabase';
import { User, Session } from '@supabase/supabase-js';

export type AuthUser = {
  user: User;
  session: Session;
  profile?: Profile;
};

/**
 * Sends a magic link to the user's email for passwordless authentication
 */
export async function sendMagicLink(email: string): Promise<void> {
  try {
    const { error } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: 'cbc2025://auth/callback',
      },
    });

    if (error) {
      throw new Error(`Failed to send magic link: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in sendMagicLink:', error);
    throw error;
  }
}

/**
 * Signs in with email and password
 */
export async function signInWithPassword(
  email: string,
  password: string
): Promise<AuthUser> {
  try {
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      throw new Error(`Failed to sign in: ${error.message}`);
    }

    if (!data.user || !data.session) {
      throw new Error('No user or session returned');
    }

    // Fetch user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    return {
      user: data.user,
      session: data.session,
      profile: profile || undefined,
    };
  } catch (error) {
    console.error('Error in signInWithPassword:', error);
    throw error;
  }
}

/**
 * Signs up a new user with email and password
 */
export async function signUpWithPassword(
  email: string,
  password: string,
  firstName: string
): Promise<AuthUser> {
  try {
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          first_name: firstName,
        },
      },
    });

    if (error) {
      throw new Error(`Failed to sign up: ${error.message}`);
    }

    if (!data.user || !data.session) {
      throw new Error('No user or session returned');
    }

    // Profile should be created automatically by trigger
    // Wait a bit and then fetch it
    await new Promise(resolve => setTimeout(resolve, 1000));

    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    return {
      user: data.user,
      session: data.session,
      profile: profile || undefined,
    };
  } catch (error) {
    console.error('Error in signUpWithPassword:', error);
    throw error;
  }
}

/**
 * Gets the currently authenticated user and their profile
 */
export async function getCurrentUser(): Promise<AuthUser | null> {
  try {
    const { data: { user }, error: userError } = await supabase.auth.getUser();

    if (userError || !user) {
      return null;
    }

    const { data: { session }, error: sessionError } = await supabase.auth.getSession();

    if (sessionError || !session) {
      return null;
    }

    // Fetch user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    return {
      user,
      session,
      profile: profile || undefined,
    };
  } catch (error) {
    console.error('Error in getCurrentUser:', error);
    return null;
  }
}

/**
 * Signs out the current user
 */
export async function signOut(): Promise<void> {
  try {
    const { error } = await supabase.auth.signOut();

    if (error) {
      throw new Error(`Failed to sign out: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in signOut:', error);
    throw error;
  }
}

/**
 * Updates the user's profile information
 */
export async function updateProfile(
  userId: string,
  updates: Partial<Pick<Profile, 'first_name' | 'email'>>
): Promise<Profile> {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .update(updates)
      .eq('id', userId)
      .select()
      .single();

    if (error || !profile) {
      throw new Error(`Failed to update profile: ${error?.message}`);
    }

    return profile;
  } catch (error) {
    console.error('Error in updateProfile:', error);
    throw error;
  }
}

/**
 * Gets a user's profile by their ID
 */
export async function getUserProfile(userId: string): Promise<Profile | null> {
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Profile not found
        return null;
      }
      throw new Error(`Failed to fetch profile: ${error.message}`);
    }

    return profile;
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    throw error;
  }
}

/**
 * Sets up an auth state change listener
 * Returns an unsubscribe function
 */
export function onAuthStateChange(
  callback: (user: User | null, session: Session | null) => void
): () => void {
  const { data } = supabase.auth.onAuthStateChange((event, session) => {
    callback(session?.user || null, session);
  });

  return data.subscription.unsubscribe;
}

/**
 * Verifies OTP code for magic link authentication
 */
export async function verifyOtp(
  email: string,
  token: string
): Promise<AuthUser> {
  try {
    const { data, error } = await supabase.auth.verifyOtp({
      email,
      token,
      type: 'email',
    });

    if (error) {
      throw new Error(`Failed to verify OTP: ${error.message}`);
    }

    if (!data.user || !data.session) {
      throw new Error('No user or session returned');
    }

    // Fetch user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', data.user.id)
      .single();

    return {
      user: data.user,
      session: data.session,
      profile: profile || undefined,
    };
  } catch (error) {
    console.error('Error in verifyOtp:', error);
    throw error;
  }
}
