'use client';

import { Sidebar } from '@/components/common/Sidebar';
import { Header } from '@/components/common/Header';
import { ProtectedRoute } from '@/components/common/ProtectedRoute';

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <ProtectedRoute>
      <div className="flex h-screen bg-gray-100">
        <Sidebar />
        <div className="flex flex-1 flex-col overflow-hidden">
          <Header />
          <main className="flex-1 overflow-y-auto bg-gray-100 p-4">
            {children}
          </main>
        </div>
      </div>
    </ProtectedRoute>
  );
} 