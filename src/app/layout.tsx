import type { Metadata, Viewport } from 'next';
import { Inter, Playfair_Display } from 'next/font/google';

import Banner from '@/components/Banner';
import BottomNav from '@/components/BottomNav';
import Providers from '@/components/Providers';
import { Toaster } from '@/components/ui/sonner';
import '@/styles/globals.css';
import { GoogleAnalytics } from '@next/third-parties/google';
import { Analytics } from '@vercel/analytics/next';
import { SpeedInsights } from '@vercel/speed-insights/next';

export const metadata: Metadata = {
  title: 'Tanakayu Community Website',
  description: 'Tanakayu Community Website - From The Origin',
  keywords: 'tanakayu, bsd, community, website, samuel, arno, samuel arno, samuel arnosaputra, web developer, web developer indonesia, web engineer, freelance web',
  authors: [{ name: 'sammyarno' }],
  robots: 'index, follow',
  alternates: {
    canonical: 'https://tanakayu.vercel.app',
  },
  openGraph: {
    title: 'Tanakayu Community Website',
    description: 'Tanakayu Community Website - From The Origin',
    type: 'website',
    url: 'https://tanakayu.vercel.app',
    images: [{ url: 'https://tanakayu.vercel.app/header.jpg' }],
    siteName: 'Tanakayu Community',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Tanakayu Community Website',
    description: 'Tanakayu Community Website - From The Origin',
    images: ['https://tanakayu.vercel.app/header.jpg'],
  },
  other: {
    'theme-color': '#1F3D2B',
    lang: 'id',
    googlebot: 'index, follow',
  },
};

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
  display: 'swap',
});

const playfairDisplay = Playfair_Display({
  subsets: ['latin'],
  variable: '--font-serif',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${inter.variable} ${playfairDisplay.variable}`}>
      <body>
        <Providers>
          <main className="mx-auto w-full max-w-lg p-2 pb-32 antialiased">
            <Banner />
            {children}
            {/* Global Bottom Navigation (includes footer) */}
            <BottomNav />
          </main>
        </Providers>
        <Toaster richColors />
        <Analytics />
        <SpeedInsights />
        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ''} />
      </body>
    </html>
  );
}
