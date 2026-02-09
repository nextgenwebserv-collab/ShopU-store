import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url);
  const query = searchParams.get('q');

  if (!query) {
    return NextResponse.json({ error: 'Missing query' }, { status: 400 });
  }

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAP_API_KEY;
  const url = `https://maps.googleapis.com/maps/api/place/autocomplete/json?input=${encodeURIComponent(
    query
  )}&key=${apiKey}`;

  try {
    const res = await fetch(url);
    if (!res.ok) {
      throw new Error(`Google API failed: ${res.status}`);
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (error) {
    console.error('Google Autocomplete API error:', error);
    return NextResponse.json({ error: 'Failed to fetch autocomplete' }, { status: 500 });
  }
}
