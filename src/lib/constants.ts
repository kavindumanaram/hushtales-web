// HushTales API + Cognito configuration.
// All values come from NEXT_PUBLIC_ env vars so they are safe client-side.
// Region: ap-southeast-2 | Stack: hushtales-dev

export const API_BASE = process.env.NEXT_PUBLIC_API_BASE_URL ?? '';
export const API_KEY = process.env.NEXT_PUBLIC_API_KEY ?? '';

export const COGNITO_USER_POOL_ID = process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID ?? '';
export const COGNITO_CLIENT_ID = process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID ?? '';
export const COGNITO_HOSTED_UI = process.env.NEXT_PUBLIC_COGNITO_HOSTED_UI ?? '';

// Single source of truth for all API paths. Composed with API_BASE at call time.
export const API_ROUTES = {
  health: '/health',
  voices: '/voices',
  voicesUploadUrl: '/voices/upload-url',
  voicesCheck: '/voices/check',
  voicesActive: '/voices/active',
  storiesGenerate: '/stories/generate',
  storiesSubmit: '/stories/submit',
  stories: '/stories',
  characters: '/characters',
  usersMe: '/users/me',
  pushSubscribe: '/push/subscribe',
} as const;
