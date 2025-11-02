import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AddReceiptModal } from './components/AddReceiptModal';
import { Header } from './components/Header';
import { ReceiptList } from './components/ReceiptList';
import { PlusIcon, ChatBubbleIcon } from './components/icons';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { Receipt, DEFAULT_CATEGORIES, Trip } from './types';
import { GlobalChatModal } from './components/GlobalChatModal';
import { ManageCategoriesModal } from './components/ManageCategoriesModal';
import { ManageTripsModal } from './components/ManageTripsModal';
import { ReceiptsProvider } from './contexts/ReceiptsContext';
import { saveImage, deleteImage } from './services/imageStore';
import { TripsProvider } from './contexts/TripsContext';
import { TripFilter } from './components/TripFilter';

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [isTripsModalOpen, setIsTripsModalOpen] = useState(false);

  const [receipts, setReceipts] = useLocalStorage<Receipt[]>('receipts', []);
  const [customCategories, setCustomCategories] = useLocalStorage<string[]>('customCategories', []);
  const [trips, setTrips] = useLocalStorage<Trip[]>('trips', []);
  
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null); // null means "All Receipts"
  const isOnline = useOnlineStatus();
  const prevReceiptsCount = useRef(receipts.length);

  const allCategories = [...DEFAULT_CATEGORIES, ...customCategories].sort();

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
  
  const addMultipleReceipts = async (receiptsToAdd: { receiptData: Omit<Receipt, 'id' | 'status'>, imageBase64: string, tripId?: string }[]) => {
    const newReceipts: Receipt[] = [];
    for (const { receiptData, imageBase64, tripId } of receiptsToAdd) {
        const newReceipt: Receipt = {
            id: new Date().toISOString() + Math.random(),
            ...receiptData,
            items: receiptData.items || [],
            status: isOnline ? 'synced' : 'pending',
            tripId: tripId || undefined,
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
  
  // Trip Management
  const addTrip = (tripData: Omit<Trip, 'id'>) => {
    const newTrip: Trip = {
      id: new Date().toISOString() + Math.random(),
      ...tripData,
    };
    setTrips(prev => [...prev, newTrip].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()));
  };

  const updateTrip = (updatedTrip: Trip) => {
    setTrips(prev => prev.map(t => t.id === updatedTrip.id ? updatedTrip : t));
  };

  const deleteTrip = (id: string) => {
    // If we're deleting the currently selected trip, reset the filter
    if (selectedTripId === id) {
      setSelectedTripId(null);
    }
    // First, un-assign this trip from all receipts
    setReceipts(prevReceipts => 
      prevReceipts.map(r => r.tripId === id ? { ...r, tripId: undefined } : r)
    );
    // Then, delete the trip itself
    setTrips(prev => prev.filter(t => t.id !== id));
  };


  const pendingCount = receipts.filter(r => r.status === 'pending').length;
  const syncingCount = receipts.filter(r => r.status === 'syncing').length;

  const filteredReceipts = useMemo(() => {
    if (!selectedTripId) {
      return receipts; // "All Receipts" selected
    }
    return receipts.filter(r => r.tripId === selectedTripId);
  }, [receipts, selectedTripId]);
  
  const selectedTripName = useMemo(() => {
    return trips.find(t => t.id === selectedTripId)?.name || null;
  }, [selectedTripId, trips]);

  const receiptsContextValue = {
    receipts: filteredReceipts,
    deleteReceipt,
    updateReceipt,
    allCategories,
  };

  const tripsContextValue = {
    trips: trips.sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()),
  };

  return (
    <ReceiptsProvider value={receiptsContextValue}>
      <TripsProvider value={tripsContextValue}>
        <div className="min-h-screen bg-gray-50 dark:bg-gray-950 flex flex-col">
          <Header 
            isOnline={isOnline} 
            pendingCount={pendingCount} 
            syncingCount={syncingCount}
            onManageCategories={() => setIsCategoriesModalOpen(true)}
            onManageTrips={() => setIsTripsModalOpen(true)}
            selectedTripName={selectedTripName}
          />
          <main className="flex-grow container mx-auto p-4 md:p-6">
            <TripFilter 
              selectedTripId={selectedTripId} 
              onTripChange={setSelectedTripId}
            />
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
              onManageTrips={() => setIsTripsModalOpen(true)}
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

          {isTripsModalOpen && (
            <ManageTripsModal
              onClose={() => setIsTripsModalOpen(false)}
              onAddTrip={addTrip}
              onUpdateTrip={updateTrip}
              onDeleteTrip={deleteTrip}
            />
          )}
        </div>
      </TripsProvider>
    </ReceiptsProvider>
  );
}

export default App;
