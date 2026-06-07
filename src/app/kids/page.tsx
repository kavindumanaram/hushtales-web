/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useRef } from 'react';
import Link from 'next/link';

// ── Local assets ─────────────────────────────────────────────────────────────
const P = [
  '/images/posters/poster1.jpeg', // Barnaby's Glowing Adventure (lantern)
  '/images/posters/poster2.jpeg', // Barnaby's Glowing Adventure (stick)
  '/images/posters/poster3.jpeg', // The Luna Kingdom
  '/images/posters/poster4.jpeg', // The Magical Seas
  '/images/posters/poster5.jpeg', // Captain Luna's Voyage
  '/images/posters/poster6.jpeg', // Aetheria's Skies
] as const;
// Cycle helper — pick poster by index mod 6
const p = (i: number) => P[i % P.length];

// ── Types & Data ─────────────────────────────────────────────────────────────
type KidsShow = {
  id: string;
  title: string;
  emoji: string;
  minAge: number;
  duration: string;
  tag: string;
  thumb: string;
  progress?: number;
  isNew?: boolean;
};

const FEATURED: KidsShow = {
  id: 'f1', title: "Aetheria's Skies", emoji: '🐉',
  minAge: 0, duration: '30 min', tag: 'Fantasy Adventure',
  thumb: p(5), isNew: true,
};

const KEEP_WATCHING: KidsShow[] = [
  { id: 'kw1', title: "Barnaby's Glowing Adventure", emoji: '🐰', minAge: 0, duration: '24 min', tag: 'Fantasy',   thumb: p(0), progress: 65 },
  { id: 'kw2', title: 'The Magical Seas',            emoji: '🚢', minAge: 3, duration: '28 min', tag: 'Adventure', thumb: p(3), progress: 42 },
  { id: 'kw3', title: "Barnaby's Quest",             emoji: '🌙', minAge: 3, duration: '22 min', tag: 'Mystery',   thumb: p(1), progress: 80 },
  { id: 'kw4', title: "Captain Luna's Voyage",       emoji: '⚓', minAge: 4, duration: '25 min', tag: 'Pirates',   thumb: p(4), progress: 30 },
  { id: 'kw5', title: 'The Luna Kingdom',            emoji: '🏰', minAge: 4, duration: '26 min', tag: 'Fantasy',   thumb: p(2), progress: 55 },
];

const AUSSIE_PICKS: KidsShow[] = [
  { id: 'au1', title: "Barnaby's Glowing Adventure", emoji: '🐰', minAge: 0, duration: '24 min', tag: 'Fantasy',   thumb: p(0), isNew: true },
  { id: 'au2', title: "Barnaby's Quest",             emoji: '🌙', minAge: 3, duration: '22 min', tag: 'Mystery',   thumb: p(1) },
  { id: 'au3', title: 'The Luna Kingdom',            emoji: '🏰', minAge: 4, duration: '26 min', tag: 'Fantasy',   thumb: p(2) },
  { id: 'au4', title: 'The Magical Seas',            emoji: '🚢', minAge: 3, duration: '28 min', tag: 'Adventure', thumb: p(3), isNew: true },
  { id: 'au5', title: "Captain Luna's Voyage",       emoji: '⚓', minAge: 4, duration: '25 min', tag: 'Pirates',   thumb: p(4) },
  { id: 'au6', title: "Aetheria's Skies",            emoji: '🐉', minAge: 5, duration: '30 min', tag: 'Dragons',   thumb: p(5) },
  { id: 'au7', title: 'Moonlit Forest',              emoji: '🌲', minAge: 2, duration: '20 min', tag: 'Nature',    thumb: p(0) },
  { id: 'au8', title: 'Dragon Riders',               emoji: '🔥', minAge: 5, duration: '28 min', tag: 'Fantasy',   thumb: p(5) },
];

const TOP_PICKS: KidsShow[] = [
  { id: 'tp1', title: "Aetheria's Skies",            emoji: '🐉', minAge: 5, duration: '30 min', tag: 'Fan Fave',  thumb: p(5), isNew: true },
  { id: 'tp2', title: 'The Magical Seas',            emoji: '🚢', minAge: 3, duration: '28 min', tag: 'Adventure', thumb: p(3) },
  { id: 'tp3', title: 'The Luna Kingdom',            emoji: '🏰', minAge: 4, duration: '26 min', tag: 'Fantasy',   thumb: p(2) },
  { id: 'tp4', title: "Barnaby's Glowing Adventure", emoji: '🐰', minAge: 0, duration: '24 min', tag: 'Magic',     thumb: p(0), isNew: true },
  { id: 'tp5', title: "Captain Luna's Voyage",       emoji: '⚓', minAge: 4, duration: '25 min', tag: 'Pirates',   thumb: p(4) },
  { id: 'tp6', title: "Barnaby's Quest",             emoji: '🌙', minAge: 3, duration: '22 min', tag: 'Mystery',   thumb: p(1) },
  { id: 'tp7', title: 'Ocean Rescue',                emoji: '🐠', minAge: 4, duration: '22 min', tag: 'Ocean',     thumb: p(3) },
  { id: 'tp8', title: 'Sky Dragons',                 emoji: '🌈', minAge: 5, duration: '28 min', tag: 'Fantasy',   thumb: p(5) },
];

const LEARN_PLAY: KidsShow[] = [
  { id: 'lp1', title: 'Numbers with Barnaby',        emoji: '🔢', minAge: 3, duration: '12 min', tag: 'Maths',    thumb: p(0) },
  { id: 'lp2', title: 'Colours of the Sea',          emoji: '🎨', minAge: 2, duration: '10 min', tag: 'Art',      thumb: p(3) },
  { id: 'lp3', title: 'Letters with Luna',           emoji: '🔤', minAge: 3, duration: '15 min', tag: 'ABC',      thumb: p(2), isNew: true },
  { id: 'lp4', title: 'Science on the Ship',         emoji: '🔬', minAge: 5, duration: '18 min', tag: 'Science',  thumb: p(4) },
  { id: 'lp5', title: 'Dragon School',               emoji: '📚', minAge: 5, duration: '20 min', tag: 'Learning', thumb: p(5) },
  { id: 'lp6', title: 'Sing Along Stories',          emoji: '🎵', minAge: 0, duration: '8 min',  tag: 'Music',    thumb: p(1), isNew: true },
  { id: 'lp7', title: 'Build It Together',           emoji: '🛠️', minAge: 6, duration: '18 min', tag: 'STEM',     thumb: p(2) },
  { id: 'lp8', title: "Barnaby's Big Questions",     emoji: '💛', minAge: 4, duration: '14 min', tag: 'Values',   thumb: p(0) },
];

// ── Age filter config ─────────────────────────────────────────────────────────
const AGE_GROUPS = [
  { key: 'all',    label: 'All',       emoji: '⭐', max: 99  },
  { key: 'tiny',   label: 'Tiny Tots', emoji: '🐣', max: 4   },
  { key: 'junior', label: 'Junior',    emoji: '🦘', max: 7   },
  { key: 'big',    label: 'Big Kids',  emoji: '🦁', max: 12  },
] as const;
type AgeKey = typeof AGE_GROUPS[number]['key'];

function filterByAge(shows: KidsShow[], key: AgeKey): KidsShow[] {
  if (key === 'all') return shows;
  const group = AGE_GROUPS.find((g) => g.key === key)!;
  return shows.filter((s) => s.minAge <= group.max);
}

// ── Icons ─────────────────────────────────────────────────────────────────────
function PlayIcon() {
  return (
    <svg width={22} height={22} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5.14v14l11-7-11-7z" />
    </svg>
  );
}
function HeartIcon({ filled }: { filled: boolean }) {
  return (
    <svg width={16} height={16} viewBox="0 0 24 24" fill={filled ? '#FF6B9D' : 'none'} stroke={filled ? '#FF6B9D' : 'currentColor'} strokeWidth={2}>
      <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
    </svg>
  );
}
function ChevRight() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}
function ChevLeft() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path d="M15 18l-6-6 6-6" />
    </svg>
  );
}

// ── Kids Navbar ───────────────────────────────────────────────────────────────
function KidsNavbar({ age, setAge }: { age: AgeKey; setAge: (a: AgeKey) => void }) {
  return (
    <nav className="sticky top-0 z-50 bg-white/95 backdrop-blur-md border-b-2 border-yellow-200 shadow-sm">
      <div className="max-w-7xl mx-auto px-5 py-3 flex items-center gap-4 flex-wrap">

        {/* Logo */}
        <Link href="/library" className="flex items-center gap-2 shrink-0">
          <span className="text-2xl">📚</span>
          <div className="leading-none">
            <span className="text-lg font-black" style={{ background: 'linear-gradient(90deg,#FF6B9D,#9B5DE5,#00B4D8)', WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
              HushTales
            </span>
            <span className="block text-[10px] font-bold text-yellow-500 tracking-wider uppercase -mt-0.5">Kids Zone</span>
          </div>
        </Link>

        {/* Main nav — same 3 items as global navbar */}
        <div className="flex items-center gap-1">
          {([
            { href: '/home1',   label: 'Home 1'  },
            { href: '/library', label: 'Home 2'  },
            { href: '/kids',    label: '🐨 Kids' },
          ] as const).map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-3.5 py-1.5 rounded-full text-sm font-bold transition-all duration-200 ${
                href === '/kids'
                  ? 'bg-[#9B5DE5] text-white shadow-md'
                  : 'text-gray-500 hover:text-gray-800 hover:bg-gray-100'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        {/* Divider */}
        <div className="hidden sm:block w-px h-6 bg-gray-200" />

        {/* Age filter chips */}
        <div className="flex items-center gap-2 flex-wrap">
          {AGE_GROUPS.map((g) => (
            <button
              key={g.key}
              onClick={() => setAge(g.key)}
              className={`flex items-center gap-1 px-3 py-1 rounded-full text-xs font-bold transition-all duration-200 ${
                age === g.key
                  ? 'bg-amber-400 text-black shadow scale-105'
                  : 'bg-gray-100 text-gray-500 hover:bg-yellow-100 hover:text-yellow-700'
              }`}
            >
              <span>{g.emoji}</span>
              <span>{g.label}</span>
            </button>
          ))}
        </div>

        <div className="flex-1" />

        {/* Parent zone */}
        <Link
          href="/library"
          className="shrink-0 flex items-center gap-1.5 bg-gray-800 text-white text-xs font-bold px-4 py-2 rounded-full hover:bg-gray-700 transition-colors"
        >
          🔒 Parent Zone
        </Link>
      </div>
    </nav>
  );
}

// ── Kids Card ─────────────────────────────────────────────────────────────────
function KidsCard({
  show,
  isFav,
  onFav,
  large = false,
}: {
  show: KidsShow;
  isFav: boolean;
  onFav: (id: string) => void;
  large?: boolean;
}) {
  const w = large ? 190 : 160;
  const h = large ? 270 : 224;

  return (
    <div
      className="group relative shrink-0 cursor-pointer"
      style={{ width: w }}
    >
      {/* Poster */}
      <div
        className="relative overflow-hidden rounded-2xl shadow-lg group-hover:shadow-xl transition-all duration-300 group-hover:-translate-y-2"
        style={{ width: w, height: h }}
      >
        <img
          src={show.thumb}
          alt={show.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110"
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col justify-end p-3">
          <button
            aria-label={`Play ${show.title}`}
            className="mx-auto mb-2 w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-xl hover:scale-110 transition-transform"
          >
            <PlayIcon />
          </button>
          <p className="text-white text-xs font-bold text-center line-clamp-1">{show.title}</p>
          <p className="text-white/60 text-[10px] text-center">{show.duration} · {show.tag}</p>
        </div>

        {/* Fav button */}
        <button
          aria-label={isFav ? 'Remove from favourites' : 'Add to favourites'}
          onClick={(e) => { e.stopPropagation(); onFav(show.id); }}
          className="absolute top-2 right-2 w-7 h-7 bg-white/90 rounded-full flex items-center justify-center shadow opacity-0 group-hover:opacity-100 transition-all duration-200 hover:scale-110"
        >
          <HeartIcon filled={isFav} />
        </button>

        {/* NEW badge */}
        {show.isNew && (
          <div className="absolute top-2 left-2 bg-[#FF6B35] text-white text-[9px] font-black px-2 py-0.5 rounded-full uppercase tracking-wide shadow">
            NEW
          </div>
        )}

        {/* Progress bar */}
        {show.progress !== undefined && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-black/30">
            <div
              className="h-full rounded-r-full"
              style={{ width: `${show.progress}%`, background: 'linear-gradient(90deg,#FF6B9D,#9B5DE5)' }}
            />
          </div>
        )}
      </div>

      {/* Title */}
      <p className="mt-2 text-gray-800 text-sm font-bold text-center line-clamp-1 group-hover:text-purple-600 transition-colors">
        {show.emoji} {show.title}
      </p>
      <p className="text-gray-400 text-[11px] text-center">
        {show.progress !== undefined ? `${show.progress}% done` : show.tag}
      </p>
    </div>
  );
}

// ── Kids Row ──────────────────────────────────────────────────────────────────
function KidsRow({
  title,
  emoji,
  shows,
  favs,
  onFav,
  accentColor,
}: {
  title: string;
  emoji: string;
  shows: KidsShow[];
  favs: Set<string>;
  onFav: (id: string) => void;
  accentColor: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const scroll = (dir: 'l' | 'r') =>
    ref.current?.scrollBy({ left: dir === 'r' ? 540 : -540, behavior: 'smooth' });

  if (shows.length === 0) return null;

  return (
    <div className="group/row">
      <div className="flex items-center justify-between mb-5">
        <h2 className="text-xl font-black text-gray-800 flex items-center gap-2">
          <span className="text-2xl">{emoji}</span>
          <span style={{ background: accentColor, WebkitBackgroundClip: 'text', WebkitTextFillColor: 'transparent' }}>
            {title}
          </span>
        </h2>
        <button className="text-sm font-bold text-purple-500 hover:text-purple-700 transition-colors opacity-0 group-hover/row:opacity-100">
          See All →
        </button>
      </div>

      <div className="relative">
        <button
          onClick={() => scroll('l')}
          aria-label="Scroll left"
          className="absolute -left-5 top-1/2 -translate-y-8 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-gray-700 hover:text-purple-600 hover:shadow-xl transition-all opacity-0 group-hover/row:opacity-100 border border-gray-100"
        >
          <ChevLeft />
        </button>

        <div
          ref={ref}
          className="flex gap-4 overflow-x-auto pb-4"
          style={{ scrollbarWidth: 'none' }}
        >
          {shows.map((s) => (
            <KidsCard key={s.id} show={s} isFav={favs.has(s.id)} onFav={onFav} />
          ))}
        </div>

        <button
          onClick={() => scroll('r')}
          aria-label="Scroll right"
          className="absolute -right-5 top-1/2 -translate-y-8 z-10 w-10 h-10 bg-white shadow-lg rounded-full flex items-center justify-center text-gray-700 hover:text-purple-600 hover:shadow-xl transition-all opacity-0 group-hover/row:opacity-100 border border-gray-100"
        >
          <ChevRight />
        </button>
      </div>
    </div>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function HeroSection({ onFav, isFav }: { onFav: (id: string) => void; isFav: boolean }) {
  return (
    <section
      className="relative overflow-hidden"
      style={{
        background: 'linear-gradient(135deg, #FFD166 0%, #FF6B9D 35%, #9B5DE5 65%, #00B4D8 100%)',
        minHeight: 420,
      }}
    >
      {/* Decorative floating shapes */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {[
          { t: '8%',  l: '5%',  s: 60,  o: 0.15, r: '12deg'  },
          { t: '55%', l: '2%',  s: 40,  o: 0.12, r: '-8deg'  },
          { t: '15%', r: '22%', s: 80,  o: 0.10, r2: '20deg' },
          { t: '65%', r: '8%',  s: 50,  o: 0.12, r2: '-15deg'},
          { t: '40%', l: '45%', s: 30,  o: 0.15, r: '5deg'   },
        ].map((d, i) => (
          <div
            key={i}
            className="absolute bg-white rounded-2xl"
            style={{
              top: d.t, left: (d as { l?: string }).l, right: (d as { r?: string }).r,
              width: d.s, height: d.s, opacity: d.o,
              transform: `rotate(${d.r ?? d.r2})`,
            }}
          />
        ))}
        {/* Big circle top-right */}
        <div className="absolute -top-16 -right-16 w-64 h-64 bg-white/10 rounded-full" />
        <div className="absolute -bottom-12 -left-12 w-48 h-48 bg-white/10 rounded-full" />
      </div>

      <div className="relative z-10 flex flex-col lg:flex-row items-center gap-8 px-8 lg:px-16 py-12 max-w-6xl mx-auto">

        {/* Left: text content */}
        <div className="flex-1 text-white">
          {/* Greeting */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-3xl animate-bounce">🦘</span>
            <span className="bg-white/20 text-white text-xs font-black px-3 py-1 rounded-full tracking-widest uppercase backdrop-blur-sm">
              G&apos;day, Explorer!
            </span>
          </div>

          <h1 className="text-4xl sm:text-5xl font-black leading-tight mb-3 drop-shadow-lg">
            What shall we<br />
            <span className="text-yellow-200">watch today? 🌟</span>
          </h1>

          <p className="text-white/85 text-base mb-2 font-medium">
            🎬 <strong>Featured:</strong> {FEATURED.title}
          </p>
          <div className="flex items-center gap-3 mb-6 flex-wrap">
            <span className="bg-white/20 text-white text-xs font-bold px-3 py-1 rounded-full backdrop-blur-sm">
              {FEATURED.tag}
            </span>
            <span className="text-white/70 text-sm">⏱ {FEATURED.duration}</span>
            <span className="text-white/70 text-sm">✅ All Ages</span>
            <span className="bg-green-400/30 text-white text-xs font-bold px-2 py-0.5 rounded-full">
              🇦🇺 Australian
            </span>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            <button className="flex items-center gap-2.5 bg-white text-purple-700 font-black text-base px-8 py-3.5 rounded-full shadow-xl hover:bg-yellow-50 hover:scale-105 transition-all duration-200">
              <PlayIcon />
              Play Now!
            </button>
            <button
              onClick={() => onFav(FEATURED.id)}
              className={`flex items-center gap-2 font-bold text-sm px-6 py-3.5 rounded-full border-2 transition-all duration-200 ${
                isFav
                  ? 'bg-pink-400 border-pink-400 text-white scale-105'
                  : 'border-white/60 text-white hover:bg-white/20'
              }`}
            >
              <HeartIcon filled={isFav} />
              {isFav ? 'Saved! 💖' : 'Favourite'}
            </button>
          </div>
        </div>

        {/* Right: featured poster */}
        <div className="relative shrink-0">
          {/* Glow ring */}
          <div
            className="absolute inset-0 rounded-3xl blur-xl opacity-60"
            style={{ background: 'linear-gradient(135deg,#FFD166,#FF6B9D)', transform: 'scale(1.08)' }}
          />
          <div className="relative w-[200px] sm:w-[240px] h-[290px] sm:h-[340px] rounded-3xl overflow-hidden shadow-2xl border-4 border-white/40 rotate-3 hover:rotate-0 transition-transform duration-500">
            <img src={FEATURED.thumb} alt={FEATURED.title} className="w-full h-full object-cover" />
            {/* NEW ribbon */}
            <div
              className="absolute top-5 -right-8 bg-yellow-400 text-black text-[10px] font-black px-8 py-1 tracking-wider"
              style={{ transform: 'rotate(45deg)' }}
            >
              NEW ✨
            </div>
          </div>
          {/* Fun emoji floating around */}
          <span className="absolute -top-4 -left-4 text-3xl animate-bounce" style={{ animationDelay: '0.2s' }}>⭐</span>
          <span className="absolute -bottom-3 -right-3 text-2xl animate-bounce" style={{ animationDelay: '0.5s' }}>🎉</span>
          <span className="absolute top-1/2 -left-6 text-2xl animate-bounce" style={{ animationDelay: '0.8s' }}>🎈</span>
        </div>
      </div>

      {/* Wave bottom */}
      <div className="absolute bottom-0 left-0 right-0 overflow-hidden" style={{ height: 40 }}>
        <svg viewBox="0 0 1440 40" className="w-full h-full" preserveAspectRatio="none">
          <path d="M0,40 C360,0 1080,40 1440,0 L1440,40 Z" fill="#FFFBF4" />
        </svg>
      </div>
    </section>
  );
}

// ── Fun Stats Bar ─────────────────────────────────────────────────────────────
function StatsBar() {
  return (
    <div className="bg-white border-y border-gray-100 py-4">
      <div className="max-w-6xl mx-auto px-8 flex items-center justify-around flex-wrap gap-4">
        {[
          { emoji: '🎬', value: '500+',  label: 'Stories'       },
          { emoji: '🇦🇺', value: '100%', label: 'Australian'    },
          { emoji: '🌟', value: '4.9★',  label: 'Kids Rating'   },
          { emoji: '👨‍👩‍👧', value: 'Safe',  label: 'Ad-Free Zone' },
        ].map((s) => (
          <div key={s.label} className="text-center">
            <div className="text-2xl mb-0.5">{s.emoji}</div>
            <div className="text-lg font-black text-gray-800">{s.value}</div>
            <div className="text-xs text-gray-500 font-medium">{s.label}</div>
          </div>
        ))}
      </div>
    </div>
  );
}

// ── Parent CTA ────────────────────────────────────────────────────────────────
function ParentCta() {
  return (
    <section className="mx-6 my-10 rounded-3xl overflow-hidden relative bg-gradient-to-r from-violet-600 to-indigo-600 text-white">
      <div className="absolute inset-0 opacity-20" style={{ background: 'url("data:image/svg+xml,%3Csvg width=\'60\' height=\'60\' viewBox=\'0 0 60 60\' xmlns=\'http://www.w3.org/2000/svg\'%3E%3Cg fill=\'none\' fill-rule=\'evenodd\'%3E%3Cg fill=\'%23ffffff\' fill-opacity=\'0.4\'%3E%3Ccircle cx=\'30\' cy=\'30\' r=\'4\'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")' }} />
      <div className="relative flex flex-col sm:flex-row items-center justify-between px-10 py-10 gap-6">
        <div>
          <p className="text-yellow-300 text-xs font-black tracking-[0.25em] uppercase mb-2">For Mums & Dads 👨‍👩‍👧</p>
          <h3 className="text-2xl sm:text-3xl font-black leading-tight mb-2">
            Create a story<br />
            <span className="text-yellow-300">in your voice 🎙️</span>
          </h3>
          <p className="text-white/70 text-sm max-w-xs">
            Record once — HushTales AI turns it into a personalised animated bedtime story your little one will love. 🐨
          </p>
        </div>
        <Link
          href="/generate"
          className="shrink-0 bg-yellow-400 hover:bg-yellow-300 text-black font-black text-base px-8 py-4 rounded-full transition-all hover:scale-105 shadow-xl"
        >
          Start Creating 🎉
        </Link>
      </div>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function KidsZonePage() {
  const [ageKey, setAgeKey] = useState<AgeKey>('all');
  const [favs, setFavs] = useState<Set<string>>(new Set());

  const toggleFav = (id: string) =>
    setFavs((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const keepFiltered   = filterByAge(KEEP_WATCHING, ageKey);
  const aussieFiltered = filterByAge(AUSSIE_PICKS,  ageKey);
  const topFiltered    = filterByAge(TOP_PICKS,     ageKey);
  const learnFiltered  = filterByAge(LEARN_PLAY,    ageKey);

  return (
    <div className="min-h-screen" style={{ background: '#FFFBF4', fontFamily: 'var(--font-nunito), sans-serif' }}>

      <KidsNavbar age={ageKey} setAge={setAgeKey} />

      <HeroSection onFav={toggleFav} isFav={favs.has(FEATURED.id)} />

      <StatsBar />

      {/* Content rows */}
      <div className="max-w-7xl mx-auto px-10 py-10 space-y-14">

        {keepFiltered.length > 0 && (
          <KidsRow
            title="Keep Watching"
            emoji="🎬"
            shows={keepFiltered}
            favs={favs}
            onFav={toggleFav}
            accentColor="linear-gradient(90deg,#FF6B9D,#9B5DE5)"
          />
        )}

        <KidsRow
          title="Aussie Adventures"
          emoji="🇦🇺"
          shows={aussieFiltered}
          favs={favs}
          onFav={toggleFav}
          accentColor="linear-gradient(90deg,#FF6B35,#FFD166)"
        />

        <KidsRow
          title="Today's Top Picks"
          emoji="⭐"
          shows={topFiltered}
          favs={favs}
          onFav={toggleFav}
          accentColor="linear-gradient(90deg,#9B5DE5,#00B4D8)"
        />

        <KidsRow
          title="Learn & Play"
          emoji="📚"
          shows={learnFiltered}
          favs={favs}
          onFav={toggleFav}
          accentColor="linear-gradient(90deg,#06D6A0,#00B4D8)"
        />

        {/* Favourites (only shows if any saved) */}
        {favs.size > 0 && (() => {
          const all = [...KEEP_WATCHING, ...AUSSIE_PICKS, ...TOP_PICKS, ...LEARN_PLAY];
          const deduped = Array.from(new Map(all.map((s) => [s.id, s])).values());
          const favShows = deduped.filter((s) => favs.has(s.id));
          return (
            <KidsRow
              title="My Favourites"
              emoji="💖"
              shows={favShows}
              favs={favs}
              onFav={toggleFav}
              accentColor="linear-gradient(90deg,#FF6B9D,#FFD166)"
            />
          );
        })()}
      </div>

      <ParentCta />

      {/* Footer */}
      <footer className="text-center py-8 text-gray-400 text-xs border-t border-gray-100 bg-white">
        <p className="mb-1">🐨 HushTales Kids — Safe, Australian, Ad-Free</p>
        <p>
          <Link href="/library" className="hover:text-purple-500 transition-colors">Parent Zone</Link>
          {' · '}
          <span>© 2026 HushTales</span>
          {' · '}
          <span>Made with 💛 in Australia</span>
        </p>
      </footer>
    </div>
  );
}
