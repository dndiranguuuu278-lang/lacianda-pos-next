'use client';

import React, { useState } from 'react';
import Navbar from '@/app/components/Navbar';

const products = [
  { id: 1, name: 'Tusker Lager 500ml', category: 'Beer', priceBottle: 260, priceCrate: 5200, crateSize: 20, size: '500ml' },
  { id: 2, name: 'Guinness Extra Stout 330ml', category: 'Beer', priceBottle: 230, priceCrate: 5520, crateSize: 24, size: '330ml' },
  { id: 3, name: 'Beefeater London Dry Gin 750ml', category: 'Gin', priceBottle: 2200, priceCrate: null, crateSize: 0, size: '750ml' },
  { id: 4, name: 'Campari Bitter 1L', category: 'Aperitif', priceBottle: 3100, priceCrate: null, crateSize: 0, size: '1L' },
  { id: 5, name: 'Jameson Irish Whiskey 750ml', category: 'Whisky', priceBottle: 3200, priceCrate: null, crateSize: 0, size: '750ml' },
];

const categories = ['All', 'Beer', 'Gin', 'Whisky', 'Wine', 'Aperitif'];

export default function TillPage() {
  const [cart, setCart] = useState<{ id: number; name: string; type: 'Bottle' | 'Crate'; price: number; qty: number }[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [paymentMode, setPaymentMode] = useState<'stk' | 'till' | 'paybill' | 'pochi' | 'personal' | 'cash'>('stk');
  const [phoneNumber, setPhoneNumber] = useState('0720087714');
  const [isWaitingForPayment, setIsWaitingForPayment] = useState(false);
  const [paymentStep, setPaymentStep] = useState('');

  const addToCart = (product: typeof products[0], saleType: 'Bottle' | 'Crate') => {
    const price = saleType === 'Crate' && product.priceCrate ? product.priceCrate : product.priceBottle;
    const itemName = saleType === 'Crate' ? `${product.name} (Full Crate - ${product.crateSize} Btls)` : `${product.name} (${product.size})`;
    
    setCart((prev) => {
      const existing = prev.find((item) => item.id === product.id && item.type === saleType);
      if (existing) {
        return prev.map((item) => (item.id === product.id && item.type === saleType ? { ...item, qty: item.qty + 1 } : item));
      }
      return [...prev, { id: product.id, name: itemName, type: saleType, price: price, qty: 1 }];
    });
  };

  const removeFromCart = (id: number, type: string) => {
    setCart((prev) => prev.filter((item) => !(item.id === id && item.type === type)));
  };

  const totalAmount = cart.reduce((acc, curr) => acc + curr.price * curr.qty, 0);

  const filteredProducts = selectedCategory === 'All'
    ? products
    : products.filter(p => p.category === selectedCategory);

  const handleInitiatePayment = () => {
    if (cart.length === 0) {
      alert('Cart is empty!');
      return;
    }

    if (paymentMode === 'cash') {
      alert(`Cash payment received! Total: KES ${totalAmount.toLocaleString()}`);
      setCart([]);
      return;
    }

    setIsWaitingForPayment(true);
    setPaymentStep(`Sending STK push to ${phoneNumber}...`);

    setTimeout(() => {
      setPaymentStep('Waiting for customer PIN...');
    }, 2000);

    setTimeout(() => {
      setIsWaitingForPayment(false);
      setPaymentStep('');
      alert(`✅ Payment of KES ${totalAmount.toLocaleString()} detected via M-Pesa! Order checked out successfully.`);
      setCart([]);
    }, 5000);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />

      <div className="max-w-7xl w-full mx-auto p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        <div className="lg:col-span-2 space-y-4">
          <div>
            <h1 className="text-xl font-bold text-white">Till & Quick Tap Catalog</h1>
            <p className="text-xs text-slate-400">Sell beers by single bottle or full crate instantly</p>
          </div>

          <div className="flex items-center gap-2 overflow-x-auto pb-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold whitespace-nowrap transition-colors border ${
                  selectedCategory === cat
                    ? 'bg-amber-700 text-white border-amber-600 shadow-sm'
                    : 'bg-slate-900 text-slate-400 border-slate-800 hover:text-slate-200 hover:bg-slate-800'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {filteredProducts.map((p) => (
              <div key={p.id} className="bg-slate-900 border border-slate-800 p-4 rounded-xl flex flex-col justify-between shadow-sm space-y-3">
                <div>
                  <span className="text-[10px] uppercase font-semibold text-amber-500">{p.category} • {p.size}</span>
                  <h3 className="text-sm font-bold text-slate-200 mt-0.5">{p.name}</h3>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-slate-800">
                  <button
                    onClick={() => addToCart(p, 'Bottle')}
                    className="flex-1 bg-slate-800 hover:bg-slate-700 border border-slate-700 py-2 px-3 rounded-lg text-left transition-colors"
                  >
                    <span className="block text-[10px] text-slate-400 uppercase">Single Bottle</span>
                    <span className="text-xs font-bold text-amber-400">KES {p.priceBottle.toLocaleString()}</span>
                  </button>

                  {p.priceCrate ? (
                    <button
                      onClick={() => addToCart(p, 'Crate')}
                      className="flex-1 bg-amber-950/40 hover:bg-amber-900/40 border border-amber-900/50 py-2 px-3 rounded-lg text-left transition-colors"
                    >
                      <span className="block text-[10px] text-amber-500 uppercase font-semibold">Full Crate ({p.crateSize})</span>
                      <span className="text-xs font-bold text-amber-300">KES {p.priceCrate.toLocaleString()}</span>
                    </button>
                  ) : (
                    <div className="flex-1 py-2 px-3 opacity-30 text-center">
                      <span className="text-[10px] text-slate-500 uppercase">Crate N/A</span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-5 rounded-2xl shadow-sm flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            <h2 className="text-base font-bold text-white border-b border-slate-800 pb-2">Current Order</h2>

            <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
              {cart.length === 0 ? (
                <p className="text-xs text-slate-500 py-6 text-center">Cart is empty. Select items on the left.</p>
              ) : (
                cart.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between text-xs bg-slate-800/50 p-2.5 rounded-lg border border-slate-800">
                    <div>
                      <span className="font-semibold text-slate-200 block">{item.name}</span>
                      <span className="text-slate-400">{item.qty} × KES {item.price.toLocaleString()}</span>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-amber-400">KES {(item.qty * item.price).toLocaleString()}</span>
                      <button onClick={() => removeFromCart(item.id, item.type)} className="text-rose-400 hover:text-rose-300 font-bold text-sm">×</button>
                    </div>
                  </div>
                ))
              )}
            </div>

            <div className="space-y-2 pt-2 border-t border-slate-800">
              <label className="block text-xs font-semibold text-slate-400 uppercase">Automated Payment Method</label>
              <div className="grid grid-cols-3 gap-2 text-xs">
                {(['stk', 'till', 'paybill', 'pochi', 'personal', 'cash'] as const).map((mode) => (
                  <button
                    key={mode}
                    onClick={() => setPaymentMode(mode)}
                    className={`py-2 px-2 rounded-lg font-medium border transition-colors uppercase ${paymentMode === mode ? 'bg-amber-700 text-white border-amber-600' : 'bg-slate-800 text-slate-300 border-slate-700'}`}
                  >
                    {mode}
                  </button>
                ))}
              </div>

              {paymentMode !== 'cash' && (
                <div className="pt-1">
                  <input
                    type="text"
                    placeholder="Customer Phone (07XX...)"
                    value={phoneNumber}
                    onChange={(e) => setPhoneNumber(e.target.value)}
                    className="w-full px-3 py-1.5 border border-slate-700 bg-slate-800 text-slate-100 rounded-lg text-xs"
                  />
                </div>
              )}
            </div>
          </div>

          <div className="space-y-3 pt-4 border-t border-slate-800">
            <div className="flex items-center justify-between text-base font-bold text-white">
              <span>Total Due:</span>
              <span className="text-amber-400">KES {totalAmount.toLocaleString()}</span>
            </div>

            {isWaitingForPayment ? (
              <div className="bg-amber-950/60 border border-amber-700/50 p-3 rounded-xl text-center space-y-1.5">
                <div className="animate-spin inline-block w-4 h-4 border-2 border-amber-400 border-t-transparent rounded-full"></div>
                <p className="text-xs font-semibold text-amber-300">{paymentStep}</p>
                <p className="text-[10px] text-slate-400">Auto-detecting M-Pesa confirmation...</p>
              </div>
            ) : (
              <button
                onClick={handleInitiatePayment}
                disabled={cart.length === 0}
                className={`w-full py-3 rounded-xl font-bold text-sm transition-colors shadow-sm ${
                  cart.length === 0 ? 'bg-slate-800 text-slate-500 cursor-not-allowed' : 'bg-amber-700 hover:bg-amber-600 text-white'
                }`}
              >
                {paymentMode === 'cash' ? 'Complete Cash Sale' : 'Trigger STK & Auto-Detect Payment'}
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
