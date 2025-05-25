'use client';

import { useAuth } from '@/contexts/AuthContext';

export function Header() {
  const { user } = useAuth();

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4">
      <div className="flex items-center">
        <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-sm text-gray-600">
          Welcome, {user?.name || 'Admin'}
        </div>
      </div>
    </header>
  );
} 