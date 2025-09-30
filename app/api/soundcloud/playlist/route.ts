
import { NextRequest, NextResponse } from 'next/server';
import { getSoundCloudPlaylist } from '@/lib/soundcloud-api';

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const url = searchParams.get('url');

  if (!url) {
    return NextResponse.json({ error: 'Query parameter "url" is required' }, { status: 400 });
  }

  try {
    const data = await getSoundCloudPlaylist(url);
    if (!data) {
      return NextResponse.json({ error: 'Error fetching data from SoundCloud' }, { status: 500 });
    }
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Error getting SoundCloud playlist' }, { status: 500 });
  }
}
