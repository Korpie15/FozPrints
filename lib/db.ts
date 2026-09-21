import { neon } from '@neondatabase/serverless';

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    return null;
  }
  return neon(url);
}

/**
 * Stock levels keyed by Stripe Price ID.
 * Throws if the database is unavailable so callers choose how to fail
 * (checkout blocks the sale; the product listing shows items as unavailable).
 */
export async function getInventoryMap(): Promise<Record<string, number>> {
  const sql = getDb();
  if (!sql) {
    throw new Error('DATABASE_URL is not configured.');
  }

  const rows = await sql`SELECT id, stock_count FROM inventory`;
  const map: Record<string, number> = {};
  for (const row of rows) {
    map[row.id] = Number(row.stock_count) || 0;
  }
  return map;
}

/**
 * Deducts sold quantities from inventory exactly once per Stripe event.
 * The event claim and every stock update run in a single SQL statement, so a
 * retried or duplicate webhook delivery can never decrement twice.
 * Stock is clamped at 0 because the payment has already been taken.
 * Returns false if this event was already processed.
 */
export async function decrementInventoryOnce(
  eventId: string,
  lines: Array<{ priceId: string; quantity: number }>
): Promise<boolean> {
  const sql = getDb();
  if (!sql) {
    throw new Error('DATABASE_URL is not configured.');
  }

  const totals = new Map<string, number>();
  for (const { priceId, quantity } of lines) {
    totals.set(priceId, (totals.get(priceId) || 0) + quantity);
  }
  const ids = [...totals.keys()];
  const qtys = [...totals.values()];

  const rows = await sql`
    WITH claimed AS (
      INSERT INTO processed_stripe_events (event_id)
      VALUES (${eventId})
      ON CONFLICT DO NOTHING
      RETURNING event_id
    ),
    sold AS (
      SELECT id, qty FROM unnest(${ids}::text[], ${qtys}::int[]) AS t(id, qty)
    ),
    updated AS (
      UPDATE inventory i
      SET stock_count = GREATEST(i.stock_count - sold.qty, 0)
      FROM sold
      WHERE i.id = sold.id AND EXISTS (SELECT 1 FROM claimed)
      RETURNING i.id
    )
    SELECT (SELECT count(*) FROM claimed) AS claimed
  `;

  return Number(rows[0]?.claimed) > 0;
}
