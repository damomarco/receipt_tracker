import React, { useState, useRef } from 'react';
import { processReceiptImage } from '../services/geminiService';
import { Receipt, ExtractedReceiptData, CATEGORIES } from '../types';
import { CameraIcon, SpinnerIcon, XIcon, PhotoIcon, ReceiptIcon, PlusCircleIcon, TrashIcon } from './icons';

interface AddReceiptModalProps {
  onClose: () => void;
  onAddReceipt: (receipt: Omit<Receipt, 'id' | 'status'>) => void;
}

export const AddReceiptModal: React.FC<AddReceiptModalProps> = ({ onClose, onAddReceipt }) => {
  const [image, setImage] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [extractedData, setExtractedData] = useState<ExtractedReceiptData | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        const result = reader.result as string;
        setImage(result);
        processImage(result);
      };
      reader.readAsDataURL(file);
    }
  };

  const processImage = async (imageDataUrl: string) => {
    setIsLoading(true);
    setError(null);
    setExtractedData(null);
    try {
      const base64Image = imageDataUrl.split(',')[1];
      const data = await processReceiptImage(base64Image);
      setExtractedData(data);
    } catch (err: any) {
      setError(err.message || 'An unknown error occurred.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSave = () => {
    if (extractedData && image) {
      onAddReceipt({
        image,
        ...extractedData,
      });
    }
  };

  const handleDataChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (!extractedData) return;

    if(name.startsWith('merchant.')) {
        const key = name.split('.')[1] as 'original' | 'translated';
        setExtractedData(prev => prev ? { ...prev, merchant: { ...prev.merchant, [key]: value }} : null);
    } else {
        setExtractedData(prev => prev ? { ...prev, [name]: name === 'total' ? parseFloat(value) || 0 : value } : null);
    }
  };

  const handleItemChange = (index: number, field: 'translated' | 'original' | 'price', value: string) => {
    if (!extractedData) return;

    const newItems = [...extractedData.items];
    const itemToUpdate = { ...newItems[index] };

    if (field === 'price') {
      itemToUpdate.price = parseFloat(value) || 0;
    } else {
      itemToUpdate.description = { ...itemToUpdate.description, [field]: value };
    }
    
    newItems[index] = itemToUpdate;

    setExtractedData(prev => prev ? { ...prev, items: newItems } : null);
  };

  const handleAddItem = () => {
    if (!extractedData) return;
    const newItem = { description: { original: '', translated: '' }, price: 0 };
    setExtractedData(prev => prev ? { ...prev, items: [...(prev.items || []), newItem] } : null);
  }

  const handleRemoveItem = (index: number) => {
    if (!extractedData) return;
    const newItems = extractedData.items.filter((_, i) => i !== index);
    setExtractedData(prev => prev ? { ...prev, items: newItems } : null);
  }
  
  const triggerCameraInput = () => {
    cameraInputRef.current?.click();
  };

  const triggerGalleryInput = () => {
    galleryInputRef.current?.click();
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Add New Receipt</h2>
          <button onClick={onClose} className="p-2 rounded-full text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"><XIcon className="w-6 h-6"/></button>
        </div>

        <div className="p-6 overflow-y-auto">
          {!image ? (
            <div className="flex flex-col items-center justify-center h-64 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-center p-6">
              <ReceiptIcon className="w-16 h-16 text-gray-400 dark:text-gray-500 mb-4" />
              <h3 className="text-lg font-medium text-gray-700 dark:text-gray-200">Add a receipt</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400 mb-6">Choose how you'd like to add your receipt image.</p>
              <div className="flex flex-col sm:flex-row space-y-3 sm:space-y-0 sm:space-x-4 w-full justify-center">
                <button onClick={triggerCameraInput} className="flex items-center justify-center space-x-2 bg-blue-600 text-white font-bold py-3 px-6 rounded-lg hover:bg-blue-700 transition w-full sm:w-auto">
                    <CameraIcon className="w-6 h-6"/>
                    <span>Take Photo</span>
                </button>
                <button onClick={triggerGalleryInput} className="flex items-center justify-center space-x-2 bg-gray-700 text-white font-bold py-3 px-6 rounded-lg hover:bg-gray-800 transition w-full sm:w-auto">
                    <PhotoIcon className="w-6 h-6"/>
                    <span>From Gallery</span>
                </button>
              </div>
              <input
                ref={cameraInputRef}
                type="file"
                accept="image/*"
                capture="environment"
                onChange={handleFileChange}
                className="hidden"
              />
              <input
                ref={galleryInputRef}
                type="file"
                accept="image/*"
                onChange={handleFileChange}
                className="hidden"
              />
            </div>
          ) : (
            <div className="space-y-4">
              <div className="relative">
                <img src={image} alt="Receipt preview" className="w-full max-h-60 object-contain rounded-lg bg-gray-100 dark:bg-gray-700" />
                {isLoading && (
                  <div className="absolute inset-0 bg-white dark:bg-gray-800 bg-opacity-80 dark:bg-opacity-80 flex flex-col items-center justify-center rounded-lg">
                    <SpinnerIcon className="w-12 h-12 text-blue-600 dark:text-blue-400" />
                    <p className="mt-2 text-gray-700 dark:text-gray-200 font-medium">Analyzing receipt...</p>
                  </div>
                )}
              </div>
              
              {error && <div className="bg-red-100 border border-red-400 text-red-700 dark:bg-red-900/50 dark:border-red-700 dark:text-red-300 px-4 py-3 rounded relative" role="alert">{error}</div>}
              
              {extractedData && (
                <>
                  <div className="space-y-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Merchant (English)</label>
                      <input type="text" name="merchant.translated" value={extractedData.merchant.translated} onChange={handleDataChange} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Merchant (Original)</label>
                      <input type="text" name="merchant.original" value={extractedData.merchant.original} onChange={handleDataChange} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"/>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
                      <input type="date" name="date" value={extractedData.date} onChange={handleDataChange} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"/>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Category</label>
                        <select name="category" value={extractedData.category} onChange={handleDataChange} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                          {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                        </select>
                      </div>
                       <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Total Amount</label>
                        <input type="number" name="total" value={extractedData.total} onChange={handleDataChange} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"/>
                      </div>
                      <div>
                        <label className="block text-sm font-medium text-gray-700 dark:text-gray-300">Currency</label>
                        <input type="text" name="currency" value={extractedData.currency} onChange={handleDataChange} className="mt-1 block w-full border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"/>
                      </div>
                    </div>
                  </div>

                  <div className="mt-4 pt-4 border-t dark:border-gray-600">
                    <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">Items</h3>
                    <div className="space-y-2 max-h-32 overflow-y-auto pr-2">
                      {extractedData.items.map((item, index) => (
                        <div key={index} className="grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-5">
                            <input type="text" value={item.description.translated} onChange={(e) => handleItemChange(index, 'translated', e.target.value)} placeholder="Item (EN)" className="w-full text-sm p-1 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"/>
                          </div>
                          <div className="col-span-3">
                            <input type="text" value={item.description.original} onChange={(e) => handleItemChange(index, 'original', e.target.value)} placeholder="Item (JP)" className="w-full text-sm p-1 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"/>
                          </div>
                          <div className="col-span-3">
                            <input type="number" value={item.price} onChange={(e) => handleItemChange(index, 'price', e.target.value)} placeholder="Price" className="w-full text-sm p-1 border border-gray-300 dark:border-gray-500 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"/>
                          </div>
                          <div className="col-span-1 flex justify-end">
                            <button onClick={() => handleRemoveItem(index)} className="p-1 text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300" aria-label="Remove item"><TrashIcon className="w-5 h-5"/></button>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button onClick={handleAddItem} className="flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300 font-medium mt-3">
                        <PlusCircleIcon className="w-5 h-5" />
                        <span>Add Item</span>
                    </button>
                  </div>
                </>
              )}
            </div>
          )}
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end space-x-3">
          <button onClick={onClose} className="bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm transition">Cancel</button>
          <button onClick={handleSave} disabled={!extractedData || isLoading} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm transition disabled:bg-blue-300 disabled:cursor-not-allowed">
            {isLoading ? 'Processing...' : 'Save Receipt'}
          </button>
        </div>
      </div>
    </div>
  );
};