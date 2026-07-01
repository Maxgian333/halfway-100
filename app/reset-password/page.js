'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

export default function ResetPasswordPage() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [password, setPassword] = useState('');
  const [passwordConfirm, setPasswordConfirm] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [done, setDone] = useState(false);

  useEffect(() => {
    // Supabase fires an INITIAL_SESSION or PASSWORD_RECOVERY event when the
    // reset link is clicked. We wait for that before showing the form.
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event) => {
      if (event === 'PASSWORD_RECOVERY') {
        setReady(true);
      }
    });

    // Also check if there's already an active session (user clicked the link
    // and the browser restored it before this component mounted).
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session) setReady(true);
    });

    return () => subscription.unsubscribe();
  }, []);

  async function handleReset(e) {
    e.preventDefault();
    setError('');
    if (password !== passwordConfirm) { setError('Passwords do not match.'); return; }
    if (password.length < 8) { setError('Password must be at least 8 characters.'); return; }

    setLoading(true);
    const { error: updateError } = await supabase.auth.updateUser({ password });
    setLoading(false);

    if (updateError) {
      setError(updateError.message);
    } else {
      setDone(true);
      setTimeout(() => router.replace('/challenge'), 2000);
    }
  }

  return (
    <main className="min-h-screen flex flex-col items-center justify-center px-6">
      <div className="w-full max-w-sm">
        <div className="text-center mb-10">
          <p className="vow-row mb-3">Discipline · Self Mastery · Service</p>
          <h1 className="font-display text-4xl text-parchment leading-tight">
            Set your password
          </h1>
          <div className="rule-gold w-24 mx-auto my-5" />
        </div>

        {done && (
          <div className="card-ledger rounded-md p-6 text-center">
            <p className="text-gold font-display text-lg mb-1">Password updated.</p>
            <p className="text-muted text-sm">Taking you in…</p>
          </div>
        )}

        {!done && !ready && (
          <div className="card-ledger rounded-md p-6 text-center">
            <p className="text-muted font-display italic">Verifying the link…</p>
            <p className="text-muted text-xs mt-2">
              If nothing happens, the link may have expired.{' '}
              <button onClick={() => router.replace('/login')}
                className="text-gold hover:text-goldBright underline">
                Request a new one.
              </button>
            </p>
          </div>
        )}

        {!done && ready && (
          <form onSubmit={handleReset} className="card-ledger rounded-md p-6">
            <label className="block text-xs uppercase tracking-widest2 text-muted mb-2">
              New password
            </label>
            <input type="password" required value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="At least 8 characters"
              className="input-ledger w-full rounded-sm px-3 py-2.5 mb-4 text-sm" />
            <label className="block text-xs uppercase tracking-widest2 text-muted mb-2">
              Confirm password
            </label>
            <input type="password" required value={passwordConfirm}
              onChange={(e) => setPasswordConfirm(e.target.value)}
              placeholder="Same again"
              className="input-ledger w-full rounded-sm px-3 py-2.5 mb-4 text-sm" />
            {error && <p className="text-emberBright text-xs mb-4">{error}</p>}
            <button type="submit" disabled={loading || !password || !passwordConfirm}
              className="btn-primary w-full rounded-sm py-2.5 text-sm uppercase tracking-widest2">
              {loading ? 'Saving…' : 'Set Password & Enter'}
            </button>
          </form>
        )}
      </div>
    </main>
  );
}
