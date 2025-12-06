import { NextRequest, NextResponse } from "next/server";
import { getYouTubeVideo, getYouTubePlaylist } from "@/lib/youtube-api";

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { url, type, start, end } = body;

        if (!url) {
            return NextResponse.json({ error: "URL is required" }, { status: 400 });
        }

        let data;
        if (type === "playlist") {
            data = await getYouTubePlaylist(url, start, end);
        } else {
            // Default to video, or auto-detect could be implemented in lib
            data = await getYouTubeVideo(url);
        }

        return NextResponse.json(data);
    } catch (error: any) {
        console.error("API Error:", error);
        return NextResponse.json(
            { error: error.message || "Failed to fetch YouTube info" },
            { status: 500 }
        );
    }
}

export async function GET(req: NextRequest) {
    return NextResponse.json(
        { error: "Method GET not allowed. Use POST." },
        { status: 405 }
    );
}
