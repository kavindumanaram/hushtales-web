'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { BookOpen, Search, Bell, Menu, X, ChevronDown, Sparkles, LogIn, LogOut } from 'lucide-react';
import { useAuth } from '@/hooks/useAuth';

const AMBER  = '#a78bfa';
const VIOLET = '#7c3aed';

// ─── Nav links ────────────────────────────────────────────────────────────────
type NavItem =
  | { label: string; href: string; dropdown?: never }
  | { label: string; href?: never; dropdown: { label: string; href: string; tag?: string }[] };

const NAV_ITEMS: NavItem[] = [
  { label: 'Home',     href: '/home3'    },
  { label: 'Stories',  href: '/library'  },
  {
    label: 'Browse',
    dropdown: [
      { label: 'New & Popular',   href: '/library',   tag: 'NEW'  },
      { label: 'Fantasy',         href: '/library'              },
      { label: 'Adventure',       href: '/library'              },
      { label: 'Bedtime Stories', href: '/library'              },
      { label: 'Originals',       href: '/library',   tag: 'ONLY HERE' },
    ],
  },
  { label: 'Kids',     href: '/kids'     },
  { label: 'Voice Studio', href: '/voice-studio' },
  { label: 'Profiles', href: '/profiles' },
];

export default function Navbar() {
  const pathname   = usePathname();
  const router     = useRouter();
  const [scrolled, setScrolled] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [searchOpen, setSearchOpen]   = useState(false);
  const [profileOpen, setProfileOpen] = useState(false);
  const searchRef  = useRef<HTMLInputElement>(null);
  const dropRef    = useRef<ReturnType<typeof setTimeout> | null>(null);

  const { user, loading: authLoading, signOut } = useAuth();
  const userInitial = (
    user?.signInDetails?.loginId ?? user?.username ?? 'M'
  ).charAt(0).toUpperCase();

  // Redirect immediately for instant feedback; let token revocation finish in
  // the background (otherwise sign-out appears to hang on the network call).
  function handleSignOut() {
    setProfileOpen(false);
    setMobileOpen(false);
    void signOut();
    router.replace('/home3');
  }

  // Scroll detection
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 40);
    fn();
    window.addEventListener('scroll', fn, { passive: true });
    return () => window.removeEventListener('scroll', fn);
  }, []);

  // Focus search input when opened
  useEffect(() => {
    if (searchOpen) searchRef.current?.focus();
  }, [searchOpen]);

  // Close mobile on route change
  useEffect(() => {
    setMobileOpen(false);
    setSearchOpen(false);
    setProfileOpen(false);
  }, [pathname]);

  function openDrop(label: string) {
    if (dropRef.current) clearTimeout(dropRef.current);
    setOpenDropdown(label);
  }
  function closeDrop() {
    dropRef.current = setTimeout(() => setOpenDropdown(null), 120);
  }
  function keepDrop() {
    if (dropRef.current) clearTimeout(dropRef.current);
  }

  const hasBg = scrolled || mobileOpen;

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          hasBg
            ? 'bg-[#080808]/95 backdrop-blur-xl border-b border-white/[0.05] shadow-2xl'
            : 'bg-gradient-to-b from-[rgba(0,0,0,0.72)] to-transparent'
        }`}
      >
        <div className="max-w-7xl mx-auto px-5 sm:px-8">
          <div className="flex items-center h-16 gap-8">

            {/* ── Logo ────────────────────────────────────────────────────── */}
            <Link
              href="/home3"
              className="flex items-center gap-2.5 shrink-0 group mr-2"
            >
              <div
                className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg transition-transform duration-200 group-hover:scale-105"
                style={{
                  background: `linear-gradient(135deg, ${VIOLET}55, ${VIOLET}22)`,
                  border: `1px solid ${VIOLET}55`,
                  boxShadow: `0 0 16px ${VIOLET}30`,
                }}
              >
                <BookOpen className="w-4 h-4" style={{ color: AMBER }} />
              </div>
              <span
                className="text-[17px] font-black tracking-tight text-white transition-colors duration-200 group-hover:text-violet-400"
              >
                HushTales
              </span>
            </Link>

            {/* ── Desktop nav links ────────────────────────────────────────── */}
            <div className="hidden md:flex items-center gap-0.5 flex-1">
              {NAV_ITEMS.map(item => {
                const isActive = item.href ? pathname === item.href || (item.href === '/home3' && pathname === '/') : false;
                const hasDropdown = !!item.dropdown;

                if (hasDropdown) {
                  return (
                    <div
                      key={item.label}
                      className="relative"
                      onMouseEnter={() => openDrop(item.label)}
                      onMouseLeave={closeDrop}
                    >
                      <button
                        className="flex items-center gap-1 px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 text-white/60 hover:text-white focus:outline-none"
                      >
                        {item.label}
                        <motion.span
                          animate={{ rotate: openDropdown === item.label ? 180 : 0 }}
                          transition={{ duration: 0.2 }}
                        >
                          <ChevronDown className="w-3.5 h-3.5 opacity-60" />
                        </motion.span>
                      </button>

                      <AnimatePresence>
                        {openDropdown === item.label && (
                          <motion.div
                            key="drop"
                            initial={{ opacity: 0, y: 6, scale: 0.97 }}
                            animate={{ opacity: 1, y: 0, scale: 1 }}
                            exit={{ opacity: 0, y: 4, scale: 0.97 }}
                            transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                            onMouseEnter={keepDrop}
                            onMouseLeave={closeDrop}
                            className="absolute top-full left-1/2 -translate-x-1/2 mt-2 w-52 rounded-2xl overflow-hidden"
                            style={{
                              background: 'rgba(12,11,28,0.97)',
                              border: '1px solid rgba(255,255,255,0.09)',
                              boxShadow: '0 20px 48px rgba(0,0,0,0.55), 0 0 0 1px rgba(124,58,237,0.12)',
                              backdropFilter: 'blur(20px)',
                            }}
                          >
                            {/* Violet top line */}
                            <div className="h-[2px] w-full" style={{ background: `linear-gradient(90deg, ${VIOLET}, transparent)` }} />
                            <div className="py-2">
                              {item.dropdown.map(sub => (
                                <Link
                                  key={sub.href + sub.label}
                                  href={sub.href}
                                  onClick={() => setOpenDropdown(null)}
                                  className="flex items-center justify-between px-4 py-2.5 text-sm font-medium text-white/60 hover:text-white hover:bg-white/[0.06] transition-all duration-150"
                                >
                                  {sub.label}
                                  {sub.tag && (
                                    <span
                                      className="text-[9px] font-black tracking-widest px-1.5 py-0.5 rounded"
                                      style={{ background: AMBER, color: '#0a0a0a' }}
                                    >
                                      {sub.tag}
                                    </span>
                                  )}
                                </Link>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </AnimatePresence>
                    </div>
                  );
                }

                return (
                  <Link
                    key={item.label}
                    href={item.href!}
                    className={`px-3.5 py-2 rounded-lg text-sm font-semibold transition-all duration-200 ${
                      isActive
                        ? 'text-white'
                        : 'text-white/55 hover:text-white hover:bg-white/[0.06]'
                    }`}
                    style={isActive ? { textShadow: '0 0 14px rgba(255,255,255,0.35)' } : {}}
                  >
                    {isActive && (
                      <span className="sr-only">(current)</span>
                    )}
                    {item.label}
                    {isActive && (
                      <motion.span
                        layoutId="nav-indicator"
                        className="block h-[2px] mt-0.5 rounded-full"
                        style={{ background: AMBER }}
                        transition={{ type: 'spring', stiffness: 380, damping: 30 }}
                      />
                    )}
                  </Link>
                );
              })}
            </div>

            {/* ── Right side actions ───────────────────────────────────────── */}
            <div className="hidden md:flex items-center gap-1 ml-auto">

              {/* Search */}
              <AnimatePresence mode="wait">
                {searchOpen ? (
                  <motion.div
                    key="search-open"
                    initial={{ width: 32, opacity: 0 }}
                    animate={{ width: 200, opacity: 1 }}
                    exit={{ width: 32, opacity: 0 }}
                    transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
                    className="flex items-center gap-2 rounded-lg overflow-hidden"
                    style={{
                      background: 'rgba(255,255,255,0.07)',
                      border: '1px solid rgba(255,255,255,0.15)',
                    }}
                  >
                    <Search className="w-4 h-4 text-white/50 ml-2.5 flex-shrink-0" />
                    <input
                      ref={searchRef}
                      onBlur={() => setSearchOpen(false)}
                      placeholder="Titles, themes…"
                      className="bg-transparent text-white text-sm outline-none placeholder-white/28 py-1.5 pr-2 w-full"
                    />
                  </motion.div>
                ) : (
                  <motion.button
                    key="search-icon"
                    onClick={() => setSearchOpen(true)}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.94 }}
                    className="w-8 h-8 flex items-center justify-center rounded-lg text-white/50 hover:text-white transition-colors focus:outline-none"
                  >
                    <Search className="w-4 h-4" />
                  </motion.button>
                )}
              </AnimatePresence>

              {/* Notifications */}
              <motion.button
                whileHover={{ scale: 1.1 }}
                whileTap={{ scale: 0.94 }}
                className="relative w-8 h-8 flex items-center justify-center rounded-lg text-white/50 hover:text-white transition-colors focus:outline-none"
              >
                <Bell className="w-4 h-4" />
                {/* Dot badge */}
                <span
                  className="absolute top-1.5 right-1.5 w-1.5 h-1.5 rounded-full"
                  style={{ background: AMBER }}
                />
              </motion.button>

              {/* Signed-out: Sign In link only */}
              {!authLoading && !user && (
                <Link href="/auth/login">
                  <motion.div
                    whileHover={{ scale: 1.04 }}
                    whileTap={{ scale: 0.97 }}
                    className="ml-1 flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-black text-white cursor-pointer"
                    style={{
                      background: `linear-gradient(135deg, ${VIOLET}, #4f46e5)`,
                      boxShadow: `0 0 18px ${VIOLET}45`,
                    }}
                  >
                    <LogIn className="w-3 h-3" />
                    Sign In
                  </motion.div>
                </Link>
              )}

              {/* Signed-in: Create CTA + profile dropdown */}
              {user && (
                <>
                  <Link href="/generate">
                    <motion.div
                      whileHover={{ scale: 1.04 }}
                      whileTap={{ scale: 0.97 }}
                      className="ml-1 flex items-center gap-1.5 px-3.5 py-1.5 rounded-lg text-xs font-black text-white cursor-pointer"
                      style={{
                        background: `linear-gradient(135deg, ${VIOLET}, #4f46e5)`,
                        boxShadow: `0 0 18px ${VIOLET}45`,
                      }}
                    >
                      <Sparkles className="w-3 h-3" />
                      Create
                    </motion.div>
                  </Link>

                  <div className="relative ml-1">
                    <motion.button
                      onClick={() => setProfileOpen((v) => !v)}
                      whileHover={{ scale: 1.08 }}
                      whileTap={{ scale: 0.95 }}
                      aria-label="Account menu"
                      className="w-8 h-8 rounded-lg flex items-center justify-center text-sm font-black cursor-pointer focus:outline-none"
                      style={{
                        background: `${VIOLET}28`,
                        border: `1.5px solid ${VIOLET}55`,
                        color: AMBER,
                      }}
                    >
                      {userInitial}
                    </motion.button>

                    <AnimatePresence>
                      {profileOpen && (
                        <motion.div
                          initial={{ opacity: 0, y: 6, scale: 0.97 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0, y: 4, scale: 0.97 }}
                          transition={{ duration: 0.16, ease: [0.22, 1, 0.36, 1] }}
                          className="absolute top-full right-0 mt-2 w-48 rounded-2xl overflow-hidden"
                          style={{
                            background: 'rgba(12,11,28,0.97)',
                            border: '1px solid rgba(255,255,255,0.09)',
                            boxShadow: '0 20px 48px rgba(0,0,0,0.55)',
                            backdropFilter: 'blur(20px)',
                          }}
                        >
                          <div className="px-4 py-3 border-b border-white/[0.06]">
                            <p className="text-white/40 text-[10px] font-bold uppercase tracking-wider">
                              Signed in as
                            </p>
                            <p className="text-white text-sm font-semibold truncate">
                              {user.signInDetails?.loginId ?? user.username}
                            </p>
                          </div>
                          <Link
                            href="/profiles"
                            onClick={() => setProfileOpen(false)}
                            className="block px-4 py-2.5 text-sm font-medium text-white/60 hover:text-white hover:bg-white/[0.06] transition-all"
                          >
                            Profiles
                          </Link>
                          <Link
                            href="/voice-studio"
                            onClick={() => setProfileOpen(false)}
                            className="block px-4 py-2.5 text-sm font-medium text-white/60 hover:text-white hover:bg-white/[0.06] transition-all"
                          >
                            Voice Studio
                          </Link>
                          <button
                            onClick={handleSignOut}
                            className="w-full flex items-center gap-2 px-4 py-2.5 text-sm font-medium text-white/60 hover:text-white hover:bg-white/[0.06] transition-all focus:outline-none"
                          >
                            <LogOut className="w-3.5 h-3.5" />
                            Sign Out
                          </button>
                        </motion.div>
                      )}
                    </AnimatePresence>
                  </div>
                </>
              )}
            </div>

            {/* ── Mobile hamburger ─────────────────────────────────────────── */}
            <button
              onClick={() => setMobileOpen(v => !v)}
              aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
              className="md:hidden ml-auto p-2 rounded-xl text-white/65 hover:text-white transition-colors focus:outline-none"
              style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.09)' }}
            >
              <AnimatePresence mode="wait" initial={false}>
                {mobileOpen
                  ? <motion.span key="x"  initial={{ rotate: -90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: 90, opacity: 0 }} transition={{ duration: 0.15 }} className="block"><X    className="w-5 h-5" /></motion.span>
                  : <motion.span key="hm" initial={{ rotate:  90, opacity: 0 }} animate={{ rotate: 0, opacity: 1 }} exit={{ rotate: -90, opacity: 0 }} transition={{ duration: 0.15 }} className="block"><Menu className="w-5 h-5" /></motion.span>
                }
              </AnimatePresence>
            </button>

          </div>
        </div>

        {/* ── Mobile menu ──────────────────────────────────────────────────── */}
        <AnimatePresence>
          {mobileOpen && (
            <motion.div
              key="mobile-menu"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.22, ease: [0.22, 1, 0.36, 1] }}
              className="md:hidden overflow-hidden border-t border-white/[0.05]"
              style={{ background: 'rgba(8,8,8,0.98)', backdropFilter: 'blur(20px)' }}
            >
              <div className="px-5 py-4 flex flex-col gap-1">
                {NAV_ITEMS.map(item => {
                  if (item.dropdown) {
                    return (
                      <div key={item.label}>
                        <p className="px-3 pt-3 pb-1.5 text-[10px] font-black uppercase tracking-widest text-white/25">
                          {item.label}
                        </p>
                        {item.dropdown.map(sub => (
                          <Link
                            key={sub.href + sub.label}
                            href={sub.href}
                            className="flex items-center justify-between px-3 py-2.5 rounded-xl text-sm font-medium text-white/55 hover:text-white hover:bg-white/[0.06] transition-all"
                          >
                            {sub.label}
                            {sub.tag && (
                              <span
                                className="text-[9px] font-black tracking-widest px-1.5 py-0.5 rounded"
                                style={{ background: AMBER, color: '#0a0a0a' }}
                              >
                                {sub.tag}
                              </span>
                            )}
                          </Link>
                        ))}
                      </div>
                    );
                  }
                  const isActive = item.href ? pathname === item.href || (item.href === '/home3' && pathname === '/') : false;
                  return (
                    <Link
                      key={item.label}
                      href={item.href!}
                      className={`px-3 py-2.5 rounded-xl text-sm font-semibold transition-all ${
                        isActive
                          ? 'text-white'
                          : 'text-white/55 hover:text-white hover:bg-white/[0.06]'
                      }`}
                      style={isActive ? { background: `${VIOLET}18`, borderLeft: `3px solid ${AMBER}` } : {}}
                    >
                      {item.label}
                    </Link>
                  );
                })}

                {/* Mobile CTA */}
                <div className="pt-3 mt-1 border-t border-white/[0.06] flex gap-2">
                  {user ? (
                    <>
                      <Link href="/generate" className="flex-1">
                        <div
                          className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black text-white"
                          style={{ background: `linear-gradient(135deg, ${VIOLET}, #4f46e5)` }}
                        >
                          <Sparkles className="w-3 h-3" />
                          Create Story
                        </div>
                      </Link>
                      <button
                        onClick={handleSignOut}
                        aria-label="Sign out"
                        className="w-10 h-10 rounded-xl flex items-center justify-center focus:outline-none"
                        style={{ background: `${VIOLET}28`, border: `1.5px solid ${VIOLET}55`, color: AMBER }}
                      >
                        <LogOut className="w-4 h-4" />
                      </button>
                    </>
                  ) : (
                    <Link href="/auth/login" className="flex-1">
                      <div
                        className="flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-black text-white"
                        style={{ background: `linear-gradient(135deg, ${VIOLET}, #4f46e5)` }}
                      >
                        <LogIn className="w-3 h-3" />
                        Sign In
                      </div>
                    </Link>
                  )}
                </div>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </nav>
    </>
  );
}
