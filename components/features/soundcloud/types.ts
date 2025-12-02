export interface SearchResultItem {
    id: string;
    kind: "track" | "user" | "playlist";
    title: string;
    artist?: string;
    duration?: string;
    thumbnail: string;
    url: string;
}

export interface DownloadProgress {
    trackId: string;
    progress: number;
    status: "waiting" | "downloading" | "completed" | "error";
}
