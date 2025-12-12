import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Search, Loader2, DownloadCloud } from "lucide-react";
import { SearchResultCard } from "../SearchResultCard";
import { SearchResultItem, DownloadProgress } from "../types";

interface SoundCloudResultsProps {
    tracks: SearchResultItem[];
    activeTab: string;
    isDownloadingAll: boolean;
    isAnyLoading: boolean;
    isLoading: boolean;
    searchState: { hasMore: boolean };
    onDownloadAll: () => void;
    onDownloadSingle: (item: SearchResultItem) => void;
    onLoadMore: () => void;
    getProgress: (id: string) => DownloadProgress | undefined;
    clientId: string | null;
    previewItem: SearchResultItem | null;
    onPreview: (item: SearchResultItem) => void;
    dict?: any;
}

export const SoundCloudResults = React.forwardRef<HTMLDivElement, SoundCloudResultsProps>(
    ({
        tracks,
        activeTab,
        isDownloadingAll,
        isAnyLoading,
        isLoading,
        searchState,
        onDownloadAll,
        onDownloadSingle,
        onLoadMore,
        getProgress,
        clientId,
        previewItem,
        onPreview,
        dict
    }, ref) => {
        const t = (key: string) => dict?.common?.[key] || key;

        if (tracks.length === 0) return null;

        return (
            <div ref={ref}>
                <Card className="overflow-hidden">
                    <div>
                        <CardHeader>
                            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
                                <div className="space-x-2 flex items-center">
                                    <CardTitle>Kết quả</CardTitle>
                                    <p className="text-muted-foreground">
                                        {activeTab === "search"
                                            ? `${t("results_found")}: ${tracks.length}`
                                            : `${t("results")}: ${tracks.length}`}
                                    </p>
                                </div>
                                {tracks.length > 1 && (
                                    <div>
                                        <Button
                                            onClick={onDownloadAll}
                                            disabled={isDownloadingAll || isAnyLoading}
                                            variant="outline"
                                            className="transition-all duration-200"
                                        >
                                            {isDownloadingAll ? (
                                                <div className="flex items-center">
                                                    <div>
                                                        <DownloadCloud className="w-4 h-4 mr-2" />
                                                    </div>
                                                    {t("downloading_all")}
                                                </div>
                                            ) : (
                                                <div className="flex items-center">
                                                    <DownloadCloud className="w-4 h-4 mr-2" />
                                                    {t("download_all")}
                                                </div>
                                            )}
                                        </Button>
                                    </div>
                                )}
                            </div>
                        </CardHeader>
                    </div>
                    <CardContent className="px-8 py-6 space-y-6">
                        <div className="space-y-4">
                            {tracks.map((item, index) => (
                                <div key={item.id} className="py-2">
                                    <SearchResultCard
                                        item={item}
                                        index={index}
                                        progress={getProgress(item.id)}
                                        onDownload={onDownloadSingle}
                                        isAnyLoading={isAnyLoading}
                                        clientId={clientId}
                                        activePreviewId={previewItem?.id}
                                        onPreview={onPreview}
                                        dict={dict}
                                    />
                                </div>
                            ))}
                        </div>
                        {activeTab === "search" && searchState.hasMore && (
                            <div className="flex justify-center pt-4 border-t">
                                <Button
                                    variant="outline"
                                    onClick={onLoadMore}
                                    className="min-w-[200px]"
                                    disabled={isLoading}
                                >
                                    {isLoading ? (
                                        <div className="flex items-center justify-center">
                                            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            {t("loading_more")}
                                        </div>
                                    ) : (
                                        <div className="flex items-center justify-center">
                                            <Search className="w-4 h-4 mr-2" />
                                            {t("load_more")}
                                        </div>
                                    )}
                                </Button>
                            </div>
                        )}
                    </CardContent>
                </Card>
            </div>
        );
    }
);

SoundCloudResults.displayName = "SoundCloudResults";
