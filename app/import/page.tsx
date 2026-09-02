'use client';

import { useState, useRef } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import type { ParsedProduct } from '@/types';

export default function BulkImportPage() {
  const router = useRouter();
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [selectedFileName, setSelectedFileName] = useState<string | null>(null);
  const [parsedItems, setParsedItems] = useState<ParsedProduct[]>([
    { id: 'BULK-1', name: 'Kenya Cane 750ml', category: 'Spirits', price: 850, stock: 30, barcode: '616110001001' },
    { id: 'BULK-2', name: 'Gilbeys Special Dry Gin 750ml', category: 'Gin', price: 1350, stock: 22, barcode: '616110001002' },
    { id: 'BULK-3', name: 'Tusker Lager 500ml', category: 'Beer', price: 220, stock: 48, barcode: '616110001003' },
    { id: 'BULK-4', name: 'Captain Morgan Gold 750ml', category: 'Rum', price: 1450, stock: 16, barcode: '616110001004' }
  ]);
  const [csvText, setCsvText] = useState(
    'Name,Category,Price,Stock,Barcode\nKenya Cane 750ml,Spirits,850,30,616110001001\nGilbeys Special Dry Gin 750ml,Gin,1350,22,616110001002\nTusker Lager 500ml,Beer,220,48,616110001003\nCaptain Morgan Gold 750ml,Rum,1450,16,616110001004'
  );
  const [showManualPaste, setShowManualPaste] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ text: string; isError?: boolean } | null>(null);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setSelectedFileName(file.name);
    const reader = new FileReader();
    reader.onload = (evt) => {
      const text = evt.target?.result as string;
      if (text) {
        setCsvText(text);
        processCsv(text, file.name);
      }
    };
    reader.readAsText(file);
  };

  const processCsv = (rawCsv: string, sourceName?: string) => {
    try {
      const lines = rawCsv.trim().split('\n');
      if (lines.length < 2) {
        setStatusMsg({ text: 'CSV must contain a header and at least one data row.', isError: true });
        return;
      }

      const headers = lines[0].split(',').map((h) => h.trim().toLowerCase());
      const nameIdx = headers.findIndex((h) => h.includes('name') || h.includes('product'));
      const catIdx = headers.findIndex((h) => h.includes('cat'));
      const priceIdx = headers.findIndex((h) => h.includes('price') || h.includes('cost'));
      const stockIdx = headers.findIndex((h) => h.includes('stock') || h.includes('qty'));
      const barcodeIdx = headers.findIndex((h) => h.includes('bar') || h.includes('code') || h.includes('sku'));

      const newItems: ParsedProduct[] = lines.slice(1).map((line, index) => {
        const cols = line.split(',').map((v) => v.trim());
        const name = nameIdx !== -1 ? cols[nameIdx] : cols[0] || 'Unknown Item';
        const cat = catIdx !== -1 ? cols[catIdx] : cols[1] || 'Spirits';
        const price = priceIdx !== -1 ? Number(cols[priceIdx]) || 0 : Number(cols[2]) || 0;
        const stock = stockIdx !== -1 ? Number(cols[stockIdx]) || 0 : Number(cols[3]) || 0;
        const barcode = barcodeIdx !== -1 ? cols[barcodeIdx] : cols[4] || undefined;

        return {
          id: barcode ? `BAR-${barcode}` : `BULK-${Date.now()}-${index}`,
          name,
          category: cat,
          price,
          stock,
          barcode
        };
      });

      setParsedItems(newItems);
      setStatusMsg({
        text: `Parsed ${newItems.length} products successfully from ${sourceName || 'CSV source'}.`
      });
    } catch {
      setStatusMsg({ text: 'Failed to parse CSV format. Ensure standard comma separation.', isError: true });
    }
  };

  const handleCommitImport = () => {
    if (parsedItems.length === 0) {
      alert('No parsed items to import.');
      return;
    }

    const existingInventory = JSON.parse(localStorage.getItem('lacianda_inventory') || '[]');
    const merged = [...parsedItems, ...existingInventory];
    localStorage.setItem('lacianda_inventory', JSON.stringify(merged));

    setStatusMsg({ text: `Successfully imported ${parsedItems.length} items into inventory catalog!` });
    setTimeout(() => {
      router.push('/inventory');
    }, 1200);
  };

  return (
    <div className="flex-1 flex flex-col p-4 sm:p-6 bg-background min-h-[calc(100vh-3.5rem)] overflow-y-auto">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-6">
        <div>
          <h1 className="text-xl sm:text-2xl font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
            <span>Bulk Product Import (CSV)</span>
          </h1>
          <p className="text-xs text-gray-500 mt-0.5">
            Rapidly populate or batch-update your wines &amp; spirits inventory using Excel or CSV spreadsheets
          </p>
        </div>

        <Link
          href="/inventory"
          className="self-start sm:self-auto px-3.5 py-2 bg-white border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 hover:bg-gray-50 transition-colors shadow-2xs"
        >
          Return to Inventory
        </Link>
      </div>

      {statusMsg && (
        <div
          className={`mb-6 p-4 rounded-xl text-xs font-semibold flex items-center justify-between shadow-2xs ${
            statusMsg.isError
              ? 'bg-red-50 border border-red-200 text-red-900'
              : 'bg-emerald-50 border border-emerald-200 text-emerald-900'
          }`}
        >
          <span>{statusMsg.text}</span>
          <button
            type="button"
            onClick={() => setStatusMsg(null)}
            className="text-gray-400 hover:text-gray-700 font-bold"
          >
            ✕
          </button>
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column: Upload Box & Manual Editor */}
        <div className="space-y-4">
          <div className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200 shadow-2xs space-y-4">
            <h2 className="text-sm font-bold text-gray-900">Upload CSV Spreadsheet</h2>
            <p className="text-xs text-gray-500">
              Select any spreadsheet file (.csv) formatted with: Name, Category, Price, Stock, Barcode.
            </p>

            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept=".csv"
              className="hidden"
            />

            <div
              onClick={() => fileInputRef.current?.click()}
              className="border-2 border-dashed border-gray-300 hover:border-primary rounded-2xl p-6 text-center cursor-pointer bg-gray-50/50 hover:bg-primary/5 transition-all group"
            >
              <div className="h-12 w-12 rounded-full bg-white shadow-2xs mx-auto flex items-center justify-center text-gray-400 group-hover:text-primary transition-colors mb-3">
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="1.8">
                  <path strokeLinecap="round" strokeLinejoin="round" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                </svg>
              </div>
              <p className="text-xs font-bold text-gray-800">
                {selectedFileName || 'Click to browse or drop CSV file'}
              </p>
              <p className="text-[11px] text-gray-400 mt-0.5">Supports UTF-8 CSV up to 10MB</p>
            </div>

            <div className="flex items-center justify-between pt-2">
              <button
                type="button"
                onClick={() => setShowManualPaste((prev) => !prev)}
                className="text-xs font-semibold text-primary hover:underline"
              >
                {showManualPaste ? 'Hide Raw Text Editor' : 'Paste Raw CSV Text Directly'}
              </button>
            </div>

            {showManualPaste && (
              <div className="space-y-2 pt-2 border-t border-gray-100">
                <label className="block text-xs font-semibold text-gray-700">Raw CSV Editor</label>
                <textarea
                  rows={6}
                  value={csvText}
                  onChange={(e) => setCsvText(e.target.value)}
                  className="w-full p-2.5 bg-gray-50 border border-gray-300 rounded-xl text-xs font-mono focus:bg-white"
                />
                <button
                  type="button"
                  onClick={() => processCsv(csvText, 'Manual Input')}
                  className="w-full py-2 bg-gray-200 hover:bg-gray-300 text-gray-800 text-xs font-bold rounded-xl transition-colors"
                >
                  Reparse CSV Text
                </button>
              </div>
            )}
          </div>

          <div className="bg-paper rounded-2xl p-5 border border-primary/20 shadow-2xs space-y-2">
            <h3 className="text-xs font-bold uppercase tracking-wider text-primary">
              Expected Columns Format
            </h3>
            <p className="text-xs text-gray-600 font-mono text-[11px] leading-relaxed">
              Name, Category, Price, Stock, Barcode
            </p>
            <p className="text-[11px] text-gray-500">
              Columns are auto-detected by header name. Missing categories default to Spirits, and missing stocks default to 0.
            </p>
          </div>
        </div>

        {/* Right Column: Live Table Preview & Commit Action */}
        <div className="lg:col-span-2 space-y-4">
          <div className="bg-white rounded-2xl border border-gray-200 shadow-2xs overflow-hidden">
            <div className="p-4 border-b border-gray-200 flex items-center justify-between bg-gray-50/50">
              <div>
                <h3 className="text-sm font-bold text-gray-900">Parsed Preview</h3>
                <p className="text-[11px] text-gray-500">
                  Verify items before committing to store catalog ({parsedItems.length} rows)
                </p>
              </div>

              <button
                type="button"
                onClick={handleCommitImport}
                disabled={parsedItems.length === 0}
                className="px-4 py-2 bg-primary text-primary-foreground text-xs font-bold rounded-xl hover:bg-wine-800 active:scale-98 transition-all shadow-sm disabled:opacity-40"
              >
                Commit {parsedItems.length} Products to Inventory
              </button>
            </div>

            <div className="overflow-x-auto max-h-[420px]">
              <table className="w-full text-left text-xs">
                <thead className="bg-gray-50 border-b border-gray-200 text-gray-600 font-semibold uppercase text-[10px] sticky top-0">
                  <tr>
                    <th className="py-2.5 px-4">Item Name</th>
                    <th className="py-2.5 px-4">Category</th>
                    <th className="py-2.5 px-4 text-right">Price (KES)</th>
                    <th className="py-2.5 px-4 text-center">Stock</th>
                    <th className="py-2.5 px-4 font-mono">Barcode</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100 font-medium">
                  {parsedItems.map((item, idx) => (
                    <tr key={idx} className="hover:bg-gray-50">
                      <td className="py-2.5 px-4 font-semibold text-gray-900">{item.name}</td>
                      <td className="py-2.5 px-4">
                        <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase text-gray-600 bg-gray-100">
                          {item.category}
                        </span>
                      </td>
                      <td className="py-2.5 px-4 text-right font-mono font-bold text-primary">
                        KES {item.price.toLocaleString()}
                      </td>
                      <td className="py-2.5 px-4 text-center font-mono">{item.stock}</td>
                      <td className="py-2.5 px-4 font-mono text-gray-500">{item.barcode || '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
