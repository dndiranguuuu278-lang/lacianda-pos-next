'use client';

import React, { useState } from 'react';
import Navbar from '@/app/components/Navbar';

export default function BulkImportPage() {
  const [fileName, setFileName] = useState('');

  const sampleRows = [
    { barcode: '616110123456', product_name: 'Beefeater London Dry Gin', category: 'Gin', price_kes: 2200, stock: 24, size: '750ml' },
    { barcode: '616110654321', product_name: 'Guinness Extra Stout', category: 'Beer', price_kes: 230, stock: 48, size: '330ml' },
  ];

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />
      <main className="max-w-5xl w-full mx-auto p-6 space-y-6 flex-1">
        <div>
          <h1 className="text-2xl font-bold text-white">Bulk Product Import</h1>
          <p className="text-xs text-slate-400 mt-1">Upload a CSV file structured with your inventory specifications.</p>
        </div>

        <div className="bg-slate-900 border border-slate-800 p-6 rounded-2xl shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <h2 className="text-sm font-bold text-white">Required CSV Columns</h2>
              <p className="text-xs text-slate-400 mt-0.5">Your CSV header row must include the following column names:</p>
            </div>
            <button
              onClick={() => alert('Downloading CSV template...')}
              className="px-4 py-2 border border-slate-700 text-slate-300 text-sm font-medium rounded-lg hover:bg-slate-800 transition-colors whitespace-nowrap"
            >
              Download CSV Template
            </button>
          </div>

          <div className="flex flex-wrap gap-2 pt-1">
            {['barcode', 'product_name', 'category', 'price_kes', 'stock', 'size'].map((col) => (
              <span key={col} className="px-2.5 py-1 bg-slate-800 border border-slate-700 text-amber-400 font-mono text-xs rounded">
                {col}
              </span>
            ))}
          </div>

          <div className="pt-2">
            <span className="block text-xs font-medium text-slate-400 mb-2">Example format preview:</span>
            <div className="overflow-x-auto border border-slate-800 rounded-xl">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="bg-slate-800/60 text-slate-400 border-b border-slate-800 font-mono">
                    <th className="py-2.5 px-3">barcode</th>
                    <th className="py-2.5 px-3">product_name</th>
                    <th className="py-2.5 px-3">category</th>
                    <th className="py-2.5 px-3">price_kes</th>
                    <th className="py-2.5 px-3">stock</th>
                    <th className="py-2.5 px-3">size</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800 text-slate-300">
                  {sampleRows.map((row, idx) => (
                    <tr key={idx} className="hover:bg-slate-800/30">
                      <td className="py-2.5 px-3 font-mono text-slate-400">{row.barcode}</td>
                      <td className="py-2.5 px-3 font-semibold text-white">{row.product_name}</td>
                      <td className="py-2.5 px-3 text-amber-500">{row.category}</td>
                      <td className="py-2.5 px-3">{row.price_kes}</td>
                      <td className="py-2.5 px-3">{row.stock}</td>
                      <td className="py-2.5 px-3">{row.size}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>

        <div className="bg-slate-900 border border-dashed border-slate-700 p-10 rounded-2xl text-center space-y-4 shadow-sm">
          <div className="mx-auto w-12 h-12 rounded-full bg-slate-800 flex items-center justify-center text-amber-500 font-bold text-lg">
            📁
          </div>
          <div>
            <p className="text-sm font-medium text-slate-200">
              {fileName ? `Selected file: ${fileName}` : 'Drag and drop your CSV file here, or browse'}
            </p>
          </div>
          <label className="inline-block cursor-pointer bg-amber-700 hover:bg-amber-600 text-white font-medium px-5 py-2.5 rounded-xl text-sm transition-colors shadow-sm">
            Browse CSV File
            <input
              type="file"
              accept=".csv"
              className="hidden"
              onChange={(e) => {
                if (e.target.files && e.target.files[0]) {
                  setFileName(e.target.files[0].name);
                }
              }}
            />
          </label>
        </div>

        {fileName && (
          <div className="pt-2">
            <button
              onClick={() => alert(`Successfully validated and imported inventory from ${fileName}!`)}
              className="w-full bg-emerald-600 hover:bg-emerald-500 text-white font-bold py-3.5 rounded-xl transition-colors shadow-sm text-sm"
            >
              Start Import Process
            </button>
          </div>
        )}
      </main>
    </div>
  );
}
