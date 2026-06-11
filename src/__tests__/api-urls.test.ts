/**
 * API Gateway integration tests.
 * Reads from .env.local — run with: npm test
 *
 * Most endpoints require a Cognito JWT, so they are skipped unless a TEST_JWT
 * env var is provided. The public /health endpoint is always tested.
 */

const TIMEOUT = 10_000;

function requireEnv(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`${name} is not set in .env.local`);
  return val;
}

// ─── ENV vars are present ─────────────────────────────────────────────────────

describe('Environment variables', () => {
  const required = [
    'NEXT_PUBLIC_API_BASE_URL',
    'NEXT_PUBLIC_API_KEY',
    'NEXT_PUBLIC_COGNITO_USER_POOL_ID',
    'NEXT_PUBLIC_COGNITO_CLIENT_ID',
  ];

  test.each(required)('%s is defined and non-empty', (key) => {
    const val = process.env[key];
    expect(val).toBeDefined();
    expect(val!.trim().length).toBeGreaterThan(0);
  });

  test('NEXT_PUBLIC_API_BASE_URL is a valid HTTPS URL', () => {
    const url = requireEnv('NEXT_PUBLIC_API_BASE_URL');
    expect(() => new URL(url)).not.toThrow();
    expect(url.startsWith('https://')).toBe(true);
  });
});

// ─── GET /health (public) ─────────────────────────────────────────────────────

describe('GET /health', () => {
  test('returns 200', async () => {
    const base = requireEnv('NEXT_PUBLIC_API_BASE_URL');
    const res = await fetch(`${base}/health`, {
      headers: { 'x-api-key': process.env.NEXT_PUBLIC_API_KEY ?? '' },
    });
    expect(res.status).toBe(200);
  }, TIMEOUT);
});

// ─── Authenticated endpoints (require TEST_JWT) ───────────────────────────────

const TEST_JWT = process.env.TEST_JWT;
const describeAuth = TEST_JWT ? describe : describe.skip;

describeAuth('GET /stories (authenticated)', () => {
  test('returns 200 and a jobs array', async () => {
    const base = requireEnv('NEXT_PUBLIC_API_BASE_URL');
    const res = await fetch(`${base}/stories`, {
      headers: {
        'x-api-key': process.env.NEXT_PUBLIC_API_KEY ?? '',
        Authorization: `Bearer ${TEST_JWT}`,
      },
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.jobs)).toBe(true);
  }, TIMEOUT);
});

describeAuth('GET /voices (authenticated)', () => {
  test('returns 200 with voices + active_voice_id', async () => {
    const base = requireEnv('NEXT_PUBLIC_API_BASE_URL');
    const res = await fetch(`${base}/voices`, {
      headers: {
        'x-api-key': process.env.NEXT_PUBLIC_API_KEY ?? '',
        Authorization: `Bearer ${TEST_JWT}`,
      },
    });
    expect(res.status).toBe(200);
    const data = await res.json();
    expect(Array.isArray(data.voices)).toBe(true);
    expect('active_voice_id' in data).toBe(true);
  }, TIMEOUT);
});
