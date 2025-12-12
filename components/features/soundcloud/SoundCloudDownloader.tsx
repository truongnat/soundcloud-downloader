'use client';
import React from "react";
import { TabsContent } from "@/components/ui/tabs";
import { SearchTabContent } from "./SearchTabContent";
import { SingleTrackTabContent } from "./SingleTrackTabContent";
import { PlaylistTabContent } from "./PlaylistTabContent";
import { AudioPlayer } from "./AudioPlayer";
import { AdBanner } from "@/components/common/AdBanner";
import { getDownloadApiPath } from "@/lib/get-api-endpoint";

import { useSoundCloudDownloader } from "./hooks/useSoundCloudDownloader";
import { SoundCloudTabs } from "./_components/SoundCloudTabs";
import { SoundCloudStatus } from "./_components/SoundCloudStatus";
import { SoundCloudResults } from "./_components/SoundCloudResults";

interface SoundCloudDownloaderProps {
  dict?: {
    tabs: {
      search: string;
      single: string;
      playlist: string;
    },
    common?: {
      [key: string]: string;
    }
  }
}

export function SoundCloudDownloader({ dict }: SoundCloudDownloaderProps) {
  const { state, actions } = useSoundCloudDownloader({ dict });

  return (
    <div className="w-full max-w-4xl mx-auto p-4 space-y-6">
      <SoundCloudTabs
        activeTab={state.activeTab}
        onTabChange={actions.setActiveTab}
        dict={dict}
      >
        <TabsContent value="search" className="mt-0">
          <SearchTabContent
            setTracks={actions.setTracks}
            setIsLoading={actions.setIsLoading}
            setError={actions.setError}
            isLoading={state.isLoading}
            isAnyLoading={state.isAnyLoading}
            setLastSearchQuery={actions.setLastSearchQuery}
            tracks={state.tracks}
            onStateChange={actions.setSearchState}
            page={state.page}
            onLoadMore={actions.handleLoadMore}
            clientId={state.clientId}
          />
        </TabsContent>
        <TabsContent value="single" className="mt-0">
          <SingleTrackTabContent
            setTracks={actions.setTracks}
            setIsLoading={actions.setIsLoading}
            setError={actions.setError}
            isLoading={state.isLoading}
            isAnyLoading={state.isAnyLoading}
            clientId={state.clientId}
          />
        </TabsContent>
        <TabsContent value="playlist" className="mt-0">
          <PlaylistTabContent
            setTracks={actions.setTracks}
            setIsLoading={actions.setIsLoading}
            setError={actions.setError}
            isLoading={state.isLoading}
            isAnyLoading={state.isAnyLoading}
            clientId={state.clientId}
          />
        </TabsContent>
      </SoundCloudTabs>

      <AdBanner />

      <SoundCloudStatus
        isLoading={state.isLoading}
        error={state.error}
        tracksLength={state.tracks.length}
        activeTab={state.activeTab}
        lastSearchQuery={state.lastSearchQuery}
        isAnyLoading={state.isAnyLoading}
        onRetry={actions.handleRetry}
        onClearSearch={actions.handleClearSearch}
        dict={dict}
      />

      <SoundCloudResults
        ref={state.resultsRef}
        tracks={state.tracks}
        activeTab={state.activeTab}
        isDownloadingAll={state.isDownloadingAll}
        isAnyLoading={state.isAnyLoading}
        isLoading={state.isLoading}
        searchState={state.searchState}
        onDownloadAll={actions.handleDownloadAll}
        onDownloadSingle={actions.handleDownloadSingle}
        onLoadMore={actions.handleLoadMore}
        getProgress={actions.getProgressForTrack}
        clientId={state.clientId}
        previewItem={state.previewItem}
        onPreview={actions.handlePreview}
        dict={dict}
      />

      {state.previewItem && state.clientId && (
        <AudioPlayer
          src={getDownloadApiPath(state.previewItem.url, state.previewItem.title, state.clientId) + "&preview=true"}
          title={state.previewItem.title}
          artist={state.previewItem.artist || 'SoundCloud'}
          thumbnail={state.previewItem.thumbnail}
          onClose={() => actions.setPreviewItem(null)}
        />
      )}
    </div>
  );
}