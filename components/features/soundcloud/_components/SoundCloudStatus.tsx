import React from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { AlertCircle, RotateCcw, SearchX, Search, Loader2 } from "lucide-react";

interface SoundCloudStatusProps {
    isLoading: boolean;
    error: string | null;
    tracksLength: number;
    activeTab: string;
    lastSearchQuery: string;
    isAnyLoading: boolean;
    onRetry: () => void;
    onClearSearch: () => void;
    dict?: any;
}

export function SoundCloudStatus({
    isLoading,
    error,
    tracksLength,
    activeTab,
    lastSearchQuery,
    isAnyLoading,
    onRetry,
    onClearSearch,
    dict,
}: SoundCloudStatusProps) {
    const t = (key: string) => dict?.common?.[key] || key;

    // Loading State
    if (isLoading && tracksLength === 0) {
        return (
            <div>
                <Card>
                    <CardContent className="py-10 flex items-center justify-center">
                        <div className="flex items-center gap-3 text-muted-foreground">
                            <Loader2 className="w-5 h-5 animate-spin" />
                            <span>{t("loading_more")}</span>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Error State
    if (error) {
        return (
            <div>
                <Card className="border-destructive/50">
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div>
                                <AlertCircle className="w-12 h-12 text-destructive" />
                            </div>
                            <div>
                                <h3 className="text-destructive mb-2">{t("error")}</h3>
                                <p className="text-muted-foreground">{error}</p>
                            </div>
                            <div>
                                <Button
                                    onClick={onRetry}
                                    variant="outline"
                                    disabled={isAnyLoading}
                                >
                                    <RotateCcw className="w-4 h-4 mr-2" />
                                    {t("retry")}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    // Empty/Search Not Found State
    if (!isLoading && tracksLength === 0 && (activeTab === "search" ? lastSearchQuery : null)) {
        return (
            <div>
                <Card>
                    <CardContent className="pt-6">
                        <div className="flex flex-col items-center text-center space-y-4">
                            <div>
                                <SearchX className="w-12 h-12 text-muted-foreground" />
                            </div>
                            <div>
                                <h3 className="mb-2">{t("no_results")}</h3>
                                <p className="text-muted-foreground">
                                    {activeTab === "search"
                                        ? `${t("no_results_for")} "${lastSearchQuery}"`
                                        : t("no_results")}
                                </p>
                            </div>
                            <div>
                                <Button
                                    onClick={onClearSearch}
                                    variant="outline"
                                    disabled={isAnyLoading}
                                >
                                    <Search className="w-4 h-4 mr-2" />
                                    {dict?.soundcloud?.tabs?.search || t("search_btn")}
                                </Button>
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return null;
}
