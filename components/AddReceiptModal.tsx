

import React, { useState, useRef, useEffect } from 'react';
import { processReceiptImage } from '../services/geminiService';
import { ExtractedReceiptData, ReceiptItemData, Receipt } from '../types';
import { PhotoIcon, XIcon, SpinnerIcon, TrashIcon, PlusCircleIcon, CameraIcon, CheckCircleIcon } from './icons';

interface AddReceiptModalProps {
  onClose: () => void;
  onAddReceipts: (receipts: { receiptData: Omit<Receipt, 'id' | 'status'>, imageBase64: string }[]) => void;
  allCategories: string[];
}

type ProcessStatus = 'queued' | 'processing' | 'done' | 'error';

interface ProcessQueueItem {
    file: File;
    status: ProcessStatus;
    imageDataUrl: string;
    data?: ExtractedReceiptData;
    error?: string;
}

const fileToBase64 = (file: File): Promise<string> => {
    return new Promise((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => resolve(reader.result as string);
        reader.onerror = error => reject(error);
        reader.readAsDataURL(file);
    });
};

export const AddReceiptModal: React.FC<AddReceiptModalProps> = ({ onClose, onAddReceipts, allCategories }) => {
  const [queue, setQueue] = useState<ProcessQueueItem[]>([]);
  const [userLocation, setUserLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const cameraInputRef = useRef<HTMLInputElement>(null);
  const isProcessingRef = useRef(false);

  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => setUserLocation({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
        (error) => console.warn(`Could not get geolocation: ${error.message}`)
      );
    }
  }, []);

  useEffect(() => {
    const processNextInQueue = async () => {
        if (isProcessingRef.current) return;
        const nextItemIndex = queue.findIndex(item => item.status === 'queued');
        if (nextItemIndex === -1) return;

        isProcessingRef.current = true;
        
        setQueue(prev => prev.map((item, index) => 
            index === nextItemIndex ? { ...item, status: 'processing' } : item
        ));
        
        const itemToProcess = queue[nextItemIndex];
        
        try {
            const base64Image = itemToProcess.imageDataUrl.split(',')[1];
            const data = await processReceiptImage(base64Image, allCategories, userLocation);
            setQueue(prev => prev.map((item, index) => 
                index === nextItemIndex ? { ...item, status: 'done', data } : item
            ));
        } catch (e: any) {
            setQueue(prev => prev.map((item, index) => 
                index === nextItemIndex ? { ...item, status: 'error', error: e.message || "Failed to process receipt." } : item
            ));
        } finally {
            isProcessingRef.current = false;
        }
    };
    
    processNextInQueue();
  }, [queue, allCategories, userLocation]);

  const handleFilesSelected = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    
    const newItems: ProcessQueueItem[] = await Promise.all(
        Array.from(files).map(async file => ({
            file,
            status: 'queued' as ProcessStatus,
            imageDataUrl: await fileToBase64(file),
        }))
    );
    setQueue(prev => [...prev, ...newItems]);
  };

  const handleFileSelectEvent = (event: React.ChangeEvent<HTMLInputElement>) => {
    handleFilesSelected(event.target.files);
    if(event.target) event.target.value = '';
  };

  const handleItemChange = (itemIndex: number, field: keyof ExtractedReceiptData, value: any) => {
    setQueue(prev => prev.map((item, index) => {
      if (index === itemIndex && item.data) {
        const newData = { ...item.data, [field]: value };
        return { ...item, data: newData };
      }
      return item;
    }));
  };
  
  // FIX: Corrected the generic signature for handleNestedItemChange to properly type nested object updates.
  const handleNestedItemChange = <
    K extends 'merchant' | 'location'
  >(
    itemIndex: number,
    parentField: K,
    field: keyof NonNullable<ExtractedReceiptData[K]>,
    value: any
  ) => {
     setQueue(prev => prev.map((item, index) => {
      if (index === itemIndex && item.data) {
        const parentObj = item.data[parentField] || {};
        const newParent = { ...parentObj, [field]: value };
        const newData = { ...item.data, [parentField]: newParent };
        return { ...item, data: newData };
      }
      return item;
    }));
  };

  const handleReceiptItemChange = (itemIndex: number, rItemIndex: number, field: keyof ReceiptItemData, value: any) => {
    setQueue(prev => prev.map((item, index) => {
      if (index === itemIndex && item.data) {
        const newItems = [...item.data.items];
        const itemToUpdate = { ...newItems[rItemIndex] };
        if (field === 'description') {
            itemToUpdate.description = { ...itemToUpdate.description, translated: value };
        } else {
            (itemToUpdate as any)[field] = value;
        }
        newItems[rItemIndex] = itemToUpdate;
        const newTotal = newItems.reduce((acc, current) => acc + (Number(current.price) || 0), 0);
        const newData = { ...item.data, items: newItems, total: newTotal };
        return { ...item, data: newData };
      }
      return item;
    }));
  };
  
  const handleRemoveFromQueue = (itemIndex: number) => {
    setQueue(prev => prev.filter((_, index) => index !== itemIndex));
  };

  const handleSubmit = () => {
    const receiptsToSave = queue
      .filter(item => item.status === 'done' && item.data)
      .map(item => {
        const { data, imageDataUrl } = item;
        const receiptData: Omit<Receipt, 'id' | 'status'> = {
            merchant: data!.merchant,
            date: data!.date,
            location: data!.location?.determined || '',
            total: data!.total,
            currency: data!.currency,
            items: data!.items,
        };
        return { receiptData, imageBase64: imageDataUrl };
      });

    if (receiptsToSave.length > 0) {
      onAddReceipts(receiptsToSave);
    } else {
      onClose(); // Close if nothing to save
    }
  };

  const today = new Date().toISOString().split('T')[0];
  const doneCount = queue.filter(item => item.status === 'done').length;
  const processingCount = queue.filter(item => item.status === 'processing').length;
  const isAnythingProcessing = processingCount > 0;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4 animate-fade-in">
      <style>{`@keyframes fade-in { from { opacity: 0; } to { opacity: 1; } } .animate-fade-in { animation: fade-in 0.2s; }`}</style>
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-2xl max-h-[90vh] flex flex-col" onClick={(e) => e.stopPropagation()}>
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Add New Receipt(s)</h2>
          <button onClick={onClose} className="p-2 rounded-full text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"><XIcon className="w-6 h-6"/></button>
        </div>

        <div className="p-6 overflow-y-auto">
          {queue.length === 0 && (
            <div className="flex flex-col items-center justify-center space-y-4">
              <input type="file" accept="image/*" ref={fileInputRef} onChange={handleFileSelectEvent} className="hidden" multiple />
              <input type="file" accept="image/*" capture="environment" ref={cameraInputRef} onChange={handleFileSelectEvent} className="hidden" />
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 w-full">
                <button onClick={() => cameraInputRef.current?.click()} className="flex flex-col items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800">
                  <CameraIcon className="w-10 h-10 mb-2" />
                  <span className="font-semibold">Take Photo</span>
                </button>
                <button onClick={() => fileInputRef.current?.click()} className="flex flex-col items-center justify-center w-full px-4 py-6 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 dark:focus:ring-offset-gray-800">
                  <PhotoIcon className="w-10 h-10 mb-2" />
                  <span className="font-semibold">Upload Photos</span>
                </button>
              </div>
            </div>
          )}
          
          {queue.length > 0 && (
            <div className="space-y-4">
                {queue.map((item, index) => (
                    <div key={index} className="p-4 rounded-lg bg-gray-50 dark:bg-gray-700/50">
                        <div className="flex items-start space-x-4">
                            <img src={item.imageDataUrl} alt={item.file.name} className="w-20 h-20 object-cover rounded-md flex-shrink-0 bg-gray-200 dark:bg-gray-600" />
                            <div className="flex-grow">
                                <p className="font-semibold text-gray-800 dark:text-gray-100 truncate">{item.file.name}</p>
                                {item.status === 'processing' && <div className="flex items-center text-sm text-blue-600 dark:text-blue-400 mt-1"><SpinnerIcon className="w-4 h-4 mr-2" /><span>Processing...</span></div>}
                                {item.status === 'done' && <div className="flex items-center text-sm text-green-600 dark:text-green-400 mt-1"><CheckCircleIcon className="w-4 h-4 mr-2" /><span>Ready to save</span></div>}
                                {item.status === 'error' && <p className="text-sm text-red-500 mt-1">{item.error}</p>}
                            </div>
                            <button onClick={() => handleRemoveFromQueue(index)} className="p-1 text-gray-500 hover:text-red-600 dark:hover:text-red-400" aria-label="Remove"><TrashIcon className="w-5 h-5"/></button>
                        </div>
                        {item.status === 'done' && item.data && (
                            <details className="mt-4">
                                <summary className="cursor-pointer text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline">Review & Edit</summary>
                                <div className="mt-4 space-y-4">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Merchant</label>
                                            <input type="text" value={item.data.merchant.translated} onChange={(e) => handleNestedItemChange(index, 'merchant', 'translated', e.target.value)} className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-700 dark:text-gray-300">Date</label>
                                            <input type="date" value={item.data.date} max={today} onChange={(e) => handleItemChange(index, 'date', e.target.value)} className="mt-1 block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
                                        </div>
                                        {/* Simplified editing for batch mode, more can be added */}
                                    </div>
                                </div>
                            </details>
                        )}
                    </div>
                ))}
            </div>
          )}

        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
            <div>
                {isAnythingProcessing && (
                    <div className="flex items-center text-sm text-gray-600 dark:text-gray-300">
                        <SpinnerIcon className="w-5 h-5 mr-2" />
                        Processing...
                    </div>
                )}
            </div>
            <div className="flex space-x-3">
              <button onClick={onClose} className="bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm transition">Cancel</button>
              <button onClick={handleSubmit} disabled={isAnythingProcessing || doneCount === 0} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm transition disabled:bg-blue-300 dark:disabled:bg-blue-800 disabled:cursor-not-allowed">
                Save {doneCount > 0 ? `${doneCount} ` : ''}Receipt{doneCount > 1 || doneCount === 0 ? 's' : ''}
              </button>
            </div>
        </div>
      </div>
    </div>
  );
};
