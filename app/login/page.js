'use client';

import { useState } from 'react';
import { supabase } from '../../lib/supabaseClient';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function handleSubmit(e) {
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
    } else {
      setSent(true);
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

        {sent ? (
          <div className="card-ledger rounded-md p-6 text-center">
            <p className="text-parchment font-display text-lg mb-1">The gate is open.</p>
            <p className="text-muted text-sm">
              Check {email} for a link in. No password to remember — just the one door.
            </p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="card-ledger rounded-md p-6">
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
            {error && (
              <p className="text-emberBright text-xs mb-4">{error}</p>
            )}
            <button
              type="submit"
              disabled={loading || !email}
              className="btn-primary w-full rounded-sm py-2.5 text-sm uppercase tracking-widest2"
            >
              {loading ? 'Sending…' : 'Enter the Challenge'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
