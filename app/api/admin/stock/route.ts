import { NextResponse } from 'next/server';
import { adminUser } from '@/lib/admin-auth';
import { applyStockChange, getAdminStock, StockChangeError, type StockAction } from '@/lib/admin-stock';

export const dynamic = 'force-dynamic';

const NO_STORE = { 'Cache-Control': 'no-store' };
const ACTIONS: StockAction[] = ['set', 'adjust', 'setOnOrder', 'receive', 'setWaste'];

function json(body: unknown, status = 200) {
  return NextResponse.json(body, { status, headers: NO_STORE });
}

/** Only accept writes from this site's own pages: the Access cookie is sent by the browser automatically */
function sameOrigin(req: Request): boolean {
  const origin = req.headers.get('origin');
  if (!origin) return false;
  let originHost: string;
  try {
    originHost = new URL(origin).host;
  } catch {
    return false;
  }
  const hosts = [req.headers.get('host'), req.headers.get('x-forwarded-host'), new URL(req.url).host];
  return hosts.some((h) => h && h.toLowerCase() === originHost.toLowerCase());
}

export async function GET(req: Request) {
  const user = await adminUser(req.headers, new URL(req.url).hostname);
  if ('error' in user) return json({ error: user.error }, 401);

  try {
    return json(await getAdminStock());
  } catch (error) {
    console.error('Admin stock load failed:', error);
    return json({ error: 'Could not load stock. Has schema.sql been applied to the database?' }, 500);
  }
}

export async function POST(req: Request) {
  const user = await adminUser(req.headers, new URL(req.url).hostname);
  if ('error' in user) return json({ error: user.error }, 401);

  if (!sameOrigin(req) || !(req.headers.get('content-type') || '').includes('application/json')) {
    return json({ error: 'Request not allowed.' }, 403);
  }

  const body = await req.json().catch(() => null);
  if (!body || typeof body.id !== 'string' || !ACTIONS.includes(body.action)) {
    return json({ error: 'Invalid request.' }, 400);
  }

  try {
    await applyStockChange(user.email, { action: body.action, id: body.id, value: body.value });
    return json(await getAdminStock());
  } catch (error) {
    if (error instanceof StockChangeError) return json({ error: error.message }, 400);
    console.error('Admin stock change failed:', error);
    return json({ error: 'Could not save that change. Please try again.' }, 500);
  }
}
