import React, { useState, useRef, useEffect } from 'react';
import { processReceiptImage } from '../services/geminiService';
import { ExtractedReceiptData, ReceiptItemData, Receipt } from '../types';
import { PhotoIcon, XIcon, SpinnerIcon, TrashIcon, PlusCircleIcon, CameraIcon } from './icons';

interface AddReceiptModalProps {
  onClose: () => void;
  onAddReceipt: (receipt: Omit<Receipt, 'id' | 'status'>) => void;
  allCategories: string[];
}

export const AddReceiptModal: React.FC<AddReceiptModalProps> = ({ onClose, onAddReceipt, allCategories }) => {
  const [image, setImage] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [receiptData, setReceiptData] = useState<ExtractedReceiptData | null>(null);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    // Attempt to get the user's location when the modal is opened.
    // This will be used as a hint for the AI.
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
          });
        },
        (error) => {
          // User likely denied permission or an error occurred.
          // Proceed gracefully without location data.
          console.warn(`Could not get geolocation: ${error.message}`);
          setUserLocation(null);
        }
      );
    }
  }, []); // Run only once when the modal mounts

  const handleImageChange = async (file: File) => {
    if (!file) return;

    setIsLoading(true);
    setError(null);
    setReceiptData(null);

    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Image = (reader.result as string).split(',')[1];
        setImage(reader.result as string);
        try {
          // Pass the user's location to the processing service
          const data = await processReceiptImage(base64Image, allCategories, userLocation);
          setReceiptData(data);
        } catch (e: any) {
          setError(e.message || "Failed to process the receipt.");
          setImage(null);
        } finally {
          setIsLoading(false);
        }
      };
      reader.readAsDataURL(file);
    } catch (e: any) {
      setError(e.message || "Failed to handle image.");
      setIsLoading(false);
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files[0]) {
      handleImageChange(event.target.files[0]);
    }
    // Reset file input to allow selecting the same file again
    if(event.target) {
      event.target.value = '';
    }
  };

  const handleLocationChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (receiptData) {
      setReceiptData({
        ...receiptData,
        location: {
          determined: e.target.value,
          suggestions: receiptData.location?.suggestions || [],
        }
      });
    }
  };

  const handleSuggestionClick = (suggestion: string) => {
    if (receiptData && receiptData.location) {
      const currentDetermined = receiptData.location.determined.toLowerCase();
      const suggestionsLower = receiptData.location.suggestions.map(s => s.toLowerCase());

      let newLocationValue = suggestion;
      // If the current determined value doesn't seem to be one of the countries, prepend it.
      if (currentDetermined && !suggestionsLower.some(s => currentDetermined.includes(s))) {
        newLocationValue = `${receiptData.location.determined}, ${suggestion}`;
      }

      setReceiptData({
        ...receiptData,
        location: {
          ...receiptData.location,
          determined: newLocationValue,
        },
      });
    }
  };
  
  const handleItemChange = (index: number, field: keyof ReceiptItemData, value: any) => {
    if (receiptData) {
      const newItems = [...receiptData.items];
      const itemToUpdate = { ...newItems[index] };

      if (field === 'description') {
        itemToUpdate.description = { ...itemToUpdate.description, translated: value };
      } else {
        (itemToUpdate as any)[field] = value;
      }
      
      newItems[index] = itemToUpdate;
      // Also update total if an item price changes
      const newTotal = newItems.reduce((acc, item) => acc + (Number(item.price) || 0), 0);
      setReceiptData({ ...receiptData, items: newItems, total: newTotal });
    }
  };

  const handleAddItem = () => {
    if (receiptData) {
        const newItem: ReceiptItemData = {
            description: { original: '', translated: '' },
            price: 0,
            category: 'Other'
        };
        setReceiptData({ ...receiptData, items: [...receiptData.items, newItem] });
    }
  };

  const handleRemoveItem = (index: number) => {
    if (receiptData) {
      const newItems = receiptData.items.filter((_, i) => i !== index);
      // Also update total
      const newTotal = newItems.reduce((acc, item) => acc + (Number(item.price) || 0), 0);
      setReceiptData({ ...receiptData, items: newItems, total: newTotal });
    }
  };

  const handleSubmit = () => {
    if (receiptData && image) {
      const finalReceipt: Omit<Receipt, 'id' | 'status'> = {
        image: image,
        merchant: receiptData.merchant,
        date: receiptData.date,
        location: receiptData.location?.determined || '',
        total: receiptData.total,
        currency: receiptData.currency,
        items: receiptData.items,
      };
      onAddReceipt(finalReceipt);
    }
  };

  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: scale(0.95); }
          to { opacity: 1; transform: scale(1); }
        }
        .animate-fade-in {
          animation: fade-in 0.2s ease-out;
        }
      `}</style>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Add New Receipt</h2>
          <button onClick={onClose} className="p-2 rounded-full text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"><XIcon className="w-6 h-6"/></button>
        </div>

        <div className="p-6 overflow-y-auto">
          {!receiptData && (
            <div className="flex flex-col items-center justify-center space-y-4">
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileSelect} className="hidden" />
              <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleFileSelect} className="hidden" />

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                <button
                  onClick={() => cameraInputRef.current?.click()}
                  className="flex flex-col items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
                >
                  <CameraIcon className="w-10 h-10 mb-2" />
                  <span className="font-semibold">Take a photo</span>
                </button>
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="flex flex-col items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800"
                >
                  <PhotoIcon className="w-10 h-10 mb-2" />
                  <span className="font-semibold">Upload a photo</span>
                </button>
              </div>
              
              {isLoading && (
                <div className="flex flex-col items-center space-y-2 mt-4 text-gray-600 dark:text-gray-300">
                  <SpinnerIcon className="w-8 h-8"/>
                  <p>Analyzing receipt... this may take a moment.</p>
                </div>
              )}
              {error && <p className="text-red-500 text-sm mt-4 p-2 bg-red-50 dark:bg-red-900/50 rounded-md">{error}</p>}
            </div>
          )}

          {receiptData && (
            <div className="space-y-4">
              {image && <img src={image} alt="Receipt preview" className="rounded-md max-h-48 w-full object-contain bg-gray-100 dark:bg-gray-900 p-2" />}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Merchant</label>
                    <input type="text" value={receiptData.merchant.translated} onChange={(e) => setReceiptData({ ...receiptData, merchant: { ...receiptData.merchant, translated: e.target.value }})} className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                    <input type="date" value={receiptData.date} max={today} onChange={(e) => setReceiptData({ ...receiptData, date: e.target.value })} className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
                    <input 
                      type="text" 
                      value={receiptData.location?.determined || ''} 
                      onChange={handleLocationChange} 
                      placeholder="e.g., Tokyo, Japan" 
                      className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" 
                    />
                    {receiptData.location?.suggestions && receiptData.location.suggestions.length > 0 && (
                      <div className="mt-2">
                        <p className="text-xs text-gray-500 dark:text-gray-400">AI is unsure about the country. Did you mean one of these?</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {receiptData.location.suggestions.map((suggestion, index) => (
                            <button
                              key={index}
                              onClick={() => handleSuggestionClick(suggestion)}
                              className="px-3 py-1 text-sm bg-blue-100 text-blue-800 rounded-full hover:bg-blue-200 dark:bg-blue-900/50 dark:text-blue-200 dark:hover:bg-blue-900 transition"
                            >
                              {suggestion}
                            </button>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Currency</label>
                    <input type="text" value={receiptData.currency} onChange={(e) => setReceiptData({ ...receiptData, currency: e.target.value })} className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                  </div>
                  <div className="">
                    <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Total</label>
                    <input type="number" step="0.01" readOnly value={receiptData.total} className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm sm:text-sm bg-gray-100 dark:bg-gray-900/50 text-gray-900 dark:text-white cursor-not-allowed" />
                  </div>
              </div>
              <div>
                <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">Items</h3>
                <div className="space-y-3">
                  {receiptData.items.map((item, index) => (
                    <div key={index} className="grid grid-cols-12 gap-2 items-center">
                      <div className="col-span-5">
                        <input type="text" placeholder="Item name" value={item.description.translated} onChange={(e) => handleItemChange(index, 'description', e.target.value)} className="w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                      </div>
                      <div className="col-span-3">
                        <input type="number" step="0.01" placeholder="Price" value={item.price} onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)} className="w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                      </div>
                      <div className="col-span-3">
                        <select value={item.category} onChange={(e) => handleItemChange(index, 'category', e.target.value)} className="w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                            {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                      </div>
                      <div className="col-span-1">
                        <button onClick={() => handleRemoveItem(index)} className="text-red-500 hover:text-red-700"><TrashIcon className="w-5 h-5"/></button>
                      </div>
                    </div>
                  ))}
                </div>
                <button onClick={handleAddItem} className="mt-3 flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                    <PlusCircleIcon className="w-5 h-5"/>
                    <span>Add Item</span>
                </button>
              </div>
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end space-x-3">
          <button onClick={onClose} className="bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm transition">Cancel</button>
          <button onClick={handleSubmit} disabled={!receiptData || isLoading} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm transition disabled:bg-blue-300 dark:disabled:bg-blue-800 disabled:cursor-not-allowed">
            {isLoading ? 'Saving...' : 'Save Receipt'}
          </button>
        </div>
      </div>
    </div>
  );
};