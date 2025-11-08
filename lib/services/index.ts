/**
 * WalkBuddy Services
 *
 * Backend business logic for the WalkBuddy campus safety app
 *
 * Usage:
 * import { createWalkRequest, getMatchDetails, submitReport } from '@/lib/services';
 */

// Walk Request Services
export {
  createWalkRequest,
  findMatch,
  cancelRequest,
  confirmMeetup,
  getRequestStatus,
} from './walkRequest';
export type { CreateWalkRequestResult } from './walkRequest';

// Match Services
export {
  getMatchDetails,
  completeMatch,
  cancelMatch,
  getUserMatches,
} from './match';
export type { MatchDetails } from './match';

// Report Services
export {
  submitReport,
  analyzeUserSafety,
  getReportsByReporter,
  getReportsAgainstUser,
} from './report';
export type { SafetyAnalysis } from './report';

// Realtime Services
export {
  subscribeToWalkRequest,
  subscribeToMatch,
  subscribeToUserRequests,
  subscribeToUserMatches,
} from './realtime';
export type { UnsubscribeFunction, WalkRequestUpdatePayload, MatchUpdatePayload } from './realtime';

// Auth Services
export {
  sendMagicLink,
  signInWithPassword,
  signUpWithPassword,
  getCurrentUser,
  signOut,
  updateProfile,
  getUserProfile,
  onAuthStateChange,
  verifyOtp,
} from './auth';
export type { AuthUser } from './auth';
