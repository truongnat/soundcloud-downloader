import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["en", "vi", "zh", "ko", "ja"];
const defaultLocale = "vi";

export default function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Skip all internal paths (_next), api routes, and static files
    if (
        pathname.startsWith("/_next") ||
        pathname.startsWith("/api") ||
        pathname.includes(".") // Skip files like favicon.ico, images, etc.
    ) {
        return NextResponse.next();
    }

    // Check if there is any supported locale in the pathname
    const pathnameHasLocale = locales.some(
        (locale) => pathname.startsWith(`/${locale}/`) || pathname === `/${locale}`
    );

    if (pathnameHasLocale) {
        return NextResponse.next();
    }

    // Redirect if there is no locale
    const locale = defaultLocale;
    const newUrl = new URL(`/${locale}${pathname}`, request.nextUrl);
    // Ensure search params are preserved
    newUrl.search = request.nextUrl.search;

    return NextResponse.redirect(newUrl);
}

export const config = {
    matcher: [
        // Skip all internal paths (_next)
        '/((?!api|_next/static|_next/image|favicon.ico).*)',
    ],
}
