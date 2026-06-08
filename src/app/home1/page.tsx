/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';

// ── Local assets ──────────────────────────────────────────────────────────────
const IMG = {
  p1: '/images/posters/poster1.jpeg',
  p2: '/images/posters/poster2.jpeg',
  p3: '/images/posters/poster3.jpeg',
  p4: '/images/posters/poster4.jpeg',
  p5: '/images/posters/poster5.jpeg',
  p6: '/images/posters/poster6.jpeg',
} as const;

const VID = {
  v1: '/videos/story1.mp4',
  v2: '/videos/story2.mp4',
  v3: '/videos/story3.mp4',
  v4: '/videos/story4.mp4',
  v5: '/videos/story5.mp4',
  v6: '/videos/story6.mp4',
} as const;

// ── Data ──────────────────────────────────────────────────────────────────────
type Show = { id: string; title: string; year: string; duration: string; rating: string; genre: string; age: string; thumb: string; progress?: number };

type HeroSlide = { id: string; video: string; title: string; subtitle: string; genre: string; year: string; seasons?: string; rating: string; streams: string; desc: string };

const HERO: HeroSlide[] = [
  {
    id: 'h1', video: VID.v1,
    title: 'The Moonlight Explorer',
    subtitle: 'HUSHTALES ORIGINAL',
    genre: 'Adventure · Fantasy · Family',
    year: '2026', rating: '9.2', streams: '12M+',
    desc: 'Ellie the elephant embarks on a magical journey through glowing forests, guided by moonlight and the warmth of friendship.',
  },
  {
    id: 'h2', video: VID.v4,
    title: "Barnaby's Glowing Adventure",
    subtitle: 'SEASON 1 · NOW STREAMING',
    genre: 'Fantasy · Kids · Adventure',
    year: '2026', rating: '8.8', streams: '8M+',
    desc: 'Armed with a lantern and a curious heart, Barnaby the bunny discovers glowing mushrooms and enchanted castles hidden in the night forest.',
  },
  {
    id: 'h3', video: VID.v3,
    title: "Little Joey's Forest Friends",
    subtitle: 'BEDTIME STORY SERIES',
    genre: 'Nature · Family · Australian',
    year: '2026', rating: '8.5', streams: '5M+',
    desc: 'A gentle joey discovers new friends across the Australian bush — from sleepy koalas to caring kangaroo families.',
  },
];

const CONTINUE: Show[] = [
  { id: 'cw1', title: "Barnaby's Glowing Adventure", year: '2026', duration: '24 min', rating: '9.2', genre: 'Fantasy',   age: 'G', thumb: IMG.p1, progress: 72 },
  { id: 'cw2', title: "Barnaby's Quest",             year: '2026', duration: '22 min', rating: '8.8', genre: 'Adventure', age: 'G', thumb: IMG.p2, progress: 45 },
  { id: 'cw3', title: 'The Luna Kingdom',            year: '2026', duration: '26 min', rating: '8.6', genre: 'Fantasy',   age: 'G', thumb: IMG.p3, progress: 21 },
  { id: 'cw4', title: 'The Magical Seas',            year: '2026', duration: '28 min', rating: '8.4', genre: 'Adventure', age: 'G', thumb: IMG.p4, progress: 88 },
  { id: 'cw5', title: "Captain Luna's Voyage",       year: '2026', duration: '25 min', rating: '8.2', genre: 'Pirates',   age: 'G', thumb: IMG.p5, progress: 60 },
];

const NEW_WEEK: Show[] = [
  { id: 'nw1', title: "Barnaby's Glowing Adventure", year: '2026', duration: '24 min', rating: '9.2', genre: 'Fantasy',   age: 'G', thumb: IMG.p1 },
  { id: 'nw2', title: "Barnaby's Quest",             year: '2026', duration: '22 min', rating: '8.8', genre: 'Adventure', age: 'G', thumb: IMG.p2 },
  { id: 'nw3', title: 'The Luna Kingdom',            year: '2026', duration: '26 min', rating: '8.6', genre: 'Fantasy',   age: 'G', thumb: IMG.p3 },
  { id: 'nw4', title: 'The Magical Seas',            year: '2026', duration: '28 min', rating: '8.4', genre: 'Adventure', age: 'G', thumb: IMG.p4 },
  { id: 'nw5', title: "Captain Luna's Voyage",       year: '2026', duration: '25 min', rating: '8.2', genre: 'Pirates',   age: 'G', thumb: IMG.p5 },
  { id: 'nw6', title: "Aetheria's Skies",            year: '2026', duration: '30 min', rating: '8.9', genre: 'Fantasy',   age: 'G', thumb: IMG.p6 },
  { id: 'nw7', title: 'Moonlit Forest',              year: '2026', duration: '20 min', rating: '8.1', genre: 'Nature',    age: 'G', thumb: IMG.p1 },
  { id: 'nw8', title: 'Dragon Riders',               year: '2026', duration: '22 min', rating: '8.3', genre: 'Fantasy',   age: 'G', thumb: IMG.p2 },
];

const TRENDING: Show[] = [
  { id: 'tr1', title: "Aetheria's Skies",            year: '2026', duration: '30 min', rating: '8.9', genre: 'Fantasy',   age: 'G', thumb: IMG.p6 },
  { id: 'tr2', title: 'The Magical Seas',            year: '2026', duration: '28 min', rating: '8.4', genre: 'Adventure', age: 'G', thumb: IMG.p4 },
  { id: 'tr3', title: 'The Luna Kingdom',            year: '2026', duration: '26 min', rating: '8.6', genre: 'Fantasy',   age: 'G', thumb: IMG.p3 },
  { id: 'tr4', title: "Barnaby's Glowing Adventure", year: '2026', duration: '24 min', rating: '9.2', genre: 'Fantasy',   age: 'G', thumb: IMG.p1 },
  { id: 'tr5', title: "Captain Luna's Voyage",       year: '2026', duration: '25 min', rating: '8.2', genre: 'Pirates',   age: 'G', thumb: IMG.p5 },
  { id: 'tr6', title: "Barnaby's Quest",             year: '2026', duration: '22 min', rating: '8.8', genre: 'Adventure', age: 'G', thumb: IMG.p2 },
  { id: 'tr7', title: 'The Night Journey',           year: '2026', duration: '22 min', rating: '8.0', genre: 'Nature',    age: 'G', thumb: IMG.p3 },
  { id: 'tr8', title: 'Dragon Friends',              year: '2026', duration: '28 min', rating: '8.7', genre: 'Fantasy',   age: 'G', thumb: IMG.p6 },
];

// ── Icons ─────────────────────────────────────────────────────────────────────
function PlayFilled({ size = 20 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor"><path d="M8 5.14v14l11-7-11-7z" /></svg>;
}
function Plus({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M12 5v14M5 12h14" /></svg>;
}
function Check({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M5 13l4 4L19 7" /></svg>;
}
function Info({ size = 18 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}><circle cx="12" cy="12" r="10" /><path d="M12 16v-4M12 8h.01" /></svg>;
}
function ChevLeft() {
  return <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M15 18l-6-6 6-6" /></svg>;
}
function ChevRight() {
  return <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}><path d="M9 18l6-6-6-6" /></svg>;
}
function Star({ size = 12 }: { size?: number }) {
  return <svg width={size} height={size} viewBox="0 0 24 24" fill="#F59E0B"><path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" /></svg>;
}

// ── ShowCard ──────────────────────────────────────────────────────────────────
function ShowCard({ show, inList, onToggleList }: { show: Show; inList: boolean; onToggleList: (id: string) => void }) {
  return (
    <div className="group relative shrink-0 w-[145px] cursor-pointer">
      <div className="relative w-[145px] h-[207px] rounded-lg overflow-hidden">
        <img src={show.thumb} alt={show.title} className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110" />
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2 px-2">
          <button aria-label={`Play ${show.title}`} className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:bg-white/90 transition-colors">
            <PlayFilled size={22} />
          </button>
          <div className="text-center">
            <p className="text-white text-xs font-bold leading-tight line-clamp-1">{show.title}</p>
            <p className="text-white/60 text-[10px] mt-0.5">{show.year} · {show.duration}</p>
          </div>
          <div className="flex items-center gap-1">
            <Star /><span className="text-amber-400 text-[10px] font-semibold">{show.rating}</span>
            <span className="text-white/40 text-[10px]">· {show.genre}</span>
          </div>
          <span className="text-[9px] border border-white/30 text-white/60 px-1.5 py-0.5 rounded">{show.age}</span>
        </div>
        <button aria-label={inList ? 'Remove from list' : 'Add to list'}
          onClick={(e) => { e.stopPropagation(); onToggleList(show.id); }}
          className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 ${
            inList ? 'bg-amber-400 text-black' : 'bg-black/60 border border-white/40 text-white hover:bg-white/20'
          }`}>
          {inList ? <Check size={14} /> : <Plus size={14} />}
        </button>
        {show.progress !== undefined && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div className="h-full bg-amber-400 rounded-r" style={{ width: `${show.progress}%` }} />
          </div>
        )}
      </div>
      <p className="mt-2 text-white/70 text-xs font-medium line-clamp-1 group-hover:text-white transition-colors">{show.title}</p>
      {show.progress !== undefined && <p className="text-white/40 text-[10px]">{show.progress}% watched</p>}
    </div>
  );
}

// ── ContentRow ────────────────────────────────────────────────────────────────
function ContentRow({ title, shows, myList, onToggleList }: { title: string; shows: Show[]; myList: Set<string>; onToggleList: (id: string) => void }) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 'left' | 'right') => ref.current?.scrollBy({ left: dir === 'right' ? 480 : -480, behavior: 'smooth' });

  return (
    <div className="group/section">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-bold text-xl tracking-tight">{title}</h2>
        <button className="text-amber-400 text-sm font-medium hover:text-amber-300 transition-colors opacity-0 group-hover/section:opacity-100">See All</button>
      </div>
      <div className="relative">
        <button onClick={() => scroll('left')} aria-label="Scroll left"
          className="absolute left-0 top-[103px] -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 rounded-full bg-[#0f0f0f]/90 border border-white/10 text-white flex items-center justify-center opacity-0 group-hover/section:opacity-100 hover:bg-white/10 transition-all duration-200 shadow-xl">
          <ChevLeft />
        </button>
        <div ref={ref} className="flex gap-3 overflow-x-auto pb-4" style={{ scrollbarWidth: 'none' }}>
          {shows.map((show) => <ShowCard key={show.id} show={show} inList={myList.has(show.id)} onToggleList={onToggleList} />)}
        </div>
        <button onClick={() => scroll('right')} aria-label="Scroll right"
          className="absolute right-0 top-[103px] -translate-y-1/2 translate-x-4 z-10 w-10 h-10 rounded-full bg-[#0f0f0f]/90 border border-white/10 text-white flex items-center justify-center opacity-0 group-hover/section:opacity-100 hover:bg-white/10 transition-all duration-200 shadow-xl">
          <ChevRight />
        </button>
      </div>
    </div>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function HeroSection({ myList, onToggleList }: { myList: Set<string>; onToggleList: (id: string) => void }) {
  const [idx, setIdx]     = useState(0);
  const [paused, setPaused] = useState(false);
  const [muted, setMuted]   = useState(true);
  const activeVideoRef = useRef<HTMLVideoElement | null>(null);
  const slide = HERO[idx];

  // Keep active video muted state in sync after mount
  useEffect(() => {
    if (activeVideoRef.current) activeVideoRef.current.muted = muted;
  }, [muted]);

  // Auto-advance
  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % HERO.length), 8000);
    return () => clearInterval(t);
  }, [paused]);

  const goto = useCallback((next: number) => setIdx(next), []);

  return (
    <section
      className="relative overflow-hidden"
      style={{ height: 'calc(88vh - 64px)', minHeight: 500 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* ── Video background — crossfades between slides ── */}
      <AnimatePresence mode="sync">
        <motion.video
          key={slide.id}
          ref={(el: HTMLVideoElement | null) => {
            activeVideoRef.current = el;
            if (el) { el.muted = muted; el.play().catch(() => {}); }
          }}
          src={slide.video}
          autoPlay loop playsInline
          className="absolute inset-0 w-full h-full object-cover object-top"
          style={{ zIndex: 0 }}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.7, ease: 'easeInOut' }}
        />
      </AnimatePresence>

      {/* Gradient overlays */}
      <div className="absolute inset-0" style={{ zIndex: 2, background: 'linear-gradient(90deg, #0a0a0a 28%, rgba(10,10,10,0.75) 55%, transparent 80%)' }} />
      <div className="absolute inset-0" style={{ zIndex: 2, background: 'linear-gradient(0deg, #0a0a0a 0%, rgba(10,10,10,0.4) 30%, transparent 60%)' }} />
      <div className="absolute inset-0" style={{ zIndex: 2, background: 'linear-gradient(180deg, rgba(10,10,10,0.4) 0%, transparent 20%)' }} />

      {/* Mute toggle */}
      <button onClick={() => setMuted(m => !m)} aria-label={muted ? 'Unmute' : 'Mute'}
        className="absolute top-4 right-3 z-20 w-9 h-9 rounded-full flex items-center justify-center cursor-pointer"
        style={{ background: 'rgba(0,0,0,0.55)', border: '1.5px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)' }}>
        {muted
          ? <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
          : <svg width={15} height={15} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
        }
      </button>

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end px-10 lg:px-20 pb-20 max-w-2xl">
        <AnimatePresence mode="wait">
          <motion.div key={slide.id + '-text'}
            initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.4, delay: 0.2 }}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-xs tracking-[0.2em] uppercase font-bold text-amber-400 bg-amber-400/10 border border-amber-400/25 px-3 py-1 rounded-full">
                HushTales Original
              </span>
            </div>
            <h1 className="text-5xl sm:text-6xl font-black text-white leading-none tracking-tight mb-2">{slide.title}</h1>
            <p className="text-white/50 text-xs tracking-[0.3em] uppercase mb-4">{slide.subtitle}</p>
            <div className="flex items-center gap-2.5 mb-3 flex-wrap">
              <span className={`text-sm font-semibold ${parseFloat(slide.rating) >= 7.5 ? 'text-green-400' : 'text-amber-400'}`}>★ {slide.rating}</span>
              <span className="w-1 h-1 bg-white/25 rounded-full" />
              <span className="text-white/60 text-sm">{slide.year}</span>
              {slide.seasons && (<><span className="w-1 h-1 bg-white/25 rounded-full" /><span className="text-white/60 text-sm">{slide.seasons}</span></>)}
              <span className="w-1 h-1 bg-white/25 rounded-full" />
              <span className="text-white/60 text-sm">{slide.genre}</span>
            </div>
            {slide.id === 'h1' && (
              <p className="text-sm mb-3"><span className="text-red-500 font-bold">{slide.streams}</span><span className="text-white/60"> Streams worldwide</span></p>
            )}
            <p className="text-white/60 text-sm leading-relaxed line-clamp-2 max-w-md mb-8">{slide.desc}</p>
            <div className="flex items-center gap-3 flex-wrap">
              <button className="flex items-center gap-2 bg-white text-black font-bold text-base px-8 py-3 rounded-full hover:bg-white/90 transition-colors shadow-lg">
                <PlayFilled size={18} />Play
              </button>
              <button onClick={() => onToggleList(slide.id)}
                className={`flex items-center gap-2 font-semibold text-sm px-6 py-3 rounded-full border transition-all duration-200 ${
                  myList.has(slide.id) ? 'bg-amber-400 border-amber-400 text-black' : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
                }`}>
                {myList.has(slide.id) ? <Check size={16} /> : <Plus size={16} />}
                {myList.has(slide.id) ? 'Saved' : 'My List'}
              </button>
              <button className="flex items-center gap-2 bg-white/10 border border-white/20 text-white font-semibold text-sm px-6 py-3 rounded-full hover:bg-white/20 transition-colors">
                <Info size={16} />More Info
              </button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Prev / Next */}
      <button onClick={() => goto((idx - 1 + HERO.length) % HERO.length)} aria-label="Previous"
        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 border border-white/15 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
        style={{ zIndex: 10 }}>
        <ChevLeft />
      </button>
      <button onClick={() => goto((idx + 1) % HERO.length)} aria-label="Next"
        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 border border-white/15 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
        style={{ zIndex: 10 }}>
        <ChevRight />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2" style={{ zIndex: 10 }}>
        {HERO.map((_, i) => (
          <button key={i} onClick={() => goto(i)} aria-label={`Slide ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${i === idx ? 'w-7 h-2 bg-amber-400' : 'w-2 h-2 bg-white/30 hover:bg-white/50'}`} />
        ))}
      </div>
    </section>
  );
}

// ── CTA Banner ────────────────────────────────────────────────────────────────
function CtaBanner() {
  return (
    <section className="mx-6 my-8 rounded-3xl overflow-hidden relative" style={{ background: 'linear-gradient(135deg, #1a0a2e 0%, #0f172a 40%, #1a1000 100%)' }}>
      <div className="absolute inset-0 opacity-30" style={{ background: 'radial-gradient(circle at 30% 50%, #7c3aed 0%, transparent 60%), radial-gradient(circle at 70% 50%, #d97706 0%, transparent 60%)' }} />
      <div className="relative z-10 flex flex-col sm:flex-row items-center justify-between px-10 py-10 gap-6">
        <div>
          <p className="text-amber-400 text-xs font-bold tracking-[0.25em] uppercase mb-2">HushTales Studio</p>
          <h3 className="text-white text-2xl sm:text-3xl font-black leading-tight mb-2">
            Create a story<br /><span className="text-amber-400">in mum&apos;s voice</span>
          </h3>
          <p className="text-white/55 text-sm max-w-xs">Record once. AI turns it into personalised animated bedtime stories — forever.</p>
        </div>
        <Link href="/generate" className="shrink-0 bg-amber-400 hover:bg-amber-300 text-black font-bold text-base px-8 py-3.5 rounded-full transition-colors shadow-lg">
          Start Creating
        </Link>
      </div>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Home1Page() {
  const [myList, setMyList] = useState<Set<string>>(new Set());
  const toggleList = (id: string) => setMyList((prev) => { const next = new Set(prev); next.has(id) ? next.delete(id) : next.add(id); return next; });

  return (
    <div className="bg-[#0a0a0a] min-h-screen -mt-16" style={{ fontFamily: 'var(--font-nunito), sans-serif' }}>
      <HeroSection myList={myList} onToggleList={toggleList} />
      <div className="px-10 lg:px-20 py-10 space-y-12">
        <ContentRow title="Continue Watching" shows={CONTINUE}  myList={myList} onToggleList={toggleList} />
        <ContentRow title="New This Week"     shows={NEW_WEEK}  myList={myList} onToggleList={toggleList} />
        <ContentRow title="Trending Now"      shows={TRENDING}  myList={myList} onToggleList={toggleList} />
      </div>
      <CtaBanner />
      <div className="h-10" />
    </div>
  );
}
