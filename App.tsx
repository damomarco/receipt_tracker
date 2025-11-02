import React, { useState, useEffect, useMemo, useRef } from 'react';
import { AddReceiptModal } from './components/AddReceiptModal';
import { Header } from './components/Header';
import { ReceiptList } from './components/ReceiptList';
import { PlusIcon, ChatBubbleIcon } from './components/icons';
import { useLocalStorage } from './hooks/useLocalStorage';
import { useOnlineStatus } from './hooks/useOnlineStatus';
import { Receipt, DEFAULT_CATEGORIES, Trip, Filters } from './types';
import { GlobalChatModal } from './components/GlobalChatModal';
import { ManageCategoriesModal } from './components/ManageCategoriesModal';
import { ManageTripsModal } from './components/ManageTripsModal';
import { ReceiptsProvider } from './contexts/ReceiptsContext';
import { saveImage, deleteImage } from './services/imageStore';
import { TripsProvider } from './contexts/TripsContext';
import { TripFilter } from './components/TripFilter';
import { SearchAndFilterBar } from './components/SearchAndFilterBar';
import { FilterModal } from './components/FilterModal';
import { ActiveFiltersDisplay } from './components/ActiveFiltersDisplay';

const initialFilters: Filters = {
  dateRange: { start: null, end: null },
  categories: [],
  amountRange: { min: null, max: null },
};

function App() {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isChatModalOpen, setIsChatModalOpen] = useState(false);
  const [isCategoriesModalOpen, setIsCategoriesModalOpen] = useState(false);
  const [isTripsModalOpen, setIsTripsModalOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);

  const [receipts, setReceipts] = useLocalStorage<Receipt[]>('receipts', []);
  const [customCategories, setCustomCategories] = useLocalStorage<string[]>('customCategories', []);
  const [trips, setTrips] = useLocalStorage<Trip[]>('trips', []);
  
  const [selectedTripId, setSelectedTripId] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filters, setFilters] = useState<Filters>(initialFilters);

  const isOnline = useOnlineStatus();
  const prevReceiptsCount = useRef(receipts.length);

  const allCategories = [...DEFAULT_CATEGORIES, ...customCategories].sort();

  useEffect(() => {
    if (isOnline) {
      const pendingReceipts = receipts.filter(r => r.status === 'pending');
      if (pendingReceipts.length > 0) {
        setReceipts(prev => prev.map(r => r.status === 'pending' ? { ...r, status: 'syncing' } : r));
        
        setTimeout(() => {
          setReceipts(prev => prev.map(r => r.status === 'syncing' ? { ...r, status: 'synced' } : r));
        }, 2500);
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
    setReceipts(prevReceipts => prevReceipts.filter(receipt => receipt.id !== id));
    try {
        await deleteImage(id);
    } catch (error) {
        console.error("Failed to delete receipt image:", error);
    }
  };

  const updateReceipt = (updatedReceipt: Receipt) => {
    setReceipts(prevReceipts => prevReceipts.map(r => r.id === updatedReceipt.id ? updatedReceipt : r));
  };

  const addCustomCategory = (name: string): boolean => {
    if (allCategories.some(c => c.toLowerCase() === name.toLowerCase())) return false;
    setCustomCategories(prev => [...prev, name]);
    return true;
  };

  const updateCustomCategory = (oldName: string, newName: string): boolean => {
    if (oldName.toLowerCase() !== newName.toLowerCase() && allCategories.some(c => c.toLowerCase() === newName.toLowerCase())) return false;
    setCustomCategories(prev => prev.map(c => (c === oldName ? newName : c)));
    setReceipts(prevReceipts =>
      prevReceipts.map(receipt => ({
        ...receipt,
        items: receipt.items ? receipt.items.map(item =>
          item.category === oldName ? { ...item, category: newName } : item
        ) : [],
      }))
    );
    return true;
  };

  const deleteCustomCategory = (name: string) => {
    setCustomCategories(prev => prev.filter(c => c !== name));
    setReceipts(prevReceipts =>
      prevReceipts.map(receipt => ({
        ...receipt,
        items: receipt.items ? receipt.items.map(item =>
          item.category === name ? { ...item, category: 'Other' } : item
        ) : [],
      }))
    );
  };
  
  const addTrip = (tripData: Omit<Trip, 'id'>) => {
    const newTrip: Trip = { id: new Date().toISOString() + Math.random(), ...tripData };
    setTrips(prev => [...prev, newTrip].sort((a, b) => new Date(b.startDate).getTime() - new Date(a.startDate).getTime()));
  };

  const updateTrip = (updatedTrip: Trip) => {
    setTrips(prev => prev.map(t => t.id === updatedTrip.id ? updatedTrip : t));
  };

  const deleteTrip = (id: string) => {
    if (selectedTripId === id) setSelectedTripId(null);
    setReceipts(prevReceipts => 
      prevReceipts.map(r => r.tripId === id ? { ...r, tripId: undefined } : r)
    );
    setTrips(prev => prev.filter(t => t.id !== id));
  };

  const pendingCount = receipts.filter(r => r.status === 'pending').length;
  const syncingCount = receipts.filter(r => r.status === 'syncing').length;

  const filteredReceipts = useMemo(() => {
    const lowerCaseSearchTerm = searchTerm.toLowerCase();

    return receipts.filter(r => {
      // 1. Trip Filter
      if (selectedTripId && r.tripId !== selectedTripId) return false;

      // 2. Search Term Filter
      if (lowerCaseSearchTerm) {
        const merchantOriginal = r.merchant?.original;
        const merchantTranslated = r.merchant?.translated;

        const inMerchant = (merchantOriginal && merchantOriginal.toLowerCase().includes(lowerCaseSearchTerm)) ||
                           (merchantTranslated && merchantTranslated.toLowerCase().includes(lowerCaseSearchTerm));

        const inItems = r.items?.some(item => {
          const originalDesc = item.description?.original;
          const translatedDesc = item.description?.translated;
          const originalMatch = originalDesc && originalDesc.toLowerCase().includes(lowerCaseSearchTerm);
          const translatedMatch = translatedDesc && translatedDesc.toLowerCase().includes(lowerCaseSearchTerm);
          return originalMatch || translatedMatch;
        }) ?? false;

        if (!inMerchant && !inItems) return false;
      }

      // 3. Advanced Filters
      const { dateRange, categories, amountRange } = filters;
      if (dateRange.start && r.date < dateRange.start) return false;
      if (dateRange.end && r.date > dateRange.end) return false;
      
      if (categories.length > 0) {
        const hasCategory = r.items?.some(item => categories.includes(item.category)) ?? false;
        if (!hasCategory) return false;
      }
      
      if (amountRange.min !== null && r.total < amountRange.min) return false;
      if (amountRange.max !== null && r.total > amountRange.max) return false;

      return true;
    });
  }, [receipts, selectedTripId, searchTerm, filters]);
  
  const selectedTripName = useMemo(() => {
    return trips.find(t => t.id === selectedTripId)?.name || null;
  }, [selectedTripId, trips]);

  const categoriesInUse = useMemo(() => {
    const usedCategories = new Set<string>();
    receipts.forEach(receipt => {
      if (receipt.items) {
        receipt.items.forEach(item => {
          usedCategories.add(item.category);
        });
      }
    });
    return Array.from(usedCategories).sort();
  }, [receipts]);
  
  const clearAllFilters = () => {
    setFilters(initialFilters);
  };
  
  const removeFilter = (filterType: keyof Filters, valueToRemove?: any) => {
    setFilters(prev => {
      const newFilters = { ...prev };
      if (filterType === 'categories' && valueToRemove) {
        newFilters.categories = newFilters.categories.filter(c => c !== valueToRemove);
      } else if (filterType === 'dateRange') {
        newFilters.dateRange = { start: null, end: null };
      } else if (filterType === 'amountRange') {
        newFilters.amountRange = { min: null, max: null };
      }
      return newFilters;
    });
  };

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
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div className="md:col-span-1">
                 <TripFilter 
                    selectedTripId={selectedTripId} 
                    onTripChange={setSelectedTripId}
                  />
              </div>
              <div className="md:col-span-3">
                 <SearchAndFilterBar
                    searchTerm={searchTerm}
                    onSearchTermChange={setSearchTerm}
                    onFilterClick={() => setIsFilterModalOpen(true)}
                    activeFilterCount={
                      (filters.dateRange.start ? 1 : 0) + 
                      filters.categories.length + 
                      (filters.amountRange.min !== null || filters.amountRange.max !== null ? 1 : 0)
                    }
                  />
                  <ActiveFiltersDisplay 
                    filters={filters} 
                    onClearAll={clearAllFilters} 
                    onRemoveFilter={removeFilter} 
                  />
                 <ReceiptList 
                    totalReceiptCount={receipts.length}
                    filteredReceiptCount={filteredReceipts.length}
                    searchTerm={searchTerm}
                  />
              </div>
            </div>
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

          {isFilterModalOpen && (
            <FilterModal
              onClose={() => setIsFilterModalOpen(false)}
              onApplyFilters={setFilters}
              currentFilters={filters}
              availableCategories={categoriesInUse}
            />
          )}
        </div>
      </TripsProvider>
    </ReceiptsProvider>
  );
}

export default App;