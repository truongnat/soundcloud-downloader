export interface YouTubeItem {
    id: string;
    title: string;
    thumbnail: string;
    duration?: number; // in seconds
    uploader?: string;
    url: string;
    kind: "video" | "playlist";
}

export interface DownloadProgress {
    id: string;
    progress: number;
    status: "waiting" | "downloading" | "completed" | "error";
}
