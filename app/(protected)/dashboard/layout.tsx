import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Dashboard',
  description: 'Dashboard'
};

export default async function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex h-screen">
      <main className="flex flex-1 flex-col overflow-hidden">
        <div className="flex-1 overflow-auto">{children}</div>
      </main>
    </div>
  );
}
