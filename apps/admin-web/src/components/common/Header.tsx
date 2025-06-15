'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export function Header() {
  const { user } = useAuth();
  const pathname = usePathname();

  const isActive = (path: string) => pathname === path;

  return (
    <header className="flex h-16 items-center justify-between border-b border-gray-200 bg-white px-4">
      <div className="flex items-center space-x-8">
        <h2 className="text-lg font-semibold text-gray-900">Dashboard</h2>
        <nav className="flex space-x-4">
          <Link
            href="/dashboard"
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              isActive('/dashboard')
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            Dashboard
          </Link>
          <Link
            href="/users"
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              isActive('/users')
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            Users
          </Link>
          {/* <Link
            href="/announcements"
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              isActive('/announcements')
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            Announcements
          </Link> */}
          <Link
            href="/payment-requests"
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              isActive('/payment-requests')
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            Payment Requests
          </Link>

          <Link
            href="/teams"
            className={`px-3 py-2 text-sm font-medium rounded-md ${
              isActive('/teams')
                ? 'bg-gray-100 text-gray-900'
                : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
            }`}
          >
            Teams
          </Link>        </nav>
      </div>
      <div className="flex items-center space-x-4">
        <div className="text-sm text-gray-600">
          Welcome, {user?.name || 'Admin'}
        </div>
      </div>
    </header>
  );
} 