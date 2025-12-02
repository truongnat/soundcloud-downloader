"use client";

import * as React from "react";
import { usePathname, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Languages } from "lucide-react";

const languages = [
    { code: "vi", name: "Tiếng Việt", flag: "🇻🇳" },
    { code: "en", name: "English", flag: "🇺🇸" },
    { code: "zh", name: "中文", flag: "🇨🇳" },
    { code: "ko", name: "한국어", flag: "🇰🇷" },
    { code: "ja", name: "日本語", flag: "🇯🇵" },
];

export function LanguageSwitcher() {
    const pathname = usePathname();
    const router = useRouter();

    const currentLang = pathname.split("/")[1];

    const handleLanguageChange = (langCode: string) => {
        if (!pathname) return;
        const segments = pathname.split("/");
        segments[1] = langCode;
        const newPath = segments.join("/");
        router.push(newPath);
    };

    const currentLanguage = languages.find((l) => l.code === currentLang) || languages[0];

    return (
        <DropdownMenu>
            <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon" className="w-9 px-0">
                    <Languages className="h-[1.2rem] w-[1.2rem] rotate-0 scale-100 transition-all" />
                    <span className="sr-only">Toggle language</span>
                </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
                {languages.map((lang) => (
                    <DropdownMenuItem
                        key={lang.code}
                        onClick={() => handleLanguageChange(lang.code)}
                        className="flex items-center gap-2 cursor-pointer"
                    >
                        <span className="text-lg">{lang.flag}</span>
                        <span className={currentLang === lang.code ? "font-bold" : ""}>
                            {lang.name}
                        </span>
                    </DropdownMenuItem>
                ))}
            </DropdownMenuContent>
        </DropdownMenu>
    );
}
