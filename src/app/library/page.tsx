/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';

// ─── Assets ───────────────────────────────────────────────────────────────────
const A = {
  heroBg:    'https://www.figma.com/api/mcp/asset/623e1b7e-7cde-49f5-aa3a-bb6532351c6d',
  avatar:    'https://www.figma.com/api/mcp/asset/001cad2c-13ef-4e7e-bd61-3ea9006a9400',
  showTitle: 'https://www.figma.com/api/mcp/asset/8e49b43c-8284-48ff-b955-a83b1329e4af',
  logoIcon:  'https://www.figma.com/api/mcp/asset/e5cf3592-214a-4cea-8bc5-e4868d24875a',
  iconSearch:'https://www.figma.com/api/mcp/asset/ec406cd0-4607-49a4-a95f-be5780dd6771',
  iconGear:  'https://www.figma.com/api/mcp/asset/f5d38c21-cb3c-40d0-8fea-9b7da11e8112',
  iconBell:  'https://www.figma.com/api/mcp/asset/3ed23f07-60e9-4b58-a35e-fb1d846d3ff0',
  iconPlay:  'https://www.figma.com/api/mcp/asset/385d96ca-3082-41e9-9229-34c0de434a2d',
} as const;

// ─── Data ─────────────────────────────────────────────────────────────────────
type Episode = {
  id: string; number: string; season: number;
  title: string; description: string; duration: string;
  thumbnail: string; progress: number;
};

const ALL_EPISODES: Episode[] = [
  {
    id: 'e1', number: 'E1', season: 1, duration: '48:23', progress: 100,
    title: 'The Handmaidens',
    description: 'Offred arrives at the Commander\'s home and begins her dangerous life as a Handmaid in the oppressive theocratic regime of Gilead.',
    thumbnail: 'https://www.figma.com/api/mcp/asset/2bc1ca07-2609-408d-afd9-6cb1ad5a2815',
  },
  {
    id: 'e2', number: 'E2', season: 1, duration: '51:10', progress: 62,
    title: 'The Handmaidens Origins',
    description: 'Offred recalls her life before Gilead — her relationship with Luke and how the world she knew was taken from her piece by piece.',
    thumbnail: 'https://www.figma.com/api/mcp/asset/5112773e-795a-451d-8840-1b1bbbb2cc7f',
  },
  {
    id: 'e3', number: 'E3', season: 1, duration: '55:42', progress: 0,
    title: 'Death Of Handmaiden',
    description: 'A disturbing execution ritual forces the Handmaids to confront the brutality of Gilead. Offred encounters a familiar face.',
    thumbnail: 'https://www.figma.com/api/mcp/asset/8a51b80f-0edf-44fa-bc8a-6ac620c4821c',
  },
  {
    id: 'e4', number: 'E4', season: 1, duration: '49:55', progress: 0,
    title: 'Reborn of Handmaidens',
    description: 'The Commander breaks protocol by inviting Offred for a secret meeting. Nick warns her that she is being watched.',
    thumbnail: 'https://www.figma.com/api/mcp/asset/89d4b2b1-2ec1-46a7-a6d1-b5c02ec7c211',
  },
];

// ─── Atoms ────────────────────────────────────────────────────────────────────

function Logomark() {
  return (
    <div className="w-8 h-8 bg-[#4f46e5] rounded-xl border border-white/20 flex items-center justify-center shadow-[0_4px_16px_rgba(79,70,229,0.4)] shrink-0">
      <img src={A.logoIcon} alt="" width={14} height={18} />
    </div>
  );
}

function Badge({ children, variant = 'glass' }: { children: React.ReactNode; variant?: 'glass' | 'solid' | 'outline' }) {
  const cls = {
    glass:   'bg-white/10 border border-white/20 backdrop-blur-md text-white/90',
    solid:   'bg-[#4f46e5]/20 border border-[#4f46e5]/40 text-[#a5b4fc]',
    outline: 'border border-white/30 text-white/70',
  }[variant];
  return (
    <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold tracking-wide whitespace-nowrap ${cls}`}>
      {children}
    </span>
  );
}

function PlayIcon({ size = 20 }: { size?: number }) {
  return (
    <svg width={size} height={size} viewBox="0 0 24 24" fill="currentColor">
      <path d="M8 5.14v14l11-7-11-7z" />
    </svg>
  );
}

function PlusIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function InfoIcon() {
  return (
    <svg width={18} height={18} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <circle cx="12" cy="12" r="10" />
      <path d="M12 16v-4M12 8h.01" />
    </svg>
  );
}

function ChevronDown() {
  return (
    <svg width={20} height={20} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
      <path d="M6 9l6 6 6-6" />
    </svg>
  );
}

// ─── Navbar ───────────────────────────────────────────────────────────────────

function Navbar({ scrolled }: { scrolled: boolean }) {
  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        scrolled
          ? 'bg-[#0a0a0a]/95 backdrop-blur-xl border-b border-white/[0.06] shadow-xl'
          : 'bg-transparent'
      }`}
      style={{ fontFamily: 'var(--font-plus-jakarta), sans-serif' }}
    >
      <div className="flex items-center gap-6 px-8 py-4">

        {/* Logo */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
          <Logomark />
          <span className="text-xl font-semibold text-white/90 tracking-tight group-hover:text-white transition-colors">
            HushTales
          </span>
          <span className="text-xs font-semibold text-amber-400 bg-amber-400/10 border border-amber-400/30 px-2 py-0.5 rounded-full tracking-widest uppercase">
            Home 2
          </span>
        </Link>

        {/* Nav links — same 3 items as global navbar */}
        <div className="hidden lg:flex items-center gap-1 ml-4">
          {([
            { href: '/home1',   label: 'Home 1'  },
            { href: '/library', label: 'Home 2'  },
            { href: '/kids',    label: '🐨 Kids' },
          ] as const).map(({ href, label }) => (
            <Link
              key={href}
              href={href}
              className={`px-3.5 py-1.5 rounded-full text-sm font-medium transition-colors ${
                href === '/library'
                  ? 'text-white bg-white/10'
                  : 'text-white/55 hover:text-white hover:bg-white/10'
              }`}
            >
              {label}
            </Link>
          ))}
        </div>

        <div className="flex-1" />

        {/* Search */}
        <div className="hidden md:flex items-center gap-2.5 bg-white/8 hover:bg-white/12 border border-white/10 rounded-full px-4 py-2 w-52 cursor-text transition-colors group">
          <img src={A.iconSearch} alt="" className="w-4 h-4 opacity-50 group-hover:opacity-70 transition-opacity" />
          <span className="text-sm text-white/40">Search stories…</span>
        </div>

        {/* Icons */}
        <div className="flex items-center gap-2">
          <button aria-label="Settings" className="w-9 h-9 rounded-full bg-white/8 hover:bg-white/15 flex items-center justify-center transition-colors">
            <img src={A.iconGear} alt="" className="w-4 h-4 opacity-70" />
          </button>
          <button aria-label="Notifications" className="w-9 h-9 rounded-full bg-white/8 hover:bg-white/15 flex items-center justify-center transition-colors relative">
            <img src={A.iconBell} alt="" className="w-4 h-4 opacity-70" />
            <span className="absolute top-1.5 right-1.5 w-1.5 h-1.5 bg-[#4f46e5] rounded-full" />
          </button>
          <button aria-label="Profile" className="relative w-9 h-9 ml-1">
            <img src={A.avatar} alt="Profile" className="w-full h-full rounded-full object-cover ring-2 ring-white/20 hover:ring-white/40 transition-all" />
            <span className="absolute bottom-0 right-0 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#0a0a0a]" />
          </button>
        </div>
      </div>
    </nav>
  );
}

// ─── Hero ─────────────────────────────────────────────────────────────────────

function Hero({ onScrollClick }: { onScrollClick: () => void }) {
  return (
    <section className="relative h-screen overflow-hidden" style={{ fontFamily: 'var(--font-plus-jakarta), sans-serif' }}>

      {/* Background */}
      <img
        src={A.heroBg}
        alt=""
        className="absolute inset-0 w-full h-full object-cover object-center scale-105"
        style={{ filter: 'brightness(0.8)' }}
      />

      {/* Gradient vignette system */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/20 to-transparent" />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/90 via-[#0a0a0a]/30 to-transparent" />
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#0a0a0a]/60 to-transparent" />

      {/* Content */}
      <div className="absolute bottom-0 left-0 px-8 lg:px-16 pb-16 max-w-2xl">

        {/* Genre tags */}
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <Badge variant="glass">Sci-Fi</Badge>
          <Badge variant="glass">Adventure</Badge>
          <Badge variant="glass">Drama</Badge>
          <span className="text-white/30 text-xs mx-1">·</span>
          <Badge variant="solid">TV-MA</Badge>
        </div>

        {/* Show title */}
        <div className="mb-5">
          <img
            src={A.showTitle}
            alt="Handmaiden Tales"
            className="h-16 w-auto object-contain object-left"
            style={{ filter: 'drop-shadow(0 4px 24px rgba(0,0,0,0.6))' }}
          />
        </div>

        {/* Metadata row */}
        <div className="flex items-center gap-3 mb-5 text-sm text-white/60 font-medium">
          <span className="text-emerald-400 font-semibold">98% Match</span>
          <span className="text-white/20">·</span>
          <span>2017</span>
          <span className="text-white/20">·</span>
          <span>3 Seasons</span>
          <span className="text-white/20">·</span>
          <span>46 Episodes</span>
        </div>

        {/* Description */}
        <p className="text-white/70 text-[15px] leading-relaxed mb-8 max-w-xl line-clamp-3">
          In a totalitarian society built on a corrupted ideology, Offred is a Handmaid assigned to
          bear children for an infertile couple. Facing brutality and loss, she clings to the
          fragile hope of finding her daughter and reclaiming her freedom.
        </p>

        {/* CTA buttons */}
        <div className="flex items-center gap-3 flex-wrap">
          <button className="flex items-center gap-2.5 bg-white text-[#0a0a0a] hover:bg-white/90 font-bold text-[15px] px-7 py-3.5 rounded-full transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl">
            <PlayIcon size={18} />
            Play S1 E2
          </button>

          <button className="flex items-center gap-2 bg-white/12 hover:bg-white/20 border border-white/20 text-white font-semibold text-[15px] px-6 py-3.5 rounded-full transition-all backdrop-blur-sm">
            <PlusIcon />
            My List
          </button>

          <button className="flex items-center gap-2 bg-white/8 hover:bg-white/15 border border-white/15 text-white/80 hover:text-white font-semibold text-[15px] px-6 py-3.5 rounded-full transition-all backdrop-blur-sm">
            <InfoIcon />
            More Info
          </button>
        </div>
      </div>

      {/* Currently watching strip */}
      <div className="absolute bottom-0 right-0 left-0 h-1 bg-gradient-to-r from-transparent via-[#4f46e5]/60 to-transparent" />

      {/* Scroll hint */}
      <button
        onClick={onScrollClick}
        aria-label="Scroll to episodes"
        className="absolute bottom-6 right-8 flex flex-col items-center gap-1 text-white/30 hover:text-white/60 transition-colors"
      >
        <span className="text-[11px] font-medium tracking-widest uppercase">Episodes</span>
        <ChevronDown />
      </button>
    </section>
  );
}

// ─── Episode Card ─────────────────────────────────────────────────────────────

function EpisodeCard({ ep, isCurrent }: { ep: Episode; isCurrent: boolean }) {
  return (
    <article
      className="group relative flex flex-col rounded-2xl overflow-hidden border border-white/8 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300 cursor-pointer"
      style={{ fontFamily: 'var(--font-plus-jakarta), sans-serif' }}
    >
      {/* Thumbnail */}
      <div className="relative overflow-hidden" style={{ aspectRatio: '16/10' }}>
        <img
          src={ep.thumbnail}
          alt={ep.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
        />
        {/* Gradient on thumbnail */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        {/* Play button (appears on hover) */}
        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 hover:bg-white/30 transition-colors shadow-2xl">
            <PlayIcon size={22} />
          </div>
        </div>

        {/* Top badges */}
        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="text-xs font-bold text-white bg-black/50 backdrop-blur-sm border border-white/20 px-2.5 py-1 rounded-full">
            {ep.number}
          </span>
          <span className="text-xs text-white/70 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">
            {ep.duration}
          </span>
        </div>

        {/* Current indicator */}
        {isCurrent && (
          <div className="absolute top-3 right-3">
            <span className="text-[10px] font-bold text-white bg-[#4f46e5] px-2 py-1 rounded-full tracking-wide uppercase">
              Watching
            </span>
          </div>
        )}

        {/* Logo watermark */}
        <div className="absolute bottom-3 right-3 opacity-80">
          <div className="w-6 h-6 bg-[#4f46e5] rounded-lg flex items-center justify-center border border-white/20">
            <img src={A.logoIcon} alt="" width={10} height={12} />
          </div>
        </div>
      </div>

      {/* Progress bar */}
      {ep.progress > 0 && (
        <div className="h-[3px] bg-white/10">
          <div
            className="h-full bg-[#4f46e5] rounded-full transition-all"
            style={{ width: `${ep.progress}%` }}
          />
        </div>
      )}

      {/* Card body */}
      <div className="flex flex-col gap-2 p-4 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[15px] font-semibold text-white leading-snug group-hover:text-white/90">
            {ep.title}
          </h3>
          {ep.progress === 100 && (
            <svg className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d="M20 6L9 17l-5-5" />
            </svg>
          )}
        </div>
        <p className="text-[13px] text-white/45 leading-relaxed line-clamp-2">
          {ep.description}
        </p>

        {ep.progress > 0 && ep.progress < 100 && (
          <div className="mt-auto pt-2 flex items-center gap-2">
            <div className="flex-1 h-1 bg-white/10 rounded-full">
              <div className="h-full bg-[#4f46e5] rounded-full" style={{ width: `${ep.progress}%` }} />
            </div>
            <span className="text-[11px] text-white/40 font-medium shrink-0">{ep.progress}%</span>
          </div>
        )}
      </div>
    </article>
  );
}

// ─── Episodes Section ─────────────────────────────────────────────────────────

function EpisodesSection({ sectionRef }: { sectionRef: React.RefObject<HTMLElement | null> }) {
  const [activeSeason, setActiveSeason] = useState(1);
  const seasons = [1, 2, 3];
  const episodes = ALL_EPISODES.filter((e) => e.season === activeSeason);
  const currentEp = episodes.find((e) => e.progress > 0 && e.progress < 100);

  return (
    <section
      ref={sectionRef}
      className="relative bg-[#0a0a0a] pt-12 pb-24 px-8 lg:px-16"
      style={{ fontFamily: 'var(--font-plus-jakarta), sans-serif' }}
    >
      {/* Top edge gradient blending with hero */}
      <div className="absolute -top-20 left-0 right-0 h-20 bg-gradient-to-b from-transparent to-[#0a0a0a] pointer-events-none" />

      {/* Section header */}
      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-6">
          <h2 className="text-xl font-extrabold text-white tracking-tight">All Episodes</h2>

          {/* Season tabs */}
          <div className="flex items-center gap-1 bg-white/[0.04] border border-white/8 rounded-full p-1">
            {seasons.map((s) => (
              <button
                key={s}
                onClick={() => setActiveSeason(s)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                  activeSeason === s
                    ? 'bg-[#4f46e5] text-white shadow-lg shadow-[#4f46e5]/30'
                    : 'text-white/45 hover:text-white/70'
                }`}
              >
                S{s}
              </button>
            ))}
          </div>
        </div>

        <div className="flex items-center gap-3">
          <span className="text-sm text-white/35 font-medium">
            {activeSeason === 1 ? '4 episodes' : activeSeason === 2 ? '13 episodes' : '13 episodes'}
          </span>
          <button className="flex items-center gap-1.5 text-white/50 hover:text-white text-sm font-semibold transition-colors">
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M3 6h18M7 12h10M11 18h2" />
            </svg>
            Filter
          </button>
        </div>
      </div>

      {/* Continue watching prompt */}
      {currentEp && activeSeason === 1 && (
        <div className="flex items-center gap-4 bg-[#4f46e5]/10 border border-[#4f46e5]/25 rounded-2xl px-5 py-4 mb-8">
          <div className="w-10 h-10 bg-[#4f46e5]/20 rounded-full flex items-center justify-center shrink-0">
            <PlayIcon size={16} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-semibold text-white">Continue watching</p>
            <p className="text-xs text-white/50 mt-0.5">{currentEp.number} · {currentEp.title} · {currentEp.progress}% complete</p>
          </div>
          <button className="shrink-0 bg-[#4f46e5] hover:bg-[#4338ca] text-white text-sm font-semibold px-5 py-2 rounded-full transition-colors">
            Resume
          </button>
        </div>
      )}

      {/* Season 1: episode grid */}
      {activeSeason === 1 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {episodes.map((ep) => (
            <EpisodeCard key={ep.id} ep={ep} isCurrent={ep.id === currentEp?.id} />
          ))}
        </div>
      ) : (
        /* Seasons 2-3: coming soon placeholder */
        <div className="flex flex-col items-center justify-center py-24 gap-4 border border-dashed border-white/10 rounded-3xl">
          <div className="w-16 h-16 bg-white/[0.04] rounded-2xl flex items-center justify-center mb-2">
            <svg width={28} height={28} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={1.5} className="text-white/25">
              <path d="M15 10l4.553-2.276A1 1 0 0121 8.723v6.554a1 1 0 01-1.447.894L15 14M3 8a2 2 0 012-2h8a2 2 0 012 2v8a2 2 0 01-2 2H5a2 2 0 01-2-2V8z" />
            </svg>
          </div>
          <p className="text-white/40 font-semibold text-base">Season {activeSeason} coming soon</p>
          <p className="text-white/25 text-sm">Be the first to know when new episodes drop</p>
          <button className="mt-2 bg-white/6 hover:bg-white/10 border border-white/10 text-white/60 hover:text-white text-sm font-semibold px-5 py-2.5 rounded-full transition-colors">
            Notify Me
          </button>
        </div>
      )}
    </section>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function LibraryPage() {
  const [scrolled, setScrolled] = useState(false);
  const episodesRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 60);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const scrollToEpisodes = () => {
    episodesRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  return (
    <div className="bg-[#0a0a0a] min-h-screen">
      <Navbar scrolled={scrolled} />
      <Hero onScrollClick={scrollToEpisodes} />
      <EpisodesSection sectionRef={episodesRef} />
    </div>
  );
}
