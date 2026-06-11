/* eslint-disable @next/next/no-img-element */
'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Sparkles, Wand2, Mic, Shuffle, Check, Play,
  Zap, Moon, Smile, Crown, Feather, Flame, Heart,
} from 'lucide-react';

// ─── Brand tokens (match home3 exactly) ───────────────────────────────────────
const AMBER  = '#F59E0B';
const VIOLET = '#7c3aed';

// ─── Stable waveform constants (no random on render) ──────────────────────────
const WAVE_H   = [8, 22, 14, 34, 10, 28, 18, 36, 12, 26, 32, 8, 20, 34, 16, 28, 18, 30, 10, 22];
const WAVE_D   = [0, .08, .16, .04, .20, .12, .24, .06, .18, .02, .14, .22, .10, .06, .18, .24, .02, .16, .12, .08];
const WAVE_DUR = [.40, .35, .45, .38, .42, .36, .44, .40, .38, .46, .34, .42, .40, .36, .44, .38, .42, .34, .46, .40];

// ─── Types ─────────────────────────────────────────────────────────────────────
type Child  = { id: string; name: string; age: number };
type Theme  = { id: string; label: string; tagline: string; image: string };
type Tone   = { id: string; label: string; Icon: React.ComponentType<{ className?: string }> };
type Length = { id: string; label: string; runtime: string };

// ─── Data ──────────────────────────────────────────────────────────────────────
const CHILDREN: Child[] = [
  { id: 'emma',   name: 'Emma',   age: 5 },
  { id: 'liam',   name: 'Liam',   age: 7 },
  { id: 'sofia',  name: 'Sofia',  age: 4 },
  { id: 'oliver', name: 'Oliver', age: 6 },
];

const THEMES: Theme[] = [
  { id: 'fantasy',   label: 'Fantasy',    tagline: 'Dragons & enchanted kingdoms',    image: '/images/banners/banner5.jpeg' },
  { id: 'adventure', label: 'Adventure',  tagline: 'Daring quests & hidden treasures', image: '/images/posters/poster4.jpeg' },
  { id: 'space',     label: 'Space',      tagline: 'Rockets, stars & alien worlds',   image: '/images/banners/banner1.jpeg' },
  { id: 'ocean',     label: 'Ocean',      tagline: 'Mermaids & deep-sea wonders',     image: '/images/banners/banner4.jpeg' },
  { id: 'jungle',    label: 'Jungle',     tagline: 'Wild animals & rainforests',      image: '/images/banners/banner2.jpeg' },
  { id: 'fairytale', label: 'Fairy Tale', tagline: 'Princesses, princes & magic',     image: '/images/posters/poster3.jpeg' },
  { id: 'superhero', label: 'Superhero',  tagline: 'Powers, capes & saving the world', image: '/images/posters/poster5.jpeg' },
  { id: 'dinosaurs', label: 'Dinosaurs',  tagline: 'T-Rex & prehistoric adventures',  image: '/images/banners/banner3.jpeg' },
  { id: 'robots',    label: 'Robots',     tagline: 'Friendly robots & future cities', image: '/images/posters/poster2.jpeg' },
  { id: 'nature',    label: 'Nature',     tagline: 'Forests, seasons & little critters', image: '/images/banners/banner6.jpeg' },
  { id: 'outback',   label: 'Outback',    tagline: 'Red earth, roos & the Aussie bush',  image: '/images/banners/banner3.jpeg' },
];

const TONES: Tone[] = [
  { id: 'gentle',    label: 'Gentle',     Icon: Moon     },
  { id: 'funny',     label: 'Funny',      Icon: Smile    },
  { id: 'magical',   label: 'Magical',    Icon: Sparkles },
  { id: 'fairytale', label: 'Fairy Tale', Icon: Crown    },
  { id: 'exciting',  label: 'Exciting',   Icon: Zap      },
  { id: 'poetic',    label: 'Poetic',     Icon: Feather  },
  { id: 'cozy',      label: 'Cozy',       Icon: Heart    },
  { id: 'epic',      label: 'Epic',       Icon: Flame    },
];

const LENGTHS: Length[] = [
  { id: 'mini',   label: 'Mini',   runtime: '3–5 min'    },
  { id: 'short',  label: 'Short',  runtime: '8–12 min'   },
  { id: 'full',   label: 'Full',   runtime: '20–28 min'  },
  { id: 'series', label: 'Series', runtime: 'Multi-part' },
];

const COMBOS = [
  { theme: 'space',     tone: 'exciting',  length: 'short' },
  { theme: 'fairytale', tone: 'magical',   length: 'full'  },
  { theme: 'jungle',    tone: 'funny',     length: 'mini'  },
  { theme: 'fantasy',   tone: 'epic',      length: 'full'  },
  { theme: 'ocean',     tone: 'poetic',    length: 'short' },
  { theme: 'nature',    tone: 'gentle',    length: 'short'  },
  { theme: 'outback',   tone: 'exciting',  length: 'short'  },
];

// ─── Helpers ───────────────────────────────────────────────────────────────────
function fmtTime(s: number) {
  return `${Math.floor(s / 60)}:${String(s % 60).padStart(2, '0')}`;
}

// ─── Waveform ──────────────────────────────────────────────────────────────────
function Waveform({ active }: { active: boolean }) {
  return (
    <div className="flex items-center justify-center gap-[3px]" style={{ height: 40 }}>
      {WAVE_H.map((h, i) => (
        <motion.div
          key={i}
          className="w-[3px] rounded-full"
          animate={active ? { height: [4, h, 4] } : { height: 4 }}
          transition={
            active
              ? { duration: WAVE_DUR[i], repeat: Infinity, delay: WAVE_D[i], ease: 'easeInOut' }
              : { duration: 0.25 }
          }
          style={{ background: active ? AMBER : 'rgba(255,255,255,0.12)' }}
        />
      ))}
    </div>
  );
}

// ─── Section label ─────────────────────────────────────────────────────────────
function SLabel({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex items-center gap-3 mb-4">
      <span
        className="text-[10px] font-black uppercase tracking-[0.2em] flex-shrink-0"
        style={{ color: AMBER }}
      >
        {children}
      </span>
      <div className="h-px flex-1" style={{ background: 'rgba(255,255,255,0.06)' }} />
    </div>
  );
}

// ─── Child row (shared between modes) ─────────────────────────────────────────
function ChildRow({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="flex gap-4 sm:gap-6">
      {CHILDREN.map(c => {
        const sel = selected === c.id;
        return (
          <motion.button
            key={c.id}
            whileHover={{ y: -2 }}
            whileTap={{ scale: 0.94 }}
            onClick={() => onSelect(c.id)}
            className="flex flex-col items-center gap-1.5 flex-1 focus:outline-none group"
          >
            <div
              className="w-12 h-12 sm:w-14 sm:h-14 rounded-2xl flex items-center justify-center transition-all duration-200"
              style={{
                background: sel ? 'rgba(245,183,49,0.14)' : 'rgba(255,255,255,0.05)',
                border: sel ? `1.5px solid ${AMBER}` : '1.5px solid rgba(255,255,255,0.08)',
                boxShadow: sel ? `0 0 16px rgba(245,183,49,0.22)` : 'none',
              }}
            >
              <span
                className="font-black text-lg select-none transition-colors"
                style={{ color: sel ? AMBER : 'rgba(255,255,255,0.28)' }}
              >
                {c.name[0]}
              </span>
            </div>

            <span
              className="text-xs font-bold transition-colors"
              style={{ color: sel ? '#fff' : 'rgba(255,255,255,0.35)' }}
            >
              {c.name}
            </span>

            <AnimatePresence>
              {sel && (
                <motion.span
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: 'auto' }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden text-[10px] font-bold"
                  style={{ color: AMBER }}
                >
                  Age {c.age}
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
}

// ─── Theme grid (shared between modes) ────────────────────────────────────────
function ThemeGrid({
  selected,
  onSelect,
}: {
  selected: string | null;
  onSelect: (id: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {THEMES.map(t => {
        const sel = selected === t.id;
        return (
          <motion.button
            key={t.id}
            whileHover={{ scale: 1.015 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => onSelect(t.id)}
            className="relative overflow-hidden rounded-xl text-left focus:outline-none"
            style={{
              height: 76,
              border: sel ? `1.5px solid ${AMBER}` : '1.5px solid rgba(255,255,255,0.07)',
              boxShadow: sel ? `0 0 16px rgba(245,183,49,0.16)` : 'none',
            }}
          >
            {/* Image — very dark overlay so it's texture, not dominant */}
            <div
              className="absolute inset-0"
              style={{
                backgroundImage: `linear-gradient(rgba(15,15,15,${sel ? 0.70 : 0.86}), rgba(15,15,15,${sel ? 0.70 : 0.86})), url('${t.image}')`,
                backgroundSize: 'cover',
                backgroundPosition: 'center',
              }}
            />
            {/* Amber wash on select */}
            {sel && (
              <div
                className="absolute inset-0"
                style={{ background: 'rgba(245,183,49,0.05)' }}
              />
            )}
            {/* Bottom scrim */}
            <div
              className="absolute inset-0"
              style={{ background: 'linear-gradient(to top, rgba(0,0,0,0.6) 0%, transparent 55%)' }}
            />

            {/* Label */}
            <div className="absolute bottom-0 left-0 right-0 px-3 pb-2.5">
              <p
                className="font-black text-[12px] leading-none transition-colors"
                style={{ color: sel ? AMBER : '#fff' }}
              >
                {t.label}
              </p>
              <p className="text-white/38 text-[9px] mt-0.5 leading-snug">{t.tagline}</p>
            </div>

            {/* Amber bottom line */}
            {sel && (
              <motion.div
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                className="absolute bottom-0 left-0 right-0 h-[2px] origin-left"
                style={{ background: AMBER }}
              />
            )}

            {/* Check */}
            {sel && (
              <motion.div
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute top-2 right-2 w-4 h-4 rounded-full flex items-center justify-center"
                style={{ background: AMBER }}
              >
                <Check className="w-2.5 h-2.5 text-black" />
              </motion.div>
            )}
          </motion.button>
        );
      })}
    </div>
  );
}

// ─── Page ──────────────────────────────────────────────────────────────────────
export default function GeneratePage() {
  const [mode,   setMode]   = useState<'ai' | 'voice'>('ai');
  const [child,  setChild]  = useState<string | null>(null);
  const [theme,  setTheme]  = useState<string | null>(null);
  const [tone,   setTone]   = useState<string | null>(null);
  const [length, setLength] = useState<string | null>(null);

  const [surprising, setSurprising] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [done,       setDone]       = useState(false);

  const [recording, setRecording] = useState(false);
  const [recSec,    setRecSec]    = useState(0);
  const [recorded,  setRecorded]  = useState(false);

  const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

  const activeChild  = CHILDREN.find(c => c.id === child);
  const activeTheme  = THEMES.find(t => t.id === theme);
  const activeTone   = TONES.find(t => t.id === tone);
  const activeLength = LENGTHS.find(l => l.id === length);

  const aiReady    = !!(child && theme && tone && length);
  const voiceReady = !!(child && theme && recorded);
  const ready      = mode === 'ai' ? aiReady : voiceReady;

  const doneCount =
    mode === 'ai'
      ? [child, theme, tone, length].filter(Boolean).length
      : [child, theme, recorded || null].filter(Boolean).length;
  const totalSteps = mode === 'ai' ? 4 : 3;

  function doSurprise() {
    if (surprising) return;
    setSurprising(true);
    const c = COMBOS[Math.floor(Math.random() * COMBOS.length)];
    if (!child) setChild(CHILDREN[Math.floor(Math.random() * CHILDREN.length)].id);
    setTimeout(() => {
      setTheme(c.theme);
      setTone(c.tone);
      setLength(c.length);
      setSurprising(false);
    }, 700);
  }

  function startRecording() {
    setRecorded(false);
    setRecSec(0);
    setRecording(true);
    timerRef.current = setInterval(() => setRecSec(s => s + 1), 1000);
  }

  function stopRecording() {
    if (timerRef.current) clearInterval(timerRef.current);
    setRecording(false);
    setRecorded(true);
  }

  useEffect(() => () => { if (timerRef.current) clearInterval(timerRef.current); }, []);

  function doGenerate() {
    if (!ready || generating) return;
    setGenerating(true);
    setTimeout(() => { setGenerating(false); setDone(true); }, 2200);
  }

  function reset() {
    setChild(null); setTheme(null); setTone(null); setLength(null);
    setDone(false); setGenerating(false);
    setRecorded(false); setRecording(false); setRecSec(0);
  }

  // ─── Render ───────────────────────────────────────────────────────────────────
  return (
    <div className="min-h-screen" style={{ background: '#080808' }}>

      {/* Subtle top glow — matches home3 ambient style */}
      <div
        className="fixed inset-0 pointer-events-none"
        style={{
          background:
            'radial-gradient(ellipse 55% 30% at 50% 0%, rgba(124,58,237,0.16) 0%, transparent 65%)',
          zIndex: 0,
        }}
      />

      {/* ── Main content ────────────────────────────────────────────────────── */}
      <div className="relative z-10 max-w-[640px] mx-auto px-6 pb-36">

        {/* ── Hero ──────────────────────────────────────────────────────────── */}
        <div className="pt-8 pb-9 text-center">
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full mb-5"
            style={{
              background: 'rgba(124,58,237,0.10)',
              border: '1px solid rgba(124,58,237,0.2)',
            }}
          >
            <Sparkles className="w-2.5 h-2.5 text-violet-400" />
            <span className="text-violet-300 text-[10px] font-black uppercase tracking-[0.14em]">
              Story Creator
            </span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.06 }}
            className="text-white font-black tracking-tight leading-none mb-3"
            style={{ fontSize: 'clamp(28px, 7vw, 44px)' }}
          >
            Create a Story
          </motion.h1>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.12 }}
            className="font-medium"
            style={{ color: 'rgba(255,255,255,0.32)', fontSize: 14 }}
          >
            Personalised, animated, in your voice.
          </motion.p>
        </div>

        {/* ── Mode tabs ─────────────────────────────────────────────────────── */}
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.15 }}
          className="flex rounded-2xl p-1 mb-10"
          style={{
            background: 'rgba(255,255,255,0.04)',
            border: '1px solid rgba(255,255,255,0.07)',
          }}
        >
          {([
            { id: 'ai'    as const, label: 'AI Story',    Icon: Wand2 },
            { id: 'voice' as const, label: 'Voice Story', Icon: Mic   },
          ]).map(tab => {
            const active = mode === tab.id;
            return (
              <motion.button
                key={tab.id}
                onClick={() => setMode(tab.id)}
                whileTap={{ scale: 0.98 }}
                className="flex-1 flex items-center justify-center gap-2 py-2.5 rounded-xl text-sm font-black transition-all duration-200 focus:outline-none"
                style={{
                  background: active ? 'rgba(255,255,255,0.08)' : 'transparent',
                  color: active ? '#fff' : 'rgba(255,255,255,0.35)',
                  border: active ? '1px solid rgba(255,255,255,0.10)' : '1px solid transparent',
                }}
              >
                <tab.Icon className="w-3.5 h-3.5" />
                {tab.label}
              </motion.button>
            );
          })}
        </motion.div>

        {/* ── Sections ──────────────────────────────────────────────────────── */}
        <AnimatePresence mode="wait">

          {/* ─────────────────── AI STORY MODE ──────────────────────────── */}
          {mode === 'ai' && (
            <motion.div
              key="ai-mode"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-9"
            >

              {/* For Who */}
              <section>
                <SLabel>For Who</SLabel>
                <ChildRow selected={child} onSelect={setChild} />
              </section>

              {/* World */}
              <section>
                <SLabel>World</SLabel>
                <ThemeGrid selected={theme} onSelect={setTheme} />
              </section>

              {/* Mood */}
              <section>
                <SLabel>Mood</SLabel>
                <div className="flex flex-wrap gap-2">
                  {TONES.map(t => {
                    const sel = tone === t.id;
                    const TIcon = t.Icon;
                    return (
                      <motion.button
                        key={t.id}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        onClick={() => setTone(t.id)}
                        className="flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-bold transition-all duration-150 focus:outline-none"
                        style={{
                          background: sel ? AMBER : 'rgba(255,255,255,0.05)',
                          color: sel ? '#0f0f0f' : 'rgba(255,255,255,0.48)',
                          border: sel ? `1px solid ${AMBER}` : '1px solid rgba(255,255,255,0.07)',
                        }}
                      >
                        <TIcon className="w-3.5 h-3.5" />
                        {t.label}
                      </motion.button>
                    );
                  })}
                </div>
              </section>

              {/* Length */}
              <section>
                <SLabel>Length</SLabel>
                <div
                  className="flex rounded-xl overflow-hidden"
                  style={{ border: '1px solid rgba(255,255,255,0.08)' }}
                >
                  {LENGTHS.map((l, i) => {
                    const sel = length === l.id;
                    return (
                      <motion.button
                        key={l.id}
                        whileTap={{ scale: 0.98 }}
                        onClick={() => setLength(l.id)}
                        className="flex-1 py-3.5 flex flex-col items-center gap-0.5 transition-all duration-150 focus:outline-none"
                        style={{
                          background: sel ? AMBER : 'rgba(255,255,255,0.03)',
                          borderRight:
                            i < LENGTHS.length - 1
                              ? '1px solid rgba(255,255,255,0.07)'
                              : 'none',
                        }}
                      >
                        <span
                          className="text-xs font-black leading-none"
                          style={{ color: sel ? '#0f0f0f' : '#fff' }}
                        >
                          {l.label}
                        </span>
                        <span
                          className="text-[9px] font-semibold"
                          style={{
                            color: sel ? 'rgba(0,0,0,0.55)' : 'rgba(255,255,255,0.28)',
                          }}
                        >
                          {l.runtime}
                        </span>
                      </motion.button>
                    );
                  })}
                </div>
              </section>

              {/* Surprise Me — minimal ghost */}
              <motion.button
                whileHover={{ opacity: 0.8 }}
                whileTap={{ scale: 0.98 }}
                onClick={doSurprise}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl text-xs font-bold transition-all duration-150 focus:outline-none"
                style={{
                  background: 'transparent',
                  border: '1px solid rgba(255,255,255,0.06)',
                  color: surprising ? AMBER : 'rgba(255,255,255,0.28)',
                }}
              >
                <motion.span
                  animate={surprising ? { rotate: 360 } : { rotate: 0 }}
                  transition={surprising ? { duration: 0.7, ease: 'easeInOut' } : {}}
                  className="inline-flex"
                >
                  <Shuffle className="w-3.5 h-3.5" />
                </motion.span>
                {surprising ? 'Picking a combination…' : 'Surprise me — random combo'}
              </motion.button>

            </motion.div>
          )}

          {/* ─────────────────── VOICE STORY MODE ───────────────────────── */}
          {mode === 'voice' && (
            <motion.div
              key="voice-mode"
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -8 }}
              transition={{ duration: 0.2 }}
              className="space-y-9"
            >

              {/* For Who */}
              <section>
                <SLabel>For Who</SLabel>
                <ChildRow selected={child} onSelect={setChild} />
              </section>

              {/* World */}
              <section>
                <SLabel>World</SLabel>
                <ThemeGrid selected={theme} onSelect={setTheme} />
              </section>

              {/* Record */}
              <section>
                <SLabel>Your Recording</SLabel>
                <div
                  className="rounded-2xl p-8 flex flex-col items-center gap-5"
                  style={{
                    background: 'rgba(255,255,255,0.03)',
                    border: '1px solid rgba(255,255,255,0.07)',
                  }}
                >
                  {/* Waveform */}
                  <Waveform active={recording} />

                  {/* Status text */}
                  {!recording && !recorded && (
                    <p
                      className="text-sm font-medium text-center leading-relaxed"
                      style={{ color: 'rgba(255,255,255,0.32)' }}
                    >
                      Narrate your story in your own voice.
                      <br />
                      <span style={{ color: 'rgba(255,255,255,0.18)', fontSize: 12 }}>
                        AI will animate it for your child.
                      </span>
                    </p>
                  )}

                  {recording && (
                    <p
                      className="text-sm font-black tabular-nums"
                      style={{ color: AMBER }}
                    >
                      {fmtTime(recSec)}
                    </p>
                  )}

                  {recorded && !recording && (
                    <div className="flex items-center gap-2">
                      <div
                        className="w-4 h-4 rounded-full flex items-center justify-center flex-shrink-0"
                        style={{ background: AMBER }}
                      >
                        <Check className="w-2.5 h-2.5 text-black" />
                      </div>
                      <span
                        className="text-sm font-semibold"
                        style={{ color: 'rgba(255,255,255,0.55)' }}
                      >
                        Saved — {fmtTime(recSec)}
                      </span>
                    </div>
                  )}

                  {/* Mic button */}
                  {!recorded ? (
                    <motion.button
                      whileHover={{ scale: 1.06 }}
                      whileTap={{ scale: 0.93 }}
                      onClick={recording ? stopRecording : startRecording}
                      className="relative w-18 h-18 rounded-full flex items-center justify-center focus:outline-none"
                      style={{
                        width: 72,
                        height: 72,
                        background: recording
                          ? 'rgba(239,68,68,0.12)'
                          : 'rgba(245,183,49,0.10)',
                        border: recording
                          ? '1.5px solid rgba(239,68,68,0.45)'
                          : `1.5px solid ${AMBER}55`,
                      }}
                    >
                      {recording && (
                        <motion.div
                          className="absolute inset-0 rounded-full"
                          animate={{ scale: [1, 1.25, 1], opacity: [0.4, 0, 0.4] }}
                          transition={{ duration: 1.5, repeat: Infinity, ease: 'easeOut' }}
                          style={{ border: '1.5px solid rgba(239,68,68,0.35)' }}
                        />
                      )}
                      {recording ? (
                        <div
                          className="w-5 h-5 rounded-sm"
                          style={{ background: '#ef4444' }}
                        />
                      ) : (
                        <Mic className="w-7 h-7" style={{ color: AMBER }} />
                      )}
                    </motion.button>
                  ) : (
                    <button
                      onClick={() => { setRecorded(false); setRecSec(0); }}
                      className="text-sm font-medium transition-colors focus:outline-none"
                      style={{ color: 'rgba(255,255,255,0.28)' }}
                      onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
                      onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.28)')}
                    >
                      Re-record
                    </button>
                  )}

                  <p
                    className="text-[10px] font-medium"
                    style={{ color: 'rgba(255,255,255,0.18)' }}
                  >
                    {recording ? 'Tap to stop recording' : recorded ? '' : 'Tap the mic to begin'}
                  </p>
                </div>
              </section>

            </motion.div>
          )}

        </AnimatePresence>
      </div>

      {/* ── Sticky CTA bar ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {!done && (
          <motion.div
            key="cta"
            initial={{ y: 72 }}
            animate={{ y: 0 }}
            exit={{ y: 72 }}
            transition={{ type: 'spring', damping: 28, stiffness: 320 }}
            className="fixed bottom-0 left-0 right-0 z-50"
          >
            <div
              className="absolute inset-0"
              style={{
                background:
                  'linear-gradient(to top, rgba(8,8,8,1) 65%, rgba(8,8,8,0))',
                backdropFilter: 'blur(12px)',
              }}
            />
            <div className="relative max-w-[640px] mx-auto flex items-center gap-3 px-6 py-4">

              {/* Live chips */}
              <div className="flex-1 flex items-center gap-1.5 overflow-hidden min-w-0">
                <AnimatePresence>
                  {!activeChild && !activeTheme && !activeTone && !activeLength && !recorded && (
                    <motion.span
                      key="hint"
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="text-xs font-medium"
                      style={{ color: 'rgba(255,255,255,0.2)' }}
                    >
                      Select above to begin
                    </motion.span>
                  )}
                  {activeChild && (
                    <Chip key="ch">{activeChild.name}</Chip>
                  )}
                  {activeTheme && (
                    <Chip key="th">{activeTheme.label}</Chip>
                  )}
                  {activeTone && mode === 'ai' && (
                    <Chip key="to">{activeTone.label}</Chip>
                  )}
                  {activeLength && mode === 'ai' && (
                    <Chip key="le">{activeLength.runtime}</Chip>
                  )}
                  {recorded && mode === 'voice' && (
                    <Chip key="re">Recorded</Chip>
                  )}
                </AnimatePresence>
              </div>

              {/* CTA */}
              <motion.button
                whileHover={ready ? { scale: 1.04 } : {}}
                whileTap={ready ? { scale: 0.97 } : {}}
                onClick={doGenerate}
                disabled={!ready || generating}
                className="relative flex items-center gap-2 px-6 py-2.5 rounded-xl font-black text-sm text-white overflow-hidden flex-shrink-0 transition-all duration-200 focus:outline-none"
                style={{
                  background: ready
                    ? `linear-gradient(135deg, ${VIOLET}, #4f46e5)`
                    : 'rgba(255,255,255,0.07)',
                  boxShadow: ready ? `0 0 22px rgba(124,58,237,0.38)` : 'none',
                  cursor: ready ? 'pointer' : 'not-allowed',
                  color: ready ? '#fff' : 'rgba(255,255,255,0.25)',
                }}
              >
                {generating ? (
                  <>
                    <motion.span
                      animate={{ rotate: 360 }}
                      transition={{ repeat: Infinity, duration: 0.85, ease: 'linear' }}
                      className="inline-flex"
                    >
                      <Sparkles className="w-3.5 h-3.5" />
                    </motion.span>
                    Creating…
                  </>
                ) : (
                  <>
                    <Wand2 className="w-3.5 h-3.5" />
                    {ready ? 'Create Story' : `${doneCount} / ${totalSteps}`}
                  </>
                )}
                {ready && !generating && (
                  <motion.div
                    className="absolute inset-0 pointer-events-none"
                    animate={{ x: ['-100%', '100%'] }}
                    transition={{ duration: 3, repeat: Infinity, ease: 'linear' }}
                    style={{
                      background:
                        'linear-gradient(90deg, transparent, rgba(255,255,255,0.08), transparent)',
                    }}
                  />
                )}
              </motion.button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* ── Success overlay ────────────────────────────────────────────────────── */}
      <AnimatePresence>
        {done && (
          <motion.div
            key="success"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[60] flex items-center justify-center px-6"
            style={{
              background: 'rgba(10,10,10,0.92)',
              backdropFilter: 'blur(24px)',
            }}
          >
            <motion.div
              initial={{ scale: 0.88, y: 24, opacity: 0 }}
              animate={{ scale: 1, y: 0, opacity: 1 }}
              transition={{ type: 'spring', damping: 22, stiffness: 250 }}
              className="max-w-sm w-full rounded-3xl p-10 text-center"
              style={{
                background: 'rgba(255,255,255,0.04)',
                border: '1px solid rgba(255,255,255,0.08)',
              }}
            >
              <motion.div
                animate={{ scale: [1, 1.08, 1] }}
                transition={{ duration: 2.5, repeat: Infinity, ease: 'easeInOut' }}
                className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-6"
                style={{
                  background: `linear-gradient(135deg, ${VIOLET}, #4f46e5)`,
                  boxShadow: `0 0 36px rgba(124,58,237,0.42)`,
                }}
              >
                <Sparkles className="w-6 h-6 text-white" />
              </motion.div>

              <h2 className="text-white font-black text-xl mb-2">Story on its way!</h2>

              <p
                className="text-sm leading-relaxed mb-8"
                style={{ color: 'rgba(255,255,255,0.35)' }}
              >
                {activeChild?.name}&rsquo;s story is being crafted and animated.
                It&rsquo;ll appear in your library soon.
              </p>

              <div className="space-y-2.5">
                <Link href="/home3" className="block w-full">
                  <motion.div
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                    className="w-full py-3 rounded-xl font-black text-sm text-white flex items-center justify-center gap-2"
                    style={{ background: `linear-gradient(135deg, ${VIOLET}, #4f46e5)` }}
                  >
                    <Play className="w-3.5 h-3.5" />
                    Go to Library
                  </motion.div>
                </Link>
                <button
                  onClick={reset}
                  className="w-full py-2.5 text-sm font-semibold transition-colors focus:outline-none"
                  style={{ color: 'rgba(255,255,255,0.28)' }}
                  onMouseEnter={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.55)')}
                  onMouseLeave={e => (e.currentTarget.style.color = 'rgba(255,255,255,0.28)')}
                >
                  Create Another
                </button>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ─── Small amber chip ──────────────────────────────────────────────────────────
function Chip({ children }: { children: React.ReactNode }) {
  return (
    <motion.span
      initial={{ opacity: 0, scale: 0.8 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.8 }}
      className="inline-flex items-center px-2.5 py-1 rounded-full text-[11px] font-bold whitespace-nowrap flex-shrink-0"
      style={{
        background: 'rgba(245,183,49,0.12)',
        color: AMBER,
        border: '1px solid rgba(245,183,49,0.22)',
      }}
    >
      {children}
    </motion.span>
  );
}
