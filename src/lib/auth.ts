import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions: NextAuthOptions = {
  session: { strategy: 'jwt', maxAge: 30 * 24 * 60 * 60 },
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/calendar.readonly',
          access_type: 'offline',
          // Always prompt for consent so Google returns a refresh_token,
          // even when the user has already authorised the app before.
          prompt: 'consent',
        },
      },
    }),
  ],
  callbacks: {
    async signIn({ user }) {
      // Upsert user in Supabase on every sign-in
      if (user.email) {
        try {
          const { upsertUser, ensureSettings } = await import('@/lib/db');
          const userId = await upsertUser(user.email, user.name, user.image);
          await ensureSettings(userId, user.name);
        } catch (err) {
          console.error('Failed to upsert user:', err);
        }
      }
      return true;
    },
    async jwt({ token, account }) {
      if (account) {
        token.accessToken = account.access_token;
        token.refreshToken = account.refresh_token;
        token.expiresAt = account.expires_at;
      }

      // Token still valid — return early (60s buffer to avoid edge expiry)
      if (token.expiresAt && Date.now() / 1000 < (token.expiresAt as number) - 60) {
        return token;
      }

      // No refresh token — can't refresh, mark error so UI can prompt re-login
      if (!token.refreshToken) {
        token.error = 'RefreshAccessTokenError';
        return token;
      }

      try {
        const res = await fetch('https://oauth2.googleapis.com/token', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          body: new URLSearchParams({
            client_id: process.env.GOOGLE_CLIENT_ID!,
            client_secret: process.env.GOOGLE_CLIENT_SECRET!,
            grant_type: 'refresh_token',
            refresh_token: token.refreshToken as string,
          }),
        });

        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Refresh failed');

        token.accessToken = data.access_token;
        token.expiresAt = Math.floor(Date.now() / 1000) + data.expires_in;
        // Google only returns a new refresh_token if rotation is enabled
        if (data.refresh_token) {
          token.refreshToken = data.refresh_token;
        }
        // Clear any previous error on successful refresh
        delete token.error;
      } catch {
        token.error = 'RefreshAccessTokenError';
      }

      return token;
    },
    async session({ session, token }) {
      session.accessToken = token.accessToken as string | undefined;
      session.error = token.error as string | undefined;
      return session;
    },
  },
};
