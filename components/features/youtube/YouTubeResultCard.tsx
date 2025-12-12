import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
    Download,
    DownloadCloud,
    Youtube,
    Clock,
    Copy,
    Check,
    Play,
    Pause,
    Loader2,
} from "lucide-react";
import { toast } from "sonner";
import { YouTubeItem, DownloadProgress } from "./types";

interface YouTubeResultCardProps {
    item: YouTubeItem;
    progress?: DownloadProgress;
    onDownload: (item: YouTubeItem) => void;
    isDownloadingAll?: boolean;
    activePreviewId?: string | null;
    onPreview?: (item: YouTubeItem) => void;
    dict?: { common?: { [key: string]: string } };
}

export const YouTubeResultCard = React.memo(({ item, progress, onDownload, isDownloadingAll, activePreviewId, onPreview, dict }: YouTubeResultCardProps) => {
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

    const formatDuration = (seconds?: number) => {
        if (!seconds) return "";
        const min = Math.floor(seconds / 60);
        const sec = seconds % 60;
        return `${min}:${sec.toString().padStart(2, '0')}`;
    };

    return (
        <div className="flex items-center gap-4 p-4 border rounded-lg hover:bg-muted/50 transition-colors">
            <div className="w-24 h-16 bg-muted rounded overflow-hidden flex-shrink-0 relative group">
                {item.thumbnail ? (
                    <img src={item.thumbnail} alt={item.title} className="w-full h-full object-cover" />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Youtube className="w-8 h-8 text-muted-foreground" />
                    </div>
                )}
                {/* Overlay Play Button on Thumbnail */}
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
            </div>
            <div className="flex-1 min-w-0">
                <h4 className="font-medium truncate" title={item.title}>{item.title}</h4>
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                    <span>{item.uploader}</span>
                    {item.duration && (
                        <>
                            <span>•</span>
                            <span className="flex items-center gap-1"><Clock className="w-3 h-3" /> {formatDuration(item.duration)}</span>
                        </>
                    )}
                </div>
                {progress && (
                    <div className="mt-2">
                        <Progress value={progress.progress} className="h-1" />
                        <p className="text-xs text-muted-foreground mt-1 text-right">{progress.progress}%</p>
                    </div>
                )}
            </div>
            <Button
                size="icon"
                variant="ghost"
                onClick={handlePreview}
                className="hidden sm:flex"
                title={isPlaying ? t("stop") : t("preview")}
            >
                {isPlaying ? (
                    <Pause className="w-5 h-5" />
                ) : (
                    <Play className="w-5 h-5" />
                )}
            </Button>
            <Button
                size="icon"
                variant="ghost"
                onClick={() => {
                    navigator.clipboard.writeText(item.url);
                    toast.success(t("success_copy"));
                    setIsCopied(true);
                    setTimeout(() => setIsCopied(false), 2000);
                }}
                title={t("copy_link")}
            >
                {isCopied ? <Check className="w-5 h-5 text-green-500" /> : <Copy className="w-5 h-5" />}
            </Button>
            <Button
                size="icon"
                variant="ghost"
                onClick={() => onDownload(item)}
                disabled={isDownloading || isDownloadingAll}
            >
                {isCompleted ? (
                    <DownloadCloud className="w-5 h-5 text-green-500" />
                ) : isDownloading ? (
                    <Download className="w-5 h-5 animate-pulse" />
                ) : (
                    <Download className="w-5 h-5" />
                )}
            </Button>
        </div>
    );
});

YouTubeResultCard.displayName = "YouTubeResultCard";
