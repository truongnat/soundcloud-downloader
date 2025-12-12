import React from "react";
import { Tabs } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { AnimatedTabs } from "@/components/ui/animated-tabs";
import { Search, PlayCircle, ListMusic, Music } from "lucide-react";

interface SoundCloudTabsProps {
    activeTab: string;
    onTabChange: (value: string) => void;
    dict?: any;
    children: React.ReactNode;
}

export function SoundCloudTabs({
    activeTab,
    onTabChange,
    dict,
    children,
}: SoundCloudTabsProps) {
    return (
        <div>
            <Card className="backdrop-blur-sm">
                <CardHeader>
                    <div className="flex justify-center items-center">
                        <CardTitle className="flex items-center gap-2">
                            <div>
                                <Music className="w-6 h-6" />
                            </div>
                            <span>SoundCloud MP3 Downloader</span>
                        </CardTitle>
                    </div>
                </CardHeader>
                <CardContent>
                    <Tabs value={activeTab} onValueChange={onTabChange}>
                        <div>
                            <AnimatedTabs
                                activeTab={activeTab}
                                onTabChange={onTabChange}
                                tabs={[
                                    {
                                        id: "search",
                                        label: dict?.tabs.search || "Tìm kiếm",
                                        icon: <Search className="w-4 h-4" />,
                                    },
                                    {
                                        id: "single",
                                        label: dict?.tabs.single || "Một bài",
                                        icon: <PlayCircle className="w-4 h-4" />,
                                    },
                                    {
                                        id: "playlist",
                                        label: dict?.tabs.playlist || "Playlist",
                                        icon: <ListMusic className="w-4 h-4" />,
                                    },
                                ]}
                                layoutId="sc-tab-bubble"
                                className="w-full sm:w-auto"
                            />
                        </div>
                        {children}
                    </Tabs>
                </CardContent>
            </Card>
        </div>
    );
}
