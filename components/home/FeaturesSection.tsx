'use client';

import { motion } from "motion/react";
import { Zap, ShieldCheck, Layers } from "lucide-react";

interface FeaturesSectionProps {
    title: string;
    features: {
        speed: { title: string; description: string };
        playlist: { title: string; description: string };
        safe: { title: string; description: string };
    };
}

export function FeaturesSection({ title, features }: FeaturesSectionProps) {
    return (
        <section className="py-20 bg-muted/30 border-t">
            <div className="max-w-6xl mx-auto px-4">
                <h2 className="text-3xl font-bold text-center mb-12">{title}</h2>
                <div className="grid md:grid-cols-3 gap-8">
                    <FeatureCard
                        icon={<Zap className="w-10 h-10 text-yellow-500" />}
                        title={features.speed.title}
                        description={features.speed.description}
                    />
                    <FeatureCard
                        icon={<Layers className="w-10 h-10 text-blue-500" />}
                        title={features.playlist.title}
                        description={features.playlist.description}
                    />
                    <FeatureCard
                        icon={<ShieldCheck className="w-10 h-10 text-green-500" />}
                        title={features.safe.title}
                        description={features.safe.description}
                    />
                </div>
            </div>
        </section>
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
