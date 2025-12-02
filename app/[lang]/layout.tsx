import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import Script from "next/script";
import "../globals.css";

// Contexts & Components
import { ClientIdProvider } from "@/contexts/ClientIdProvider";
import { ThemeProvider } from "@/components/theme-provider";
import { HeaderControls, FooterControls } from "@/components/common/LayoutUI";
import { getDictionary } from "../get-dictionary";
import { getClientIdApiPath } from "@/lib/get-api-endpoint";

// --- Constants & Types ---
export type Locale = "en" | "vi" | "zh" | "ko" | "ja";
const LOCALES: Locale[] = ["en", "vi", "zh", "ko", "ja"];
const BASE_URL = "https://soundcloud-downloader-pro.vercel.app";

type Props = {
  params: Promise<{ lang: Locale }>;
};

// --- Fonts ---
const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

// --- Metadata ---
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { lang } = await params;
  const dict = await getDictionary(lang);

  return {
    title: dict.hero.title,
    description: dict.hero.description,
    keywords: "SoundCloud downloader, YouTube downloader, download music, MP3 downloader, playlist downloader",
    metadataBase: new URL(BASE_URL),
    openGraph: {
      title: dict.hero.title,
      description: dict.hero.description,
      url: `/${lang}`,
      type: "website",
      locale: lang,
      siteName: "Universal Music Downloader",
      images: [
        {
          url: "/og-image.png",
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
      images: ["/og-image.png"],
    },
    alternates: {
      canonical: `/${lang}`,
      languages: {
        en: "/en",
        vi: "/vi",
        zh: "/zh",
        ko: "/ko",
        ja: "/ja",
      },
    },
    icons: {
      icon: "/favicon.svg",
      apple: "/apple-touch-icon.png",
    },
    robots: {
      index: true,
      follow: true,
      googleBot: {
        index: true,
        follow: true,
        "max-video-preview": -1,
        "max-image-preview": "large",
        "max-snippet": -1,
      },
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "white" },
    { media: "(prefers-color-scheme: dark)", color: "black" },
  ],
};

export async function generateStaticParams() {
  return LOCALES.map((lang) => ({ lang }));
}

// --- Helper: Server-Side Fetch ---
async function fetchClientId(): Promise<string | null> {
  try {
    // Attempt to fetch Client ID on the server to prevent waterfall
    // Note: This requires the API to be available at build/runtime
    const res = await fetch(getClientIdApiPath(), { next: { revalidate: 3600 } });
    if (!res.ok) return null;
    const data = await res.json();
    return data.clientId || null;
  } catch (error) {
    console.warn("Failed to fetch Client ID on server:", error);
    return null;
  }
}

// --- Root Layout ---
export default async function RootLayout({
  children,
  params,
}: Readonly<{
  children: React.ReactNode;
  params: Promise<{ lang: Locale }>;
}>) {
  const { lang } = await params;

  // Parallel Data Fetching (Dictionary is already cached, ClientID is new)
  const initialClientId = await fetchClientId();

  return (
    <html lang={lang} suppressHydrationWarning>
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
        {/* Optimized Script Loading */}
        <Script
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-1650067341320347"
          crossOrigin="anonymous"
          strategy="afterInteractive"
        />

        <ClientIdProvider initialClientId={initialClientId}>
          <ThemeProvider
            attribute="class"
            defaultTheme="system"
            enableSystem
            disableTransitionOnChange
          >
            <HeaderControls />
            {children}
            <FooterControls />
          </ThemeProvider>
        </ClientIdProvider>
      </body>
    </html>
  );
}
