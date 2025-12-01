import { NextResponse } from "next/server";
import { searchSoundCloud } from "@/lib/soundcloud-api";

const CACHE_DURATION = 3600; // 1 hour in seconds
const cache = new Map<string, { data: any; timestamp: number }>();

// Clean up old cache entries periodically
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of cache.entries()) {
    if (now - value.timestamp > CACHE_DURATION * 1000) {
      cache.delete(key);
    }
  }
}, 60000); // Clean up every minute

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const clientId = searchParams.get("client_id");
  const limit = searchParams.get("limit") || "10";
  const page = searchParams.get("page") || "1";

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter "q" is required' },
      { status: 400 }
    );
  }

  // Create a cache key based on the search parameters
  const cacheKey = `search:${query}:${limit}:${page}:${clientId}`;

  // Try to get the cached data
  const cachedData = cache.get(cacheKey);
  if (cachedData && Date.now() - cachedData.timestamp < CACHE_DURATION * 1000) {
    return NextResponse.json(cachedData.data);
  }

  try {
    const data = await searchSoundCloud(
      query,
      limit ? parseInt(limit) : undefined
    );
    if (!data) {
      return NextResponse.json(
        { error: "Error fetching data from SoundCloud" },
        { status: 500 }
      );
    }

    // Store in cache
    cache.set(cacheKey, {
      data,
      timestamp: Date.now()
    });

    const response = NextResponse.json(data);
    response.headers.set("Cache-Control", `public, max-age=${CACHE_DURATION}`);

    return response;
  } catch (error) {
    console.error("Error in SoundCloud search route:", error);
    return NextResponse.json(
      { error: "Error searching SoundCloud" },
      { status: 500 }
    );
  }
}
