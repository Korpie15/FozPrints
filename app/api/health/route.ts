import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

export const dynamic = 'force-dynamic';

export async function GET() {
  const startTime = Date.now();
  let dbStatus = 'unconfigured';
  let errorDetail: string | null = null;

  const sql = getDb();
  if (sql) {
    try {
      await sql`SELECT 1`;
      dbStatus = 'connected';
    } catch (err: any) {
      dbStatus = 'error';
      errorDetail = err?.message || String(err);
    }
  }

  const durationMs = Date.now() - startTime;
  const isHealthy = dbStatus === 'connected';

  return NextResponse.json(
    {
      status: isHealthy ? 'healthy' : 'degraded',
      database: dbStatus,
      durationMs,
      timestamp: new Date().toISOString(),
      ...(errorDetail ? { error: errorDetail } : {}),
    },
    {
      status: isHealthy ? 200 : 503,
      headers: {
        'Cache-Control': 'no-store, no-cache, must-revalidate',
      },
    }
  );
}
