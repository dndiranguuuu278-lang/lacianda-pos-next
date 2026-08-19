'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const navLinks = [
    { name: 'Till / POS', href: '/' },
    { name: 'Sales', href: '/sales' },
    { name: 'Inventory', href: '/inventory' },
    { name: 'Add Product', href: '/products/add' },
    { name: 'Bulk Import', href: '/import' },
    { name: 'eTIMS', href: '/etims' },
    { name: 'Z-Report', href: '/reports/z' },
    { name: 'Settings', href: '/settings' },
  ];

  return (
    <header className="bg-slate-900 border-b border-slate-800 sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-6">
          <span className="font-extrabold text-amber-500 tracking-wide text-base">
            Lacianda Wines & Spirits
          </span>
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => {
              const isActive = pathname === link.href;
              return (
                <Link
                  key={link.href}
                  href={link.href}
                  className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-amber-700 text-white shadow-sm'
                      : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800'
                  }`}
                >
                  {link.name}
                </Link>
              );
            })}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          <div className="text-right hidden sm:block">
            <span className="block text-xs font-bold text-slate-200">dennis</span>
            <span className="block text-[10px] text-amber-400 font-mono">0720087714</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-amber-950 border border-amber-800 flex items-center justify-center text-amber-400 font-bold text-xs">
            D
          </div>
        </div>
      </div>
    </header>
  );
}
