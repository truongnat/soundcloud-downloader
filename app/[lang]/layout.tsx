import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "../globals.css";
import { ClientIdProvider } from "@/contexts/ClientIdProvider";
import { ThemeProvider } from "@/components/theme-provider";
import { ScrollToTopButton, ModeToggle, LanguageSwitcher } from "@/components/common";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

import { getDictionary } from "../get-dictionary";

export async function generateMetadata({ params }: { params: Promise<{ lang: "en" | "vi" | "zh" | "ko" | "ja" }> }): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return {
    title: dict.hero.title,
    description: dict.hero.description,
    keywords: "SoundCloud downloader, YouTube downloader, download music, MP3 downloader, playlist downloader",
    openGraph: {
      title: dict.hero.title,
      description: dict.hero.description,
      url: `https://soundcloud-downloader-pro.vercel.app/${lang}`,
      type: "website",
      locale: lang,
      siteName: "Universal Music Downloader",
      images: [
        {
          url: "https://soundcloud-downloader-pro.vercel.app/og-image.png",
          width: 1200,
          height: 630,
          alt: dict.hero.title,
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: dict.hero.title,
      description: dict.hero.description,
      images: ["https://soundcloud-downloader-pro.vercel.app/og-image.png"],
    },
    alternates: {
      canonical: `https://soundcloud-downloader-pro.vercel.app/${lang}`,
      languages: {
        'en': 'https://soundcloud-downloader-pro.vercel.app/en',
        'vi': 'https://soundcloud-downloader-pro.vercel.app/vi',
        'zh': 'https://soundcloud-downloader-pro.vercel.app/zh',
        'ko': 'https://soundcloud-downloader-pro.vercel.app/ko',
        'ja': 'https://soundcloud-downloader-pro.vercel.app/ja',
      },
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        'max-video-preview': -1,
        'max-image-preview': 'large',
        'max-snippet': -1,
      },
    },
  };
}

export async function generateStaticParams() {
  return [{ lang: 'en' }, { lang: 'vi' }, { lang: 'zh' }, { lang: 'ko' }, { lang: 'ja' }]
}

export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: string }>;
}>) {
  const { lang } = await params;
  return (
    <html lang={lang} suppressHydrationWarning>
      <head>
        <link rel="icon" href="/favicon.svg" type="image/svg+xml" />
        <link rel="apple-touch-icon" href="/apple-touch-icon.png" />
        <script async src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1650067341320347"
          crossOrigin="anonymous"></script>
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <ClientIdProvider>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
              <LanguageSwitcher />
              <ModeToggle />
            </div>
            {children}
            <ScrollToTopButton />
          </ThemeProvider>
        </ClientIdProvider>
      </body>
    </html>
  );
}
