'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { name: 'Till', href: '/' },
    { name: 'Sales', href: '/sales' },
    { name: 'Inventory', href: '/inventory' },
    { name: 'Add product', href: '/products/add' },
    { name: 'Bulk import', href: '/import' },
    { name: 'Z-Report', href: '/reports/z' },
    { name: 'eTIMS', href: '/etims' },
    { name: 'Settings', href: '/settings' },
  ];

  return (
    <header className="bg-white border-b border-slate-200 px-6 py-3 shadow-sm select-none">
      <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-center justify-between gap-4">
        <Link href="/" className="font-bold text-base text-amber-900 hover:opacity-90">
          Lacianda Wines and Spirits
        </Link>

        <nav className="flex flex-wrap items-center gap-4 text-sm font-medium text-slate-600">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;
            return (
              <Link
                key={link.href}
                href={link.href}
                className={`transition-colors py-1 px-2.5 rounded-md ${
                  isActive
                    ? 'bg-amber-900 text-white shadow-sm'
                    : 'hover:text-amber-900 hover:bg-slate-50'
                }`}
              >
                {link.name}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-4 text-sm text-slate-500">
          <span>dennis</span>
          <button
            onClick={() => alert('Logged out successfully')}
            className="text-slate-600 hover:text-rose-600 font-medium transition-colors"
          >
            Log out
          </button>
        </div>
      </div>
    </header>
  );
}
