'use client';

import { useEffect, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import { localDateString } from '../../lib/dates';
import { quoteForDate } from '../../lib/quotes';

export default function ChallengePage() {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [tasks, setTasks] = useState([]);
  const [checks, setChecks] = useState({});
  const [streak, setStreak] = useState(0);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  const today = localDateString();
  const quote = quoteForDate();

  const load = useCallback(async () => {
    const { data: { session } } = await supabase.auth.getSession();
    if (!session) {
      router.replace('/login');
      return;
    }
    setUserId(session.user.id);

    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('display_name, tasks')
      .eq('id', session.user.id)
      .maybeSingle();

    if (profileError) {
      setError(profileError.message);
      setLoading(false);
      return;
    }

    if (!profile || !profile.tasks || profile.tasks.length === 0) {
      router.replace('/onboarding');
      return;
    }

    setDisplayName(profile.display_name);
    setTasks(profile.tasks);

    const { data: todayLog } = await supabase
      .from('daily_logs')
      .select('checks')
      .eq('user_id', session.user.id)
      .eq('log_date', today)
      .maybeSingle();

    setChecks(todayLog?.checks || {});

    const { data: streakValue } = await supabase.rpc('get_streak', {
      p_user_id: session.user.id,
      p_today: today,
    });
    setStreak(streakValue ?? 0);

    setLoading(false);
  }, [router, today]);

  useEffect(() => {
    load();
  }, [load]);

  async function toggleTask(taskId) {
    if (!userId) return;
    const nextChecks = { ...checks, [taskId]: !checks[taskId] };
    setChecks(nextChecks);

    const allComplete = tasks.every((t) => !!nextChecks[t.id]);

    setSaving(true);
    const { error: saveError } = await supabase.from('daily_logs').upsert({
      user_id: userId,
      log_date: today,
      checks: nextChecks,
      all_complete: allComplete,
    }, { onConflict: 'user_id,log_date' });
    setSaving(false);

    if (saveError) setError(saveError.message);
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    router.replace('/login');
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-muted font-display italic">Reading the ledger…</p>
      </main>
    );
  }

  const checkedCount = tasks.filter((t) => !!checks[t.id]).length;
  const allDone = checkedCount === tasks.length;

  return (
    <main className="min-h-screen px-6 py-10 max-w-xl mx-auto">
      <header className="flex items-center justify-between mb-10">
        <div>
          <p className="vow-row">Discipline · Sovereignty · Service</p>
          <p className="text-muted text-xs mt-1">{displayName}</p>
        </div>
        <nav className="flex gap-4 text-xs uppercase tracking-widest2">
          <Link href="/leaderboard" className="text-gold hover:text-goldBright">
            Roll
          </Link>
          <button onClick={handleSignOut} className="text-muted hover:text-parchment">
            Leave
          </button>
        </nav>
      </header>

      <section className="text-center mb-10">
        <p className="text-muted text-xs uppercase tracking-widest2 mb-2">Day</p>
        <p className="font-mono-num text-7xl text-goldBright leading-none">
          {streak}<span className="text-3xl text-muted">/100</span>
        </p>
        <div className="w-full h-1.5 bg-inkRaised rounded-full mt-5 overflow-hidden">
          <div
            className="h-full bg-gradient-to-r from-gold to-goldBright rounded-full"
            style={{ width: `${Math.min(streak, 100)}%` }}
          />
        </div>
        {streak === 0 && (
          <p className="text-muted text-xs mt-3 italic font-display">
            The count starts the day every habit is kept, in full.
          </p>
        )}
      </section>

      <section className="card-ledger rounded-md p-5 mb-8">
        <p className="font-display italic text-parchment text-sm leading-relaxed">
          &ldquo;{quote.text}&rdquo;
        </p>
      </section>

      <section className="card-ledger rounded-md p-6">
        <div className="flex items-center justify-between mb-5">
          <h2 className="font-display text-xl text-parchment">Today</h2>
          <span className="font-mono-num text-sm text-muted">
            {checkedCount}/{tasks.length}
          </span>
        </div>

        <ul className="space-y-3">
          {tasks.map((task) => (
            <li key={task.id} className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => toggleTask(task.id)}
                className={`checkbox-seal ${checks[task.id] ? 'checked' : ''}`}
                aria-pressed={!!checks[task.id]}
                aria-label={task.label}
              />
              <span className={`text-sm ${checks[task.id] ? 'text-parchment' : 'text-muted'}`}>
                {task.label}
              </span>
            </li>
          ))}
        </ul>

        {allDone && (
          <p className="text-gold text-xs uppercase tracking-widest2 text-center mt-6">
            Day held. The count moves at midnight.
          </p>
        )}
        {error && <p className="text-emberBright text-xs mt-4">{error}</p>}
      </section>

      <p className="text-center text-muted text-xs mt-6 h-4">
        {saving ? 'Saving…' : ''}
      </p>
    </main>
  );
}
