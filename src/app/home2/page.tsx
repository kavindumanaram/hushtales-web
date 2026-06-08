/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useRef, useEffect } from 'react';
// home2 hero: video-only background

// ─── Assets ───────────────────────────────────────────────────────────────────
const A = {
  heroBg: '/images/banners/banner6.jpeg',
  heroVideo: '/videos/story6.mp4',
  ep1: '/images/banners/banner2.jpeg',
  ep2: '/images/banners/banner3.jpeg',
  ep3: '/images/banners/banner4.jpeg',
  ep4: '/images/banners/banner5.jpeg',
} as const;

// ─── Data ─────────────────────────────────────────────────────────────────────
type Episode = {
  id: string; number: string; season: number;
  title: string; description: string; duration: string;
  thumbnail: string; progress: number;
};

const ALL_EPISODES: Episode[] = [
  {
    id: 'e1', number: 'E1', season: 1, duration: '22:00', progress: 100,
    title: 'The First Morning',
    description: 'Daisy the fawn wakes up in the magical forest for the very first time and meets a sleepy koala named Max up in the gum tree.',
    thumbnail: A.ep1,
  },
  {
    id: 'e2', number: 'E2', season: 1, duration: '24:15', progress: 62,
    title: 'A New Family',
    description: 'Daisy discovers a kangaroo family resting in the sun-dappled clearing and learns what it means to share and belong.',
    thumbnail: A.ep2,
  },
  {
    id: 'e3', number: 'E3', season: 1, duration: '21:30', progress: 0,
    title: 'Dreamtime',
    description: 'As the moon rises over the great tree, Daisy curls up and drifts into a dream filled with fireflies and gentle whispers.',
    thumbnail: A.ep3,
  },
  {
    id: 'e4', number: 'E4', season: 1, duration: '23:45', progress: 0,
    title: "The Kookaburra's Song",
    description: 'A kookaburra perched at twilight teaches Daisy the secret melody that brings all the animals of the bush together.',
    thumbnail: A.ep4,
  },
];

// ─── Atoms ────────────────────────────────────────────────────────────────────
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

// ─── Hero ─────────────────────────────────────────────────────────────────────
function Hero({ onScrollClick }: { onScrollClick: () => void }) {
  const [muted, setMuted] = useState(true);
  const videoRef = useRef<HTMLVideoElement>(null);

  // Sync muted imperatively
  useEffect(() => {
    if (videoRef.current) videoRef.current.muted = muted;
  }, [muted]);

  return (
    <section className="relative h-screen overflow-hidden" style={{ fontFamily: 'var(--font-plus-jakarta), sans-serif' }}>

      {/* ── Video only ── */}
      <video
        ref={videoRef}
        src={A.heroVideo}
        className="absolute inset-0 w-full h-full object-cover object-center"
        autoPlay loop playsInline muted
        style={{ zIndex: 0, filter: 'brightness(0.82)' }}
      />

      {/* Gradient vignette */}
      <div className="absolute inset-0 bg-gradient-to-t from-[#0a0a0a] via-[#0a0a0a]/20 to-transparent" style={{ zIndex: 2 }} />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0a0a0a]/90 via-[#0a0a0a]/30 to-transparent" style={{ zIndex: 2 }} />
      <div className="absolute top-0 left-0 right-0 h-40 bg-gradient-to-b from-[#0a0a0a]/60 to-transparent" style={{ zIndex: 2 }} />

      {/* Mute toggle */}
      <button
        onClick={() => setMuted(m => !m)}
        aria-label={muted ? 'Unmute' : 'Mute'}
        className="absolute top-20 right-6 w-9 h-9 rounded-full flex items-center justify-center cursor-pointer"
        style={{ zIndex: 10, background: 'rgba(0,0,0,0.55)', border: '1.5px solid rgba(255,255,255,0.25)', backdropFilter: 'blur(8px)' }}
      >
        {muted
          ? <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><line x1="23" y1="9" x2="17" y2="15"/><line x1="17" y1="9" x2="23" y2="15"/></svg>
          : <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth={2}><polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>
        }
      </button>

      {/* Content */}
      <div className="absolute bottom-0 left-0 px-8 lg:px-16 pb-16 max-w-2xl" style={{ zIndex: 10 }}>
        <div className="flex items-center gap-2 mb-6 flex-wrap">
          <Badge variant="glass">Nature</Badge>
          <Badge variant="glass">Adventure</Badge>
          <Badge variant="glass">Family</Badge>
          <span className="text-white/30 text-xs mx-1">·</span>
          <Badge variant="solid">G · All Ages</Badge>
        </div>

        <div className="mb-5">
          <h1 className="text-5xl sm:text-6xl font-black text-white leading-none tracking-tight drop-shadow-2xl">
            Daisy&apos;s Forest
          </h1>
          <p className="text-white/50 text-sm tracking-[0.2em] uppercase mt-2">A HushTales Original Series</p>
        </div>

        <div className="flex items-center gap-3 mb-5 text-sm text-white/60 font-medium">
          <span className="text-emerald-400 font-semibold">99% Match</span>
          <span className="text-white/20">·</span>
          <span>2026</span>
          <span className="text-white/20">·</span>
          <span>1 Season</span>
          <span className="text-white/20">·</span>
          <span>4 Episodes</span>
        </div>

        <p className="text-white/70 text-[15px] leading-relaxed mb-8 max-w-xl line-clamp-3">
          Follow Daisy the fawn on a gentle journey through the magical Australian bush — meeting
          koalas, kangaroos and kookaburras — in a bedtime story series crafted to calm little minds
          and spark big imaginations.
        </p>

        <div className="flex items-center gap-3 flex-wrap">
          <button className="flex items-center gap-2.5 bg-white text-[#0a0a0a] hover:bg-white/90 font-bold text-[15px] px-7 py-3.5 rounded-full transition-all hover:scale-[1.02] active:scale-[0.98] shadow-xl">
            <PlayIcon size={18} />Play S1 E2
          </button>
          <button className="flex items-center gap-2 bg-white/12 hover:bg-white/20 border border-white/20 text-white font-semibold text-[15px] px-6 py-3.5 rounded-full transition-all backdrop-blur-sm">
            <PlusIcon />My List
          </button>
          <button className="flex items-center gap-2 bg-white/8 hover:bg-white/15 border border-white/15 text-white/80 hover:text-white font-semibold text-[15px] px-6 py-3.5 rounded-full transition-all backdrop-blur-sm">
            <InfoIcon />More Info
          </button>
        </div>
      </div>

      <div className="absolute bottom-0 right-0 left-0 h-1 bg-gradient-to-r from-transparent via-[#4f46e5]/60 to-transparent" style={{ zIndex: 10 }} />

      <button onClick={onScrollClick} aria-label="Scroll to episodes"
        className="absolute bottom-6 right-8 flex flex-col items-center gap-1 text-white/30 hover:text-white/60 transition-colors"
        style={{ zIndex: 10 }}>
        <span className="text-[11px] font-medium tracking-widest uppercase">Episodes</span>
        <ChevronDown />
      </button>
    </section>
  );
}

// ─── Episode Card ─────────────────────────────────────────────────────────────
function EpisodeCard({ ep, isCurrent }: { ep: Episode; isCurrent: boolean }) {
  return (
    <article className="group relative flex flex-col rounded-2xl overflow-hidden border border-white/8 bg-white/[0.03] hover:bg-white/[0.06] hover:border-white/20 transition-all duration-300 cursor-pointer"
      style={{ fontFamily: 'var(--font-plus-jakarta), sans-serif' }}>
      <div className="relative overflow-hidden" style={{ aspectRatio: '16/10' }}>
        <img src={ep.thumbnail} alt={ep.title}
          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />

        <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-200">
          <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center border border-white/30 hover:bg-white/30 transition-colors shadow-2xl">
            <PlayIcon size={22} />
          </div>
        </div>

        <div className="absolute top-3 left-3 flex items-center gap-2">
          <span className="text-xs font-bold text-white bg-black/50 backdrop-blur-sm border border-white/20 px-2.5 py-1 rounded-full">{ep.number}</span>
          <span className="text-xs text-white/70 bg-black/40 backdrop-blur-sm px-2 py-1 rounded-full">{ep.duration}</span>
        </div>

        {isCurrent && (
          <div className="absolute top-3 right-3">
            <span className="text-[10px] font-bold text-white bg-[#4f46e5] px-2 py-1 rounded-full tracking-wide uppercase">Watching</span>
          </div>
        )}

        <div className="absolute bottom-3 right-3 opacity-80">
          <div className="w-6 h-6 bg-[#4f46e5] rounded-lg flex items-center justify-center border border-white/20">
            <span className="text-white font-black text-[9px]">H</span>
          </div>
        </div>
      </div>

      {ep.progress > 0 && (
        <div className="h-[3px] bg-white/10">
          <div className="h-full bg-[#4f46e5] rounded-full transition-all" style={{ width: `${ep.progress}%` }} />
        </div>
      )}

      <div className="flex flex-col gap-2 p-4 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="text-[15px] font-semibold text-white leading-snug group-hover:text-white/90">{ep.title}</h3>
          {ep.progress === 100 && (
            <svg className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2.5}>
              <path d="M20 6L9 17l-5-5" />
            </svg>
          )}
        </div>
        <p className="text-[13px] text-white/45 leading-relaxed line-clamp-2">{ep.description}</p>
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
    <section ref={sectionRef} className="relative bg-[#0a0a0a] pt-12 pb-24 px-8 lg:px-16"
      style={{ fontFamily: 'var(--font-plus-jakarta), sans-serif' }}>
      <div className="absolute -top-20 left-0 right-0 h-20 bg-gradient-to-b from-transparent to-[#0a0a0a] pointer-events-none" />

      <div className="flex items-center justify-between mb-8">
        <div className="flex items-center gap-6">
          <h2 className="text-xl font-extrabold text-white tracking-tight">All Episodes</h2>
          <div className="flex items-center gap-1 bg-white/[0.04] border border-white/8 rounded-full p-1">
            {seasons.map((s) => (
              <button key={s} onClick={() => setActiveSeason(s)}
                className={`px-4 py-1.5 rounded-full text-sm font-semibold transition-all duration-200 ${
                  activeSeason === s ? 'bg-[#4f46e5] text-white shadow-lg shadow-[#4f46e5]/30' : 'text-white/45 hover:text-white/70'
                }`}>
                S{s}
              </button>
            ))}
          </div>
        </div>
        <div className="flex items-center gap-3">
          <span className="text-sm text-white/35 font-medium">
            {activeSeason === 1 ? '4 episodes' : '13 episodes'}
          </span>
          <button className="flex items-center gap-1.5 text-white/50 hover:text-white text-sm font-semibold transition-colors">
            <svg width={14} height={14} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M3 6h18M7 12h10M11 18h2" />
            </svg>
            Filter
          </button>
        </div>
      </div>

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

      {activeSeason === 1 ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5">
          {episodes.map((ep) => (
            <EpisodeCard key={ep.id} ep={ep} isCurrent={ep.id === currentEp?.id} />
          ))}
        </div>
      ) : (
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
export default function Home2Page() {
  const episodesRef = useRef<HTMLElement>(null);
  const scrollToEpisodes = () => episodesRef.current?.scrollIntoView({ behavior: 'smooth' });

  return (
    <div className="bg-[#0a0a0a] min-h-screen -mt-16">
      <Hero onScrollClick={scrollToEpisodes} />
      <EpisodesSection sectionRef={episodesRef} />
    </div>
  );
}
