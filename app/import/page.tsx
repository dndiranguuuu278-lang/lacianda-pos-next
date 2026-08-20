'use client';

import { useState } from 'react';

export default function BulkImportPage() {
  const [csvData, setCsvData] = useState(
    'Name,Category,Price,Stock\nKenya Cane 750ml,Spirit,1200,20\nGilbeys Gin 750ml,Gin,1500,15\nTusker Lager 500ml,Beer,250,50'
  );
  const [importStatus, setImportStatus] = useState<string | null>(null);

  const handleImport = () => {
    try {
      const lines = csvData.trim().split('\n');
      if (lines.length < 2) {
        alert('CSV must include a header row and at least one data row.');
        return;
      }

      // Parse CSV lines (skip header)
      const newItems = lines.slice(1).map((line, index) => {
        const [name, category, price, stock] = line.split(',').map((val) => val.trim());
        return {
          id: `BULK-${Date.now()}-${index}`,
          name: name || 'Unknown Product',
          category: category || 'General',
          price: Number(price) || 0,
          stock: Number(stock) || 0,
        };
      });

      // Merge with existing local storage inventory
      const existing = JSON.parse(localStorage.getItem('lacianda_inventory') || '[]');
      const updated = [...newItems, ...existing];
      localStorage.setItem('lacianda_inventory', JSON.stringify(updated));

      setImportStatus(`Successfully imported ${newItems.length} items into inventory!`);
    } catch (error) {
      alert('Failed to parse CSV format. Please check your comma separation.');
    }
  };

  return (
    <div className="flex flex-1 flex-col h-[calc(100vh-4rem)] bg-gray-50 p-6 overflow-y-auto items-center">
      <div className="w-full max-w-2xl bg-white border border-gray-200 rounded-xl shadow-sm p-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900">Bulk Product Import</h1>
          <p className="text-xs text-gray-500">Paste your CSV dataset below to batch-add inventory items for your store.</p>
        </div>

        {importStatus && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-700 text-xs font-medium rounded-lg">
            {importStatus}
          </div>
        )}

        <div className="space-y-4">
          <div>
            <label className="block text-xs font-medium text-gray-700 mb-1">CSV Content Format (Name, Category, Price, Stock)</label>
            <textarea
              rows={8}
              value={csvData}
              onChange={(e) => setCsvData(e.target.value)}
              className="w-full p-3 font-mono text-xs bg-gray-50 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4a2e2b]"
            />
          </div>

          <button
            onClick={handleImport}
            className="w-full py-3 bg-[#4a2e2b] text-white font-medium rounded-lg hover:bg-[#3b2422] text-sm transition-colors"
          >
            Process & Import CSV Data
          </button>
        </div>
      </div>
    </div>
  );
}
