import type { Metadata } from 'next';
import { Inter } from 'next/font/google';
import './globals.css';
import Nav from '@/components/Nav';
import { TaskProvider } from '@/context/TaskContext';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'PGAME — Daily Operating System',
  description: 'Your ruthless chief of staff. Focus on what matters.',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-zinc-50 text-zinc-900 antialiased`}>
        <TaskProvider>
          <Nav />
          <main className="mx-auto max-w-3xl px-6 py-8">{children}</main>
        </TaskProvider>
      </body>
    </html>
  );
}
