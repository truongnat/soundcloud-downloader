'use client';
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { YouTubeItem } from "./types";
import { ActionInputBar } from "@/components/common";
import { useUrlState } from "@/lib/use-url-state";

interface YouTubePlaylistTabContentProps {
    setItems: (items: YouTubeItem[]) => void;
    setIsLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    isLoading: boolean;
    dict?: { common?: { [key: string]: string } };
}

export function YouTubePlaylistTabContent({
    setItems,
    setIsLoading,
    setError,
    isLoading,
    dict,
}: YouTubePlaylistTabContentProps) {
    const t = (key: string) => {
        return dict?.common?.[key] || key;
    };
    const { setQueryParam, getQueryParam } = useUrlState();
    const [url, setUrl] = useState(() => getQueryParam("yt_playlist_url") || "");

    useEffect(() => {
        setQueryParam("yt_playlist_url", url);
    }, [url, setQueryParam]);

    const handleFetch = async () => {
        if (!url.trim()) {
            toast.error(t("enter_keyword"));
            return;
        }

        setIsLoading(true);
        setError(null);
        setItems([]);

        try {
            const res = await fetch("/api/youtube/info", {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ url, type: "playlist" }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to fetch playlist");
            }

            const data = await res.json();
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

            setItems(mappedItems);
            toast.success(`${t("results_found")}: ${mappedItems.length}`);


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
            label="URL Playlist YouTube:"
            placeholder="https://www.youtube.com/playlist?list=..."
            value={url}
            onChange={setUrl}
            onSubmit={handleFetch}
            disabled={isLoading}
            isLoading={isLoading}
            buttonText={t("search_btn")}
            loadingText={t("searching")}
        />
    );
}
