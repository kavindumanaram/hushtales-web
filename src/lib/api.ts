// All backend communication lives here. Components and hooks call these
// functions — never fetch() directly.
//
// Every authenticated request flows through request(), the single place that
// injects the Cognito JWT. Swapping the auth mechanism = changing one function.

import { API_BASE, API_KEY, API_ROUTES } from './constants';
import { getIdToken } from './auth';

// ─── Error type ────────────────────────────────────────────────────────────

export class ApiError extends Error {
  constructor(
    public readonly status: number,
    message: string
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

/** True for 401 errors — callers use this to redirect to /auth/login. */
export function isUnauthorized(error: unknown): boolean {
  return error instanceof ApiError && error.status === 401;
}

// ─── Types ───────────────────────────────────────────────────────────────────

export interface StoryJob {
  job_id: string;
  user_id: string;
  status: string;
  script_text: string;
  cloudfront_url: string;
  created_at: string;
  title?: string;
  theme?: string;
  age_group?: string;
  tone?: string;
  character_name?: string;
  length?: string;
  thumbnail_url?: string;
}

export interface Voice {
  user_id: string;
  voice_id: string;
  status: string;
  heygen_voice_id: string | null;
  audio_s3_key?: string;
  created_at: string;
  updated_at?: string;
  error_message?: string;
}

export interface ListVoicesResponse {
  voices: Voice[];
  active_voice_id: string | null;
}

export interface UploadUrlResponse {
  upload_url: string;
  s3_key: string;
  voice_id: string;
}

export interface CheckVoiceResponse {
  user_id: string;
  voice_id: string;
  status: string;
  heygen_voice_id: string | null;
}

export interface Character {
  character_id: string;
  user_id: string;
  name: string;
  appearance: string;
  personality?: string;
  created_at: string;
  updated_at?: string;
}

export interface UserProfile {
  user_id: string;
  email: string;
  pin_hash: string | null;
  created_at: string;
}

export interface GenerateStoryRequest {
  theme: string;
  character_name?: string;
  child_name?: string;
  age_group?: string;
  tone?: string;
  length?: string;
}

export interface GenerateStoryResponse {
  title: string;
  script_text: string;
  word_count: number;
  theme?: string;
  age_group?: string;
  tone?: string;
  length?: string;
}

export interface SubmitJobRequest {
  script_text: string;
  title?: string;
  theme?: string;
  age_group?: string;
  tone?: string;
  length?: string;
  character_id?: string;
  character_name?: string;
}

export interface SubmitJobResponse {
  job_id: string;
}

// ─── Core request helper ───────────────────────────────────────────────────

interface RequestOptions {
  method?: string;
  body?: unknown;
  params?: Record<string, string | undefined>;
  auth?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = 'GET', body, params, auth = true } = options;

  const headers: Record<string, string> = { 'x-api-key': API_KEY };

  if (auth) {
    const token = await getIdToken();
    if (!token) throw new ApiError(401, 'Not authenticated');
    headers['Authorization'] = `Bearer ${token}`;
  }

  if (body !== undefined) headers['Content-Type'] = 'application/json';

  let url = `${API_BASE}${path}`;
  if (params) {
    const entries = Object.entries(params).filter(
      ([, v]) => v !== undefined
    ) as [string, string][];
    const qs = new URLSearchParams(entries).toString();
    if (qs) url += `?${qs}`;
  }

  const res = await fetch(url, {
    method,
    headers,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return undefined as T;

  let data: unknown = null;
  try {
    data = await res.json();
  } catch {
    // non-JSON body
  }

  if (!res.ok) {
    const message =
      data && typeof data === 'object' && 'message' in data && typeof data.message === 'string'
        ? data.message
        : `Request failed: ${res.status}`;
    throw new ApiError(res.status, message);
  }

  return data as T;
}

// ─── Health ──────────────────────────────────────────────────────────────────

export function checkHealth() {
  return request<{ status: string }>(API_ROUTES.health, { auth: false });
}

// ─── Stories ─────────────────────────────────────────────────────────────────

export function generateStory(body: GenerateStoryRequest) {
  return request<GenerateStoryResponse>(API_ROUTES.storiesGenerate, {
    method: 'POST',
    body,
  });
}

export function submitJob(body: SubmitJobRequest) {
  return request<SubmitJobResponse>(API_ROUTES.storiesSubmit, {
    method: 'POST',
    body,
  });
}

export function getJobs(params?: { theme?: string; age_group?: string; status?: string }) {
  return request<{ jobs: StoryJob[] }>(API_ROUTES.stories, { params });
}

export function getJobById(job_id: string) {
  return request<StoryJob>(`${API_ROUTES.stories}/${encodeURIComponent(job_id)}`);
}

// ─── Voices ──────────────────────────────────────────────────────────────────

export function listVoices() {
  return request<ListVoicesResponse>(API_ROUTES.voices);
}

export function getVoiceUploadUrl() {
  return request<UploadUrlResponse>(API_ROUTES.voicesUploadUrl);
}

export function checkVoice(voice_id: string) {
  return request<CheckVoiceResponse>(API_ROUTES.voicesCheck, { params: { voice_id } });
}

export function deleteVoice(voice_id: string) {
  return request<{ deleted: string }>(API_ROUTES.voices, {
    method: 'DELETE',
    params: { voice_id },
  });
}

export function setActiveVoice(voice_id: string) {
  return request<{ active_voice_id: string }>(API_ROUTES.voicesActive, {
    method: 'POST',
    body: { voice_id },
  });
}

/** Direct browser → S3 PUT via presigned URL. No API Gateway, no auth headers. */
export async function uploadAudioToS3(
  upload_url: string,
  file: Blob,
  contentType = 'audio/mpeg'
): Promise<void> {
  const res = await fetch(upload_url, {
    method: 'PUT',
    headers: { 'Content-Type': contentType },
    body: file,
  });
  if (!res.ok) throw new Error(`Audio upload failed: ${res.status}`);
}

// ─── Characters ────────────────────────────────────────────────────────────

export function listCharacters() {
  return request<Character[]>(API_ROUTES.characters);
}

export function createCharacter(body: {
  name: string;
  appearance: string;
  personality?: string;
}) {
  return request<Character>(API_ROUTES.characters, { method: 'POST', body });
}

export function deleteCharacter(character_id: string) {
  return request<{ deleted: string }>(API_ROUTES.characters, {
    method: 'DELETE',
    params: { character_id },
  });
}

// ─── User profile ────────────────────────────────────────────────────────────

export function getUserProfile() {
  return request<UserProfile>(API_ROUTES.usersMe);
}

export function updateUserProfile(body: { pin_hash: string | null }) {
  return request<{ updated: boolean }>(API_ROUTES.usersMe, { method: 'PATCH', body });
}

// ─── Push notifications ──────────────────────────────────────────────────────

export function subscribePush(subscription: PushSubscriptionJSON) {
  return request<{ subscribed: boolean }>(API_ROUTES.pushSubscribe, {
    method: 'POST',
    body: subscription,
  });
}
