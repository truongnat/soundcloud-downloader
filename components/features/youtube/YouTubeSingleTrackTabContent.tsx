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
}

export function YouTubeSingleTrackTabContent({
    setItems,
    setIsLoading,
    setError,
    isLoading,
}: YouTubeSingleTrackTabContentProps) {
    const { setQueryParam, getQueryParam } = useUrlState();
    const [url, setUrl] = useState(() => getQueryParam("yt_video_url") || "");

    useEffect(() => {
        setQueryParam("yt_video_url", url);
    }, [url, setQueryParam]);

    const handleFetch = async () => {
        if (!url.trim()) {
            toast.error("Vui lòng nhập URL video YouTube");
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
            toast.success("Đã tìm thấy video");

        } catch (err: any) {
            console.error(err);
            setError(err.message || "Lỗi khi lấy thông tin video");
            toast.error("Lỗi khi lấy thông tin video");
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
            buttonText="Lấy video"
            loadingText="Đang tải..."
        />
    );
}
