# WalkBuddy Backend Services

Backend business logic for the WalkBuddy campus safety app. All services are TypeScript-ready with full type definitions.

## Quick Start

```typescript
import {
  createWalkRequest,
  getMatchDetails,
  submitReport,
  subscribeToWalkRequest,
  getCurrentUser,
} from '@/lib/services';
```

## Services Overview

### 1. Authentication (`auth.ts`)

Handle user authentication and profile management.

```typescript
// Sign in with magic link
await sendMagicLink('user@example.com');

// Sign in with password
const { user, session, profile } = await signInWithPassword(
  'user@example.com',
  'password123'
);

// Sign up new user
const { user, session, profile } = await signUpWithPassword(
  'user@example.com',
  'password123',
  'John'
);

// Get current user
const currentUser = await getCurrentUser();

// Sign out
await signOut();

// Listen for auth state changes
const unsubscribe = onAuthStateChange((user, session) => {
  console.log('Auth state changed:', user);
});
```

### 2. Walk Requests (`walkRequest.ts`)

Create and manage walk requests.

```typescript
// Create a walk request (automatically tries to find match)
const { request, matchFound, matchedRequestId } = await createWalkRequest(
  userId,
  37.7749, // start latitude
  -122.4194, // start longitude
  37.7849, // destination latitude
  -122.4294  // destination longitude
);

if (matchFound) {
  console.log('Match found!', matchedRequestId);
}

// Manually try to find match
const matchedId = await findMatch(requestId, startLat, startLng, destLat, destLng);

// Cancel a request
await cancelRequest(requestId, userId);

// Confirm meetup (marks as completed, activates match)
await confirmMeetup(requestId, userId);

// Get request status
const request = await getRequestStatus(requestId);
```

### 3. Matches (`match.ts`)

Get and manage match details.

```typescript
// Get match details for a request
const details = await getMatchDetails(requestId);
if (details) {
  console.log('Buddy:', details.buddyFirstName);
  console.log('Meetup:', details.meetupLat, details.meetupLng);
  console.log('Trust Score:', details.buddyTrustScore);
}

// Complete a match
await completeMatch(matchId, userId);

// Cancel a match
await cancelMatch(matchId, userId);

// Get all user's matches
const matches = await getUserMatches(userId);
```

### 4. Reports (`report.ts`)

Submit reports and analyze user safety with AI.

```typescript
// Submit a report
const report = await submitReport(
  reporterId,
  reportedUserId,
  matchId,
  'Inappropriate behavior',
  'User was acting suspicious...'
);

// This automatically:
// 1. Decreases reported user's trust score by 10
// 2. Triggers AI analysis if user has 2+ reports

// Manually analyze user safety (calls Claude AI)
const analysis = await analyzeUserSafety(userId);
if (analysis && analysis.shouldBan) {
  console.log('User should be banned:', analysis.reasoning);
  console.log('Patterns:', analysis.patterns);
}

// Get reports by reporter
const myReports = await getReportsByReporter(userId);

// Get reports against a user
const reports = await getReportsAgainstUser(userId);
```

### 5. Realtime (`realtime.ts`)

Subscribe to real-time updates via Supabase.

```typescript
// Subscribe to walk request updates
const unsubscribe = subscribeToWalkRequest(
  requestId,
  (request) => {
    // Called when request gets matched
    console.log('Match found!', request);
  },
  (request) => {
    // Optional: called on any update
    console.log('Request updated:', request.status);
  }
);

// Later, cleanup
unsubscribe();

// Subscribe to match updates
const unsubMatch = subscribeToMatch(matchId, (match) => {
  console.log('Match status:', match.status);
});

// Subscribe to all user's requests
const unsubRequests = subscribeToUserRequests(userId, (request) => {
  console.log('User request updated:', request);
});

// Subscribe to all user's matches
const unsubMatches = subscribeToUserMatches(userId, (match) => {
  console.log('User match updated:', match);
});
```

## Error Handling

All services include try/catch error handling and throw descriptive errors:

```typescript
try {
  await createWalkRequest(userId, lat, lng, destLat, destLng);
} catch (error) {
  console.error('Failed to create request:', error.message);
  // Show user-friendly error message
}
```

## TypeScript Types

All services export TypeScript types:

```typescript
import type {
  CreateWalkRequestResult,
  MatchDetails,
  SafetyAnalysis,
  AuthUser,
  UnsubscribeFunction,
} from '@/lib/services';
```

## Environment Variables

Make sure to set these in your `.env` file:

```bash
EXPO_PUBLIC_SUPABASE_URL=your-supabase-url
EXPO_PUBLIC_SUPABASE_ANON_KEY=your-supabase-anon-key
EXPO_PUBLIC_ANTHROPIC_API_KEY=your-anthropic-api-key
```

## Database Setup

1. Run the SQL migration in `supabase-migration.sql` in your Supabase SQL Editor
2. This creates all tables, RLS policies, and functions
3. The `find_walk_buddy()` function handles matching logic:
   - Finds users within 0.3 miles of start location
   - Finds users within 0.2 miles of destination
   - Only matches users with trust_score > 50 and is_banned = false
   - Calculates midpoint for meetup

## Key Features

- **Automatic Matching**: `createWalkRequest()` automatically tries to find a match
- **Real-time Updates**: Subscribe to live updates on requests and matches
- **AI Safety Analysis**: Claude AI analyzes user reports and recommends bans
- **Trust Scoring**: Reports decrease trust scores, low scores prevent matching
- **Type Safety**: Full TypeScript support with exported types
- **Error Handling**: Comprehensive try/catch with descriptive errors
- **Security**: RLS policies ensure users can only access their own data
