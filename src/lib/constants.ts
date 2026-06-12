// HushTales API + Cognito configuration.
// All values come from NEXT_PUBLIC_ env vars so they are safe client-side.
// Region: ap-southeast-2 | Stack: hushtales-dev

// These are all public client-side identifiers (the API key is a rate-limit
// key, explicitly non-secret per the backend docs). Hardcoded as fallbacks so
// the deployed build always has working config even if env vars aren't wired
// up in the hosting console. Env vars still override when present.
export const API_BASE =
  process.env.NEXT_PUBLIC_API_BASE_URL ||
  'https://dhdssuo8bl.execute-api.ap-southeast-2.amazonaws.com/dev';
export const API_KEY =
  process.env.NEXT_PUBLIC_API_KEY || 'HushTalesDev2026K9mP3wRxN7sQ2vB6';

export const COGNITO_USER_POOL_ID =
  process.env.NEXT_PUBLIC_COGNITO_USER_POOL_ID || 'ap-southeast-2_etSk3HtFg';
export const COGNITO_CLIENT_ID =
  process.env.NEXT_PUBLIC_COGNITO_CLIENT_ID || '6fuinvf60q4qmkqnn99j4vj35m';
export const COGNITO_HOSTED_UI =
  process.env.NEXT_PUBLIC_COGNITO_HOSTED_UI ||
  'https://hushtales-946926531988.auth.ap-southeast-2.amazoncognito.com';

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
