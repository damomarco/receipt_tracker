import React, { useState, useEffect } from 'react';
import { AddReceiptModal } from './components/AddReceiptModal';
import { Header } from './components/Header';
import { ReceiptList } from './components/ReceiptList';
import { PlusIcon, ChatBubbleIcon } from './components/icons';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { Receipt } from './types';
import { GlobalChatModal } from './components/GlobalChatModal';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [receipts, setReceipts] = useLocalStorage<Receipt[]>('receipts', []);
  const isOnline = useOnlineStatus();

  useEffect(() => {
    // One-time data migration for categories
    setReceipts(prevReceipts => {
        let hasChanged = false;
        const migratedReceipts = prevReceipts.map(r => {
            if (!(r as any).category) {
                hasChanged = true;
                return { ...r, category: 'Other' };
            }
            return r;
        });
        return hasChanged ? migratedReceipts : prevReceipts;
    });
  }, [setReceipts]);


  useEffect(() => {
    if (isOnline) {
      const pendingReceipts = receipts.filter(r => r.status === 'pending');
      if (pendingReceipts.length > 0) {
        // Mark as syncing
        setReceipts(prev => prev.map(r => r.status === 'pending' ? { ...r, status: 'syncing' } : r));
        
        // Simulate API upload and mark as synced
        setTimeout(() => {
          setReceipts(prev => prev.map(r => r.status === 'syncing' ? { ...r, status: 'synced' } : r));
        }, 2500); // Simulate 2.5 second sync time
      }
    }
  }, [isOnline, receipts, setReceipts]);

  const addReceipt = (newReceiptData: Omit<Receipt, 'id' | 'status'>) => {
    const newReceipt: Receipt = {
      id: new Date().toISOString() + Math.random(), // Add random number to ensure unique ID
      ...newReceiptData,
      items: newReceiptData.items || [], // Ensure items is always an array
      status: isOnline ? 'synced' : 'pending',
    };
    setReceipts(prevReceipts => [...prevReceipts, newReceipt].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setIsModalOpen(false);
  };
  
  const deleteReceipt = (id: string) => {
    setReceipts(prevReceipts => prevReceipts.filter(receipt => receipt.id !== id));
  };

  const updateReceipt = (updatedReceipt: Receipt) => {
    setReceipts(prevReceipts => prevReceipts.map(r => r.id === updatedReceipt.id ? updatedReceipt : r));
  };

  const pendingCount = receipts.filter(r => r.status === 'pending').length;
  const syncingCount = receipts.filter(r => r.status === 'syncing').length;

  return (
    <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
      <Header isOnline={isOnline} pendingCount={pendingCount} syncingCount={syncingCount} />
      <main className="flex-grow container mx-auto p-4 md:p-6">
        <ReceiptList receipts={receipts} onDelete={deleteReceipt} onUpdate={updateReceipt} />
      </main>
      
      <button
        onClick={() => setIsChatModalOpen(true)}
        className="fixed bottom-6 left-6 bg-purple-600 hover:bg-purple-700 text-white rounded-full p-4 shadow-lg transition-transform transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-purple-300 dark:focus:ring-purple-800 z-50"
        aria-label="Ask about all receipts"
      >
        <ChatBubbleIcon className="w-8 h-8" />
      </button>

      <button
        onClick={() => setIsModalOpen(true)}
        className="fixed bottom-6 right-6 bg-blue-600 hover:bg-blue-700 text-white rounded-full p-4 shadow-lg transition-transform transform hover:scale-110 focus:outline-none focus:ring-4 focus:ring-blue-300 dark:focus:ring-blue-800 z-50"
        aria-label="Add new receipt"
      >
        <PlusIcon className="w-8 h-8" />
      </button>

      {isModalOpen && (
        <AddReceiptModal
          onClose={() => setIsModalOpen(false)}
          onAddReceipt={addReceipt}
        />
      )}

      {isChatModalOpen && (
        <GlobalChatModal
          receipts={receipts}
          onClose={() => setIsChatModalOpen(false)}
        />
      )}
    </div>
  );
}

export default App;
