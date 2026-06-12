'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, Plus } from 'lucide-react';
import { useStore } from '@/lib/store';

const AMBER  = '#F59E0B';
const VIOLET = '#7c3aed';

type Profile = {
  id:    string;
  name:  string;
  color: string;
};

const PROFILES: Profile[] = [
  { id: 'mom',    name: 'Mum',    color: VIOLET    },
  { id: 'emma',   name: 'Emma',   color: '#ec4899' },
  { id: 'liam',   name: 'Liam',   color: '#3b82f6' },
  { id: 'sofia',  name: 'Sofia',  color: '#14b8a6' },
  { id: 'oliver', name: 'Oliver', color: '#22c55e' },
];

export default function ProfilesPage() {
  const router = useRouter();
  const setActiveProfileId = useStore((s) => s.setActiveProfileId);
  const [selecting, setSelecting] = useState<string | null>(null);

  function handleSelect(id: string) {
    setActiveProfileId(id);
    setSelecting(id);
    setTimeout(() => router.push('/home3'), 850);
  }

  const selectedProfile = PROFILES.find(p => p.id === selecting);

  return (
    <div
      className="relative min-h-[calc(100vh-4rem)] flex flex-col items-center justify-center"
      style={{ background: '#080808' }}
    >
      {/* Subtle violet bloom at top */}
      <div
        className="absolute top-0 left-1/2 -translate-x-1/2 w-[480px] h-[220px] pointer-events-none"
        style={{
          background: 'radial-gradient(ellipse, rgba(124,58,237,0.10) 0%, transparent 70%)',
          filter: 'blur(48px)',
        }}
      />

      {/* Heading */}
      <motion.h1
        initial={{ opacity: 0, y: 14 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
        className="relative z-10 text-3xl sm:text-4xl font-black text-white tracking-tight mb-14"
      >
        Who&apos;s watching?
      </motion.h1>

      {/* Profile cards */}
      <div className="relative z-10 flex flex-wrap justify-center gap-7 px-6 max-w-3xl">
        {PROFILES.map((p, i) => (
          <motion.button
            key={p.id}
            onClick={() => selecting === null && handleSelect(p.id)}
            initial={{ opacity: 0, y: 18 }}
            animate={{
              opacity: selecting !== null && selecting !== p.id ? 0.15 : 1,
              y: 0,
            }}
            whileHover={selecting === null ? { scale: 1.09, y: -4 } : {}}
            whileTap={selecting === null ? { scale: 0.94 } : {}}
            transition={{ delay: i * 0.06, type: 'spring', stiffness: 280, damping: 22 }}
            className="flex flex-col items-center gap-3 cursor-pointer select-none focus:outline-none"
          >
            {/* Avatar */}
            <motion.div
              animate={
                selecting === p.id
                  ? {
                      scale: 1.12,
                      boxShadow: `0 0 0 2.5px ${p.color}, 0 0 32px ${p.color}50`,
                    }
                  : { scale: 1, boxShadow: '0 0 0 0px transparent' }
              }
              transition={{ type: 'spring', stiffness: 300, damping: 22 }}
              className="w-[90px] h-[90px] rounded-2xl flex items-center justify-center text-3xl font-black"
              style={{
                background: `${p.color}15`,
                border: `2px solid ${p.color}40`,
              }}
            >
              <span style={{ color: p.color }}>{p.name[0]}</span>
            </motion.div>

            {/* Name */}
            <span
              className="text-[13px] font-semibold tracking-wide transition-colors duration-200"
              style={{ color: selecting === p.id ? '#fff' : 'rgba(255,255,255,0.6)' }}
            >
              {p.name}
            </span>
          </motion.button>
        ))}

        {/* Add Kid */}
        <motion.button
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: selecting !== null ? 0.08 : 1, y: 0 }}
          whileHover={selecting === null ? { scale: 1.09, y: -4 } : {}}
          whileTap={selecting === null ? { scale: 0.94 } : {}}
          transition={{
            delay: PROFILES.length * 0.06,
            type: 'spring',
            stiffness: 280,
            damping: 22,
          }}
          className="flex flex-col items-center gap-3 cursor-pointer select-none focus:outline-none"
        >
          <div
            className="w-[90px] h-[90px] rounded-2xl flex items-center justify-center"
            style={{
              background: 'rgba(255,255,255,0.02)',
              border: '2px dashed rgba(255,255,255,0.13)',
            }}
          >
            <Plus className="w-7 h-7 text-white/22" />
          </div>
          <span className="text-[13px] font-semibold text-white/28 tracking-wide">Add Kid</span>
        </motion.button>
      </div>

      {/* Manage Profiles ghost link */}
      <motion.button
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.6 }}
        className="relative z-10 mt-14 px-5 py-2 rounded-full text-[11px] font-semibold uppercase tracking-widest text-white/22 hover:text-white/48 transition-colors duration-200"
        style={{ border: '1px solid rgba(255,255,255,0.07)' }}
      >
        Manage Profiles
      </motion.button>

      {/* Selection transition overlay */}
      <AnimatePresence>
        {selecting && (
          <motion.div
            key="overlay"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="fixed inset-0 z-50 flex flex-col items-center justify-center"
            style={{ background: 'rgba(8,8,8,0.88)', backdropFilter: 'blur(10px)' }}
          >
            <motion.div
              initial={{ scale: 0.82, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ type: 'spring', stiffness: 290, damping: 22 }}
              className="text-center"
            >
              <motion.div
                animate={{ rotate: [0, 14, -14, 8, 0] }}
                transition={{ delay: 0.08, duration: 0.48 }}
              >
                <Sparkles className="w-9 h-9 mx-auto mb-4" style={{ color: AMBER }} />
              </motion.div>
              <p className="text-[22px] font-black text-white mb-1">
                Hey, {selectedProfile?.name}!
              </p>
              <p className="text-sm text-white/38 font-medium mb-5">Loading your stories…</p>
              <div className="flex items-center justify-center gap-1.5">
                {[0, 1, 2].map(i => (
                  <motion.div
                    key={i}
                    className="w-1.5 h-1.5 rounded-full"
                    style={{ background: AMBER }}
                    animate={{ opacity: [0.2, 1, 0.2], scale: [0.8, 1.2, 0.8] }}
                    transition={{ duration: 0.75, delay: i * 0.14, repeat: Infinity }}
                  />
                ))}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
