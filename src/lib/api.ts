import {
  STORY_GENERATOR_URL,
  SUBMIT_URL,
  GET_JOBS_URL,
  LIST_VOICES_URL,
  CHECK_VOICE_URL,
  GET_UPLOAD_URL,
  DELETE_VOICE_URL,
} from './constants';

// ─── Types ────────────────────────────────────────────────────────────────────

export interface StoryJob {
  job_id: string;
  user_id: string;
  status: string;
  script_text: string;
  cloudfront_url: string;
  created_at: string;
}

export interface VoiceProfile {
  user_id: string;
  status: string;
  heygen_voice_id: string;
  created_at: string;
}

export interface SubmitJobRequest {
  script_text: string;
  user_id: string;
}

export interface SubmitJobResponse {
  job_id: string;
}

export interface GenerateStoryRequest {
  character: string;
  theme: string;
  child_name: string;
  user_id: string;
  mode: string;
}

export interface GenerateStoryResponse {
  job_id: string;
  story_text: string;
  mode: string;
}

export interface UploadUrlResponse {
  upload_url: string;
  s3_key: string;
}

export interface CheckVoiceResponse {
  status: string;
  heygen_voice_id: string | null;
}

export interface DeleteVoiceResponse {
  deleted: string;
}

// ─── Internal helper ─────────────────────────────────────────────────────────

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const res = await fetch(url, init);
  const data = await res.json();
  if (!res.ok) {
    throw new Error(
      typeof data?.message === 'string'
        ? data.message
        : `Request failed: ${res.status}`
    );
  }
  return data as T;
}

// ─── Story generation ─────────────────────────────────────────────────────────

export async function generateStory(
  body: GenerateStoryRequest
): Promise<GenerateStoryResponse> {
  return request<GenerateStoryResponse>(STORY_GENERATOR_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

// ─── Jobs ─────────────────────────────────────────────────────────────────────

export async function submitJob(
  body: SubmitJobRequest
): Promise<SubmitJobResponse> {
  return request<SubmitJobResponse>(SUBMIT_URL, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  });
}

export async function getJobs(): Promise<StoryJob[]> {
  return request<StoryJob[]>(GET_JOBS_URL);
}

// ─── Voices ──────────────────────────────────────────────────────────────────

export async function listVoices(): Promise<VoiceProfile[]> {
  return request<VoiceProfile[]>(LIST_VOICES_URL);
}

export async function checkVoice(): Promise<CheckVoiceResponse> {
  return request<CheckVoiceResponse>(CHECK_VOICE_URL);
}

export async function deleteVoice(user_id: string): Promise<DeleteVoiceResponse> {
  const url = `${DELETE_VOICE_URL}?user_id=${encodeURIComponent(user_id)}`;
  return request<DeleteVoiceResponse>(url);
}

// ─── Upload ───────────────────────────────────────────────────────────────────

export async function getUploadUrl(user_id: string): Promise<UploadUrlResponse> {
  const url = `${GET_UPLOAD_URL}?user_id=${encodeURIComponent(user_id)}`;
  return request<UploadUrlResponse>(url);
}

export async function uploadAudio(
  upload_url: string,
  file: Blob
): Promise<void> {
  const res = await fetch(upload_url, {
    method: 'PUT',
    headers: { 'Content-Type': 'audio/mpeg' },
    body: file,
  });
  if (!res.ok) {
    throw new Error(`Audio upload failed: ${res.status}`);
  }
}
