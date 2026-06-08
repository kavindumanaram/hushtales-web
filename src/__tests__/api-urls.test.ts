/**
 * Lambda URL integration tests.
 * Reads from .env.local — run with: npm test
 */

const TIMEOUT = 10_000;

function requireUrl(name: string): string {
  const val = process.env[name];
  if (!val) throw new Error(`${name} is not set in .env.local`);
  return val;
}

// ─── ENV vars are present ─────────────────────────────────────────────────────

describe('Environment variables', () => {
  const required = [
    'NEXT_PUBLIC_SUBMIT_URL',
    'NEXT_PUBLIC_GET_JOBS_URL',
    'NEXT_PUBLIC_LIST_VOICES_URL',
    'NEXT_PUBLIC_GET_UPLOAD_URL',
    'NEXT_PUBLIC_DELETE_VOICE_URL',
    'NEXT_PUBLIC_ACTIVE_USER_ID',
  ];

  test.each(required)('%s is defined and non-empty', (key) => {
    const val = process.env[key];
    expect(val).toBeDefined();
    expect(val!.trim().length).toBeGreaterThan(0);
  });

  test('NEXT_PUBLIC_GET_JOBS_URL is a valid HTTPS URL', () => {
    const url = requireUrl('NEXT_PUBLIC_GET_JOBS_URL');
    expect(() => new URL(url)).not.toThrow();
    expect(url.startsWith('https://')).toBe(true);
  });
});

// ─── GET /jobs ────────────────────────────────────────────────────────────────

describe('GET_JOBS_URL', () => {
  test('returns 200 and a JSON array', async () => {
    const url = requireUrl('NEXT_PUBLIC_GET_JOBS_URL');
    const res = await fetch(url);
    expect(res.status).toBe(200);
    expect(res.headers.get('content-type')).toContain('application/json');

    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  }, TIMEOUT);

  test('each job has required fields', async () => {
    const url = requireUrl('NEXT_PUBLIC_GET_JOBS_URL');
    const res = await fetch(url);
    const jobs: unknown[] = await res.json();

    if (jobs.length === 0) return; // no data yet — skip shape check

    const job = jobs[0] as Record<string, unknown>;
    expect(typeof job.job_id).toBe('string');
    expect(typeof job.user_id).toBe('string');
    expect(typeof job.status).toBe('string');
    expect(typeof job.created_at).toBe('string');
  }, TIMEOUT);
});

// ─── GET /list-voices ─────────────────────────────────────────────────────────

describe('LIST_VOICES_URL', () => {
  test('returns 200 and a JSON array', async () => {
    const url = requireUrl('NEXT_PUBLIC_LIST_VOICES_URL');
    const res = await fetch(url);
    expect(res.status).toBe(200);

    const data = await res.json();
    expect(Array.isArray(data)).toBe(true);
  }, TIMEOUT);
});

// ─── GET /get-upload-url ──────────────────────────────────────────────────────

describe('GET_UPLOAD_URL', () => {
  test('returns upload_url and s3_key for active user', async () => {
    const base = requireUrl('NEXT_PUBLIC_GET_UPLOAD_URL');
    const userId = process.env.NEXT_PUBLIC_ACTIVE_USER_ID ?? 'user_test_001';
    const url = `${base}?user_id=${encodeURIComponent(userId)}`;

    const res = await fetch(url);
    expect(res.status).toBe(200);

    const data = await res.json() as Record<string, unknown>;
    expect(typeof data.upload_url).toBe('string');
    expect(typeof data.s3_key).toBe('string');
    expect((data.upload_url as string).startsWith('https://')).toBe(true);
  }, TIMEOUT);
});

// ─── CORS ─────────────────────────────────────────────────────────────────────

describe('CORS headers', () => {
  test('GET_JOBS_URL allows localhost origin', async () => {
    const url = requireUrl('NEXT_PUBLIC_GET_JOBS_URL');
    const res = await fetch(url, {
      headers: { Origin: 'http://localhost:3000' },
    });
    const allowOrigin = res.headers.get('access-control-allow-origin');
    expect(allowOrigin).not.toBeNull();
  }, TIMEOUT);
});
