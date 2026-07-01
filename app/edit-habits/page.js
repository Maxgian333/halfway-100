'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '../../lib/supabaseClient';
import { localDateString } from '../../lib/dates';

function makeTaskId() {
  return `t_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
}

export default function EditHabitsPage() {
  const router = useRouter();
  const [userId, setUserId] = useState(null);
  const [displayName, setDisplayName] = useState('');
  const [tasks, setTasks] = useState([]);
  const [startDate, setStartDate] = useState('');
  const [daysAgo, setDaysAgo] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [saved, setSaved] = useState(false);

  const [newPassword, setNewPassword] = useState('');
  const [newPasswordConfirm, setNewPasswordConfirm] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [passwordSaved, setPasswordSaved] = useState(false);
  const [savingPassword, setSavingPassword] = useState(false);

  const today = localDateString();

  useEffect(() => {
    async function load() {
      const { data: { session } } = await supabase.auth.getSession();
      if (!session) { router.replace('/login'); return; }
      setUserId(session.user.id);

      const { data: profile, error: profileError } = await supabase
        .from('profiles')
        .select('display_name, tasks, challenge_start_date')
        .eq('id', session.user.id)
        .maybeSingle();

      if (profileError) { setError(profileError.message); setLoading(false); return; }
      if (!profile) { router.replace('/onboarding'); return; }

      setDisplayName(profile.display_name || '');
      setTasks(profile.tasks?.length > 0 ? profile.tasks : [{ id: makeTaskId(), label: '' }]);

      if (profile.challenge_start_date) {
        setStartDate(profile.challenge_start_date);
        const diff = Math.floor(
          (new Date(today) - new Date(profile.challenge_start_date)) / 86400000
        );
        setDaysAgo(String(diff));
      }
      setLoading(false);
    }
    load();
  }, [router, today]);

  // When the user types "X days ago", compute and set the start date
  function handleDaysAgoChange(val) {
    const n = val.replace(/\D/g, '');
    setDaysAgo(n);
    if (n === '' || n === '0') {
      setStartDate(today);
    } else {
      const d = new Date(today);
      d.setDate(d.getDate() - parseInt(n, 10));
      setStartDate(localDateString(d));
    }
    setSaved(false);
  }

  // When the user picks a date directly, update daysAgo too
  function handleStartDateChange(val) {
    setStartDate(val);
    if (val) {
      const diff = Math.floor((new Date(today) - new Date(val)) / 86400000);
      setDaysAgo(diff >= 0 ? String(diff) : '');
    } else {
      setDaysAgo('');
    }
    setSaved(false);
  }

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

    if (cleanTasks.length === 0) { setError('Keep at least one habit.'); return; }
    if (!displayName.trim()) { setError('Name is required.'); return; }

    setSaving(true);
    const { error: dbError } = await supabase.from('profiles').upsert({
      id: userId,
      display_name: displayName.trim(),
      tasks: cleanTasks,
      challenge_start_date: startDate || null,
    });
    setSaving(false);

    if (dbError) { setError(dbError.message); }
    else { setTasks(cleanTasks); setSaved(true); }
  }

  async function handleChangePassword(e) {
    e.preventDefault();
    setPasswordError('');
    setPasswordSaved(false);
    if (newPassword.length < 8) { setPasswordError('Password must be at least 8 characters.'); return; }
    if (newPassword !== newPasswordConfirm) { setPasswordError('Passwords do not match.'); return; }
    setSavingPassword(true);
    const { error: pwError } = await supabase.auth.updateUser({ password: newPassword });
    setSavingPassword(false);
    if (pwError) { setPasswordError(pwError.message); }
    else { setPasswordSaved(true); setNewPassword(''); setNewPasswordConfirm(''); }
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

        <p className="vow-row mb-2 text-center">Settings</p>
        <h1 className="font-display text-3xl text-parchment text-center mb-8">
          Edit your challenge
        </h1>

        {/* ── Day counter ── */}
        <div className="card-ledger rounded-md p-6 mb-4">
          <p className="text-xs uppercase tracking-widest2 text-gold mb-1">Day counter</p>
          <p className="text-muted text-xs italic font-display mb-4">
            Set when your challenge started — the counter shows how many days in you are.
          </p>

          <div className="flex gap-3 items-end mb-3">
            <div className="flex-1">
              <label className="block text-xs uppercase tracking-widest2 text-muted mb-2">
                Days ago I started
              </label>
              <input
                type="text" inputMode="numeric"
                value={daysAgo}
                onChange={(e) => handleDaysAgoChange(e.target.value)}
                placeholder="e.g. 5"
                className="input-ledger w-full rounded-sm px-3 py-2 text-sm font-mono-num"
                maxLength={3}
              />
            </div>
            <span className="text-muted text-xs pb-2.5">or</span>
            <div className="flex-1">
              <label className="block text-xs uppercase tracking-widest2 text-muted mb-2">
                Exact start date
              </label>
              <input
                type="date"
                value={startDate}
                max={today}
                onChange={(e) => handleStartDateChange(e.target.value)}
                className="input-ledger w-full rounded-sm px-3 py-2 text-sm"
              />
            </div>
          </div>

          {startDate && (
            <p className="text-gold text-xs font-mono-num">
              Day {Math.max(1, Math.floor((new Date(today) - new Date(startDate)) / 86400000) + 1)}/100
            </p>
          )}
        </div>

        {/* ── Name ── */}
        <div className="card-ledger rounded-md p-6 mb-4">
          <p className="text-xs uppercase tracking-widest2 text-gold mb-4">Profile</p>
          <label className="block text-xs uppercase tracking-widest2 text-muted mb-2">
            Name on the roll
          </label>
          <input
            value={displayName}
            onChange={(e) => { setDisplayName(e.target.value); setSaved(false); }}
            className="input-ledger w-full rounded-sm px-3 py-2 text-sm"
            maxLength={40}
          />
        </div>

        {/* ── Habits ── */}
        <div className="card-ledger rounded-md p-6 mb-6">
          <p className="text-xs uppercase tracking-widest2 text-gold mb-4">Daily habits</p>
          <p className="text-muted text-xs italic font-display mb-4">
            Your streak is untouched — only today and days ahead use this list.
          </p>
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
                <button type="button" onClick={() => removeTask(task.id)}
                  className="text-muted hover:text-emberBright text-sm px-2" aria-label="Remove habit">
                  ×
                </button>
              </div>
            ))}
          </div>
          {tasks.length < 15 && (
            <button type="button" onClick={addTask}
              className="text-gold text-xs uppercase tracking-widest2 hover:text-goldBright">
              + Add another habit
            </button>
          )}
        </div>

        {/* ── Change password ── */}
        <form onSubmit={handleChangePassword} className="card-ledger rounded-md p-6 mb-6">
          <p className="text-xs uppercase tracking-widest2 text-gold mb-1">Password</p>
          <p className="text-muted text-xs italic font-display mb-4">
            Set or update your password. Use this to log in from any device without needing a code.
          </p>
          <label className="block text-xs uppercase tracking-widest2 text-muted mb-2">New password</label>
          <input type="password" value={newPassword}
            onChange={(e) => { setNewPassword(e.target.value); setPasswordSaved(false); }}
            placeholder="At least 8 characters"
            className="input-ledger w-full rounded-sm px-3 py-2 mb-3 text-sm" />
          <label className="block text-xs uppercase tracking-widest2 text-muted mb-2">Confirm password</label>
          <input type="password" value={newPasswordConfirm}
            onChange={(e) => { setNewPasswordConfirm(e.target.value); setPasswordSaved(false); }}
            placeholder="Same again"
            className="input-ledger w-full rounded-sm px-3 py-2 mb-4 text-sm" />
          {passwordError && <p className="text-emberBright text-xs mb-3">{passwordError}</p>}
          {passwordSaved && <p className="text-gold text-xs uppercase tracking-widest2 mb-3">Password updated.</p>}
          <button type="submit" disabled={savingPassword || !newPassword || !newPasswordConfirm}
            className="btn-primary w-full rounded-sm py-2.5 text-sm uppercase tracking-widest2">
            {savingPassword ? 'Saving…' : 'Set Password'}
          </button>
        </form>

        {error && <p className="text-emberBright text-xs mb-4 text-center">{error}</p>}
        {saved && (
          <p className="text-gold text-xs uppercase tracking-widest2 mb-4 text-center">
            Saved. The roll has been updated.
          </p>
        )}

        <button type="submit" disabled={saving}
          className="btn-primary w-full rounded-sm py-3 text-sm uppercase tracking-widest2">
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </main>
  );
}
