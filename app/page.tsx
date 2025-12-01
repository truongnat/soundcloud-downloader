'use client';

import { useState } from "react";
import { SoundCloudDownloader } from "@/components/features/soundcloud/SoundCloudDownloader";
import { YouTubeDownloader } from "@/components/features/youtube/YouTubeDownloader";
import { Tabs, TabsContent } from "@/components/ui/tabs";
import { AnimatedTabs } from "@/components/ui/animated-tabs";
import { motion } from "motion/react";
import { Music, Youtube, Zap, ShieldCheck, Layers } from "lucide-react";

export default function Home() {
  const [activeTab, setActiveTab] = useState("soundcloud");

  return (
    <div className="min-h-screen bg-background text-foreground selection:bg-primary selection:text-primary-foreground">
      {/* Hero Section */}
      <section className="relative py-20 px-4 overflow-hidden">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-primary/20 via-background to-background" />

        <div className="max-w-5xl mx-auto text-center space-y-6">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5 }}
          >
            <h1 className="text-4xl md:text-6xl font-bold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-primary to-purple-600 dark:to-purple-400">
              Universal Music Downloader
            </h1>
          </motion.div>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, delay: 0.1 }}
            className="text-xl text-muted-foreground max-w-2xl mx-auto"
          >
            Tải nhạc chất lượng cao từ SoundCloud và YouTube. Hỗ trợ Playlist, tốc độ cực nhanh, hoàn toàn miễn phí.
          </motion.p>
        </div>
      </section>

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
                  label: "SoundCloud",
                  icon: <Music className={`w-4 h-4 ${activeTab === "soundcloud" ? "text-orange-500" : ""}`} />,
                },
                {
                  id: "youtube",
                  label: "YouTube",
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
              <SoundCloudDownloader />
            </TabsContent>
            <TabsContent value="youtube" className="mt-0">
              <YouTubeDownloader />
            </TabsContent>
          </motion.div>
        </Tabs>
      </section>

      {/* Features Section */}
      <section className="py-20 bg-muted/30 border-t">
        <div className="max-w-6xl mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">Tại sao chọn chúng tôi?</h2>
          <div className="grid md:grid-cols-3 gap-8">
            <FeatureCard
              icon={<Zap className="w-10 h-10 text-yellow-500" />}
              title="Tốc độ cực nhanh"
              description="Sử dụng công nghệ tải đa luồng giúp tối ưu hóa tốc độ tải xuống của bạn."
            />
            <FeatureCard
              icon={<Layers className="w-10 h-10 text-blue-500" />}
              title="Hỗ trợ Playlist"
              description="Tải xuống toàn bộ Playlist từ SoundCloud và YouTube chỉ với một cú click."
            />
            <FeatureCard
              icon={<ShieldCheck className="w-10 h-10 text-green-500" />}
              title="An toàn & Miễn phí"
              description="Không chứa quảng cáo độc hại, hoàn toàn miễn phí và tôn trọng quyền riêng tư."
            />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 text-center text-muted-foreground border-t">
        <p>© 2024 Universal Music Downloader. Built for music lovers.</p>
      </footer>
    </div>
  );
}

function FeatureCard({ icon, title, description }: { icon: React.ReactNode, title: string, description: string }) {
  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="p-6 bg-card rounded-xl border shadow-sm hover:shadow-md transition-all"
    >
      <div className="mb-4 bg-background w-16 h-16 rounded-full flex items-center justify-center shadow-sm">
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-2">{title}</h3>
      <p className="text-muted-foreground">{description}</p>
    </motion.div>
  );
}
