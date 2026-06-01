'use client';

import { AppSidebar } from '@/components/app/sidebar';

export default function AppLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="flex min-h-screen">
      <AppSidebar />
      <div className="flex-1">
        <main className="p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
