'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Menu, X, BookOpen } from 'lucide-react';

const links = [
  { href: '/home1', label: 'Home 1' },
  { href: '/home2', label: 'Home 2' },
  { href: '/home3', label: 'Home 3' },
  { href: '/kids',  label: '🐨 Kids' },
];

export default function Navbar() {
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  const hasBg = scrolled || open;

  return (
    <nav
      className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
        hasBg
          ? 'bg-[#0a091c]/97 backdrop-blur-xl border-b border-white/[0.06] shadow-2xl'
          : 'bg-transparent'
      }`}
    >
      <div className="max-w-7xl mx-auto px-5 sm:px-8">
        <div className="flex items-center justify-between h-16">

          {/* Logo */}
          <Link href="/" className="flex items-center gap-2.5 shrink-0 group">
            <div
              className="w-8 h-8 rounded-xl flex items-center justify-center shadow-lg"
              style={{ background: 'rgba(245,183,49,0.18)', border: '1px solid rgba(245,183,49,0.35)' }}
            >
              <BookOpen className="w-4 h-4" style={{ color: '#F5B731' }} />
            </div>
            <span className="text-lg font-black text-white tracking-tight group-hover:text-amber-300 transition-colors">
              HushTales
            </span>
          </Link>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                className={`px-4 py-2 rounded-full text-sm font-semibold transition-all duration-200 ${
                  pathname === href
                    ? 'text-[#1a0e00] shadow-lg'
                    : 'text-white/60 hover:text-white hover:bg-white/8'
                }`}
                style={pathname === href
                  ? { background: 'linear-gradient(135deg,#F5B731,#D4950A)', boxShadow: '0 4px 14px rgba(245,183,49,0.4)' }
                  : {}}
              >
                {label}
              </Link>
            ))}
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-label={open ? 'Close menu' : 'Open menu'}
            className="md:hidden p-2 rounded-xl text-white/70 hover:text-white transition-colors"
            style={{ background: 'rgba(255,255,255,0.07)', border: '1px solid rgba(255,255,255,0.10)' }}
          >
            {open ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {open && (
        <div className="md:hidden border-t border-white/[0.06]" style={{ background: 'rgba(10,9,28,0.98)' }}>
          <div className="px-5 py-4 flex flex-col gap-2">
            {links.map(({ href, label }) => (
              <Link
                key={href}
                href={href}
                onClick={() => setOpen(false)}
                className={`px-4 py-3 rounded-2xl text-sm font-semibold transition-all ${
                  pathname === href
                    ? 'text-[#1a0e00]'
                    : 'text-white/60 hover:text-white hover:bg-white/8'
                }`}
                style={pathname === href
                  ? { background: 'linear-gradient(135deg,#F5B731,#D4950A)' }
                  : {}}
              >
                {label}
              </Link>
            ))}
          </div>
        </div>
      )}
    </nav>
  );
}
