// Lambda Function URLs — ap-southeast-2, stack: hushtales-dev
// All values come from NEXT_PUBLIC_ env vars so they are safe to use client-side.

export const STORY_GENERATOR_URL = process.env.NEXT_PUBLIC_STORY_GENERATOR_URL ?? '';
export const SUBMIT_URL = process.env.NEXT_PUBLIC_SUBMIT_URL ?? '';
export const GET_JOBS_URL = process.env.NEXT_PUBLIC_GET_JOBS_URL ?? '';
export const LIST_VOICES_URL = process.env.NEXT_PUBLIC_LIST_VOICES_URL ?? '';
export const CHECK_VOICE_URL = process.env.NEXT_PUBLIC_CHECK_VOICE_URL ?? '';
export const GET_UPLOAD_URL = process.env.NEXT_PUBLIC_GET_UPLOAD_URL ?? '';
export const DELETE_VOICE_URL = process.env.NEXT_PUBLIC_DELETE_VOICE_URL ?? '';

// Hardcoded until Cognito auth is wired up — swap to JWT claim when auth is ready
export const ACTIVE_USER_ID = process.env.NEXT_PUBLIC_ACTIVE_USER_ID ?? 'user_test_001';
