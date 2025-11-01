
import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AddReceiptModal } from './components/AddReceiptModal';
import { Header } from './components/Header';
import { ReceiptList } from './components/ReceiptList';
import { PlusIcon, ChatBubbleIcon } from './components/icons';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { Receipt, DEFAULT_CATEGORIES } from './types';
import { GlobalChatModal } from './components/GlobalChatModal';
import { SpendingSummary } from './components/SpendingSummary';
import { ManageCategoriesModal } from './components/ManageCategoriesModal';
import { ReceiptsProvider } from './contexts/ReceiptsContext';
import { saveImage, deleteImage } from './services/imageStore';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [receipts, setReceipts] = useLocalStorage<Receipt[]>('receipts', []);
  const [customCategories, setCustomCategories] = useLocalStorage<string[]>('customCategories', []);
  const [dateFilter, setDateFilter] = useState({ start: '', end: '' });
  const isOnline = useOnlineStatus();
  const prevReceiptsCount = useRef(receipts.length);

  const allCategories = [...DEFAULT_CATEGORIES, ...customCategories].sort();

  useEffect(() => {
    const wasEmpty = prevReceiptsCount.current === 0;
    const isEmpty = receipts.length === 0;

    // Prefill date filter on initial load or when adding the first receipt
    if (wasEmpty && !isEmpty) {
      let min = receipts[0].date;
      let max = receipts[0].date;
      receipts.forEach(receipt => {
        if (receipt.date < min) min = receipt.date;
        if (receipt.date > max) max = receipt.date;
      });
      setDateFilter({ start: min, end: max });
    } 
    // Clear date filter when the last receipt is deleted
    else if (!wasEmpty && isEmpty) {
      setDateFilter({ start: '', end: '' });
    }

    // Update the ref for the next render cycle
    prevReceiptsCount.current = receipts.length;
  }, [receipts]);

  useEffect(() => {
    // One-time data migration for item-level categories
    setReceipts(prevReceipts => {
        let hasChanged = false;
        const migratedReceipts = prevReceipts.map(r => {
            // Check if the receipt has the old structure (top-level category)
            // and items that don't have categories yet.
            if ((r as any).category && r.items && r.items.every(item => !(item as any).category)) {
                hasChanged = true;
                const newItems = r.items.map(item => ({
                    ...item,
                    category: (r as any).category, // Assign parent category to each item
                }));
                const newReceipt = { ...r, items: newItems };
                delete (newReceipt as any).category; // Remove old top-level category
                return newReceipt;
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

  const addReceipt = async (newReceiptData: Omit<Receipt, 'id' | 'status'>, imageBase64: string) => {
    const newReceipt: Receipt = {
      id: new Date().toISOString() + Math.random(), // Add random number to ensure unique ID
      ...newReceiptData,
      items: newReceiptData.items || [], // Ensure items is always an array
      status: isOnline ? 'synced' : 'pending',
    };
    
    try {
      // Save the large image data to IndexedDB first
      await saveImage(newReceipt.id, imageBase64);
      // Then, save the smaller receipt metadata to localStorage
      setReceipts(prevReceipts => [...prevReceipts, newReceipt].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    } catch (error) {
        console.error("Failed to save receipt image:", error);
        // Handle the error, maybe show a notification to the user
    }
  };
  
  const addMultipleReceipts = async (receiptsToAdd: { receiptData: Omit<Receipt, 'id' | 'status'>, imageBase64: string }[]) => {
    const newReceipts: Receipt[] = [];
    for (const { receiptData, imageBase64 } of receiptsToAdd) {
        const newReceipt: Receipt = {
            id: new Date().toISOString() + Math.random(),
            ...receiptData,
            items: receiptData.items || [],
            status: isOnline ? 'synced' : 'pending',
        };
        try {
            await saveImage(newReceipt.id, imageBase64);
            newReceipts.push(newReceipt);
        } catch (error) {
            console.error(`Failed to save image for receipt. Skipping this receipt.`, error);
        }
    }

    setReceipts(prevReceipts => [...prevReceipts, ...newReceipts].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()));
    setIsModalOpen(false);
};

  
  const deleteReceipt = async (id: string) => {
    // First remove metadata from localStorage
    setReceipts(prevReceipts => prevReceipts.filter(receipt => receipt.id !== id));
    try {
        // Then remove the image from IndexedDB
        await deleteImage(id);
    } catch (error) {
        console.error("Failed to delete receipt image:", error);
        // If this fails, we might have an orphaned image, but the app will still function.
    }
  };

  const updateReceipt = (updatedReceipt: Receipt) => {
    setReceipts(prevReceipts => prevReceipts.map(r => r.id === updatedReceipt.id ? updatedReceipt : r));
  };

  const addCustomCategory = (name: string): boolean => {
    if (allCategories.some(c => c.toLowerCase() === name.toLowerCase())) {
      return false; // Indicate that the category already exists
    }
    setCustomCategories(prev => [...prev, name]);
    return true;
  };

  const updateCustomCategory = (oldName: string, newName: string): boolean => {
    if (oldName.toLowerCase() !== newName.toLowerCase() && allCategories.some(c => c.toLowerCase() === newName.toLowerCase())) {
      return false; // Indicate that the new name already exists
    }
    // Update the category in the custom categories list
    setCustomCategories(prev => prev.map(c => (c === oldName ? newName : c)));

    // Cascade the update to all receipt items
    setReceipts(prevReceipts =>
      prevReceipts.map(receipt => ({
        ...receipt,
        items: receipt.items.map(item =>
          item.category === oldName ? { ...item, category: newName } : item
        ),
      }))
    );
    return true;
  };

  const deleteCustomCategory = (name: string) => {
    // Remove the category from the custom list
    setCustomCategories(prev => prev.filter(c => c !== name));
    
    // Re-assign items with this category to 'Other'
    setReceipts(prevReceipts =>
      prevReceipts.map(receipt => ({
        ...receipt,
        items: receipt.items.map(item =>
          item.category === name ? { ...item, category: 'Other' } : item
        ),
      }))
    );
  };

  const pendingCount = receipts.filter(r => r.status === 'pending').length;
  const syncingCount = receipts.filter(r => r.status === 'syncing').length;

  const filteredReceipts = useMemo(() => {
    if (!dateFilter.start && !dateFilter.end) {
      return receipts;
    }
    return receipts.filter(receipt => {
      const receiptDate = receipt.date;
      const isAfterStart = !dateFilter.start || receiptDate >= dateFilter.start;
      const isBeforeEnd = !dateFilter.end || receiptDate <= dateFilter.end;
      return isAfterStart && isBeforeEnd;
    });
  }, [receipts, dateFilter]);

  const receiptsContextValue = {
    receipts: filteredReceipts,
    deleteReceipt,
    updateReceipt,
    allCategories,
  };

  return (
    <ReceiptsProvider value={receiptsContextValue}>
      <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
        <Header 
          isOnline={isOnline} 
          pendingCount={pendingCount} 
          syncingCount={syncingCount}
          onManageCategories={() => setIsCategoriesModalOpen(true)}
        />
        <main className="flex-grow container mx-auto p-4 md:p-6">
          <SpendingSummary dateFilter={dateFilter} setDateFilter={setDateFilter} />
          <ReceiptList totalReceiptCount={receipts.length} />
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
            onAddReceipts={addMultipleReceipts}
            allCategories={allCategories}
          />
        )}

        {isChatModalOpen && (
          <GlobalChatModal
            onClose={() => setIsChatModalOpen(false)}
          />
        )}

        {isCategoriesModalOpen && (
          <ManageCategoriesModal
            onClose={() => setIsCategoriesModalOpen(false)}
            defaultCategories={DEFAULT_CATEGORIES}
            customCategories={customCategories}
            onAddCategory={addCustomCategory}
            onUpdateCategory={updateCustomCategory}
            onDeleteCategory={deleteCustomCategory}
          />
        )}
      </div>
    </ReceiptsProvider>
  );
}

export default App;
