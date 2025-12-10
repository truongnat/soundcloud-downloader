import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

const locales = ["en", "vi", "zh", "ko", "ja"];
const defaultLocale = "vi";

export default function proxy(request: NextRequest) {
    const { pathname } = request.nextUrl;

    // Handle API routes for CORS
    if (pathname.startsWith("/api")) {
        const origin = request.headers.get("origin");

        // Define allowed origins
        const allowedOrigins = [
            "http://localhost:3000",
            "https://universal-music-downloader.vercel.app",
            "https://soundcloud-downloader-pro.vercel.app",
        ];

        const isAllowed = origin && allowedOrigins.includes(origin);

        // Handle preflight OPTIONS request
        if (request.method === "OPTIONS") {
            const response = new NextResponse(null, { status: 200 });
            if (isAllowed) {
                response.headers.set("Access-Control-Allow-Origin", origin);
                response.headers.set("Access-Control-Allow-Credentials", "true");
                response.headers.set("Access-Control-Allow-Methods", "GET,DELETE,PATCH,POST,PUT,OPTIONS");
                response.headers.set("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization");
            }
            return response;
        }

        // Handle regular API requests
        const response = NextResponse.next();
        if (isAllowed && origin) {
            response.headers.set("Access-Control-Allow-Origin", origin);
            response.headers.set("Access-Control-Allow-Credentials", "true");
            response.headers.set("Access-Control-Allow-Methods", "GET,DELETE,PATCH,POST,PUT,OPTIONS");
            response.headers.set("Access-Control-Allow-Headers", "X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version, Authorization");
        }
        return response;
    }

    // Skip all internal paths (_next) and static files
    if (
        pathname.startsWith("/_next") ||
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
        '/((?!_next/static|_next/image|favicon.ico).*)',
    ],
}
