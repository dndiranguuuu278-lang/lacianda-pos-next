'use client';
import { useState, useEffect } from 'react';

export default function TillPage() {
  const [inventory, setInventory] = useState<any[]>([]);
  const [cart, setCart] = useState<any[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [paymentModal, setPaymentModal] = useState(false);
  const [tenderType, setTenderType] = useState('Cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [receiptSuccess, setReceiptSuccess] = useState<any | null>(null);

  useEffect(() => {
    const storedInventory = localStorage.getItem('lacianda_inventory');
    if (storedInventory) {
      setInventory(JSON.parse(storedInventory));
    } else {
      const defaultItems = [
        { id: '1', name: 'Kenya Cane 750ml', category: 'Spirit', price: 750, stock: 24 },
        { id: '2', name: 'Gilbeys Gin 750ml', category: 'Gin', price: 1200, stock: 3 },
        { id: '3', name: 'Chrome Vodka 750ml', category: 'Vodka', price: 650, stock: 30 },
        { id: '4', name: 'Black & White Whisky 750ml', category: 'Whisky', price: 1600, stock: 4 },
        { id: '5', name: 'Tusker Lager 500ml', category: 'Beer', price: 220, stock: 50 },
        { id: '6', name: 'Keringet Drinking Water 1L', category: 'Water', price: 100, stock: 100 },
      ];
      setInventory(defaultItems);
      localStorage.setItem('lacianda_inventory', JSON.stringify(defaultItems));
    }
  }, []);

  const lowStockItems = inventory.filter(i => i.stock <= 5);
  const categories = ['All', 'Spirit', 'Gin', 'Vodka', 'Whisky', 'Beer', 'Water'];

  const filteredProducts = inventory.filter(item => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: any) => {
    if (product.stock <= 0) return;
    setCart(prev => {
      const existing = prev.find(i => i.id === product.id);
      if (existing) {
        return prev.map(i => i.id === product.id ? { ...i, qty: i.qty + 1 } : i);
      }
      return [...prev, { ...product, qty: 1 }];
    });
  };

  const updateQty = (id: string, delta: number) => {
    setCart(prev => prev.map(i => {
      if (i.id === id) {
        const newQty = i.qty + delta;
        return newQty > 0 ? { ...i, qty: newQty } : null;
      }
      return i;
    }).filter(Boolean));
  };

  const subtotal = cart.reduce((sum, item) => sum + (item.price * item.qty), 0);
  const vat = Math.round(subtotal * (16 / 116));

  const handleCompleteSale = () => {
    const saleId = `LWS-${Date.now().toString().slice(-8)}`;
    const newSale = {
      id: saleId,
      timestamp: new Date().toISOString(),
      items: cart,
      total: subtotal,
      tender: tenderType,
      status: 'Completed',
    };

    const existingSales = JSON.parse(localStorage.getItem('lacianda_pos_sales') || '[]');
    localStorage.setItem('lacianda_pos_sales', JSON.stringify([newSale, ...existingSales]));

    const updatedInventory = inventory.map(prod => {
      const cartItem = cart.find(ci => ci.id === prod.id);
      if (cartItem) {
        return { ...prod, stock: Math.max(0, prod.stock - cartItem.qty) };
      }
      return prod;
    });
    setInventory(updatedInventory);
    localStorage.setItem('lacianda_inventory', JSON.stringify(updatedInventory));

    setReceiptSuccess(newSale);
    setCart([]);
    setPaymentModal(false);
    setAmountPaid('');
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900 flex flex-col">

      {lowStockItems.length > 0 && (
        <div className="bg-orange-50 border-b border-orange-200 text-orange-800 px-4 py-2 text-xs font-medium text-center">
          ⚠️ Low stock warning: {lowStockItems.length} item(s) have 5 or fewer units remaining.
        </div>
      )}
      
      <main className="flex-1 max-w-7xl w-full mx-auto p-4 md:p-6 grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 space-y-4">
          <input
            type="text"
            placeholder="Search products or scan barcode..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full px-4 py-2.5 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#78350f]"
          />

          <div className="flex gap-2 overflow-x-auto pb-2">
            {categories.map(cat => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-colors ${
                  selectedCategory === cat ? 'bg-[#78350f] text-white' : 'bg-white border border-gray-300 text-gray-700 hover:bg-gray-100'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {filteredProducts.map(product => (
              <button
                key={product.id}
                disabled={product.stock <= 0}
                onClick={() => addToCart(product)}
                className={`p-4 bg-white rounded-lg border text-left flex flex-col justify-between transition-all ${
                  product.stock > 0 ? 'border-gray-200 hover:border-[#78350f] hover:shadow-sm cursor-pointer' : 'border-gray-200 opacity-50 cursor-not-allowed bg-gray-100'
                }`}
              >
                <div>
                  <span className="text-[10px] font-semibold text-gray-400 uppercase tracking-wider">{product.category}</span>
                  <h3 className="text-sm font-bold text-gray-900 mt-1 line-clamp-2">{product.name}</h3>
                </div>
                <div className="mt-4 flex justify-between items-end">
                  <span className="text-sm font-mono font-bold text-[#78350f]">KES {product.price.toLocaleString()}</span>
                  <span className={`text-[11px] font-medium px-2 py-0.5 rounded ${product.stock > 5 ? 'bg-green-50 text-green-700' : product.stock > 0 ? 'bg-orange-50 text-orange-700' : 'bg-red-50 text-red-700'}`}>
                    {product.stock > 0 ? `${product.stock} left` : 'Out'}
                  </span>
                </div>
              </button>
            ))}
          </div>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 p-4 flex flex-col justify-between h-[calc(100vh-160px)] sticky top-20">
          <div>
            <div className="flex justify-between items-center border-b pb-3 mb-3">
              <h2 className="text-sm font-bold uppercase tracking-wide text-gray-700">Current sale</h2>
              <button onClick={() => setCart([])} className="text-xs text-red-600 hover:underline">Clear</button>
            </div>

            <div className="space-y-3 overflow-y-auto max-h-[calc(100vh-380px)] pr-1">
              {cart.length === 0 ? (
                <p className="text-center text-gray-400 text-xs py-12">Cart is empty. Select items to begin.</p>
              ) : (
                cart.map(item => (
                  <div key={item.id} className="flex justify-between items-center bg-gray-50 p-2.5 rounded-md">
                    <div className="flex-1 pr-2">
                      <p className="text-xs font-semibold text-gray-800">{item.name}</p>
                      <p className="text-[11px] text-gray-500 font-mono">KES {item.price.toLocaleString()} each</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button onClick={() => updateQty(item.id, -1)} className="w-6 h-6 bg-white border rounded text-xs font-bold flex items-center justify-center">-</button>
                      <span className="text-xs font-mono font-semibold w-5 text-center">{item.qty}</span>
                      <button onClick={() => updateQty(item.id, 1)} className="w-6 h-6 bg-white border rounded text-xs font-bold flex items-center justify-center">+</button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          <div className="border-t pt-4 space-y-2">
            <div className="flex justify-between text-xs text-gray-500">
              <span>VAT (16% Incl.)</span>
              <span className="font-mono">KES {vat.toLocaleString()}</span>
            </div>
            <div className="flex justify-between text-base font-bold text-gray-900">
              <span>Total due</span>
              <span className="font-mono text-[#78350f]">KES {subtotal.toLocaleString()}</span>
            </div>
            <button
              disabled={cart.length === 0}
              onClick={() => setPaymentModal(true)}
              className="w-full mt-2 py-3 bg-[#78350f] text-white rounded-lg text-sm font-bold hover:bg-[#60280b] disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors"
            >
              Charge KES {subtotal.toLocaleString()}
            </button>
          </div>
        </div>
      </main>

      {paymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-md w-full p-6 shadow-xl space-y-4">
            <h3 className="text-lg font-bold">Select payment method</h3>
            <div className="grid grid-cols-2 gap-2">
              {['Cash', 'M-Pesa Till', 'M-Pesa Paybill', 'Pochi la Biashara'].map(method => (
                <button
                  key={method}
                  onClick={() => setTenderType(method)}
                  className={`py-3 px-4 border rounded-md text-xs font-semibold transition-all ${
                    tenderType === method ? 'border-[#78350f] bg-[#78350f]/5 text-[#78350f]' : 'border-gray-200 text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  {method}
                </button>
              ))}
            </div>

            {tenderType === 'Cash' && (
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Amount Tendered (KES)</label>
                <input
                  type="number"
                  placeholder="Enter cash given..."
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm focus:outline-none focus:ring-2 focus:ring-[#78350f]"
                />
                {Number(amountPaid) >= subtotal && (
                  <p className="text-xs text-green-600 font-semibold mt-1">Change due: KES {(Number(amountPaid) - subtotal).toLocaleString()}</p>
                )}
              </div>
            )}

            <div className="flex space-x-2 pt-2">
              <button onClick={() => setPaymentModal(false)} className="flex-1 py-2.5 border border-gray-300 rounded-md text-sm font-semibold hover:bg-gray-100">Cancel</button>
              <button onClick={handleCompleteSale} className="flex-1 py-2.5 bg-[#78350f] text-white rounded-md text-sm font-semibold hover:bg-[#60280b]">Confirm & Print</button>
            </div>
          </div>
        </div>
      )}

      {receiptSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg max-w-sm w-full p-6 shadow-xl space-y-4 text-center print:shadow-none">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto text-xl font-bold print:hidden">✓</div>
            <h3 className="text-lg font-bold">Lacianda Wines & Spirits</h3>
            <p className="text-[11px] text-gray-500 font-mono">Receipt: {receiptSuccess.id}</p>
            
            <div className="bg-gray-50 p-3 rounded text-left text-xs space-y-2 font-mono border border-dashed border-gray-300">
              {receiptSuccess.items.map((i: any) => (
                <div key={i.id} className="flex justify-between">
                  <span className="truncate pr-2">{i.name}</span>
                  <span>{i.qty} x {i.price}</span>
                </div>
              ))}
              <div className="flex justify-between font-bold border-t pt-2">
                <span>Total ({receiptSuccess.tender}):</span>
                <span>KES {receiptSuccess.total.toLocaleString()}</span>
              </div>
            </div>

            <p className="text-[10px] text-gray-400 italic">Alcohol is not for sale to persons under 18.</p>

            <div className="flex space-x-2 pt-2 print:hidden">
              <button onClick={() => window.print()} className="flex-1 py-2.5 border border-gray-300 rounded-md text-sm font-semibold hover:bg-gray-100">Print</button>
              <button onClick={() => setReceiptSuccess(null)} className="flex-1 py-2.5 bg-[#78350f] text-white rounded-md text-sm font-semibold hover:bg-[#60280b]">New Sale</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
