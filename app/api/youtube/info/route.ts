import { NextRequest, NextResponse } from "next/server";
import { getYouTubeVideo, getYouTubePlaylist } from "@/lib/youtube-api";
import { unstable_cache } from "next/cache";

const getCachedYouTubeVideo = unstable_cache(
    async (url: string) => {
        return await getYouTubeVideo(url);
    },
    ["youtube-video-info"],
    {
        revalidate: 3600, // 1 hour
        tags: ["youtube-video-info"],
    }
);

const getCachedYouTubePlaylist = unstable_cache(
    async (url: string, start?: number, end?: number) => {
        return await getYouTubePlaylist(url, start, end);
    },
    ["youtube-playlist-info"],
    {
        revalidate: 3600, // 1 hour
        tags: ["youtube-playlist-info"],
    }
);

export async function POST(req: NextRequest) {
    try {
        const body = await req.json();
        const { url, type, start, end } = body;

        if (!url) {
            return NextResponse.json({ error: "URL is required" }, { status: 400 });
        }

        let data;
        if (type === "playlist") {
            data = await getCachedYouTubePlaylist(url, start, end);
        } else {
            // Default to video, or auto-detect could be implemented in lib
            data = await getCachedYouTubeVideo(url);
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
