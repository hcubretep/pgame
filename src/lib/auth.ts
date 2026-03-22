import { NextAuthOptions } from 'next-auth';
import GoogleProvider from 'next-auth/providers/google';

export const authOptions: NextAuthOptions = {
  providers: [
    GoogleProvider({
      clientId: process.env.GOOGLE_CLIENT_ID!,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET!,
      authorization: {
        params: {
          scope: 'openid email profile https://www.googleapis.com/auth/calendar.readonly',
          access_type: 'offline',
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
          const { upsertUser } = await import('@/lib/db');
          await upsertUser(user.email, user.name, user.image);
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

      if (token.expiresAt && Date.now() / 1000 < (token.expiresAt as number)) {
        return token;
      }

      if (token.refreshToken) {
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
          if (data.refresh_token) {
            token.refreshToken = data.refresh_token;
          }
        } catch {
          token.error = 'RefreshAccessTokenError';
        }
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
