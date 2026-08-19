'use client';
import { useState } from 'react';
import Navbar from '@/components/Navbar';

export default function EtimsQueuePage() {
  const [syncStatus, setSyncStatus] = useState<'idle' | 'syncing' | 'synced'>('idle');

  const handleSync = () => {
    setSyncStatus('syncing');
    setTimeout(() => setSyncStatus('synced'), 2000);
  };

  return (
    <div className="min-h-screen bg-gray-50 text-gray-900">
      <Navbar />
      <main className="max-w-4xl mx-auto p-4 md:p-6">
        <div className="flex justify-between items-center mb-6">
          <h1 className="text-xl font-bold">eTIMS Submission Queue</h1>
          <button 
            onClick={handleSync}
            disabled={syncStatus === 'syncing'}
            className="px-4 py-2 bg-[#78350f] text-white rounded-md text-xs font-semibold hover:bg-[#60280b]"
          >
            {syncStatus === 'syncing' ? 'Syncing...' : 'Sync with KRA'}
          </button>
        </div>

        <div className="bg-white rounded-lg border border-gray-200 shadow-sm p-6 text-center">
            {syncStatus === 'synced' ? (
                <div className="text-green-600 font-medium">All invoices successfully synced with eTIMS.</div>
            ) : (
                <div className="text-gray-500">No pending invoices in queue.</div>
            )}
        </div>
      </main>
    </div>
  );
}
