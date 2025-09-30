import { NextRequest, NextResponse } from "next/server";
import { getStreamSongUrl } from "@/lib/soundcloud-api";

// Helper function to convert Node.js stream to Web Stream
export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const trackUrl = searchParams.get("url");
  const title = searchParams.get("title") || "unknown";
  const clientId = searchParams.get("client_id");

  if (!trackUrl || !clientId) {
    return NextResponse.json(
      { error: 'Query parameters "url" and "client_id" are required' },
      { status: 400 }
    );
  }

  try {
    const streamUrl = await getStreamSongUrl(trackUrl, clientId);
    if (!streamUrl) {
      console.error("Error retrieving stream URL");
      return NextResponse.json(
        { error: "Could not retrieve stream URL" },
        { status: 500 }
      );
    }
    const audioResponse = await fetch(streamUrl, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36",
        Accept: "audio/*,*/*;q=0.9",
        "Accept-Language": "en-US,en;q=0.5",
        Referer: "https://soundcloud.com/",
      },
    });

    if (!audioResponse.ok) {
      console.error(
        `[SoundCloud Download] Audio fetch failed: ${audioResponse.status} ${audioResponse.statusText}`
      );
      return NextResponse.json(
        {
          error: `Failed to fetch audio: ${audioResponse.statusText}`,
          code: "audio_fetch_failed",
        },
        { status: audioResponse.status }
      );
    }

    // Generate filename - use only track title as per specification
    const baseFilename = `${title}.mp3`;

    // Set up response headers for file download
    const headers = new Headers();
    headers.set("Content-Type", "audio/mpeg");
    headers.set(
      "Content-Disposition",
            `attachment; filename*=UTF-8''${encodeURIComponent(baseFilename)}`
    );
    headers.set("Cache-Control", "no-cache");

    // Copy content length if available
    const contentLength = audioResponse.headers.get("content-length");
    if (contentLength) {
      headers.set("Content-Length", contentLength);
    }
    const totalSize = contentLength ? parseInt(contentLength, 10) : 0;
    let downloadedSize = 0;

    const progressStream = new TransformStream({
      transform(chunk, controller) {
        downloadedSize += chunk.length;
        const progress = totalSize > 0 ? Math.round((downloadedSize / totalSize) * 100) : 0;
        
        // Instead of sending JSON, we are streaming the file directly
        // The progress can be handled on the client by tracking the received bytes
        controller.enqueue(chunk);
      },
    });

    // Stream the audio data directly to the client
    if (audioResponse.body) {
      const streamingBody = audioResponse.body.pipeThrough(progressStream);
      return new NextResponse(streamingBody, {
        status: 200,
        headers,
      });
    } else {
      return NextResponse.json(
        { error: "Could not retrieve audio stream" },
        { status: 500 }
      );
    }
  } catch (error) {
    console.error("Error in download route:", error);
    return NextResponse.json(
      { error: "Error downloading track from SoundCloud" },
      { status: 500 }
    );
  }
}
