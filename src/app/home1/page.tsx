/* eslint-disable @next/next/no-img-element */
'use client';

import { useRef } from 'react';

// Figma assets — valid 7 days (fetched 2026-06-07)
const IMG = {
  heroBg:      'https://www.figma.com/api/mcp/asset/865cd1ea-1eeb-479a-b4ee-c182ecd9b671',
  showLogo:    'https://www.figma.com/api/mcp/asset/c93ca00c-d3c4-4198-8554-83089b35b11d',
  imdbBadge:   'https://www.figma.com/api/mcp/asset/02239bb1-e0a4-47b2-878f-c94900387540',
  netflixN:    'https://www.figma.com/api/mcp/asset/3efd0c2d-b273-4b55-875c-2995611b6a00',
  iconSearch:  'https://www.figma.com/api/mcp/asset/6fbe6781-f98e-4ad7-bc45-b1c9446dac4a',
  iconHome:    'https://www.figma.com/api/mcp/asset/ac007bff-890e-4a8c-8343-16a4b9b2c096',
  iconMovies:  'https://www.figma.com/api/mcp/asset/644d39dd-3519-4f89-b0b1-d07c8c816140',
  iconTv:      'https://www.figma.com/api/mcp/asset/d643aab7-d385-408a-ad0f-0f6cbf48c394',
  iconTrend:   'https://www.figma.com/api/mcp/asset/e8e7cf5f-add2-420d-bc17-cc2a6670bdf3',
  iconPlus:    'https://www.figma.com/api/mcp/asset/8d9f17d5-27ed-400d-8992-0982d42086be',
  iconShuffle: 'https://www.figma.com/api/mcp/asset/c7577696-c70e-4a97-a644-82e29b8684d8',
  arrowRight:  'https://www.figma.com/api/mcp/asset/b0566efe-59f2-4e1e-a59b-fb8d7532cac4',
  // New this week — 8 posters
  p1: 'https://www.figma.com/api/mcp/asset/43da5829-0d13-41b7-a6e9-ebcd7c9c2138',
  p2: 'https://www.figma.com/api/mcp/asset/758daa74-baca-4285-8fc3-1b30095aa10e',
  p3: 'https://www.figma.com/api/mcp/asset/27432a0d-b5f5-4563-aba8-8e6f99dfcd8d',
  p4: 'https://www.figma.com/api/mcp/asset/c9252f18-648c-426b-b441-3ca3941d5d21',
  p5: 'https://www.figma.com/api/mcp/asset/6c7f41ad-aea5-4cb4-bad6-200619f81702',
  p6: 'https://www.figma.com/api/mcp/asset/1fdf3897-2565-461c-af4c-ae43423a49bc',
  p7: 'https://www.figma.com/api/mcp/asset/12524290-9fe6-4145-ba01-fb7cf29f3b4a',
  p8: 'https://www.figma.com/api/mcp/asset/241dfb95-9097-4d01-92cc-a42409b99d75',
  // Trending Now — 8 posters
  t1: 'https://www.figma.com/api/mcp/asset/df0a8b93-a2ad-4348-947f-2210ead9c29d',
  t2: 'https://www.figma.com/api/mcp/asset/05361084-3a3f-441d-962e-91cb152bfc6f',
  t3: 'https://www.figma.com/api/mcp/asset/0bc0c6de-9483-4b0e-b5e4-67870dc05e7c',
  t4: 'https://www.figma.com/api/mcp/asset/11ce9370-0a26-4fda-9353-00752528645a',
  t5: 'https://www.figma.com/api/mcp/asset/dadcd748-53d6-4d52-b40b-abd4a4f677db',
  t6: 'https://www.figma.com/api/mcp/asset/d19ab1f3-2417-4d78-91ee-59de095c310b',
  t7: 'https://www.figma.com/api/mcp/asset/12a7fa4a-332f-4a92-b018-9f5652e0e463',
  t8: 'https://www.figma.com/api/mcp/asset/341c710c-fcb2-443c-b942-38d9512409f6',
} as const;

const NEW_THIS_WEEK = [IMG.p1, IMG.p2, IMG.p3, IMG.p4, IMG.p5, IMG.p6, IMG.p7, IMG.p8] as const;
const TRENDING_NOW  = [IMG.t1, IMG.t2, IMG.t3, IMG.t4, IMG.t5, IMG.t6, IMG.t7, IMG.t8] as const;

// ── Sidebar ────────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { src: IMG.iconSearch,  label: 'Search',   active: false },
  { src: IMG.iconHome,    label: 'Home',     active: true  },
  { src: IMG.iconMovies,  label: 'Movies',   active: false },
  { src: IMG.iconTv,      label: 'TV Shows', active: false },
  { src: IMG.iconTrend,   label: 'Trending', active: false },
  { src: IMG.iconPlus,    label: 'Add',      active: false },
  { src: IMG.iconShuffle, label: 'Shuffle',  active: false },
];

function Sidebar() {
  return (
    <aside className="fixed left-0 top-0 bottom-0 w-[80px] bg-black flex flex-col items-center pt-8 gap-2 z-50">
      <div className="flex flex-col items-center gap-7 mt-16">
        {NAV_ITEMS.map(({ src, label, active }) => (
          <button
            key={label}
            aria-label={label}
            className="relative flex flex-col items-center gap-1 group"
          >
            <div className={`w-[30px] h-[30px] flex items-center justify-center transition-opacity ${active ? 'opacity-100' : 'opacity-60 group-hover:opacity-90'}`}>
              <img src={src} alt={label} className="max-w-full max-h-full object-contain" />
            </div>
            {active && (
              <span className="absolute -bottom-2 left-1/2 -translate-x-1/2 w-7 h-[3px] bg-[#d40000] rounded-full" />
            )}
          </button>
        ))}
      </div>
    </aside>
  );
}

// ── Hero ───────────────────────────────────────────────────────────────────────

function Hero() {
  return (
    <section className="relative overflow-hidden" style={{ height: '58vh', minHeight: 420 }}>
      {/* Hero background image — covers right ~65% */}
      <div className="absolute inset-0">
        <img
          src={IMG.heroBg}
          alt="Money Heist"
          className="absolute right-0 top-0 h-full object-cover object-center"
          style={{ width: '72%' }}
        />
      </div>

      {/* Gradient layers matching Figma */}
      {/* Left-to-right: solid black → transparent (covers most of left half) */}
      <div
        className="absolute inset-0 pointer-events-none"
        style={{ background: 'linear-gradient(90deg, #000 32%, rgba(0,0,0,0.85) 50%, rgba(0,0,0,0) 72%)' }}
      />
      {/* Bottom fade */}
      <div
        className="absolute bottom-0 left-0 right-0 pointer-events-none"
        style={{ height: '45%', background: 'linear-gradient(to top, #000 0%, transparent 100%)' }}
      />
      {/* Right edge fade — creates carousel peek effect */}
      <div
        className="absolute right-0 top-0 bottom-0 pointer-events-none"
        style={{ width: '7%', background: 'linear-gradient(to left, rgba(0,0,0,0.7), transparent)' }}
      />

      {/* Show info */}
      <div className="relative z-10 h-full flex flex-col justify-start pl-12 pt-12">
        {/* N SERIES */}
        <div className="flex items-center gap-2 mb-4">
          <img src={IMG.netflixN} alt="N" className="w-5 h-6 object-contain" />
          <span
            className="text-[#b9bbb9] text-xs font-semibold tracking-[0.35em] uppercase"
            style={{ fontFamily: 'var(--font-nunito), sans-serif' }}
          >
            SERIES
          </span>
        </div>

        {/* Money Heist title logo — mix-blend-screen matches Figma */}
        <div className="mb-3">
          <img
            src={IMG.showLogo}
            alt="Money Heist Part 4"
            className="object-contain object-left"
            style={{ height: 148, mixBlendMode: 'screen' }}
          />
        </div>

        {/* IMDb rating */}
        <div className="flex items-center gap-2.5 mb-2">
          <img src={IMG.imdbBadge} alt="IMDb" className="object-contain" style={{ height: 20 }} />
          <span className="text-white font-semibold text-base" style={{ fontFamily: 'var(--font-nunito), sans-serif' }}>
            8.8/10
          </span>
        </div>

        {/* Streams */}
        <div className="mb-6" style={{ fontFamily: 'var(--font-nunito), sans-serif' }}>
          <span className="text-[#d40000] font-semibold text-base">2B+</span>
          <span className="text-white font-semibold text-base"> Streams</span>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-3">
          <button
            className="text-white text-base font-medium px-8 py-2.5 rounded-[47px] transition-colors"
            style={{ background: '#d40000', fontFamily: 'var(--font-nunito), sans-serif' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#b20000')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#d40000')}
          >
            Play
          </button>
          <button
            className="text-black text-base font-medium px-6 py-2.5 rounded-[42px] transition-colors"
            style={{ background: '#d9d9d9', fontFamily: 'var(--font-nunito), sans-serif' }}
            onMouseEnter={(e) => (e.currentTarget.style.background = '#ffffff')}
            onMouseLeave={(e) => (e.currentTarget.style.background = '#d9d9d9')}
          >
            Watch Trailer
          </button>
        </div>
      </div>
    </section>
  );
}

// ── Content Row ────────────────────────────────────────────────────────────────

function ContentRow({ title, posters }: { title: string; posters: readonly string[] }) {
  const rowRef = useRef<HTMLDivElement>(null);

  function scrollRight() {
    rowRef.current?.scrollBy({ left: 340, behavior: 'smooth' });
  }

  return (
    <div className="relative">
      <h2
        className="text-white font-bold text-[22px] mb-4"
        style={{ fontFamily: 'var(--font-nunito), sans-serif' }}
      >
        {title}
      </h2>
      <div className="relative group/row">
        <div
          ref={rowRef}
          className="flex gap-[10px] overflow-x-auto pb-1"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {posters.map((src, i) => (
            <div
              key={i}
              className="shrink-0 overflow-hidden cursor-pointer rounded-sm hover:scale-[1.04] transition-transform duration-200"
              style={{ width: 145, height: 207 }}
            >
              <img src={src} alt={`Poster ${i + 1}`} className="w-full h-full object-cover" />
            </div>
          ))}
        </div>

        {/* Right arrow — visible on hover */}
        <button
          onClick={scrollRight}
          aria-label="Scroll right"
          className="absolute right-0 top-0 bottom-0 flex items-center justify-center opacity-0 group-hover/row:opacity-100 transition-opacity"
          style={{ width: 77, background: 'linear-gradient(270deg, rgba(0,0,0,0.8) 24%, transparent 99%)' }}
        >
          <img src={IMG.arrowRight} alt="" className="w-9 h-9 object-contain" />
        </button>
      </div>
    </div>
  );
}

// ── Page ───────────────────────────────────────────────────────────────────────

export default function Home1Page() {
  return (
    <div className="bg-black min-h-screen">
      <Sidebar />

      {/* Page label badge */}
      <div className="fixed top-4 right-6 z-50">
        <span
          className="text-xs font-bold text-white/50 tracking-widest uppercase bg-white/5 border border-white/10 px-3 py-1 rounded-full"
          style={{ fontFamily: 'var(--font-nunito), sans-serif' }}
        >
          Home 1
        </span>
      </div>

      <main className="ml-[80px]">
        <Hero />
        <section className="px-8 pt-6 pb-12 bg-black space-y-10">
          <ContentRow title="New this week" posters={NEW_THIS_WEEK} />
          <ContentRow title="Trending Now"  posters={TRENDING_NOW}  />
        </section>
      </main>
    </div>
  );
}
