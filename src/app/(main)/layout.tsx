import type { Metadata } from 'next';
import Link from 'next/link';

import Providers from '@/components/Providers';
import { Toaster } from '@/components/ui/sonner';
import '@/styles/globals.css';
import { GoogleAnalytics } from '@next/third-parties/google';

export const metadata: Metadata = {
  title: 'Tanakayu Community',
  description: 'Website for beloved community member',
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <head>
        <title>Tanakayu Community Website</title>
        <link rel="icon" href="/favicon.ico" />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />

        <meta name="lang" content="id" />
        <meta name="theme-color" content="#1F3D2B" />
        <meta name="description" content="Tanakayu Community Website" />

        <meta property="og:title" content="Tanakayu Community Website" />
        <meta property="og:description" content="Tanakayu Community Website - From The Origin" />
        <meta property="og:type" content="website" />
        <meta property="og:url" content="https://tanakayu.vercel.app" />
        <meta property="og:image" content="https://tanakayu.vercel.app/header.jpg" />
        <meta property="og:site_name" content="Tanakayu Community" />

        <meta name="twitter:card" content="summary_large_image" />
        <meta name="twitter:title" content="Tanakayu Community Website" />
        <meta name="twitter:description" content="Tanakayu Community Website - From The Origin" />
        <meta name="twitter:image" content="https://tanakayu.vercel.app/header.jpg" />

        <meta name="robots" content="index, follow" />
        <meta name="googlebot" content="index, follow" />

        <meta
          name="keywords"
          content="tanakayu, bsd, community, website, samuel, arno, samuel arno, samuel arnosaputra, web developer, web developer indonesia, web engineer, freelance web"
        />
        <meta name="author" content="sammyarno" />
        <meta name="publisher" content="sammyarno" />

        <link rel="canonical" href="https://tanakayu.vercel.app" data-react-helmet="true" />

        <GoogleAnalytics gaId={process.env.NEXT_PUBLIC_GA_ID || ''} />
      </head>
      <body>
        <main className="mx-auto w-full max-w-lg p-2 antialiased">
          {/* banner */}
          <Link href="/">
            <section
              id="bannner"
              className="bg-tanakayu-dark text-tanakayu-accent rounded bg-[url('/leaf.jpg')] bg-cover bg-center p-5 text-center"
            >
              <p className="text-tanakayu-highlight font-serif text-5xl font-bold tracking-widest">TANAKAYU</p>
              <p className="font-sub-serif text-lg tracking-wider">From The Origin</p>
            </section>
          </Link>

          <Providers>{children}</Providers>

          {/* footer */}
          <footer className="bg-tanakayu-dark rounded p-2 text-center text-white shadow-sm">
            <p className="text-xs">Copyright © {new Date().getFullYear()} Tanakayu. All Rights Reserved.</p>
          </footer>
        </main>
        <Toaster richColors />
      </body>
    </html>
  );
}
