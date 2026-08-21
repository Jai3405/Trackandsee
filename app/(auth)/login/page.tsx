'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { getSupabaseClient } from '@/lib/supabase/client';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const router = useRouter();

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    const { error } = await getSupabaseClient().auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      return;
    }
    router.push('/personal/today');
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-indigo-900">
      <form onSubmit={handleSubmit} className="w-full max-w-sm rounded-frame bg-parchment p-8">
        <h1 className="mb-6 font-display text-2xl">Sign in</h1>
        <label htmlFor="email" className="mb-1 block text-sm">Email</label>
        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-lg border px-3 py-2" required />
        <label htmlFor="password" className="mb-1 block text-sm">Password</label>
        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded-lg border px-3 py-2" required />
        {error && <p role="alert" className="mb-4 text-sm text-rust">{error}</p>}
        <button type="submit" className="w-full rounded-lg bg-brass px-4 py-2">Sign in</button>
      </form>
    </main>
  );
}
