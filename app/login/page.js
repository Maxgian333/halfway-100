'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

export default function LoginPage() {
  const router = useRouter();
  const [step, setStep] = useState('email'); // 'email' | 'code'
  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(0);

  async function requestCode(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: authError } = await supabase.auth.signInWithOtp({
      email,
      options: {
        emailRedirectTo: typeof window !== 'undefined' ? window.location.origin : undefined,
      },
    });

    setLoading(false);

    if (authError) {
      setError(authError.message);
      return;
    }

    setStep('code');
    setResendCooldown(30);
    const timer = setInterval(() => {
      setResendCooldown((prev) => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
  }

  async function verifyCode(e) {
    e.preventDefault();
    setError('');
    setLoading(true);

    const { error: verifyError } = await supabase.auth.verifyOtp({
      email,
      token: code,
      type: 'email',
    });

    setLoading(false);

    if (verifyError) {
      setError(verifyError.message);
    } else {
      router.replace('/');
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="vow-row mb-3">Discipline · Sovereignty · Service</p>
          <h1 className="font-display text-5xl text-parchment leading-tight">
            Halfway<br />to God
          </h1>
          <div className="rule-gold w-24 mx-auto my-5" />
          <p className="text-muted text-sm italic font-display">
            100 days. Every habit, every day. Miss one, and the count returns to zero.
          </p>
        </div>

        {step === 'email' && (
          <form onSubmit={requestCode} className="card-ledger rounded-md p-6">
            <label className="block text-xs uppercase tracking-widest2 text-muted mb-2">
              Email
            </label>
            <input
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="input-ledger w-full rounded-sm px-3 py-2.5 mb-4 text-sm"
            />
            {error && <p className="text-emberBright text-xs mb-4">{error}</p>}
            <button
              type="submit"
              disabled={loading || !email}
              className="btn-primary w-full rounded-sm py-2.5 text-sm uppercase tracking-widest2"
            >
              {loading ? 'Sending…' : 'Enter the Challenge'}
            </button>
          </form>
        )}

        {step === 'code' && (
          <form onSubmit={verifyCode} className="card-ledger rounded-md p-6">
            <p className="text-parchment text-sm mb-1">A code was sent to {email}.</p>
            <p className="text-muted text-xs mb-5">
              Open your email, then type the 6-digit code here — no need to tap any link.
            </p>
            <label className="block text-xs uppercase tracking-widest2 text-muted mb-2">
              Code
            </label>
            <input
              type="text"
              inputMode="numeric"
              autoComplete="one-time-code"
              required
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
              placeholder="000000"
              className="input-ledger w-full rounded-sm px-3 py-2.5 mb-4 text-center text-lg font-mono-num tracking-widest"
            />
            {error && <p className="text-emberBright text-xs mb-4">{error}</p>}
            <button
              type="submit"
              disabled={loading || code.length !== 6}
              className="btn-primary w-full rounded-sm py-2.5 text-sm uppercase tracking-widest2 mb-3"
            >
              {loading ? 'Checking…' : 'Verify & Enter'}
            </button>
            <div className="flex justify-between text-xs">
              <button
                type="button"
                onClick={() => { setStep('email'); setCode(''); setError(''); }}
                className="text-muted hover:text-parchment"
              >
                Use a different email
              </button>
              <button
                type="button"
                disabled={resendCooldown > 0}
                onClick={requestCode}
                className="text-gold hover:text-goldBright disabled:text-muted disabled:cursor-not-allowed"
              >
                {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
              </button>
            </div>
          </form>
        )}
      </div>
    </main>
  );
}
