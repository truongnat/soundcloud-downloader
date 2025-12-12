import { NextRequest, NextResponse } from "next/server";
import { initYtDlp, ffmpegArgs } from "@/lib/youtube-api";

export async function GET(req: NextRequest) {
    const url = req.nextUrl.searchParams.get("url");
    const format = req.nextUrl.searchParams.get("format") || "bestaudio";

    if (!url) {
        return NextResponse.json({ error: "URL is required" }, { status: 400 });
    }

    try {
        const yt = await initYtDlp();

        // Construct arguments
        // -o - writes to stdout
        let args = [url, "-o", "-"];

        args.push(...ffmpegArgs);

        if (format === "mp3") {
            args.push("-x", "--audio-format", "mp3");
        } else {
            args.push("-f", "bestaudio"); // Default to best audio
        }

        console.log("Starting yt-dlp with args:", args.join(" "));

        const stream = yt.execStream(args);

        // Access underlying process if available for logging
        const childProcess = (stream as any).ytDlpProcess;

        if (childProcess) {
            childProcess.stderr?.on('data', (data: any) => {
                console.error(`yt-dlp stderr: ${data.toString()}`);
            });

            childProcess.on('error', (err: any) => {
                console.error("Failed to start yt-dlp:", err);
            });

            childProcess.on('close', (code: any) => {
                if (code !== 0) {
                    console.error(`yt-dlp exited with code ${code}`);
                } else {
                    console.log("yt-dlp finished successfully");
                }
            });
        }


        const isPreview = req.nextUrl.searchParams.get("preview") === "true";

        // Return the stream
        const headers = new Headers();
        headers.set("Content-Disposition", `${isPreview ? 'inline' : 'attachment'}; filename="download.${format === 'mp3' ? 'mp3' : 'webm'}"`);
        headers.set("Content-Type", format === 'mp3' ? "audio/mpeg" : "audio/webm");

        // @ts-ignore - Next.js supports passing a Node.js stream or Web ReadableStream
        return new NextResponse(stream as any, { headers });

    } catch (error: any) {
        console.error("Download API Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to download" },
            { status: 500 }
        );
    }
}
