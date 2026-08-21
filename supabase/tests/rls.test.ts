// supabase/tests/rls.test.ts
// @vitest-environment node
import { describe, it, expect } from 'vitest';
import { createClient } from '@supabase/supabase-js';

const url = process.env.SUPABASE_URL ?? 'http://127.0.0.1:54321';
const anonKey = process.env.SUPABASE_ANON_KEY!;

async function newSignedInUser() {
  const supabase = createClient(url, anonKey);
  const email = `test-${crypto.randomUUID()}@example.local`;
  const { error } = await supabase.auth.signUp({ email, password: 'test-password-123!' });
  if (error) throw error;
  return supabase;
}

describe('goals RLS', () => {
  it('a user cannot read another user\'s goals', async () => {
    const userA = await newSignedInUser();
    const userB = await newSignedInUser();

    const { error: insertError } = await userA.from('goals').insert({ title: 'A\'s goal' });
    expect(insertError).toBeNull();

    const { data, error } = await userB.from('goals').select('*');
    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it('inserting without auth is rejected', async () => {
    const anon = createClient(url, anonKey);
    const { error } = await anon.from('goals').insert({ title: 'no user' });
    expect(error).not.toBeNull();
  });
});
