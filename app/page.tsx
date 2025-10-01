import { SoundCloudDownloader } from "@/components/SoundCloudDownloader";

export default function Home() {
  return (
    <div className="font-sans min-h-screen p-8 pb-20 gap-16 sm:p-20">
      <main className="flex flex-col items-center justify-center flex-1 text-center">
        <h1 className="text-4xl font-bold">SoundCloud Downloader</h1>
        <p className="mt-4 text-lg text-muted-foreground">
          Download your favorite SoundCloud tracks and playlists in high-quality MP3 format. Fast, free, and easy to use.
        </p>
        <SoundCloudDownloader />
      </main>
    </div>
  );
}
