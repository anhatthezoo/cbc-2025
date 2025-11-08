import 'react-native-url-polyfill/auto';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.EXPO_PUBLIC_SUPABASE_URL!;
const supabaseAnonKey = process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY!;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('Missing Supabase environment variables');
}

export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    autoRefreshToken: true,
    persistSession: true,
    detectSessionInUrl: false,
  },
});

// Database types for TypeScript
export type Profile = {
  id: string;
  email: string;
  first_name: string;
  created_at: string;
  trust_score: number;
  is_banned: boolean;
};

export type WalkRequest = {
  id: string;
  user_id: string;
  start_lat: number;
  start_lng: number;
  dest_lat: number;
  dest_lng: number;
  status: 'waiting' | 'matched' | 'expired' | 'cancelled';
  matched_with: string | null;
  created_at: string;
  expires_at: string;
};

export type Match = {
  id: string;
  request_1: string;
  request_2: string;
  meetup_lat: number;
  meetup_lng: number;
  status: 'pending' | 'active' | 'completed' | 'cancelled';
  created_at: string;
};

export type Report = {
  id: string;
  reporter_id: string;
  reported_user_id: string;
  match_id: string | null;
  reason: string;
  details: string | null;
  created_at: string;
};
