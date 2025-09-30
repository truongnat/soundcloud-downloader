import { NextRequest, NextResponse } from "next/server";
import { scrapeClientId } from "@/lib/scapper-client-id";

let cachedClientId: string | null = null;
let cacheTimestamp: number | null = null;

const CACHE_DURATION = 24 * 60 * 60 * 1000; // 24 hours in milliseconds

export async function GET(req: NextRequest) {
  const now = Date.now();

  if (cachedClientId && cacheTimestamp && now - cacheTimestamp < CACHE_DURATION) {
    return NextResponse.json({ clientId: cachedClientId });
  }

  try {
    const clientId = await scrapeClientId();

    if (!clientId) {
      return NextResponse.json(
        { error: "Could not find client_id" },
        { status: 500 }
      );
    }

    cachedClientId = clientId;
    cacheTimestamp = now;

    return NextResponse.json({ clientId });
  } catch (error) {
    return NextResponse.json(
      { error: "Error fetching data from SoundCloud" },
      { status: 500 }
    );
  }
}
