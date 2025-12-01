'use client';
import React, { useState } from "react";

import { toast } from "sonner";

import { SearchResultItem } from "./SoundCloudDownloader"; // Assuming this is where SearchResultItem is defined
import { getClientIdApiPath, getPlaylistApiPath } from "@/lib/get-api-endpoint";
import { useUrlState } from "@/lib/use-url-state";
import { ActionInputBar } from "@/components/common";

interface PlaylistTabContentProps {
  setTracks: (tracks: SearchResultItem[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  isLoading: boolean;
  isAnyLoading: boolean;
}

export function PlaylistTabContent({
  setTracks,
  setIsLoading,
  setError,
  isLoading,
  isAnyLoading,
}: PlaylistTabContentProps) {
  const { setQueryParam, getQueryParam } = useUrlState();
  const [url, setUrl] = useState(() => getQueryParam("sc_playlist_url") || "");

  // Sync URL state to query param
  React.useEffect(() => {
    setQueryParam("sc_playlist_url", url);
  }, [url, setQueryParam]);

  // Auto-load when there's a URL in the query params
  React.useEffect(() => {
    const urlFromQuery = getQueryParam("sc_playlist_url");
    if (urlFromQuery) {
      // If we have a URL, we might want to trigger the fetch automatically
      // But we need to be careful not to trigger it if it's just being typed
      // For now, let's just ensure the input is populated (handled by useState)
      // and maybe trigger if it's the initial load?
      // The original code had logic to call handleUrlSubmit.
      // Let's keep it but use the new param name.
      handleUrlSubmit(urlFromQuery);
    }
  }, []);

  const handleUrlSubmit = async (submittedUrl?: string) => {
    const urlToUse = submittedUrl || url;
    if (!urlToUse.trim()) {
      toast.error("Vui lòng nhập URL SoundCloud");
      return;
    }

    setIsLoading(true);
    // setQueryParam("url", urlToUse); // Removed old param setting
    setError(null);

    try {
      const clientIdRes = await fetch(getClientIdApiPath());
      const { clientId, error } = await clientIdRes.json();

      if (error) {
        setError("Lỗi khi lấy client ID. Vui lòng thử lại.");
        toast.error("Lỗi khi lấy client ID");
        return;
      }

      let finalUrl = url.includes("?")
        ? `${url}&client_id=${clientId}`
        : `${url}?client_id=${clientId}`;

      const response = await fetch(
        getPlaylistApiPath(finalUrl)
      );
      const data = await response.json();
      const newResults: SearchResultItem[] = data.tracks.map((track: any) => ({
        id: String(track.id),
        kind: "track",
        title: track.title,
        artist: track.user.username,
        duration: new Date(track.duration).toISOString().substr(14, 5),
        thumbnail: track.artwork_url,
        url: track.permalink_url,
      }));
      setTracks(newResults);
      toast.success(`Đã tìm thấy ${newResults.length} bài hát trong playlist`);
    } catch (error) {
      setError("Đã xảy ra lỗi khi tải dữ liệu. Vui lòng kiểm tra URL và thử lại.");
      toast.error("Không thể tải dữ liệu từ URL này");
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <ActionInputBar
      label="URL SoundCloud của playlist:"
      placeholder="https://soundcloud.com/user/sets/playlist-name"
      value={url}
      onChange={setUrl}
      onSubmit={() => handleUrlSubmit()}
      disabled={isAnyLoading}
      isLoading={isLoading}
      buttonText="Lấy playlist"
      loadingText="Đang tải..."
    />
  );
}
