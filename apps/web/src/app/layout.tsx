import type { Metadata } from 'next';
import { Hanken_Grotesk, Newsreader } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import './globals.css';
import { QueryProvider } from '@/lib/query-client';

const hanken = Hanken_Grotesk({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-hanken',
});

const newsreader = Newsreader({
  subsets: ['latin'],
  style: ['normal', 'italic'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-newsreader',
});

export const metadata: Metadata = {
  title: {
    default: 'Go Lev',
    template: '%s | Go Lev',
  },
  description: 'Go Lev — saúde e emagrecimento com acompanhamento humano.',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="pt-BR"
      suppressHydrationWarning
      className={`${hanken.variable} ${newsreader.variable}`}
    >
      <body className="font-sans antialiased">
        <ThemeProvider attribute="class" forcedTheme="light">
          <QueryProvider>{children}</QueryProvider>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
