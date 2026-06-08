/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Play, Plus, Info, Star, ChevronLeft, ChevronRight,
  Search, Bell, User, Volume2, VolumeX, Check,
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
  thumb: string;   // banner or poster — used in cards
  hero: string;    // landscape banner — hero background
  video?: string;  // mp4 — fades in over hero banner when ready
  synopsis: string;
  badge?: string;
};

// ─── Data ─────────────────────────────────────────────────────────────────────
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

// Hero carousel — 4 slides with video
const HERO_SLIDES = [SHOWS[0], SHOWS[1], SHOWS[2], SHOWS[4]];

const ROWS = [
  { label: 'Continue Watching',   ids: ['barnaby', 'daisy', 'captain', 'moonlit'] },
  { label: 'Trending Now',        ids: ['aetheria', 'moonlit', 'seas', 'barnaby', 'luna'] },
  { label: 'New Releases',        ids: ['moonlit', 'seas', 'captain', 'aetheria'] },
  { label: 'Fantasy & Adventure', ids: ['aetheria', 'luna', 'seas', 'barnaby', 'captain', 'moonlit'] },
  { label: 'Cozy Bedtime',        ids: ['barnaby', 'daisy', 'kangaroo', 'luna'] },
];

const byId = (id: string) => SHOWS.find(s => s.id === id)!;

// ─── Watchlist hook ───────────────────────────────────────────────────────────
function useWatchlist() {
  const [list, setList] = useState<Set<string>>(new Set());
  const toggle = (id: string) =>
    setList(p => { const n = new Set(p); n.has(id) ? n.delete(id) : n.add(id); return n; });
  return { list, toggle };
}

// ─── Hero ─────────────────────────────────────────────────────────────────────
function HeroSection({ muted, setMuted }: { muted: boolean; setMuted: (v: boolean) => void }) {
  const [idx, setIdx] = useState(0);
  const timerRef       = useRef<ReturnType<typeof setTimeout> | null>(null);
  const activeVideoRef = useRef<HTMLVideoElement | null>(null);

  const slide = HERO_SLIDES[idx];

  // Keep active video muted state in sync after each mount
  useEffect(() => {
    if (activeVideoRef.current) activeVideoRef.current.muted = muted;
  }, [muted]);

  // Auto-advance after 9 s
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

      {/* ── Video only — AnimatePresence crossfades between slides ── */}
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
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.75, ease: 'easeInOut' }}
        />
      </AnimatePresence>

      {/* Cinematic gradient overlays */}
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2, background: 'linear-gradient(to right, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.06) 100%)' }} />
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2, background: 'linear-gradient(to top, #080808 0%, rgba(8,8,8,0.55) 28%, transparent 60%)' }} />
      <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 2, background: 'linear-gradient(to bottom, rgba(8,8,8,0.38) 0%, transparent 18%)' }} />

      {/* ── CONTENT ───────────────────────────────────────────────── */}
      <div className="relative h-full flex flex-col justify-end pb-28 px-8 md:px-16 max-w-3xl" style={{ zIndex: 10 }}>
        <AnimatePresence mode="wait">
          <motion.div
            key={slide.id}
            initial={{ opacity: 0, y: 32 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -16 }}
            transition={{ duration: 0.42, ease: [0.25, 0.46, 0.45, 0.94] }}
          >
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

      {/* ── CONTROLS ──────────────────────────────────────────────── */}
      {/* Slide indicators */}
      <div className="absolute bottom-16 left-1/2 -translate-x-1/2 flex items-center gap-2" style={{ zIndex: 10 }}>
        {HERO_SLIDES.map((s, i) => (
          <button key={s.id} onClick={() => goto(i)}
            className="rounded-full transition-all duration-300 cursor-pointer"
            style={{ width: idx === i ? 32 : 8, height: 8, background: idx === i ? '#ffffff' : 'rgba(255,255,255,0.32)' }} />
        ))}
      </div>

      {/* Prev / Next */}
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

      {/* Mute toggle */}
      <button onClick={() => setMuted(!muted)}
        className="absolute bottom-16 right-6 w-10 h-10 rounded-full flex items-center justify-center cursor-pointer"
        style={{ zIndex: 10, background: 'rgba(0,0,0,0.55)', border: '1.5px solid rgba(255,255,255,0.28)', backdropFilter: 'blur(8px)' }}>
        {muted
          ? <VolumeX className="w-4 h-4 text-white" />
          : <Volume2 className="w-4 h-4 text-white" />}
      </button>

      {/* Rating stamp */}
      <div className="absolute top-1/2 -translate-y-1/2 right-8 md:right-16 flex flex-col items-center gap-0.5 border-l-4 border-white/50 pl-2.5" style={{ zIndex: 10 }}>
        <span className="text-white font-black text-2xl">{slide.rating}</span>
        <span className="text-white/45 text-[10px] font-semibold uppercase tracking-wider">Rating</span>
      </div>
    </div>
  );
}

// ─── Show Card (landscape 220×124) ────────────────────────────────────────────
function ShowCard({ show, watchlist, onToggle }: { show: Show; watchlist: Set<string>; onToggle: (id: string) => void }) {
  const [hovered, setHovered] = useState(false);
  const inList = watchlist.has(show.id);

  return (
    <motion.div
      className="relative flex-shrink-0 cursor-pointer rounded-lg overflow-hidden"
      style={{ width: 220, height: 124 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ scale: 1.06, zIndex: 20 }}
      transition={{ duration: 0.22 }}
    >
      <img src={show.thumb} alt={show.title} className="w-full h-full object-cover" style={{ objectPosition: 'center top' }} />
      <AnimatePresence>
        {hovered && (
          <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            transition={{ duration: 0.18 }}
            className="absolute inset-0 flex flex-col justify-between p-2.5"
            style={{ background: 'linear-gradient(to top,rgba(0,0,0,0.92) 0%,rgba(0,0,0,0.45) 55%,rgba(0,0,0,0.18) 100%)' }}
          >
            <div className="flex justify-end">
              {show.badge && <span className="text-xs font-bold text-white px-2 py-0.5 rounded-full bg-red-600">{show.badge.split(' ')[0]}</span>}
            </div>
            <div>
              <p className="text-white font-bold text-xs mb-1.5 leading-tight">{show.title}</p>
              <div className="flex items-center gap-1.5">
                <button onClick={e => e.stopPropagation()} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: '#fff' }}>
                  <Play className="w-3.5 h-3.5 fill-black" style={{ marginLeft: 1 }} />
                </button>
                <button onClick={e => { e.stopPropagation(); onToggle(show.id); }}
                  className="w-7 h-7 rounded-full flex items-center justify-center border border-white/40"
                  style={{ background: 'rgba(0,0,0,0.5)' }}>
                  {inList ? <Check className="w-3.5 h-3.5 text-white" /> : <Plus className="w-3.5 h-3.5 text-white" />}
                </button>
                <span className="text-green-400 text-xs font-bold ml-auto">{show.match}</span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
}

// ─── Portrait Card (148×220) ──────────────────────────────────────────────────
function PortraitCard({ show, watchlist, onToggle }: { show: Show; watchlist: Set<string>; onToggle: (id: string) => void }) {
  const [hovered, setHovered] = useState(false);
  const inList = watchlist.has(show.id);

  return (
    <motion.div
      className="relative flex-shrink-0 cursor-pointer rounded-xl overflow-hidden"
      style={{ width: 148, height: 220 }}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      whileHover={{ scale: 1.05, zIndex: 20 }}
      transition={{ duration: 0.22 }}
    >
      <img src={show.thumb} alt={show.title} className="w-full h-full object-cover" style={{ objectPosition: 'center top' }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.88) 0%, rgba(0,0,0,0.2) 50%, transparent 100%)' }} />
      <AnimatePresence>
        {hovered && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="absolute inset-0 flex flex-col justify-between p-3" style={{ background: 'rgba(0,0,0,0.4)' }}>
            <div />
            <div>
              <p className="text-white font-bold text-xs mb-2 leading-tight">{show.title}</p>
              <div className="flex gap-1.5">
                <button onClick={e => e.stopPropagation()} className="w-7 h-7 rounded-full flex items-center justify-center" style={{ background: '#fff' }}>
                  <Play className="w-3 h-3 fill-black" style={{ marginLeft: 1 }} />
                </button>
                <button onClick={e => { e.stopPropagation(); onToggle(show.id); }}
                  className="w-7 h-7 rounded-full flex items-center justify-center border border-white/40" style={{ background: 'rgba(0,0,0,0.5)' }}>
                  {inList ? <Check className="w-3 h-3 text-white" /> : <Plus className="w-3 h-3 text-white" />}
                </button>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      {!hovered && (
        <div className="absolute bottom-0 left-0 right-0 p-2.5">
          <p className="text-white font-semibold text-xs leading-tight">{show.title}</p>
        </div>
      )}
    </motion.div>
  );
}

// ─── Content Row ──────────────────────────────────────────────────────────────
function ContentRow({ label, shows, portrait = false, watchlist, onToggle }: {
  label: string; shows: Show[]; portrait?: boolean;
  watchlist: Set<string>; onToggle: (id: string) => void;
}) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canLeft, setCanLeft]   = useState(false);
  const [canRight, setCanRight] = useState(true);

  const checkArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => { const id = setTimeout(checkArrows, 80); return () => clearTimeout(id); }, [checkArrows]);

  const scroll = (dir: 1 | -1) => {
    trackRef.current?.scrollBy({ left: dir * 480, behavior: 'smooth' });
    setTimeout(checkArrows, 360);
  };

  return (
    <div className="mb-10">
      <div className="flex items-center px-8 md:px-16 mb-3">
        <h2 className="text-white font-bold text-lg hover:text-blue-400 cursor-pointer transition-colors">{label}</h2>
      </div>
      <div className="relative">
        <AnimatePresence>
          {canLeft && (
            <motion.button key="l" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => scroll(-1)}
              className="absolute left-0 top-0 bottom-0 z-20 w-14 flex items-center justify-center cursor-pointer"
              style={{ background: 'linear-gradient(to right, rgba(8,8,8,0.95), transparent)' }}>
              <ChevronLeft className="w-7 h-7 text-white" />
            </motion.button>
          )}
        </AnimatePresence>
        <AnimatePresence>
          {canRight && (
            <motion.button key="r" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => scroll(1)}
              className="absolute right-0 top-0 bottom-0 z-20 w-14 flex items-center justify-center cursor-pointer"
              style={{ background: 'linear-gradient(to left, rgba(8,8,8,0.95), transparent)' }}>
              <ChevronRight className="w-7 h-7 text-white" />
            </motion.button>
          )}
        </AnimatePresence>
        <div ref={trackRef} onScroll={checkArrows}
          className="flex gap-2 overflow-x-auto px-8 md:px-16"
          style={{ scrollbarWidth: 'none', paddingBottom: 8 }}>
          {shows.map((show, i) =>
            portrait
              ? <PortraitCard key={show.id + i} show={show} watchlist={watchlist} onToggle={onToggle} />
              : <ShowCard key={show.id + i} show={show} watchlist={watchlist} onToggle={onToggle} />
          )}
          <div style={{ flexShrink: 0, width: portrait ? 40 : 55 }} />
        </div>
      </div>
    </div>
  );
}

// ─── Top 10 ───────────────────────────────────────────────────────────────────
function Top10Row({ watchlist, onToggle }: { watchlist: Set<string>; onToggle: (id: string) => void }) {
  return (
    <div className="mb-10">
      <div className="px-8 md:px-16 mb-3">
        <h2 className="text-white font-bold text-lg">Top 10 in Australia Today</h2>
      </div>
      <div className="flex overflow-x-auto px-8 md:px-16" style={{ scrollbarWidth: 'none' }}>
        {SHOWS.slice(0, 6).map((show, rank) => (
          <motion.div key={show.id} className="relative flex-shrink-0 cursor-pointer group" style={{ width: 180 }}
            whileHover={{ scale: 1.04, zIndex: 20 }} transition={{ duration: 0.22 }}>
            <div className="absolute left-0 bottom-0 z-10 font-black select-none leading-none"
              style={{ fontSize: 120, lineHeight: 1, color: 'transparent', WebkitTextStroke: '2.5px rgba(255,255,255,0.16)', letterSpacing: '-0.04em' }}>
              {rank + 1}
            </div>
            <div className="ml-12 rounded-lg overflow-hidden" style={{ height: 120, position: 'relative' }}>
              <img src={show.thumb} alt={show.title} className="w-full h-full object-cover" style={{ objectPosition: 'center top' }} />
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex items-center justify-center"
                style={{ background: 'rgba(0,0,0,0.45)' }}>
                <div className="w-9 h-9 rounded-full flex items-center justify-center" style={{ background: '#fff' }}>
                  <Play className="w-4 h-4 fill-black" style={{ marginLeft: 2 }} />
                </div>
              </div>
            </div>
          </motion.div>
        ))}
        <div style={{ flexShrink: 0, width: 48 }} />
      </div>
    </div>
  );
}

// ─── My List Row ──────────────────────────────────────────────────────────────
function MyListRow({ watchlist, onToggle }: { watchlist: Set<string>; onToggle: (id: string) => void }) {
  const items = SHOWS.filter(s => watchlist.has(s.id));
  if (items.length === 0) return null;
  return (
    <div className="mb-10">
      <div className="px-8 md:px-16 mb-3">
        <h2 className="text-white font-bold text-lg">My List</h2>
      </div>
      <div className="flex gap-2 overflow-x-auto px-8 md:px-16" style={{ scrollbarWidth: 'none' }}>
        {items.map(show => <PortraitCard key={show.id} show={show} watchlist={watchlist} onToggle={onToggle} />)}
      </div>
    </div>
  );
}

// ─── Billboard ────────────────────────────────────────────────────────────────
function Billboard() {
  const show = SHOWS[0];
  return (
    <div className="relative mx-8 md:mx-16 mb-12 rounded-2xl overflow-hidden" style={{ height: 320 }}>
      <img src={show.hero} alt={show.title} className="w-full h-full object-cover" style={{ objectPosition: 'center 30%' }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(135deg, rgba(0,0,0,0.9) 0%, rgba(0,0,0,0.28) 60%, rgba(0,0,0,0.1) 100%)' }} />
      <div className="absolute inset-0 flex flex-col justify-center px-10">
        <span className="text-xs font-black uppercase tracking-widest text-red-500 mb-3">Hushtales Original</span>
        <h3 className="text-white font-black mb-2" style={{ fontSize: 'clamp(24px, 3vw, 40px)' }}>{show.title}</h3>
        <p className="text-white/65 text-sm mb-6 max-w-sm leading-relaxed">{show.synopsis}</p>
        <div className="flex gap-3">
          <motion.button whileTap={{ scale: 0.96 }}
            className="flex items-center gap-2 px-6 py-2.5 rounded-lg font-bold text-sm text-black cursor-pointer" style={{ background: '#fff' }}>
            <Play className="w-4 h-4 fill-black" /> Play Now
          </motion.button>
          <motion.button whileTap={{ scale: 0.96 }}
            className="flex items-center gap-2 px-5 py-2.5 rounded-lg font-bold text-sm text-white cursor-pointer"
            style={{ background: 'rgba(255,255,255,0.14)', backdropFilter: 'blur(8px)', border: '1px solid rgba(255,255,255,0.2)' }}>
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

// ─── Streaming Nav ────────────────────────────────────────────────────────────
function StreamingNav({ onSearch }: { onSearch: () => void }) {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  return (
    <div className={`fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-8 md:px-16 h-16 transition-all duration-500 ${
      scrolled ? 'bg-[#080808]/97 shadow-2xl' : 'bg-transparent'
    }`}>
      <div className="flex items-center gap-8">
        <Link href="/" className="flex items-center gap-1 shrink-0">
          <span className="font-black text-xl tracking-tight" style={{ color: '#E50914' }}>HUSH</span>
          <span className="font-black text-xl tracking-tight text-white">TALES</span>
        </Link>
        <nav className="hidden lg:flex items-center gap-6">
          {[
            ['Home',     '/home3'],
            ['Series',   '/library'],
            ['Stories',  '/home1'],
            ['🐨 Kids',  '/kids'],
            ['Create',   '/generate'],
          ].map(([label, href]) => (
            <Link key={href} href={href} className="text-white/65 hover:text-white text-sm font-medium transition-colors">{label}</Link>
          ))}
        </nav>
      </div>
      <div className="flex items-center gap-4">
        <button onClick={onSearch} className="text-white/65 hover:text-white transition-colors cursor-pointer">
          <Search className="w-5 h-5" />
        </button>
        <button className="text-white/65 hover:text-white transition-colors cursor-pointer">
          <Bell className="w-5 h-5" />
        </button>
        <div className="w-8 h-8 rounded-lg flex items-center justify-center cursor-pointer"
          style={{ background: 'linear-gradient(135deg,#E50914,#b91c1c)' }}>
          <User className="w-4 h-4 text-white" />
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────
export default function Home3Page() {
  const [muted, setMuted]         = useState(true);
  const [searchOpen, setSearchOpen] = useState(false);
  const { list: watchlist, toggle: toggleWatchlist } = useWatchlist();

  return (
    <div className="min-h-screen -mt-16" style={{ background: '#080808', fontFamily: 'var(--font-nunito), sans-serif' }}>
      <StreamingNav onSearch={() => setSearchOpen(true)} />

      <HeroSection muted={muted} setMuted={setMuted} />

      <div className="relative z-10" style={{ marginTop: -80 }}>
        <MyListRow watchlist={watchlist} onToggle={toggleWatchlist} />

        {ROWS.map(row => (
          <ContentRow
            key={row.label}
            label={row.label}
            shows={row.ids.map(byId)}
            watchlist={watchlist}
            onToggle={toggleWatchlist}
          />
        ))}

        <Top10Row watchlist={watchlist} onToggle={toggleWatchlist} />
        <Billboard />

        <ContentRow
          label="Personalised For You"
          shows={SHOWS.slice().reverse()}
          portrait
          watchlist={watchlist}
          onToggle={toggleWatchlist}
        />

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
                {col.map(link => <a key={link} href="#" className="text-white/30 text-xs hover:text-white/55 transition-colors">{link}</a>)}
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
