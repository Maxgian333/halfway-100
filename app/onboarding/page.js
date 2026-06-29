'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../../lib/supabaseClient';

function makeTaskId() {
  return `t_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export default function OnboardingPage() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [tasks, setTasks] = useState([
    { id: makeTaskId(), label: '' },
    { id: makeTaskId(), label: '' },
    { id: makeTaskId(), label: '' },
  ]);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session) {
        router.replace('/login');
      } else {
        setUserId(session.user.id);
        setDisplayName(session.user.email.split('@')[0]);
      }
    });
  }, [router]);

  function updateTask(id, label) {
    setTasks((prev) => prev.map((t) => (t.id === id ? { ...t, label } : t)));
  }

  function addTask() {
    if (tasks.length >= 15) return;
    setTasks((prev) => [...prev, { id: makeTaskId(), label: '' }]);
  }

  function removeTask(id) {
    if (tasks.length <= 1) return;
    setTasks((prev) => prev.filter((t) => t.id !== id));
  }

  async function handleSave(e) {
    e.preventDefault();
    setError('');

    const cleanTasks = tasks
      .map((t) => ({ id: t.id, label: t.label.trim() }))
      .filter((t) => t.label.length > 0);

    if (cleanTasks.length === 0) {
      setError('Name at least one non-negotiable habit.');
      return;
    }
    if (!displayName.trim()) {
      setError('Pick a name the others will see on the roll.');
      return;
    }

    setSaving(true);
    const { error: dbError } = await supabase.from('profiles').upsert({
      id: userId,
      display_name: displayName.trim(),
      tasks: cleanTasks,
    });
    setSaving(false);

    if (dbError) {
      setError(dbError.message);
    } else {
      router.replace('/challenge');
    }
  }

  return (
    <main className="min-h-screen flex items-center justify-center px-6 py-12">
      <form onSubmit={handleSave} className="w-full max-w-md">
        <p className="vow-row mb-2 text-center">Before day one</p>
        <h1 className="font-display text-3xl text-parchment text-center mb-2">
          Name your non-negotiables
        </h1>
        <p className="text-muted text-sm text-center mb-8 italic font-display">
          Choose what you can actually keep, every single day. Miss one task on
          any day, and the count returns to zero.
        </p>

        <div className="card-ledger rounded-md p-6 mb-6">
          <label className="block text-xs uppercase tracking-widest2 text-muted mb-2">
            Name on the roll
          </label>
          <input
            value={displayName}
            onChange={(e) => setDisplayName(e.target.value)}
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

        <button
          type="submit"
          disabled={saving}
          className="btn-primary w-full rounded-sm py-3 text-sm uppercase tracking-widest2"
        >
          {saving ? 'Carving it in…' : 'Begin Day One'}
        </button>
      </form>
    </main>
  );
}
