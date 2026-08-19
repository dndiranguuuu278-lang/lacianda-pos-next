'use client';
import Link from 'next/link';
import { usePathname } from 'next/navigation';

export default function Navbar() {
  const pathname = usePathname();

  const navItems = [
    { name: 'Till', href: '/' },
    { name: 'Inventory', href: '/inventory' },
    { name: 'Add Product', href: '/add-product' },
    { name: 'Z-Report', href: '/z-report' },
    { name: 'eTIMS Queue', href: '/etims-queue' },
    { name: 'Settings', href: '/settings' },
  ];

  return (
    <header className="bg-white border-b border-gray-200 sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-8">
          <span className="font-bold text-base text-[#78350f]">Lacianda Wines & Spirits</span>
          <nav className="hidden md:flex space-x-1">
            {navItems.map((item) => {
              const isActive = pathname === item.href;
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  className={`px-3 py-2 rounded-md text-xs font-semibold transition-colors ${
                    isActive
                      ? 'bg-[#78350f] text-white'
                      : 'text-gray-600 hover:bg-gray-100 hover:text-gray-900'
                  }`}
                >
                  {item.name}
                </Link>
              );
            })}
          </nav>
        </div>
        <div className="flex items-center space-x-3 text-xs">
          <span className="text-gray-500 font-medium">Cashier: <strong className="text-gray-800">dennis</strong></span>
          <button
            onClick={() => alert('Logged out successfully')}
            className="px-2.5 py-1.5 border border-gray-300 rounded text-gray-700 hover:bg-gray-50"
          >
            Logout
          </button>
        </div>
      </div>
    </header>
  );
}
