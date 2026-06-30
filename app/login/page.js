'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();
  // mode: 'password' | 'code-email' | 'code-verify' | 'signup'
  const [mode, setMode] = useState('password');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  function clearErrors() { setError(''); }

  // --- Password sign-in ---
  async function handlePasswordSignIn(e) {
    e.preventDefault();
    clearErrors();
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithPassword({ email, password });
    setLoading(false);
    if (authError) {
      setError(authError.message);
    } else {
      router.replace('/');
    }
  }

  // --- Sign up with password (first-time users) ---
  async function handleSignUp(e) {
    e.preventDefault();
    clearErrors();
    if (password !== passwordConfirm) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.');
      return;
    }
    setLoading(true);
    const { error: authError } = await supabase.auth.signUp({ email, password });
    setLoading(false);
    if (authError) {
      setError(authError.message);
    } else {
      // Auto sign them in after signup
      const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
      if (signInError) {
        setError('Account created — now sign in below.');
        setMode('password');
      } else {
        router.replace('/');
      }
    }
  }

  // --- Code flow (fallback / existing accounts without password) ---
  async function requestCode(e) {
    if (e && e.preventDefault) e.preventDefault();
    clearErrors();
    setLoading(true);
    const { error: authError } = await supabase.auth.signInWithOtp({ email });
    setLoading(false);
    if (authError) {
      setError(authError.message);
      return;
    }
    setMode('code-verify');
    setResendCooldown(30);
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) { clearInterval(timer); return 0; }
        return prev - 1;
      });
    }, 1000);
  }

  async function verifyCode(e) {
    e.preventDefault();
    clearErrors();
    setLoading(true);
    const { error: verifyError } = await supabase.auth.verifyOtp({
      email, token: code, type: 'email',
    });
    setLoading(false);
    if (verifyError) {
      setError(verifyError.message);
    } else {
      router.replace('/');
    }
  }

  const hero = (
    <div className="text-center mb-10">
      <p className="vow-row mb-3">Discipline · Self Mastery · Service</p>
      <h1 className="font-display text-5xl text-parchment leading-tight">
        Halfway<br />to God
      </h1>
      <div className="rule-gold w-24 mx-auto my-5" />
      <p className="text-muted text-sm italic font-display">
        100 days. Every habit, every day. Miss one, and the count returns to zero.
      </p>
    </div>
  );

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-sm">
        {hero}

        {/* ── Password sign-in ── */}
        {mode === 'password' && (
          <form onSubmit={handlePasswordSignIn} className="card-ledger rounded-md p-6">
            <label className="block text-xs uppercase tracking-widest2 text-muted mb-2">Email</label>
            <input
              type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input-ledger w-full rounded-sm px-3 py-2.5 mb-4 text-sm"
            />
            <label className="block text-xs uppercase tracking-widest2 text-muted mb-2">Password</label>
            <input
              type="password" required value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              className="input-ledger w-full rounded-sm px-3 py-2.5 mb-4 text-sm"
            />
            {error && <p className="text-emberBright text-xs mb-4">{error}</p>}
            <button
              type="submit" disabled={loading || !email || !password}
              className="btn-primary w-full rounded-sm py-2.5 text-sm uppercase tracking-widest2 mb-4"
            >
              {loading ? 'Entering…' : 'Enter the Challenge'}
            </button>
            <div className="flex justify-between text-xs">
              <button type="button" onClick={() => { clearErrors(); setMode('signup'); }}
                className="text-gold hover:text-goldBright">
                New here? Create account
              </button>
              <button type="button" onClick={() => { clearErrors(); setMode('code-email'); }}
                className="text-muted hover:text-parchment">
                Use a code instead
              </button>
            </div>
          </form>
        )}

        {/* ── Sign up ── */}
        {mode === 'signup' && (
          <form onSubmit={handleSignUp} className="card-ledger rounded-md p-6">
            <p className="text-parchment font-display text-lg mb-4">Create your account</p>
            <label className="block text-xs uppercase tracking-widest2 text-muted mb-2">Email</label>
            <input
              type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input-ledger w-full rounded-sm px-3 py-2.5 mb-4 text-sm"
            />
            <label className="block text-xs uppercase tracking-widest2 text-muted mb-2">Password</label>
            <input
              type="password" required value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="input-ledger w-full rounded-sm px-3 py-2.5 mb-4 text-sm"
            />
            <label className="block text-xs uppercase tracking-widest2 text-muted mb-2">Confirm password</label>
            <input
              type="password" required value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="Same again"
              className="input-ledger w-full rounded-sm px-3 py-2.5 mb-4 text-sm"
            />
            {error && <p className="text-emberBright text-xs mb-4">{error}</p>}
            <button
              type="submit" disabled={loading || !email || !password || !passwordConfirm}
              className="btn-primary w-full rounded-sm py-2.5 text-sm uppercase tracking-widest2 mb-4"
            >
              {loading ? 'Creating…' : 'Create Account & Enter'}
            </button>
            <button type="button" onClick={() => { clearErrors(); setMode('password'); }}
              className="text-muted text-xs hover:text-parchment">
              ← Back to sign in
            </button>
          </form>
        )}

        {/* ── Code flow: email step ── */}
        {mode === 'code-email' && (
          <form onSubmit={requestCode} className="card-ledger rounded-md p-6">
            <p className="text-parchment text-sm mb-4">
              Enter your email and we'll send a 6-digit code — no password needed.
            </p>
            <label className="block text-xs uppercase tracking-widest2 text-muted mb-2">Email</label>
            <input
              type="email" required value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input-ledger w-full rounded-sm px-3 py-2.5 mb-4 text-sm"
            />
            {error && <p className="text-emberBright text-xs mb-4">{error}</p>}
            <button
              type="submit" disabled={loading || !email}
              className="btn-primary w-full rounded-sm py-2.5 text-sm uppercase tracking-widest2 mb-4"
            >
              {loading ? 'Sending…' : 'Send Code'}
            </button>
            <button type="button" onClick={() => { clearErrors(); setMode('password'); }}
              className="text-muted text-xs hover:text-parchment">
              ← Back to sign in
            </button>
          </form>
        )}

        {/* ── Code flow: verify step ── */}
        {mode === 'code-verify' && (
          <form onSubmit={verifyCode} className="card-ledger rounded-md p-6">
            <p className="text-parchment text-sm mb-1">Code sent to {email}.</p>
            <p className="text-muted text-xs mb-5">Type the 6-digit number from your email — no link to click.</p>
            <label className="block text-xs uppercase tracking-widest2 text-muted mb-2">Code</label>
            <input
              type="text" inputMode="numeric" autoComplete="one-time-code" required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="input-ledger w-full rounded-sm px-3 py-2.5 mb-4 text-center text-lg font-mono-num tracking-widest"
            />
            {error && <p className="text-emberBright text-xs mb-4">{error}</p>}
            <button
              type="submit" disabled={loading || code.length !== 6}
              className="btn-primary w-full rounded-sm py-2.5 text-sm uppercase tracking-widest2 mb-3"
            >
              {loading ? 'Checking…' : 'Verify & Enter'}
            </button>
            <div className="flex justify-between text-xs">
              <button type="button"
                onClick={() => { setMode('code-email'); setCode(''); clearErrors(); }}
                className="text-muted hover:text-parchment">
                Use a different email
              </button>
              <button type="button" disabled={resendCooldown > 0} onClick={requestCode}
                className="text-gold hover:text-goldBright disabled:text-muted disabled:cursor-not-allowed">
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
