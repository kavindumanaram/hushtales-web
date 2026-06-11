/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Plus, Info, Star, ChevronLeft, ChevronRight,
  Search, Volume2, VolumeX, Check, Clock,
  Sparkles, Loader2, CheckCircle2, Wand2,
} from 'lucide-react';

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
const CARD_W = 268;
const CARD_H = 151; // 16:9
const PORT_W = 162;
const PORT_H = 243; // 2:3

// ─── Show data ────────────────────────────────────────────────────────────────
const SHOWS: Show[] = [
  {
    id: 'moonlit',
    title: 'The Moonlight Explorer',
    year: '2026', rating: '9.4', match: '98%', duration: '28 min',
    genres: ['Adventure', 'Family', 'Fantasy'],
    thumb: '/images/banners/banner6.jpeg',
    hero:  '/images/banners/banner6.jpeg',
    video: '/videos/story1.mp4',
    synopsis: 'An adventurous elephant and his forest companions embark on a breathtaking moonlit journey through an enchanted wilderness — crafted in your own voice.',
    badge: 'HUSHTALES ORIGINAL',
  },
  {
    id: 'aetheria',
    title: "Aetheria's Skies",
    year: '2026', rating: '9.2', match: '96%', duration: '30 min',
    genres: ['Fantasy', 'Action', 'Family'],
    thumb: '/images/posters/poster6.jpeg',
    hero:  '/images/banners/banner5.jpeg',
    video: '/videos/story2.mp4',
    synopsis: 'A fearless girl and her dragon soar above floating castles and glittering skies in this visually stunning epic.',
    badge: '#1 IN AU TODAY',
  },
  {
    id: 'daisy',
    title: "Daisy's Forest Friends",
    year: '2025', rating: '9.0', match: '94%', duration: '22 min',
    genres: ['Nature', 'Family', 'Heartwarming'],
    thumb: '/images/banners/banner2.jpeg',
    hero:  '/images/banners/banner3.jpeg',
    video: '/videos/story3.mp4',
    synopsis: 'Little Daisy the fawn discovers the magic of friendship when she meets the gentle creatures of the Australian bush.',
    badge: 'SEASON 1 COMPLETE',
  },
  {
    id: 'luna',
    title: 'The Luna Kingdom',
    year: '2025', rating: '8.9', match: '92%', duration: '26 min',
    genres: ['Fantasy', 'Royal', 'Adventure'],
    thumb: '/images/posters/poster3.jpeg',
    hero:  '/images/banners/banner4.jpeg',
    video: '/videos/story4.mp4',
    synopsis: 'A brave rabbit princess must reclaim her moonlit kingdom from shadows using nothing but courage and kindness.',
  },
  {
    id: 'seas',
    title: 'The Magical Seas',
    year: '2026', rating: '8.8', match: '91%', duration: '28 min',
    genres: ['Adventure', 'Pirates', 'Fantasy'],
    thumb: '/images/posters/poster4.jpeg',
    hero:  '/images/banners/banner1.jpeg',
    video: '/videos/story5.mp4',
    synopsis: 'Captain Mia and her crew — a raccoon, a bear and a talking ship — sail a rainbow ocean full of wonder and danger.',
    badge: 'NEW EPISODE',
  },
  {
    id: 'barnaby',
    title: "Barnaby's Glowing Adventure",
    year: '2025', rating: '9.1', match: '95%', duration: '24 min',
    genres: ['Fantasy', 'Cozy', 'Family'],
    thumb: '/images/posters/poster1.jpeg',
    hero:  '/images/banners/banner2.jpeg',
    video: '/videos/story6.mp4',
    synopsis: 'A small bunny with a glowing lantern lights up the darkest forest in this cozy, dream-like bedtime classic.',
    badge: 'HUSHTALES ORIGINAL',
  },
  {
    id: 'captain',
    title: "Captain Luna's Voyage",
    year: '2026', rating: '8.7', match: '90%', duration: '25 min',
    genres: ['Nautical', 'Adventure', 'Family'],
    thumb: '/images/posters/poster5.jpeg',
    hero:  '/images/banners/banner2.jpeg',
    synopsis: 'Young captain Luna charts a course across impossible seas, discovering that the bravest sailors follow their hearts.',
  },
  {
    id: 'kangaroo',
    title: 'Little Joey Meets the World',
    year: '2025', rating: '8.6', match: '89%', duration: '18 min',
    genres: ['Nature', 'Aussie', 'Heartwarming'],
    thumb: '/images/banners/banner3.jpeg',
    hero:  '/images/banners/banner3.jpeg',
    synopsis: 'A curious joey takes his first hops outside the pouch and befriends every creature in the sunlit bush.',
  },
];

const byId = (id: string) => SHOWS.find(s => s.id === id)!;

const HERO_SLIDES = [SHOWS[0], SHOWS[1], SHOWS[2], SHOWS[4]];

type RowDef = {
  label: string;
  subtitle?: string;
  ids: string[];
  badgeType?: BadgeType;
  accentColor?: string;
};

const ROWS: RowDef[] = [
  {
    label: 'New Releases',
    subtitle: 'Fresh stories added this week',
    ids: ['moonlit', 'seas', 'captain', 'aetheria'],
    badgeType: 'new',
    accentColor: '#E50914',
  },
  {
    label: 'Trending Now',
    subtitle: 'What families are watching right now',
    ids: ['aetheria', 'moonlit', 'seas', 'barnaby', 'luna'],
    badgeType: 'trending',
    accentColor: '#C2410C',
  },
  {
    label: 'Top Picks for You',
    subtitle: 'Personalised based on your favourites',
    ids: ['barnaby', 'luna', 'daisy', 'moonlit'],
    badgeType: 'for-you',
    accentColor: '#1565C0',
  },
  {
    label: 'Fantasy & Adventure',
    ids: ['aetheria', 'luna', 'seas', 'barnaby', 'captain', 'moonlit'],
  },
  {
    label: 'Cozy Bedtime Stories',
    ids: ['barnaby', 'daisy', 'kangaroo', 'luna'],
  },
  {
    label: 'HushTales Originals',
    subtitle: 'Exclusive stories, only on HushTales',
    ids: ['moonlit', 'barnaby', 'aetheria'],
    badgeType: 'original',
    accentColor: '#6D28D9',
  },
];

type ProgressShow = Show & { watchedPercent: number; minutesLeft: number };

const CONTINUE_WATCHING: ProgressShow[] = [
  { ...byId('barnaby'), watchedPercent: 65, minutesLeft: 8  },
  { ...byId('daisy'),   watchedPercent: 32, minutesLeft: 15 },
  { ...byId('captain'), watchedPercent: 80, minutesLeft: 5  },
  { ...byId('moonlit'), watchedPercent: 15, minutesLeft: 24 },
];

const IN_PROGRESS_STORY = {
  title: "The Dragon's Garden",
  childName: 'Emma',
  theme: 'Fantasy · Adventure',
  thumb: '/images/banners/banner4.jpeg',
  startedAt: '2 hours ago',
  progress: 67,
  steps: [
    { label: 'Story crafted',       done: true  },
    { label: 'Voice generated',     done: true  },
    { label: 'Rendering animation', done: false },
  ],
};

// ─── Watchlist hook ───────────────────────────────────────────────────────────
function useWatchlist() {
  const [list, setList] = useState<Set<string>>(new Set());
  const toggle = (id: string) =>
    setList(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  return { list, toggle };
}

// ─── Hero (UNCHANGED) ─────────────────────────────────────────────────────────
function HeroSection({ muted, setMuted }: { muted: boolean; setMuted: (v: boolean) => void }) {
  const [idx, setIdx] = useState(0);
  const timerRef       = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeVideoRef = useRef<HTMLVideoElement | null>(null);
  const slide = HERO_SLIDES[idx];

  useEffect(() => {
    if (activeVideoRef.current) activeVideoRef.current.muted = muted;
  }, [muted]);

  useEffect(() => {
    timerRef.current = setTimeout(() => setIdx(i => (i + 1) % HERO_SLIDES.length), 9000);
    return () => { if (timerRef.current) clearTimeout(timerRef.current); };
  }, [idx]);

  const goto = (next: number) => {
    if (timerRef.current) clearTimeout(timerRef.current);
    setIdx(next);
  };

  return (
    <div className="relative w-full overflow-hidden" style={{ height: '100vh', minHeight: 640 }}>
      <AnimatePresence mode="sync">
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
            <p className="text-white/65 text-sm md:text-base leading-relaxed mb-8 max-w-md">{slide.synopsis}</p>
            <div className="flex items-center gap-3 flex-wrap">
              <motion.button whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2.5 px-8 py-3.5 rounded-lg font-black text-sm text-black cursor-pointer"
                style={{ background: '#ffffff', boxShadow: '0 4px 20px rgba(255,255,255,0.25)' }}>
                <Play className="w-5 h-5 fill-black" />Play
              </motion.button>
              <motion.button whileTap={{ scale: 0.95 }}
                className="flex items-center gap-2.5 px-6 py-3.5 rounded-lg font-bold text-sm text-white cursor-pointer"
                style={{ background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(10px)', border: '1px solid rgba(255,255,255,0.2)' }}>
                <Info className="w-5 h-5" />More Info
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-2" style={{ zIndex: 10 }}>
        {HERO_SLIDES.map((s, i) => (
          <button key={s.id} onClick={() => goto(i)} className="rounded-full transition-all duration-300 cursor-pointer"
            style={{ width: idx === i ? 32 : 8, height: 8, background: idx === i ? '#ffffff' : 'rgba(255,255,255,0.32)' }} />
        ))}
      </div>
      <button onClick={() => goto((idx - 1 + HERO_SLIDES.length) % HERO_SLIDES.length)}
        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer"
        style={{ zIndex: 10, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.18)' }}>
        <ChevronLeft className="w-5 h-5 text-white" />
      </button>
      <button onClick={() => goto((idx + 1) % HERO_SLIDES.length)}
        className="absolute right-16 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer"
        style={{ zIndex: 10, background: 'rgba(0,0,0,0.5)', border: '1px solid rgba(255,255,255,0.18)' }}>
        <ChevronRight className="w-5 h-5 text-white" />
      </button>
      <button onClick={() => setMuted(!muted)}
        className="absolute bottom-16 right-6 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer"
        style={{ zIndex: 10, background: 'rgba(0,0,0,0.55)', border: '1.5px solid rgba(255,255,255,0.28)', backdropFilter: 'blur(8px)' }}>
        {muted ? <VolumeX className="w-4 h-4 text-white" /> : <Volume2 className="w-4 h-4 text-white" />}
      </button>
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
  const [hovered, setHovered] = useState(false);
  const inList = watchlist.has(show.id);
  const badgeCfg = badge ? BADGES[badge] : null;

  return (
    <motion.div
      className="relative flex-shrink-0 cursor-pointer rounded-md overflow-hidden"
      style={{ width: CARD_W, height: CARD_H }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ scale: 1.05, zIndex: 20 }}
      transition={{ duration: 0.2 }}
    >
      <img src={show.thumb} alt={show.title} className="w-full h-full object-cover" style={{ objectPosition: 'center top' }} />

      {/* Persistent bottom gradient */}
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.82) 0%, rgba(0,0,0,0.06) 48%, transparent 100%)' }} />

      {/* Badge — top-left, always visible */}
      {badgeCfg && !hovered && (
        <div className="absolute top-2 left-2 z-10">
          <span className="text-[9px] font-black tracking-widest text-white px-[6px] py-[3px] rounded-[3px]"
            style={{ background: badgeCfg.bg, letterSpacing: '0.07em' }}>
            {badgeCfg.label}
          </span>
        </div>
      )}

      {/* Default label at bottom */}
      {!hovered && (
        <div className="absolute bottom-0 left-0 right-0 px-3 pb-2.5">
          <p className="text-white font-semibold text-xs leading-tight truncate">{show.title}</p>
          <p className="text-white/40 text-[10px] mt-0.5">{show.duration} · {show.genres[0]}</p>
        </div>
      )}

      {/* Hover overlay */}
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
                <button onClick={e => e.stopPropagation()}
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
  const [hovered, setHovered] = useState(false);

  return (
    <motion.div
      className="relative flex-shrink-0 cursor-pointer rounded-md overflow-hidden"
      style={{ width: CARD_W, height: CARD_H }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ scale: 1.05, zIndex: 20 }}
      transition={{ duration: 0.2 }}
    >
      <img src={show.thumb} alt={show.title} className="w-full h-full object-cover" style={{ objectPosition: 'center top' }} />
      <div className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.08) 52%, transparent 100%)' }} />

      {/* Scrubber — always visible */}
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
                <button onClick={e => e.stopPropagation()}
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
  const [hovered, setHovered] = useState(false);
  const inList = watchlist.has(show.id);

  return (
    <motion.div
      className="relative flex-shrink-0 cursor-pointer rounded-xl overflow-hidden"
      style={{ width: PORT_W, height: PORT_H }}
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
                <button onClick={e => e.stopPropagation()} className="w-8 h-8 rounded-full flex items-center justify-center" style={{ background: '#fff' }}>
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
    trackRef.current?.scrollBy({ left: dir * 580, behavior: 'smooth' });
    setTimeout(check, 360);
  };

  return { trackRef, canLeft, canRight, scroll, check };
}

// ─── In Progress Section ──────────────────────────────────────────────────────
function InProgressSection() {
  return (
    <div className="px-8 md:px-16 mb-10">
      <div className="flex items-center gap-3 mb-4">
        <motion.div
          className="w-2.5 h-2.5 rounded-full flex-shrink-0"
          style={{ background: '#F59E0B' }}
          animate={{ opacity: [1, 0.2, 1] }}
          transition={{ duration: 1.6, repeat: Infinity, ease: 'easeInOut' }}
        />
        <h2 className="text-white font-bold text-lg">In Progress</h2>
        <span className="text-white/35 text-sm">· AI is crafting your story</span>
      </div>

      <div className="relative rounded-xl overflow-hidden" style={{ maxWidth: 480, height: 188 }}>
        <img src={IN_PROGRESS_STORY.thumb} alt="" className="absolute inset-0 w-full h-full object-cover"
          style={{ objectPosition: 'center 30%', filter: 'brightness(0.28) saturate(0.55)' }} />
        <motion.div className="absolute inset-0 pointer-events-none"
          animate={{
            background: [
              'radial-gradient(ellipse at 15% 50%, rgba(245,158,11,0.09) 0%, transparent 65%)',
              'radial-gradient(ellipse at 85% 50%, rgba(245,158,11,0.13) 0%, transparent 65%)',
              'radial-gradient(ellipse at 15% 50%, rgba(245,158,11,0.09) 0%, transparent 65%)',
            ],
          }}
          transition={{ duration: 3.2, repeat: Infinity, ease: 'easeInOut' }}
        />
        <div className="relative z-10 h-full flex flex-col justify-between p-5">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full"
              style={{ background: 'rgba(245,158,11,0.14)', border: '1px solid rgba(245,158,11,0.28)' }}>
              <Sparkles className="w-3.5 h-3.5 text-amber-400" />
              <span className="text-amber-400 text-[11px] font-black uppercase tracking-wider">Creating Your Story</span>
            </div>
            <span className="text-white/28 text-xs">{IN_PROGRESS_STORY.startedAt}</span>
          </div>
          <div>
            <h3 className="text-white font-black text-xl mb-1 leading-tight">{IN_PROGRESS_STORY.title}</h3>
            <p className="text-white/45 text-xs mb-3">For {IN_PROGRESS_STORY.childName} · {IN_PROGRESS_STORY.theme}</p>
            <div className="flex items-center gap-5 mb-3">
              {IN_PROGRESS_STORY.steps.map(step => (
                <div key={step.label} className="flex items-center gap-1.5">
                  {step.done
                    ? <CheckCircle2 className="w-3.5 h-3.5 text-green-400 flex-shrink-0" />
                    : (
                      <motion.div animate={{ rotate: 360 }} transition={{ duration: 1.1, repeat: Infinity, ease: 'linear' }} className="flex-shrink-0">
                        <Loader2 className="w-3.5 h-3.5 text-amber-400" />
                      </motion.div>
                    )}
                  <span className={`text-[11px] font-medium ${step.done ? 'text-green-400' : 'text-amber-300'}`}>{step.label}</span>
                </div>
              ))}
            </div>
            <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(255,255,255,0.11)' }}>
              <motion.div className="h-full rounded-full" style={{ background: 'linear-gradient(90deg,#F59E0B,#EF4444)' }}
                initial={{ width: '52%' }} animate={{ width: `${IN_PROGRESS_STORY.progress}%` }}
                transition={{ duration: 2.8, ease: 'easeOut', delay: 0.4 }} />
            </div>
            <div className="flex justify-between mt-1.5">
              <span className="text-white/30 text-[10px]">Rendering animation...</span>
              <span className="text-amber-400 text-[10px] font-bold">{IN_PROGRESS_STORY.progress}%</span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ─── Create Story Banner ──────────────────────────────────────────────────────
function CreateStoryBanner() {
  return (
    <div className="px-8 md:px-16 mb-10">
      <div className="relative rounded-2xl overflow-hidden" style={{ height: 144 }}>
        {/* Deep gradient background */}
        <div className="absolute inset-0"
          style={{ background: 'linear-gradient(120deg, #0d0b2b 0%, #130b35 35%, #0a1f3a 65%, #0b2b1a 100%)' }} />

        {/* Decorative glows */}
        <div className="absolute -left-10 top-1/2 -translate-y-1/2 w-56 h-56 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(139,92,246,0.18) 0%, transparent 70%)' }} />
        <div className="absolute right-32 top-1/2 -translate-y-1/2 w-40 h-40 rounded-full pointer-events-none"
          style={{ background: 'radial-gradient(circle, rgba(245,158,11,0.12) 0%, transparent 70%)' }} />

        {/* Subtle grid texture */}
        <div className="absolute inset-0 pointer-events-none opacity-[0.04]"
          style={{ backgroundImage: 'repeating-linear-gradient(0deg,#fff 0,#fff 1px,transparent 1px,transparent 32px),repeating-linear-gradient(90deg,#fff 0,#fff 1px,transparent 1px,transparent 32px)' }} />

        {/* Border */}
        <div className="absolute inset-0 rounded-2xl pointer-events-none"
          style={{ border: '1px solid rgba(139,92,246,0.2)' }} />

        {/* Content */}
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
            <motion.div
              whileHover={{ scale: 1.04 }}
              whileTap={{ scale: 0.97 }}
              className="flex items-center gap-2.5 px-6 py-3 rounded-xl font-black text-sm text-white cursor-pointer flex-shrink-0"
              style={{
                background: 'linear-gradient(135deg, #7c3aed, #4f46e5)',
                boxShadow: '0 0 24px rgba(124,58,237,0.45)',
              }}
            >
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
function ContinueWatchingRow() {
  const { trackRef, canLeft, canRight, scroll, check } = useScrollRow();

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
          {CONTINUE_WATCHING.map((show, i) => (
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
function Top10Row({ watchlist, onToggle }: { watchlist: Set<string>; onToggle: (id: string) => void }) {
  const { trackRef, canLeft, canRight, scroll, check } = useScrollRow();

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
          {SHOWS.slice(0, 8).map((show, rank) => (
            <motion.div key={show.id} className="relative flex-shrink-0 cursor-pointer group" style={{ width: 200 }}
              whileHover={{ scale: 1.04, zIndex: 20 }} transition={{ duration: 0.2 }}>
              {/* Ghost rank number */}
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
                  <p className="text-white font-semibold text-[10px] truncate leading-tight">{show.title}</p>
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
function Billboard() {
  const show = SHOWS[0];
  return (
    <div className="relative mx-8 md:mx-16 mb-10 rounded-2xl overflow-hidden" style={{ height: 300 }}>
      <img src={show.hero} alt={show.title} className="w-full h-full object-cover" style={{ objectPosition: 'center 30%' }} />
      <div className="absolute inset-0"
        style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.92) 0%, rgba(0,0,0,0.3) 60%, rgba(0,0,0,0.08) 100%)' }} />
      <div className="absolute inset-0 flex flex-col justify-center px-10">
        <span className="text-[10px] font-black uppercase tracking-widest text-red-500 mb-3">Hushtales Original</span>
        <h3 className="text-white font-black mb-2" style={{ fontSize: 'clamp(22px,3vw,38px)' }}>{show.title}</h3>
        <p className="text-white/58 text-sm mb-6 max-w-sm leading-relaxed">{show.synopsis}</p>
        <div className="flex gap-3">
          <motion.button whileTap={{ scale: 0.96 }}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm text-black cursor-pointer" style={{ background: '#fff' }}>
            <Play className="w-4 h-4 fill-black" /> Play Now
          </motion.button>
          <motion.button whileTap={{ scale: 0.96 }}
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
function MyListRow({ watchlist, onToggle }: { watchlist: Set<string>; onToggle: (id: string) => void }) {
  const items = SHOWS.filter(s => watchlist.has(s.id));
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
function SearchOverlay({ onClose }: { onClose: () => void }) {
  const [q, setQ] = useState('');
  const results = q.length > 1 ? SHOWS.filter(s => s.title.toLowerCase().includes(q.toLowerCase())) : [];

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
              <div key={show.id} className="flex items-center gap-3 rounded-xl p-3 cursor-pointer hover:bg-white/10 transition-colors"
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

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Home3Page() {
  const [muted, setMuted]           = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const { list: watchlist, toggle: toggleWatchlist } = useWatchlist();

  return (
    <div className="min-h-screen -mt-16" style={{ background: '#080808', fontFamily: 'var(--font-nunito), sans-serif' }}>
      <button onClick={() => setSearchOpen(true)}
        className="fixed top-4 right-16 z-40 text-white/60 hover:text-white transition-colors cursor-pointer hidden md:block">
        <Search className="w-5 h-5" />
      </button>

      <HeroSection muted={muted} setMuted={setMuted} />

      <div className="relative z-10" style={{ marginTop: -80 }}>
        <ContinueWatchingRow />
        <InProgressSection />
        <CreateStoryBanner />

        {ROWS.map(row => (
          <ContentRow
            key={row.label}
            label={row.label}
            subtitle={row.subtitle}
            shows={row.ids.map(byId)}
            badgeType={row.badgeType}
            accentColor={row.accentColor}
            watchlist={watchlist}
            onToggle={toggleWatchlist}
          />
        ))}

        <Top10Row watchlist={watchlist} onToggle={toggleWatchlist} />
        <Billboard />

        <ContentRow
          label="Personalised For You"
          subtitle="Handpicked for your family"
          shows={SHOWS.slice().reverse()}
          portrait
          watchlist={watchlist}
          onToggle={toggleWatchlist}
        />

        <MyListRow watchlist={watchlist} onToggle={toggleWatchlist} />

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
        {searchOpen && <SearchOverlay onClose={() => setSearchOpen(false)} />}
      </AnimatePresence>
    </div>
  );
}
