'use client';
import React, { useState, useRef, useEffect, useCallback } from "react";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";
import {
  Download,
  DownloadCloud,
  Music,
  PlayCircle,
  Clock,
  User,
  ListMusic,
  AlertCircle,
  RotateCcw,
  SearchX,
  Loader2, Search
} from "lucide-react";
import { SearchTabContent } from "./SearchTabContent";
import { SingleTrackTabContent } from "./SingleTrackTabContent";
import { PlaylistTabContent } from "./PlaylistTabContent";

import { getDownloadApiPath } from "@/lib/get-api-endpoint";
import { SearchResultCard } from "./SearchResultCard";
import { SearchResultItem, DownloadProgress } from "./types";





import { useClientId } from "@/contexts/ClientIdProvider";
import { useUrlState } from "@/lib/use-url-state";

import pLimit from "p-limit";
import { AdBanner } from "@/components/common/AdBanner";
import { AnimatedTabs } from "@/components/ui/animated-tabs";

const getConcurrencyLimit = () => {
  if (typeof navigator !== "undefined" && navigator.hardwareConcurrency) {
    return Math.max(1, navigator.hardwareConcurrency - 1);
  }
  return 5; // Default fallback
};

const limit = pLimit(getConcurrencyLimit());

export function SoundCloudDownloader() {
  const { setQueryParam, setOnlyQueryParams, getQueryParam } = useUrlState();
  const [activeTab, setActiveTab] = useState(() => getQueryParam("tab") || "search");
  const [tracks, setTracks] = useState<SearchResultItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [searchState, setSearchState] = useState({ hasMore: false, searchQuery: "" });
  const [page, setPage] = useState(1);

  const [downloadProgress, setDownloadProgress] = useState<DownloadProgress[]>(
    [],
  );
  const [isDownloadingAll, setIsDownloadingAll] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [lastSearchQuery, setLastSearchQuery] = useState(() => getQueryParam("q") || "");
  const resultsRef = useRef<HTMLDivElement>(null);
  const { clientId } = useClientId();

  const isAnyLoading = isLoading;

  useEffect(() => {
    setTracks([]);
    setError(null);
    setIsLoading(false);
    setDownloadProgress([]);
    setIsDownloadingAll(false);
    if (activeTab !== "search") {
      setLastSearchQuery("");
    }
  }, [activeTab]);

  // Auto scroll to results when new results are loaded

  const handleNewResults = useCallback(() => {
    if (resultsRef.current && !isLoading) {
      resultsRef.current.scrollIntoView({
        behavior: "smooth",
        block: "start",
      });
    }
  }, [isLoading]);

  // Only scroll on initial results, not on loadMore
  // Sync URL query with lastSearchQuery only on tab change or initial load
  useEffect(() => {
    if (activeTab === "search") {
      const query = getQueryParam("q");
      if (query) {
        setLastSearchQuery(query);
      }
    }
  }, [activeTab, getQueryParam]);

  useEffect(() => {
    if (tracks.length > 0 && !searchState.hasMore) {
      handleNewResults();
    }
  }, [tracks.length, searchState.hasMore, handleNewResults]);

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
      const finalUrl = item.url.includes("?")
        ? `${item.url}&client_id=${clientId}`
        : `${item.url}?client_id=${clientId}`;

      const response = await fetch(
        getDownloadApiPath(finalUrl, item.title, clientId)
      );

      // Ensure we received a successful response
      if (!response.ok) {
        // Try to parse JSON error message if any
        let errMsg = `HTTP ${response.status} ${response.statusText}`;
        try {
          const json = await response.json();
          if (json && json.error) errMsg = json.error;
        } catch (e) {
          // ignore parse errors
        }
        throw new Error(errMsg);
      }

      // Validate content-type to avoid saving JSON/html error responses as .mp3 files
      const contentType = response.headers.get("content-type") || "";
      if (!contentType.includes("audio") && !contentType.includes("application/octet-stream")) {
        // attempt to read text/json body for better error message
        let bodyText = "";
        try {
          bodyText = await response.text();
          const maybeJson = JSON.parse(bodyText || "null");
          if (maybeJson && maybeJson.error) throw new Error(maybeJson.error);
        } catch (e) {
          // not JSON — include short body snippet
          const snippet = bodyText.substring(0, 200);
          throw new Error(`Unexpected content-type: ${contentType}. Body: ${snippet}`);
        }
      }

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

      const blob = new Blob(chunks as any, { type: 'audio/mpeg' });
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement('a');
      // Assign a unique id to avoid collisions when multiple downloads occur
      const uniqueId = `download-${item.id}-${Date.now()}`;
      a.id = uniqueId;
      a.href = url;
      a.download = `${item.title}.mp3`;
      document.body.appendChild(a);
      a.click();
      // Clean up: remove the anchor by id in case some browsers keep references
      const el = document.getElementById(uniqueId);
      if (el && el.parentElement) el.parentElement.removeChild(el);
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

    const tracksToDownload = tracks.filter((item) => {
      if (item.kind !== "track") return false;
      const progress = downloadProgress.find(p => p.trackId === item.id);
      return progress?.status !== 'completed';
    });

    if (tracksToDownload.length === 0) {
      toast.info("Tất cả bài hát đã được tải xuống.");
      setIsDownloadingAll(false);
      return;
    }

    toast.info(`Bắt đầu tải ${tracksToDownload.length} bài hát`);

    const downloadPromises = tracksToDownload
      .map((item) => limit(() => handleDownloadSingle(item)));

    await Promise.all(downloadPromises);

    setIsDownloadingAll(false);
    toast.success("Đã tải xong tất cả bài hát!");
  }, [tracks, handleDownloadSingle, downloadProgress]);

  const getProgressForTrack = React.useCallback((trackId: string) => {
    return downloadProgress.find((p) => p.trackId === trackId);
  }, [downloadProgress]);



  return (
    <div
      className="w-full max-w-4xl mx-auto p-4 space-y-6"
    >
      <div>
        <Card className="backdrop-blur-sm">
          <CardHeader>
            <div className="flex justify-center items-center">
              <CardTitle className="flex items-center gap-2">
                <div>
                  <Music className="w-6 h-6" />
                </div>
                <span>
                  SoundCloud MP3 Downloader
                </span>
              </CardTitle>
            </div>
          </CardHeader>
          <CardContent>
            <Tabs
              value={getQueryParam("tab") || "search"}
              onValueChange={(value) => {
                if (!isAnyLoading) {
                  setActiveTab(value);
                  setTracks([]);
                  setError(null);
                  setIsLoading(false);
                  setDownloadProgress([]);
                  setIsDownloadingAll(false);
                  setLastSearchQuery("");
                  setSearchState({ hasMore: false, searchQuery: "" });
                  setPage(1);
                  setOnlyQueryParams({ tab: value });
                }
              }}
            >
              <div>
                <AnimatedTabs
                  activeTab={getQueryParam("tab") || "search"}
                  onTabChange={(value) => {
                    if (!isAnyLoading) {
                      setActiveTab(value);
                      setTracks([]);
                      setError(null);
                      setIsLoading(false);
                      setDownloadProgress([]);
                      setIsDownloadingAll(false);
                      setLastSearchQuery("");
                      setSearchState({ hasMore: false, searchQuery: "" });
                      setPage(1);
                      setOnlyQueryParams({ tab: value });
                    }
                  }}
                  tabs={[
                    {
                      id: "search",
                      label: "Tìm kiếm",
                      icon: <Search className="w-4 h-4" />,
                    },
                    {
                      id: "single",
                      label: "Một bài",
                      icon: <PlayCircle className="w-4 h-4" />,
                    },
                    {
                      id: "playlist",
                      label: "Playlist",
                      icon: <ListMusic className="w-4 h-4" />,
                    },
                  ]}
                  layoutId="sc-tab-bubble"
                  className="w-full sm:w-auto"
                />
              </div>

              <TabsContent value="search" className="mt-0">
                <SearchTabContent
                  setTracks={setTracks}
                  setIsLoading={setIsLoading}
                  setError={setError}
                  isLoading={isLoading}
                  isAnyLoading={isAnyLoading}
                  setLastSearchQuery={setLastSearchQuery}
                  tracks={tracks}
                  onStateChange={setSearchState}
                  page={page}
                  onLoadMore={() => setPage(p => p + 1)}
                  clientId={clientId}
                />
              </TabsContent>
              <TabsContent value="single" className="mt-0">
                <SingleTrackTabContent
                  setTracks={setTracks}
                  setIsLoading={setIsLoading}
                  setError={setError}
                  isLoading={isLoading}
                  isAnyLoading={isAnyLoading}
                  clientId={clientId}
                />
              </TabsContent>
              <TabsContent value="playlist" className="mt-0">
                <PlaylistTabContent
                  setTracks={setTracks}
                  setIsLoading={setIsLoading}
                  setError={setError}
                  isLoading={isLoading}
                  isAnyLoading={isAnyLoading}
                  clientId={clientId}
                />
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      <AdBanner />

      {isLoading && tracks.length === 0 && (
        <div>
          <Card>
            <CardContent className="py-10 flex items-center justify-center">
              <div className="flex items-center gap-3 text-muted-foreground">
                <Loader2 className="w-5 h-5 animate-spin" />
                <span>Đang tải...</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

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
                  <div className="space-x-2 flex items-center">
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
            <CardContent className="px-8 py-6 space-y-6">
              <div className="space-y-4">
                {tracks.map((item, index) => (
                  <div key={item.id} className="py-2">
                    <SearchResultCard
                      item={item}
                      index={index}
                      progress={getProgressForTrack(item.id)}
                      onDownload={handleDownloadSingle}
                      isAnyLoading={isAnyLoading}
                    />
                  </div>
                ))}
              </div>
              {activeTab === "search" && searchState.hasMore && (
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
                        Đang tải thêm...
                      </div>
                    ) : (
                      <div className="flex items-center justify-center">
                        <Search className="w-4 h-4 mr-2" />
                        Xem thêm 10 kết quả
                      </div>
                    )}
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );

}