import { supabase, WalkRequest, Match } from '@/lib/supabase';
import { RealtimeChannel } from '@supabase/supabase-js';

export type UnsubscribeFunction = () => void;

export type WalkRequestUpdatePayload = {
  eventType: 'UPDATE' | 'INSERT' | 'DELETE';
  old: Partial<WalkRequest>;
  new: WalkRequest;
};

export type MatchUpdatePayload = {
  eventType: 'UPDATE' | 'INSERT' | 'DELETE';
  old: Partial<Match>;
  new: Match;
};

/**
 * Subscribes to real-time updates for a specific walk request
 * Calls the onMatch callback when the request status changes to 'matched'
 * Returns an unsubscribe function to clean up the subscription
 */
export function subscribeToWalkRequest(
  requestId: string,
  onMatch: (request: WalkRequest) => void,
  onUpdate?: (request: WalkRequest) => void
): UnsubscribeFunction {
  let channel: RealtimeChannel;

  try {
    channel = supabase
      .channel(`walk_request:${requestId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'walk_requests',
          filter: `id=eq.${requestId}`,
        },
        (payload) => {
          const updatedRequest = payload.new as WalkRequest;

          // Call the general update callback if provided
          if (onUpdate) {
            onUpdate(updatedRequest);
          }

          // Call onMatch callback if status changed to matched
          if (updatedRequest.status === 'matched') {
            onMatch(updatedRequest);
          }
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to walk request ${requestId}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`Error subscribing to walk request ${requestId}`);
        }
      });

    // Return unsubscribe function
    return () => {
      console.log(`Unsubscribing from walk request ${requestId}`);
      supabase.removeChannel(channel);
    };
  } catch (error) {
    console.error('Error in subscribeToWalkRequest:', error);
    // Return no-op function if subscription failed
    return () => {};
  }
}

/**
 * Subscribes to real-time updates for a specific match
 * Calls the onUpdate callback whenever the match is updated
 * Returns an unsubscribe function to clean up the subscription
 */
export function subscribeToMatch(
  matchId: string,
  onUpdate: (match: Match) => void
): UnsubscribeFunction {
  let channel: RealtimeChannel;

  try {
    channel = supabase
      .channel(`match:${matchId}`)
      .on(
        'postgres_changes',
        {
          event: 'UPDATE',
          schema: 'public',
          table: 'matches',
          filter: `id=eq.${matchId}`,
        },
        (payload) => {
          const updatedMatch = payload.new as Match;
          onUpdate(updatedMatch);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to match ${matchId}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`Error subscribing to match ${matchId}`);
        }
      });

    // Return unsubscribe function
    return () => {
      console.log(`Unsubscribing from match ${matchId}`);
      supabase.removeChannel(channel);
    };
  } catch (error) {
    console.error('Error in subscribeToMatch:', error);
    // Return no-op function if subscription failed
    return () => {};
  }
}

/**
 * Subscribes to all walk requests for a specific user
 * Useful for listening to updates on any of the user's requests
 */
export function subscribeToUserRequests(
  userId: string,
  onUpdate: (request: WalkRequest) => void
): UnsubscribeFunction {
  let channel: RealtimeChannel;

  try {
    channel = supabase
      .channel(`user_requests:${userId}`)
      .on(
        'postgres_changes',
        {
          event: '*', // Listen to all events (INSERT, UPDATE, DELETE)
          schema: 'public',
          table: 'walk_requests',
          filter: `user_id=eq.${userId}`,
        },
        (payload) => {
          const request = payload.new as WalkRequest;
          onUpdate(request);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED') {
          console.log(`Subscribed to user requests for ${userId}`);
        } else if (status === 'CHANNEL_ERROR') {
          console.error(`Error subscribing to user requests for ${userId}`);
        }
      });

    // Return unsubscribe function
    return () => {
      console.log(`Unsubscribing from user requests for ${userId}`);
      supabase.removeChannel(channel);
    };
  } catch (error) {
    console.error('Error in subscribeToUserRequests:', error);
    // Return no-op function if subscription failed
    return () => {};
  }
}

/**
 * Subscribes to matches involving a specific user
 * Listens for new matches or updates to existing matches
 */
export function subscribeToUserMatches(
  userId: string,
  onUpdate: (match: Match) => void
): UnsubscribeFunction {
  let channel: RealtimeChannel;

  try {
    // First, get all request IDs for this user
    supabase
      .from('walk_requests')
      .select('id')
      .eq('user_id', userId)
      .then(({ data: requests }) => {
        if (!requests || requests.length === 0) {
          console.warn('No requests found for user');
          return;
        }

        const requestIds = requests.map(r => r.id);

        // Subscribe to matches involving any of these requests
        channel = supabase
          .channel(`user_matches:${userId}`)
          .on(
            'postgres_changes',
            {
              event: '*',
              schema: 'public',
              table: 'matches',
            },
            (payload) => {
              const match = payload.new as Match;
              // Only trigger callback if this match involves the user's requests
              if (
                requestIds.includes(match.request_1) ||
                requestIds.includes(match.request_2)
              ) {
                onUpdate(match);
              }
            }
          )
          .subscribe((status) => {
            if (status === 'SUBSCRIBED') {
              console.log(`Subscribed to user matches for ${userId}`);
            } else if (status === 'CHANNEL_ERROR') {
              console.error(`Error subscribing to user matches for ${userId}`);
            }
          });
      });

    // Return unsubscribe function
    return () => {
      if (channel) {
        console.log(`Unsubscribing from user matches for ${userId}`);
        supabase.removeChannel(channel);
      }
    };
  } catch (error) {
    console.error('Error in subscribeToUserMatches:', error);
    // Return no-op function if subscription failed
    return () => {};
  }
}
