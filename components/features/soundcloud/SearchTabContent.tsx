'use client';
import React, { useState, useEffect, useRef } from "react";

import { toast } from "sonner";

import { SoundCloudSearchResponse, SoundCloudSearchItem } from "@/types/soundcloud";
import { SearchResultItem } from "./types";
import { getClientIdApiPath, getSearchApiPath } from "@/lib/get-api-endpoint";
import { useUrlState } from "@/lib/use-url-state";
import { ActionInputBar } from "@/components/common";

type SetTracksFunction = {
  (tracks: SearchResultItem[]): void;
  (updater: (prev: SearchResultItem[]) => SearchResultItem[]): void;
};

interface SearchTabContentProps {
  setTracks: SetTracksFunction;
  setIsLoading: (isLoading: boolean) => void;
  setError: (error: string | null) => void;
  isLoading: boolean;
  isAnyLoading: boolean;
  setLastSearchQuery: (query: string) => void;
  tracks: SearchResultItem[];
  onStateChange?: (state: { hasMore: boolean; searchQuery: string }) => void;
  page?: number;
  onLoadMore?: () => void;
  clientId: string | null;
}

export function SearchTabContent({
  setTracks,
  setIsLoading,
  setError,
  isLoading,
  isAnyLoading,
  setLastSearchQuery,
  tracks,
  onStateChange,
  page: parentPage,
  clientId,
}: SearchTabContentProps & { tracks: SearchResultItem[] }) {
  const { setQueryParam, getQueryParam } = useUrlState();
  const [searchQuery, setSearchQuery] = useState(() => getQueryParam("q") || "");
  const [hasMore, setHasMore] = useState(true);
  const currentSearch = useRef(searchQuery);
  const currentPage = useRef(1);

  useEffect(() => {
    onStateChange?.({ hasMore, searchQuery });
  }, [hasMore, searchQuery, onStateChange]);

  // Handle loading more when parentPage changes
  useEffect(() => {
    const loadMore = async () => {
      if (parentPage && parentPage > currentPage.current && !isLoading) {
        currentPage.current = parentPage;
        await handleSearch(true);
      }
    };
    loadMore();
  }, [parentPage, isLoading]);

  // Auto-load when there's a query in URL
  useEffect(() => {
    const urlQuery = getQueryParam("q");
    if (urlQuery && !tracks.length) {
      setSearchQuery(urlQuery);
      // Only search if we have a client ID, otherwise wait for it?
      // Actually, handleSearch checks for clientId.
      // But if clientId is null initially, we might fail.
      // We should depend on clientId being available.
    }
  }, []);

  // Trigger search when clientId becomes available if we have a query and no tracks
  useEffect(() => {
    const urlQuery = getQueryParam("q");
    if (urlQuery && !tracks.length && clientId) {
      handleSearch();
    }
  }, [clientId]);

  const handleSearch = async (isLoadMore = false) => {
    if (!searchQuery.trim()) {
      toast.error("Vui lòng nhập từ khóa tìm kiếm");
      return;
    }

    if (!clientId) {
      // If clientId is not ready, we can't search.
      // Ideally the parent handles loading state of clientId.
      return;
    }

    setIsLoading(true);
    setError(null);

    if (!isLoadMore) {
      setQueryParam("q", searchQuery);
    }

    if (!isLoadMore) {
      currentPage.current = 1;
      setHasMore(true);
      currentSearch.current = searchQuery;
    }

    setLastSearchQuery(searchQuery);

    try {
      // Removed internal client ID fetch

      const offset = isLoadMore ? (currentPage.current - 1) * 10 : 0;
      const response = await fetch(
        getSearchApiPath(searchQuery, clientId, offset)
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

        if (isLoadMore) {
          setTracks((prev: SearchResultItem[]) => {
            const existingIds = new Set(prev.map(item => item.id));
            const uniqueNewResults = newResults.filter(item => !existingIds.has(item.id));
            return [...prev, ...uniqueNewResults];
          });
        } else {
          setTracks(newResults);
        }

        setHasMore(newResults.length === 10);
        if (!isLoadMore) {
          toast.success(`Tìm thấy kết quả cho "${searchQuery}"`);
        }
      }
    } catch (error) {
      setError("Đã xảy ra lỗi khi tìm kiếm. Vui lòng thử lại.");
      toast.error("Không thể thực hiện tìm kiếm");
    } finally {
      setIsLoading(false);
    }
  };



  return (
    <ActionInputBar
      label="Tìm kiếm bài hát:"
      placeholder="Nhập tên bài hát hoặc nghệ sĩ..."
      value={searchQuery}
      onChange={setSearchQuery}
      onSubmit={() => handleSearch()}
      disabled={isAnyLoading}
      isLoading={isLoading}
      buttonText="Tìm kiếm"
      loadingText="Đang tìm..."
    />
  );
}
