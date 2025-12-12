import React, { useState, useEffect, useRef } from "react";
import { toast } from "sonner";
import { YouTubeItem } from "./types";
import { ActionInputBar } from "@/components/common";
import { useUrlState } from "@/lib/use-url-state";

interface YouTubeSearchTabContentProps {
    setItems: (items: YouTubeItem[] | ((prev: YouTubeItem[]) => YouTubeItem[])) => void;
    setIsLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    isLoading: boolean;
    page?: number;
    onLoadMore?: () => void;
    dict?: { common?: { [key: string]: string } };
}

export function YouTubeSearchTabContent({
    setItems,
    setIsLoading,
    setError,
    isLoading,
    page = 1,
    dict,
}: YouTubeSearchTabContentProps) {
    const t = (key: string) => {
        return dict?.common?.[key] || key;
    };
    const { setQueryParam, getQueryParam } = useUrlState();
    const [query, setQuery] = useState(() => getQueryParam("yt_q") || "");
    const currentSearch = useRef(query);
    const currentPage = useRef(1);

    // Sync URL
    useEffect(() => {
        const urlQuery = getQueryParam("yt_q");
        if (urlQuery && urlQuery !== currentSearch.current) {
            setQuery(urlQuery);
            // If we want to auto-search on URL change, we can do it here
            // But usually we wait for user action or initial load
        }
    }, [getQueryParam]);

    // Auto-search on mount if query exists
    useEffect(() => {
        const urlQuery = getQueryParam("yt_q");
        if (urlQuery && page === 1) {
            // We can trigger search here, but we need to be careful about infinite loops
            // Let's just set the query and let the user click or trigger it if we want
            // Or better:
            if (query) handleSearch(false);
        }
    }, []);

    // Handle page change
    useEffect(() => {
        if (page > 1 && page > currentPage.current) {
            currentPage.current = page;
            handleSearch(true);
        } else if (page === 1) {
            currentPage.current = 1;
        }
    }, [page]);

    const handleSearch = async (isLoadMore = false) => {
        if (!query.trim()) {
            toast.error(t("enter_keyword"));
            return;
        }

        setIsLoading(true);
        setError(null);

        if (!isLoadMore) {
            setItems([]);
            setQueryParam("yt_q", query);
            currentSearch.current = query;
            currentPage.current = 1;
        }

        try {
            // Calculate range
            // page 1: 1-10
            // page 2: 11-20
            const limit = currentPage.current * 10;
            const start = (currentPage.current - 1) * 10 + 1;
            const end = limit;

            const searchUrl = `ytsearch${limit}:${query}`;

            const res = await fetch("/api/youtube/info", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    url: searchUrl,
                    type: "playlist",
                    start,
                    end
                }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to search");
            }

            const data = await res.json();

            // data should be a playlist-like object with entries
            const entries = data.entries || [];
            const mappedItems: YouTubeItem[] = entries.map((entry: any) => ({
                id: entry.id,
                title: entry.title,
                thumbnail: entry.thumbnails?.[0]?.url || "",
                duration: entry.duration,
                uploader: entry.uploader,
                url: entry.url || `https://www.youtube.com/watch?v=${entry.id}`,
                kind: "video"
            }));

            if (mappedItems.length === 0) {
                if (!isLoadMore) toast.warning(`${t("no_results_for")} "${query}"`);
            } else {
                if (isLoadMore) {
                    setItems((prev) => {
                        const existingIds = new Set(prev.map(item => item.id));
                        const uniqueNewItems = mappedItems.filter(item => !existingIds.has(item.id));
                        return [...prev, ...uniqueNewItems];
                    });
                } else {
                    setItems(mappedItems);
                    toast.success(`${t("results_found")}: ${mappedItems.length}`);
                }
            }

        } catch (err: any) {
            console.error(err);
            setError(err.message || t("error"));
            toast.error(t("error"));
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <ActionInputBar
            label={t("search_btn") + " YouTube:"}
            placeholder={t("search_placeholder")}
            value={query}
            onChange={setQuery}
            onSubmit={() => handleSearch(false)}
            disabled={isLoading}
            isLoading={isLoading}
            buttonText={t("search_btn")}
            loadingText={t("searching")}
        />
    );
}
