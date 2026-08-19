'use client';

import React, { useState } from 'react';
import Navbar from '../components/Navbar';

export default function InventoryPage() {
  const [inventory] = useState([
    { id: 1, name: 'Tusker Lager 500ml', category: 'Beer', stock: 45, price: 250 },
    { id: 2, name: 'Guinness Extra Stout 330ml', category: 'Beer', stock: 30, price: 280 },
    { id: 3, name: 'Beefeater London Dry Gin 750ml', category: 'Gin', stock: 12, price: 2200 },
    { id: 4, name: 'Campari Bitter 1L', category: 'Aperitif', stock: 8, price: 3500 },
    { id: 5, name: 'Jameson Irish Whiskey 750ml', category: 'Whiskey', stock: 15, price: 3000 },
    { id: 6, name: 'Keringet Mineral Water 500ml', category: 'Water', stock: 120, price: 50 },
  ]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Inventory Management</h1>
        
        <div className="bg-white shadow-md rounded-lg overflow-hidden">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-100">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Item Name</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Stock Qty</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Price (KES)</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {inventory.map((item) => (
                <tr key={item.id}>
                  <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">{item.name}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.category}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">{item.stock}</td>
                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">KES {item.price}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
