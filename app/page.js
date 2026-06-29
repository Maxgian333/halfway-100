'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '../lib/supabaseClient';

export default function Home() {
  const router = useRouter();
  const [status, setStatus] = useState('Checking the gate…');

  useEffect(() => {
    let active = true;

    async function route() {
      const { data: { session } } = await supabase.auth.getSession();

      if (!active) return;

      if (!session) {
        router.replace('/login');
        return;
      }

      const { data: profile } = await supabase
        .from('profiles')
        .select('tasks')
        .eq('id', session.user.id)
        .maybeSingle();

      if (!active) return;

      if (!profile || !profile.tasks || profile.tasks.length === 0) {
        router.replace('/onboarding');
      } else {
        router.replace('/challenge');
      }
    }

    route().catch(() => {
      if (active) setStatus('Something went wrong. Try refreshing.');
    });

    return () => { active = false; };
  }, [router]);

  return (
    <main className="min-h-screen flex items-center justify-center">
      <p className="text-muted font-display italic text-lg">{status}</p>
    </main>
  );
}
