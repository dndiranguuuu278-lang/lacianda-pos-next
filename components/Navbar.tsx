'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { WineGlassIcon } from './icons';

interface NavItem {
  href: string;
  label: string;
}

const NAV_ITEMS: NavItem[] = [
  { href: '/', label: 'Till' },
  { href: '/inventory', label: 'Inventory' },
  { href: '/sales', label: 'Sales History' },
  { href: '/z-report', label: 'Z-Report' },
  { href: '/etims-queue', label: 'eTIMS Queue' },
  { href: '/settings', label: 'Settings' }
];

export default function Navbar() {
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  // Exact match for "/", prefix match for everything else, so /inventory
  // still highlights while on a nested route like /inventory/new.
  const isActive = (href: string) => (href === '/' ? pathname === '/' : pathname === href || pathname.startsWith(`${href}/`));

  return (
    <header className="sticky top-0 z-40 border-b border-gray-200 bg-white relative">
      {/* Terracotta accent rule — a thin second line beneath the main
          border, echoing the double-border label motif used elsewhere. */}
      <div className="absolute inset-x-0 bottom-0 h-[2px] bg-gradient-to-r from-[#78350f]/0 via-[#78350f]/60 to-[#78350f]/0" />
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Brand identity */}
        <Link href="/" className="flex items-center gap-2.5 shrink-0" onClick={() => setMobileOpen(false)}>
          <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-[#78350f] text-white">
            <WineGlassIcon className="h-5 w-5" />
          </span>
          <span className="hidden text-base font-semibold tracking-tight text-gray-900 sm:block">
            Lacianda <span className="font-medium text-gray-500">Wines &amp; Spirits</span>
          </span>
          <span className="text-base font-semibold tracking-tight text-gray-900 sm:hidden">Lacianda</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 md:flex" aria-label="Primary">
          {NAV_ITEMS.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={
                  active
                    ? 'rounded-md bg-[#78350f] px-3 py-2 text-sm font-medium text-white transition-colors'
                    : 'rounded-md px-3 py-2 text-sm font-medium text-[#6B7280] transition-colors hover:bg-gray-100 hover:text-gray-900'
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Mobile menu toggle */}
        <button
          type="button"
          onClick={() => setMobileOpen((v) => !v)}
          className="inline-flex items-center justify-center rounded-md p-2 text-[#6B7280] transition-colors hover:bg-gray-100 hover:text-gray-900 md:hidden"
          aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
          aria-expanded={mobileOpen}
        >
          {mobileOpen ? (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} className="h-6 w-6">
              <path strokeLinecap="round" strokeLinejoin="round" d="M3.75 6.75h16.5M3.75 12h16.5M3.75 17.25h16.5" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile nav panel */}
      {mobileOpen && (
        <nav className="border-t border-gray-200 bg-white md:hidden" aria-label="Primary mobile">
          <div className="space-y-1 px-4 py-3">
            {NAV_ITEMS.map((item) => {
              const active = isActive(item.href);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  aria-current={active ? 'page' : undefined}
                  className={
                    active
                      ? 'block rounded-md bg-[#78350f] px-3 py-2 text-sm font-medium text-white transition-colors'
                      : 'block rounded-md px-3 py-2 text-sm font-medium text-[#6B7280] transition-colors hover:bg-gray-100 hover:text-gray-900'
                  }
                >
                  {item.label}
                </Link>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
