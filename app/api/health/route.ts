import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

/**
 * Public uptime check. Only says whether the site can reach its database;
 * details (timings, errors) go to the server log, not to visitors.
 */
export async function GET() {
  let healthy = false;

  const sql = getDb();
  if (sql) {
    try {
      await sql`SELECT 1`;
      healthy = true;
    } catch (err) {
      console.error('Health check database error:', err);
    }
  } else {
    console.error('Health check: DATABASE_URL is not configured.');
  }

  return NextResponse.json(
    { status: healthy ? 'ok' : 'degraded' },
    {
      status: healthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}
