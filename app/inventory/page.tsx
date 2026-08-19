'use client';
import { useState, useEffect } from 'react';
import Navbar from '../components/Navbar';

export default function InventoryPage() {
  const [inventory, setInventory] = useState<any[]>([]);

  useEffect(() => {
    setInventory(JSON.parse(localStorage.getItem('lacianda_inventory') || '[]'));
  }, []);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const text = event.target?.result as string;
      const lines = text.split('\n');
      const newItems = [];

      // Skip header row and parse CSV: name,category,price,stock
      for (let i = 1; i < lines.length; i++) {
        const line = lines[i].trim();
        if (!line) continue;
        const [name, category, price, stock] = line.split(',').map(val => val.trim());
        if (name && price && stock) {
          newItems.push({
            id: `${Date.now()}-${i}`,
            name,
            category: category || 'General',
            price: Number(price) || 0,
            stock: Number(stock) || 0,
          });
        }
      }

      if (newItems.length > 0) {
        const updated = [...inventory, ...newItems];
        setInventory(updated);
        localStorage.setItem('lacianda_inventory', JSON.stringify(updated));
        alert(`Successfully imported ${newItems.length} products!`);
      } else {
        alert('Could not parse CSV. Ensure format is: name,category,price,stock');
      }
    };
    reader.readAsText(file);
  };

  const lowStockItems = inventory.filter(i => i.stock <= 5);

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      {lowStockItems.length > 0 && (
        <div className="bg-orange-50 border-b border-orange-200 text-orange-800 px-4 py-2 text-xs font-medium text-center">
          ⚠️ Low stock warning: {lowStockItems.length} item(s) need restocking.
        </div>
      )}

      <main className="max-w-6xl mx-auto p-4 md:p-6 space-y-6">
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div>
            <h1 className="text-xl font-bold">Inventory Management</h1>
            <p className="text-xs text-gray-500 mt-0.5">Manage your stock levels or import bulk items via CSV.</p>
          </div>
          
          <div className="flex items-center space-x-3">
            <label className="cursor-pointer px-4 py-2 bg-[#78350f] text-white rounded-md text-xs font-semibold hover:bg-[#60280b] transition-colors shadow-sm">
              <span>Import CSV Dataset</span>
              <input type="file" accept=".csv" onChange={handleFileUpload} className="hidden" />
            </label>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
          <table className="w-full text-left text-xs">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                <th className="px-6 py-3 font-semibold text-gray-700">Product</th>
                <th className="px-6 py-3 font-semibold text-gray-700">Category</th>
                <th className="px-6 py-3 font-semibold text-gray-700">Stock</th>
                <th className="px-6 py-3 font-semibold text-gray-700">Price (KES)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {inventory.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-6 py-8 text-center text-gray-400">No inventory items found. Import a CSV or add items manually.</td>
                </tr>
              ) : (
                inventory.map((item) => (
                  <tr key={item.id} className={item.stock <= 5 ? 'bg-orange-50/30' : ''}>
                    <td className="px-6 py-3 font-medium text-gray-900">{item.name}</td>
                    <td className="px-6 py-3 text-gray-600">{item.category}</td>
                    <td className={`px-6 py-3 font-mono font-bold ${item.stock <= 5 ? 'text-red-600' : 'text-gray-900'}`}>
                      {item.stock}
                    </td>
                    <td className="px-6 py-3 font-mono">KES {item.price.toLocaleString()}</td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
