import { supabase, WalkRequest } from '@/lib/supabase';

export type CreateWalkRequestResult = {
  request: WalkRequest;
  matchFound: boolean;
  matchedRequestId?: string;
};

/**
 * Creates a new walk request and attempts to find a match
 */
export async function createWalkRequest(
  userId: string,
  startLat: number,
  startLng: number,
  destLat: number,
  destLng: number
): Promise<CreateWalkRequestResult> {
  try {
    // Insert new walk request
    const { data: walkRequest, error: insertError } = await supabase
      .from('walk_requests')
      .insert({
        user_id: userId,
        start_lat: startLat,
        start_lng: startLng,
        dest_lat: destLat,
        dest_lng: destLng,
        status: 'waiting',
        expires_at: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes from now
      })
      .select()
      .single();

    if (insertError) {
      throw new Error(`Failed to create walk request: ${insertError.message}`);
    }

    if (!walkRequest) {
      throw new Error('Walk request created but no data returned');
    }

    // Try to find a match immediately
    const matchedRequestId = await findMatch(
      walkRequest.id,
      startLat,
      startLng,
      destLat,
      destLng
    );

    return {
      request: walkRequest,
      matchFound: matchedRequestId !== null,
      matchedRequestId: matchedRequestId || undefined,
    };
  } catch (error) {
    console.error('Error in createWalkRequest:', error);
    throw error;
  }
}

/**
 * Attempts to find a match for a walk request using the Supabase RPC function
 * Returns the matched request ID if found, null otherwise
 */
export async function findMatch(
  requestId: string,
  startLat: number,
  startLng: number,
  destLat: number,
  destLng: number
): Promise<string | null> {
  try {
    const { data, error } = await supabase.rpc('find_walk_buddy', {
      p_request_id: requestId,
      p_start_lat: startLat,
      p_start_lng: startLng,
      p_dest_lat: destLat,
      p_dest_lng: destLng,
    });

    if (error) {
      throw new Error(`Failed to find match: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in findMatch:', error);
    throw error;
  }
}

/**
 * Cancels a walk request (only if user owns the request)
 */
export async function cancelRequest(
  requestId: string,
  userId: string
): Promise<void> {
  try {
    // First verify the user owns this request
    const { data: request, error: fetchError } = await supabase
      .from('walk_requests')
      .select('user_id')
      .eq('id', requestId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch request: ${fetchError.message}`);
    }

    if (!request) {
      throw new Error('Request not found');
    }

    if (request.user_id !== userId) {
      throw new Error('Unauthorized: You can only cancel your own requests');
    }

    // Update status to cancelled
    const { error: updateError } = await supabase
      .from('walk_requests')
      .update({ status: 'cancelled' })
      .eq('id', requestId);

    if (updateError) {
      throw new Error(`Failed to cancel request: ${updateError.message}`);
    }
  } catch (error) {
    console.error('Error in cancelRequest:', error);
    throw error;
  }
}

/**
 * Confirms meetup and marks request as completed
 * Also updates associated match to 'active' status
 */
export async function confirmMeetup(
  requestId: string,
  userId: string
): Promise<void> {
  try {
    // Verify user owns this request
    const { data: request, error: fetchError } = await supabase
      .from('walk_requests')
      .select('user_id, status')
      .eq('id', requestId)
      .single();

    if (fetchError) {
      throw new Error(`Failed to fetch request: ${fetchError.message}`);
    }

    if (!request) {
      throw new Error('Request not found');
    }

    if (request.user_id !== userId) {
      throw new Error('Unauthorized: You can only confirm your own requests');
    }

    if (request.status !== 'matched') {
      throw new Error('Can only confirm matched requests');
    }

    // Update request status to completed
    const { error: updateRequestError } = await supabase
      .from('walk_requests')
      .update({ status: 'completed' })
      .eq('id', requestId);

    if (updateRequestError) {
      throw new Error(`Failed to update request: ${updateRequestError.message}`);
    }

    // Find and update associated match to active
    const { data: match, error: matchFetchError } = await supabase
      .from('matches')
      .select('id')
      .or(`request_1.eq.${requestId},request_2.eq.${requestId}`)
      .single();

    if (matchFetchError || !match) {
      console.warn('Could not find associated match to update');
      return;
    }

    const { error: updateMatchError } = await supabase
      .from('matches')
      .update({ status: 'active' })
      .eq('id', match.id);

    if (updateMatchError) {
      throw new Error(`Failed to update match: ${updateMatchError.message}`);
    }
  } catch (error) {
    console.error('Error in confirmMeetup:', error);
    throw error;
  }
}

/**
 * Gets the current status of a walk request
 */
export async function getRequestStatus(
  requestId: string
): Promise<WalkRequest | null> {
  try {
    const { data, error } = await supabase
      .from('walk_requests')
      .select('*')
      .eq('id', requestId)
      .single();

    if (error) {
      throw new Error(`Failed to fetch request status: ${error.message}`);
    }

    return data;
  } catch (error) {
    console.error('Error in getRequestStatus:', error);
    throw error;
  }
}
