'use client';
import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";
import { SearchResultItem } from "./SoundCloudDownloader"; // Assuming this is where SearchResultItem is defined
import { getClientIdApiPath, getPlaylistApiPath } from "@/lib/get-api-endpoint";

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
  const [url, setUrl] = useState("");

  const handleUrlSubmit = async () => {
    if (!url.trim()) {
      toast.error("Vui lòng nhập URL SoundCloud");
      return;
    }

    setIsLoading(true);
    setError(null);
    setTracks([]);

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

  // Handle Enter key press for URL inputs
  const handleUrlKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isAnyLoading && url.trim()) {
      handleUrlSubmit();
    }
  };

  return (
    <motion.div
      className="space-y-2"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <label>URL SoundCloud của playlist:</label>
      <div className="flex gap-2">
        <motion.div
          className="flex-1"
          whileFocus={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <Input
            placeholder="https://soundcloud.com/user/sets/playlist-name"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            onKeyDown={handleUrlKeyDown}
            disabled={isAnyLoading}
            className="transition-all duration-200"
          />
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button onClick={handleUrlSubmit} disabled={isAnyLoading}>
            <AnimatePresence mode="wait">
              {isLoading ? (
                <motion.div
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="flex items-center"
                >
                  <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                  Đang tải...
                </motion.div>
              ) : (
                <motion.span
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  Lấy playlist
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
