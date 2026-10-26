import { NextResponse } from 'next/server';
import { isLaunchOfferAvailable } from '@/lib/promo-server';

/** Whether the launch offer can still be used, so banners and the cart stop advertising it once it's gone. */
export async function GET() {
  const available = await isLaunchOfferAvailable();
  return NextResponse.json(
    { launchOfferAvailable: available },
    { headers: { 'Cache-Control': 'public, max-age=60, s-maxage=60' } }
  );
}
