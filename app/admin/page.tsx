import type { Metadata } from 'next';
import { headers } from 'next/headers';
import { adminUser } from '@/lib/admin-auth';
import { getAdminStock, type AdminStock } from '@/lib/admin-stock';
import { StockAdmin } from '@/components/admin/StockAdmin';
import '@/styles/admin.css';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Stock admin',
  robots: { index: false, follow: false },
};

export default async function AdminPage() {
  const requestHeaders = await headers();
  const hostname = (requestHeaders.get('host') || '').split(':')[0];
  const user = await adminUser(requestHeaders, hostname);

  if ('error' in user) {
    return (
      <main className="admin-page">
        <div className="admin-notice admin-notice-error" role="alert">
          <h1>Admin</h1>
          <p>{user.error}</p>
        </div>
      </main>
    );
  }

  let stock: AdminStock | null = null;
  try {
    stock = await getAdminStock();
  } catch (error) {
    console.error('Admin stock load failed:', error);
  }

  if (!stock) {
    return (
      <main className="admin-page">
        <div className="admin-notice admin-notice-error" role="alert">
          <h1>Admin</h1>
          <p>Could not load stock. Check that schema.sql has been applied to the database.</p>
        </div>
      </main>
    );
  }

  return (
    <main className="admin-page">
      <StockAdmin initial={stock} email={user.email} />
    </main>
  );
}
