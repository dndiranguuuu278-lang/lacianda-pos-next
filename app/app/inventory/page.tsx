'use client';

import React, { useState } from 'react';
import Navbar from '@/app/components/Navbar';

const initialInventory = [
  { id: 1, barcode: '616110123456', name: 'Tusker Lager 500ml', category: 'Beer', price: 260, stock: 120, size: '500ml' },
  { id: 2, barcode: '616110654321', name: 'Guinness Extra Stout 330ml', category: 'Beer', price: 230, stock: 96, size: '330ml' },
  { id: 3, barcode: '616110987654', name: 'Beefeater London Dry Gin 750ml', category: 'Gin', price: 2200, stock: 24, size: '750ml' },
  { id: 4, barcode: '616110111222', name: 'Campari Bitter 1L', category: 'Aperitif', price: 3100, stock: 12, size: '1L' },
  { id: 5, barcode: '616110333444', name: 'Jameson Irish Whiskey 750ml', category: 'Whisky', price: 3200, stock: 18, size: '750ml' },
];

export default function InventoryPage() {
  const [inventory] = useState(initialInventory);
  const [search, setSearch] = useState('');

  const filteredInventory = inventory.filter(item =>
    item.name.toLowerCase().includes(search.toLowerCase()) ||
    item.category.toLowerCase().includes(search.toLowerCase()) ||
    item.barcode.includes(search)
  );

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="max-w-7xl w-full mx-auto p-6 space-y-6 flex-1">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-white">Stock Inventory Management</h1>
            <p className="text-xs text-slate-400 mt-1">Real-time overview of stock levels, pricing, and barcodes.</p>
          </div>
          <div className="w-full sm:w-72">
            <input
              type="text"
              placeholder="Search by name, category, barcode..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full px-3.5 py-2 border border-slate-700 bg-slate-900 text-slate-100 rounded-xl text-xs focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="bg-slate-800/50 border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase tracking-wider">
                  <th className="py-3.5 px-4">Barcode</th>
                  <th className="py-3.5 px-4">Product Name</th>
                  <th className="py-3.5 px-4">Category</th>
                  <th className="py-3.5 px-4">Size</th>
                  <th className="py-3.5 px-4">Price (KES)</th>
                  <th className="py-3.5 px-4">Stock Qty</th>
                  <th className="py-3.5 px-4">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800 text-slate-300">
                {filteredInventory.length === 0 ? (
                  <tr>
                    <td colSpan={7} className="text-center py-8 text-xs text-slate-500">
                      No matching inventory items found.
                    </td>
                  </tr>
                ) : (
                  filteredInventory.map((item) => (
                    <tr key={item.id} className="hover:bg-slate-800/40 transition-colors">
                      <td className="py-3.5 px-4 font-mono text-xs text-slate-400">{item.barcode}</td>
                      <td className="py-3.5 px-4 font-semibold text-white">{item.name}</td>
                      <td className="py-3.5 px-4 text-xs text-amber-400">{item.category}</td>
                      <td className="py-3.5 px-4 text-xs text-slate-400">{item.size}</td>
                      <td className="py-3.5 px-4 font-medium text-slate-200">KES {item.price.toLocaleString()}</td>
                      <td className="py-3.5 px-4 font-bold text-amber-500">{item.stock} units</td>
                      <td className="py-3.5 px-4 text-xs">
                        <span className={`px-2.5 py-0.5 rounded-full font-medium ${
                          item.stock > 20 ? 'bg-emerald-950 text-emerald-400 border border-emerald-900/50' : 'bg-amber-950 text-amber-400 border border-amber-900/50'
                        }`}>
                          {item.stock > 20 ? 'In Stock' : 'Low Stock'}
                        </span>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </main>
    </div>
  );
}
