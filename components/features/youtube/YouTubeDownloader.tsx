'use client';
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import {
    Download,
    DownloadCloud,
    Youtube,
    PlayCircle,
    Clock,
    ListMusic,
    AlertCircle,
    RotateCcw,
    Loader2,
    Search
} from "lucide-react";
import pLimit from "p-limit";

const limit = pLimit(5);

interface YouTubeItem {
    id: string;
    title: string;
    thumbnail: string;
    duration?: number; // in seconds
    uploader?: string;
    url: string;
    kind: "video" | "playlist";
}

interface DownloadProgress {
    id: string;
    progress: number;
    status: "waiting" | "downloading" | "completed" | "error";
}

import { useUrlState } from "@/lib/use-url-state";

export function YouTubeDownloader() {
    const { setQueryParam, getQueryParam } = useUrlState();
    const [url, setUrl] = useState(() => getQueryParam("yt_url") || "");
    const [items, setItems] = useState<YouTubeItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [downloadProgress, setDownloadProgress] = useState<DownloadProgress[]>([]);
    const [isDownloadingAll, setIsDownloadingAll] = useState(false);

    // Sync URL state to query param
    useEffect(() => {
        setQueryParam("yt_url", url);
    }, [url, setQueryParam]);

    // Auto-fetch if URL is present on mount (and not already fetched)
    useEffect(() => {
        const initialUrl = getQueryParam("yt_url");
        if (initialUrl && items.length === 0 && !isLoading) {
            // We need to call handleFetchInfo, but it depends on state. 
            // Ideally we should extract the fetch logic or just trigger it.
            // Since handleFetchInfo uses the 'url' state which is initialized, we can just call it.
            // However, we need to be careful about dependency cycles.
            // Let's just set the URL and let the user click or trigger it? 
            // User asked "reload lại vẫn còn các trạng thái", implying results too?
            // Re-fetching automatically is a good start.
            handleFetchInfo();
        }
    }, []); // Run once on mount

    const handleFetchInfo = async () => {
        if (!url) {
            toast.error("Vui lòng nhập URL YouTube");
            return;
        }

        setIsLoading(true);
        setError(null);
        setItems([]);

        try {
            const isPlaylist = url.includes("list=");
            const type = isPlaylist ? "playlist" : "video";

            const res = await fetch("/api/youtube/info", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url, type }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to fetch info");
            }

            const data = await res.json();

            if (type === "playlist") {
                // Map playlist entries
                // Note: data structure depends on yt-dlp output
                const entries = data.entries || [];
                const mappedItems: YouTubeItem[] = entries.map((entry: any) => ({
                    id: entry.id,
                    title: entry.title,
                    thumbnail: entry.thumbnails?.[0]?.url || "", // simplified
                    duration: entry.duration,
                    uploader: entry.uploader,
                    url: entry.url || `https://www.youtube.com/watch?v=${entry.id}`,
                    kind: "video"
                }));
                setItems(mappedItems);
                toast.success(`Tìm thấy ${mappedItems.length} video trong playlist`);
            } else {
                // Single video
                const item: YouTubeItem = {
                    id: data.id,
                    title: data.title,
                    thumbnail: data.thumbnail,
                    duration: data.duration,
                    uploader: data.uploader,
                    url: data.webpage_url || url,
                    kind: "video"
                };
                setItems([item]);
                toast.success("Đã tìm thấy video");
            }

        } catch (err: any) {
            console.error(err);
            setError(err.message || "Lỗi khi lấy thông tin video");
            toast.error("Lỗi khi lấy thông tin video");
        } finally {
            setIsLoading(false);
        }
    };

    const handleDownload = async (item: YouTubeItem) => {
        setDownloadProgress(prev => [...prev.filter(p => p.id !== item.id), { id: item.id, progress: 0, status: "downloading" }]);

        try {
            // Trigger download via API
            // Since we are streaming, we can use a similar approach to SoundCloud downloader
            // or just open the window if it's a direct attachment.
            // But for progress tracking, we need to read the stream.

            const downloadUrl = `/api/youtube/download?url=${encodeURIComponent(item.url)}&format=mp3`;

            const response = await fetch(downloadUrl);
            if (!response.ok) throw new Error("Download failed");

            const reader = response.body?.getReader();
            const contentLength = response.headers.get("Content-Length");
            const totalLength = contentLength ? parseInt(contentLength, 10) : 0;

            if (!reader) throw new Error("No response body");

            let receivedLength = 0;
            const chunks = [];

            while (true) {
                const { done, value } = await reader.read();
                if (done) break;

                chunks.push(value);
                receivedLength += value.length;

                if (totalLength) {
                    const progress = Math.round((receivedLength / totalLength) * 100);
                    setDownloadProgress(prev => prev.map(p => p.id === item.id ? { ...p, progress } : p));
                }
            }

            const blob = new Blob(chunks);
            const blobUrl = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = blobUrl;
            a.download = `${item.title}.mp3`;
            document.body.appendChild(a);
            a.click();
            a.remove();
            window.URL.revokeObjectURL(blobUrl);

            setDownloadProgress(prev => prev.map(p => p.id === item.id ? { ...p, status: "completed", progress: 100 } : p));
            toast.success(`Đã tải xong "${item.title}"`);

        } catch (err) {
            console.error(err);
            toast.error(`Lỗi khi tải "${item.title}"`);
            setDownloadProgress(prev => prev.map(p => p.id === item.id ? { ...p, status: "error" } : p));
        }
    };

    const handleDownloadAll = async () => {
        setIsDownloadingAll(true);
        const videos = items.filter(i => {
            if (i.kind !== "video") return false;
            const progress = downloadProgress.find(p => p.id === i.id);
            return progress?.status !== 'completed';
        });

        if (videos.length === 0) {
            toast.info("Tất cả video đã được tải xuống.");
            setIsDownloadingAll(false);
            return;
        }

        toast.info(`Bắt đầu tải ${videos.length} video`);

        await Promise.all(videos.map(item => limit(() => handleDownload(item))));
        setIsDownloadingAll(false);
        toast.success("Đã tải xong tất cả");
    };

    return (
        <div className="space-y-6">
            <Card className="backdrop-blur-sm">
                <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                        <Youtube className="w-6 h-6 text-red-500" />
                        <span>YouTube MP3 Downloader</span>
                    </CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="flex gap-2">
                        <Input
                            placeholder="Dán link YouTube (Video hoặc Playlist)..."
                            value={url}
                            onChange={(e) => setUrl(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleFetchInfo()}
                        />
                        <Button onClick={handleFetchInfo} disabled={isLoading}>
                            {isLoading ? <Loader2 className="animate-spin" /> : <Search />}
                        </Button>
                    </div>
                </CardContent>
            </Card>

            {error && (
                <Card className="border-destructive/50">
                    <CardContent className="pt-6 text-center text-destructive">
                        <AlertCircle className="w-8 h-8 mx-auto mb-2" />
                        <p>{error}</p>
                    </CardContent>
                </Card>
            )}

            {items.length > 0 && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>Kết quả ({items.length})</CardTitle>
                        {items.length > 1 && (
                            <Button onClick={handleDownloadAll} disabled={isDownloadingAll} variant="outline">
                                <DownloadCloud className="w-4 h-4 mr-2" />
                                Tải tất cả
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {items.map((item) => {
                            const progress = downloadProgress.find(p => p.id === item.id);
                            return (
                                <div key={item.id} className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
                                    <div className="w-24 h-16 bg-muted rounded overflow-hidden flex-shrink-0">
                                        {item.thumbnail ? (
                                            <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Youtube className="w-8 h-8 text-muted-foreground" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <h4 className="font-medium truncate" title={item.title}>{item.title}</h4>
                                        <div className="flex items-center gap-2 text-sm text-muted-foreground">
                                            <span>{item.uploader}</span>
                                            {item.duration && (
                                                <>
                                                    <span>•</span>
                                                    <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDuration(item.duration)}</span>
                                                </>
                                            )}
                                        </div>
                                        {progress && (
                                            <div className="mt-2">
                                                <Progress value={progress.progress} className="h-1" />
                                                <p className="text-xs text-muted-foreground mt-1 text-right">{progress.progress}%</p>
                                            </div>
                                        )}
                                    </div>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        onClick={() => handleDownload(item)}
                                        disabled={progress?.status === "downloading"}
                                    >
                                        {progress?.status === "completed" ? (
                                            <DownloadCloud className="w-5 h-5 text-green-500" />
                                        ) : (
                                            <Download className="w-5 h-5" />
                                        )}
                                    </Button>
                                </div>
                            );
                        })}
                    </CardContent>
                </Card>
            )}
        </div>
    );
}

function formatDuration(seconds: number) {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${min}:${sec.toString().padStart(2, '0')}`;
}
