import { NextRequest, NextResponse } from 'next/server';
import { verifyUser, userScopedClient } from '@/lib/server/verify-user';
import { extractPlainText, type GmailMessage } from '@/lib/email-parsers/gmail-message';
import { parseAxisBankEmail } from '@/lib/email-parsers/axis-bank';
import { categorize } from '@/lib/email-parsers/categorize';

const KNOWN_SENDERS = [{ query: 'from:alerts@axis.bank.in', parse: parseAxisBankEmail }];

export async function POST(request: NextRequest) {
  const accessToken = request.headers.get('authorization')?.replace('Bearer ', '');
  if (!accessToken) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const userId = await verifyUser(accessToken);
  if (!userId) return NextResponse.json({ error: 'unauthorized' }, { status: 401 });

  const supabase = userScopedClient(accessToken);
  const { data: connection, error: connError } = await supabase
    .from('gmail_connections')
    .select('refresh_token')
    .maybeSingle();
  if (connError || !connection) {
    return NextResponse.json({ error: 'gmail_not_connected' }, { status: 400 });
  }

  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      refresh_token: connection.refresh_token,
      grant_type: 'refresh_token',
    }),
  });
  if (!tokenResponse.ok) {
    // Refresh token revoked/expired on Google's side — she needs to reconnect,
    // not a transient failure to retry silently.
    return NextResponse.json({ error: 'gmail_reconnect_required' }, { status: 401 });
  }
  const { access_token: googleAccessToken } = (await tokenResponse.json()) as { access_token: string };

  let inserted = 0;
  for (const sender of KNOWN_SENDERS) {
    const listResponse = await fetch(
      `https://gmail.googleapis.com/gmail/v1/users/me/messages?q=${encodeURIComponent(sender.query)}&maxResults=20`,
      { headers: { Authorization: `Bearer ${googleAccessToken}` } },
    );
    if (!listResponse.ok) continue;
    const { messages } = (await listResponse.json()) as { messages?: { id: string }[] };
    if (!messages) continue;

    for (const { id: messageId } of messages) {
      const { data: existing } = await supabase
        .from('pending_transactions')
        .select('id')
        .eq('source_message_id', messageId)
        .maybeSingle();
      if (existing) continue;

      const messageResponse = await fetch(
        `https://gmail.googleapis.com/gmail/v1/users/me/messages/${messageId}?format=full`,
        { headers: { Authorization: `Bearer ${googleAccessToken}` } },
      );
      if (!messageResponse.ok) continue;
      const message = (await messageResponse.json()) as GmailMessage;

      const body = extractPlainText(message);
      const parsed = sender.parse(body);
      const occurredAt = message.internalDate
        ? new Date(Number(message.internalDate)).toISOString()
        : new Date().toISOString();

      // A matched sender whose body fails to parse still gets a row (null
      // amount/merchant/category_guess) — never silently dropped. See the
      // design spec's error-handling section.
      const { error: insertError } = await supabase.from('pending_transactions').insert({
        source_message_id: messageId,
        amount: parsed?.amount ?? null,
        merchant: parsed?.merchant ?? null,
        category_guess: parsed?.merchant ? categorize(parsed.merchant) : null,
        occurred_at: occurredAt,
        raw_snippet: message.snippet ?? body.slice(0, 500),
        status: 'pending',
      });
      if (!insertError) inserted += 1;
    }
  }

  return NextResponse.json({ inserted });
}
