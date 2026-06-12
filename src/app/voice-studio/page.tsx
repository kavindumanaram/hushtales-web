'use client';

import React, { useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Mic, Trash2, Check, Loader2, AlertCircle, Star, LogIn,
  ShieldCheck, Crown, ArrowRight, Sparkles, RefreshCw,
} from 'lucide-react';
import {
  useVoices,
  useUploadVoice,
  useVoiceStatusPolling,
  useDeleteVoice,
  useSetActiveVoice,
} from '@/hooks/useVoice';
import { isUnauthorized, type Voice } from '@/lib/api';
import { useStore } from '@/lib/store';

// ─── Brand tokens (match /generate exactly) ─────────────────────────────────
const AMBER  = '#F59E0B';
const VIOLET = '#7c3aed';

// The parent profile that is allowed to record & clone voices.
const PARENT_PROFILE_ID = 'mom';

// ─── Stable waveform constants (no random on render) — mirrors /generate ────
const WAVE_H   = [8, 22, 14, 34, 10, 28, 18, 36, 12, 26, 32, 8, 20, 34, 16, 28, 18, 30, 10, 22];
const WAVE_D   = [0, .08, .16, .04, .20, .12, .24, .06, .18, .02, .14, .22, .10, .06, .18, .24, .02, .16, .12, .08];
const WAVE_DUR = [.40, .35, .45, .38, .42, .36, .44, .40, .38, .46, .34, .42, .40, .36, .44, .38, .42, .34, .46, .40];

// ─── Helpers ────────────────────────────────────────────────────────────────
const fmt = (s: number) => `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;

function statusBadge(status: string): { label: string; color: string; bg: string; spin?: boolean } {
  switch (status) {
    case 'active':
      return { label: 'Ready', color: '#4ade80', bg: 'rgba(74,222,128,0.14)' };
    case 'cloning':
      return { label: 'Cloning', color: AMBER, bg: 'rgba(245,158,11,0.14)', spin: true };
    case 'pending_upload':
      return { label: 'Uploading', color: AMBER, bg: 'rgba(245,158,11,0.14)', spin: true };
    case 'failed':
      return { label: 'Failed', color: '#f87171', bg: 'rgba(248,113,113,0.14)' };
    default:
      return { label: status, color: 'rgba(255,255,255,0.6)', bg: 'rgba(255,255,255,0.08)' };
  }
}

// ─── Section label (matches /generate SLabel) ───────────────────────────────
function SLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span
        className="text-[10px] font-black uppercase tracking-[0.2em] flex-shrink-0"
        style={{ color: AMBER }}
      >
        {children}
      </span>
      <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
    </div>
  );
}

// ─── Waveform (matches /generate) ───────────────────────────────────────────
function Waveform({ active }: { active: boolean }) {
  return (
    <div className="flex items-center justify-center gap-[3px]" style={{ height: 40 }}>
      {WAVE_H.map((h, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full"
          animate={active ? { height: [4, h, 4] } : { height: 4 }}
          transition={
            active
              ? { duration: WAVE_DUR[i], repeat: Infinity, delay: WAVE_D[i], ease: 'easeInOut' }
              : { duration: 0.25 }
          }
          style={{ background: active ? AMBER : 'rgba(255,255,255,0.12)' }}
        />
      ))}
    </div>
  );
}

// ─── Page shell (shared ambient background) ─────────────────────────────────
function Shell({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen" style={{ background: '#080808' }}>
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 55% 30% at 50% 0%, rgba(124,58,237,0.16) 0%, transparent 65%)',
          zIndex: 0,
        }}
      />
      <div className="relative z-10 max-w-[640px] mx-auto px-6 pt-10 pb-28">{children}</div>
    </div>
  );
}

// ─── Voice card ─────────────────────────────────────────────────────────────
function VoiceCard({
  voice,
  isDefault,
  onSetDefault,
  onDelete,
  busy,
}: {
  voice: Voice;
  isDefault: boolean;
  onSetDefault: (id: string) => void;
  onDelete: (id: string) => void;
  busy: boolean;
}) {
  const badge = statusBadge(voice.status);
  const ready = voice.status === 'active';
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl p-4 sm:p-5 flex items-center gap-4"
      style={{
        background: 'rgba(255,255,255,0.04)',
        border: isDefault ? `1.5px solid ${AMBER}55` : '1px solid rgba(255,255,255,0.08)',
        boxShadow: isDefault ? '0 0 18px rgba(245,158,11,0.12)' : 'none',
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
          {isDefault && (
            <span className="inline-flex items-center gap-1 text-[10px] font-black" style={{ color: AMBER }}>
              <Star className="w-3 h-3 fill-current" />
              DEFAULT
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
        {ready && !isDefault && (
          <button
            onClick={() => onSetDefault(voice.voice_id)}
            disabled={busy}
            className="px-3 py-1.5 rounded-lg text-xs font-bold transition-colors focus:outline-none disabled:opacity-50"
            style={{ background: 'rgba(245,158,11,0.14)', color: AMBER }}
          >
            Set default
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
    </motion.div>
  );
}

// ─── Page ───────────────────────────────────────────────────────────────────
export default function VoiceStudioPage() {
  const router = useRouter();

  // Profile gate ─────────────────────────────────────────────────────────────
  const activeProfileId = useStore((s) => s.activeProfileId);
  const setActiveProfileId = useStore((s) => s.setActiveProfileId);
  const hydrateActiveProfile = useStore((s) => s.hydrateActiveProfile);
  useEffect(() => { hydrateActiveProfile(); }, [hydrateActiveProfile]);
  const isParent = activeProfileId === PARENT_PROFILE_ID;

  // Voice data ───────────────────────────────────────────────────────────────
  const { data, isLoading, isError, error } = useVoices();
  const uploadMutation = useUploadVoice();
  const deleteMutation = useDeleteVoice();
  const setActiveMutation = useSetActiveVoice();

  // Recorder state ───────────────────────────────────────────────────────────
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

  // ── Not signed in ──────────────────────────────────────────────────────────
  if (isUnauthorized(error)) {
    return (
      <Shell>
        <GateCard
          icon={<LogIn className="w-7 h-7" style={{ color: AMBER }} />}
          badge="Sign in required"
          title="Sign in to your voice studio"
          body="Your cloned voices are private to your account. Sign in to record and manage them."
          primaryLabel="Sign In"
          primaryIcon={<LogIn className="w-4 h-4" />}
          onPrimary={() => router.push('/auth/login?redirect=/voice-studio')}
        />
      </Shell>
    );
  }

  // ── Parent-only gate ────────────────────────────────────────────────────────
  if (!isParent) {
    return (
      <Shell>
        <GateCard
          icon={<ShieldCheck className="w-7 h-7" style={{ color: AMBER }} />}
          badge="Parents only"
          title="Mum's Voice Studio"
          body="Recording and cloning a voice is a grown-up task. Switch to Mum's profile to record the voice that brings every bedtime story to life."
          primaryLabel="I'm Mum — Continue"
          primaryIcon={<Crown className="w-4 h-4" />}
          onPrimary={() => setActiveProfileId(PARENT_PROFILE_ID)}
          secondaryLabel="Choose a different profile"
          onSecondary={() => router.push('/profiles')}
        />
      </Shell>
    );
  }

  // ── Recorder handlers ───────────────────────────────────────────────────────
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
        router.push('/auth/login?redirect=/voice-studio');
        return;
      }
      setErrorMsg(err instanceof Error ? err.message : 'Upload failed. Please try again.');
    }
  }

  function handleSetDefault(id: string) {
    setActiveMutation.mutate(id, {
      onError: (err) => setErrorMsg(err instanceof Error ? err.message : 'Could not set default voice.'),
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
  const hasVoices = voices.length > 0;

  // ── Studio ──────────────────────────────────────────────────────────────────
  return (
    <Shell>
      {/* Hero — mirrors /generate */}
      <div className="pb-9">
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-5"
          style={{ background: 'rgba(124,58,237,0.10)', border: '1px solid rgba(124,58,237,0.2)' }}
        >
          <Mic className="w-2.5 h-2.5 text-violet-400" />
          <span className="text-violet-300 text-[10px] font-black uppercase tracking-[0.14em]">
            Voice Studio
          </span>
        </motion.div>

        <motion.h1
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.06 }}
          className="text-white font-black tracking-tight leading-none mb-3"
          style={{ fontSize: 'clamp(28px, 7vw, 44px)' }}
        >
          Clone Your Voice
        </motion.h1>

        <motion.p
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.12 }}
          className="font-medium"
          style={{ color: 'rgba(255,255,255,0.32)', fontSize: 14 }}
        >
          Record once. Every story can be told in your voice.
        </motion.p>
      </div>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 flex items-center gap-3 rounded-xl px-4 py-3"
            style={{ background: 'rgba(74,222,128,0.10)', border: '1px solid rgba(74,222,128,0.25)' }}
          >
            <Check className="w-4 h-4 text-green-400 flex-shrink-0" />
            <span className="text-green-300 text-sm flex-1">{toast}</span>
            <button onClick={() => setToast(null)} className="text-green-300/60 text-xs font-bold focus:outline-none">
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error */}
      <AnimatePresence>
        {errorMsg && (
          <motion.div
            initial={{ opacity: 0, y: -6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            className="mb-6 flex items-center gap-3 rounded-xl px-4 py-3"
            style={{ background: 'rgba(239,68,68,0.10)', border: '1px solid rgba(239,68,68,0.25)' }}
          >
            <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0" />
            <span className="text-red-300 text-sm flex-1">{errorMsg}</span>
            <button onClick={() => setErrorMsg(null)} className="text-red-300/60 text-xs font-bold focus:outline-none">
              Dismiss
            </button>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Record section ──────────────────────────────────────────────────── */}
      <section className="mb-10">
        <SLabel>Record Your Voice</SLabel>
        <div
          className="rounded-2xl p-8 flex flex-col items-center gap-5"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {cloning ? (
            <div className="flex flex-col items-center gap-3 py-4">
              <Loader2 className="w-8 h-8 animate-spin" style={{ color: AMBER }} />
              <p className="text-white/55 text-sm font-medium">Cloning your voice…</p>
              <p className="text-white/25 text-xs">This usually takes a minute or two.</p>
            </div>
          ) : (
            <>
              <Waveform active={recording} />

              {!recording && !recordedBlob && (
                <p
                  className="text-sm font-medium text-center leading-relaxed"
                  style={{ color: 'rgba(255,255,255,0.32)' }}
                >
                  Read a short paragraph aloud — about 30 seconds works best.
                  <br />
                  <span style={{ color: 'rgba(255,255,255,0.18)', fontSize: 12 }}>
                    Speak naturally, as if reading a bedtime story.
                  </span>
                </p>
              )}

              {recording && (
                <p className="text-sm font-black tabular-nums" style={{ color: AMBER }}>
                  {fmt(recSec)}
                </p>
              )}

              {recordedBlob && !recording && (
                <div className="flex items-center gap-2">
                  <div className="w-4 h-4 rounded-full flex items-center justify-center" style={{ background: AMBER }}>
                    <Check className="w-2.5 h-2.5 text-black" />
                  </div>
                  <span className="text-sm font-semibold" style={{ color: 'rgba(255,255,255,0.55)' }}>
                    Recorded — {fmt(recSec)}
                  </span>
                </div>
              )}

              {!recordedBlob ? (
                <motion.button
                  whileHover={{ scale: 1.06 }}
                  whileTap={{ scale: 0.93 }}
                  onClick={recording ? stopRecording : startRecording}
                  aria-label={recording ? 'Stop recording' : 'Start recording'}
                  className="relative rounded-full flex items-center justify-center focus:outline-none"
                  style={{
                    width: 72,
                    height: 72,
                    background: recording ? 'rgba(239,68,68,0.12)' : 'rgba(245,183,49,0.10)',
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
                  <motion.button
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    onClick={handleUpload}
                    disabled={uploading}
                    className="w-full max-w-xs py-3 rounded-xl font-black text-sm text-white flex items-center justify-center gap-2 disabled:opacity-70 focus:outline-none"
                    style={{ background: `linear-gradient(135deg, ${VIOLET}, #4f46e5)`, boxShadow: '0 0 22px rgba(124,58,237,0.38)' }}
                  >
                    {uploading ? (
                      <>
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                        Uploading…
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-3.5 h-3.5" />
                        Upload &amp; Clone Voice
                      </>
                    )}
                  </motion.button>
                  <button
                    onClick={() => { setRecordedBlob(null); setRecSec(0); }}
                    disabled={uploading}
                    className="inline-flex items-center gap-1.5 text-sm font-medium transition-colors focus:outline-none disabled:opacity-50"
                    style={{ color: 'rgba(255,255,255,0.28)' }}
                  >
                    <RefreshCw className="w-3.5 h-3.5" />
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
      </section>

      {/* ── Your voices ─────────────────────────────────────────────────────── */}
      <section>
        <SLabel>Your Voices</SLabel>

        {isLoading && (
          <div className="flex items-center gap-3 text-white/40 py-2">
            <Loader2 className="w-5 h-5 animate-spin" />
            Loading your voices…
          </div>
        )}

        {isError && !isUnauthorized(error) && (
          <div className="flex items-center gap-3 text-red-400 bg-red-400/10 rounded-xl px-4 py-3">
            <AlertCircle className="w-5 h-5 shrink-0" />
            <span className="text-sm">
              {error instanceof Error ? error.message : 'Failed to load voices'}
            </span>
          </div>
        )}

        {!isLoading && hasVoices && (
          <div className="space-y-3">
            <AnimatePresence initial={false}>
              {voices.map((v) => (
                <VoiceCard
                  key={v.voice_id}
                  voice={v}
                  isDefault={v.voice_id === activeVoiceId}
                  onSetDefault={handleSetDefault}
                  onDelete={handleDelete}
                  busy={mutating}
                />
              ))}
            </AnimatePresence>
            <p className="text-white/25 text-[11px] pt-1 px-1">
              The <span style={{ color: AMBER }}>default</span> voice is used automatically when you create a new story.
            </p>
          </div>
        )}

        {!isLoading && !hasVoices && !isError && (
          <div
            className="rounded-2xl p-6 text-center"
            style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
          >
            <p className="text-white/50 text-sm">
              No voices yet. Record one above and we&rsquo;ll clone it for your stories.
            </p>
          </div>
        )}
      </section>
    </Shell>
  );
}

// ─── Reusable gate card (sign-in / parents-only) ────────────────────────────
function GateCard({
  icon,
  badge,
  title,
  body,
  primaryLabel,
  primaryIcon,
  onPrimary,
  secondaryLabel,
  onSecondary,
}: {
  icon: React.ReactNode;
  badge: string;
  title: string;
  body: string;
  primaryLabel: string;
  primaryIcon: React.ReactNode;
  onPrimary: () => void;
  secondaryLabel?: string;
  onSecondary?: () => void;
}) {
  return (
    <div className="min-h-[70vh] flex items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 16 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
        className="w-full max-w-md rounded-3xl p-8 sm:p-10 text-center"
        style={{
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid rgba(255,255,255,0.08)',
          boxShadow: '0 30px 80px rgba(0,0,0,0.5)',
        }}
      >
        <motion.div
          animate={{ scale: [1, 1.06, 1] }}
          transition={{ duration: 2.6, repeat: Infinity, ease: 'easeInOut' }}
          className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
          style={{
            background: 'rgba(124,58,237,0.14)',
            border: '1px solid rgba(124,58,237,0.28)',
            boxShadow: '0 0 28px rgba(124,58,237,0.25)',
          }}
        >
          {icon}
        </motion.div>

        <span
          className="inline-block text-[10px] font-black uppercase tracking-[0.18em] mb-3"
          style={{ color: AMBER }}
        >
          {badge}
        </span>
        <h1 className="text-white font-black text-2xl mb-3">{title}</h1>
        <p className="text-white/40 text-sm leading-relaxed mb-8">{body}</p>

        <div className="space-y-2.5">
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={onPrimary}
            className="w-full py-3 rounded-xl font-black text-sm text-white flex items-center justify-center gap-2 focus:outline-none"
            style={{ background: `linear-gradient(135deg, ${VIOLET}, #4f46e5)`, boxShadow: '0 0 24px rgba(124,58,237,0.4)' }}
          >
            {primaryIcon}
            {primaryLabel}
            <ArrowRight className="w-4 h-4" />
          </motion.button>
          {secondaryLabel && onSecondary && (
            <button
              onClick={onSecondary}
              className="w-full py-2.5 text-sm font-semibold transition-colors focus:outline-none"
              style={{ color: 'rgba(255,255,255,0.4)' }}
            >
              {secondaryLabel}
            </button>
          )}
        </div>
      </motion.div>
    </div>
  );
}
