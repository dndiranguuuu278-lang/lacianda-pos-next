'use client';

import React, { useState } from 'react';
import Navbar from './components/Navbar';

export default function POSPage() {
  const [cart, setCart] = useState<any[]>([]);
  const [activeCategory, setActiveCategory] = useState('All');
  const [paymentMethod, setPaymentMethod] = useState('STK');
  const [phoneNumber, setPhoneNumber] = useState('0720087714');
  const [saleComplete, setSaleComplete] = useState(false);

  const products = [
    { id: 1, name: 'Tusker Lager 500ml', category: 'Beer', type: 'Single Bottle', price: 260 },
    { id: 2, name: 'Tusker Lager 500ml', category: 'Beer', type: 'Full Crate (20)', price: 5200 },
    { id: 3, name: 'Guinness Extra Stout 330ml', category: 'Beer', type: 'Single Bottle', price: 230 },
    { id: 4, name: 'Guinness Extra Stout 330ml', category: 'Beer', type: 'Full Crate (24)', price: 5520 },
    { id: 5, name: 'Beefeater London Dry Gin 750ml', category: 'Gin', type: 'Single Bottle', price: 2200 },
    { id: 6, name: 'Campari Bitter 1L', category: 'Aperitif', type: 'Single Bottle', price: 3100 },
    { id: 7, name: 'Jameson Irish Whiskey 750ml', category: 'Whisky', type: 'Single Bottle', price: 3200 },
  ];

  const filteredProducts = activeCategory === 'All' 
    ? products 
    : products.filter(p => p.category === activeCategory);

  const addToCart = (product: any) => {
    setCart(prev => {
      const existing = prev.find(item => item.id === product.id && item.type === product.type);
      if (existing) {
        return prev.map(item => 
          item.id === product.id && item.type === product.type 
            ? { ...item, qty: item.qty + 1 } 
            : item
        );
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const totalDue = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);

  const handleCompleteSale = () => {
    if (cart.length === 0) return;
    alert(`Sale Complete! Processed via ${paymentMethod} for ${phoneNumber || 'Cash'}. Total: KES ${totalDue.toLocaleString()}`);
    setCart([]);
    setSaleComplete(true);
    setTimeout(() => setSaleComplete(false), 3000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <main className="max-w-7xl w-full mx-auto p-6 flex-1 grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Catalog Section */}
        <div className="lg:col-span-2 space-y-6">
          <div>
            <h1 className="text-xl font-bold text-white tracking-wide">Till & Quick Tap Catalog</h1>
            <p className="text-xs text-slate-400 mt-0.5">Sell beers by single bottle or full crate instantly</p>
          </div>

          {/* Categories */}
          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {['All', 'Beer', 'Gin', 'Whisky', 'Wine', 'Aperitif'].map(cat => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-4 py-1.5 rounded-full text-xs font-semibold transition-colors ${
                  activeCategory === cat 
                    ? 'bg-amber-600 text-white shadow-sm' 
                    : 'bg-slate-900 border border-slate-800 text-slate-400 hover:text-white hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Product Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {filteredProducts.map(product => (
              <div 
                key={`${product.id}-${product.type}`}
                onClick={() => addToCart(product)}
                className="bg-slate-900 border border-slate-800 hover:border-amber-600/50 p-4 rounded-2xl cursor-pointer transition-all shadow-sm flex flex-col justify-between"
              >
                <div>
                  <span className="text-[10px] font-mono text-amber-500 uppercase tracking-wider">{product.category} • {product.type}</span>
                  <h3 className="text-sm font-semibold text-white mt-1">{product.name}</h3>
                </div>
                <div className="mt-4 flex items-center justify-between">
                  <span className="text-xs text-slate-400">{product.type}</span>
                  <span className="text-sm font-bold text-amber-400">KES {product.price.toLocaleString()}</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Current Order & Payment Section */}
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-5 flex flex-col justify-between shadow-sm">
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white border-b border-slate-800 pb-3">Current Order</h2>
            
            {cart.length === 0 ? (
              <div className="py-8 text-center text-xs text-slate-500">
                Cart is empty. Select items on the left.
              </div>
            ) : (
              <div className="space-y-3 max-h-56 overflow-y-auto pr-1">
                {cart.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-slate-950/50 border border-slate-800/80 p-3 rounded-xl text-xs">
                    <div>
                      <p className="font-semibold text-white">{item.name}</p>
                      <p className="text-[10px] text-slate-400">{item.type} × {item.qty}</p>
                    </div>
                    <span className="font-bold text-amber-400">KES {(item.price * item.qty).toLocaleString()}</span>
                  </div>
                ))}
              </div>
            )}

            {/* Payment Methods Section */}
            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="text-[11px] font-semibold text-slate-400 uppercase tracking-wider block">
                Payment Method
              </label>
              <div className="grid grid-cols-3 gap-2">
                {['STK', 'TILL', 'PAYBILL', 'POCHI', 'PERSONAL', 'CASH'].map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setPaymentMethod(mode)}
                    className={`py-2 rounded-xl text-xs font-bold transition-all border ${
                      paymentMethod === mode
                        ? 'bg-amber-600 text-white border-amber-500 shadow-sm'
                        : 'bg-slate-950 text-slate-400 border-slate-800 hover:border-slate-700 hover:text-white'
                    }`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              {paymentMethod !== 'CASH' && (
                <div className="pt-2">
                  <label className="text-[10px] text-slate-400 block mb-1 font-mono">Customer Phone Number</label>
                  <input
                    type="text"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-3 py-2 bg-slate-950 border border-slate-700 rounded-xl text-xs text-amber-400 font-mono focus:outline-none focus:ring-2 focus:ring-amber-600"
                    placeholder="07XXXXXXXX"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="border-t border-slate-800 pt-4 mt-4 space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs text-slate-400 font-medium">Total Due:</span>
              <span className="text-lg font-extrabold text-amber-400">KES {totalDue.toLocaleString()}</span>
            </div>
            <button
              onClick={handleCompleteSale}
              disabled={cart.length === 0}
              className={`w-full py-3 rounded-xl text-xs font-bold transition-all shadow-md ${
                cart.length === 0 
                  ? 'bg-slate-800 text-slate-500 cursor-not-allowed' 
                  : 'bg-amber-600 hover:bg-amber-500 text-white cursor-pointer'
              }`}
            >
              {saleComplete ? 'Sale Recorded Successfully!' : `Complete Sale (${paymentMethod})`}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
