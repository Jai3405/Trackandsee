'use client';
import { useEffect, useState } from 'react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { FrameCard } from '@/components/ui/frame-card';

export default function SettingsPage() {
  const [connected, setConnected] = useState<boolean | null>(null);
  const [status] = useState<'connected' | 'error' | null>(() => {
    if (typeof window === 'undefined') return null;
    const params = new URLSearchParams(window.location.search);
    if (params.get('gmail_connected')) return 'connected';
    if (params.get('gmail_error')) return 'error';
    return null;
  });

  useEffect(() => {
    getSupabaseClient()
      .from('gmail_connections')
      .select('id')
      .maybeSingle()
      .then(({ data }) => setConnected(!!data));
  }, []);

  async function handleConnect() {
    const {
      data: { session },
    } = await getSupabaseClient().auth.getSession();
    if (!session) return;
    const res = await fetch('/api/gmail/connect', {
      headers: { Authorization: `Bearer ${session.access_token}` },
    });
    if (!res.ok) return;
    const { authUrl } = (await res.json()) as { authUrl: string };
    window.location.href = authUrl;
  }

  return (
    <div className="p-4">
      <h1 className="mb-4 font-display text-2xl">Settings</h1>
      {status === 'connected' && <p className="mb-4 text-sm text-sage">Gmail connected.</p>}
      {status === 'error' && <p className="mb-4 text-sm text-rust">Couldn&apos;t connect Gmail — try again.</p>}
      <FrameCard className="p-4">
        <p className="mb-2 font-display text-lg">Gmail</p>
        {connected === null ? (
          <p className="text-sm text-ink/60">Checking…</p>
        ) : connected ? (
          <p className="text-sm text-sage">Connected</p>
        ) : (
          <button onClick={handleConnect} className="rounded-lg bg-accent px-4 py-2 text-parchment">
            Connect Gmail
          </button>
        )}
      </FrameCard>
    </div>
  );
}
