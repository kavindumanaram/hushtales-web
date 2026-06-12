/* eslint-disable @next/next/no-img-element */
'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { Play, Heart, Clock, ChevronLeft, ChevronRight, Sparkles } from 'lucide-react';

// ── Keyframes ─────────────────────────────────────────────────────────────────
const KEYFRAMES = `
  @keyframes floatEmoji {
    0%,100% { transform: translateY(0px) rotate(-3deg) scale(1); }
    50%      { transform: translateY(-20px) rotate(5deg) scale(1.08); }
  }
  @keyframes floatEmoji2 {
    0%,100% { transform: translateY(0px) rotate(5deg) scale(1); }
    55%      { transform: translateY(18px) rotate(-6deg) scale(0.94); }
  }
  @keyframes playGlow {
    0%,100% { box-shadow: 0 0 12px 3px rgba(168,85,247,0.55); }
    50%      { box-shadow: 0 0 30px 10px rgba(168,85,247,0.85); }
  }
`;

// ── Assets ────────────────────────────────────────────────────────────────────
const BANNERS = [
  '/images/banners/banner1.jpeg',
  '/images/banners/banner2.jpeg',
  '/images/banners/banner3.jpeg',
  '/images/banners/banner4.jpeg',
  '/images/banners/banner5.jpeg',
  '/images/banners/banner6.jpeg',
];
const POSTERS = [
  '/images/posters/poster1.jpeg',
  '/images/posters/poster2.jpeg',
  '/images/posters/poster3.jpeg',
  '/images/posters/poster4.jpeg',
  '/images/posters/poster5.jpeg',
  '/images/posters/poster6.jpeg',
];

const THEME_BG = [
  'linear-gradient(135deg,#1a0533,#6b1fa2,#c2185b)',
  'linear-gradient(135deg,#0a2744,#155e75,#0891b2)',
  'linear-gradient(135deg,#052e16,#166534,#16a34a)',
  'linear-gradient(135deg,#1e1b4b,#4c1d95,#7c3aed)',
  'linear-gradient(135deg,#082f49,#0c4a6e,#0e7490)',
  'linear-gradient(135deg,#2e1065,#5b21b6,#7c3aed)',
];

// ── Data ──────────────────────────────────────────────────────────────────────
type Story = {
  id: string; title: string; coverImg: string; themeBg: string;
  duration: string; ageMin: number; badge?: string; badgeBg?: string;
  emoji: string; category: string; progress?: number;
};

const STORIES: Story[] = [
  { id: 's1',  title: "Barnaby's Glowing Adventure", coverImg: POSTERS[0], themeBg: THEME_BG[0], duration: '24 min', ageMin: 2, badge: '⭐ Top Pick', badgeBg: '#a855f7', emoji: '🐰', category: 'fantasy', progress: 72 },
  { id: 's2',  title: "Barnaby's Quest",             coverImg: POSTERS[1], themeBg: THEME_BG[1], duration: '22 min', ageMin: 3, badge: '🔥 Hot',     badgeBg: '#ef4444', emoji: '🌙', category: 'fantasy', progress: 45 },
  { id: 's3',  title: 'The Luna Kingdom',            coverImg: POSTERS[2], themeBg: THEME_BG[2], duration: '26 min', ageMin: 4,                                          emoji: '🏰', category: 'fantasy' },
  { id: 's4',  title: 'The Magical Seas',            coverImg: POSTERS[3], themeBg: THEME_BG[3], duration: '28 min', ageMin: 3, badge: '✨ New',     badgeBg: '#22c55e', emoji: '🚢', category: 'adventure' },
  { id: 's5',  title: "Captain Luna's Voyage",       coverImg: POSTERS[4], themeBg: THEME_BG[4], duration: '25 min', ageMin: 4,                                          emoji: '⚓', category: 'adventure', progress: 30 },
  { id: 's6',  title: "Aetheria's Skies",            coverImg: POSTERS[5], themeBg: THEME_BG[5], duration: '30 min', ageMin: 5, badge: '🏆 #1',      badgeBg: '#a855f7', emoji: '🐉', category: 'fantasy' },
  { id: 's7',  title: 'Daisy in the Gum Trees',      coverImg: BANNERS[1], themeBg: THEME_BG[2], duration: '22 min', ageMin: 2, badge: '✨ New',     badgeBg: '#22c55e', emoji: '🌿', category: 'nature' },
  { id: 's8',  title: 'Little Kangaroo Family',      coverImg: BANNERS[2], themeBg: THEME_BG[3], duration: '18 min', ageMin: 2,                                          emoji: '🦘', category: 'nature' },
  { id: 's9',  title: 'Moonlit Dreamer',             coverImg: BANNERS[3], themeBg: THEME_BG[0], duration: '20 min', ageMin: 0, badge: '💛 For You', badgeBg: '#a855f7', emoji: '🌙', category: 'nature' },
  { id: 's10', title: 'The Kookaburra Song',         coverImg: BANNERS[4], themeBg: THEME_BG[1], duration: '22 min', ageMin: 2,                                          emoji: '🐦', category: 'nature' },
  { id: 's11', title: 'The Moonlight Explorer',      coverImg: BANNERS[5], themeBg: THEME_BG[5], duration: '28 min', ageMin: 3, badge: '⭐ Top Pick', badgeBg: '#a855f7', emoji: '🐘', category: 'adventure' },
  { id: 's12', title: 'Daisy Meets Max Koala',       coverImg: BANNERS[0], themeBg: THEME_BG[2], duration: '18 min', ageMin: 2,                                          emoji: '🐨', category: 'nature' },
];

const AGE_FILTERS = [
  { label: 'All',  emoji: '🌟' },
  { label: '2+',   emoji: '🐣' },
  { label: '3-5',  emoji: '🦊' },
  { label: '6-7',  emoji: '🚀' },
  { label: '8+',   emoji: '🐉' },
  { label: 'Cosy', emoji: '🌙' },
];

const CIRCLE_GRADIENTS = [
  'linear-gradient(135deg,#1a0533,#6b1fa2,#c2185b)',
  'linear-gradient(135deg,#1a0a2e,#0d47a1,#1565c0)',
  'linear-gradient(135deg,#0a2744,#155e75,#0891b2)',
  'linear-gradient(135deg,#14532d,#166534,#16a34a)',
  'linear-gradient(135deg,#1c1917,#57534e,#78716c)',
  'linear-gradient(135deg,#020617,#1e3a8a,#1d4ed8)',
];

const CATEGORIES = [
  { id: 'all',       label: 'All',     emoji: '✨' },
  { id: 'fantasy',   label: 'Fantasy', emoji: '🧙' },
  { id: 'adventure', label: 'Venture', emoji: '⚔️' },
  { id: 'nature',    label: 'Nature',  emoji: '🌿' },
];

// ── ArrowScrollRow ────────────────────────────────────────────────────────────
function ArrowScrollRow({ children, gap = 12, px = 20 }: { children: React.ReactNode; gap?: number; px?: number }) {
  const trackRef = useRef<HTMLDivElement>(null);
  const [canLeft,  setCanLeft]  = useState(false);
  const [canRight, setCanRight] = useState(false);

  const checkArrows = useCallback(() => {
    const el = trackRef.current;
    if (!el) return;
    setCanLeft(el.scrollLeft > 4);
    setCanRight(el.scrollLeft < el.scrollWidth - el.clientWidth - 4);
  }, []);

  useEffect(() => {
    const id = setTimeout(checkArrows, 80);
    return () => clearTimeout(id);
  }, [checkArrows, children]);

  const scroll = (dir: 1 | -1) => {
    trackRef.current?.scrollBy({ left: dir * 300, behavior: 'smooth' });
    setTimeout(checkArrows, 360);
  };

  const arrowStyle: React.CSSProperties = {
    position: 'absolute', top: '50%', transform: 'translateY(-50%)', zIndex: 10,
    width: 36, height: 36, borderRadius: '50%',
    background: 'rgba(15,14,35,0.88)', backdropFilter: 'blur(10px)',
    border: '1.5px solid rgba(255,255,255,0.15)',
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    cursor: 'pointer', boxShadow: '0 4px 18px rgba(0,0,0,0.32)', padding: 0,
  };

  return (
    <div style={{ position: 'relative', marginBottom: 8 }}>
      <AnimatePresence>
        {canLeft && (
          <motion.button key="al" initial={{ opacity: 0, scale: 0.75 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.75 }} transition={{ duration: 0.15 }}
            onClick={() => scroll(-1)} style={{ ...arrowStyle, left: 4 }}>
            <ChevronLeft style={{ width: 16, height: 16, color: '#fff' }} />
          </motion.button>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {canRight && (
          <motion.button key="ar" initial={{ opacity: 0, scale: 0.75 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.75 }} transition={{ duration: 0.15 }}
            onClick={() => scroll(1)} style={{ ...arrowStyle, right: 4 }}>
            <ChevronRight style={{ width: 16, height: 16, color: '#fff' }} />
          </motion.button>
        )}
      </AnimatePresence>
      <div ref={trackRef} onScroll={checkArrows}
        style={{ display: 'flex', gap, padding: `0 ${px}px`, overflowX: 'auto', scrollbarWidth: 'none' }}>
        {children}
      </div>
    </div>
  );
}

// ── SectionHeader ─────────────────────────────────────────────────────────────
function SectionHeader({ title, subtitle }: { title: string; subtitle?: string }) {
  return (
    <div style={{ padding: '0 20px', marginBottom: 14 }}>
      <h2 style={{ color: '#0b1220', fontWeight: 900, fontSize: 18, lineHeight: 1.2, letterSpacing: '-0.01em' }}>{title}</h2>
      {subtitle && <p style={{ color: '#9CA3AF', fontSize: 11, marginTop: 2 }}>{subtitle}</p>}
    </div>
  );
}

// ── LandscapeCard ─────────────────────────────────────────────────────────────
function LandscapeCard({ story, index = 0, liked, onLike }: { story: Story; index?: number; liked: boolean; onLike: (id: string) => void }) {
  const [imgErr, setImgErr] = useState(false);
  const showImg = !imgErr;

  return (
    <motion.div
      initial={{ opacity: 0, x: 24 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.06, duration: 0.32 }}
      whileTap={{ scale: 0.96 }}
      style={{
        width: 280, height: 160, flexShrink: 0, borderRadius: 20, overflow: 'hidden', cursor: 'pointer', position: 'relative',
        background: showImg ? '#000' : story.themeBg,
        boxShadow: '0 12px 40px rgba(16,24,40,0.28)',
        border: '1px solid rgba(255,255,255,0.06)',
      }}
    >
      {showImg && (
        <img src={story.coverImg} alt={story.title} onError={() => setImgErr(true)}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }} />
      )}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(2,6,23,0.85) 0%,rgba(2,6,23,0.28) 55%,rgba(2,6,23,0.04) 100%)' }} />

      {/* Top row */}
      <div style={{ position: 'absolute', top: 10, left: 10, right: 10, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
        {story.badge && (
          <span style={{ padding: '3px 9px', borderRadius: 99, fontSize: 10, fontWeight: 800, background: story.badgeBg, color: story.badgeBg === '#a855f7' ? '#ffffff' : '#fff' }}>
            {story.badge}
          </span>
        )}
        <button onClick={e => { e.stopPropagation(); onLike(story.id); }} style={{ marginLeft: 'auto', width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)', border: 'none', cursor: 'pointer' }}>
          <Heart style={{ width: 13, height: 13, color: liked ? '#FF6B9D' : '#fff', fill: liked ? '#FF6B9D' : 'none' }} />
        </button>
      </div>

      {/* Bottom */}
      <div style={{ position: 'absolute', bottom: 10, left: 12, right: 12, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: 0, paddingRight: 8 }}>
          {story.progress !== undefined && (
            <div style={{ display: 'flex', alignItems: 'center', gap: 4, marginBottom: 4 }}>
              <div style={{ flex: 1, height: 3, borderRadius: 99, background: 'rgba(255,255,255,0.2)' }}>
                <div style={{ width: `${story.progress}%`, height: '100%', borderRadius: 99, background: 'linear-gradient(90deg,#a855f7,#7c3aed)' }} />
              </div>
              <span style={{ color: 'rgba(255,255,255,0.5)', fontSize: 9, fontWeight: 600 }}>{story.progress}%</span>
            </div>
          )}
          <p style={{ color: '#fff', fontWeight: 800, fontSize: 13, lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {story.emoji} {story.title}
          </p>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, marginTop: 3 }}>
            <Clock style={{ width: 9, height: 9, color: 'rgba(255,255,255,0.55)' }} />
            <span style={{ color: 'rgba(255,255,255,0.55)', fontSize: 10, fontWeight: 600 }}>{story.duration}</span>
            <span style={{ color: 'rgba(255,255,255,0.4)', fontSize: 10 }}>· Age {story.ageMin}+</span>
          </div>
        </div>
        <div style={{
          width: 38, height: 38, borderRadius: '50%', flexShrink: 0,
          background: 'linear-gradient(135deg,#a855f7,#7c3aed)',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          boxShadow: '0 4px 14px rgba(168,85,247,0.6)',
          animation: 'playGlow 2.5s ease-in-out infinite',
        }}>
          <Play style={{ width: 14, height: 14, fill: '#ffffff', color: '#ffffff', marginLeft: 2 }} />
        </div>
      </div>
    </motion.div>
  );
}

// ── SquareCard ────────────────────────────────────────────────────────────────
function SquareCard({ story, index = 0, liked, onLike }: { story: Story; index?: number; liked: boolean; onLike: (id: string) => void }) {
  const [imgErr, setImgErr] = useState(false);
  const showImg = !imgErr;

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.88 }} animate={{ opacity: 1, scale: 1 }}
      transition={{ delay: index * 0.05, duration: 0.3 }}
      whileTap={{ scale: 0.96 }}
      style={{
        aspectRatio: '1 / 1', borderRadius: 18, overflow: 'hidden', cursor: 'pointer', position: 'relative',
        background: showImg ? '#000' : story.themeBg,
        boxShadow: '0 10px 30px rgba(16,24,40,0.22)',
        border: '1px solid rgba(255,255,255,0.06)',
        minWidth: 0,
      }}
    >
      {showImg && (
        <img src={story.coverImg} alt={story.title} onError={() => setImgErr(true)}
          style={{ position: 'absolute', inset: 0, width: '100%', height: '100%', objectFit: 'cover', objectPosition: 'center top', opacity: 0.88 }} />
      )}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(2,6,23,0.82) 0%,rgba(2,6,23,0.25) 55%,transparent 100%)' }} />

      {story.badge && (
        <div style={{ position: 'absolute', top: 8, left: 8 }}>
          <span style={{ padding: '2px 7px', borderRadius: 99, fontSize: 9, fontWeight: 800, background: story.badgeBg, color: story.badgeBg === '#a855f7' ? '#ffffff' : '#fff' }}>
            {story.badge}
          </span>
        </div>
      )}

      <button onClick={e => { e.stopPropagation(); onLike(story.id); }} style={{ position: 'absolute', top: 8, right: 8, width: 28, height: 28, borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center', background: 'rgba(0,0,0,0.45)', border: 'none', cursor: 'pointer' }}>
        <Heart style={{ width: 12, height: 12, color: liked ? '#FF6B9D' : '#fff', fill: liked ? '#FF6B9D' : 'none' }} />
      </button>

      <div style={{ position: 'absolute', bottom: 8, left: 9, right: 9, display: 'flex', justifyContent: 'space-between', alignItems: 'flex-end' }}>
        <div style={{ flex: 1, minWidth: 0, paddingRight: 6 }}>
          <p style={{ color: '#fff', fontWeight: 800, fontSize: 11, lineHeight: 1.3, overflow: 'hidden', display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical' }}>
            {story.emoji} {story.title}
          </p>
          <span style={{ display: 'flex', alignItems: 'center', gap: 3, color: 'rgba(255,255,255,0.5)', fontSize: 9, fontWeight: 600, marginTop: 3 }}>
            <Clock style={{ width: 8, height: 8 }} />{story.duration}
          </span>
        </div>
        <div style={{ width: 30, height: 30, borderRadius: '50%', flexShrink: 0, background: 'linear-gradient(135deg,#a855f7,#7c3aed)', display: 'flex', alignItems: 'center', justifyContent: 'center', boxShadow: '0 3px 10px rgba(168,85,247,0.55)' }}>
          <Play style={{ width: 11, height: 11, fill: '#ffffff', color: '#ffffff', marginLeft: 1 }} />
        </div>
      </div>
    </motion.div>
  );
}

// ── Hero Banner ───────────────────────────────────────────────────────────────
function HeroBanner() {
  return (
    <div className="relative overflow-hidden" style={{ background: 'linear-gradient(135deg,#0f0e23,#1a1535,#0d1117)', minHeight: 260 }}>
      {/* Glow orbs */}
      <div style={{ position: 'absolute', top: '-15%', right: '-5%', width: 300, height: 300, borderRadius: '50%', background: 'radial-gradient(circle,rgba(124,58,237,0.45) 0%,transparent 70%)', pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', bottom: '-25%', left: '3%',  width: 240, height: 240, borderRadius: '50%', background: 'radial-gradient(circle,rgba(6,182,212,0.30) 0%,transparent 70%)',    pointerEvents: 'none' }} />
      <div style={{ position: 'absolute', top: '30%',   left: '40%',  width: 180, height: 180, borderRadius: '50%', background: 'radial-gradient(circle,rgba(168,85,247,0.18) 0%,transparent 70%)',   pointerEvents: 'none' }} />

      {/* Floating emojis */}
      {[
        { ch: '🌙', top: '10%', right: '14%', size: 44, anim: 'floatEmoji',  dur: '7s',  delay: '0s'   },
        { ch: '✨', top: '55%', right: '6%',  size: 30, anim: 'floatEmoji2', dur: '5s',  delay: '1.2s' },
        { ch: '🐰', top: '18%', right: '35%', size: 20, anim: 'floatEmoji',  dur: '6s',  delay: '0.5s' },
        { ch: '⭐', top: '65%', right: '27%', size: 24, anim: 'floatEmoji2', dur: '8s',  delay: '2s'   },
        { ch: '🐉', top: '8%',  right: '55%', size: 18, anim: 'floatEmoji',  dur: '5.5s',delay: '1.8s' },
      ].map((d, i) => (
        <div key={i} style={{ position: 'absolute', top: d.top, right: d.right, fontSize: d.size, opacity: 0.65, pointerEvents: 'none', userSelect: 'none', animation: `${d.anim} ${d.dur} ease-in-out ${d.delay} infinite` }}>{d.ch}</div>
      ))}

      {/* Bottom fade to white */}
      <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top,rgba(251,248,255,1) 0%,rgba(251,248,255,0.04) 30%,transparent 55%)', pointerEvents: 'none' }} />

      <div className="relative z-10 px-6 py-8" style={{ paddingBottom: 52 }}>
        {/* Label */}
        <div className="flex items-center gap-2 mb-4">
          <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ background: 'rgba(168,85,247,0.15)', border: '1px solid rgba(168,85,247,0.35)' }}>
            <Sparkles className="w-4 h-4" style={{ color: '#a855f7' }} />
          </div>
          <span className="text-xs font-black uppercase tracking-widest" style={{ color: 'rgba(168,85,247,0.85)' }}>✦ Kids Zone</span>
        </div>

        <h1 className="text-white font-black mb-2" style={{ fontSize: 'clamp(26px,5vw,40px)', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
          G&apos;day, little dreamer! 🌙
        </h1>
        <p style={{ color: 'rgba(255,255,255,0.45)', fontSize: 14, marginBottom: 26, maxWidth: 340 }}>
          Enchanting bedtime stories crafted just for you — safe, Australian, ad-free.
        </p>

        <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
          <motion.button whileTap={{ scale: 0.93 }}
            style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 24px', borderRadius: 99, background: 'linear-gradient(135deg,#a855f7,#7c3aed)', color: '#ffffff', fontWeight: 900, fontSize: 14, border: 'none', cursor: 'pointer', animation: 'playGlow 2.4s ease-in-out infinite' }}>
            <Play style={{ width: 15, height: 15, fill: '#ffffff' }} />
            Start Watching
          </motion.button>
          <Link href="/generate">
            <motion.button whileTap={{ scale: 0.93 }}
              style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 20px', borderRadius: 99, background: 'rgba(255,255,255,0.10)', backdropFilter: 'blur(12px)', border: '1.5px solid rgba(255,255,255,0.25)', color: '#fff', fontWeight: 700, fontSize: 13, cursor: 'pointer' }}>
              <Sparkles style={{ width: 14, height: 14 }} />
              Create a Story
            </motion.button>
          </Link>
        </div>
      </div>
    </div>
  );
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function KidsZonePage() {
  const [activeAge,      setActiveAge]      = useState('All');
  const [activeCategory, setActiveCategory] = useState('all');
  const [liked,          setLiked]          = useState<Set<string>>(new Set());

  const toggleLike = (id: string) =>
    setLiked(prev => { const n = new Set(prev); n.has(id) ? n.delete(id) : n.add(id); return n; });

  const filterStories = (stories: Story[]) => {
    return stories.filter(s => {
      const catMatch = activeCategory === 'all' || s.category === activeCategory;
      const ageMatch = activeAge === 'All' || activeAge === 'Cosy'
        ? true
        : activeAge === '2+' ? s.ageMin <= 3
        : activeAge === '3-5' ? s.ageMin >= 3 && s.ageMin <= 5
        : activeAge === '6-7' ? s.ageMin >= 6 && s.ageMin <= 7
        : s.ageMin >= 8;
      return catMatch && ageMatch;
    });
  };

  const allFiltered = filterStories(STORIES);
  const watching    = STORIES.filter(s => s.progress !== undefined);
  const featured    = STORIES.filter(s => s.coverImg.startsWith('/images/banners'));
  const gridStories = STORIES.filter(s => s.coverImg.startsWith('/images/posters'));
  const nature      = filterStories(STORIES.filter(s => s.category === 'nature'));
  const fantasy     = filterStories(STORIES.filter(s => s.category === 'fantasy'));
  const adventure   = filterStories(STORIES.filter(s => s.category === 'adventure'));
  const likedShows  = STORIES.filter(s => liked.has(s.id));

  return (
    <div className="min-h-screen -mt-16" style={{ background: '#F4F3F9', fontFamily: 'var(--font-nunito), sans-serif' }}>
      <style>{KEYFRAMES}</style>

      {/* Hero (full bleed, sits under transparent navbar) */}
      <HeroBanner />

      {/* White content card — pulls up over hero bottom */}
      <div style={{
        background: 'linear-gradient(180deg,#fbf8ff,#f4f3f9)',
        borderRadius: '28px 28px 0 0',
        marginTop: -32,
        position: 'relative',
        zIndex: 10,
        paddingTop: 28,
        paddingBottom: 80,
        boxShadow: '0 -8px 32px rgba(16,24,40,0.06)',
        borderTop: '1px solid rgba(15,14,35,0.04)',
      }}>

        {/* Age filter circles */}
        <ArrowScrollRow gap={20} px={20}>
          {AGE_FILTERS.map(({ label, emoji }, idx) => {
            const isActive = activeAge === label;
            return (
              <motion.button key={label} whileTap={{ scale: 0.88 }} onClick={() => setActiveAge(label)}
                style={{ flexShrink: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6, background: 'none', border: 'none', cursor: 'pointer', padding: 0 }}>
                <div style={{
                  width: 66, height: 66, borderRadius: '50%',
                  display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 28,
                  background: CIRCLE_GRADIENTS[idx % CIRCLE_GRADIENTS.length],
                  border: isActive ? '3px solid #a855f7' : '2.5px solid rgba(255,255,255,0.08)',
                  boxShadow: isActive ? '0 0 0 2px rgba(168,85,247,0.25), 0 8px 24px rgba(0,0,0,0.28)' : '0 4px 16px rgba(0,0,0,0.20)',
                  transition: 'all 0.2s ease', position: 'relative',
                }}>
                  {emoji}
                  {isActive && (
                    <span style={{ position: 'absolute', bottom: -2, right: -2, width: 18, height: 18, borderRadius: '50%', background: '#a855f7', border: '2px solid #fbf8ff', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 9, fontWeight: 900, color: '#ffffff' }}>✓</span>
                  )}
                </div>
                <span style={{ fontSize: 11, fontWeight: isActive ? 800 : 500, color: isActive ? '#7c3aed' : '#6B7280' }}>{label}</span>
              </motion.button>
            );
          })}
        </ArrowScrollRow>

        {/* Category pills */}
        <div style={{ marginBottom: 28 }}>
          <ArrowScrollRow gap={8} px={20}>
            {CATEGORIES.map(cat => (
              <motion.button key={cat.id} whileTap={{ scale: 0.9 }} onClick={() => setActiveCategory(cat.id)}
                style={{
                  flexShrink: 0, display: 'flex', alignItems: 'center', gap: 5,
                  padding: '9px 18px', borderRadius: 99, fontWeight: 700, fontSize: 13, cursor: 'pointer',
                  background: activeCategory === cat.id ? 'linear-gradient(135deg,#0F0E23,#1e1b4b)' : '#FFFFFF',
                  border: activeCategory === cat.id ? '2px solid #0F0E23' : '2px solid #EBEBF0',
                  color: activeCategory === cat.id ? '#fff' : '#4B5563',
                  boxShadow: activeCategory === cat.id ? '0 4px 14px rgba(15,14,35,0.28)' : '0 2px 6px rgba(0,0,0,0.05)',
                  transition: 'all 0.2s ease',
                }}>
                <span style={{ fontSize: 15, lineHeight: 1 }}>{cat.emoji}</span>
                {cat.label}
              </motion.button>
            ))}
          </ArrowScrollRow>
        </div>

        {/* Continue Watching */}
        {watching.length > 0 && (
          <section style={{ marginBottom: 36 }}>
            <SectionHeader title="🎬 Continue Watching" subtitle="Pick up where you left off" />
            <ArrowScrollRow gap={12} px={20}>
              {watching.map((s, i) => <LandscapeCard key={s.id} story={s} index={i} liked={liked.has(s.id)} onLike={toggleLike} />)}
            </ArrowScrollRow>
          </section>
        )}

        {/* Featured — landscape banner cards */}
        {featured.length > 0 && (
          <section style={{ marginBottom: 36 }}>
            <SectionHeader title="⭐ Featured Stories" subtitle="Hand-picked for tonight" />
            <ArrowScrollRow gap={12} px={20}>
              {featured.slice(0, 8).map((s, i) => <LandscapeCard key={s.id} story={s} index={i} liked={liked.has(s.id)} onLike={toggleLike} />)}
            </ArrowScrollRow>
          </section>
        )}

        {/* Fantasy — 2-col poster grid */}
        {fantasy.length > 0 && (
          <section style={{ marginBottom: 36 }}>
            <SectionHeader title="🧙 Fantasy Worlds" subtitle="Magical castles, dragons and enchanted forests" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, padding: '0 20px' }}>
              {fantasy.slice(0, 4).map((s, i) => <SquareCard key={s.id} story={s} index={i} liked={liked.has(s.id)} onLike={toggleLike} />)}
            </div>
          </section>
        )}

        {/* Nature — landscape scroll */}
        {nature.length > 0 && (
          <section style={{ marginBottom: 36 }}>
            <SectionHeader title="🌿 Nature & Animals" subtitle="Aussie bush, ocean friends and more" />
            <ArrowScrollRow gap={12} px={20}>
              {nature.map((s, i) => <LandscapeCard key={s.id} story={s} index={i} liked={liked.has(s.id)} onLike={toggleLike} />)}
            </ArrowScrollRow>
          </section>
        )}

        {/* Adventure — 2-col poster grid */}
        {adventure.length > 0 && (
          <section style={{ marginBottom: 36 }}>
            <SectionHeader title="⚔️ Big Adventures" subtitle="Brave heroes and daring journeys" />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, padding: '0 20px' }}>
              {adventure.slice(0, 4).map((s, i) => <SquareCard key={s.id} story={s} index={i} liked={liked.has(s.id)} onLike={toggleLike} />)}
            </div>
          </section>
        )}

        {/* All filtered (when a category is active) */}
        {activeCategory !== 'all' && allFiltered.length > 0 && (
          <section style={{ marginBottom: 36 }}>
            <SectionHeader title={`${CATEGORIES.find(c => c.id === activeCategory)?.emoji} All ${CATEGORIES.find(c => c.id === activeCategory)?.label} Stories`} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(2,1fr)', gap: 10, padding: '0 20px' }}>
              {allFiltered.slice(0, 8).map((s, i) => <SquareCard key={s.id} story={s} index={i} liked={liked.has(s.id)} onLike={toggleLike} />)}
            </div>
          </section>
        )}

        {/* My Favourites */}
        {likedShows.length > 0 && (
          <section style={{ marginBottom: 36 }}>
            <SectionHeader title="💖 My Favourites" subtitle={`${likedShows.length} saved stories`} />
            <ArrowScrollRow gap={12} px={20}>
              {likedShows.map((s, i) => <LandscapeCard key={s.id} story={s} index={i} liked={true} onLike={toggleLike} />)}
            </ArrowScrollRow>
          </section>
        )}

        {/* Parent CTA */}
        <section style={{ margin: '8px 20px 0', borderRadius: 24, overflow: 'hidden', background: 'linear-gradient(135deg,#0F0E23,#1e1b4b,#2e1065)' }}>
          <div style={{ position: 'relative', padding: '28px 28px' }}>
            <div style={{ position: 'absolute', inset: 0, background: 'radial-gradient(circle at 80% 50%,rgba(168,85,247,0.18) 0%,transparent 60%)', pointerEvents: 'none' }} />
            <p className="font-black uppercase tracking-widest text-xs mb-2" style={{ color: '#a855f7' }}>For Mums & Dads 👨‍👩‍👧</p>
            <h3 className="text-white font-black text-2xl leading-tight mb-2">
              Create a story<br />
              <span style={{ color: '#a855f7' }}>in your voice 🎙️</span>
            </h3>
            <p style={{ color: 'rgba(255,255,255,0.55)', fontSize: 13, marginBottom: 20, maxWidth: 280 }}>
              Record once — HushTales AI turns it into a personalised animated bedtime story your little one will love.
            </p>
            <Link href="/generate">
              <motion.button whileTap={{ scale: 0.95 }}
                style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '12px 28px', borderRadius: 99, background: 'linear-gradient(135deg,#a855f7,#7c3aed)', color: '#ffffff', fontWeight: 900, fontSize: 14, border: 'none', cursor: 'pointer', boxShadow: '0 8px 28px rgba(168,85,247,0.4)', animation: 'playGlow 2.5s ease-in-out infinite' }}>
                <Sparkles style={{ width: 16, height: 16 }} />
                Start Creating 🎉
              </motion.button>
            </Link>
          </div>
        </section>

        {/* Footer */}
        <footer style={{ textAlign: 'center', padding: '32px 20px 8px', color: '#9CA3AF', fontSize: 12 }}>
          <p style={{ marginBottom: 4 }}>🐨 HushTales Kids — Safe · Australian · Ad-Free</p>
          <p>
            <Link href="/library" style={{ color: '#9CA3AF', textDecoration: 'none' }} className="hover:text-purple-500">
              Parent Zone
            </Link>
            {' · '}© 2026 HushTales · Made with 💛 in Australia
          </p>
        </footer>

      </div>
    </div>
  );
}
