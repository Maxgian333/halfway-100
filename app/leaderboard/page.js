'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import { localDateString } from '../../lib/dates';

export default function LeaderboardPage() {
  const router = useRouter();
  const [rows, setRows] = useState(null);
  const [error, setError] = useState('');

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/login');
        return;
      }

      const { data, error: rpcError } = await supabase.rpc('get_leaderboard', {
        p_today: localDateString(),
      });
      if (rpcError) {
        setError(rpcError.message);
      } else {
        setRows(data || []);
      }
    }
    load();
  }, [router]);

  return (
    <main className="min-h-screen px-6 py-10 max-w-xl mx-auto">
      <header className="flex items-center justify-between mb-10">
        <div>
          <p className="vow-row">The Muster Roll</p>
          <p className="text-muted text-xs mt-1">Every name. Every count.</p>
        </div>
        <Link href="/challenge" className="text-gold text-xs uppercase tracking-widest2 hover:text-goldBright">
          Back
        </Link>
      </header>

      {error && <p className="text-emberBright text-sm">{error}</p>}

      {!rows && !error && (
        <p className="text-muted font-display italic text-center">Calling the roll…</p>
      )}

      {rows && rows.length === 0 && (
        <p className="text-muted font-display italic text-center">
          No one has stepped onto the field yet.
        </p>
      )}

      {rows && rows.length > 0 && (
        <ol className="card-ledger rounded-md divide-y divide-gold/10">
          {rows.map((row, i) => {
            const intensity = Math.min(row.streak / 100, 1);
            return (
              <li key={`${row.display_name}-${i}`} className="flex items-center gap-4 px-5 py-4">
                <span className="font-mono-num text-muted text-sm w-6">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <span className="flex-1 text-parchment text-sm">{row.display_name}</span>
                <span
                  aria-hidden="true"
                  className="w-2 h-2 rounded-full"
                  style={{
                    background: `rgba(227, 196, 98, ${0.25 + intensity * 0.75})`,
                    boxShadow: row.streak > 0
                      ? `0 0 ${4 + intensity * 10}px rgba(201, 162, 39, ${0.3 + intensity * 0.6})`
                      : 'none',
                  }}
                />
                <span className="font-mono-num text-goldBright text-sm w-14 text-right">
                  {row.streak}/100
                </span>
              </li>
            );
          })}
        </ol>
      )}
    </main>
  );
}
