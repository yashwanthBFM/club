'use client';

import { useAuth } from '@/contexts/AuthContext';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState, useEffect } from 'react';

export default function AuthenticatedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const { user, logout } = useAuth();
  const pathname = usePathname();
  const [drawerOpen, setDrawerOpen] = useState(false);

  useEffect(() => {
    const font = document.createElement('link');
    font.href = 'https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap';
    font.rel = 'stylesheet';
    document.head.appendChild(font);
  }, []);

  if (!user) return null;

  const navLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/users', label: 'Users' },
    // { href: '/polls', label: 'Polls' },
    // { href: '/games', label: 'Games' },
    { href: '/payment-requests', label: 'Payment Requests' },
    { href: '/teams', label: 'Teams' },
  ];

  return (
    <div className="min-h-screen bg-gray-100 font-['Bebas_Neue']"
     style={{
    backgroundColor: '#3d4041'
  }}
  >
      <nav className="sticky top-0 z-50 bg-[rgba(0,0,0,0.88)] backdrop-blur-sm text-white px-4 py-3 shadow-md">
        <div className="max-w-7xl mx-auto flex justify-between items-center">
          {/* Left: Logo and Title */}
          <div className="flex items-center gap-4">
            <span className="text-xl font-bold">RENEGADES FC</span>
            <Link href="/dashboard" className="text-lg hover:text-cyan-400 transition-all duration-200">
              Admin Dashboard
            </Link>
          </div>

          {/* Center: Nav Links (Desktop only) */}
          <div className="hidden sm:flex gap-6 text-lg">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors ${
                  pathname === link.href ? 'text-cyan-300' : 'hover:text-cyan-400'
                }`}
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Right: Email + Logout */}
          <div className="hidden sm:flex items-center gap-4 text-sm">
            <span>{user.email}</span>
            <button
              onClick={logout}
              className="hover:text-cyan-400 transition-colors duration-200"
            >
              Logout
            </button>
          </div>

          {/* Hamburger (Mobile only) */}
          <div className="sm:hidden flex items-center">
            <button
              onClick={() => setDrawerOpen(true)}
              aria-label="Open menu"
              className="flex flex-col gap-1 p-2"
            >
              <span className="w-6 h-[3px] bg-white rounded-sm" />
              <span className="w-6 h-[3px] bg-white rounded-sm" />
              <span className="w-6 h-[3px] bg-white rounded-sm" />
            </button>
          </div>
        </div>

        {/* Mobile Drawer */}
        {drawerOpen && (
          <div className="sm:hidden fixed inset-0 z-50 bg-black bg-opacity-80 backdrop-blur-md p-6">
            <div className="flex justify-between items-center mb-8">
              <h2 className="text-white text-2xl">RENEGADES FC</h2>
              <button onClick={() => setDrawerOpen(false)} className="text-white text-2xl">
                ×
              </button>
            </div>
            <nav className="flex flex-col gap-4 text-white text-lg">
              {navLinks.map((link) => (
                <Link
                  key={link.href}
                  href={link.href}
                  onClick={() => setDrawerOpen(false)}
                  className={`transition-colors duration-200 ${
                    pathname === link.href ? 'text-cyan-300' : 'hover:text-cyan-400'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <hr className="border-gray-600 my-4" />
              <span className="text-sm text-gray-300">{user.email}</span>
              <button
                onClick={() => {
                  logout();
                  setDrawerOpen(false);
                }}
                className="mt-2 text-left hover:text-cyan-400 transition-colors duration-200"
              >
                Logout
              </button>
            </nav>
          </div>
        )}
      </nav>
      <main className="w-full px-2 sm:px-6 lg:px-8 py-6 mx-auto max-w-7xl">
        {children}
      </main>
    </div>
  );
} 