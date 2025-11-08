import { supabase, Match } from '@/lib/supabase';

export type MatchDetails = {
  matchId: string;
  buddyFirstName: string;
  buddyId: string;
  buddyTrustScore: number;
  meetupLat: number;
  meetupLng: number;
  buddyStartLat: number;
  buddyStartLng: number;
  buddyDestLat: number;
  buddyDestLng: number;
  matchStatus: string;
  createdAt: string;
};

/**
 * Gets detailed information about a match for a given walk request
 */
export async function getMatchDetails(
  requestId: string
): Promise<MatchDetails | null> {
  try {
    // Find the match that includes this request
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('*')
      .or(`request_1.eq.${requestId},request_2.eq.${requestId}`)
      .single();

    if (matchError) {
      if (matchError.code === 'PGRST116') {
        // No match found
        return null;
      }
      throw new Error(`Failed to fetch match: ${matchError.message}`);
    }

    if (!match) {
      return null;
    }

    // Determine which request is the buddy's
    const buddyRequestId = match.request_1 === requestId
      ? match.request_2
      : match.request_1;

    // Fetch the buddy's request details
    const { data: buddyRequest, error: requestError } = await supabase
      .from('walk_requests')
      .select('user_id, start_lat, start_lng, dest_lat, dest_lng')
      .eq('id', buddyRequestId)
      .single();

    if (requestError || !buddyRequest) {
      throw new Error(`Failed to fetch buddy request: ${requestError?.message}`);
    }

    // Fetch the buddy's profile
    const { data: buddyProfile, error: profileError } = await supabase
      .from('profiles')
      .select('id, first_name, trust_score')
      .eq('id', buddyRequest.user_id)
      .single();

    if (profileError || !buddyProfile) {
      throw new Error(`Failed to fetch buddy profile: ${profileError?.message}`);
    }

    return {
      matchId: match.id,
      buddyFirstName: buddyProfile.first_name,
      buddyId: buddyProfile.id,
      buddyTrustScore: buddyProfile.trust_score,
      meetupLat: match.meetup_lat,
      meetupLng: match.meetup_lng,
      buddyStartLat: buddyRequest.start_lat,
      buddyStartLng: buddyRequest.start_lng,
      buddyDestLat: buddyRequest.dest_lat,
      buddyDestLng: buddyRequest.dest_lng,
      matchStatus: match.status,
      createdAt: match.created_at,
    };
  } catch (error) {
    console.error('Error in getMatchDetails:', error);
    throw error;
  }
}

/**
 * Completes a match (only if user is part of the match)
 */
export async function completeMatch(
  matchId: string,
  userId: string
): Promise<void> {
  try {
    // Fetch the match to verify user is part of it
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('request_1, request_2')
      .eq('id', matchId)
      .single();

    if (matchError || !match) {
      throw new Error(`Failed to fetch match: ${matchError?.message || 'Not found'}`);
    }

    // Check both requests to see if user owns either one
    const { data: requests, error: requestsError } = await supabase
      .from('walk_requests')
      .select('id, user_id')
      .in('id', [match.request_1, match.request_2]);

    if (requestsError || !requests) {
      throw new Error(`Failed to fetch requests: ${requestsError?.message}`);
    }

    const userOwnsRequest = requests.some(req => req.user_id === userId);

    if (!userOwnsRequest) {
      throw new Error('Unauthorized: You are not part of this match');
    }

    // Update match status to completed
    const { error: updateError } = await supabase
      .from('matches')
      .update({ status: 'completed' })
      .eq('id', matchId);

    if (updateError) {
      throw new Error(`Failed to complete match: ${updateError.message}`);
    }
  } catch (error) {
    console.error('Error in completeMatch:', error);
    throw error;
  }
}

/**
 * Cancels a match (only if user is part of the match)
 */
export async function cancelMatch(
  matchId: string,
  userId: string
): Promise<void> {
  try {
    // Fetch the match to verify user is part of it
    const { data: match, error: matchError } = await supabase
      .from('matches')
      .select('request_1, request_2')
      .eq('id', matchId)
      .single();

    if (matchError || !match) {
      throw new Error(`Failed to fetch match: ${matchError?.message || 'Not found'}`);
    }

    // Check both requests to see if user owns either one
    const { data: requests, error: requestsError } = await supabase
      .from('walk_requests')
      .select('id, user_id')
      .in('id', [match.request_1, match.request_2]);

    if (requestsError || !requests) {
      throw new Error(`Failed to fetch requests: ${requestsError?.message}`);
    }

    const userOwnsRequest = requests.some(req => req.user_id === userId);

    if (!userOwnsRequest) {
      throw new Error('Unauthorized: You are not part of this match');
    }

    // Update match status to cancelled
    const { error: updateError } = await supabase
      .from('matches')
      .update({ status: 'cancelled' })
      .eq('id', matchId);

    if (updateError) {
      throw new Error(`Failed to cancel match: ${updateError.message}`);
    }
  } catch (error) {
    console.error('Error in cancelMatch:', error);
    throw error;
  }
}

/**
 * Gets all matches for a user
 */
export async function getUserMatches(userId: string): Promise<Match[]> {
  try {
    // First get all user's walk requests
    const { data: userRequests, error: requestsError } = await supabase
      .from('walk_requests')
      .select('id')
      .eq('user_id', userId);

    if (requestsError) {
      throw new Error(`Failed to fetch user requests: ${requestsError.message}`);
    }

    if (!userRequests || userRequests.length === 0) {
      return [];
    }

    const requestIds = userRequests.map(r => r.id);

    // Fetch matches that include any of these requests
    const { data: matches, error: matchesError } = await supabase
      .from('matches')
      .select('*')
      .or(requestIds.map(id => `request_1.eq.${id},request_2.eq.${id}`).join(','))
      .order('created_at', { ascending: false });

    if (matchesError) {
      throw new Error(`Failed to fetch matches: ${matchesError.message}`);
    }

    return matches || [];
  } catch (error) {
    console.error('Error in getUserMatches:', error);
    throw error;
  }
}
