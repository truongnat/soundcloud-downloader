import { NextRequest, NextResponse } from "next/server";
import YtdlpWrap from "yt-dlp-wrap";
import path from "path";
import fs from "fs";
import { spawn } from "child_process";
import ffmpegPath from "ffmpeg-static";

// Re-use the binary path logic or export it from lib
const binaryPath = path.join(process.cwd(), "bin", "yt-dlp.exe");

export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get("url");
    const format = req.nextUrl.searchParams.get("format") || "bestaudio";

    if (!url) {
        return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    try {
        // Ensure binary exists
        const binDir = path.dirname(binaryPath);
        if (!fs.existsSync(binDir)) {
            fs.mkdirSync(binDir, { recursive: true });
        }

        if (!fs.existsSync(binaryPath)) {
            console.log("Binary missing in download route, attempting to download...");
            await YtdlpWrap.downloadFromGithub(binaryPath);
        }

        // Construct arguments
        // -o - writes to stdout
        let args = [url, "-o", "-"];

        if (ffmpegPath) {
            args.push("--ffmpeg-location", ffmpegPath);
        }

        if (format === "mp3") {
            args.push("-x", "--audio-format", "mp3");
        } else {
            args.push("-f", "bestaudio"); // Default to best audio
        }

        console.log("Starting yt-dlp with args:", args.join(" "));

        const child = spawn(binaryPath, args);

        child.stderr.on('data', (data) => {
            console.error(`yt-dlp stderr: ${data.toString()}`);
        });

        child.on('error', (err) => {
            console.error("Failed to start yt-dlp:", err);
        });

        child.on('close', (code) => {
            if (code !== 0) {
                console.error(`yt-dlp exited with code ${code}`);
            } else {
                console.log("yt-dlp finished successfully");
            }
        });

        // Return the stream
        const headers = new Headers();
        headers.set("Content-Disposition", `attachment; filename="download.${format === 'mp3' ? 'mp3' : 'webm'}"`);
        headers.set("Content-Type", format === 'mp3' ? "audio/mpeg" : "audio/webm");

        // @ts-ignore - Next.js supports passing a Node.js stream or Web ReadableStream
        return new NextResponse(child.stdout as any, { headers });

    } catch (error: any) {
        console.error("Download API Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to download" },
            { status: 500 }
        );
    }
}
