import React, { useState } from 'react';
import { Receipt, ReceiptItemData } from '../types';
import { useReceipts } from '../contexts/ReceiptsContext';
import { TrashIcon, EditIcon, SaveIcon, CancelIcon, CloudSlashIcon, SpinnerIcon, CheckCircleIcon, PlusCircleIcon, MapPinIcon } from './icons';
import { ImageModal } from './ImageModal';
import { getCategoryColorName, getCategoryDisplayClasses } from '../utils/colors';

interface ReceiptItemProps {
  receipt: Receipt;
}

const ReceiptStatus: React.FC<{ status: Receipt['status'] }> = ({ status }) => {
  if (status === 'syncing') {
    return <SpinnerIcon className="w-5 h-5 text-blue-500" title="Syncing..." />;
  }
  if (status === 'pending') {
    return <CloudSlashIcon className="w-5 h-5 text-amber-500" title="Pending sync" />;
  }
  return <CheckCircleIcon className="w-5 h-5 text-green-500" title="Synced" />;
};

export const ReceiptItem: React.FC<ReceiptItemProps> = ({ receipt }) => {
  const { deleteReceipt, updateReceipt, allCategories } = useReceipts();
  const [isEditing, setIsEditing] = useState(false);
  const [editedReceipt, setEditedReceipt] = useState<Receipt>(receipt);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);
  
  const handleDelete = () => {
    if (window.confirm(`Are you sure you want to delete the receipt from ${receipt.merchant.translated}?`)) {
      deleteReceipt(receipt.id);
    }
  };

  const handleEdit = () => {
    setEditedReceipt(receipt); // Reset changes when entering edit mode
    setIsEditing(true);
  };
  
  const handleCancel = () => {
    setIsEditing(false);
  };

  const handleSave = () => {
    updateReceipt(editedReceipt);
    setIsEditing(false);
  };
  
  const handleFormChange = <T extends keyof Omit<Receipt, 'items' | 'total'>>(field: T, value: Receipt[T]) => {
    setEditedReceipt(prev => ({ ...prev, [field]: value }));
  };

  const handleItemChange = (index: number, field: keyof ReceiptItemData, value: any) => {
    const newItems = [...editedReceipt.items];
    const itemToUpdate = { ...newItems[index] };
    
    if (field === 'description') {
      itemToUpdate.description = { ...itemToUpdate.description, translated: value };
    } else {
      (itemToUpdate as any)[field] = value;
    }
    
    newItems[index] = itemToUpdate;
    const newTotal = newItems.reduce((acc, item) => acc + (Number(item.price) || 0), 0);
    setEditedReceipt(prev => ({ ...prev, items: newItems, total: newTotal }));
  };
  
  const handleAddItem = () => {
    const newItem: ReceiptItemData = {
        description: { original: '', translated: '' },
        price: 0,
        category: 'Other'
    };
    const newItems = [...editedReceipt.items, newItem];
    setEditedReceipt(prev => ({ ...prev, items: newItems }));
  };

  const handleRemoveItem = (index: number) => {
      const newItems = editedReceipt.items.filter((_, i) => i !== index);
      const newTotal = newItems.reduce((acc, item) => acc + (Number(item.price) || 0), 0);
      setEditedReceipt(prev => ({ ...prev, items: newItems, total: newTotal }));
  };

  // FIX: The `Date` constructor must be capitalized.
  const today = new Date().toISOString().split('T')[0];

  if (isEditing) {
    return (
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md border border-blue-500 dark:border-blue-700">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Merchant</label>
              <input type="text" value={editedReceipt.merchant.translated} onChange={e => handleFormChange('merchant', { ...editedReceipt.merchant, translated: e.target.value })} className="mt-1 w-full border-gray-300 dark:border-gray-600 rounded-md sm:text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
            <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Date</label>
              <input type="date" value={editedReceipt.date} max={today} onChange={e => handleFormChange('date', e.target.value)} className="mt-1 w-full border-gray-300 dark:border-gray-600 rounded-md sm:text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
             <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Location</label>
              <input type="text" value={editedReceipt.location || ''} onChange={e => handleFormChange('location', e.target.value)} placeholder="e.g., Tokyo, Japan" className="mt-1 w-full border-gray-300 dark:border-gray-600 rounded-md sm:text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
             <div>
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Currency</label>
              <input type="text" value={editedReceipt.currency} onChange={e => handleFormChange('currency', e.target.value)} className="mt-1 w-full border-gray-300 dark:border-gray-600 rounded-md sm:text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" />
            </div>
            <div className="sm:col-span-2">
              <label className="text-sm font-medium text-gray-700 dark:text-gray-300">Total</label>
              <input type="number" step="0.01" readOnly value={editedReceipt.total} className="mt-1 w-full border-gray-300 dark:border-gray-600 rounded-md sm:text-sm bg-gray-100 dark:bg-gray-900/50 text-gray-900 dark:text-white cursor-not-allowed" />
            </div>
          </div>
          <div>
            <h4 className="text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">Items</h4>
            <div className="space-y-2">
              {editedReceipt.items.map((item, index) => (
                 <div key={index} className="grid grid-cols-12 gap-2 items-center">
                    <div className="col-span-4">
                      <input type="text" placeholder="Item name" value={item.description.translated} onChange={(e) => handleItemChange(index, 'description', e.target.value)} className="w-full border-gray-300 dark:border-gray-600 rounded-md sm:text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" />
                    </div>
                    <div className="col-span-3">
                      <input type="number" step="0.01" placeholder="Price" value={item.price} onChange={(e) => handleItemChange(index, 'price', parseFloat(e.target.value) || 0)} className="w-full border-gray-300 dark:border-gray-600 rounded-md sm:text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white" />
                    </div>
                    <div className="col-span-4">
                      <select value={item.category} onChange={(e) => handleItemChange(index, 'category', e.target.value)} className="w-full border-gray-300 dark:border-gray-600 rounded-md sm:text-sm bg-gray-50 dark:bg-gray-700 text-gray-900 dark:text-white">
                          {allCategories.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                      </select>
                    </div>
                    <div className="col-span-1">
                        <button onClick={() => handleRemoveItem(index)} className="p-1 text-red-500 hover:text-red-700" aria-label="Remove item"><TrashIcon className="w-5 h-5"/></button>
                    </div>
                 </div>
              ))}
            </div>
            <button onClick={handleAddItem} className="mt-3 flex items-center space-x-2 text-sm text-blue-600 dark:text-blue-400 hover:underline">
                <PlusCircleIcon className="w-5 h-5"/>
                <span>Add Item</span>
            </button>
          </div>
          <div className="flex justify-end items-center space-x-2 pt-2">
            <button onClick={handleCancel} className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full" aria-label="Cancel edit"><CancelIcon className="w-5 h-5" /></button>
            <button onClick={handleSave} className="p-2 text-green-600 dark:text-green-400 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-full" aria-label="Save changes"><SaveIcon className="w-5 h-5" /></button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="bg-white dark:bg-gray-800 p-4 rounded-lg shadow-md hover:shadow-lg transition-shadow duration-300">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-4">
            <button onClick={() => setIsImageModalOpen(true)} className="flex-shrink-0">
              <img src={receipt.image} alt={`Receipt from ${receipt.merchant.translated}`} className="w-20 h-20 object-cover rounded-md bg-gray-100 dark:bg-gray-700 cursor-pointer" />
            </button>
            <div className="flex-grow">
              <h3 className="text-lg font-bold text-gray-900 dark:text-gray-100">{receipt.merchant.translated}</h3>
              <p className="text-sm text-gray-500 dark:text-gray-400">{receipt.merchant.original}</p>
              {receipt.location && (
                <div className="flex items-center text-sm text-gray-500 dark:text-gray-400 mt-1">
                    <MapPinIcon className="w-4 h-4 mr-1.5 flex-shrink-0" />
                    <span>{receipt.location}</span>
                </div>
              )}
              <p className="text-2xl font-light text-gray-800 dark:text-gray-200 mt-1">
                {new Intl.NumberFormat('ja-JP', { style: 'currency', currency: receipt.currency, minimumFractionDigits: 0 }).format(receipt.total)}
              </p>
            </div>
          </div>
          <div className="flex flex-col items-end space-y-2">
            <ReceiptStatus status={receipt.status} />
            <div className="flex items-center space-x-1">
              <button onClick={handleEdit} className="p-2 text-gray-500 hover:text-blue-600 dark:hover:text-blue-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full" aria-label="Edit receipt"><EditIcon className="w-5 h-5" /></button>
              <button onClick={handleDelete} className="p-2 text-gray-500 hover:text-red-600 dark:hover:text-red-400 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full" aria-label="Delete receipt"><TrashIcon className="w-5 h-5" /></button>
            </div>
          </div>
        </div>
        
        <div className="mt-4 border-t border-gray-200 dark:border-gray-700 pt-3">
            <h4 className="text-sm font-semibold text-gray-600 dark:text-gray-300 mb-2">Items ({receipt.items.length})</h4>
            <div className="space-y-2">
                {receipt.items.map((item, index) => {
                    const colorName = getCategoryColorName(item.category);
                    const tagClasses = getCategoryDisplayClasses(colorName);
                    return (
                        <div key={index} className="flex justify-between items-center text-sm p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
                            <div className="flex-grow truncate mr-2">
                                <p className="text-gray-800 dark:text-gray-200 truncate" title={item.description.translated}>{item.description.translated}</p>
                                <div className="flex items-center mt-1">
                                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${tagClasses}`}>
                                        {item.category}
                                    </span>
                                </div>
                            </div>
                            <span className="font-semibold text-gray-900 dark:text-gray-100 flex-shrink-0">
                                {new Intl.NumberFormat('ja-JP', { style: 'currency', currency: receipt.currency, minimumFractionDigits: 0 }).format(item.price)}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
      </div>
      {isImageModalOpen && <ImageModal imageSrc={receipt.image} onClose={() => setIsImageModalOpen(false)} />}
    </>
  );
};