import { NextRequest, NextResponse } from 'next/server';
import { userScopedClient } from '@/lib/server/verify-user';

export async function GET(request: NextRequest) {
  const code = request.nextUrl.searchParams.get('code');
  const state = request.nextUrl.searchParams.get('state');
  const cookie = request.cookies.get('gmail_oauth')?.value;

  if (!code || !state || !cookie) {
    return NextResponse.redirect(new URL('/personal/settings?gmail_error=1', request.url));
  }

  const { state: expectedState, accessToken } = JSON.parse(cookie) as { state: string; accessToken: string };
  if (state !== expectedState) {
    return NextResponse.redirect(new URL('/personal/settings?gmail_error=1', request.url));
  }

  const redirectUri = new URL('/api/gmail/callback', request.url).toString();
  const tokenResponse = await fetch('https://oauth2.googleapis.com/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.GOOGLE_CLIENT_ID!,
      client_secret: process.env.GOOGLE_CLIENT_SECRET!,
      code,
      redirect_uri: redirectUri,
      grant_type: 'authorization_code',
    }),
  });

  if (!tokenResponse.ok) {
    return NextResponse.redirect(new URL('/personal/settings?gmail_error=1', request.url));
  }

  const tokens = (await tokenResponse.json()) as { refresh_token?: string };
  if (!tokens.refresh_token) {
    // Google only issues a refresh_token on first consent (or when prompt=consent
    // forces re-consent, which /connect always passes) — this branch means
    // something upstream changed; surface it rather than storing nothing silently.
    return NextResponse.redirect(new URL('/personal/settings?gmail_error=1', request.url));
  }

  const supabase = userScopedClient(accessToken);
  const now = new Date().toISOString();
  const { error } = await supabase
    .from('gmail_connections')
    .upsert({ refresh_token: tokens.refresh_token, connected_at: now, updated_at: now }, { onConflict: 'user_id' });

  const response = NextResponse.redirect(
    new URL(error ? '/personal/settings?gmail_error=1' : '/personal/settings?gmail_connected=1', request.url),
  );
  response.cookies.delete('gmail_oauth');
  return response;
}
