'use client';

import { useEffect, useRef, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import {
  Mic, Trash2, Check, Loader2, AlertCircle, Plus, LogIn, Star,
} from 'lucide-react';
import {
  useVoices,
  useUploadVoice,
  useVoiceStatusPolling,
  useDeleteVoice,
  useSetActiveVoice,
} from '@/hooks/useVoice';
import { isUnauthorized, type Voice } from '@/lib/api';

const AMBER = '#a78bfa';
const VIOLET = '#7c3aed';

// Map backend voice status → display.
function statusBadge(status: string): { label: string; color: string; bg: string; spin?: boolean } {
  switch (status) {
    case 'active':
      return { label: 'Ready', color: '#4ade80', bg: 'rgba(74,222,128,0.14)' };
    case 'cloning':
      return { label: 'Processing', color: AMBER, bg: 'rgba(167,139,250,0.14)', spin: true };
    case 'pending_upload':
      return { label: 'Uploading', color: AMBER, bg: 'rgba(167,139,250,0.14)', spin: true };
    case 'failed':
      return { label: 'Failed', color: '#f87171', bg: 'rgba(248,113,113,0.14)' };
    default:
      return { label: status, color: 'rgba(255,255,255,0.6)', bg: 'rgba(255,255,255,0.08)' };
  }
}

function VoiceCard({
  voice,
  isActive,
  onSetActive,
  onDelete,
  busy,
}: {
  voice: Voice;
  isActive: boolean;
  onSetActive: (id: string) => void;
  onDelete: (id: string) => void;
  busy: boolean;
}) {
  const badge = statusBadge(voice.status);
  return (
    <div
      className="rounded-2xl p-5 flex items-center gap-4"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: isActive ? `1.5px solid ${AMBER}55` : '1px solid rgba(255,255,255,0.08)',
        boxShadow: isActive ? `0 0 18px rgba(167,139,250,0.12)` : 'none',
      }}
    >
      <div
        className="w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0"
        style={{ background: 'rgba(124,58,237,0.14)', border: '1px solid rgba(124,58,237,0.25)' }}
      >
        <Mic className="w-5 h-5" style={{ color: VIOLET }} />
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2">
          <p className="text-white text-sm font-bold truncate">
            Voice {voice.voice_id.slice(0, 8)}
          </p>
          {isActive && (
            <span className="inline-flex items-center gap-1 text-[10px] font-black" style={{ color: AMBER }}>
              <Star className="w-3 h-3 fill-current" />
              ACTIVE
            </span>
          )}
        </div>
        <span
          className="inline-flex items-center gap-1.5 mt-1 px-2 py-0.5 rounded-full text-[10px] font-bold"
          style={{ background: badge.bg, color: badge.color }}
        >
          {badge.spin && <Loader2 className="w-2.5 h-2.5 animate-spin" />}
          {badge.label}
        </span>
        {voice.error_message && (
          <p className="text-red-400/70 text-[11px] mt-1 truncate">{voice.error_message}</p>
        )}
      </div>

      <div className="flex items-center gap-2 flex-shrink-0">
        {voice.status === 'active' && !isActive && (
          <button
            onClick={() => onSetActive(voice.voice_id)}
            disabled={busy}
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors focus:outline-none disabled:opacity-50"
            style={{ background: 'rgba(167,139,250,0.14)', color: AMBER }}
          >
            Set Active
          </button>
        )}
        <button
          onClick={() => onDelete(voice.voice_id)}
          disabled={busy}
          aria-label="Delete voice"
          className="w-8 h-8 rounded-lg flex items-center justify-center text-white/40 hover:text-red-400 transition-colors focus:outline-none disabled:opacity-50"
          style={{ background: 'rgba(255,255,255,0.04)' }}
        >
          <Trash2 className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

export default function VoicePage() {
  const router = useRouter();
  const { data, isLoading, isError, error } = useVoices();
  const uploadMutation = useUploadVoice();
  const deleteMutation = useDeleteVoice();
  const setActiveMutation = useSetActiveVoice();

  const [recording, setRecording] = useState(false);
  const [recSec, setRecSec] = useState(0);
  const [recordedBlob, setRecordedBlob] = useState<Blob | null>(null);
  const [pollingVoiceId, setPollingVoiceId] = useState<string | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const polling = useVoiceStatusPolling(pollingVoiceId);

  // React to polling completion.
  useEffect(() => {
    const status = polling.data?.status;
    if (!pollingVoiceId || !status) return;
    if (status === 'active') {
      setToast('Voice ready! It can now narrate your stories.');
      setPollingVoiceId(null);
    } else if (status === 'failed') {
      setErrorMsg('Voice cloning failed. Please try recording again.');
      setPollingVoiceId(null);
    }
  }, [polling.data?.status, pollingVoiceId]);

  useEffect(() => () => {
    if (timerRef.current) clearInterval(timerRef.current);
    mediaRecorderRef.current?.stream.getTracks().forEach((t) => t.stop());
  }, []);

  if (isUnauthorized(error)) {
    return (
      <div className="flex items-center justify-center min-h-screen px-6" style={{ background: '#080808' }}>
        <div
          className="rounded-2xl p-8 max-w-sm text-center"
          style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
        >
          <p className="text-white font-bold mb-2">Sign in to set up your voice</p>
          <Link
            href="/auth/login?redirect=/voice"
            className="mt-4 inline-flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-bold text-white"
            style={{ background: `linear-gradient(135deg, ${VIOLET}, #4f46e5)` }}
          >
            <LogIn className="w-4 h-4" />
            Sign In
          </Link>
        </div>
      </div>
    );
  }

  async function startRecording() {
    setErrorMsg(null);
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      chunksRef.current = [];
      recorder.ondataavailable = (e) => {
        if (e.data.size > 0) chunksRef.current.push(e.data);
      };
      recorder.onstop = () => {
        const type = recorder.mimeType || 'audio/webm';
        setRecordedBlob(new Blob(chunksRef.current, { type }));
        recorder.stream.getTracks().forEach((t) => t.stop());
      };
      recorder.start();
      setRecordedBlob(null);
      setRecSec(0);
      setRecording(true);
      timerRef.current = setInterval(() => setRecSec((s) => s + 1), 1000);
    } catch {
      setErrorMsg('Microphone access was denied. Please allow it and try again.');
    }
  }

  function stopRecording() {
    if (timerRef.current) clearInterval(timerRef.current);
    mediaRecorderRef.current?.stop();
    setRecording(false);
  }

  async function handleUpload() {
    if (!recordedBlob) return;
    setErrorMsg(null);
    try {
      const voiceId = await uploadMutation.mutateAsync({
        blob: recordedBlob,
        contentType: recordedBlob.type || 'audio/webm',
      });
      setRecordedBlob(null);
      setRecSec(0);
      setPollingVoiceId(voiceId);
      setToast('Uploaded! Cloning your voice…');
    } catch (err) {
      if (isUnauthorized(err)) {
        router.push('/auth/login?redirect=/voice');
        return;
      }
      setErrorMsg(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    }
  }

  function handleSetActive(id: string) {
    setActiveMutation.mutate(id, {
      onError: (err) => setErrorMsg(err instanceof Error ? err.message : 'Could not set active voice.'),
    });
  }

  function handleDelete(id: string) {
    deleteMutation.mutate(id, {
      onError: (err) => setErrorMsg(err instanceof Error ? err.message : 'Could not delete voice.'),
    });
  }

  const voices = data?.voices ?? [];
  const activeVoiceId = data?.active_voice_id ?? null;
  const mutating = setActiveMutation.isPending || deleteMutation.isPending;
  const uploading = uploadMutation.isPending;
  const cloning = !!pollingVoiceId;
  const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

  return (
    <div className="min-h-screen" style={{ background: '#080808' }}>
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 55% 30% at 50% 0%, rgba(124,58,237,0.16) 0%, transparent 65%)',
        }}
      />

      <div className="relative z-10 max-w-[640px] mx-auto px-6 py-10 pb-24">
        {/* Header */}
        <div className="mb-9">
          <div
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-4"
            style={{ background: 'rgba(124,58,237,0.10)', border: '1px solid rgba(124,58,237,0.2)' }}
          >
            <Mic className="w-2.5 h-2.5 text-violet-400" />
            <span className="text-violet-300 text-[10px] font-black uppercase tracking-[0.14em]">
              Voice Setup
            </span>
          </div>
          <h1 className="text-white font-black tracking-tight mb-2" style={{ fontSize: 'clamp(26px, 6vw, 38px)' }}>
            Your Voices
          </h1>
          <p className="text-white/35 text-sm">
            Record your voice once. We&rsquo;ll clone it so stories can be narrated in your own voice.
          </p>
        </div>

        {/* Toast */}
        {toast && (
          <div
            className="mb-6 flex items-center gap-3 rounded-xl px-4 py-3"
            style={{ background: 'rgba(74,222,128,0.10)', border: '1px solid rgba(74,222,128,0.25)' }}
          >
            <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
            <span className="text-green-300 text-sm flex-1">{toast}</span>
            <button onClick={() => setToast(null)} className="text-green-300/60 text-xs font-bold">
              Dismiss
            </button>
          </div>
        )}

        {/* Error */}
        {errorMsg && (
          <div
            className="mb-6 flex items-center gap-3 rounded-xl px-4 py-3"
            style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)' }}
          >
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span className="text-red-300 text-sm">{errorMsg}</span>
          </div>
        )}

        {/* Voice list */}
        {isLoading && (
          <div className="flex items-center gap-3 text-white/40 mb-8">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading your voices…
          </div>
        )}

        {isError && !isUnauthorized(error) && (
          <div className="flex items-center gap-3 text-red-400 bg-red-400/10 rounded-xl px-4 py-3 mb-8">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm">
              {error instanceof Error ? error.message : 'Failed to load voices'}
            </span>
          </div>
        )}

        {!isLoading && voices.length > 0 && (
          <div className="space-y-3 mb-10">
            {voices.map((v) => (
              <VoiceCard
                key={v.voice_id}
                voice={v}
                isActive={v.voice_id === activeVoiceId}
                onSetActive={handleSetActive}
                onDelete={handleDelete}
                busy={mutating}
              />
            ))}
          </div>
        )}

        {!isLoading && voices.length === 0 && (
          <div
            className="rounded-2xl p-6 mb-10 text-center"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <p className="text-white/50 text-sm">
              You haven&rsquo;t added a voice yet. Record one below to get started.
            </p>
          </div>
        )}

        {/* Recorder */}
        <div className="mb-4 flex items-center gap-2">
          <Plus className="w-4 h-4" style={{ color: AMBER }} />
          <span className="text-[10px] font-black uppercase tracking-[0.18em]" style={{ color: AMBER }}>
            Record New Voice
          </span>
        </div>

        <div
          className="rounded-2xl p-8 flex flex-col items-center gap-5"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {cloning ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: AMBER }} />
              <p className="text-white/55 text-sm font-medium">Cloning your voice…</p>
              <p className="text-white/25 text-xs">This can take a minute or two.</p>
            </div>
          ) : (
            <>
              {recording && (
                <p className="text-sm font-black tabular-nums" style={{ color: AMBER }}>
                  {fmt(recSec)}
                </p>
              )}

              {recordedBlob && !recording && (
                <div className="flex items-center gap-2">
                  <div
                    className="w-4 h-4 rounded-full flex items-center justify-center"
                    style={{ background: AMBER }}
                  >
                    <Check className="w-2.5 h-2.5 text-black" />
                  </div>
                  <span className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    Recorded — {fmt(recSec)}
                  </span>
                </div>
              )}

              {!recordedBlob && !recording && (
                <p className="text-sm font-medium text-center" style={{ color: 'rgba(255,255,255,0.32)' }}>
                  Read a short paragraph aloud — about 30 seconds works best.
                </p>
              )}

              {!recordedBlob ? (
                <motion.button
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.93 }}
                  onClick={recording ? stopRecording : startRecording}
                  className="relative rounded-full flex items-center justify-center focus:outline-none"
                  style={{
                    width: 72,
                    height: 72,
                    background: recording ? 'rgba(239,68,68,0.12)' : 'rgba(167,139,250,0.10)',
                    border: recording ? '1.5px solid rgba(239,68,68,0.45)' : `1.5px solid ${AMBER}55`,
                  }}
                >
                  {recording && (
                    <motion.div
                      className="absolute inset-0 rounded-full"
                      animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0, 0.4] }}
                      transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                      style={{ border: '1.5px solid rgba(239,68,68,0.35)' }}
                    />
                  )}
                  {recording ? (
                    <div className="w-5 h-5 rounded-sm" style={{ background: '#ef4444' }} />
                  ) : (
                    <Mic className="w-7 h-7" style={{ color: AMBER }} />
                  )}
                </motion.button>
              ) : (
                <div className="flex flex-col items-center gap-3 w-full">
                  <button
                    onClick={handleUpload}
                    disabled={uploading}
                    className="w-full max-w-xs py-3 rounded-xl font-black text-sm text-white flex items-center justify-center gap-2 disabled:opacity-70"
                    style={{ background: `linear-gradient(135deg, ${VIOLET}, #4f46e5)` }}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Uploading…
                      </>
                    ) : (
                      'Upload & Clone Voice'
                    )}
                  </button>
                  <button
                    onClick={() => { setRecordedBlob(null); setRecSec(0); }}
                    disabled={uploading}
                    className="text-sm font-medium transition-colors focus:outline-none disabled:opacity-50"
                    style={{ color: 'rgba(255,255,255,0.28)' }}
                  >
                    Re-record
                  </button>
                </div>
              )}

              {!recordedBlob && (
                <p className="text-[10px] font-medium" style={{ color: 'rgba(255,255,255,0.18)' }}>
                  {recording ? 'Tap to stop recording' : 'Tap the mic to begin'}
                </p>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
