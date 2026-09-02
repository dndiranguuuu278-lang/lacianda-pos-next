'use client';

import { useState, useEffect, useRef } from 'react';
import ReceiptTicket from '@/components/receipt-ticket';
import { GrapeClusterIcon } from '@/components/icons';
import type { CartItem, Product, TenderType } from '@/types';

export default function TillPage() {
  const [inventory, setInventory] = useState<Product[]>([]);
  const [cart, setCart] = useState<CartItem[]>([]);
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [paymentModal, setPaymentModal] = useState(false);
  const [tenderType, setTenderType] = useState<'Cash' | 'M-Pesa Till' | 'M-Pesa Paybill' | 'Card'>('Cash');
  const [amountPaid, setAmountPaid] = useState('');
  const [mpesaRef, setMpesaRef] = useState('');
  const [customerPhone, setCustomerPhone] = useState('');
  const [isStkSending, setIsStkSending] = useState(false);
  const [receiptSuccess, setReceiptSuccess] = useState<any | null>(null);

  const [mobileTab, setMobileTab] = useState<'catalog' | 'cart'>('catalog');

  const searchInputRef = useRef<HTMLInputElement>(null);
  const cashInputRef = useRef<HTMLInputElement>(null);

  const categories = [
    'All',
    'Gin',
    'Whisky',
    'Wine',
    'Beer',
    'Spirits',
    'Vodka',
    'Rum',
    'Cognac',
    'Champagne',
    'Tequila',
    'Liqueur',
    'Vermouth',
    'Aperitif',
    'Beer/RTD',
    'Energy Drinks',
    'Water',
    'Juice',
    'Non-Alcoholic',
    'Extras'
  ];

  useEffect(() => {
    const storedInventory = localStorage.getItem('lacianda_inventory');
    if (storedInventory) {
      try {
        setInventory(JSON.parse(storedInventory));
      } catch {
        initializeDefaultInventory();
      }
    } else {
      initializeDefaultInventory();
    }
  }, []);

  function initializeDefaultInventory() {
    const defaultItems: Product[] = [
      { id: 'PROD-101', name: 'Beefeater London Dry Gin 750ml', category: 'Gin', price: 2200, stock: 12, variant: 'Unit', barcode: '61611000101' },
      { id: 'PROD-102', name: 'Guinness MicroDraught 330ml Can', category: 'Beer', price: 250, stock: 0, variant: 'Unit', barcode: '61611000102' },
      { id: 'PROD-103', name: 'Campari Bitter 1L', category: 'Aperitif', price: 3400, stock: 0, variant: 'Unit', barcode: '61611000103' },
      { id: 'PROD-104', name: 'Guinness Extra Stout 330ml', category: 'Beer', price: 230, stock: 18, variant: 'Unit', barcode: '61611000104' },
      { id: 'PROD-105', name: 'The Botanist Islay Dry Gin 750ml', category: 'Gin', price: 4500, stock: 4, variant: 'Unit', barcode: '61611000105' },
      { id: 'PROD-106', name: 'Makers Mark Bourbon 750ml', category: 'Whisky', price: 4800, stock: 6, variant: 'Unit', barcode: '61611000106' },
      { id: 'PROD-107', name: 'Martini Extra Dry 1L', category: 'Vermouth', price: 1950, stock: 0, variant: 'Unit', barcode: '61611000107' },
      { id: 'PROD-108', name: 'Moet & Chandon Imperial Brut 750ml', category: 'Champagne', price: 8500, stock: 2, variant: 'Unit', barcode: '61611000108' },
      { id: 'PROD-109', name: "Jack Daniel's Single Barrel Select 750ml", category: 'Whisky', price: 6200, stock: 3, variant: 'Unit', barcode: '61611000109' },
      { id: 'PROD-110', name: 'Frontera Sweet White 750ml', category: 'Wine', price: 1100, stock: 14, variant: 'Unit', barcode: '61611000110' },
      { id: 'PROD-111', name: 'Smirnoff Espresso Vodka 750ml', category: 'Vodka', price: 1650, stock: 0, variant: 'Unit', barcode: '61611000111' },
      { id: 'PROD-112', name: 'Grants Triple Wood 750ml', category: 'Whisky', price: 1850, stock: 0, variant: 'Unit', barcode: '61611000112' },
      { id: 'PROD-113', name: 'Smirnoff Ice Black 300ml Glass', category: 'Beer/RTD', price: 200, stock: 24, variant: 'Unit', barcode: '61611000113' },
      { id: 'PROD-114', name: 'Dasani Sparkling Water Lemon 500ml', category: 'Water', price: 100, stock: 0, variant: 'Unit', barcode: '61611000114' },
      { id: 'PROD-115', name: 'Bowmore 12 Years 750ml', category: 'Whisky', price: 5400, stock: 0, variant: 'Unit', barcode: '61611000115' },
      { id: 'PROD-116', name: 'Corona Extra 355ml', category: 'Beer', price: 300, stock: 0, variant: 'Unit', barcode: '61611000116' },
      { id: 'PROD-117', name: 'Black & White Whisky 750ml', category: 'Whisky', price: 1400, stock: 15, variant: 'Unit', barcode: '61611000117' },
      { id: 'PROD-118', name: 'Stella Artois 330ml', category: 'Beer', price: 280, stock: 0, variant: 'Unit', barcode: '61611000118' },
      { id: 'PROD-119', name: 'Remy Martin VSOP 700ml', category: 'Cognac', price: 7800, stock: 2, variant: 'Unit', barcode: '61611000119' },
      { id: 'PROD-120', name: 'Tusker Lager 500ml', category: 'Beer', price: 220, stock: 48, variant: 'Unit', barcode: '61611000120' },
      { id: 'PROD-121', name: 'Kenya Cane 750ml', category: 'Spirits', price: 850, stock: 30, variant: 'Unit', barcode: '61611000121' },
      { id: 'PROD-122', name: 'Gilbeys Special Dry Gin 750ml', category: 'Gin', price: 1350, stock: 22, variant: 'Unit', barcode: '61611000122' },
      { id: 'PROD-123', name: 'Captain Morgan Gold 750ml', category: 'Rum', price: 1450, stock: 16, variant: 'Unit', barcode: '61611000123' },
      { id: 'PROD-124', name: 'Red Bull Energy Drink 250ml', category: 'Energy Drinks', price: 250, stock: 36, variant: 'Unit', barcode: '61611000124' },
      { id: 'PROD-125', name: 'Don Julio Reposado Tequila 750ml', category: 'Tequila', price: 9500, stock: 2, variant: 'Unit', barcode: '61611000125' },
    ];
    setInventory(defaultItems);
    localStorage.setItem('lacianda_inventory', JSON.stringify(defaultItems));
  }

  useEffect(() => {
    let barcodeBuffer = '';
    let lastKeyTime = Date.now();

    const handleKeyDown = (e: KeyboardEvent) => {
      const activeEl = document.activeElement as HTMLElement;
      if (['INPUT', 'TEXTAREA'].includes(activeEl?.tagName)) {
        return;
      }

      const currentTime = Date.now();
      if (currentTime - lastKeyTime > 100) {
        barcodeBuffer = '';
      }
      lastKeyTime = currentTime;

      if (e.key === 'Enter') {
        if (barcodeBuffer.trim().length > 0) {
          const scannedCode = barcodeBuffer.trim();
          const matchedProduct = inventory.find(
            (item) =>
              item.id === scannedCode ||
              item.barcode === scannedCode ||
              item.name.toLowerCase().includes(scannedCode.toLowerCase())
          );

          if (matchedProduct) {
            addToCart(matchedProduct);
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

  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        if (paymentModal) setPaymentModal(false);
        if (receiptSuccess) setReceiptSuccess(null);
      }
    };

    if (paymentModal || receiptSuccess) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleEsc);
    } else {
      document.body.style.overflow = 'unset';
    }

    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleEsc);
    };
  }, [paymentModal, receiptSuccess]);

  useEffect(() => {
    if (paymentModal && tenderType === 'Cash') {
      setTimeout(() => {
        cashInputRef.current?.focus();
      }, 80);
    }
  }, [paymentModal, tenderType]);

  const filteredProducts = inventory.filter((item) => {
    const matchesSearch =
      item.name.toLowerCase().includes(search.toLowerCase()) ||
      item.category.toLowerCase().includes(search.toLowerCase()) ||
      (item.barcode && item.barcode.includes(search));
    const matchesCategory =
      selectedCategory === 'All' ||
      item.category.toLowerCase() === selectedCategory.toLowerCase();
    return matchesSearch && matchesCategory;
  });

  const addToCart = (product: Product) => {
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

  const updateQuantity = (id: string, delta: number) => {
    setCart((prevCart) =>
      prevCart
        .map((item) => {
          if (item.id === id) {
            const newQty = item.qty + delta;
            return newQty > 0 ? { ...item, qty: newQty } : null;
          }
          return item;
        })
        .filter(Boolean) as CartItem[]
    );
  };

  const removeFromCart = (id: string) => {
    setCart((prevCart) => prevCart.filter((item) => item.id !== id));
  };

  const clearCart = () => {
    setCart([]);
  };

  const calculateTotal = () => {
    return cart.reduce((sum, item) => sum + item.price * item.qty, 0);
  };

  const totalItemsCount = cart.reduce((sum, item) => sum + item.qty, 0);

  const formatKES = (amount: number) => {
    return `KES ${amount.toLocaleString('en-KE', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  const totalDue = calculateTotal();
  const cashTendered = parseFloat(amountPaid) || 0;
  const changeDue = Math.max(0, cashTendered - totalDue);

  const handleCompleteCheckout = () => {
    const paid = tenderType === 'Cash' ? parseFloat(amountPaid) || totalDue : totalDue;

    if (tenderType === 'Cash' && paid < totalDue) {
      alert('Amount paid is less than the total due.');
      return;
    }

    const now = new Date();
    const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
    const randomSeq = String(Math.floor(1000 + Math.random() * 9000));
    const receiptNumber = `LWS-${dateStr}-${randomSeq}`;

    const transactionData = {
      id: receiptNumber,
      receiptNumber: receiptNumber,
      date: now.toISOString(),
      items: cart.map((c) => ({
        id: c.id,
        name: c.name,
        quantity: c.qty,
        price: c.price,
        lineTotal: c.price * c.qty
      })),
      total: totalDue,
      taxable: Math.round(totalDue / 1.16),
      vat: Math.round(totalDue - totalDue / 1.16),
      tenderType: tenderType,
      mpesaRef:
        tenderType.startsWith('M-Pesa')
          ? mpesaRef || `SFC${Math.random().toString(36).substring(2, 8).toUpperCase()}`
          : undefined,
      amountPaid: paid,
      change: tenderType === 'Cash' ? Math.max(0, paid - totalDue) : 0,
      isVoided: false
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
    setMpesaRef('');
    setCustomerPhone('');
  };

  const handleSimulateStkPush = () => {
    if (!customerPhone) {
      alert('Please enter a customer M-Pesa phone number.');
      return;
    }
    setIsStkSending(true);
    setTimeout(() => {
      setIsStkSending(false);
      setMpesaRef(`QK${Math.floor(10000000 + Math.random() * 90000000)}`);
      alert('STK Push Prompt Received & Confirmed by Customer (Simulated).');
    }, 1500);
  };

  return (
    <div className="flex flex-col lg:flex-row w-full h-[calc(100vh-3.5rem)] bg-background overflow-hidden select-none">
      
      {/* Mobile navigation */}
      <div className="lg:hidden flex items-center justify-around border-b border-gray-200 bg-white px-3 py-2 shrink-0">
        <button
          type="button"
          onClick={() => setMobileTab('catalog')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all ${
            mobileTab === 'catalog'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          Catalog Products
        </button>
        <button
          type="button"
          onClick={() => setMobileTab('cart')}
          className={`flex-1 py-1.5 text-xs font-semibold rounded-md transition-all flex items-center justify-center gap-1.5 ${
            mobileTab === 'cart'
              ? 'bg-primary text-primary-foreground shadow-xs'
              : 'text-gray-600 hover:bg-gray-100'
          }`}
        >
          <span>Current Sale</span>
          {cart.length > 0 && (
            <span className="bg-primary text-primary-foreground px-1.5 py-0.2 rounded-full text-[10px] font-bold">
              {totalItemsCount}
            </span>
          )}
        </button>
      </div>

      {/* Cart */}
      <div
        className={`${
          mobileTab === 'cart' ? 'flex' : 'hidden'
        } lg:flex w-full lg:w-[380px] xl:w-[420px] shrink-0 bg-white border-r border-gray-200/90 flex-col p-4 shadow-[1px_0_4px_rgba(0,0,0,0.02)] z-10 h-full overflow-hidden`}
      >
        <div className="flex items-center justify-between pb-3 border-b border-gray-100 shrink-0">
          <div className="flex items-center gap-2">
            <h2 className="text-sm font-bold text-gray-900 tracking-tight">Current Sale</h2>
            {cart.length > 0 && (
              <span className="px-2 py-0.5 rounded-full bg-primary/10 text-primary text-[11px] font-bold">
                {totalItemsCount} {totalItemsCount === 1 ? 'item' : 'items'}
              </span>
            )}
          </div>
          {cart.length > 0 && (
            <button
              onClick={clearCart}
              className="text-xs font-medium text-gray-500 hover:text-red-600 transition-colors flex items-center gap-1"
            >
              <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
              <span>Clear</span>
            </button>
          )}
        </div>

        {/* Cart Item List or Empty State */}
        {cart.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-gray-400 text-xs rounded-xl border border-dashed border-gray-200 p-6 text-center my-4 bg-gray-50/50">
            <div className="h-12 w-12 rounded-full bg-gray-100 flex items-center justify-center mb-3 text-gray-400">
              <GrapeClusterIcon className="h-6 w-6" />
            </div>
            <p className="font-semibold text-gray-700 text-sm">No items in sale</p>
            <p className="text-[11px] text-gray-400 mt-1 max-w-[200px]">
              Tap any wine or spirit from the catalog, or scan a barcode to begin.
            </p>
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto space-y-2 py-3 pr-1 scrollbar-thin">
            {cart.map((item) => (
              <div
                key={item.id}
                className="group flex items-center justify-between bg-card p-3 rounded-xl border border-gray-200/90 hover:border-primary/30 hover:shadow-xs transition-all"
              >
                <div className="flex-1 pr-2 min-w-0">
                  <p className="font-semibold text-xs text-gray-900 truncate leading-snug">
                    {item.name}
                  </p>
                  <div className="flex items-center gap-2 mt-1 text-[11px] text-gray-500">
                    <span className="tabular-nums font-medium text-gray-700">{formatKES(item.price)}</span>
                    <span className="text-gray-300">·</span>
                    <span className="text-[10px] uppercase font-bold text-gray-500 bg-gray-100 px-1.5 py-0.2 rounded">
                      {item.category}
                    </span>
                  </div>
                </div>

                {/* Quantity adjustments & Line Total */}
                <div className="flex items-center gap-2.5 shrink-0">
                  <div className="inline-flex items-center rounded-lg border border-gray-300 bg-white shadow-2xs">
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, -1)}
                      className="w-7 h-7 flex items-center justify-center text-xs font-bold text-gray-700 hover:bg-gray-100 active:bg-gray-200 rounded-l-lg transition-colors"
                      aria-label="Decrease quantity"
                    >
                      -
                    </button>
                    <span className="w-7 text-center text-xs font-bold tabular-nums text-gray-900">
                      {item.qty}
                    </span>
                    <button
                      type="button"
                      onClick={() => updateQuantity(item.id, 1)}
                      className="w-7 h-7 flex items-center justify-center text-xs font-bold text-gray-700 hover:bg-gray-100 active:bg-gray-200 rounded-r-lg transition-colors"
                      aria-label="Increase quantity"
                    >
                      +
                    </button>
                  </div>

                  <div className="text-right w-20">
                    <p className="font-bold text-xs text-primary tabular-nums">
                      {formatKES(item.price * item.qty)}
                    </p>
                    <button
                      type="button"
                      onClick={() => removeFromCart(item.id)}
                      className="text-[10px] text-gray-400 hover:text-red-600 transition-colors opacity-0 group-hover:opacity-100"
                    >
                      Remove
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Cart Total Summary & Checkout Action */}
        <div className="mt-auto pt-3 border-t border-gray-200 shrink-0 space-y-3 bg-white">
          <div className="rounded-xl bg-gray-50/90 p-3 border border-gray-200/80 space-y-1.5 text-xs">
            <div className="flex justify-between text-gray-500">
              <span>Subtotal (Base):</span>
              <span className="tabular-nums font-mono">{formatKES(Math.round(totalDue / 1.16))}</span>
            </div>
            <div className="flex justify-between text-gray-500">
              <span>KRA VAT (16%):</span>
              <span className="tabular-nums font-mono">{formatKES(Math.round(totalDue - totalDue / 1.16))}</span>
            </div>
            <div className="flex justify-between text-base font-extrabold text-gray-900 pt-2 border-t border-gray-200/70">
              <span className="tracking-tight">Total Amount:</span>
              <span className="tabular-nums text-primary font-mono text-lg">{formatKES(totalDue)}</span>
            </div>
          </div>

          <button
            type="button"
            disabled={cart.length === 0}
            onClick={() => setPaymentModal(true)}
            className="w-full h-12 bg-primary hover:bg-wine-800 active:scale-[0.99] text-primary-foreground font-bold rounded-xl disabled:opacity-40 disabled:pointer-events-none transition-all flex items-center justify-between px-4 shadow-sm text-sm"
          >
            <span className="flex items-center gap-2">
              <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <path strokeLinecap="round" strokeLinejoin="round" d="M17 9V7a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2m2 4h10a2 2 0 002-2v-6a2 2 0 00-2-2H9a2 2 0 00-2 2v6a2 2 0 002 2zm7-5a2 2 0 11-4 0 2 2 0 014 0z" />
              </svg>
              <span>Charge Tender</span>
            </span>
            <span className="tabular-nums font-mono">{formatKES(totalDue)}</span>
          </button>
        </div>
      </div>

      {/* Catalog */}
      <div
        className={`${
          mobileTab === 'catalog' ? 'flex' : 'hidden'
        } lg:flex flex-1 flex-col p-3 sm:p-4 overflow-hidden h-full`}
      >
        {/* Search Bar with scan indicator */}
        <div className="mb-3 shrink-0 flex gap-2">
          <div className="relative flex-1">
            <svg
              className="absolute left-3.5 top-3 h-4 w-4 text-gray-400"
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input
              ref={searchInputRef}
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search wine, gin, whisky, or scan barcode..."
              className="w-full h-10 pl-10 pr-10 bg-white border border-gray-300 rounded-xl shadow-2xs focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary text-xs sm:text-sm placeholder:text-gray-400 transition-all"
            />
            {search && (
              <button
                type="button"
                onClick={() => setSearch('')}
                className="absolute right-3 top-2.5 text-gray-400 hover:text-gray-600 text-xs font-bold"
              >
                ✕
              </button>
            )}
          </div>

          <div className="hidden sm:flex items-center gap-1.5 px-3 bg-white border border-gray-300 rounded-xl text-[11px] font-medium text-gray-600 shadow-2xs">
            <svg className="w-4 h-4 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v1m6 11h2m-6 0h-2v4m0-11v3m0 0h.01M12 12h4.01M16 20h4M4 12h4m12 0h.01M5 8h2a1 1 0 001-1V5a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1zm12 0h2a1 1 0 001-1V5a1 1 0 00-1-1h-2a1 1 0 00-1 1v2a1 1 0 001 1zM5 20h2a1 1 0 001-1v-2a1 1 0 00-1-1H5a1 1 0 00-1 1v2a1 1 0 001 1z" />
            </svg>
            <span>Scanner Ready</span>
          </div>
        </div>

        {/* Category filters */}
        <div className="flex items-center gap-1.5 overflow-x-auto pb-2 mb-2 scrollbar-none shrink-0 flex-nowrap">
          {categories.map((cat) => {
            const isActive = selectedCategory === cat;
            return (
              <button
                key={cat}
                type="button"
                onClick={() => setSelectedCategory(cat)}
                className={`px-3 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                  isActive
                    ? 'bg-primary text-primary-foreground shadow-xs scale-102'
                    : 'bg-white text-gray-700 border border-gray-200/90 hover:bg-gray-100 hover:text-gray-900'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* Product grid */}
        <div className="flex-1 overflow-y-auto pr-1 scrollbar-thin">
          {filteredProducts.length === 0 ? (
            <div className="h-64 flex flex-col items-center justify-center text-gray-400 text-sm bg-white rounded-2xl border border-dashed border-gray-200 p-8">
              <p className="font-semibold text-gray-600">No products found</p>
              <p className="text-xs text-gray-400 mt-1">
                No items match &ldquo;{search}&rdquo; in category &ldquo;{selectedCategory}&rdquo;
              </p>
              <button
                onClick={() => {
                  setSearch('');
                  setSelectedCategory('All');
                }}
                className="mt-3 px-3 py-1 text-xs font-semibold text-primary bg-primary/10 rounded-lg hover:bg-primary/20 transition-colors"
              >
                Reset Filters
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5 gap-2.5 sm:gap-3 pb-8">
              {filteredProducts.map((prod) => {
                const isOutOfStock = prod.stock <= 0;
                const isLowStock = prod.stock > 0 && prod.stock <= 5;
                const inCartItem = cart.find((item) => item.id === prod.id);

                return (
                  <button
                    key={prod.id}
                    type="button"
                    onClick={() => addToCart(prod)}
                    className={`group relative text-left bg-white rounded-xl border p-3 flex flex-col justify-between transition-all duration-150 hover:shadow-md active:scale-98 ${
                      inCartItem
                        ? 'border-primary ring-1 ring-primary/30'
                        : 'border-gray-200/90 hover:border-gray-300'
                    } ${isOutOfStock ? 'opacity-70 bg-gray-50/50' : ''}`}
                  >
                    {/* Badge Overlay */}
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-[10px] font-bold uppercase tracking-wider text-gray-500 bg-gray-100 px-1.5 py-0.5 rounded">
                        {prod.category}
                      </span>
                      {isOutOfStock ? (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-red-100 text-red-700 border border-red-200">
                          Out of Stock
                        </span>
                      ) : isLowStock ? (
                        <span className="text-[9px] font-bold px-1.5 py-0.5 rounded bg-amber-100 text-amber-800 border border-amber-200">
                          Low: {prod.stock} left
                        </span>
                      ) : (
                        <span className="text-[9px] font-medium text-emerald-700">
                          {prod.stock} in stock
                        </span>
                      )}
                    </div>

                    {/* Product Name */}
                    <div className="flex-1 my-1">
                      <h4 className="font-semibold text-xs text-gray-900 group-hover:text-primary transition-colors line-clamp-2 leading-snug">
                        {prod.name}
                      </h4>
                    </div>

                    {/* Price & Cart Count Pill */}
                    <div className="flex items-center justify-between pt-2 border-t border-gray-100 mt-2">
                      <span className="font-extrabold text-xs text-primary tabular-nums font-mono">
                        {formatKES(prod.price)}
                      </span>

                      {inCartItem && (
                        <span className="h-5 min-w-5 px-1 rounded-full bg-primary text-primary-foreground text-[10px] font-bold flex items-center justify-center shadow-2xs">
                          {inCartItem.qty}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>
          )}
        </div>

        {/* Floating Mobile Cart summary bar when in catalog mode */}
        {cart.length > 0 && (
          <div className="lg:hidden shrink-0 mt-2 p-3 bg-white border border-gray-200 rounded-xl shadow-lg flex items-center justify-between">
            <div className="flex flex-col">
              <span className="text-xs text-gray-500">{totalItemsCount} items selected</span>
              <span className="text-sm font-extrabold text-primary font-mono">{formatKES(totalDue)}</span>
            </div>
            <button
              type="button"
              onClick={() => setMobileTab('cart')}
              className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-lg hover:bg-wine-800 active:scale-98 transition-all flex items-center gap-1.5 shadow-sm"
            >
              <span>View Sale</span>
              <span>→</span>
            </button>
          </div>
        )}
      </div>

      {/* ── Payment / Checkout Modal ── */}
      {paymentModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-xs p-3 sm:p-4">
          <div className="bg-white rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl border border-gray-200 flex flex-col max-h-[95vh] overflow-y-auto">
            {/* Header */}
            <div className="flex items-center justify-between pb-3 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                  <GrapeClusterIcon className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="text-sm font-bold text-gray-900">Finalize Transaction</h3>
                  <p className="text-[11px] text-gray-500">Select payment tender and complete sale</p>
                </div>
              </div>
              <button
                type="button"
                onClick={() => setPaymentModal(false)}
                className="text-gray-400 hover:text-gray-600 text-lg font-bold p-1"
              >
                ✕
              </button>
            </div>

            {/* Total Display */}
            <div className="my-4 rounded-xl bg-gradient-to-br from-primary to-wine-800 p-4 text-white text-center shadow-sm">
              <span className="text-xs font-medium uppercase tracking-wider text-white/80">Total Due</span>
              <div className="text-2xl sm:text-3xl font-extrabold font-mono tracking-tight mt-0.5">
                {formatKES(totalDue)}
              </div>
              <span className="text-[11px] text-white/70">Includes 16% KRA VAT ({formatKES(Math.round(totalDue - totalDue / 1.16))})</span>
            </div>

            {/* Tender Method Tabs */}
            <div className="grid grid-cols-4 gap-1.5 p-1 bg-gray-100 rounded-xl mb-4">
              {(['Cash', 'M-Pesa Till', 'M-Pesa Paybill', 'Card'] as const).map((method) => {
                const isSelected = tenderType === method;
                return (
                  <button
                    key={method}
                    type="button"
                    onClick={() => {
                      setTenderType(method);
                      if (method === 'Cash') {
                        setAmountPaid(String(totalDue));
                      }
                    }}
                    className={`py-2 text-[11px] font-bold rounded-lg transition-all ${
                      isSelected
                        ? 'bg-white text-primary shadow-xs'
                        : 'text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {method}
                  </button>
                );
              })}
            </div>

            {/* Tender Specific Input */}
            {tenderType === 'Cash' ? (
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Cash Amount Received (KES)
                  </label>
                  <input
                    ref={cashInputRef}
                    type="number"
                    value={amountPaid}
                    onChange={(e) => setAmountPaid(e.target.value)}
                    placeholder={String(totalDue)}
                    className="w-full h-11 px-3 bg-gray-50 border border-gray-300 rounded-xl text-base font-bold font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary focus:bg-white"
                  />
                </div>

                {/* Quick denomination buttons */}
                <div className="flex gap-1.5 flex-wrap">
                  <button
                    type="button"
                    onClick={() => setAmountPaid(String(totalDue))}
                    className="px-2.5 py-1 text-xs font-semibold rounded bg-gray-200/80 hover:bg-gray-300 text-gray-800"
                  >
                    Exact
                  </button>
                  {[500, 1000, 2000, 5000].map((amt) => (
                    <button
                      key={amt}
                      type="button"
                      onClick={() => setAmountPaid(String(amt))}
                      className="px-2.5 py-1 text-xs font-semibold rounded bg-gray-200/80 hover:bg-gray-300 text-gray-800"
                    >
                      {amt.toLocaleString()}
                    </button>
                  ))}
                </div>

                {/* Change Due Display */}
                <div className="rounded-xl bg-emerald-50 border border-emerald-200/80 p-3 flex justify-between items-center">
                  <span className="text-xs font-semibold text-emerald-900">Change Due:</span>
                  <span className="text-base font-extrabold font-mono text-emerald-800">
                    {formatKES(changeDue)}
                  </span>
                </div>
              </div>
            ) : tenderType.startsWith('M-Pesa') ? (
              <div className="space-y-3">
                <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-1">
                  <div className="flex justify-between text-xs font-semibold text-emerald-900">
                    <span>Target {tenderType}</span>
                    <span>{tenderType === 'M-Pesa Till' ? 'Till: 9841234' : 'Paybill: 222111 (Acc: 281552)'}</span>
                  </div>
                  <p className="text-[11px] text-emerald-700">
                    Ask customer to send to store till or trigger an instant STK push prompt below.
                  </p>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    Customer Phone Number (for STK push)
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="tel"
                      value={customerPhone}
                      onChange={(e) => setCustomerPhone(e.target.value)}
                      placeholder="07XX XXX XXX"
                      className="flex-1 h-10 px-3 bg-white border border-gray-300 rounded-xl text-xs font-medium focus:ring-2 focus:ring-primary"
                    />
                    <button
                      type="button"
                      onClick={handleSimulateStkPush}
                      disabled={isStkSending}
                      className="px-3 h-10 bg-emerald-700 hover:bg-emerald-800 text-white text-xs font-bold rounded-xl disabled:opacity-50"
                    >
                      {isStkSending ? 'Sending...' : 'STK Push'}
                    </button>
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-gray-700 mb-1">
                    M-Pesa Confirmation Code (Optional or Auto-filled)
                  </label>
                  <input
                    type="text"
                    value={mpesaRef}
                    onChange={(e) => setMpesaRef(e.target.value)}
                    placeholder="e.g. QK89127812"
                    className="w-full h-10 px-3 bg-white border border-gray-300 rounded-xl text-xs font-mono uppercase focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>
            ) : (
              <div className="p-4 bg-gray-50 border border-gray-200 rounded-xl text-center space-y-1">
                <p className="text-xs font-semibold text-gray-800">PDQ Card Terminal Payment</p>
                <p className="text-[11px] text-gray-500">
                  Swipe/tap customer VISA or Mastercard on physical bank terminal.
                </p>
              </div>
            )}

            {/* Modal Actions */}
            <div className="mt-5 pt-3 border-t border-gray-200 flex gap-2">
              <button
                type="button"
                onClick={() => setPaymentModal(false)}
                className="flex-1 h-11 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleCompleteCheckout}
                className="flex-2 h-11 bg-primary hover:bg-wine-800 active:scale-98 text-primary-foreground rounded-xl text-xs font-bold shadow-md transition-all flex items-center justify-center gap-1.5"
              >
                <span>Complete Sale &amp; Print Receipt</span>
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Transaction Success / Receipt Preview Modal ── */}
      {receiptSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/65 backdrop-blur-xs p-3 sm:p-4 overflow-y-auto">
          <div className="bg-white rounded-2xl p-4 sm:p-6 shadow-2xl max-w-md w-full my-auto border border-gray-200">
            <div className="flex items-center justify-between pb-3 mb-2 border-b border-gray-100">
              <div className="flex items-center gap-2">
                <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
                <h3 className="text-sm font-bold text-gray-900">Sale Complete</h3>
              </div>
              <button
                type="button"
                onClick={() => setReceiptSuccess(null)}
                className="text-xs font-bold text-gray-400 hover:text-gray-700"
              >
                ✕ Close
              </button>
            </div>

            <ReceiptTicket
              storeName="Lacianda Wines & Spirits"
              receiptNumber={receiptSuccess.receiptNumber}
              date={receiptSuccess.date}
              cashierName="dennis"
              items={receiptSuccess.items}
              taxAmount={receiptSuccess.vat}
              totalAmount={receiptSuccess.total}
              tenderType={receiptSuccess.tenderType}
              amountPaid={receiptSuccess.amountPaid}
              change={receiptSuccess.change}
              mpesaRef={receiptSuccess.mpesaRef}
              isPaid={true}
              onClose={() => setReceiptSuccess(null)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
