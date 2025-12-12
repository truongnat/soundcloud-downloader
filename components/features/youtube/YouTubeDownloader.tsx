'use client';

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { toast } from "sonner";
import {
    DownloadCloud,
    Youtube,
    PlayCircle,
    ListMusic,
    AlertCircle,
    RotateCcw,
    Search,
    Loader2
} from "lucide-react";

import { YouTubeSearchTabContent } from "./YouTubeSearchTabContent";
import { YouTubeSingleTrackTabContent } from "./YouTubeSingleTrackTabContent";
import { YouTubePlaylistTabContent } from "./YouTubePlaylistTabContent";
import { YouTubeResultCard } from "./YouTubeResultCard";
import { YouTubeItem, DownloadProgress } from "./types";
import { AudioPlayer } from "../soundcloud/AudioPlayer";
import { useUrlState } from "@/lib/use-url-state";
import { AnimatedTabs } from "@/components/ui/animated-tabs";
import { AdBanner } from "@/components/common/AdBanner";

interface YouTubeDownloaderProps {
    dict?: {
        tabs: {
            search: string;
            single: string;
            playlist: string;
        },
        common?: {
            [key: string]: string;
        }
    }
}

export function YouTubeDownloader({ dict }: YouTubeDownloaderProps) {
    const t = (key: string) => {
        return dict?.common?.[key] || key;
    };
    const { setOnlyQueryParams, getQueryParam } = useUrlState();
    const [activeTab, setActiveTab] = useState(() => getQueryParam("yt_tab") || "search");
    const [items, setItems] = useState<YouTubeItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [downloadProgress, setDownloadProgress] = useState<DownloadProgress[]>([]);
    const [isDownloadingAll, setIsDownloadingAll] = useState(false);
    const [page, setPage] = useState(1);
    const [previewItem, setPreviewItem] = useState<YouTubeItem | null>(null);

    // Reset state on tab change
    useEffect(() => {
        setItems([]);
        setError(null);
        setIsLoading(false);
        setDownloadProgress([]);
        setIsDownloadingAll(false);
        setPage(1);
        setPreviewItem(null);
    }, [activeTab]);

    const handleDownload = async (item: YouTubeItem) => {
        setDownloadProgress(prev => [...prev.filter(p => p.id !== item.id), { id: item.id, progress: 0, status: "downloading" }]);

        try {
            const downloadUrl = `/api/youtube/download?url=${encodeURIComponent(item.url)}&format=mp3`;

            const response = await fetch(downloadUrl);
            if (!response.ok) throw new Error(t("error_download"));

            const reader = response.body?.getReader();
            const contentLength = response.headers.get("Content-Length");
            const totalLength = contentLength ? parseInt(contentLength, 10) : 0;

            if (!reader) throw new Error(t("error_download"));

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

        toast.info(`Bắt đầu tải ${videos.length} video (lần lượt)`);

        // Sequential download
        for (const item of videos) {
            // Check if we should stop (e.g. component unmounted or user cancelled - hard to check here without abort controller, but basic loop works)
            await handleDownload(item);
        }

        setIsDownloadingAll(false);
        toast.success("Đã tải xong tất cả");
    };

    const getProgress = (id: string) => downloadProgress.find(p => p.id === id);

    const handlePreview = (item: YouTubeItem) => {
        if (previewItem?.id === item.id) {
            setPreviewItem(null);
        } else {
            setPreviewItem(item);
        }
    };

    return (
        <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
            <Card className="backdrop-blur-sm">
                <CardHeader>
                    <div className="flex justify-center items-center">
                        <CardTitle className="flex items-center gap-2">
                            <Youtube className="w-6 h-6 text-red-500" />
                            <span>YouTube MP3 Downloader</span>
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs
                        value={activeTab}
                        onValueChange={(value) => {
                            if (!isLoading && !isDownloadingAll) {
                                setActiveTab(value);
                                setOnlyQueryParams({ yt_tab: value });
                            }
                        }}
                    >
                        <div>
                            <AnimatedTabs
                                activeTab={activeTab}
                                onTabChange={(value) => {
                                    if (!isLoading && !isDownloadingAll) {
                                        setActiveTab(value);
                                        setOnlyQueryParams({ yt_tab: value });
                                    }
                                }}
                                tabs={[
                                    {
                                        id: "search",
                                        label: dict?.tabs.search || "Tìm kiếm",
                                        icon: <Search className="w-4 h-4" />,
                                    },
                                    {
                                        id: "single",
                                        label: dict?.tabs.single || "Một bài",
                                        icon: <PlayCircle className="w-4 h-4" />,
                                    },
                                    {
                                        id: "playlist",
                                        label: dict?.tabs.playlist || "Playlist",
                                        icon: <ListMusic className="w-4 h-4" />,
                                    },
                                ]}
                                layoutId="yt-tab-bubble"
                                className="w-full sm:w-auto"
                            />
                        </div>

                        <TabsContent value="search" className="space-y-4">
                            <YouTubeSearchTabContent
                                setItems={setItems}
                                setIsLoading={setIsLoading}
                                setError={setError}
                                isLoading={isLoading}
                                page={page}
                                onLoadMore={() => setPage(p => p + 1)}
                                dict={dict}
                            />
                        </TabsContent>

                        <TabsContent value="single" className="space-y-4">
                            <YouTubeSingleTrackTabContent
                                setItems={setItems}
                                setIsLoading={setIsLoading}
                                setError={setError}
                                isLoading={isLoading}
                                dict={dict}
                            />
                        </TabsContent>

                        <TabsContent value="playlist" className="space-y-4">
                            <YouTubePlaylistTabContent
                                setItems={setItems}
                                setIsLoading={setIsLoading}
                                setError={setError}
                                isLoading={isLoading}
                            />
                        </TabsContent>
                    </Tabs>
                </CardContent>
            </Card>

            <AdBanner />

            {isLoading && items.length === 0 && (
                <Card>
                    <CardContent className="py-10 flex items-center justify-center">
                        <div className="flex items-center gap-3 text-muted-foreground">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>{t("downloading")}</span>
                        </div>
                    </CardContent>
                </Card>
            )}

            {error && (
                <Card className="border-destructive/50">
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <AlertCircle className="w-12 h-12 text-destructive" />
                            <div>
                                <h3 className="text-destructive mb-2">{t("error")}</h3>
                                <p className="text-muted-foreground">{error}</p>
                            </div>
                            <Button
                                onClick={() => setError(null)}
                                variant="outline"
                                disabled={isLoading}
                            >
                                <RotateCcw className="w-4 h-4 mr-2" />
                                {t("retry")}
                            </Button>
                        </div>
                    </CardContent>
                </Card>
            )}

            {items.length > 0 && (
                <Card>
                    <CardHeader className="flex flex-row items-center justify-between">
                        <CardTitle>{t("results")} ({items.length})</CardTitle>
                        {items.length > 1 && (
                            <Button onClick={handleDownloadAll} disabled={isDownloadingAll} variant="outline">
                                {isDownloadingAll ? (
                                    <>
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                        {t("downloading_all")}
                                    </>
                                ) : (
                                    <>
                                        <DownloadCloud className="w-4 h-4 mr-2" />
                                        {t("download_all")}
                                    </>
                                )}
                            </Button>
                        )}
                    </CardHeader>
                    <CardContent className="space-y-4">
                        {items.map((item) => (
                            <YouTubeResultCard
                                key={item.id}
                                item={item}
                                progress={getProgress(item.id)}
                                onDownload={handleDownload}
                                isDownloadingAll={isDownloadingAll}
                                activePreviewId={previewItem?.id}
                                onPreview={handlePreview}
                            />
                        ))}
                        {activeTab === "search" && (
                            <div className="flex justify-center pt-4 border-t">
                                <Button
                                    variant="outline"
                                    onClick={() => setPage(p => p + 1)}
                                    className="min-w-[200px]"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center">
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            {t("loading_more")}
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center">
                                            <Search className="w-4 h-4 mr-2" />
                                            {t("load_more")}
                                        </div>
                                    )}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}
            {previewItem && (
                <AudioPlayer
                    src={`/api/youtube/download?url=${encodeURIComponent(previewItem.url)}&format=mp3&preview=true`}
                    title={previewItem.title}
                    artist={previewItem.uploader || "YouTube"}
                    thumbnail={previewItem.thumbnail}
                    onClose={() => setPreviewItem(null)}
                />
            )}
        </div>
    );
}
