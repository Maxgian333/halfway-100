'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';

function makeTaskId() {
  return `t_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export default function EditHabitsPage() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  useEffect(() => {
    async function load() {
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

      if (!profile) {
        router.replace('/onboarding');
        return;
      }

      setDisplayName(profile.display_name || '');
      setTasks(
        profile.tasks && profile.tasks.length > 0
          ? profile.tasks
          : [{ id: makeTaskId(), label: '' }]
      );
      setLoading(false);
    }
    load();
  }, [router]);

  function updateTask(id, label) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, label } : t)));
    setSaved(false);
  }

  function addTask() {
    if (tasks.length >= 15) return;
    setTasks((prev) => [...prev, { id: makeTaskId(), label: '' }]);
    setSaved(false);
  }

  function removeTask(id) {
    if (tasks.length <= 1) return;
    setTasks((prev) => prev.filter((t) => t.id !== id));
    setSaved(false);
  }

  async function handleSave(e) {
    e.preventDefault();
    setError('');
    setSaved(false);

    const cleanTasks = tasks
      .map((t) => ({ id: t.id, label: t.label.trim() }))
      .filter((t) => t.label.length > 0);

    if (cleanTasks.length === 0) {
      setError('Keep at least one non-negotiable habit.');
      return;
    }
    if (!displayName.trim()) {
      setError('Pick a name the others will see on the roll.');
      return;
    }

    setSaving(true);
    // Updating tasks here only changes what TODAY and future days check
    // against. Every already-logged day keeps its own saved checklist
    // (daily_logs.checks) and its own all_complete flag exactly as it was
    // — the streak count is unaffected by this edit.
    const { error: dbError } = await supabase.from('profiles').upsert({
      id: userId,
      display_name: displayName.trim(),
      tasks: cleanTasks,
    });
    setSaving(false);

    if (dbError) {
      setError(dbError.message);
    } else {
      setTasks(cleanTasks);
      setSaved(true);
    }
  }

  if (loading) {
    return (
      <main className="min-h-screen flex items-center justify-center">
        <p className="text-muted font-display italic">Reading the ledger…</p>
      </main>
    );
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <form onSubmit={handleSave} className="w-full max-w-md">
        <div className="flex items-center justify-between mb-6">
          <Link href="/challenge" className="text-muted text-xs uppercase tracking-widest2 hover:text-parchment">
            ← Back
          </Link>
        </div>

        <p className="vow-row mb-2 text-center">Adjust the vow</p>
        <h1 className="font-display text-3xl text-parchment text-center mb-2">
          Edit your non-negotiables
        </h1>
        <p className="text-muted text-sm text-center mb-8 italic font-display">
          Your streak is untouched — only today and the days ahead use this
          updated list. Days already kept stay kept.
        </p>

        <div className="card-ledger rounded-md p-6 mb-6">
          <label className="block text-xs uppercase tracking-widest2 text-muted mb-2">
            Name on the roll
          </label>
          <input
            value={displayName}
            onChange={(e) => { setDisplayName(e.target.value); setSaved(false); }}
            className="input-ledger w-full rounded-sm px-3 py-2 mb-6 text-sm"
            maxLength={40}
          />

          <label className="block text-xs uppercase tracking-widest2 text-muted mb-2">
            Daily habits
          </label>
          <div className="space-y-2 mb-3">
            {tasks.map((task, i) => (
              <div key={task.id} className="flex gap-2">
                <span className="font-mono-num text-muted text-sm w-5 pt-2">
                  {String(i + 1).padStart(2, '0')}
                </span>
                <input
                  value={task.label}
                  onChange={(e) => updateTask(task.id, e.target.value)}
                  placeholder="e.g. Read 10 pages"
                  className="input-ledger flex-1 rounded-sm px-3 py-2 text-sm"
                  maxLength={80}
                />
                <button
                  type="button"
                  onClick={() => removeTask(task.id)}
                  className="text-muted hover:text-emberBright text-sm px-2"
                  aria-label="Remove habit"
                >
                  ×
                </button>
              </div>
            ))}
          </div>

          {tasks.length < 15 && (
            <button
              type="button"
              onClick={addTask}
              className="text-gold text-xs uppercase tracking-widest2 hover:text-goldBright"
            >
              + Add another habit
            </button>
          )}
        </div>

        {error && <p className="text-emberBright text-xs mb-4 text-center">{error}</p>}
        {saved && (
          <p className="text-gold text-xs uppercase tracking-widest2 mb-4 text-center">
            Saved. The roll has been updated.
          </p>
        )}

        <button
          type="submit"
          disabled={saving}
          className="btn-primary w-full rounded-sm py-3 text-sm uppercase tracking-widest2"
        >
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </main>
  );
}
