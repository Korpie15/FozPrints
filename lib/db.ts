import { neon } from '@neondatabase/serverless';

export function getDb() {
  const url = process.env.DATABASE_URL;
  if (!url) {
    return null;
  }
  return neon(url);
}

export async function getInventoryMap(): Promise<Record<string, number>> {
  const sql = getDb();
  if (!sql) {
    return {};
  }

  try {
    const rows = await sql`SELECT id, stock_count FROM inventory`;
    const map: Record<string, number> = {};
    for (const row of rows) {
      map[row.id] = Number(row.stock_count) || 0;
    }
    return map;
  } catch (error) {
    console.error('Failed to query inventory from Neon:', error);
    return {};
  }
}
