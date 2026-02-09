import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const placeId = searchParams.get('place_id');

  if (!placeId) {
    return NextResponse.json({ error: 'Missing place_id' }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&key=${apiKey}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Google API failed: ${res.status}`);
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Google Places API error:', error);
    return NextResponse.json({ error: 'Failed to fetch details' }, { status: 500 });
  }
}
