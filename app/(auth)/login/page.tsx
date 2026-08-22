'use client';
import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'motion/react';
import { getSupabaseClient } from '@/lib/supabase/client';
import { Flourish } from '@/components/ui/flourish';

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
    <main className="relative flex min-h-screen items-center justify-center overflow-hidden bg-nav-gradient">
      <Flourish className="pointer-events-none absolute bottom-8 left-8 h-24 w-24 text-dusty-blue/30" />
      <motion.form
        onSubmit={handleSubmit}
        initial={{ opacity: 0, y: 12 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, ease: 'easeOut' }}
        className="w-full max-w-sm rounded-frame bg-parchment p-8 shadow-frame"
      >
        <h1 className="mb-6 font-display text-2xl">Sign in</h1>
        <label htmlFor="email" className="mb-1 block text-sm">Email</label>
        <input id="email" type="email" value={email} onChange={(e) => setEmail(e.target.value)}
          className="mb-4 w-full rounded-lg border px-3 py-2" required />
        <label htmlFor="password" className="mb-1 block text-sm">Password</label>
        <input id="password" type="password" value={password} onChange={(e) => setPassword(e.target.value)}
          className="mb-4 w-full rounded-lg border px-3 py-2" required />
        {error && <p role="alert" className="mb-4 text-sm text-rust">{error}</p>}
        <motion.button
          type="submit"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
          className="w-full rounded-lg bg-accent px-4 py-2 text-parchment"
        >
          Sign in
        </motion.button>
      </motion.form>
    </main>
  );
}
