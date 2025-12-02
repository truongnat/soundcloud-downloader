import { NextRequest, NextResponse } from "next/server";
import { scrapeClientId } from "@/lib/scapper-client-id";
import { unstable_cache } from "next/cache";

const getCachedClientId = unstable_cache(
  async () => {
    return await scrapeClientId();
  },
  ["soundcloud-client-id"],
  {
    revalidate: 24 * 60 * 60, // 24 hours
    tags: ["soundcloud-client-id"],
  }
);

export async function GET(req: NextRequest) {
  try {
    const clientId = await getCachedClientId();

    if (!clientId) {
      return NextResponse.json(
        { error: "Could not find client_id" },
        { status: 500 }
      );
    }

    return NextResponse.json({ clientId });
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching data from SoundCloud" },
      { status: 500 }
    );
  }
}
