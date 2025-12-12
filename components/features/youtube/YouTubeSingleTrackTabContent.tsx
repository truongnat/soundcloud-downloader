'use client';
import React, { useState, useEffect } from "react";
import { toast } from "sonner";
import { YouTubeItem } from "./types";
import { ActionInputBar } from "@/components/common";
import { useUrlState } from "@/lib/use-url-state";

interface YouTubeSingleTrackTabContentProps {
    setItems: (items: YouTubeItem[]) => void;
    setIsLoading: (isLoading: boolean) => void;
    setError: (error: string | null) => void;
    isLoading: boolean;
    dict?: { common?: { [key: string]: string } };
}

export function YouTubeSingleTrackTabContent({
    setItems,
    setIsLoading,
    setError,
    isLoading,
    dict,
}: YouTubeSingleTrackTabContentProps) {
    const t = (key: string) => {
        return dict?.common?.[key] || key;
    };
    const { setQueryParam, getQueryParam } = useUrlState();
    const [url, setUrl] = useState(() => getQueryParam("yt_video_url") || "");

    useEffect(() => {
        setQueryParam("yt_video_url", url);
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
                body: JSON.stringify({ url, type: "video" }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.error || "Failed to fetch info");
            }

            const data = await res.json();
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
            toast.success(t("results_found"));

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
            label="URL Video YouTube:"
            placeholder="https://www.youtube.com/watch?v=..."
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
