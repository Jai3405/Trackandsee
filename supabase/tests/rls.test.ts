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

describe('gmail_connections RLS', () => {
  it('a signed-in user can insert and select their own row', async () => {
    const user = await newSignedInUser();

    const { error: insertError } = await user.from('gmail_connections').insert({ refresh_token: 'rt-own' });
    expect(insertError).toBeNull();

    const { data, error } = await user.from('gmail_connections').select('*');
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
  });

  it('a user cannot read another user\'s gmail_connections row', async () => {
    const userA = await newSignedInUser();
    const userB = await newSignedInUser();

    const { error: insertError } = await userA.from('gmail_connections').insert({ refresh_token: 'rt-a' });
    expect(insertError).toBeNull();

    const { data, error } = await userB.from('gmail_connections').select('*');
    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it('inserting without auth is rejected', async () => {
    const anon = createClient(url, anonKey);
    const { error } = await anon.from('gmail_connections').insert({ refresh_token: 'rt-anon' });
    expect(error).not.toBeNull();
  });
});

describe('pending_transactions RLS', () => {
  it('a signed-in user can insert and select their own row', async () => {
    const user = await newSignedInUser();

    const { error: insertError } = await user.from('pending_transactions').insert({
      source_message_id: `msg-${crypto.randomUUID()}`,
      occurred_at: new Date().toISOString(),
      status: 'pending',
    });
    expect(insertError).toBeNull();

    const { data, error } = await user.from('pending_transactions').select('*');
    expect(error).toBeNull();
    expect(data).toHaveLength(1);
  });

  it('a user cannot read another user\'s pending_transactions row', async () => {
    const userA = await newSignedInUser();
    const userB = await newSignedInUser();

    const { error: insertError } = await userA.from('pending_transactions').insert({
      source_message_id: `msg-${crypto.randomUUID()}`,
      occurred_at: new Date().toISOString(),
      status: 'pending',
    });
    expect(insertError).toBeNull();

    const { data, error } = await userB.from('pending_transactions').select('*');
    expect(error).toBeNull();
    expect(data).toEqual([]);
  });

  it('inserting without auth is rejected', async () => {
    const anon = createClient(url, anonKey);
    const { error } = await anon.from('pending_transactions').insert({
      source_message_id: `msg-${crypto.randomUUID()}`,
      occurred_at: new Date().toISOString(),
      status: 'pending',
    });
    expect(error).not.toBeNull();
  });
});
