/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// ── Figma assets (valid 7 days — fetched 2026-06-07) ──────────────────────────
const IMG = {
  heroBg:   'https://www.figma.com/api/mcp/asset/865cd1ea-1eeb-479a-b4ee-c182ecd9b671',
  showLogo: 'https://www.figma.com/api/mcp/asset/c93ca00c-d3c4-4198-8554-83089b35b11d',
  imdb:     'https://www.figma.com/api/mcp/asset/02239bb1-e0a4-47b2-878f-c94900387540',
  netN:     'https://www.figma.com/api/mcp/asset/3efd0c2d-b273-4b55-875c-2995611b6a00',
  p1: 'https://www.figma.com/api/mcp/asset/43da5829-0d13-41b7-a6e9-ebcd7c9c2138',
  p2: 'https://www.figma.com/api/mcp/asset/758daa74-baca-4285-8fc3-1b30095aa10e',
  p3: 'https://www.figma.com/api/mcp/asset/27432a0d-b5f5-4563-aba8-8e6f99dfcd8d',
  p4: 'https://www.figma.com/api/mcp/asset/c9252f18-648c-426b-b441-3ca3941d5d21',
  p5: 'https://www.figma.com/api/mcp/asset/6c7f41ad-aea5-4cb4-bad6-200619f81702',
  p6: 'https://www.figma.com/api/mcp/asset/1fdf3897-2565-461c-af4c-ae43423a49bc',
  p7: 'https://www.figma.com/api/mcp/asset/12524290-9fe6-4145-ba01-fb7cf29f3b4a',
  p8: 'https://www.figma.com/api/mcp/asset/241dfb95-9097-4d01-92cc-a42409b99d75',
  t1: 'https://www.figma.com/api/mcp/asset/df0a8b93-a2ad-4348-947f-2210ead9c29d',
  t2: 'https://www.figma.com/api/mcp/asset/05361084-3a3f-441d-962e-91cb152bfc6f',
  t3: 'https://www.figma.com/api/mcp/asset/0bc0c6de-9483-4b0e-b5e4-67870dc05e7c',
  t4: 'https://www.figma.com/api/mcp/asset/11ce9370-0a26-4fda-9353-00752528645a',
  t5: 'https://www.figma.com/api/mcp/asset/dadcd748-53d6-4d52-b40b-abd4a4f677db',
  t6: 'https://www.figma.com/api/mcp/asset/d19ab1f3-2417-4d78-91ee-59de095c310b',
  t7: 'https://www.figma.com/api/mcp/asset/12a7fa4a-332f-4a92-b018-9f5652e0e463',
  t8: 'https://www.figma.com/api/mcp/asset/341c710c-fcb2-443c-b942-38d9512409f6',
} as const;

// ── Data ──────────────────────────────────────────────────────────────────────
type Show = { id: string; title: string; year: string; duration: string; rating: string; genre: string; age: string; thumb: string; progress?: number };

type HeroSlide = { id: string; bg: string; logo?: string; title?: string; subtitle: string; genre: string; year: string; seasons?: string; rating: string; streams: string; desc: string };

const HERO: HeroSlide[] = [
  {
    id: 'h1', bg: IMG.heroBg, logo: IMG.showLogo,
    subtitle: 'PART 4',
    genre: 'Action · Thriller · Crime',
    year: '2021', seasons: '4 Seasons', rating: '8.8', streams: '2B+',
    desc: 'Eight thieves take hostages in the Royal Mint of Spain as a criminal mastermind manipulates the police from the outside.',
  },
  {
    id: 'h2', bg: IMG.p6, title: 'The Irishman',
    subtitle: 'DIRECTOR\'S CUT',
    genre: 'Crime · Drama · Biography',
    year: '2019', rating: '7.8', streams: '480M+',
    desc: 'An aging hitman recalls his time with the mob and his alleged involvement with the slaying of Jimmy Hoffa.',
  },
  {
    id: 'h3', bg: IMG.p4, title: 'The Perfection',
    subtitle: 'NETFLIX ORIGINAL',
    genre: 'Horror · Thriller',
    year: '2018', rating: '6.3', streams: '350M+',
    desc: 'A troubled musical prodigy seeks out the new star pupil of her former mentor, sending both musicians down a sinister path.',
  },
];

const CONTINUE: Show[] = [
  { id: 'cw1', title: 'Money Heist',       year: '2021', duration: '48 min',  rating: '8.8', genre: 'Action',  age: 'TV-MA', thumb: IMG.p1, progress: 72 },
  { id: 'cw2', title: 'Blockbuster',        year: '2022', duration: '32 min',  rating: '6.1', genre: 'Comedy',  age: 'TV-14', thumb: IMG.p2, progress: 45 },
  { id: 'cw3', title: 'RRR',                year: '2022', duration: '3h 7min', rating: '7.8', genre: 'Action',  age: 'TV-14', thumb: IMG.p3, progress: 21 },
  { id: 'cw4', title: 'Extraction',         year: '2020', duration: '1h 56m',  rating: '6.7', genre: 'Action',  age: 'TV-MA', thumb: IMG.p5, progress: 88 },
  { id: 'cw5', title: 'Jagame Thandhiram',  year: '2021', duration: '2h 28m',  rating: '7.0', genre: 'Action',  age: 'TV-14', thumb: IMG.t5, progress: 60 },
];

const NEW_WEEK: Show[] = [
  { id: 'nw1', title: 'The Mother',    year: '2023', duration: '1h 55m', rating: '5.7', genre: 'Action',  age: 'TV-MA', thumb: IMG.p1 },
  { id: 'nw2', title: 'Blockbuster',   year: '2022', duration: '32 min', rating: '6.1', genre: 'Comedy',  age: 'TV-14', thumb: IMG.p2 },
  { id: 'nw3', title: 'RRR',           year: '2022', duration: '3h 7m',  rating: '7.8', genre: 'Action',  age: 'TV-14', thumb: IMG.p3 },
  { id: 'nw4', title: 'The Perfection',year: '2018', duration: '1h 30m', rating: '6.3', genre: 'Thriller',age: 'TV-MA', thumb: IMG.p4 },
  { id: 'nw5', title: 'Extraction',    year: '2020', duration: '1h 56m', rating: '6.7', genre: 'Action',  age: 'TV-MA', thumb: IMG.p5 },
  { id: 'nw6', title: 'The Irishman',  year: '2019', duration: '3h 29m', rating: '7.8', genre: 'Crime',   age: 'TV-MA', thumb: IMG.p6 },
  { id: 'nw7', title: 'Jagame',        year: '2021', duration: '2h 28m', rating: '7.0', genre: 'Action',  age: 'TV-14', thumb: IMG.p7 },
  { id: 'nw8', title: 'We Were There', year: '2022', duration: '1h 45m', rating: '7.2', genre: 'Drama',   age: 'TV-14', thumb: IMG.p8 },
];

const TRENDING: Show[] = [
  { id: 'tr1', title: 'Night Crawler',  year: '2021', duration: '45 min', rating: '8.1', genre: 'Drama',   age: 'TV-14', thumb: IMG.t1 },
  { id: 'tr2', title: 'Sweet Home',     year: '2020', duration: '53 min', rating: '7.4', genre: 'Horror',  age: 'TV-MA', thumb: IMG.t2 },
  { id: 'tr3', title: 'Kingdom',        year: '2019', duration: '45 min', rating: '8.4', genre: 'Thriller',age: 'TV-MA', thumb: IMG.t3 },
  { id: 'tr4', title: 'D.P.',           year: '2021', duration: '38 min', rating: '8.0', genre: 'Drama',   age: 'TV-MA', thumb: IMG.t4 },
  { id: 'tr5', title: 'Squid Game',     year: '2021', duration: '56 min', rating: '8.0', genre: 'Thriller',age: 'TV-MA', thumb: IMG.t5 },
  { id: 'tr6', title: 'Hellbound',      year: '2021', duration: '1h 5m',  rating: '6.7', genre: 'Horror',  age: 'TV-MA', thumb: IMG.t6 },
  { id: 'tr7', title: 'All of Us',      year: '2022', duration: '52 min', rating: '7.6', genre: 'Action',  age: 'TV-MA', thumb: IMG.t7 },
  { id: 'tr8', title: 'Signal',         year: '2016', duration: '60 min', rating: '8.6', genre: 'Crime',   age: 'TV-14', thumb: IMG.t8 },
];

// ── Icons ─────────────────────────────────────────────────────────────────────
function PlayFilled({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5.14v14l11-7-11-7z" />
    </svg>
  );
}
function Plus({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}
function Check({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path d="M5 13l4 4L19 7" />
    </svg>
  );
}
function Info({ size = 18 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
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
function ChevRight() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path d="M9 18l6-6-6-6" />
    </svg>
  );
}
function Star({ size = 12 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="#F59E0B">
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
    </svg>
  );
}

// ── ShowCard ──────────────────────────────────────────────────────────────────
function ShowCard({
  show,
  inList,
  onToggleList,
}: {
  show: Show;
  inList: boolean;
  onToggleList: (id: string) => void;
}) {
  return (
    <div className="group relative shrink-0 w-[145px] cursor-pointer">
      {/* Poster */}
      <div className="relative w-[145px] h-[207px] rounded-lg overflow-hidden">
        <img
          src={show.thumb}
          alt={show.title}
          className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
        />

        {/* Hover overlay */}
        <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity duration-200 flex flex-col items-center justify-center gap-2 px-2">
          <button
            aria-label={`Play ${show.title}`}
            className="w-12 h-12 rounded-full bg-white text-black flex items-center justify-center shadow-lg hover:bg-white/90 transition-colors"
          >
            <PlayFilled size={22} />
          </button>
          <div className="text-center">
            <p className="text-white text-xs font-bold leading-tight line-clamp-1">{show.title}</p>
            <p className="text-white/60 text-[10px] mt-0.5">{show.year} · {show.duration}</p>
          </div>
          <div className="flex items-center gap-1">
            <Star />
            <span className="text-amber-400 text-[10px] font-semibold">{show.rating}</span>
            <span className="text-white/40 text-[10px]">· {show.genre}</span>
          </div>
          <span className="text-[9px] border border-white/30 text-white/60 px-1.5 py-0.5 rounded">{show.age}</span>
        </div>

        {/* + list button — top-right always visible */}
        <button
          aria-label={inList ? 'Remove from list' : 'Add to list'}
          onClick={(e) => { e.stopPropagation(); onToggleList(show.id); }}
          className={`absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-all duration-200 ${
            inList ? 'bg-amber-400 text-black' : 'bg-black/60 border border-white/40 text-white hover:bg-white/20'
          }`}
        >
          {inList ? <Check size={14} /> : <Plus size={14} />}
        </button>

        {/* Progress bar */}
        {show.progress !== undefined && (
          <div className="absolute bottom-0 left-0 right-0 h-1 bg-white/20">
            <div
              className="h-full bg-amber-400 rounded-r"
              style={{ width: `${show.progress}%` }}
            />
          </div>
        )}
      </div>

      {/* Title below card */}
      <p className="mt-2 text-white/70 text-xs font-medium line-clamp-1 group-hover:text-white transition-colors">
        {show.title}
      </p>
      {show.progress !== undefined && (
        <p className="text-white/40 text-[10px]">{show.progress}% watched</p>
      )}
    </div>
  );
}

// ── ContentRow ────────────────────────────────────────────────────────────────
function ContentRow({
  title,
  shows,
  myList,
  onToggleList,
}: {
  title: string;
  shows: Show[];
  myList: Set<string>;
  onToggleList: (id: string) => void;
}) {
  const ref = useRef<HTMLDivElement>(null);

  const scroll = (dir: 'left' | 'right') => {
    ref.current?.scrollBy({ left: dir === 'right' ? 480 : -480, behavior: 'smooth' });
  };

  return (
    <div className="group/section">
      <div className="flex items-center justify-between mb-4">
        <h2 className="text-white font-bold text-xl tracking-tight">{title}</h2>
        <button className="text-amber-400 text-sm font-medium hover:text-amber-300 transition-colors opacity-0 group-hover/section:opacity-100">
          See All
        </button>
      </div>

      <div className="relative">
        {/* Left arrow */}
        <button
          onClick={() => scroll('left')}
          aria-label="Scroll left"
          className="absolute left-0 top-[103px] -translate-y-1/2 -translate-x-4 z-10 w-10 h-10 rounded-full bg-[#0f0f0f]/90 border border-white/10 text-white flex items-center justify-center opacity-0 group-hover/section:opacity-100 hover:bg-white/10 transition-all duration-200 shadow-xl"
        >
          <ChevLeft />
        </button>

        {/* Cards */}
        <div
          ref={ref}
          className="flex gap-3 overflow-x-auto pb-4"
          style={{ scrollbarWidth: 'none' }}
        >
          {shows.map((show) => (
            <ShowCard
              key={show.id}
              show={show}
              inList={myList.has(show.id)}
              onToggleList={onToggleList}
            />
          ))}
        </div>

        {/* Right arrow */}
        <button
          onClick={() => scroll('right')}
          aria-label="Scroll right"
          className="absolute right-0 top-[103px] -translate-y-1/2 translate-x-4 z-10 w-10 h-10 rounded-full bg-[#0f0f0f]/90 border border-white/10 text-white flex items-center justify-center opacity-0 group-hover/section:opacity-100 hover:bg-white/10 transition-all duration-200 shadow-xl"
        >
          <ChevRight />
        </button>
      </div>
    </div>
  );
}

// ── Hero ──────────────────────────────────────────────────────────────────────
function HeroSection({
  myList,
  onToggleList,
}: {
  myList: Set<string>;
  onToggleList: (id: string) => void;
}) {
  const [idx, setIdx] = useState(0);
  const [paused, setPaused] = useState(false);
  const slide = HERO[idx];

  useEffect(() => {
    if (paused) return;
    const t = setInterval(() => setIdx((i) => (i + 1) % HERO.length), 7000);
    return () => clearInterval(t);
  }, [paused]);

  return (
    <section
      className="relative overflow-hidden"
      style={{ height: 'calc(88vh - 64px)', minHeight: 500 }}
      onMouseEnter={() => setPaused(true)}
      onMouseLeave={() => setPaused(false)}
    >
      {/* Background images — crossfade */}
      {HERO.map((h, i) => (
        <div
          key={h.id}
          className="absolute inset-0 transition-opacity duration-1000"
          style={{ opacity: i === idx ? 1 : 0 }}
        >
          <img src={h.bg} alt="" className="w-full h-full object-cover object-top" />
        </div>
      ))}

      {/* Gradient overlays */}
      <div className="absolute inset-0" style={{ background: 'linear-gradient(90deg, #0a0a0a 28%, rgba(10,10,10,0.75) 55%, transparent 80%)' }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(0deg, #0a0a0a 0%, rgba(10,10,10,0.4) 30%, transparent 60%)' }} />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(180deg, rgba(10,10,10,0.4) 0%, transparent 20%)' }} />

      {/* Content */}
      <div className="relative z-10 h-full flex flex-col justify-end px-10 lg:px-20 pb-20 max-w-2xl">

        {/* Badge */}
        <div className="flex items-center gap-2 mb-4">
          {slide.logo ? (
            <>
              <img src={IMG.netN} alt="N" className="w-4 h-5 object-contain" />
              <span className="text-[#b9bbb9] text-[11px] tracking-[0.35em] uppercase font-semibold">SERIES</span>
            </>
          ) : (
            <span className="text-xs tracking-[0.2em] uppercase font-bold text-amber-400 bg-amber-400/10 border border-amber-400/25 px-3 py-1 rounded-full">
              HushTales Original
            </span>
          )}
        </div>

        {/* Title */}
        {slide.logo ? (
          <img
            src={slide.logo}
            alt="show title"
            className="object-contain object-left mb-2"
            style={{ height: 140, mixBlendMode: 'screen' }}
          />
        ) : (
          <h1 className="text-5xl sm:text-6xl font-black text-white leading-none tracking-tight mb-2">
            {slide.title}
          </h1>
        )}

        {/* Subtitle */}
        <p className="text-white/50 text-xs tracking-[0.3em] uppercase mb-4">{slide.subtitle}</p>

        {/* Metadata */}
        <div className="flex items-center gap-2.5 mb-3 flex-wrap">
          {slide.id === 'h1' && (
            <>
              <img src={IMG.imdb} alt="IMDb" className="h-[18px] object-contain" />
              <span className="text-white font-semibold text-sm">{slide.rating}/10</span>
              <span className="w-1 h-1 bg-white/30 rounded-full" />
            </>
          )}
          <span className={`text-sm font-semibold ${parseFloat(slide.rating) >= 7.5 ? 'text-green-400' : parseFloat(slide.rating) >= 6 ? 'text-amber-400' : 'text-white/60'}`}>
            ★ {slide.rating}
          </span>
          <span className="w-1 h-1 bg-white/25 rounded-full" />
          <span className="text-white/60 text-sm">{slide.year}</span>
          {slide.seasons && (
            <>
              <span className="w-1 h-1 bg-white/25 rounded-full" />
              <span className="text-white/60 text-sm">{slide.seasons}</span>
            </>
          )}
          <span className="w-1 h-1 bg-white/25 rounded-full" />
          <span className="text-white/60 text-sm">{slide.genre}</span>
        </div>

        {/* Streams */}
        {slide.id === 'h1' && (
          <p className="text-sm mb-3">
            <span className="text-red-500 font-bold">{slide.streams}</span>
            <span className="text-white/60"> Streams worldwide</span>
          </p>
        )}

        {/* Description */}
        <p className="text-white/60 text-sm leading-relaxed line-clamp-2 max-w-md mb-8">{slide.desc}</p>

        {/* CTAs */}
        <div className="flex items-center gap-3 flex-wrap">
          <button className="flex items-center gap-2 bg-white text-black font-bold text-base px-8 py-3 rounded-full hover:bg-white/90 transition-colors shadow-lg">
            <PlayFilled size={18} />
            Play
          </button>
          <button
            onClick={() => onToggleList(slide.id)}
            className={`flex items-center gap-2 font-semibold text-sm px-6 py-3 rounded-full border transition-all duration-200 ${
              myList.has(slide.id)
                ? 'bg-amber-400 border-amber-400 text-black'
                : 'bg-white/10 border-white/20 text-white hover:bg-white/20'
            }`}
          >
            {myList.has(slide.id) ? <Check size={16} /> : <Plus size={16} />}
            {myList.has(slide.id) ? 'Saved' : 'My List'}
          </button>
          <button className="flex items-center gap-2 bg-white/10 border border-white/20 text-white font-semibold text-sm px-6 py-3 rounded-full hover:bg-white/20 transition-colors">
            <Info size={16} />
            More Info
          </button>
        </div>
      </div>

      {/* Prev / Next arrow */}
      <button
        onClick={() => setIdx((i) => (i - 1 + HERO.length) % HERO.length)}
        aria-label="Previous"
        className="absolute left-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 border border-white/15 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
      >
        <ChevLeft />
      </button>
      <button
        onClick={() => setIdx((i) => (i + 1) % HERO.length)}
        aria-label="Next"
        className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-black/50 border border-white/15 text-white flex items-center justify-center hover:bg-black/70 transition-colors"
      >
        <ChevRight />
      </button>

      {/* Dot indicators */}
      <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2">
        {HERO.map((_, i) => (
          <button
            key={i}
            onClick={() => setIdx(i)}
            aria-label={`Slide ${i + 1}`}
            className={`rounded-full transition-all duration-300 ${i === idx ? 'w-7 h-2 bg-amber-400' : 'w-2 h-2 bg-white/30 hover:bg-white/50'}`}
          />
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
            Create a story<br />
            <span className="text-amber-400">in mum&apos;s voice</span>
          </h3>
          <p className="text-white/55 text-sm max-w-xs">
            Record once. AI turns it into personalised animated bedtime stories — forever.
          </p>
        </div>
        <Link
          href="/generate"
          className="shrink-0 bg-amber-400 hover:bg-amber-300 text-black font-bold text-base px-8 py-3.5 rounded-full transition-colors shadow-lg"
        >
          Start Creating
        </Link>
      </div>
    </section>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Home1Page() {
  const [myList, setMyList] = useState<Set<string>>(new Set());

  const toggleList = (id: string) =>
    setMyList((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  return (
    <div className="bg-[#0a0a0a] min-h-screen" style={{ fontFamily: 'var(--font-nunito), sans-serif' }}>
      {/* Page identifier */}
      <div className="fixed top-[72px] right-6 z-40">
        <span className="text-[10px] font-bold text-white/30 tracking-[0.3em] uppercase bg-white/5 border border-white/10 px-2.5 py-1 rounded-full">
          Home 1
        </span>
      </div>

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
