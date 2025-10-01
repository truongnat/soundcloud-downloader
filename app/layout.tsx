import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { ClientIdProvider } from "@/contexts/ClientIdProvider";
import { ThemeProvider } from "next-themes";
import { ScrollToTopButton } from "@/components/ScrollToTopButton";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "SoundCloud Downloader - Download Music and Playlists",
  description: "Download your favorite SoundCloud tracks and playlists in high-quality MP3 format. Fast, free, and easy to use.",
  keywords: "SoundCloud downloader, download SoundCloud music, SoundCloud to MP3, SoundCloud playlist downloader",
  openGraph: {
    title: "SoundCloud Downloader - Download Music and Playlists",
    description: "Download your favorite SoundCloud tracks and playlists in high-quality MP3 format. Fast, free, and easy to use.",
    url: "https://soundcloud-downloader.com",
    type: "website",
    images: [
      {
        url: "https://soundcloud-downloader.com/og-image.png",
        width: 1200,
        height: 630,
        alt: "SoundCloud Downloader",
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: "SoundCloud Downloader - Download Music and Playlists",
    description: "Download your favorite SoundCloud tracks and playlists in high-quality MP3 format. Fast, free, and easy to use.",
    images: ["https://soundcloud-downloader.com/og-image.png"],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
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
          <ThemeProvider attribute="class">
            {children}
            <ScrollToTopButton />
          </ThemeProvider>
        </ClientIdProvider>
      </body>
    </html>
  );
}
