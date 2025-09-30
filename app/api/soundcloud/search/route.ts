
import { NextRequest, NextResponse } from 'next/server';
import { searchSoundCloud } from '@/lib/soundcloud-api';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const q = searchParams.get('q');
  const limit = searchParams.get('limit');

  if (!q) {
    return NextResponse.json({ error: 'Query parameter "q" is required' }, { status: 400 });
  }

  try {
    const data = await searchSoundCloud(q, limit ? parseInt(limit) : undefined);
    if (!data) {
      return NextResponse.json({ error: 'Error fetching data from SoundCloud' }, { status: 500 });
    }
    console.log("[route] Search data:", data);
    
    return NextResponse.json(data);
  } catch (error) {
    console.error("Error in SoundCloud search route:", error);
    return NextResponse.json({ error: 'Error searching SoundCloud' }, { status: 500 });
  }
}
