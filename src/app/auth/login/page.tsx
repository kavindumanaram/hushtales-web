/* eslint-disable @next/next/no-img-element */
'use client';

import { Suspense, useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { BookOpen, Loader2, Mail, Lock, AlertCircle, ArrowRight } from 'lucide-react';
import {
  isAuthenticated,
  signInWithPassword,
  registerWithPassword,
  confirmRegistration,
  resendConfirmationCode,
} from '@/lib/auth';

const AMBER = '#a78bfa';
const VIOLET = '#7c3aed';
const NETFLIX_RED = '#E50914';

// Bump this string on each deploy to verify which bundle the live site serves.
const BUILD_MARKER = 'build-v2-native-auth';

// Prefilled dev credentials.
const DEV_EMAIL = 'tanveerdem3@gmail.com';
const DEV_PASSWORD = 'test1234';

type Mode = 'signin' | 'signup' | 'confirm';

function LoginInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  // A fresh sign-in always lands on the "Who's watching?" chooser (below).
  // `redirect` is only used to send an already-signed-in visitor back to the
  // protected route that bounced them here.
  const redirect = searchParams.get('redirect') ?? '/profiles';

  const [checking, setChecking] = useState(true);
  const [mode, setMode] = useState<Mode>('signin');
  const [email, setEmail] = useState(DEV_EMAIL);
  const [password, setPassword] = useState(DEV_PASSWORD);
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [info, setInfo] = useState<string | null>(null);

  useEffect(() => {
    isAuthenticated().then((authed) => {
      if (authed) router.replace(redirect);
      else setChecking(false);
    });
  }, [router, redirect]);

  function fail(e: unknown) {
    setError(e instanceof Error ? e.message : 'Something went wrong. Please try again.');
  }

  async function handleSignIn(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await signInWithPassword(email.trim(), password);
      if (res.isSignedIn) router.replace('/profiles');
      else if (res.nextStep === 'CONFIRM_SIGN_UP') {
        setInfo('Please confirm your account. We sent a code to your email.');
        setMode('confirm');
      } else setError(`Additional step required: ${res.nextStep}`);
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  }

  async function handleSignUp(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      const res = await registerWithPassword(email.trim(), password);
      if (res.isComplete) {
        const si = await signInWithPassword(email.trim(), password);
        if (si.isSignedIn) router.replace('/profiles');
      } else {
        setInfo('Account created. Enter the confirmation code sent to your email.');
        setMode('confirm');
      }
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  }

  async function handleConfirm(e: React.FormEvent) {
    e.preventDefault();
    setBusy(true);
    setError(null);
    try {
      await confirmRegistration(email.trim(), code.trim());
      const si = await signInWithPassword(email.trim(), password);
      if (si.isSignedIn) router.replace('/profiles');
      else { setInfo('Confirmed! You can sign in now.'); setMode('signin'); }
    } catch (e) {
      fail(e);
    } finally {
      setBusy(false);
    }
  }

  if (checking) {
    return (
      <div className="flex items-center justify-center min-h-screen" style={{ background: '#080808' }}>
        <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
      </div>
    );
  }

  return (
    <div className="relative min-h-screen flex flex-col" style={{ background: '#080808' }}>
      {/* Immersive background (matches home3 hero treatment) */}
      <div
        className="absolute inset-0"
        style={{
          backgroundImage: "url('/images/banners/banner5.jpeg')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />
      <div className="absolute inset-0" style={{ background: 'linear-gradient(to top, #080808 0%, rgba(8,8,8,0.72) 45%, rgba(8,8,8,0.55) 100%)' }} />
      <div className="absolute inset-0" style={{ background: 'radial-gradient(ellipse 60% 50% at 50% 40%, rgba(124,58,237,0.18) 0%, transparent 70%)' }} />

      {/* Brand */}
      <header className="relative z-10 px-6 sm:px-10 pt-6">
        <Link href="/home3" className="inline-flex items-center gap-2.5 group">
          <div
            className="w-9 h-9 rounded-xl flex items-center justify-center"
            style={{ background: `linear-gradient(135deg, ${VIOLET}55, ${VIOLET}22)`, border: `1px solid ${VIOLET}55`, boxShadow: `0 0 16px ${VIOLET}30` }}
          >
            <BookOpen className="w-4 h-4" style={{ color: AMBER }} />
          </div>
          <span className="text-lg font-black tracking-tight text-white">
            Hush<span style={{ color: NETFLIX_RED }}>Tales</span>
          </span>
        </Link>
      </header>

      {/* Form */}
      <div className="relative z-10 flex-1 flex items-center justify-center px-6 py-10">
        <motion.div
          initial={{ opacity: 0, y: 18 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
          className="w-full max-w-md rounded-3xl p-8 sm:p-10"
          style={{
            background: 'rgba(10,10,12,0.82)',
            border: '1px solid rgba(255,255,255,0.08)',
            backdropFilter: 'blur(20px)',
            boxShadow: '0 30px 80px rgba(0,0,0,0.6)',
          }}
        >
          <h1 className="text-white font-black text-3xl mb-1">
            {mode === 'signin' && 'Sign In'}
            {mode === 'signup' && 'Create Account'}
            {mode === 'confirm' && 'Confirm Email'}
          </h1>
          <p className="text-white/45 text-sm mb-7">
            {mode === 'signin' && 'Continue to your personalised bedtime stories.'}
            {mode === 'signup' && 'Start creating stories in your own voice.'}
            {mode === 'confirm' && 'Enter the code we emailed you.'}
          </p>

          {info && (
            <div className="mb-4 rounded-xl px-3.5 py-2.5"
              style={{ background: 'rgba(124,58,237,0.12)', border: '1px solid rgba(124,58,237,0.28)' }}>
              <span className="text-violet-200 text-xs leading-relaxed">{info}</span>
            </div>
          )}
          {error && (
            <div className="mb-4 flex items-start gap-2 rounded-xl px-3.5 py-2.5"
              style={{ background: 'rgba(239,68,68,0.12)', border: '1px solid rgba(239,68,68,0.28)' }}>
              <AlertCircle className="w-4 h-4 text-red-400 flex-shrink-0 mt-0.5" />
              <span className="text-red-300 text-xs leading-relaxed">{error}</span>
            </div>
          )}

          {mode === 'confirm' ? (
            <form onSubmit={handleConfirm} className="space-y-3">
              <Field icon={<Lock className="w-4 h-4" />} type="text" placeholder="Confirmation code"
                value={code} onChange={setCode} />
              <SubmitButton busy={busy} label="Confirm & Sign In" />
              <button type="button"
                onClick={() => resendConfirmationCode(email.trim()).then(() => setInfo('Code resent.')).catch(fail)}
                className="w-full text-xs font-semibold text-white/40 hover:text-white/70 transition-colors">
                Resend code
              </button>
            </form>
          ) : (
            <form onSubmit={mode === 'signin' ? handleSignIn : handleSignUp} className="space-y-3">
              <Field icon={<Mail className="w-4 h-4" />} type="email" placeholder="Email address"
                value={email} onChange={setEmail} autoComplete="email" />
              <Field icon={<Lock className="w-4 h-4" />} type="password" placeholder="Password"
                value={password} onChange={setPassword}
                autoComplete={mode === 'signin' ? 'current-password' : 'new-password'} />
              <SubmitButton busy={busy} label={mode === 'signin' ? 'Sign In' : 'Create Account'} />
            </form>
          )}

          {mode !== 'confirm' && (
            <p className="text-center text-white/40 text-xs mt-6">
              {mode === 'signin' ? "New to HushTales? " : 'Already have an account? '}
              <button
                onClick={() => { setMode(mode === 'signin' ? 'signup' : 'signin'); setError(null); setInfo(null); }}
                className="font-bold transition-colors"
                style={{ color: AMBER }}
              >
                {mode === 'signin' ? 'Create one' : 'Sign in'}
              </button>
            </p>
          )}

          <p className="text-center text-white/15 text-[10px] mt-5">{BUILD_MARKER}</p>
        </motion.div>
      </div>
    </div>
  );
}

function Field({
  icon, type, placeholder, value, onChange, autoComplete,
}: {
  icon: React.ReactNode; type: string; placeholder: string;
  value: string; onChange: (v: string) => void; autoComplete?: string;
}) {
  return (
    <div
      className="flex items-center gap-2.5 rounded-xl px-3.5 py-3 transition-colors focus-within:border-white/25"
      style={{ background: 'rgba(255,255,255,0.06)', border: '1px solid rgba(255,255,255,0.1)' }}
    >
      <span className="text-white/35">{icon}</span>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        autoComplete={autoComplete}
        required
        className="flex-1 bg-transparent text-white text-sm outline-none placeholder-white/30"
      />
    </div>
  );
}

function SubmitButton({ busy, label }: { busy: boolean; label: string }) {
  return (
    <button
      type="submit"
      disabled={busy}
      className="w-full flex items-center justify-center gap-2 py-3 rounded-xl font-black text-sm text-white transition-all duration-200 focus:outline-none disabled:opacity-70 mt-1"
      style={{ background: NETFLIX_RED, boxShadow: `0 8px 24px ${NETFLIX_RED}45` }}
    >
      {busy ? <Loader2 className="w-4 h-4 animate-spin" /> : <><span>{label}</span><ArrowRight className="w-4 h-4" /></>}
    </button>
  );
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex items-center justify-center min-h-screen" style={{ background: '#080808' }}>
          <Loader2 className="w-8 h-8 text-violet-400 animate-spin" />
        </div>
      }
    >
      <LoginInner />
    </Suspense>
  );
}
