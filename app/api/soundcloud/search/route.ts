import { NextResponse } from "next/server";
import { searchSoundCloud } from "@/lib/soundcloud-api";
import { unstable_cache } from "next/cache";

const getCachedSearch = unstable_cache(
  async (query: string, limit: number) => {
    return await searchSoundCloud(query, limit);
  },
  ["soundcloud-search"],
  {
    revalidate: 3600, // 1 hour
    tags: ["soundcloud-search"],
  }
);

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q");
  const limit = searchParams.get("limit") || "10";

  if (!query) {
    return NextResponse.json(
      { error: 'Query parameter "q" is required' },
      { status: 400 }
    );
  }

  try {
    const data = await getCachedSearch(query, parseInt(limit));

    if (!data) {
      return NextResponse.json(
        { error: "Error fetching data from SoundCloud" },
        { status: 500 }
      );
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in SoundCloud search route:", error);
    return NextResponse.json(
      { error: "Error searching SoundCloud" },
      { status: 500 }
    );
  }
}
