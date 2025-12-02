'use client';

import dynamic from 'next/dynamic';
import { LanguageSwitcher } from './LanguageSwitcher';

const ModeToggle = dynamic(() => import('./ModeToggle').then((mod) => mod.ModeToggle), {
    ssr: false,
});

const ScrollToTopButton = dynamic(
    () => import('./ScrollToTopButton').then((mod) => mod.ScrollToTopButton),
    { ssr: false }
);

export function HeaderControls() {
    return (
        <div className="fixed top-4 right-4 z-50 flex items-center gap-2">
            <LanguageSwitcher />
            <ModeToggle />
        </div>
    );
}

export function FooterControls() {
    return <ScrollToTopButton />;
}
