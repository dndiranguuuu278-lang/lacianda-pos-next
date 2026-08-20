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

  // Load inventory from local storage on mount
  useEffect(() => {
    const storedInventory = localStorage.getItem('lacianda_inventory');
    if (storedInventory) {
      setInventory(JSON.parse(storedInventory));
    } else {
      const defaultItems = [
        { id: '1', name: 'Beefeater London Dry Gin 750ml', category: 'Gin', price: 2200, stock: 12 },
        { id: '2', name: 'The Botanist Islay Dry Gin 750ml', category: 'Gin', price: 4500, stock: 4 },
        { id: '3', name: 'Guinness MicroDraught 330ml Can', category: 'Beer', price: 250, stock: 25 },
        { id: '4', name: 'Campari Bitter 1L', category: 'Aperitif', price: 3400, stock: 8 },
        { id: '5', name: 'Makers Mark Bourbon 750ml', category: 'Whisky', price: 4800, stock: 6 },
      ];
      setInventory(defaultItems);
      localStorage.setItem('lacianda_inventory', JSON.stringify(defaultItems));
    }
  }, []);

  // Barcode Scanner Listener Hook
  useEffect(() => {
    let barcodeBuffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      const currentTime = Date.now();
      
      // Ignore if user is actively typing in a standard input field
      if (['INPUT', 'TEXTAREA'].includes((document.activeElement as HTMLElement)?.tagName)) {
        return;
      }

      // Hardware scanners input characters very rapidly (< 100ms apart)
      if (currentTime - lastKeyTime > 100) {
        barcodeBuffer = '';
      }
      lastKeyTime = currentTime;

      if (e.key === 'Enter') {
        if (barcodeBuffer.trim().length > 0) {
          const scannedCode = barcodeBuffer.trim();
          
          const matchedProduct = inventory.find(
            (item) => item.id === scannedCode || item.name.toLowerCase().includes(scannedCode.toLowerCase())
          );

          if (matchedProduct) {
            addToCart(matchedProduct);
          } else {
            console.warn(`Scanned item not found: ${scannedCode}`);
          }
        }
        barcodeBuffer = '';
      } else if (e.key.length === 1) {
        barcodeBuffer += e.key;
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [inventory]);

  const filteredProducts = inventory.filter((item) => {
    const matchesSearch = item.name.toLowerCase().includes(search.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || item.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const categories = ['All', 'Gin', 'Beer', 'Whisky', 'Aperitif', 'Vodka', 'Wine', 'Tequila'];

  const addToCart = (product: any) => {
    setCart((prevCart) => {
      const existing = prevCart.find((item) => item.id === product.id);
      if (existing) {
        return prevCart.map((item) =>
          item.id === product.id ? { ...item, qty: item.qty + 1 } : item
        );
      }
      return [...prevCart, { ...product, qty: 1 }];
    });
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  };

  const handleCompleteCheckout = () => {
    const total = calculateTotal();
    const paid = tenderType === 'Cash' ? parseFloat(amountPaid) || total : total;

    if (tenderType === 'Cash' && paid < total) {
      alert('Amount paid is less than the total balance.');
      return;
    }

    const transactionData = {
      id: 'TXN-' + Math.floor(100000 + Math.random() * 900000),
      date: new Date().toISOString(),
      items: [...cart],
      total: total,
      tenderType: tenderType,
      amountPaid: paid,
      change: tenderType === 'Cash' ? paid - total : 0,
    };

    const existingSales = JSON.parse(localStorage.getItem('lacianda_sales') || '[]');
    localStorage.setItem('lacianda_sales', JSON.stringify([transactionData, ...existingSales]));

    const updatedInventory = inventory.map((prod) => {
      const cartItem = cart.find((item) => item.id === prod.id);
      if (cartItem) {
        return { ...prod, stock: Math.max(0, prod.stock - cartItem.qty) };
      }
      return prod;
    });
    setInventory(updatedInventory);
    localStorage.setItem('lacianda_inventory', JSON.stringify(updatedInventory));

    setReceiptSuccess(transactionData);
    setCart([]);
    setPaymentModal(false);
    setAmountPaid('');
  };

  return (
    <div className="flex flex-1 h-[calc(100vh-4rem)] bg-gray-100 overflow-hidden relative">
      {/* Left Pane: Current Sale / Cart */}
      <div className="w-full lg:w-4/12 bg-white border-r border-gray-200 flex flex-col p-4 shadow-sm">
        <h2 className="text-lg font-bold text-gray-800 mb-3">Current Sale</h2>
        
        {cart.length === 0 ? (
          <div className="flex-1 flex items-center justify-center text-gray-400 text-sm border-2 border-dashed border-gray-200 rounded-lg">
            Scan or tap a product to begin.
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-2 pr-1">
            {cart.map((item) => (
              <div key={item.id} className="flex justify-between items-center bg-gray-50 p-2.5 rounded border border-gray-100">
                <div>
                  <p className="font-medium text-sm text-gray-800">{item.name}</p>
                  <p className="text-xs text-gray-500">KES {item.price} × {item.qty}</p>
                </div>
                <p className="font-bold text-sm text-gray-900">KES {item.price * item.qty}</p>
              </div>
            ))}
          </div>
        )}

        {/* Cart Total & Checkout Actions */}
        <div className="mt-4 pt-3 border-t border-gray-200">
          <div className="flex justify-between text-base font-bold text-gray-900 mb-3">
            <span>Total:</span>
            <span>KES {calculateTotal().toLocaleString()}</span>
          </div>
          <button
            disabled={cart.length === 0}
            onClick={() => setPaymentModal(true)}
            className="w-full py-3 bg-[#4a2e2b] text-white font-medium rounded-lg hover:bg-[#3b2422] disabled:opacity-50 transition-colors"
          >
            Charge KES {calculateTotal().toLocaleString()}
          </button>
        </div>
      </div>

      {/* Right Pane: Catalog, Search & Categories */}
      <div className="flex-1 flex flex-col p-4 overflow-hidden">
        <div className="mb-3">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Scan barcode or search products..."
            className="w-full px-4 py-2.5 bg-white border border-gray-300 rounded-lg shadow-sm focus:outline-none focus:ring-2 focus:ring-[#4a2e2b] text-sm"
          />
        </div>

        <div className="flex gap-2 overflow-x-auto pb-2 mb-3 scrollbar-none">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-3 py-1.5 rounded-full text-xs font-medium whitespace-nowrap transition-colors ${
                selectedCategory === cat
                  ? 'bg-[#4a2e2b] text-white'
                  : 'bg-white text-gray-600 border border-gray-200 hover:bg-gray-50'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="flex-1 overflow-y-auto grid grid-cols-2 md:grid-cols-3 xl:grid-cols-4 gap-3 pr-1">
          {filteredProducts.map((product) => (
            <button
              key={product.id}
              onClick={() => addToCart(product)}
              className="bg-white p-3 rounded-lg border border-gray-200 shadow-sm hover:border-[#4a2e2b] transition-all text-left flex flex-col justify-between h-28"
            >
              <div>
                <p className="font-semibold text-xs text-gray-800 line-clamp-2">{product.name}</p>
                <span className={`inline-block mt-1 text-[10px] px-1.5 py-0.5 rounded ${product.stock <= 5 ? 'bg-orange-100 text-orange-700' : 'bg-gray-100 text-gray-600'}`}>
                  Stock: {product.stock}
                </span>
              </div>
              <p className="font-bold text-sm text-[#4a2e2b]">KES {product.price.toLocaleString()}</p>
            </button>
          ))}
        </div>
      </div>

      {/* Payment Checkout Modal */}
      {paymentModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-xl">
            <h3 className="text-lg font-bold text-gray-800 mb-4">Complete Payment</h3>
            <p className="text-sm text-gray-600 mb-4">Total Due: <span className="font-bold text-gray-900">KES {calculateTotal().toLocaleString()}</span></p>

            <div className="flex gap-2 mb-4">
              {['Cash', 'M-Pesa'].map((type) => (
                <button
                  key={type}
                  onClick={() => setTenderType(type)}
                  className={`flex-1 py-2 text-xs font-semibold rounded-lg border transition-all ${
                    tenderType === type ? 'bg-[#4a2e2b] text-white border-[#4a2e2b]' : 'bg-gray-50 text-gray-700 border-gray-200'
                  }`}
                >
                  {type}
                </button>
              ))}
            </div>

            {tenderType === 'Cash' && (
              <div className="mb-4">
                <label className="block text-xs font-medium text-gray-700 mb-1">Amount Tendered (KES)</label>
                <input
                  type="number"
                  value={amountPaid}
                  onChange={(e) => setAmountPaid(e.target.value)}
                  placeholder="Enter cash given"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-[#4a2e2b]"
                />
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setPaymentModal(false)}
                className="flex-1 py-2.5 bg-gray-100 text-gray-700 font-medium rounded-lg hover:bg-gray-200 text-sm"
              >
                Cancel
              </button>
              <button
                onClick={handleCompleteCheckout}
                className="flex-1 py-2.5 bg-[#4a2e2b] text-white font-medium rounded-lg hover:bg-[#3b2422] text-sm"
              >
                Confirm Payment
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Success Receipt Modal */}
      {receiptSuccess && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-xl p-6 w-96 shadow-xl text-center">
            <div className="w-12 h-12 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-3 text-xl font-bold">✓</div>
            <h3 className="text-lg font-bold text-gray-800 mb-1">Transaction Successful</h3>
            <p className="text-xs text-gray-500 mb-4">{receiptSuccess.id}</p>
            
            <div className="bg-gray-50 p-3 rounded-lg text-left text-xs space-y-1 mb-4 border border-gray-100">
              <div className="flex justify-between font-bold text-gray-800 mb-2">
                <span>Items:</span>
                <span>Total: KES {receiptSuccess.total.toLocaleString()}</span>
              </div>
              {receiptSuccess.items.map((i: any) => (
                <div key={i.id} className="flex justify-between text-gray-600">
                  <span>{i.name} (x{i.qty})</span>
                  <span>KES {i.price * i.qty}</span>
                </div>
              ))}
            </div>

            <button
              onClick={() => setReceiptSuccess(null)}
              className="w-full py-2.5 bg-[#4a2e2b] text-white font-medium rounded-lg hover:bg-[#3b2422] text-sm"
            >
              New Sale
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
