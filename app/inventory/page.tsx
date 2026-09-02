'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import type { Product, StockStatusFilter } from '@/types';

export default function InventoryPage() {
  const [inventory, setInventory] = useState<Product[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [stockStatusFilter, setStockStatusFilter] = useState<'All' | 'In Stock' | 'Low Stock' | 'Out of Stock'>('All');
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const loadInventory = () => {
    const stored = localStorage.getItem('lacianda_inventory');
    if (stored) {
      try {
        const parsed = JSON.parse(stored);
        const normalized = parsed.map((p: any) => ({
          ...p,
          variant: p.variant || 'Unit',
          taxType: p.taxType || 'Standard (VAT applies)',
          isActive: p.isActive !== false,
        }));
        setInventory(normalized);
      } catch {
        setInventory(getDefaultInventory());
      }
    } else {
      const demo = getDefaultInventory();
      setInventory(demo);
      localStorage.setItem('lacianda_inventory', JSON.stringify(demo));
    }
  };

  const getDefaultInventory = (): Product[] => [
    { id: 'PROD-101', name: 'Beefeater London Dry Gin 750ml', category: 'Gin', price: 2200, stock: 12, variant: 'Unit', barcode: '61611000101', taxType: 'Standard (VAT applies)', isActive: true },
    { id: 'PROD-102', name: 'Guinness MicroDraught 330ml Can', category: 'Beer', price: 250, stock: 0, variant: 'Unit', barcode: '61611000102', taxType: 'Standard (VAT applies)', isActive: true },
    { id: 'PROD-103', name: 'Campari Bitter 1L', category: 'Aperitif', price: 3400, stock: 0, variant: 'Unit', barcode: '61611000103', taxType: 'Standard (VAT applies)', isActive: true },
    { id: 'PROD-104', name: 'Guinness Extra Stout 330ml', category: 'Beer', price: 230, stock: 18, variant: 'Unit', barcode: '61611000104', taxType: 'Standard (VAT applies)', isActive: true },
    { id: 'PROD-105', name: 'The Botanist Islay Dry Gin 750ml', category: 'Gin', price: 4500, stock: 4, variant: 'Unit', barcode: '61611000105', taxType: 'Standard (VAT applies)', isActive: true },
    { id: 'PROD-106', name: 'Makers Mark Bourbon 750ml', category: 'Whisky', price: 4800, stock: 6, variant: 'Unit', barcode: '61611000106', taxType: 'Standard (VAT applies)', isActive: true },
    { id: 'PROD-107', name: 'Martini Extra Dry 1L', category: 'Vermouth', price: 1950, stock: 0, variant: 'Unit', barcode: '61611000107', taxType: 'Standard (VAT applies)', isActive: true },
    { id: 'PROD-108', name: 'Moet & Chandon Imperial Brut 750ml', category: 'Champagne', price: 8500, stock: 2, variant: 'Unit', barcode: '61611000108', taxType: 'Standard (VAT applies)', isActive: true },
    { id: 'PROD-109', name: "Jack Daniel's Single Barrel Select 750ml", category: 'Whisky', price: 6200, stock: 3, variant: 'Unit', barcode: '61611000109', taxType: 'Standard (VAT applies)', isActive: true },
    { id: 'PROD-110', name: 'Frontera Sweet White 750ml', category: 'Wine', price: 1100, stock: 14, variant: 'Unit', barcode: '61611000110', taxType: 'Standard (VAT applies)', isActive: true },
    { id: 'PROD-111', name: 'Smirnoff Espresso Vodka 750ml', category: 'Vodka', price: 1650, stock: 0, variant: 'Unit', barcode: '61611000111', taxType: 'Standard (VAT applies)', isActive: true },
    { id: 'PROD-112', name: 'Grants Triple Wood 750ml', category: 'Whisky', price: 1850, stock: 0, variant: 'Unit', barcode: '61611000112', taxType: 'Standard (VAT applies)', isActive: true },
    { id: 'PROD-113', name: 'Smirnoff Ice Black 300ml Glass', category: 'Beer/RTD', price: 200, stock: 24, variant: 'Unit', barcode: '61611000113', taxType: 'Standard (VAT applies)', isActive: true },
    { id: 'PROD-114', name: 'Dasani Sparkling Water Lemon 500ml', category: 'Water', price: 100, stock: 0, variant: 'Unit', barcode: '61611000114', taxType: 'Standard (VAT applies)', isActive: true },
    { id: 'PROD-115', name: 'Bowmore 12 Years 750ml', category: 'Whisky', price: 5400, stock: 0, variant: 'Unit', barcode: '61611000115', taxType: 'Standard (VAT applies)', isActive: true },
    { id: 'PROD-116', name: 'Corona Extra 355ml', category: 'Beer', price: 300, stock: 0, variant: 'Unit', barcode: '61611000116', taxType: 'Standard (VAT applies)', isActive: true },
    { id: 'PROD-117', name: 'Black & White Whisky 750ml', category: 'Whisky', price: 1400, stock: 15, variant: 'Unit', barcode: '61611000117', taxType: 'Standard (VAT applies)', isActive: true },
    { id: 'PROD-118', name: 'Stella Artois 330ml', category: 'Beer', price: 280, stock: 0, variant: 'Unit', barcode: '61611000118', taxType: 'Standard (VAT applies)', isActive: true },
    { id: 'PROD-119', name: 'Remy Martin VSOP 700ml', category: 'Cognac', price: 7800, stock: 2, variant: 'Unit', barcode: '61611000119', taxType: 'Standard (VAT applies)', isActive: true },
    { id: 'PROD-120', name: 'Tusker Lager 500ml', category: 'Beer', price: 220, stock: 48, variant: 'Unit', barcode: '61611000120', taxType: 'Standard (VAT applies)', isActive: true },
    { id: 'PROD-121', name: 'Kenya Cane 750ml', category: 'Spirits', price: 850, stock: 30, variant: 'Unit', barcode: '61611000121', taxType: 'Standard (VAT applies)', isActive: true },
    { id: 'PROD-122', name: 'Gilbeys Special Dry Gin 750ml', category: 'Gin', price: 1350, stock: 22, variant: 'Unit', barcode: '61611000122', taxType: 'Standard (VAT applies)', isActive: true },
  ];

  useEffect(() => {
    loadInventory();
  }, []);

  const categories = ['All', ...Array.from(new Set(inventory.map((p) => p.category)))];

  const totalSKUs = inventory.length;
  const outOfStockCount = inventory.filter((p) => p.stock <= 0).length;
  const lowStockCount = inventory.filter((p) => p.stock > 0 && p.stock <= 5).length;
  const healthyStockCount = inventory.filter((p) => p.stock > 5).length;
  const totalValue = inventory.reduce((acc, p) => acc + p.price * p.stock, 0);

  const filtered = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      (item.barcode && item.barcode.includes(search));

    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;

    let matchesStatus = true;
    if (stockStatusFilter === 'Out of Stock') matchesStatus = item.stock <= 0;
    else if (stockStatusFilter === 'Low Stock') matchesStatus = item.stock > 0 && item.stock <= 5;
    else if (stockStatusFilter === 'In Stock') matchesStatus = item.stock > 5;

    return matchesSearch && matchesCategory && matchesStatus;
  });

  const handleSaveEdit = (updated: Product) => {
    const next = inventory.map((p) => (p.id === updated.id ? updated : p));
    setInventory(next);
    localStorage.setItem('lacianda_inventory', JSON.stringify(next));
    setEditingProduct(null);
  };

  const formatKES = (val: number) =>
    `KES ${val.toLocaleString('en-KE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 bg-background min-h-[calc(100vh-3.5rem)] overflow-y-auto">
      {/* Top Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-5">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <span>Inventory Catalog &amp; Stock Control</span>
            <span className="text-xs font-semibold px-2 py-0.5 rounded-full bg-primary/10 text-primary">
              {totalSKUs} SKUs
            </span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Monitor real-time bottle quantities, reorder warnings, barcode mapping, and price lists
          </p>
        </div>

        <div className="flex items-center gap-2 self-start sm:self-auto">
          <Link
            href="/import"
            className="px-3 py-2 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs"
          >
            Bulk Import CSV
          </Link>
          <Link
            href="/products/add"
            className="px-3.5 py-2 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-wine-800 active:scale-98 transition-all shadow-sm flex items-center gap-1.5"
          >
            <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2.5">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
            <span>Add Product</span>
          </Link>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-gray-500 uppercase tracking-wider">Total SKUs</span>
          <div className="text-lg sm:text-xl font-extrabold text-gray-900 font-mono mt-1">
            {totalSKUs}
          </div>
          <span className="text-[10px] text-gray-400 font-medium mt-0.5 block">Active Catalog Items</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-emerald-700 uppercase tracking-wider">Healthy Stock (&gt;5)</span>
          <div className="text-lg sm:text-xl font-extrabold text-emerald-700 font-mono mt-1">
            {healthyStockCount}
          </div>
          <span className="text-[10px] text-emerald-600 font-medium mt-0.5 block">Sufficient shelf level</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-amber-700 uppercase tracking-wider">Low Stock Warnings</span>
          <div className="text-lg sm:text-xl font-extrabold text-amber-700 font-mono mt-1">
            {lowStockCount}
          </div>
          <span className="text-[10px] text-amber-600 font-medium mt-0.5 block">Needs replenishment</span>
        </div>

        <div className="bg-white rounded-2xl p-4 border border-gray-200 shadow-2xs">
          <span className="text-[11px] font-semibold text-red-700 uppercase tracking-wider">Out of Stock</span>
          <div className="text-lg sm:text-xl font-extrabold text-red-700 font-mono mt-1">
            {outOfStockCount}
          </div>
          <span className="text-[10px] text-red-600 font-medium mt-0.5 block">Zero units remaining</span>
        </div>
      </div>

      {/* Filter and Search Bar */}
      <div className="bg-white rounded-2xl p-3 sm:p-4 border border-gray-200 shadow-2xs mb-4 flex flex-col md:flex-row gap-3 items-center justify-between">
        <div className="relative w-full md:w-80">
          <svg className="absolute left-3.5 top-3 h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search SKU name, category, or barcode..."
            className="w-full h-10 pl-10 pr-4 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
          />
        </div>

        {/* Status Filters */}
        <div className="flex items-center gap-1.5 self-start md:self-auto overflow-x-auto pb-1 md:pb-0 w-full md:w-auto">
          {(['All', 'In Stock', 'Low Stock', 'Out of Stock'] as const).map((st) => {
            const isSelected = stockStatusFilter === st;
            return (
              <button
                key={st}
                type="button"
                onClick={() => setStockStatusFilter(st)}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-all ${
                  isSelected
                    ? 'bg-primary text-primary-foreground shadow-xs'
                    : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                }`}
              >
                {st}
              </button>
            );
          })}
        </div>
      </div>

      {/* Inventory Table */}
      <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50/80 border-b border-gray-200 text-gray-600 font-semibold uppercase tracking-wider text-[10px]">
              <tr>
                <th className="py-3.5 px-4">Product / Item</th>
                <th className="py-3.5 px-4">Category</th>
                <th className="py-3.5 px-4">Barcode / SKU</th>
                <th className="py-3.5 px-4 text-right">Selling Price</th>
                <th className="py-3.5 px-4 text-center">Stock Level</th>
                <th className="py-3.5 px-4 text-center">Status</th>
                <th className="py-3.5 px-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 font-medium">
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={7} className="text-center py-10 text-gray-400">
                    No inventory products match the filter criteria.
                  </td>
                </tr>
              ) : (
                filtered.map((prod) => {
                  const isZero = prod.stock <= 0;
                  const isLow = prod.stock > 0 && prod.stock <= 5;

                  return (
                    <tr
                      key={prod.id}
                      className={`hover:bg-gray-50/80 transition-colors ${
                        isZero ? 'bg-red-50/20' : ''
                      }`}
                    >
                      <td className="py-3.5 px-4 font-semibold text-gray-900 max-w-[240px]">
                        <span className="truncate block">{prod.name}</span>
                        <span className="text-[10px] text-gray-400">{prod.variant || 'Standard Bottle'}</span>
                      </td>
                      <td className="py-3.5 px-4 whitespace-nowrap">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider text-gray-600 bg-gray-100">
                          {prod.category}
                        </span>
                      </td>
                      <td className="py-3.5 px-4 font-mono text-gray-500 whitespace-nowrap">
                        {prod.barcode || prod.id}
                      </td>
                      <td className="py-3.5 px-4 text-right font-mono font-bold text-sm text-primary whitespace-nowrap">
                        {formatKES(prod.price)}
                      </td>
                      <td className="py-3.5 px-4 text-center font-mono font-bold text-sm whitespace-nowrap">
                        <span className={isZero ? 'text-red-700' : isLow ? 'text-amber-700' : 'text-gray-900'}>
                          {prod.stock} units
                        </span>
                      </td>
                      <td className="py-3.5 px-4 text-center whitespace-nowrap">
                        {isZero ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-red-100 text-red-700 border border-red-200">
                            Out of Stock
                          </span>
                        ) : isLow ? (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            Low Stock
                          </span>
                        ) : (
                          <span className="inline-flex items-center px-2 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            In Stock
                          </span>
                        )}
                      </td>
                      <td className="py-3.5 px-4 text-right whitespace-nowrap">
                        <button
                          type="button"
                          onClick={() => setEditingProduct(prod)}
                          className="px-2.5 py-1 rounded-md bg-primary/10 text-primary hover:bg-primary/20 font-semibold transition-colors"
                        >
                          Adjust Stock
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* ── Edit Product / Stock Modal ── */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 sm:p-6 shadow-2xl border border-gray-200">
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Adjust Product &amp; Stock</h3>
                <p className="text-[11px] text-gray-500 truncate max-w-[280px]">{editingProduct.name}</p>
              </div>
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="text-gray-400 hover:text-gray-600 text-base font-bold"
              >
                ✕
              </button>
            </div>

            <div className="space-y-4 my-4">
              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Product Name</label>
                <input
                  type="text"
                  value={editingProduct.name}
                  onChange={(e) => setEditingProduct({ ...editingProduct, name: e.target.value })}
                  className="w-full h-10 px-3 bg-white border border-gray-300 rounded-xl text-xs font-semibold"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Selling Price (KES)</label>
                  <input
                    type="number"
                    value={editingProduct.price}
                    onChange={(e) => setEditingProduct({ ...editingProduct, price: parseFloat(e.target.value) || 0 })}
                    className="w-full h-10 px-3 bg-white border border-gray-300 rounded-xl text-xs font-mono font-bold"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">Current Stock (Units)</label>
                  <div className="flex items-center gap-1">
                    <button
                      type="button"
                      onClick={() => setEditingProduct({ ...editingProduct, stock: Math.max(0, editingProduct.stock - 1) })}
                      className="w-10 h-10 bg-gray-100 rounded-xl font-bold hover:bg-gray-200"
                    >
                      -
                    </button>
                    <input
                      type="number"
                      value={editingProduct.stock}
                      onChange={(e) => setEditingProduct({ ...editingProduct, stock: parseInt(e.target.value) || 0 })}
                      className="flex-1 h-10 px-2 text-center bg-white border border-gray-300 rounded-xl text-xs font-mono font-bold"
                    />
                    <button
                      type="button"
                      onClick={() => setEditingProduct({ ...editingProduct, stock: editingProduct.stock + 1 })}
                      className="w-10 h-10 bg-gray-100 rounded-xl font-bold hover:bg-gray-200"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-xs font-semibold text-gray-700 mb-1">Barcode / SKU Reference</label>
                <input
                  type="text"
                  value={editingProduct.barcode || ''}
                  onChange={(e) => setEditingProduct({ ...editingProduct, barcode: e.target.value })}
                  placeholder="e.g. 61611000101"
                  className="w-full h-10 px-3 bg-white border border-gray-300 rounded-xl text-xs font-mono"
                />
              </div>
            </div>

            <div className="pt-3 border-t border-gray-200 flex gap-2">
              <button
                type="button"
                onClick={() => setEditingProduct(null)}
                className="flex-1 h-10 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={() => handleSaveEdit(editingProduct)}
                className="flex-1 h-10 bg-primary text-primary-foreground rounded-xl text-xs font-bold hover:bg-wine-800 active:scale-98 shadow-sm"
              >
                Save Changes
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
