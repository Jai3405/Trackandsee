import { NextRequest, NextResponse } from 'next/server';
import { verifyUser } from '@/lib/server/verify-user';

export async function GET(request: NextRequest) {
  const accessToken = request.nextUrl.searchParams.get('access_token');
  if (!accessToken) return NextResponse.redirect(new URL('/login', request.url));

  const userId = await verifyUser(accessToken);
  if (!userId) return NextResponse.redirect(new URL('/login', request.url));

  const state = crypto.randomUUID();
  const redirectUri = new URL('/api/gmail/callback', request.url).toString();

  const authUrl = new URL('https://accounts.google.com/o/oauth2/v2/auth');
  authUrl.searchParams.set('client_id', process.env.GOOGLE_CLIENT_ID!);
  authUrl.searchParams.set('redirect_uri', redirectUri);
  authUrl.searchParams.set('response_type', 'code');
  authUrl.searchParams.set('scope', 'https://www.googleapis.com/auth/gmail.readonly');
  authUrl.searchParams.set('access_type', 'offline');
  authUrl.searchParams.set('prompt', 'consent');
  authUrl.searchParams.set('state', state);

  const response = NextResponse.redirect(authUrl);
  // Short-lived, httpOnly: carries her already-issued Supabase access token
  // across the Google redirect round-trip so /callback can write to
  // gmail_connections as her, without needing a service_role key anywhere
  // in this feature.
  response.cookies.set('gmail_oauth', JSON.stringify({ state, accessToken }), {
    httpOnly: true,
    secure: true,
    sameSite: 'lax',
    maxAge: 600,
    path: '/',
  });
  return response;
}
