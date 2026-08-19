'use client';

import React, { useState } from 'react';
import Navbar from '@/app/components/Navbar';

export default function SalesPage() {
  const [sales] = useState([
    { id: 'LC-1089', time: '14:32', items: 'Beefeater Gin 750ml (1)', total: 2200, mode: 'STK Push', status: 'Completed' },
    { id: 'LC-1088', time: '13:15', items: 'Guinness Extra Stout 330ml (1)', total: 230, mode: 'Cash', status: 'Completed' },
    { id: 'LC-1087', time: '12:04', items: 'The Botanist Gin 750ml (1)', total: 5500, mode: 'Till (Buy Goods)', status: 'Completed' },
  ]);

  return (
    <div className="min-h-screen bg-slate-950 text-slate-100 flex flex-col">
      <Navbar />
      <main className="max-w-7xl w-full mx-auto p-6 space-y-6 flex-1">
        <div>
          <h1 className="text-2xl font-bold text-white">Sales History & Transactions</h1>
          <p className="text-xs text-slate-400 mt-1">Audit log of all completed orders across payment modes.</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 rounded-2xl shadow-sm overflow-hidden">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="bg-slate-800/50 border-b border-slate-800 text-slate-400 text-xs font-semibold uppercase">
                <th className="py-3 px-4">Receipt ID</th>
                <th className="py-3 px-4">Time</th>
                <th className="py-3 px-4">Items</th>
                <th className="py-3 px-4">Payment Mode</th>
                <th className="py-3 px-4">Total (KES)</th>
                <th className="py-3 px-4">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800 text-slate-300">
              {sales.map((s) => (
                <tr key={s.id} className="hover:bg-slate-800/40">
                  <td className="py-3.5 px-4 font-semibold text-white">{s.id}</td>
                  <td className="py-3.5 px-4 text-xs text-slate-400">{s.time}</td>
                  <td className="py-3.5 px-4 text-xs">{s.items}</td>
                  <td className="py-3.5 px-4 text-xs">
                    <span className="px-2 py-0.5 bg-slate-800 rounded text-slate-300">{s.mode}</span>
                  </td>
                  <td className="py-3.5 px-4 font-bold text-amber-400">KES {s.total.toLocaleString()}</td>
                  <td className="py-3.5 px-4 text-xs font-medium text-emerald-400">{s.status}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
