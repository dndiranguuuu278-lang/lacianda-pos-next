'use client';
import { useState, useEffect } from 'react';
import Navbar from '@/components/Navbar';

export default function SettingsPage() {
  const [storeName, setStoreName] = useState('Lacianda Wines and Spirits');
  const [kraPin, setKraPin] = useState('P051234567X');
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    const saved = localStorage.getItem('lacianda_pos_settings');
    if (saved) {
      const p = JSON.parse(saved);
      setStoreName(p.storeName || storeName);
      setKraPin(p.kraPin || kraPin);
    }
  }, []);

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    localStorage.setItem('lacianda_pos_settings', JSON.stringify({ storeName, kraPin }));
    setSuccess(true);
    setTimeout(() => setSuccess(false), 3000);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />
      <main className="max-w-4xl mx-auto p-4 md:p-6">
        <h1 className="text-xl font-bold mb-6">POS Settings</h1>

        {success && (
          <div className="mb-4 p-3 bg-green-50 text-green-700 text-xs font-medium rounded-md border border-green-200">
            Settings saved successfully!
          </div>
        )}

        <form onSubmit={handleSave} className="space-y-6">
          <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6 space-y-4">
            <h2 className="text-sm font-bold uppercase tracking-wide text-gray-500 mb-2">Store Profile & Tax Details</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">Store Name</label>
                <input type="text" value={storeName} onChange={(e) => setStoreName(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm" />
              </div>
              <div>
                <label className="block text-xs font-medium text-gray-700 mb-1">KRA PIN</label>
                <input type="text" value={kraPin} onChange={(e) => setKraPin(e.target.value)} className="w-full px-3 py-2 border rounded-md text-sm" />
              </div>
            </div>
          </div>

          <div className="flex justify-end">
            <button type="submit" className="px-6 py-2.5 bg-[#78350f] text-white rounded-md text-sm font-semibold hover:bg-[#60280b]">Save settings</button>
          </div>
        </form>
      </main>
    </div>
  );
}
