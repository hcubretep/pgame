'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useSession, signIn, signOut } from 'next-auth/react';

const links = [
  { href: '/', label: 'Dashboard' },
  { href: '/inbox', label: 'Inbox' },
  { href: '/settings', label: 'Settings' },
];

export default function Nav() {
  const pathname = usePathname();
  const { data: session, status } = useSession();

  return (
    <nav className="border-b border-zinc-200 bg-white">
      <div className="mx-auto max-w-3xl px-6 py-4 flex items-center justify-between">
        <span className="text-sm font-semibold tracking-tight text-zinc-900">PGAME</span>
        <div className="flex items-center gap-6">
          {links.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={`text-sm transition-colors ${
                pathname === link.href
                  ? 'text-zinc-900 font-medium'
                  : 'text-zinc-400 hover:text-zinc-600'
              }`}
            >
              {link.label}
            </Link>
          ))}
          <div className="border-l border-zinc-200 pl-6">
            {status === 'loading' ? (
              <span className="text-xs text-zinc-400">...</span>
            ) : session ? (
              <div className="flex items-center gap-3">
                <span className="text-xs text-zinc-500">{session.user?.name || session.user?.email}</span>
                <button
                  onClick={() => signOut()}
                  className="text-xs text-zinc-400 hover:text-zinc-600 transition-colors"
                >
                  Sign out
                </button>
              </div>
            ) : (
              <button
                onClick={() => signIn('google')}
                className="text-xs px-3 py-1.5 rounded bg-zinc-900 text-white hover:bg-zinc-700 transition-colors"
              >
                Sign in with Google
              </button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
