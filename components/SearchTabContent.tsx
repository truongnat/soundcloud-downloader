'use client';
import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Button } from "./ui/button";
import { Input } from "./ui/input";
import { toast } from "sonner";
import { Search, Loader2 } from "lucide-react";
import { SoundCloudSearchResponse, SoundCloudSearchItem } from "@/types/soundcloud";
import { SearchResultItem } from "./SoundCloudDownloader"; // Assuming this is where SearchResultItem is defined
import { getClientIdApiPath, getSearchApiPath } from "@/lib/get-api-endpoint";

interface SearchTabContentProps {
  setTracks: (tracks: SearchResultItem[]) => void;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  isLoading: boolean;
  isAnyLoading: boolean;
  setLastSearchQuery: (query: string) => void;
}

export function SearchTabContent({
  setTracks,
  setIsLoading,
  setError,
  isLoading,
  isAnyLoading,
  setLastSearchQuery,
}: SearchTabContentProps) {
  const [searchQuery, setSearchQuery] = useState("");

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error("Vui lòng nhập từ khóa tìm kiếm");
      return;
    }

    setIsLoading(true);
    setError(null);
    setTracks([]);
    setLastSearchQuery(searchQuery);

    try {
      const clientIdRes = await fetch(getClientIdApiPath());
      const { clientId, error } = await clientIdRes.json();

      if (error) {
        setError("Lỗi khi lấy client ID. Vui lòng thử lại.");
        toast.error("Lỗi khi lấy client ID");
        return;
      }

      const response = await fetch(
        getSearchApiPath(searchQuery, clientId)
      );
      const data: SoundCloudSearchResponse = await response.json();

      if (data.collection.length === 0) {
        setTracks([]);
        toast.warning(`Không tìm thấy kết quả nào cho "${searchQuery}"`);
      } else {
        const newResults: SearchResultItem[] = data.collection.map((item) => {
          if (item.kind === "track") {
            return {
              id: String(item.id),
              kind: "track",
              title: item.title,
              artist:
                item.user?.username ||
                item.publisher_metadata?.artist ||
                "Unknown Artist",
              duration: new Date(item.duration).toISOString().substr(14, 5),
              thumbnail: item.artwork_url || "/default-thumbnail.jpg",
              url: item.permalink_url,
            };
          } else if (item.kind === "user") {
            return {
              id: String(item.id),
              kind: "user",
              title: item.username,
              thumbnail: item.avatar_url || "/default-avatar.jpg",
              url: item.permalink_url,
            };
          } else if (item.kind === "playlist") {
            return {
              id: String(item.id),
              kind: "playlist",
              title: item.title,
              thumbnail: item.artwork_url || "/default-playlist.jpg",
              url: item.permalink_url,
            };
          }
          return {
            id: String((item as SoundCloudSearchItem).id),
            kind: (item as SoundCloudSearchItem).kind as "track", // Fallback, though ideally all kinds are handled
            title: "Unknown Type",
            thumbnail: "/default-thumbnail.jpg",
            url: "",
          };
        });

        setTracks(newResults);
        toast.success(`Tìm thấy kết quả cho "${searchQuery}"`);
      }
    } catch (error) {
      setError("Đã xảy ra lỗi khi tìm kiếm. Vui lòng thử lại.");
      toast.error("Không thể thực hiện tìm kiếm");
    } finally {
      setIsLoading(false);
    }
  };

  // Handle Enter key press for search input
  const handleSearchKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !isAnyLoading && searchQuery.trim()) {
      handleSearch();
    }
  };

  return (
    <motion.div
      className="space-y-2"
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.5, delay: 0.3 }}
    >
      <label>Tìm kiếm bài hát:</label>
      <div className="flex gap-2">
        <motion.div
          className="flex-1"
          whileFocus={{ scale: 1.02 }}
          transition={{ duration: 0.2 }}
        >
          <Input
            placeholder="Nhập tên bài hát hoặc nghệ sĩ... (thử 'error' hoặc 'notfound' để test)"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            onKeyDown={handleSearchKeyDown}
            disabled={isAnyLoading}
            className="transition-all duration-200"
          />
        </motion.div>
        <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
          <Button onClick={handleSearch} disabled={isAnyLoading}>
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
                  Đang tìm...
                </motion.div>
              ) : (
                <motion.span
                  key="idle"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                >
                  Tìm kiếm
                </motion.span>
              )}
            </AnimatePresence>
          </Button>
        </motion.div>
      </div>
    </motion.div>
  );
}
