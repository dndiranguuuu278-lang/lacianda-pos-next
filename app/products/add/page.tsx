'use client';

import React, { useState } from 'react';
import Navbar from '@/app/components/Navbar';

export default function AddProductPage() {
  const [productName, setProductName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('');
  const [size, setSize] = useState('');
  const [isCrateItem, setIsCrateItem] = useState(false);
  const [crateCapacity, setCrateCapacity] = useState('20');
  const [priceKes, setPriceKes] = useState('');
  const [stock, setStock] = useState('');
  const [barcode, setBarcode] = useState('');

  const handleProductNameChange = (val: string) => {
    setProductName(val);
    const lower = val.toLowerCase();

    if (lower.includes('tusker')) setBrand('Tusker');
    else if (lower.includes('guinness')) setBrand('Guinness');
    else if (lower.includes('beefeater')) setBrand('Beefeater');
    else if (lower.includes('jameson')) setBrand('Jameson');
    else if (lower.includes('campari')) setBrand('Campari');
    else if (lower.includes('smirnoff')) setBrand('Smirnoff');
    else setBrand('');

    if (lower.includes('beer') || lower.includes('tusker') || lower.includes('guinness') || lower.includes('stout')) {
      setCategory('Beer');
    } else if (lower.includes('gin') || lower.includes('beefeater')) {
      setCategory('Gin');
    } else if (lower.includes('whiskey') || lower.includes('whisky') || lower.includes('jameson')) {
      setCategory('Whisky');
    } else if (lower.includes('wine')) {
      setCategory('Wine');
    } else {
      setCategory('Spirits');
    }

    if (lower.includes('500ml')) setSize('500ml');
    else if (lower.includes('330ml')) setSize('330ml');
    else if (lower.includes('750ml')) setSize('750ml');
    else if (lower.includes('1l') || lower.includes('1000ml')) setSize('1L');

    if (lower.includes('crate') || lower.includes('case')) {
      setIsCrateItem(true);
    }
  };

  const handleSaveProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!productName || !priceKes) {
      alert('Please fill in at least the product name and price.');
      return;
    }
    alert(`Successfully added "${productName}" (${category} - ${size}) with price KES ${priceKes}!`);
    setProductName('');
    setBrand('');
    setCategory('');
    setSize('');
    setPriceKes('');
    setStock('');
    setBarcode('');
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <Navbar />
      <main className="max-w-3xl mx-auto p-6 space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Add New Product</h1>
          <p className="text-xs text-slate-400 mt-1">Smart auto-detector will fill out brand, category, size, and crate configuration as you type.</p>
        </div>

        <form onSubmit={handleSaveProduct} className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm space-y-5">
          <div>
            <label className="block text-xs font-semibold text-slate-300 mb-1">Product Name *</label>
            <input
              type="text"
              placeholder="e.g. Tusker Lager 500ml Crate or Beefeater 750ml"
              value={productName}
              onChange={(e) => handleProductNameChange(e.target.value)}
              className="w-full px-3.5 py-2.5 border border-slate-700 bg-slate-800 text-slate-100 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-amber-600"
            />
            <span className="text-[11px] text-amber-500 mt-1 block">💡 Typing brand names and sizes auto-configures the fields below.</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Auto-Detected Brand</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Tusker"
                className="w-full px-3 py-2 border border-slate-700 bg-slate-800 text-slate-100 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full px-3 py-2 border border-slate-700 bg-slate-800 text-slate-100 rounded-lg text-sm"
              >
                <option value="">Select Category</option>
                <option value="Beer">Beer</option>
                <option value="Gin">Gin</option>
                <option value="Whisky">Whisky</option>
                <option value="Wine">Wine</option>
                <option value="Spirits">Spirits</option>
              </select>
            </div>

            <div>
              <label className="block text-xs font-medium text-slate-400 mb-1">Size / Volume</label>
              <input
                type="text"
                value={size}
                onChange={(e) => setSize(e.target.value)}
                placeholder="e.g. 500ml, 750ml"
                className="w-full px-3 py-2 border border-slate-700 bg-slate-800 text-slate-100 rounded-lg text-sm"
              />
            </div>
          </div>

          <div className="bg-slate-800/50 border border-slate-800 p-4 rounded-xl space-y-3">
            <div className="flex items-center justify-between">
              <div>
                <span className="text-sm font-medium text-slate-200 block">Beer Crate Configuration</span>
                <span className="text-xs text-slate-400">Enable if this item is sold or tracked by full crates/cases.</span>
              </div>
              <input
                type="checkbox"
                checked={isCrateItem}
                onChange={() => setIsCrateItem(!isCrateItem)}
                className="h-4 w-4 rounded border-slate-700 bg-slate-800 text-amber-700 focus:ring-amber-700"
              />
            </div>

            {isCrateItem && (
              <div className="pt-2 border-t border-slate-800 flex items-center gap-4">
                <div className="flex-1">
                  <label className="block text-xs font-medium text-slate-400 mb-1">Bottles per Crate</label>
                  <select
                    value={crateCapacity}
                    onChange={(e) => setCrateCapacity(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-700 bg-slate-800 text-slate-100 rounded-lg text-xs"
                  >
                    <option value="20">20 Bottles (Standard Crate)</option>
                    <option value="25">25 Bottles</option>
                    <option value="12">12 Bottles (Pack)</option>
                  </select>
                </div>
              </div>
            )}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Price (KES) *</label>
              <input
                type="number"
                value={priceKes}
                onChange={(e) => setPriceKes(e.target.value)}
                placeholder="e.g. 260"
                className="w-full px-3 py-2 border border-slate-700 bg-slate-800 text-slate-100 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Initial Stock</label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                placeholder="e.g. 50"
                className="w-full px-3 py-2 border border-slate-700 bg-slate-800 text-slate-100 rounded-lg text-sm"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-slate-300 mb-1">Barcode</label>
              <input
                type="text"
                value={barcode}
                onChange={(e) => setBarcode(e.target.value)}
                placeholder="Scan barcode"
                className="w-full px-3 py-2 border border-slate-700 bg-slate-800 text-slate-100 rounded-lg text-sm font-mono"
              />
            </div>
          </div>

          <div className="pt-2">
            <button
              type="submit"
              className="w-full bg-amber-700 hover:bg-amber-600 text-white font-bold py-3 rounded-xl transition-colors shadow-sm text-sm"
            >
              Save Product to Inventory
            </button>
          </div>
        </form>
      </main>
    </div>
  );
}
