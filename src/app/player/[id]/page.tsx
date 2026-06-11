'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import ReactPlayer from 'react-player';
import { motion } from 'framer-motion';
import {
  Loader2, AlertCircle, ArrowLeft, Wand2, Film,
} from 'lucide-react';
import { useJobPolling } from '@/hooks/useJobs';
import { isUnauthorized, type StoryJob } from '@/lib/api';

const AMBER = '#F59E0B';
const VIOLET = '#7c3aed';

// In-progress status → human label.
const STATUS_LABEL: Record<string, string> = {
  pending: 'Your story is queued',
  processing: 'Generating the script',
  submitted_to_heygen: 'Sending to animation',
  polling: 'Animating your story',
  ready_to_download: 'Almost ready',
  downloading: 'Almost ready',
};

const TERMINAL = new Set(['complete', 'failed']);

export default function PlayerPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = React.use(params);
  const router = useRouter();
  const { data: job, isLoading, isError, error } = useJobPolling(id);

  if (isUnauthorized(error)) {
    router.push(`/auth/login?redirect=/player/${id}`);
    return null;
  }

  return (
    <div className="min-h-screen" style={{ background: '#080808' }}>
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 60% 35% at 50% 0%, rgba(124,58,237,0.14) 0%, transparent 65%)',
        }}
      />

      <div className="relative z-10 max-w-4xl mx-auto px-6 py-10">
        <Link
          href="/"
          className="inline-flex items-center gap-1.5 text-white/40 hover:text-white text-sm font-semibold mb-8 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to library
        </Link>

        {isLoading && (
          <div className="flex flex-col items-center justify-center py-32 gap-4">
            <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
            <p className="text-white/40 text-sm">Loading story…</p>
          </div>
        )}

        {isError && !isUnauthorized(error) && (
          <NotFound message={error instanceof Error ? error.message : 'Story not found'} />
        )}

        {job && <PlayerBody job={job} />}
      </div>
    </div>
  );
}

function PlayerBody({ job }: { job: StoryJob }) {
  const title = job.title || 'Your Story';

  if (job.status === 'complete' && job.cloudfront_url) {
    return (
      <div>
        <div
          className="rounded-2xl overflow-hidden mb-6"
          style={{ border: '1px solid rgba(255,255,255,0.08)', background: '#000' }}
        >
          <div className="relative w-full" style={{ aspectRatio: '16 / 9' }}>
            <ReactPlayer
              src={job.cloudfront_url}
              controls
              light={job.thumbnail_url || false}
              width="100%"
              height="100%"
              playsInline
              style={{ position: 'absolute', inset: 0 }}
            />
          </div>
        </div>
        <StoryMeta job={job} title={title} />
      </div>
    );
  }

  if (job.status === 'failed') {
    return (
      <div
        className="rounded-2xl p-10 text-center"
        style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(239,68,68,0.2)' }}
      >
        <div
          className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
          style={{ background: 'rgba(239,68,68,0.12)' }}
        >
          <AlertCircle className="w-7 h-7 text-red-400" />
        </div>
        <h2 className="text-white font-black text-xl mb-2">{title}</h2>
        <p className="text-white/40 text-sm mb-8">
          Something went wrong while creating this story. Please try again.
        </p>
        <Link
          href="/generate"
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black text-white"
          style={{ background: `linear-gradient(135deg, ${VIOLET}, #4f46e5)` }}
        >
          <Wand2 className="w-4 h-4" />
          Create a new story
        </Link>
      </div>
    );
  }

  // In-progress
  const label = STATUS_LABEL[job.status] ?? 'Working on your story';
  return (
    <div
      className="rounded-2xl p-12 text-center"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <motion.div
        animate={{ scale: [1, 1.08, 1] }}
        transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }}
        className="w-16 h-16 rounded-2xl flex items-center justify-center mx-auto mb-6"
        style={{
          background: `linear-gradient(135deg, ${VIOLET}, #4f46e5)`,
          boxShadow: `0 0 36px rgba(124,58,237,0.4)`,
        }}
      >
        <Film className="w-7 h-7 text-white" />
      </motion.div>
      <h2 className="text-white font-black text-xl mb-2">{title}</h2>
      <div className="flex items-center justify-center gap-2 mb-2">
        <Loader2 className="w-4 h-4 animate-spin" style={{ color: AMBER }} />
        <p className="text-sm font-semibold" style={{ color: AMBER }}>{label}…</p>
      </div>
      <p className="text-white/30 text-xs">
        This page updates automatically. Animation can take a few minutes.
      </p>
      {job.theme && (
        <div className="mt-6">
          <StoryMeta job={job} title={title} compact />
        </div>
      )}
    </div>
  );
}

function StoryMeta({ job, title, compact }: { job: StoryJob; title: string; compact?: boolean }) {
  const tags = [job.theme, job.age_group, job.tone, job.length].filter(Boolean) as string[];
  return (
    <div className={compact ? '' : 'text-left'}>
      {!compact && <h1 className="text-white font-black text-2xl mb-2">{title}</h1>}
      {tags.length > 0 && (
        <div className="flex flex-wrap items-center justify-center gap-2 mb-3">
          {tags.map((t) => (
            <span
              key={t}
              className="px-2.5 py-1 rounded-full text-[11px] font-bold capitalize"
              style={{ background: 'rgba(245,183,49,0.12)', color: AMBER, border: '1px solid rgba(245,183,49,0.22)' }}
            >
              {t.replace(/_/g, ' ')}
            </span>
          ))}
        </div>
      )}
      {!compact && (
        <p className="text-white/30 text-xs">
          Created {new Date(job.created_at).toLocaleDateString()}
        </p>
      )}
    </div>
  );
}

function NotFound({ message }: { message: string }) {
  return (
    <div
      className="rounded-2xl p-10 text-center"
      style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      <div
        className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-5"
        style={{ background: 'rgba(255,255,255,0.05)' }}
      >
        <AlertCircle className="w-7 h-7 text-white/40" />
      </div>
      <h2 className="text-white font-black text-xl mb-2">Story not found</h2>
      <p className="text-white/40 text-sm mb-8">{message}</p>
      <Link
        href="/"
        className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-black text-white"
        style={{ background: `linear-gradient(135deg, ${VIOLET}, #4f46e5)` }}
      >
        <ArrowLeft className="w-4 h-4" />
        Back to library
      </Link>
    </div>
  );
}
