'use client';

import { motion } from "motion/react";
import { Music, Youtube } from "lucide-react";

// Components
import { SoundCloudDownloader } from "@/components/features/soundcloud/SoundCloudDownloader";
import { YouTubeDownloader } from "@/components/features/youtube/YouTubeDownloader";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { AnimatedTabs } from "@/components/ui/animated-tabs";
import { HeroSection } from "@/components/home/HeroSection";
import { FeaturesSection } from "@/components/home/FeaturesSection";
import { Footer } from "@/components/home/Footer";

// Hooks
import { useHomeTabs } from "@/hooks/use-home-tabs";

interface Dictionary {
    hero: {
        title: string;
        description: string;
    };
    tabs: {
        soundcloud: string;
        youtube: string;
    };
    features: {
        title: string;
        speed: {
            title: string;
            description: string;
        };
        playlist: {
            title: string;
            description: string;
        };
        safe: {
            title: string;
            description: string;
        };
    };
    footer: {
        text: string;
    };
    soundcloud: {
        tabs: {
            search: string;
            single: string;
            playlist: string;
        }
    };
    youtube: {
        tabs: {
            search: string;
            single: string;
            playlist: string;
        }
    };
    common: {
        [key: string]: string;
    };
}

export default function HomeClient({ dict }: { dict: Dictionary }) {
    const { activeTab, setActiveTab } = useHomeTabs("soundcloud");

    return (
        <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
            <HeroSection
                title={dict.hero.title}
                description={dict.hero.description}
            />

            {/* Main App Section */}
            <section className="max-w-4xl mx-auto px-4 pb-20">
                <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
                    <div className="flex justify-center">
                        <AnimatedTabs
                            activeTab={activeTab}
                            onTabChange={setActiveTab}
                            tabs={[
                                {
                                    id: "soundcloud",
                                    label: dict.tabs.soundcloud,
                                    icon: <Music className={`w-4 h-4 ${activeTab === "soundcloud" ? "text-orange-500" : ""}`} />,
                                },
                                {
                                    id: "youtube",
                                    label: dict.tabs.youtube,
                                    icon: <Youtube className={`w-4 h-4 ${activeTab === "youtube" ? "text-red-500" : ""}`} />,
                                },
                            ]}
                        />
                    </div>

                    <motion.div
                        key={activeTab}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        <TabsContent value="soundcloud" className="mt-0">
                            <SoundCloudDownloader dict={{ ...dict.soundcloud, common: dict.common }} />
                        </TabsContent>
                        <TabsContent value="youtube" className="mt-0">
                            <YouTubeDownloader dict={{ ...dict.youtube, common: dict.common }} />
                        </TabsContent>
                    </motion.div>
                </Tabs>
            </section>

            <FeaturesSection
                title={dict.features.title}
                features={dict.features}
            />

            <Footer text={dict.footer.text} />
        </div>
    );
}
