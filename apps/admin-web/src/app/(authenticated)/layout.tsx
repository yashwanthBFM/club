'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  if (!user) {
    return null;
  }

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/users', label: 'Users' },
    { href: '/polls', label: 'Polls' },
    { href: '/games', label: 'Games' },
    { href: '/payment-requests', label: 'Payment Requests' },
  ];

  return (
    <div className="min-h-screen bg-gray-100">
      <nav className="bg-white shadow-sm w-full">
        <div className="mx-auto px-2 sm:px-4 lg:px-8 max-w-7xl">
          <div className="flex flex-wrap justify-between h-16 items-center">
            <div className="flex items-center flex-shrink-0">
              <Link href="/dashboard" className="text-xl font-bold text-gray-800">
                Admin Dashboard
              </Link>
            </div>
            {/* Hamburger for mobile */}
            <button
              className="sm:hidden p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
              onClick={() => setDrawerOpen(true)}
              aria-label="Open navigation menu"
            >
              <svg className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
            {/* Desktop nav */}
            <div className="flex-1 items-center justify-center sm:justify-start hidden sm:flex">
              <div className="flex space-x-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`inline-flex items-center px-1 pt-1 border-b-2 text-sm font-medium ${
                      pathname === link.href
                        ? 'border-indigo-500 text-gray-900'
                        : 'border-transparent text-gray-500 hover:border-gray-300 hover:text-gray-700'
                    }`}
                  >
                    {link.label}
                  </Link>
                ))}
              </div>
            </div>
            <div className="flex items-center">
              <span className="text-sm text-gray-700 mr-4">{user.email}</span>
              <button
                onClick={logout}
                className="text-sm text-gray-700 hover:text-gray-900"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
        {/* Side Drawer for mobile */}
        {drawerOpen && (
          <>
            <div
              className="fixed inset-0 bg-black bg-opacity-30 z-40"
              onClick={() => setDrawerOpen(false)}
            />
            <div className="fixed top-0 left-0 h-full w-64 bg-white shadow-lg z-50 flex flex-col p-6 transition-transform duration-300">
              <button
                className="self-end mb-6 p-2 rounded focus:outline-none focus:ring-2 focus:ring-indigo-500"
                onClick={() => setDrawerOpen(false)}
                aria-label="Close navigation menu"
              >
                <svg className="h-6 w-6 text-gray-800" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
              <nav className="flex flex-col space-y-4">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    className={`text-base font-medium ${
                      pathname === link.href
                        ? 'text-indigo-600 font-semibold'
                        : 'text-gray-700 hover:text-indigo-600'
                    }`}
                    onClick={() => setDrawerOpen(false)}
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>
            </div>
          </>
        )}
      </nav>
      <main className="w-full px-2 sm:px-6 lg:px-8 py-6 mx-auto max-w-7xl">
        {children}
      </main>
    </div>
  );
} 