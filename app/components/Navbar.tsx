'use client';
import { useState } from 'react';
import Navbar from '../../components/Navbar'; // Correct relative depth from app/products/add/
// OR use: import Navbar from '@/components/Navbar';

export default function AddProductPage() {
  const [formData, setFormData] = useState({ name: '', category: '', price: '', stock: '' });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const inventory = JSON.parse(localStorage.getItem('lacianda_inventory') || '[]');
    const newItem = { 
        ...formData, 
        id: Date.now().toString(), 
        price: Number(formData.price), 
        stock: Number(formData.stock) 
    };
    localStorage.setItem('lacianda_inventory', JSON.stringify([...inventory, newItem]));
    alert('Product added successfully!');
    setFormData({ name: '', category: '', price: '', stock: '' });
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />
      <main className="max-w-lg mx-auto p-4 md:p-6">
        <h1 className="text-xl font-bold mb-6">Add New Product</h1>
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg border border-gray-200 shadow-sm space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Product Name</label>
            <input required type="text" className="w-full px-3 py-2 border rounded-md text-sm" value={formData.name} onChange={e => setFormData({...formData, name: e.target.value})} />
          </div>
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">Category</label>
            <input required type="text" placeholder="e.g. Spirit, Whisky, Beer" className="w-full px-3 py-2 border rounded-md text-sm" value={formData.category} onChange={e => setFormData({...formData, category: e.target.value})} />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Price (KES)</label>
              <input required type="number" className="w-full px-3 py-2 border rounded-md text-sm" value={formData.price} onChange={e => setFormData({...formData, price: e.target.value})} />
            </div>
            <div>
              <label className="block text-xs font-medium text-gray-700 mb-1">Initial Stock</label>
              <input required type="number" className="w-full px-3 py-2 border rounded-md text-sm" value={formData.stock} onChange={e => setFormData({...formData, stock: e.target.value})} />
            </div>
          </div>
          <button className="w-full py-2.5 bg-[#78350f] text-white rounded-md text-sm font-semibold hover:bg-[#60280b]">Save Product</button>
        </form>
      </main>
    </div>
  );
}
