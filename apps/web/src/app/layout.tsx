import type { Metadata } from 'next';
import { Hanken_Grotesk, Newsreader } from 'next/font/google';
import { ThemeProvider } from 'next-themes';
import { Toaster } from 'sonner';
import './globals.css';
import { QueryProvider } from '@/lib/query-client';
import { SITE_URL } from '@/lib/site';
import { JsonLd, organizationSchema, webSiteSchema } from '@/components/app/schema';

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
  metadataBase: new URL(SITE_URL),
  title: {
    default: 'Go Lev — emagrecimento com acompanhamento médico',
    template: 'Go Lev | %s',
  },
  description: 'Go Lev — saúde e emagrecimento com acompanhamento humano.',
  icons: { icon: '/icon.svg' },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-snippet': -1,
      'max-video-preview': -1,
    },
  },
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
        <JsonLd data={[organizationSchema(), webSiteSchema()]} />
        <ThemeProvider attribute="class" forcedTheme="light">
          <QueryProvider>{children}</QueryProvider>
          <Toaster richColors position="top-right" />
        </ThemeProvider>
      </body>
    </html>
  );
}
