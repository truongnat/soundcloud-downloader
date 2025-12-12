import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    Download,
    DownloadCloud,
    Music,
    PlayCircle,
    Clock,
    User,
    ListMusic,
    Copy,
    Check,
    Play,
    Pause,
} from "lucide-react";
import { toast } from "sonner";
import { SearchResultItem, DownloadProgress } from "./types";

interface SearchResultCardProps {
    item: SearchResultItem;
    index: number;
    progress?: DownloadProgress;
    onDownload: (item: SearchResultItem) => void;
    isAnyLoading: boolean;
    clientId: string | null;
    activePreviewId?: string | null;
    onPreview?: (item: SearchResultItem) => void;
    dict?: any;
}

export const SearchResultCard = React.memo(({ item, index, progress, onDownload, isAnyLoading, clientId, activePreviewId, onPreview, dict }: SearchResultCardProps) => {

    const t = (key: string) => {
        return dict?.common?.[key] || key;
    };
    const [isCopied, setIsCopied] = React.useState(false);
    const isDownloading = progress?.status === "downloading";
    const isCompleted = progress?.status === "completed";

    const isPlaying = activePreviewId === item.id;

    const handlePreview = () => {
        if (onPreview) {
            onPreview(item);
        }
    };

    const isTrack = item.kind === "track";
    const isUser = item.kind === "user";
    const isPlaylist = item.kind === "playlist";

    const Icon = isTrack ? Music : isUser ? User : ListMusic;
    const title = item.title;
    const subtitle = isTrack ? item.artist : isUser ? dict?.soundcloud?.tabs?.single || "Người dùng" : dict?.soundcloud?.tabs?.playlist || "Playlist";
    const duration = isTrack ? item.duration : undefined;

    return (
        <div>
            <Card className="overflow-hidden hover:shadow-lg transition-shadow duration-300">
                <CardContent className="p-6">
                    <div className="flex flex-col sm:flex-row gap-6">
                        <div className="w-full sm:w-24 h-24 bg-muted rounded-lg flex items-center justify-center overflow-hidden relative group">
                            {item.thumbnail ? (
                                <img
                                    src={item.thumbnail}
                                    alt={item.title}
                                    className="w-full h-full object-cover"
                                    onError={(e) => {
                                        const target = e.target as HTMLImageElement;
                                        target.style.display = "none";
                                        // Fallback icon logic handled by parent or just hide
                                        if (target.parentElement) {
                                            // We can't easily inject a React component here, so we'll just show the background
                                            // or we could try to show an SVG
                                            target.parentElement.innerHTML =
                                                '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="w-8 h-8 text-muted-foreground"><path d="M9 18V5l12-2v13"></path><circle cx="6" cy="18" r="3"></circle><circle cx="18" cy="16" r="3"></circle></svg>';
                                        }
                                    }}
                                />
                            ) : (
                                <Icon className="w-8 h-8 text-muted-foreground" />
                            )}

                            {/* Preview Overlay */}
                            {isTrack && (
                                <div className={`absolute inset-0 bg-black/40 flex items-center justify-center transition-opacity ${isPlaying ? 'opacity-100' : 'opacity-0 group-hover:opacity-100'}`}>
                                    <Button
                                        size="icon"
                                        variant="ghost"
                                        className="text-white hover:text-white hover:bg-transparent"
                                        onClick={handlePreview}
                                    >
                                        {isPlaying ? (
                                            <Pause className="w-8 h-8" />
                                        ) : (
                                            <Play className="w-8 h-8" />
                                        )}
                                    </Button>
                                </div>
                            )}
                        </div>

                        <div className="flex-1 min-w-0">
                            <h3 className="text-xl font-semibold truncate mb-4">
                                {index + 1}. {title}
                            </h3>
                            <div className="flex items-center gap-3 text-muted-foreground">
                                {isUser ? <User className="w-4 h-4" /> : isPlaylist ? <ListMusic className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                <span className="truncate">{subtitle}</span>
                            </div>
                            {duration && (
                                <div className="flex items-center gap-3 mt-2 text-muted-foreground">
                                    <Clock className="w-4 h-4" />
                                    <span>{duration}</span>
                                </div>
                            )}

                            {progress && isTrack && (
                                <div className="mt-3">
                                    <div className="flex items-center justify-between mb-1">
                                        <span className="text-sm text-muted-foreground">
                                            {isCompleted ? t("downloaded") : t("downloading")}
                                        </span>
                                        <span className="text-sm">{progress.progress}%</span>
                                    </div>
                                    <Progress value={progress.progress} className="h-2" />
                                </div>
                            )}
                        </div>

                        <div className="flex flex-col gap-3 justify-center">
                            {isTrack && (
                                <div>
                                    <Button
                                        onClick={() => onDownload(item)}
                                        disabled={isDownloading || isAnyLoading}
                                        className="whitespace-nowrap transition-all duration-200 w-full"
                                    >
                                        {isCompleted ? (
                                            <>
                                                <DownloadCloud className="w-4 h-4 mr-2" />
                                                {t("downloaded")}
                                            </>
                                        ) : isDownloading ? (
                                            <>
                                                <Download className="w-4 h-4 mr-2 animate-pulse" />
                                                {t("downloading")}
                                            </>
                                        ) : (
                                            <>
                                                <Download className="w-4 h-4 mr-2" />
                                                {t("download")}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            )}
                            <div>
                                <Button
                                    onClick={() => window.open(item.url, "_blank")}
                                    variant="outline"
                                    className="whitespace-nowrap transition-all duration-200 w-full"
                                >
                                    <PlayCircle className="w-4 h-4 mr-2" />
                                    {t("open_on")} SC
                                </Button>
                                <Button
                                    onClick={handlePreview}
                                    variant="outline"
                                    className="whitespace-nowrap transition-all duration-200 w-full mt-2"
                                >
                                    {isPlaying ? (
                                        <Pause className="w-4 h-4 mr-2" />
                                    ) : (
                                        <Play className="w-4 h-4 mr-2" />
                                    )}
                                    {isPlaying ? t("playing") : t("preview")}
                                </Button>
                            </div>
                            <div>
                                <Button
                                    onClick={() => {
                                        navigator.clipboard.writeText(item.url);
                                        toast.success(t("success_copy"));
                                        setIsCopied(true);
                                        setTimeout(() => setIsCopied(false), 2000);
                                    }}
                                    variant="ghost"
                                    className="whitespace-nowrap transition-all duration-200 w-full"
                                >
                                    {isCopied ? (
                                        <>
                                            <Check className="w-4 h-4 mr-2 text-green-500" />
                                            {t("copied")}
                                        </>
                                    ) : (
                                        <>
                                            <Copy className="w-4 h-4 mr-2" />
                                            {t("copy_link")}
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
});

SearchResultCard.displayName = "SearchResultCard";
