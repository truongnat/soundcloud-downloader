import YtdlpWrap from "yt-dlp-wrap";
import path from "path";
import fs from "fs";
import ffmpegPath from "ffmpeg-static";

// Ensure we have a place to store the binary
const initYtDlp = async () => {
    return new YtdlpWrap();
};

const ffmpegArgs = ffmpegPath ? ["--ffmpeg-location", ffmpegPath] : [];

if (!ffmpegPath) {
    console.warn("ffmpeg-static binary not found. YouTube downloads might fail if merging is required.");
}

export interface YouTubeVideo {
    id: string;
    title: string;
    thumbnail: string;
    duration: number;
    uploader: string;
    url: string;
    formats: any[];
}

export interface YouTubePlaylist {
    id: string;
    title: string;
    thumbnail: string;
    uploader: string;
    url: string;
    entries: YouTubeVideo[];
}

export const getYouTubeInfo = async (url: string): Promise<YouTubeVideo | YouTubePlaylist | null> => {
    try {
        const yt = await initYtDlp();
        const metadata = await yt.execPromise([
            url,
            ...ffmpegArgs,
            "--dump-json",
            "--no-playlist", // Default to single video if ambiguous, but we might want to detect
            "--flat-playlist", // For playlists, don't get info for every video immediately if it's huge
        ]);

        // logic to parse metadata
        // Note: --dump-json output can be complex. 
        // If it's a playlist, it might output multiple JSON objects or one.

        // Let's try a safer approach for detection
        let json = JSON.parse(metadata);
        // Remove private and deleted videos if this is a playlist response
        if (json.entries && Array.isArray(json.entries)) {
            json.entries = json.entries.filter((v: any) => {
                const title = v.title?.toLowerCase() || '';
                return !(v.is_private || title.includes('private') || title.includes('deleted'));
            });
        }
        return json;
    } catch (error) {
        console.error("Error fetching YouTube info:", error);
        return null;
    }
};

// Better approach: Separate functions for Video and Playlist or smart detection
export const getYouTubeVideo = async (url: string): Promise<any> => {
    try {
        const yt = await initYtDlp();
        const metadata = await yt.execPromise([
            url,
            ...ffmpegArgs,
            "--dump-json",
            "--no-playlist"
        ]);
        return JSON.parse(metadata);
    } catch (error) {
        console.error("Error getting YouTube video:", error);
        throw error;
    }
}

export const getYouTubePlaylist = async (url: string, start?: number, end?: number): Promise<any> => {
    try {
        const yt = await initYtDlp();
        // flat-playlist is faster for just getting the list
        const args = [
            url,
            ...ffmpegArgs,
            "--dump-single-json",
            "--flat-playlist"
        ];

        if (start) args.push("--playlist-start", start.toString());
        if (end) args.push("--playlist-end", end.toString());

        const metadata = await yt.execPromise(args);
        const data = JSON.parse(metadata);
        // Filter out private and deleted videos from the playlist entries
        if (data.entries && Array.isArray(data.entries)) {
            data.entries = data.entries.filter((v: any) => {
                const title = v.title?.toLowerCase() || '';
                return !(v.is_private || title.includes('private') || title.includes('deleted'));
            });
        }
        return data;
    } catch (error) {
        console.error("Error getting YouTube playlist:", error);
        throw error;
    }
}

export const getYouTubeStream = async (url: string): Promise<any> => {
    // This might return a direct URL or we might need to pipe the stream
    // For web apps, getting a direct URL (googlevideo.com) is best if possible, 
    // but they often expire or are IP locked.
    // Alternatively, we stream data through our server.

    try {
        const yt = await initYtDlp();
        const metadata = await yt.execPromise([
            url,
            ...ffmpegArgs,
            "--dump-json"
        ]);
        const info = JSON.parse(metadata);

        // Find best audio/video format
        // For simplicity, let's look for best audio for now if it's a music downloader,
        // but user said "download with youtube", implying video too?
        // "support single + playlist of soundcloud and youtube"

        return info;
    } catch (error) {
        console.error("Error getting stream:", error);
        throw error;
    }
}

export const deleteVideoFile = async (filePath: string): Promise<void> => {
    try {
        if (fs.existsSync(filePath)) {
            await fs.promises.unlink(filePath);
            console.log(`Deleted video file: ${filePath}`);
        } else {
            console.warn(`File not found, cannot delete: ${filePath}`);
        }
    } catch (err) {
        console.error(`Error deleting video file ${filePath}:`, err);
        throw err;
    }
};
