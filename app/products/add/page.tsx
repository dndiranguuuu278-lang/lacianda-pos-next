'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { ProductVariant } from '@/types';

export default function AddProductPage() {
  const router = useRouter();
  const [name, setName] = useState('');
  const [brand, setBrand] = useState('');
  const [category, setCategory] = useState('Gin');
  const [price, setPrice] = useState('1800');
  const [barcode, setBarcode] = useState('');
  const [stock, setStock] = useState('12');
  const [costPrice, setCostPrice] = useState('1400');
  const [reorderLevel, setReorderLevel] = useState('5');
  const [taxType, setTaxType] = useState('Standard 16% (KRA eTIMS A)');
  const [variants, setVariants] = useState<ProductVariant[]>([]);
  const [successMsg, setSuccessMsg] = useState(false);

  const categories = [
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

  const handleGenerateBarcode = () => {
    const randomCode = `61611000${Math.floor(100 + Math.random() * 900)}`;
    setBarcode(randomCode);
  };

  const handleAddVariant = () => {
    const newVariant: ProductVariant = {
      id: `var-${Date.now()}`,
      size: 'Shot / Tots (50ml)',
      price: '250',
      barcode: '',
      stock: '20',
    };
    setVariants((prev) => [...prev, newVariant]);
  };

  const handleRemoveVariant = (id: string) => {
    setVariants((prev) => prev.filter((v) => v.id !== id));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      alert('Please enter a product name.');
      return;
    }

    const newProduct = {
      id: barcode ? `BAR-${barcode}` : `PROD-${Date.now()}`,
      name: name.trim(),
      category,
      price: parseFloat(price) || 0,
      stock: parseInt(stock) || 0,
      variant: 'Unit',
      barcode: barcode.trim() || undefined,
      taxType,
      isActive: true
    };

    const storedInventory = JSON.parse(localStorage.getItem('lacianda_inventory') || '[]');
    localStorage.setItem('lacianda_inventory', JSON.stringify([newProduct, ...storedInventory]));

    setSuccessMsg(true);
    setTimeout(() => {
      router.push('/inventory');
    }, 1200);
  };

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 bg-background min-h-[calc(100vh-3.5rem)] overflow-y-auto">
      {/* Breadcrumb Header */}
      <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
        <Link href="/inventory" className="hover:text-gray-900 transition-colors">
          Inventory
        </Link>
        <span>/</span>
        <span className="text-gray-800 font-semibold">New Product</span>
      </div>

      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight">
            Add New Wine or Spirit
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Register new catalog items with KRA eTIMS tax classification and barcode lookup
          </p>
        </div>

        <Link
          href="/inventory"
          className="self-start sm:self-auto px-3.5 py-2 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs"
        >
          Cancel &amp; Return
        </Link>
      </div>

      {successMsg && (
        <div className="mb-6 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs font-semibold flex items-center justify-between shadow-2xs">
          <div className="flex items-center gap-2">
            <span className="h-2 w-2 rounded-full bg-emerald-500"></span>
            <span>Product &ldquo;{name}&rdquo; added successfully! Redirecting to inventory catalog...</span>
          </div>
        </div>
      )}

      <form onSubmit={handleSubmit} className="max-w-4xl space-y-5">
        {/* Section 1: Product Identity */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-2xs space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-sm font-bold text-gray-900">Product Identity</h2>
            <p className="text-[11px] text-gray-500">Official product label, distillery brand, and category</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="sm:col-span-2">
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Full Product Name <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="e.g. Tanqueray Flor De Sevilla Gin 750ml"
                className="w-full h-11 px-3.5 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full h-11 px-3 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>
                    {c}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Distillery / Brand</label>
              <input
                type="text"
                value={brand}
                onChange={(e) => setBrand(e.target.value)}
                placeholder="e.g. Diageo / EABL"
                className="w-full h-11 px-3.5 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white transition-all"
              />
            </div>
          </div>
        </div>

        {/* Section 2: Pricing & KRA Tax Classification */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-2xs space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-sm font-bold text-gray-900">Pricing &amp; Tax Classification</h2>
            <p className="text-[11px] text-gray-500">Retail price, wholesale cost, and fiscal compliance</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Selling Price (KES) <span className="text-red-500">*</span>
              </label>
              <input
                type="number"
                required
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="w-full h-11 px-3.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-bold font-mono text-primary focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Cost Price (Wholesale KES)
              </label>
              <input
                type="number"
                value={costPrice}
                onChange={(e) => setCostPrice(e.target.value)}
                className="w-full h-11 px-3.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-mono text-gray-800 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">KRA eTIMS Tax Group</label>
              <select
                value={taxType}
                onChange={(e) => setTaxType(e.target.value)}
                className="w-full h-11 px-3 bg-gray-50 border border-gray-300 rounded-xl text-xs sm:text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white"
              >
                <option value="Standard 16% (KRA eTIMS A)">Standard 16% (KRA eTIMS A)</option>
                <option value="Zero Rated 0% (KRA eTIMS B)">Zero Rated 0% (KRA eTIMS B)</option>
                <option value="Exempt (KRA eTIMS C)">Exempt (KRA eTIMS C)</option>
              </select>
            </div>
          </div>
        </div>

        {/* Section 3: Stock Control & Barcode */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-2xs space-y-4">
          <div className="border-b border-gray-100 pb-3">
            <h2 className="text-sm font-bold text-gray-900">Inventory &amp; Barcode Identification</h2>
            <p className="text-[11px] text-gray-500">Initial shelf quantity and barcode scanner pairing</p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Opening Stock (Bottles)
              </label>
              <input
                type="number"
                value={stock}
                onChange={(e) => setStock(e.target.value)}
                className="w-full h-11 px-3.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-mono font-bold text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">
                Low Stock Alert Threshold
              </label>
              <input
                type="number"
                value={reorderLevel}
                onChange={(e) => setReorderLevel(e.target.value)}
                className="w-full h-11 px-3.5 bg-gray-50 border border-gray-300 rounded-xl text-sm font-mono text-gray-900 focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-semibold text-gray-700 mb-1">Barcode / SKU</label>
              <div className="flex gap-1.5">
                <input
                  type="text"
                  value={barcode}
                  onChange={(e) => setBarcode(e.target.value)}
                  placeholder="Scan or generate..."
                  className="flex-1 h-11 px-3 bg-gray-50 border border-gray-300 rounded-xl text-xs font-mono focus:outline-none focus:ring-2 focus:ring-primary/20 focus:bg-white"
                />
                <button
                  type="button"
                  onClick={handleGenerateBarcode}
                  title="Generate simulated EAN-13 barcode"
                  className="px-2.5 h-11 bg-gray-200/80 hover:bg-gray-300 text-gray-800 text-[11px] font-semibold rounded-xl transition-colors"
                >
                  Gen
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* Section 4: Variants & Tots (Optional) */}
        <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-2xs space-y-4">
          <div className="flex items-center justify-between border-b border-gray-100 pb-3">
            <div>
              <h2 className="text-sm font-bold text-gray-900">Portion / Tots Variants</h2>
              <p className="text-[11px] text-gray-500">Optional single tots (50ml), half-bottles, or nip portions</p>
            </div>
            <button
              type="button"
              onClick={handleAddVariant}
              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-800 text-xs font-semibold rounded-lg transition-colors"
            >
              + Add Portion Variant
            </button>
          </div>

          {variants.length === 0 ? (
            <p className="text-xs text-gray-400 italic py-2">
              No bottle portion variants configured. Sold exclusively as a single unit bottle.
            </p>
          ) : (
            <div className="space-y-2">
              {variants.map((v) => (
                <div key={v.id} className="flex items-center gap-2 p-2.5 rounded-xl bg-gray-50 border border-gray-200">
                  <span className="text-xs font-semibold text-gray-800 flex-1">{v.size}</span>
                  <span className="text-xs font-bold font-mono text-primary">KES {v.price}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveVariant(v.id)}
                    className="text-xs text-red-600 hover:text-red-800 font-semibold px-2"
                  >
                    Remove
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Form Action */}
        <div className="pt-2 flex items-center gap-3">
          <button
            type="submit"
            className="h-12 px-6 bg-primary text-primary-foreground text-xs sm:text-sm font-bold rounded-xl hover:bg-wine-800 active:scale-98 transition-all shadow-md flex items-center gap-2"
          >
            <span>Save &amp; Add to Catalog</span>
            <span>→</span>
          </button>
          <Link
            href="/inventory"
            className="h-12 px-5 bg-white border border-gray-300 text-gray-700 text-xs sm:text-sm font-semibold rounded-xl hover:bg-gray-50 transition-colors flex items-center justify-center"
          >
            Cancel
          </Link>
        </div>
      </form>
    </div>
  );
}
