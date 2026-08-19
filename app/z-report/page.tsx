'use client';

import React from 'react';
import Navbar from '../components/Navbar';

export default function ZReportPage() {
  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <main className="max-w-7xl mx-auto p-6">
        <h1 className="text-3xl font-extrabold text-gray-900 mb-6">Daily Z-Report</h1>
        
        <div className="bg-white shadow-md rounded-lg p-6 mb-6">
          <h2 className="text-xl font-bold text-gray-800 mb-4">Summary of Sales</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="bg-blue-50 p-4 rounded-lg border border-blue-100">
              <p className="text-sm text-blue-600 font-medium">Total Cash Sales</p>
              <p className="text-2xl font-bold text-blue-900">KES 0.00</p>
            </div>
            <div className="bg-green-50 p-4 rounded-lg border border-green-100">
              <p className="text-sm text-green-600 font-medium">Total M-Pesa Sales</p>
              <p className="text-2xl font-bold text-green-900">KES 0.00</p>
            </div>
            <div className="bg-purple-50 p-4 rounded-lg border border-purple-100">
              <p className="text-sm text-purple-600 font-medium">Total Revenue</p>
              <p className="text-2xl font-bold text-purple-900">KES 0.00</p>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
