'use client';
import React, { useState, useRef, useEffect } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { Button } from "./ui/button";
import { Progress } from "./ui/progress";
import { toast } from "sonner";
import {
  Download,
  DownloadCloud,
  Search,
  Music,
  PlayCircle,
  Clock,
  User,
  ListMusic,
  AlertCircle,
  RotateCcw,
  SearchX,
} from "lucide-react";
import { SoundCloudSearchResponse, SoundCloudSearchItem } from "@/types/soundcloud";
import { SearchTabContent } from "./SearchTabContent";
import { SingleTrackTabContent } from "./SingleTrackTabContent";
import { PlaylistTabContent } from "./PlaylistTabContent";
import { getClientIdApiPath, getDownloadApiPath } from "@/lib/get-api-endpoint";

export interface SearchResultItem {
  id: string;
  kind: "track" | "user" | "playlist";
  title: string;
  artist?: string;
  duration?: string;
  thumbnail: string;
  url: string;
}

interface DownloadProgress {
  trackId: string;
  progress: number;
  status: "waiting" | "downloading" | "completed" | "error";
}

import { useClientId } from "@/contexts/ClientIdProvider";

import { useTheme } from "next-themes";
import { Moon, Sun } from "lucide-react";

import pLimit from "p-limit";

const limit = pLimit(5);

export function SoundCloudDownloader() {
  const { setTheme, theme } = useTheme();
  const [activeTab, setActiveTab] = useState("search");
  const [tracks, setTracks] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress[]>(
    [],
  );
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSearchQuery, setLastSearchQuery] = useState("");
  const resultsRef = useRef<HTMLDivElement>(null);
  const { clientId } = useClientId();

  const isAnyLoading = isLoading;

  useEffect(() => {
    setTracks([]);
    setError(null);
    setLastSearchQuery("");
  }, [activeTab]);

  // Auto scroll to results when new results are loaded
  useEffect(() => {
    if (tracks.length > 0 && resultsRef.current) {
      resultsRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [tracks.length]);

  const handleDownloadSingle = React.useCallback(async (item: SearchResultItem) => {
    if (item.kind !== "track") {
      toast.error("Chỉ có thể tải xuống bài hát.");
      return;
    }

    if (!clientId) {
      toast.error("Client ID is not available yet.");
      return;
    }

    setDownloadProgress((prev) => [
      ...prev.filter((p) => p.trackId !== item.id),
      { trackId: item.id, progress: 0, status: "downloading" },
    ]);

    toast.info(`Bắt đầu tải "${item.title}"`);
    try {
      const finalUrl = item.url.includes('?') ? `${item.url}&client_id=${clientId}` : `${item.url}?client_id=${clientId}`;

      const response = await fetch(getDownloadApiPath(finalUrl, item.title, clientId));
      
      if (!response.body) {
        throw new Error("Không có nội dung để tải");
      }

      const reader = response.body.getReader();
      const contentLength = response.headers.get('Content-Length');
      const totalLength = contentLength ? parseInt(contentLength, 10) : 0;
      let receivedLength = 0;
      const chunks: Uint8Array[] = [];

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        chunks.push(value);
        receivedLength += value.length;

        if (totalLength) {
          const progress = Math.round((receivedLength / totalLength) * 100);
          setDownloadProgress((prev) =>
            prev.map((p) =>
              p.trackId === item.id ? { ...p, progress } : p
            )
          );
        }
      }

      const blob = new Blob(chunks, { type: 'audio/mpeg' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `${item.title}.mp3`;
      document.body.appendChild(a);
      a.click();
      a.remove();
      window.URL.revokeObjectURL(url);

      setDownloadProgress((prev) =>
        prev.map((p) =>
          p.trackId === item.id ? { ...p, progress: 100, status: "completed" } : p
        )
      );
      toast.success(`Đã tải xong "${item.title}"`);
    } catch (error) {
      console.error(error);
      toast.error(`Lỗi khi tải "${item.title}"`);
      setDownloadProgress((prev) =>
        prev.map((p) =>
          p.trackId === item.id ? { ...p, status: "error" } : p
        )
      );
    }
  }, [clientId]);

  const handleDownloadAll = React.useCallback(async () => {
    if (tracks.length === 0) {
      toast.error("Không có bài hát nào để tải");
      return;
    }

    setIsDownloadingAll(true);
    toast.info(`Bắt đầu tải ${tracks.length} bài hát`);

    const downloadPromises = tracks
      .filter((item) => item.kind === "track")
      .map((item) => limit(() => handleDownloadSingle(item)));

    await Promise.all(downloadPromises);

    setIsDownloadingAll(false);
    toast.success("Đã tải xong tất cả bài hát!");
  }, [tracks, handleDownloadSingle]);

  const getProgressForTrack = React.useCallback((trackId: string) => {
    return downloadProgress.find((p) => p.trackId === trackId);
  }, [downloadProgress]);

  const SearchResultCard = React.memo(({ item, index }: { item: SearchResultItem; index: number }) => {
    const progress = getProgressForTrack(item.id);
    const isDownloading = progress?.status === "downloading";
    const isCompleted = progress?.status === "completed";

    const isTrack = item.kind === "track";
    const isUser = item.kind === "user";
    const isPlaylist = item.kind === "playlist";

    const Icon = isTrack ? Music : isUser ? User : ListMusic;
    const title = item.title;
    const subtitle = isTrack ? item.artist : isUser ? "Người dùng" : "Playlist";
    const duration = isTrack ? item.duration : undefined;

    return (
      <div
        className="mb-4"
      >
        <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
          <CardContent className="p-4">
            <div className="flex flex-col sm:flex-row gap-4">
              <div
                className="w-full sm:w-20 h-20 bg-muted rounded-lg flex items-center justify-center overflow-hidden"
              >
                {item.thumbnail ? (
                  <img
                    src={item.thumbnail}
                    alt={item.title}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      const target = e.target as HTMLImageElement;
                      target.style.display = "none";
                      target.parentElement!.innerHTML =
                        '<Icon className="w-8 h-8 text-muted-foreground" />';
                    }}
                  />
                ) : (
                  <Icon className="w-8 h-8 text-muted-foreground" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <h3
                  className="truncate"
                >
                  {index + 1}. {title}
                </h3>
                <div
                  className="flex items-center gap-2 mt-1 text-muted-foreground"
                >
                  {isUser ? <User className="w-4 h-4" /> : isPlaylist ? <ListMusic className="w-4 h-4" /> : <User className="w-4 h-4" />}
                  <span className="truncate">{subtitle}</span>
                </div>
                {duration && (
                  <div
                    className="flex items-center gap-2 mt-1 text-muted-foreground"
                  >
                    <Clock className="w-4 h-4" />
                    <span>{duration}</span>
                  </div>
                )}

                {progress && isTrack && (
                  <div
                    className="mt-3"
                  >
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-sm text-muted-foreground">
                        {isCompleted ? "Hoàn thành" : "Đang tải..."}
                      </span>
                      <span
                        className="text-sm"
                      >
                        {progress.progress}%
                      </span>
                    </div>
                    <Progress value={progress.progress} className="h-2" />
                  </div>
                )}
              </div>

              <div className="flex flex-col gap-2">
                {isTrack && (
                  <div>
                    <Button
                      onClick={() => handleDownloadSingle(item)}
                      disabled={isDownloading || isAnyLoading}
                      size="sm"
                      className="whitespace-nowrap transition-all duration-200"
                    >
                      {isCompleted ? (
                        <>
                          <DownloadCloud className="w-4 h-4 mr-2" />
                          Đã tải
                        </>
                      ) : isDownloading ? (
                        <>
                          <Download className="w-4 h-4 mr-2 animate-pulse" />
                          Đang tải...
                        </>
                      ) : (
                        <>
                          <Download className="w-4 h-4 mr-2" />
                          Tải về
                        </>
                      )}
                    </Button>
                  </div>
                )}
                <div>
                  <Button
                    onClick={() => window.open(item.url, "_blank")}
                    variant="outline"
                    size="sm"
                    className="whitespace-nowrap transition-all duration-200"
                  >
                    <PlayCircle className="w-4 h-4 mr-2" />
                    Mở trên SC
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  });

  return (
    <div
      className="w-full max-w-4xl mx-auto p-4 space-y-6"
    >
      <div>
        <Card className="backdrop-blur-sm">
          <CardHeader>
            <div className="flex justify-between items-center">
              <CardTitle className="flex items-center gap-2">
                <div>
                  <Music className="w-6 h-6" />
                </div>
                <span>
                  SoundCloud MP3 Downloader
                </span>
              </CardTitle>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
              >
                <Sun className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
                <Moon className="absolute h-[1.2rem] w-[1.2rem] rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
                <span className="sr-only">Toggle theme</span>
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs
              value={activeTab}
              onValueChange={isAnyLoading ? undefined : setActiveTab}
            >
              <div>
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger
                    value="search"
                    className="flex items-center gap-2 transition-all duration-200"
                    disabled={isAnyLoading}
                  >
                    <div>
                      <Search className="w-4 h-4" />
                    </div>
                    <span className="hidden sm:inline">Tìm kiếm</span>
                    <span className="sm:hidden">Tìm</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="single"
                    className="flex items-center gap-2 transition-all duration-200"
                    disabled={isAnyLoading}
                  >
                    <div>
                      <PlayCircle className="w-4 h-4" />
                    </div>
                    <span className="hidden sm:inline">Một bài</span>
                    <span className="sm:hidden">Bài</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="playlist"
                    className="flex items-center gap-2 transition-all duration-200"
                    disabled={isAnyLoading}
                  >
                    <div>
                      <ListMusic className="w-4 h-4" />
                    </div>
                    <span className="hidden sm:inline">Playlist</span>
                    <span className="sm:hidden">List</span>
                  </TabsTrigger>
                </TabsList>
              </div>

              <TabsContent value="single" className="space-y-4">
                <SingleTrackTabContent
                  setTracks={setTracks}
                  setIsLoading={setIsLoading}
                  setError={setError}
                  isLoading={isLoading}
                  isAnyLoading={isAnyLoading}
                />
              </TabsContent>

              <TabsContent value="playlist" className="space-y-4">
                <PlaylistTabContent
                  setTracks={setTracks}
                  setIsLoading={setIsLoading}
                  setError={setError}
                  isLoading={isLoading}
                  isAnyLoading={isAnyLoading}
                />
              </TabsContent>

              <TabsContent value="search" className="space-y-4">
                <SearchTabContent
                  setTracks={setTracks}
                  setIsLoading={setIsLoading}
                  setError={setError}
                  isLoading={isLoading}
                  isAnyLoading={isAnyLoading}
                  setLastSearchQuery={setLastSearchQuery}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Error State */}
      {error && (
        <div>
          <Card className="border-destructive/50">
            <CardContent className="pt-6">
              <div className="flex flex-col items-center text-center space-y-4">
                <div>
                  <AlertCircle className="w-12 h-12 text-destructive" />
                </div>
                <div>
                  <h3 className="text-destructive mb-2">Đã xảy ra lỗi</h3>
                  <p className="text-muted-foreground">{error}</p>
                </div>
                <div>
                  <Button
                    onClick={() => {
                      setError(null);
                    }}
                    variant="outline"
                    disabled={isAnyLoading}
                  >
                    <RotateCcw className="w-4 h-4 mr-2" />
                    Thử lại
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Empty State */}
      {!error &&
        !isLoading &&
        tracks.length === 0 &&
        (activeTab === "search" ? lastSearchQuery : null) && (
          <div>
            <Card>
              <CardContent className="pt-6">
                <div className="flex flex-col items-center text-center space-y-4">
                  <div>
                    <SearchX className="w-12 h-12 text-muted-foreground" />
                  </div>
                  <div>
                    <h3 className="mb-2">Không tìm thấy kết quả</h3>
                    <p className="text-muted-foreground">
                      {activeTab === "search"
                        ? `Không tìm thấy bài hát nào cho "${lastSearchQuery}"`
                        : "Không tìm thấy bài hát hoặc playlist tại URL này"}
                    </p>
                  </div>
                  <div>
                    <Button
                      onClick={() => {
                        if (activeTab === "search") {
                          setLastSearchQuery("");
                        }
                      }}
                      variant="outline"
                      disabled={isAnyLoading}
                    >
                      <Search className="w-4 h-4 mr-2" />
                      Tìm kiếm khác
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

      {/* Results */}
      {tracks.length > 0 && (
        <div
          ref={resultsRef}
        >
          <Card className="overflow-hidden">
            <div>
              <CardHeader>
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                  <div>
                    <CardTitle>Kết quả</CardTitle>
                    <p className="text-muted-foreground">
                      {activeTab === "search"
                        ? `Tìm thấy ${tracks.length} kết quả cho "${lastSearchQuery}"`
                        : `Tìm thấy ${tracks.length} bài hát`}
                    </p>
                  </div>
                  {tracks.length > 1 && (
                    <div>
                      <Button
                        onClick={handleDownloadAll}
                        disabled={isDownloadingAll || isAnyLoading}
                        variant="outline"
                        className="transition-all duration-200"
                      >
                        {isDownloadingAll ? (
                          <div
                            className="flex items-center"
                          >
                            <div>
                              <DownloadCloud className="w-4 h-4 mr-2" />
                            </div>
                            Đang tải tất cả...
                          </div>
                        ) : (
                          <div
                            className="flex items-center"
                          >
                            <DownloadCloud className="w-4 h-4 mr-2" />
                            Tải tất cả
                          </div>
                        )}
                      </Button>
                    </div>
                  )}
                </div>
              </CardHeader>
            </div>
            <CardContent className="space-y-4">
              <div>
                {tracks.map((item, index) => (
                  <SearchResultCard key={item.id} item={item} index={index} />
                ))}
              </div>


            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );

}