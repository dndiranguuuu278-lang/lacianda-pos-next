'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState } from 'react';
import { GrapeClusterIcon } from './icons';
import type { NavItem } from '@/types';

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Till', shortcut: 'F1' },
  { href: '/sales', label: 'Sales', shortcut: 'F2' },
  { href: '/inventory', label: 'Inventory', shortcut: 'F3' },
  { href: '/products/add', label: 'Add Product' },
  { href: '/import', label: 'Bulk Import' },
  { href: '/z-report', label: 'Z-Report', shortcut: 'F9' },
  { href: '/etims-queue', label: 'eTIMS', badge: 'Active' },
  { href: '/settings', label: 'Settings' }
];

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileOpen, setIsMobileOpen] = useState(false);

  // Do not render navbar on unauthenticated / login route
  if (pathname === '/login') {
    return null;
  }

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`);

  const handleLogout = () => {
    try {
      localStorage.removeItem('lacianda_session');
    } catch {
      // Ignored
    }
    router.push('/login');
  };

  return (
    <header className="sticky top-0 z-40 h-14 border-b border-gray-200/90 bg-white/95 backdrop-blur-md shadow-[0_1px_3px_rgba(0,0,0,0.03)] select-none">
      <div className="mx-auto flex h-full w-full items-center justify-between px-3 sm:px-5">
        {/* Brand identity */}
        <div className="flex items-center gap-3 xl:gap-5">
          <Link
            href="/"
            className="group flex items-center gap-2.5 shrink-0 hover:opacity-95 transition-opacity"
            onClick={() => setIsMobileOpen(false)}
          >
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-paper shadow-sm group-hover:scale-105 transition-transform">
              <GrapeClusterIcon className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-gray-900 font-bold text-sm tracking-tight whitespace-nowrap flex items-center gap-1.5">
                Lacianda Wines
                <span className="hidden sm:inline-block text-[10px] uppercase font-semibold tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded">
                  POS
                </span>
              </span>
              <span className="text-[10px] text-gray-500 font-medium tracking-wide -mt-0.5 hidden sm:block">
                Wines &amp; Spirits Merchant
              </span>
            </div>
          </Link>

          {/* Desktop Nav Items */}
          <nav className="hidden lg:flex items-center gap-1" aria-label="Primary">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  aria-current={active ? 'page' : undefined}
                  className={`relative px-2.5 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
                    active
                      ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                      : 'text-gray-700 hover:text-gray-900 hover:bg-gray-100/90'
                  }`}
                >
                  <span>{item.label}</span>
                  {item.badge && (
                    <span
                      className={`text-[9px] font-bold px-1.5 py-0.2 rounded-full ${
                        active ? 'bg-white/20 text-white' : 'bg-emerald-100 text-emerald-700'
                      }`}
                    >
                      {item.badge}
                    </span>
                  )}
                </Link>
              );
            })}
          </nav>
        </div>

        {/* Right Section: System Health, Cashier Profile & Logout */}
        <div className="flex items-center gap-2.5 sm:gap-3">
          {/* Live eTIMS Status Pill */}
          <div className="hidden xl:flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-emerald-50 border border-emerald-200/80 text-[11px] font-medium text-emerald-800">
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
            </span>
            <span>eTIMS Live · Ready</span>
          </div>

          {/* Cashier Badge */}
          <div className="hidden sm:flex items-center gap-2 pl-2 border-l border-gray-200">
            <div className="h-7 w-7 rounded-full bg-primary/10 text-primary font-bold text-xs flex items-center justify-center border border-primary/20">
              DK
            </div>
            <div className="flex flex-col text-left">
              <span className="text-xs font-semibold text-gray-800 leading-tight">dennis</span>
              <span className="text-[10px] text-gray-500 font-medium">Head Cashier</span>
            </div>
          </div>

          {/* Lock / Log out Button */}
          <button
            type="button"
            onClick={handleLogout}
            title="Lock terminal or switch cashier"
            className="hidden sm:inline-flex items-center justify-center gap-1.5 px-2.5 py-1.5 text-xs font-medium text-gray-700 bg-white border border-gray-300/90 rounded-md hover:bg-gray-50 hover:text-red-700 active:bg-gray-100 transition-colors shadow-2xs"
          >
            <svg
              className="w-3.5 h-3.5 text-gray-500"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
            </svg>
            <span>Lock</span>
          </button>

          {/* Mobile hamburger menu toggle */}
          <button
            type="button"
            onClick={() => setIsMobileOpen((prev) => !prev)}
            className="inline-flex items-center justify-center rounded-md p-2 text-gray-600 hover:bg-gray-100 hover:text-gray-900 lg:hidden"
            aria-label={isMobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
          >
            {isMobileOpen ? (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-5 w-5">
                <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Mobile nav dropdown */}
      {isMobileOpen && (
        <div className="border-b border-gray-200 bg-white/98 backdrop-blur-lg px-4 py-3 shadow-lg lg:hidden transition-all">
          <div className="flex items-center justify-between pb-2 mb-2 border-b border-gray-100">
            <div className="flex items-center gap-2">
              <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
              <span className="text-xs font-semibold text-gray-700">Till #01 · Online</span>
            </div>
            <span className="text-xs text-gray-500 font-medium">Logged in: dennis</span>
          </div>

          <div className="grid grid-cols-2 gap-1.5 pb-2">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setIsMobileOpen(false)}
                  className={`block px-3 py-2 text-xs font-medium rounded-md transition-colors ${
                    active
                      ? 'bg-primary text-primary-foreground font-semibold shadow-xs'
                      : 'text-gray-700 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <span>{item.label}</span>
                    {item.badge && (
                      <span className="text-[9px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded-full font-bold">
                        {item.badge}
                      </span>
                    )}
                  </div>
                </Link>
              );
            })}
          </div>

          <div className="border-t border-gray-100 pt-2 flex items-center justify-between">
            <span className="text-xs font-medium text-gray-600">Lacianda POS v1.2</span>
            <button
              onClick={handleLogout}
              className="px-3 py-1.5 text-xs font-semibold text-red-700 border border-red-200 bg-red-50/50 rounded-md hover:bg-red-100 transition-colors"
            >
              Lock Terminal
            </button>
          </div>
        </div>
      )}
    </header>
  );
}
