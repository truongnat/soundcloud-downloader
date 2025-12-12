import { useState, useCallback, useEffect, useRef } from "react";
import { toast } from "sonner";
import pLimit from "p-limit";
import { useUrlState } from "@/lib/use-url-state";
import { useClientId } from "@/contexts/ClientIdProvider";
import { getDownloadApiPath } from "@/lib/get-api-endpoint";
import { SearchResultItem, DownloadProgress } from "../types";

const getConcurrencyLimit = () => {
    if (typeof navigator !== "undefined" && navigator.hardwareConcurrency) {
        return Math.max(1, navigator.hardwareConcurrency - 1);
    }
    return 5;
};

const limit = pLimit(getConcurrencyLimit());

interface UseSoundCloudDownloaderProps {
    dict?: {
        common?: {
            [key: string]: string;
        };
    };
}

export function useSoundCloudDownloader({ dict }: UseSoundCloudDownloaderProps) {
    const t = useCallback((key: string) => {
        return dict?.common?.[key] || key;
    }, [dict]);

    const { setQueryParam, setOnlyQueryParams, getQueryParam } = useUrlState();
    const { clientId } = useClientId();

    // State
    const [activeTab, setActiveTab] = useState(() => getQueryParam("tab") || "search");
    const [tracks, setTracks] = useState<SearchResultItem[]>([]);
    const [isLoading, setIsLoading] = useState(false);
    const [searchState, setSearchState] = useState({ hasMore: false, searchQuery: "" });
    const [page, setPage] = useState(1);
    const [downloadProgress, setDownloadProgress] = useState<DownloadProgress[]>([]);
    const [isDownloadingAll, setIsDownloadingAll] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [lastSearchQuery, setLastSearchQuery] = useState(() => getQueryParam("q") || "");
    const [previewItem, setPreviewItem] = useState<SearchResultItem | null>(null);

    const resultsRef = useRef<HTMLDivElement>(null);

    const isAnyLoading = isLoading;

    // Effects
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

    useEffect(() => {
        if (activeTab === "search") {
            const query = getQueryParam("q");
            if (query) {
                setLastSearchQuery(query);
            }
        }
    }, [activeTab, getQueryParam]);

    const handleNewResults = useCallback(() => {
        if (resultsRef.current && !isLoading) {
            resultsRef.current.scrollIntoView({
                behavior: "smooth",
                block: "start",
            });
        }
    }, [isLoading]);

    useEffect(() => {
        if (tracks.length > 0 && !searchState.hasMore) {
            handleNewResults();
        }
    }, [tracks.length, searchState.hasMore, handleNewResults]);

    // Handlers
    const handleTabChange = useCallback((value: string) => {
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
    }, [isAnyLoading, setOnlyQueryParams]);

    const handleDownloadSingle = useCallback(async (item: SearchResultItem) => {
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

        toast.info(t("start_download_count").replace("{count}", item.title));

        try {
            const finalUrl = item.url.includes("?")
                ? `${item.url}&client_id=${clientId}`
                : `${item.url}?client_id=${clientId}`;

            const response = await fetch(
                getDownloadApiPath(finalUrl, item.title, clientId)
            );

            if (!response.ok) {
                let errMsg = `HTTP ${response.status} ${response.statusText}`;
                try {
                    const json = await response.json();
                    if (json && json.error) errMsg = json.error;
                } catch (e) {
                    // ignore
                }
                throw new Error(errMsg);
            }

            const contentType = response.headers.get("content-type") || "";
            if (!contentType.includes("audio") && !contentType.includes("application/octet-stream")) {
                let bodyText = "";
                try {
                    bodyText = await response.text();
                    const maybeJson = JSON.parse(bodyText || "null");
                    if (maybeJson && maybeJson.error) throw new Error(maybeJson.error);
                } catch (e) {
                    const snippet = bodyText.substring(0, 200);
                    throw new Error(`Unexpected content-type: ${contentType}. Body: ${snippet}`);
                }
            }

            if (!response.body) {
                throw new Error(t("no_tracks_download"));
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
            const uniqueId = `download-${item.id}-${Date.now()}`;
            a.id = uniqueId;
            a.href = url;
            a.download = `${item.title}.mp3`;
            document.body.appendChild(a);
            a.click();

            const el = document.getElementById(uniqueId);
            if (el && el.parentElement) el.parentElement.removeChild(el);
            window.URL.revokeObjectURL(url);

            setDownloadProgress((prev) =>
                prev.map((p) =>
                    p.trackId === item.id ? { ...p, progress: 100, status: "completed" } : p
                )
            );
            toast.success(`${t("success_download")}: "${item.title}"`);
        } catch (error: any) {
            console.error(error);
            toast.error(`${t("error_download")}: "${item.title}"`);
            setDownloadProgress((prev) =>
                prev.map((p) =>
                    p.trackId === item.id ? { ...p, status: "error" } : p
                )
            );
        }
    }, [clientId, t]);

    const handleDownloadAll = useCallback(async () => {
        if (tracks.length === 0) {
            toast.error(t("no_tracks_download"));
            return;
        }

        setIsDownloadingAll(true);

        const tracksToDownload = tracks.filter((item) => {
            if (item.kind !== "track") return false;
            const progress = downloadProgress.find(p => p.trackId === item.id);
            return progress?.status !== 'completed';
        });

        if (tracksToDownload.length === 0) {
            toast.info(t("all_downloaded"));
            setIsDownloadingAll(false);
            return;
        }

        toast.info(t("start_download_count").replace("{count}", tracksToDownload.length.toString()));

        const downloadPromises = tracksToDownload
            .map((item) => limit(() => handleDownloadSingle(item)));

        await Promise.all(downloadPromises);

        setIsDownloadingAll(false);
        toast.success(t("all_downloaded"));
    }, [tracks, handleDownloadSingle, downloadProgress, t]);

    const getProgressForTrack = useCallback((trackId: string) => {
        return downloadProgress.find((p) => p.trackId === trackId);
    }, [downloadProgress]);

    const handlePreview = useCallback((item: SearchResultItem) => {
        if (!clientId) {
            toast.error(t("client_id_missing"));
            return;
        }
        if (previewItem?.id === item.id) {
            setPreviewItem(null);
        } else {
            setPreviewItem(item);
        }
    }, [previewItem, clientId, t]);

    const handleLoadMore = useCallback(() => {
        setPage(p => p + 1);
    }, []);

    const handleRetry = useCallback(() => {
        setError(null);
    }, []);

    const handleClearSearch = useCallback(() => {
        if (activeTab === "search") {
            setLastSearchQuery("");
        }
    }, [activeTab]);

    return {
        state: {
            activeTab,
            tracks,
            isLoading,
            searchState,
            page,
            downloadProgress,
            isDownloadingAll,
            error,
            lastSearchQuery,
            previewItem,
            isAnyLoading,
            clientId,
            resultsRef
        },
        actions: {
            setActiveTab: handleTabChange,
            setTracks,
            setIsLoading,
            setError,
            setSearchState,
            setPage,
            setLastSearchQuery,
            handleDownloadSingle,
            handleDownloadAll,
            handlePreview,
            setPreviewItem,
            getProgressForTrack,
            handleLoadMore,
            handleRetry,
            handleClearSearch
        }
    };
}
