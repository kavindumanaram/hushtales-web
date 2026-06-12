/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect, useRef, useCallback, createContext, useContext } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import ReactPlayer from 'react-player';
import {
  Play, Plus, Info, Star, ChevronLeft, ChevronRight,
  Search, Volume2, VolumeX, Check, Clock,
  Sparkles, Loader2, CheckCircle2, Wand2, LogIn, X,
} from 'lucide-react';
import { useJobs } from '@/hooks/useJobs';
import { useAuth } from '@/hooks/useAuth';
import { isUnauthorized, type StoryJob } from '@/lib/api';

// ─── Types ────────────────────────────────────────────────────────────────────
type Show = {
  id: string;
  title: string;
  year: string;
  rating: string;
  match: string;
  duration: string;
  genres: string[];
  thumb: string;
  hero: string;
  video?: string;
  synopsis: string;
  badge?: string;
  jobStatus?: string; // present for real stories
};

type BadgeType =
  | 'new' | 'for-you' | 'top-pick' | 'trending'
  | 'original' | 'hot' | 'popular' | 'exclusive'
  | null;

// ─── Badge config ─────────────────────────────────────────────────────────────
const BADGES: Record<NonNullable<BadgeType>, { label: string; bg: string }> = {
  'new':       { label: 'NEW',       bg: '#E50914' },
  'for-you':   { label: 'FOR YOU',   bg: '#1565C0' },
  'top-pick':  { label: 'TOP PICK',  bg: '#6D28D9' },
  'trending':  { label: 'TRENDING',  bg: '#C2410C' },
  'original':  { label: 'ORIGINAL',  bg: '#6D28D9' },
  'hot':       { label: 'HOT',       bg: '#DC2626' },
  'popular':   { label: 'POPULAR',   bg: '#065F46' },
  'exclusive': { label: 'EXCLUSIVE', bg: '#92400E' },
};

// ─── Card dimensions ──────────────────────────────────────────────────────────
const CARD_W = 372;
const CARD_H = 209; // 16:9
const PORT_W = 224;
const PORT_H = 336; // 2:3


const cap = (s: string) => s.replace(/_/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());

// ─── Default artwork ──────────────────────────────────────────────────────────
// Stories without a real thumbnail fall back to these stock images. A story
// keeps the same image across renders (deterministic pick by its id).
const POSTER_FALLBACKS = [
  '/images/posters/poster1.jpeg', '/images/posters/poster2.jpeg',
  '/images/posters/poster3.jpeg', '/images/posters/poster4.jpeg',
  '/images/posters/poster5.jpeg', '/images/posters/poster6.jpeg',
];
const BANNER_FALLBACKS = [
  '/images/banners/banner1.jpeg', '/images/banners/banner2.jpeg',
  '/images/banners/banner3.jpeg', '/images/banners/banner4.jpeg',
  '/images/banners/banner5.jpeg', '/images/banners/banner6.jpeg',
];

function hashIndex(seed: string, n: number): number {
  let h = 0;
  for (let i = 0; i < seed.length; i++) h = (h * 31 + seed.charCodeAt(i)) | 0;
  return Math.abs(h) % n;
}

// ─── Player context ───────────────────────────────────────────────────────────
// open(show): plays the video inline if the story has one (demo or real
// completed), otherwise routes to the status page for stories still rendering.
const OpenPlayerCtx = createContext<(show: Show) => void>(() => {});
const useOpenPlayer = () => useContext(OpenPlayerCtx);

// ─── Video modal ──────────────────────────────────────────────────────────────
function VideoModal({ show, onClose }: { show: Show; onClose: () => void }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [onClose]);

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[120] flex items-center justify-center p-4 md:p-10"
      style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(12px)' }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.94, y: 16, opacity: 0 }}
        animate={{ scale: 1, y: 0, opacity: 1 }}
        exit={{ scale: 0.96, opacity: 0 }}
        transition={{ type: 'spring', damping: 26, stiffness: 280 }}
        className="relative w-full max-w-5xl rounded-2xl overflow-hidden"
        style={{ background: '#000', border: '1px solid rgba(255,255,255,0.1)' }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          aria-label="Close"
          className="absolute top-3 right-3 z-10 w-9 h-9 rounded-full flex items-center justify-center cursor-pointer"
          style={{ background: 'rgba(0,0,0,0.6)', border: '1px solid rgba(255,255,255,0.2)' }}
        >
          <X className="w-4 h-4 text-white" />
        </button>
        <div className="relative w-full" style={{ aspectRatio: '16 / 9' }}>
          <ReactPlayer
            src={show.video}
            controls
            playing
            width="100%"
            height="100%"
            playsInline
            style={{ position: 'absolute', inset: 0 }}
          />
        </div>
        <div className="px-5 py-4">
          <h3 className="text-white font-black text-lg leading-tight">{show.title}</h3>
          <div className="flex items-center gap-3 mt-1 text-xs text-white/45">
            <span className="text-green-400 font-bold">{show.match} Match</span>
            <span>{show.year}</span>
            <span>{show.duration}</span>
            <span className="capitalize">{show.genres.join(' · ')}</span>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// Map a real backend job → the Show shape this UI renders.
function jobToShow(job: StoryJob): Show {
  const title = job.title || 'Untitled Story';
  const seed = job.job_id || title;
  const poster = job.thumbnail_url || POSTER_FALLBACKS[hashIndex(seed, POSTER_FALLBACKS.length)];
  const banner = job.thumbnail_url || BANNER_FALLBACKS[hashIndex(seed, BANNER_FALLBACKS.length)];
  const genres = [job.theme, job.tone].filter(Boolean).map((g) => cap(g!));
  const created = new Date(job.created_at);
  return {
    id: job.job_id,
    title,
    year: Number.isNaN(created.getTime()) ? '2026' : created.getFullYear().toString(),
    rating: '9.0',
    match: '97%',
    duration: job.length === 'full' ? '~60 sec' : '~30 sec',
    genres: genres.length ? genres : ['Story'],
    thumb: poster,
    hero: banner,
    video: job.status === 'complete' ? job.cloudfront_url || undefined : undefined,
    synopsis: job.script_text || 'A personalised animated story, created just for you.',
    jobStatus: job.status,
  };
}

type ProgressShow = Show & { watchedPercent: number; minutesLeft: number };

// A rail of cards, built from the user's real library at render time.
type Row = {
  label: string;
  subtitle?: string;
  badgeType?: BadgeType;
  accentColor?: string;
  shows: Show[];
};

// In-progress status → label/progress for the real "creating" card.
const PROGRESS_META: Record<string, { label: string; pct: number }> = {
  pending: { label: 'Queued', pct: 12 },
  processing: { label: 'Writing the script', pct: 30 },
  submitted_to_heygen: { label: 'Sending to animation', pct: 50 },
  polling: { label: 'Animating', pct: 70 },
  ready_to_download: { label: 'Almost ready', pct: 90 },
  downloading: { label: 'Almost ready', pct: 95 },
};

// ─── Watchlist hook ───────────────────────────────────────────────────────────
function useWatchlist() {
  const [list, setList] = useState<Set<string>>(new Set());
  const toggle = (id: string) =>
    setList(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  return { list, toggle };
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function HeroSection({
  slides, muted, setMuted,
}: { slides: Show[]; muted: boolean; setMuted: (v: boolean) => void }) {
  const open = useOpenPlayer();
  const [idx, setIdx] = useState(0);
  const timerRef       = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeVideoRef = useRef<HTMLVideoElement | null>(null);
  const safeIdx = idx % slides.length;
  const slide = slides[safeIdx];

  useEffect(() => {
    if (activeVideoRef.current) activeVideoRef.current.muted = muted;
  }, [muted]);

  useEffect(() => {
    timerRef.current = setTimeout(() => setIdx(i => (i + 1) % slides.length), 9000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [idx, slides.length]);

  const goto = (next: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIdx(next);
  };

  return (
    <div className="relative w-full overflow-hidden" style={{ height: '100vh', minHeight: 640 }}>
      <AnimatePresence mode="sync">
        {slide.video ? (
          <motion.video
            key={slide.id}
            ref={(el: HTMLVideoElement | null) => {
              activeVideoRef.current = el;
              if (el) { el.muted = muted; el.play().catch(() => {}); }
            }}
            src={slide.video}
            autoPlay loop playsInline
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: 'center 30%', zIndex: 0 }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.75, ease: 'easeInOut' }}
          />
        ) : (
          <motion.img
            key={slide.id}
            src={slide.hero}
            alt={slide.title}
            className="absolute inset-0 w-full h-full object-cover"
            style={{ objectPosition: 'center 30%', zIndex: 0 }}
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.75, ease: 'easeInOut' }}
          />
        )}
      </AnimatePresence>
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2, background: 'linear-gradient(to right, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.06) 100%)' }} />
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2, background: 'linear-gradient(to top, #080808 0%, rgba(8,8,8,0.55) 28%, transparent 60%)' }} />
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2, background: 'linear-gradient(to bottom, rgba(8,8,8,0.38) 0%, transparent 18%)' }} />
      <div className="relative h-full flex flex-col justify-end pb-28 px-8 md:px-16 max-w-3xl" style={{ zIndex: 10 }}>
        <AnimatePresence mode="wait">
          <motion.div key={slide.id}
            initial={{ opacity: 0, y: 32 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.42, ease: [0.25, 0.46, 0.45, 0.94] }}>
            {slide.badge && (
              <div className="flex items-center gap-2 mb-4">
                <div className="w-1 h-5 rounded-full bg-red-500" />
                <span className="text-xs font-black uppercase tracking-widest text-red-400">{slide.badge}</span>
              </div>
            )}
            <h1 className="text-white font-black leading-none mb-4"
              style={{ fontSize: 'clamp(36px,5vw,68px)', textShadow: '0 2px 24px rgba(0,0,0,0.6)' }}>
              {slide.title}
            </h1>
            <div className="flex items-center gap-4 mb-4 flex-wrap">
              <span className="flex items-center gap-1.5 text-green-400 font-bold text-sm">
                <Star className="w-3.5 h-3.5 fill-current" />{slide.match} Match
              </span>
              <span className="text-white/55 text-sm">{slide.year}</span>
              <span className="border border-white/25 text-white/60 text-xs px-1.5 py-0.5 rounded font-bold">PG</span>
              <span className="text-white/55 text-sm">{slide.duration}</span>
              {slide.genres.slice(0, 2).map(g => <span key={g} className="text-white/40 text-sm">· {g}</span>)}
            </div>
            <p className="text-white/65 text-sm md:text-base leading-relaxed mb-8 max-w-md line-clamp-3">{slide.synopsis}</p>
            <div className="flex items-center gap-3 flex-wrap">
              <motion.button whileTap={{ scale: 0.95 }}
                onClick={() => open(slide)}
                className="flex items-center gap-2.5 px-8 py-3.5 rounded-lg font-black text-sm text-black cursor-pointer"
                style={{ background: '#ffffff', boxShadow: '0 4px 20px rgba(255,255,255,0.25)' }}>
                <Play className="w-5 h-5 fill-black" />Play
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }}
                onClick={() => open(slide)}
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-lg font-bold text-sm text-white cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <Info className="w-5 h-5" />More Info
              </motion.button>
              <Link href="/generate">
                <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.95 }}
                  className="flex items-center gap-2.5 px-6 py-3.5 rounded-lg font-black text-sm text-white cursor-pointer"
                  style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', boxShadow: '0 0 24px rgba(124,58,237,0.45)' }}>
                  <Sparkles className="w-5 h-5" />Create Story
                </motion.div>
              </Link>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-2" style={{ zIndex: 10 }}>
        {slides.map((s, i) => (
          <button key={s.id} onClick={() => goto(i)} className="rounded-full transition-all duration-300 cursor-pointer"
            style={{ width: safeIdx === i ? 32 : 8, height: 8, background: safeIdx === i ? '#ffffff' : 'rgba(255,255,255,0.32)' }} />
        ))}
      </div>
      <button onClick={() => goto((safeIdx - 1 + slides.length) % slides.length)}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer"
        style={{ zIndex: 10, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.18)' }}>
        <ChevronLeft className="w-5 h-5 text-white" />
      </button>
      <button onClick={() => goto((safeIdx + 1) % slides.length)}
        className="absolute right-16 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer"
        style={{ zIndex: 10, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.18)' }}>
        <ChevronRight className="w-5 h-5 text-white" />
      </button>
      {slide.video && (
        <button onClick={() => setMuted(!muted)}
          className="absolute bottom-16 right-6 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer"
          style={{ zIndex: 10, background: 'rgba(0,0,0,0.55)', border: '1.5px solid rgba(255,255,255,0.28)', backdropFilter: 'blur(8px)' }}>
          {muted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
        </button>
      )}
      <div className="absolute top-1/2 -translate-y-1/2 right-8 md:right-16 flex flex-col items-center gap-0.5 border-l-4 border-white/50 pl-2.5" style={{ zIndex: 10 }}>
        <span className="text-white font-black text-2xl">{slide.rating}</span>
        <span className="text-white/45 text-[10px] font-semibold uppercase tracking-wider">Rating</span>
      </div>
    </div>
  );
}

// ─── Show Card — 268×151 (16:9), badge pill, hover panel ─────────────────────
function ShowCard({ show, watchlist, onToggle, badge }: {
  show: Show; watchlist: Set<string>; onToggle: (id: string) => void; badge?: BadgeType;
}) {
  const open = useOpenPlayer();
  const [hovered, setHovered] = useState(false);
  const inList = watchlist.has(show.id);
  const badgeCfg = badge ? BADGES[badge] : null;
  const inProgress = !!show.jobStatus && show.jobStatus !== 'complete' && show.jobStatus !== 'failed';

  return (
    <motion.div
      className="relative flex-shrink-0 cursor-pointer rounded-md overflow-hidden"
      style={{ width: CARD_W, height: CARD_H }}
      onClick={() => open(show)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ scale: 1.05, zIndex: 20 }}
      transition={{ duration: 0.2 }}
    >
      <img src={show.thumb} alt={show.title} className="w-full h-full object-cover" style={{ objectPosition: 'center top' }} />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.06) 48%, transparent 100%)' }} />

      {inProgress && !hovered && (
        <div className="absolute top-2 left-2 z-10">
          <span className="inline-flex items-center gap-1 text-[9px] font-black tracking-widest text-white px-[6px] py-[3px] rounded-[3px]"
            style={{ background: '#F59E0B' }}>
            <Loader2 className="w-2.5 h-2.5 animate-spin" />
            CREATING
          </span>
        </div>
      )}

      {badgeCfg && !hovered && !inProgress && (
        <div className="absolute top-2 left-2 z-10">
          <span className="text-[9px] font-black tracking-widest text-white px-[6px] py-[3px] rounded-[3px]"
            style={{ background: badgeCfg.bg, letterSpacing: '0.07em' }}>
            {badgeCfg.label}
          </span>
        </div>
      )}

      {!hovered && (
        <div className="absolute bottom-0 left-0 right-0 px-3.5 pb-3">
          <p className="text-white font-semibold text-sm leading-tight truncate">{show.title}</p>
          <p className="text-white/45 text-[11px] mt-0.5">{show.duration} · {show.genres[0]}</p>
        </div>
      )}

      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 flex flex-col justify-between px-3 pt-2.5 pb-3"
            style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.55) 55%, rgba(0,0,0,0.2) 100%)' }}
          >
            <div className="flex items-center justify-between">
              {badgeCfg
                ? <span className="text-[9px] font-black tracking-widest text-white px-[6px] py-[3px] rounded-[3px]" style={{ background: badgeCfg.bg }}>{badgeCfg.label}</span>
                : <div />}
              <span className="text-green-400 text-[11px] font-bold">{show.match}</span>
            </div>
            <div>
              <p className="text-white font-bold text-xs mb-1 leading-snug">{show.title}</p>
              <div className="flex items-center gap-1 mb-2">
                {show.genres.slice(0, 2).map((g, i) => (
                  <span key={g} className="text-white/45 text-[10px]">{i > 0 ? '· ' : ''}{g}</span>
                ))}
              </div>
              <div className="flex items-center gap-2">
                <button onClick={(e) => { e.stopPropagation(); open(show); }}
                  className="w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0" style={{ background: '#fff' }}>
                  <Play className="w-4 h-4 fill-black" style={{ marginLeft: 1 }} />
                </button>
                <button onClick={e => { e.stopPropagation(); onToggle(show.id); }}
                  className="w-8 h-8 rounded-full flex items-center justify-center border border-white/35 flex-shrink-0"
                  style={{ background: 'rgba(0,0,0,0.55)' }}>
                  {inList ? <Check className="w-4 h-4 text-white" /> : <Plus className="w-4 h-4 text-white" />}
                </button>
                <div className="ml-auto flex items-center gap-1">
                  <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                  <span className="text-yellow-400 text-[10px] font-bold">{show.rating}</span>
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Continue Watching Card — red scrubber bar ────────────────────────────────
function ContinueWatchingCard({ show }: { show: ProgressShow }) {
  const open = useOpenPlayer();
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className="relative flex-shrink-0 cursor-pointer rounded-md overflow-hidden"
      style={{ width: CARD_W, height: CARD_H }}
      onClick={() => open(show)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ scale: 1.05, zIndex: 20 }}
      transition={{ duration: 0.2 }}
    >
      <img src={show.thumb} alt={show.title} className="w-full h-full object-cover" style={{ objectPosition: 'center top' }} />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.08) 52%, transparent 100%)' }} />
      <div className="absolute bottom-0 left-0 right-0 h-[3px]" style={{ background: 'rgba(255,255,255,0.15)' }}>
        <div className="h-full" style={{ width: `${show.watchedPercent}%`, background: '#E50914' }} />
      </div>

      {!hovered && (
        <div className="absolute bottom-2 left-3 right-3">
          <p className="text-white font-semibold text-xs truncate leading-tight">{show.title}</p>
          <div className="flex items-center gap-1 mt-0.5">
            <Clock className="w-2.5 h-2.5 text-white/40" />
            <span className="text-white/45 text-[10px]">{show.minutesLeft} min left</span>
          </div>
        </div>
      )}

      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.15 }}
            className="absolute inset-0 flex flex-col justify-between px-3 pt-3 pb-3.5"
            style={{ background: 'rgba(0,0,0,0.72)' }}
          >
            <div />
            <div>
              <p className="text-white font-bold text-xs mb-2 leading-snug">{show.title}</p>
              <div className="flex items-center gap-2">
                <button onClick={(e) => { e.stopPropagation(); open(show); }}
                  className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-md text-xs font-bold text-black flex-shrink-0"
                  style={{ background: '#fff' }}>
                  <Play className="w-3 h-3 fill-black" style={{ marginLeft: 1 }} />Resume
                </button>
                <span className="text-white/50 text-[10px]">{show.minutesLeft} min left</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Portrait Card ────────────────────────────────────────────────────────────
function PortraitCard({ show, watchlist, onToggle }: { show: Show; watchlist: Set<string>; onToggle: (id: string) => void }) {
  const open = useOpenPlayer();
  const [hovered, setHovered] = useState(false);
  const inList = watchlist.has(show.id);

  return (
    <motion.div
      className="relative flex-shrink-0 cursor-pointer rounded-xl overflow-hidden"
      style={{ width: PORT_W, height: PORT_H }}
      onClick={() => open(show)}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ scale: 1.05, zIndex: 20 }}
      transition={{ duration: 0.2 }}
    >
      <img src={show.thumb} alt={show.title} className="w-full h-full object-cover" style={{ objectPosition: 'center top' }} />
      <div className="absolute inset-0"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.18) 50%, transparent 100%)' }} />
      <AnimatePresence>
        {hovered && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col justify-between p-3"
            style={{ background: 'rgba(0,0,0,0.4)' }}>
            <div />
            <div>
              <p className="text-white font-bold text-xs mb-2 leading-tight">{show.title}</p>
              <div className="flex gap-1.5">
                <button onClick={(e) => { e.stopPropagation(); open(show); }} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#fff' }}>
                  <Play className="w-3.5 h-3.5 fill-black" style={{ marginLeft: 1 }} />
                </button>
                <button onClick={e => { e.stopPropagation(); onToggle(show.id); }}
                  className="w-8 h-8 rounded-full flex items-center justify-center border border-white/40" style={{ background: 'rgba(0,0,0,0.5)' }}>
                  {inList ? <Check className="w-3.5 h-3.5 text-white" /> : <Plus className="w-3.5 h-3.5 text-white" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {!hovered && (
        <div className="absolute bottom-0 left-0 right-0 p-3">
          <p className="text-white font-semibold text-xs leading-tight">{show.title}</p>
        </div>
      )}
    </motion.div>
  );
}

// ─── Shared scroll row hook ───────────────────────────────────────────────────
function useScrollRow() {
  const trackRef  = useRef<HTMLDivElement>(null);
  const [canLeft,  setCanLeft]  = useState(false);
  const [canRight, setCanRight] = useState(true);

  const check = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => { const id = setTimeout(check, 80); return () => clearTimeout(id); }, [check]);

  const scroll = (dir: 1 | -1) => {
    trackRef.current?.scrollBy({ left: dir * 760, behavior: 'smooth' });
    setTimeout(check, 360);
  };

  return { trackRef, canLeft, canRight, scroll, check };
}

// Section header shared by both in-progress variants.
function InProgressHeader() {
  return (
    <div className="flex items-center gap-3 mb-4">
      <motion.div className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ background: '#F59E0B' }}
        animate={{ opacity: [1, 0.2, 1] }} transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }} />
      <h2 className="text-white font-bold text-lg">In Progress</h2>
      <span className="text-white/35 text-sm">· AI is crafting your story</span>
    </div>
  );
}

type ProgressStep = { label: string; done: boolean };

// Standard horizontal "processing" card: thumbnail (with shimmer + spinner) on
// the left, a clear status / stepper / progress-bar block on the right.
function InProgressCard({
  thumb, title, subtitle, percent, stage, steps, meta, href,
}: {
  thumb: string;
  title: string;
  subtitle?: string;
  percent: number;
  stage: string;
  steps?: ProgressStep[];
  meta?: string;
  href?: string;
}) {
  const card = (
    <div
      className="flex flex-col sm:flex-row gap-4 sm:gap-5 rounded-2xl overflow-hidden p-3.5 sm:p-4 transition-colors hover:border-white/15"
      style={{ background: 'rgba(255,255,255,0.035)', border: '1px solid rgba(255,255,255,0.08)' }}
    >
      {/* Thumbnail with processing overlay */}
      <div className="relative flex-shrink-0 rounded-xl overflow-hidden w-full sm:w-[248px]" style={{ aspectRatio: '16 / 9' }}>
        <img src={thumb} alt="" className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center 30%', filter: 'brightness(0.5) saturate(0.7)' }} />
        <motion.div className="absolute inset-0 pointer-events-none"
          style={{ background: 'linear-gradient(105deg, transparent 35%, rgba(245,158,11,0.22) 50%, transparent 65%)' }}
          animate={{ x: ['-130%', '130%'] }}
          transition={{ duration: 2.4, repeat: Infinity, ease: 'easeInOut' }} />
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-11 h-11 rounded-full flex items-center justify-center"
            style={{ background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(245,158,11,0.4)' }}>
            <Loader2 className="w-5 h-5 text-amber-400 animate-spin" />
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="flex-1 min-w-0 flex flex-col justify-center">
        <div className="flex items-center justify-between gap-3 mb-2">
          <div className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full"
            style={{ background: 'rgba(245,158,11,0.13)', border: '1px solid rgba(245,158,11,0.26)' }}>
            <Sparkles className="w-3 h-3 text-amber-400" />
            <span className="text-amber-400 text-[10px] font-black uppercase tracking-wider">Creating Your Story</span>
          </div>
          {meta && <span className="text-white/30 text-xs flex-shrink-0">{meta}</span>}
        </div>

        <h3 className="text-white font-black text-lg sm:text-xl leading-tight truncate">{title}</h3>
        {subtitle && <p className="text-white/45 text-xs sm:text-sm mt-0.5 truncate">{subtitle}</p>}

        {steps && steps.length > 0 && (
          <div className="flex flex-wrap items-center gap-x-4 gap-y-1.5 mt-3">
            {steps.map((step) => (
              <div key={step.label} className="flex items-center gap-1.5">
                {step.done
                  ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                  : <Loader2 className="w-3.5 h-3.5 text-amber-400 animate-spin flex-shrink-0" />}
                <span className={`text-[11px] font-medium ${step.done ? 'text-green-400/90' : 'text-amber-300'}`}>{step.label}</span>
              </div>
            ))}
          </div>
        )}

        <div className="mt-3">
          <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.1)' }}>
            <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg,#F59E0B,#EF4444)' }}
              initial={{ width: 0 }} animate={{ width: `${percent}%` }}
              transition={{ duration: 1.4, ease: 'easeOut' }} />
          </div>
          <div className="flex justify-between mt-1.5">
            <span className="text-white/35 text-[11px]">{stage}…</span>
            <span className="text-amber-400 text-[11px] font-bold">{percent}%</span>
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="px-8 md:px-16 mb-10">
      <InProgressHeader />
      <div style={{ maxWidth: 680 }}>
        {href ? <Link href={href} className="block cursor-pointer">{card}</Link> : card}
      </div>
    </div>
  );
}
// ─── Real "creating" in-progress section ──────────────────────────────────────
function RealInProgressSection({ job }: { job: StoryJob }) {
  const meta = PROGRESS_META[job.status] ?? { label: 'Working on it', pct: 40 };
  const title = job.title || 'Your Story';
  const thumb = job.thumbnail_url || BANNER_FALLBACKS[hashIndex(job.job_id || title, BANNER_FALLBACKS.length)];
  const subtitle = [job.theme && cap(job.theme), job.tone && cap(job.tone)].filter(Boolean).join(' · ');
  // Derive a standard 3-step pipeline view from the job's progress.
  const steps: ProgressStep[] = [
    { label: 'Story crafted', done: meta.pct >= 30 },
    { label: 'Voice & scenes', done: meta.pct >= 50 },
    { label: 'Final render', done: meta.pct >= 90 },
  ];
  return (
    <InProgressCard
      thumb={thumb}
      title={title}
      subtitle={subtitle || undefined}
      percent={meta.pct}
      stage={meta.label}
      steps={steps}
      href={`/player/${job.job_id}`}
    />
  );
}

// ─── Create Story Banner ──────────────────────────────────────────────────────
function CreateStoryBanner() {
  return (
    <div className="px-8 md:px-16 mb-10">
      <div className="relative rounded-2xl overflow-hidden" style={{ height: 144 }}>
        <div className="absolute inset-0" style={{ background: 'linear-gradient(120deg, #0d0b2b 0%, #130b35 35%, #0a1f3a 65%, #0b2b1a 100%)' }} />
        <div className="absolute -left-10 top-1/2 -translate-y-1/2 w-56 h-56 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)' }} />
        <div className="absolute right-32 top-1/2 -translate-y-1/2 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)' }} />
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 32px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 32px)' }} />
        <div className="absolute inset-0 rounded-2xl pointer-events-none" style={{ border: '1px solid rgba(139,92,246,0.2)' }} />
        <div className="relative z-10 h-full flex items-center justify-between px-8 md:px-10">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <Wand2 className="w-4 h-4 text-violet-400" />
              <span className="text-violet-400 text-[11px] font-black uppercase tracking-widest">AI-Powered Storytelling</span>
            </div>
            <h3 className="text-white font-black text-xl leading-tight mb-1">Create Your Own Story</h3>
            <p className="text-white/45 text-sm">Record your voice once — we animate the magic.</p>
          </div>
          <Link href="/generate">
            <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2.5 px-6 py-3 rounded-xl font-black text-sm text-white cursor-pointer flex-shrink-0"
              style={{ background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', boxShadow: '0 0 24px rgba(124,58,237,0.45)' }}>
              <Sparkles className="w-4 h-4" />
              Create Story
            </motion.div>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ─── Continue Watching Row ────────────────────────────────────────────────────
function ContinueWatchingRow({ items }: { items: ProgressShow[] }) {
  const { trackRef, canLeft, canRight, scroll, check } = useScrollRow();
  if (items.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="px-8 md:px-16 mb-3">
        <h2 className="text-white font-bold text-lg">Continue Watching</h2>
        <p className="text-white/35 text-xs mt-0.5">Pick up where you left off</p>
      </div>
      <div className="relative">
        <AnimatePresence>
          {canLeft && (
            <motion.button key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => scroll(-1)} className="absolute left-0 top-0 bottom-0 z-20 w-12 flex items-center justify-center cursor-pointer"
              style={{ background: 'linear-gradient(to right, rgba(8,8,8,0.96), transparent)' }}>
              <ChevronLeft className="w-6 h-6 text-white" />
            </motion.button>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {canRight && (
            <motion.button key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => scroll(1)} className="absolute right-0 top-0 bottom-0 z-20 w-12 flex items-center justify-center cursor-pointer"
              style={{ background: 'linear-gradient(to left, rgba(8,8,8,0.96), transparent)' }}>
              <ChevronRight className="w-6 h-6 text-white" />
            </motion.button>
          )}
        </AnimatePresence>
        <div ref={trackRef} onScroll={check}
          className="flex gap-1 overflow-x-auto px-8 md:px-16"
          style={{ scrollbarWidth: 'none', paddingBottom: 6 }}>
          {items.map((show, i) => (
            <ContinueWatchingCard key={show.id + i} show={show} />
          ))}
          <div style={{ flexShrink: 0, width: 40 }} />
        </div>
      </div>
    </div>
  );
}

// ─── Content Row ──────────────────────────────────────────────────────────────
function ContentRow({ label, subtitle, shows, portrait = false, badgeType, accentColor, watchlist, onToggle }: {
  label: string;
  subtitle?: string;
  shows: Show[];
  portrait?: boolean;
  badgeType?: BadgeType;
  accentColor?: string;
  watchlist: Set<string>;
  onToggle: (id: string) => void;
}) {
  const { trackRef, canLeft, canRight, scroll, check } = useScrollRow();
  const [hdrHovered, setHdrHovered] = useState(false);
  if (shows.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="flex items-center justify-between px-8 md:px-16 mb-3"
        onMouseEnter={() => setHdrHovered(true)}
        onMouseLeave={() => setHdrHovered(false)}>
        <div>
          <div className="flex items-center gap-3">
            {accentColor && <div className="w-[3px] h-[17px] rounded-full flex-shrink-0" style={{ background: accentColor }} />}
            <h2 className="text-white font-bold text-lg leading-none">{label}</h2>
            <motion.span
              initial={false}
              animate={{ opacity: hdrHovered ? 1 : 0, x: hdrHovered ? 0 : -5 }}
              transition={{ duration: 0.15 }}
              className="text-xs font-semibold cursor-pointer select-none"
              style={{ color: accentColor || '#4ade80' }}
            >
              See All ›
            </motion.span>
          </div>
          {subtitle && <p className="text-white/30 text-xs mt-0.5 ml-4">{subtitle}</p>}
        </div>
      </div>

      <div className="relative">
        <AnimatePresence>
          {canLeft && (
            <motion.button key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => scroll(-1)} className="absolute left-0 top-0 bottom-0 z-20 w-12 flex items-center justify-center cursor-pointer"
              style={{ background: 'linear-gradient(to right, rgba(8,8,8,0.96), transparent)' }}>
              <ChevronLeft className="w-6 h-6 text-white" />
            </motion.button>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {canRight && (
            <motion.button key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => scroll(1)} className="absolute right-0 top-0 bottom-0 z-20 w-12 flex items-center justify-center cursor-pointer"
              style={{ background: 'linear-gradient(to left, rgba(8,8,8,0.96), transparent)' }}>
              <ChevronRight className="w-6 h-6 text-white" />
            </motion.button>
          )}
        </AnimatePresence>
        <div ref={trackRef} onScroll={check}
          className="flex gap-1 overflow-x-auto px-8 md:px-16"
          style={{ scrollbarWidth: 'none', paddingBottom: 6 }}>
          {shows.map((show, i) =>
            portrait
              ? <PortraitCard key={show.id + i} show={show} watchlist={watchlist} onToggle={onToggle} />
              : <ShowCard key={show.id + i} show={show} watchlist={watchlist} onToggle={onToggle} badge={badgeType} />
          )}
          <div style={{ flexShrink: 0, width: portrait ? 40 : 48 }} />
        </div>
      </div>
    </div>
  );
}

// ─── Top 10 Row ───────────────────────────────────────────────────────────────
function Top10Row({ shows }: { shows: Show[] }) {
  const open = useOpenPlayer();
  const { trackRef, canLeft, canRight, scroll, check } = useScrollRow();
  const top = shows.slice(0, 8);
  if (top.length === 0) return null;

  return (
    <div className="mb-8">
      <div className="px-8 md:px-16 mb-3">
        <div className="flex items-center gap-3">
          <div className="w-[3px] h-[17px] rounded-full flex-shrink-0" style={{ background: '#F59E0B' }} />
          <h2 className="text-white font-bold text-lg">Top 10 in Australia Today</h2>
        </div>
        <p className="text-white/30 text-xs mt-0.5 ml-4">The stories every family is watching</p>
      </div>
      <div className="relative">
        <AnimatePresence>
          {canLeft && (
            <motion.button key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => scroll(-1)} className="absolute left-0 top-0 bottom-0 z-20 w-12 flex items-center justify-center cursor-pointer"
              style={{ background: 'linear-gradient(to right, rgba(8,8,8,0.96), transparent)' }}>
              <ChevronLeft className="w-6 h-6 text-white" />
            </motion.button>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {canRight && (
            <motion.button key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => scroll(1)} className="absolute right-0 top-0 bottom-0 z-20 w-12 flex items-center justify-center cursor-pointer"
              style={{ background: 'linear-gradient(to left, rgba(8,8,8,0.96), transparent)' }}>
              <ChevronRight className="w-6 h-6 text-white" />
            </motion.button>
          )}
        </AnimatePresence>
        <div ref={trackRef} onScroll={check}
          className="flex overflow-x-auto px-8 md:px-16"
          style={{ scrollbarWidth: 'none' }}>
          {top.map((show, rank) => (
            <motion.div key={show.id} className="relative flex-shrink-0 cursor-pointer group" style={{ width: 276 }}
              onClick={() => open(show)}
              whileHover={{ scale: 1.04, zIndex: 20 }} transition={{ duration: 0.2 }}>
              <div className="absolute left-0 bottom-0 z-10 font-black select-none leading-none pointer-events-none"
                style={{ fontSize: 130, lineHeight: 1, color: 'transparent', WebkitTextStroke: '2px rgba(255,255,255,0.12)', letterSpacing: '-0.04em' }}>
                {rank + 1}
              </div>
              <div className="ml-14 rounded-md overflow-hidden" style={{ height: CARD_H - 8, position: 'relative' }}>
                <img src={show.thumb} alt={show.title} className="w-full h-full object-cover" style={{ objectPosition: 'center top' }} />
                <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.75) 0%, transparent 55%)' }} />
                <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
                  style={{ background: 'rgba(0,0,0,0.42)' }}>
                  <div className="w-10 h-10 rounded-full flex items-center justify-center" style={{ background: '#fff' }}>
                    <Play className="w-4 h-4 fill-black" style={{ marginLeft: 2 }} />
                  </div>
                </div>
                <div className="absolute top-2 left-2">
                  <span className="text-[9px] font-black text-white px-[6px] py-[3px] rounded-[3px]"
                    style={{ background: '#F59E0B', letterSpacing: '0.05em' }}>#{rank + 1}</span>
                </div>
                <div className="absolute bottom-0 left-0 right-0 px-2.5 pb-2">
                  <p className="text-white font-semibold text-xs truncate leading-tight">{show.title}</p>
                </div>
              </div>
            </motion.div>
          ))}
          <div style={{ flexShrink: 0, width: 48 }} />
        </div>
      </div>
    </div>
  );
}

// ─── Billboard ────────────────────────────────────────────────────────────────
function Billboard({ show }: { show: Show }) {
  const open = useOpenPlayer();
  return (
    <div className="relative mx-8 md:mx-16 mb-10 rounded-2xl overflow-hidden" style={{ height: 300 }}>
      <img src={show.hero} alt={show.title} className="w-full h-full object-cover" style={{ objectPosition: 'center 30%' }} />
      <div className="absolute inset-0"
        style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.08) 100%)' }} />
      <div className="absolute inset-0 flex flex-col justify-center px-10">
        <span className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-3">Hushtales Original</span>
        <h3 className="text-white font-black mb-2" style={{ fontSize: 'clamp(22px,3vw,38px)' }}>{show.title}</h3>
        <p className="text-white/58 text-sm mb-6 max-w-sm leading-relaxed line-clamp-3">{show.synopsis}</p>
        <div className="flex gap-3">
          <motion.button whileTap={{ scale: 0.96 }}
            onClick={() => open(show)}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm text-black cursor-pointer" style={{ background: '#fff' }}>
            <Play className="w-4 h-4 fill-black" /> Play Now
          </motion.button>
          <motion.button whileTap={{ scale: 0.96 }}
            onClick={() => open(show)}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm text-white cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.13)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}>
            <Plus className="w-4 h-4" /> My List
          </motion.button>
        </div>
      </div>
      <div className="absolute top-6 right-8 flex items-center gap-1.5 px-3 py-1.5 rounded-full"
        style={{ background: 'rgba(0,0,0,0.5)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.12)' }}>
        <Star className="w-3.5 h-3.5 text-yellow-400 fill-yellow-400" />
        <span className="text-white font-bold text-xs">{show.rating}</span>
      </div>
    </div>
  );
}

// ─── My List Row ──────────────────────────────────────────────────────────────
function MyListRow({ shows, watchlist, onToggle }: { shows: Show[]; watchlist: Set<string>; onToggle: (id: string) => void }) {
  const items = shows.filter(s => watchlist.has(s.id));
  if (items.length === 0) return null;
  return (
    <div className="mb-8">
      <div className="px-8 md:px-16 mb-3">
        <h2 className="text-white font-bold text-lg">My List</h2>
        <p className="text-white/30 text-xs mt-0.5">Stories you saved to watch later</p>
      </div>
      <div className="flex gap-1 overflow-x-auto px-8 md:px-16" style={{ scrollbarWidth: 'none' }}>
        {items.map(show => <PortraitCard key={show.id} show={show} watchlist={watchlist} onToggle={onToggle} />)}
      </div>
    </div>
  );
}

// ─── Search Overlay ───────────────────────────────────────────────────────────
function SearchOverlay({ shows, onClose }: { shows: Show[]; onClose: () => void }) {
  const open = useOpenPlayer();
  const [q, setQ] = useState('');
  const results = q.length > 1 ? shows.filter(s => s.title.toLowerCase().includes(q.toLowerCase())) : [];

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [onClose]);

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] flex flex-col items-center pt-32"
      style={{ background: 'rgba(0,0,0,0.92)', backdropFilter: 'blur(16px)' }}
      onClick={onClose}>
      <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }}
        className="w-full max-w-2xl px-6" onClick={e => e.stopPropagation()}>
        <div className="flex items-center gap-3 rounded-xl px-5 py-4 mb-6"
          style={{ background: 'rgba(255,255,255,0.08)', border: '1px solid rgba(255,255,255,0.15)' }}>
          <Search className="w-5 h-5 text-white/50" />
          <input autoFocus value={q} onChange={e => setQ(e.target.value)}
            placeholder="Search titles, genres…"
            className="flex-1 bg-transparent text-white text-lg outline-none placeholder-white/30" />
        </div>
        {results.length > 0 && (
          <div className="grid grid-cols-2 gap-3">
            {results.map(show => (
              <div key={show.id} onClick={() => { open(show); onClose(); }}
                className="flex items-center gap-3 rounded-xl p-3 cursor-pointer hover:bg-white/10 transition-colors"
                style={{ background: 'rgba(255,255,255,0.05)' }}>
                <img src={show.thumb} alt={show.title} className="w-16 h-10 object-cover rounded-lg" />
                <div>
                  <p className="text-white font-semibold text-sm">{show.title}</p>
                  <p className="text-white/50 text-xs">{show.genres[0]} · {show.year}</p>
                </div>
              </div>
            ))}
          </div>
        )}
        {q.length > 1 && results.length === 0 && (
          <p className="text-white/40 text-center mt-8">No results for &quot;{q}&quot;</p>
        )}
      </motion.div>
    </motion.div>
  );
}

// ─── Empty / signed-out state ─────────────────────────────────────────────────
function EmptyState({ mode }: { mode: 'signed-out' | 'empty' }) {
  const signedOut = mode === 'signed-out';
  return (
    <div className="min-h-screen -mt-16 flex flex-col items-center justify-center text-center px-6"
      style={{ background: 'radial-gradient(ellipse 70% 60% at 50% 35%, rgba(124,58,237,0.18) 0%, transparent 70%), #080808', fontFamily: 'var(--font-nunito), sans-serif' }}>
      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.5 }}
        className="flex flex-col items-center">
        <div className="w-16 h-16 rounded-2xl flex items-center justify-center mb-6"
          style={{ background: 'linear-gradient(135deg, #7c3aed55, #4f46e522)', border: '1px solid #7c3aed55', boxShadow: '0 0 30px #7c3aed40' }}>
          <Sparkles className="w-7 h-7 text-amber-400" />
        </div>
        <h1 className="text-white font-black mb-3" style={{ fontSize: 'clamp(28px,4vw,44px)' }}>
          {signedOut ? 'Your stories live here' : 'Create your first story'}
        </h1>
        <p className="text-white/50 text-sm sm:text-base max-w-md mb-8 leading-relaxed">
          {signedOut
            ? 'Sign in to see the personalised animated bedtime stories made in your own voice.'
            : 'Record your voice once and we’ll turn your ideas into animated bedtime stories — playing back in your voice.'}
        </p>
        <Link href={signedOut ? '/auth/login?redirect=/home3' : '/generate'}>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.96 }}
            className="flex items-center gap-2 px-7 py-3.5 rounded-xl font-black text-sm text-white cursor-pointer"
            style={signedOut
              ? { background: '#E50914', boxShadow: '0 8px 24px rgba(229,9,20,0.4)' }
              : { background: 'linear-gradient(135deg, #7c3aed, #4f46e5)', boxShadow: '0 0 24px rgba(124,58,237,0.45)' }}>
            {signedOut ? <LogIn className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
            {signedOut ? 'Sign In' : 'Create Story'}
          </motion.div>
        </Link>
      </motion.div>
    </div>
  );
}

// Build the rail rows purely from the user's completed library.
const ROW_ACCENTS = ['#C2410C', '#1565C0', '#6D28D9', '#065F46'];

function buildRows(library: Show[]): Row[] {
  if (library.length === 0) return [];
  const rows: Row[] = [
    { label: 'New Releases', subtitle: 'Your latest stories', badgeType: 'new', accentColor: '#E50914', shows: library.slice(0, 12) },
  ];
  // One rail per distinct theme/genre (capped), filled from real stories.
  const byTheme = new Map<string, Show[]>();
  for (const s of library) {
    const key = s.genres[0] || 'Story';
    const list = byTheme.get(key);
    if (list) list.push(s);
    else byTheme.set(key, [s]);
  }
  let i = 0;
  for (const [theme, shows] of byTheme) {
    rows.push({
      label: theme,
      subtitle: `${shows.length} ${shows.length === 1 ? 'story' : 'stories'}`,
      accentColor: ROW_ACCENTS[i % ROW_ACCENTS.length],
      shows,
    });
    if (++i >= 4) break;
  }
  return rows;
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Home3Page() {
  const router = useRouter();
  const [muted, setMuted]           = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const [playing, setPlaying]       = useState<Show | null>(null);
  const { list: watchlist, toggle: toggleWatchlist } = useWatchlist();

  const { user } = useAuth();
  const { data: jobs, error, isLoading } = useJobs();

  // Click a story: play inline if it has a video, otherwise show its status page.
  const openShow = (show: Show) => {
    if (show.video) setPlaying(show);
    else router.push(`/player/${show.id}`);
  };

  // Everything below is derived from the user's real stories — no demo content.
  const allShows = (jobs ?? []).map(jobToShow);
  const library = allShows.filter((s) => s.jobStatus === 'complete'); // playable
  const inProgressShows = allShows.filter(
    (s) => s.jobStatus && s.jobStatus !== 'complete' && s.jobStatus !== 'failed'
  );
  const inProgressJob = (jobs ?? []).find(
    (j) => j.status !== 'complete' && j.status !== 'failed'
  );

  const notSignedIn = isUnauthorized(error) || (!user && !jobs);
  const hasStories = allShows.length > 0;

  // ── Nothing to show: loading spinner, then sign-in / first-story prompts ────
  if (isLoading && !jobs) {
    return (
      <div className="min-h-screen -mt-16 flex items-center justify-center" style={{ background: '#080808' }}>
        <Loader2 className="w-8 h-8 text-amber-400 animate-spin" />
      </div>
    );
  }
  if (!hasStories) {
    return <EmptyState mode={notSignedIn ? 'signed-out' : 'empty'} />;
  }

  // Hero: playable stories first; if none are ready yet, show the latest as art.
  const heroSlides = (library.length ? library : allShows).slice(0, 5);

  // Continue watching: completed stories.
  const continueItems: ProgressShow[] = library
    .slice(0, 6)
    .map((s, i) => ({ ...s, watchedPercent: [25, 55, 80, 40, 65, 15][i % 6], minutesLeft: 0 }));

  const rows = buildRows(library);

  return (
    <OpenPlayerCtx.Provider value={openShow}>
    <div className="min-h-screen -mt-16" style={{ background: '#080808', fontFamily: 'var(--font-nunito), sans-serif' }}>
      <button onClick={() => setSearchOpen(true)}
        className="fixed top-4 right-16 z-40 text-white/60 hover:text-white transition-colors cursor-pointer hidden md:block">
        <Search className="w-5 h-5" />
      </button>

      <HeroSection slides={heroSlides} muted={muted} setMuted={setMuted} />

      <div className="relative z-10" style={{ marginTop: -80 }}>
        {/* Detailed "creating your story" card for the most recent in-progress job */}
        {inProgressJob && <RealInProgressSection job={inProgressJob} />}

        {/* In-progress stories as a rail of cards */}
        <ContentRow
          label="In Progress"
          subtitle="Stories being created right now"
          shows={inProgressShows}
          accentColor="#F59E0B"
          watchlist={watchlist}
          onToggle={toggleWatchlist}
        />

        <ContinueWatchingRow items={continueItems} />

        <CreateStoryBanner />

        {rows.map((row) => (
          <ContentRow
            key={row.label}
            label={row.label}
            subtitle={row.subtitle}
            shows={row.shows}
            badgeType={row.badgeType}
            accentColor={row.accentColor}
            watchlist={watchlist}
            onToggle={toggleWatchlist}
          />
        ))}

        <Top10Row shows={library} />
        {library.length > 0 && <Billboard show={library[0]} />}

        {library.length > 0 && (
          <ContentRow
            label="Personalised For You"
            subtitle="Handpicked for your family"
            shows={library.slice().reverse()}
            portrait
            watchlist={watchlist}
            onToggle={toggleWatchlist}
          />
        )}

        <MyListRow shows={library} watchlist={watchlist} onToggle={toggleWatchlist} />

        <footer className="px-8 md:px-16 py-12 border-t border-white/[0.05]">
          <div className="flex items-center gap-1 mb-6">
            <span className="font-black text-lg" style={{ color: '#E50914' }}>HUSH</span>
            <span className="font-black text-lg text-white">TALES</span>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
            {[
              ['Help Centre', 'Gift Cards', 'Media Centre', 'Investor Relations'],
              ['Jobs', 'Terms of Use', 'Privacy', 'Cookie Preferences'],
              ['Corporate Info', 'Contact Us', 'Speed Test', 'Legal Notices'],
              ['Only on HushTales', 'Ad Choices', 'Account', 'Audio Description'],
            ].map((col, i) => (
              <div key={i} className="flex flex-col gap-2">
                {col.map(link => (
                  <a key={link} href="#" className="text-white/28 text-xs hover:text-white/55 transition-colors">{link}</a>
                ))}
              </div>
            ))}
          </div>
          <p className="text-white/18 text-xs">© 2026 HushTales · All personalised animated bedtime stories. Australia.</p>
        </footer>
      </div>

      <AnimatePresence>
        {searchOpen && <SearchOverlay shows={library} onClose={() => setSearchOpen(false)} />}
      </AnimatePresence>

      <AnimatePresence>
        {playing && <VideoModal show={playing} onClose={() => setPlaying(null)} />}
      </AnimatePresence>
    </div>
    </OpenPlayerCtx.Provider>
  );
}
