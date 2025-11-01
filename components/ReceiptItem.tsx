import React, { useState } from 'react';
import { Receipt, Category, CATEGORIES, ReceiptItemData } from '../types';
import { TrashIcon, EditIcon, SaveIcon, CancelIcon, CloudSlashIcon, SpinnerIcon, CheckCircleIcon, ChevronDownIcon, PlusCircleIcon } from './icons';
import { ImageModal } from './ImageModal';

interface ReceiptItemProps {
  receipt: Receipt;
  onDelete: (id: string) => void;
  onUpdate: (receipt: Receipt) => void;
}

export const categoryColorMap: Record<Category, string> = {
  'Food & Drink': 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
  'Groceries': 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200',
  'Transportation': 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200',
  'Shopping': 'bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-200',
  'Lodging': 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200',
  'Entertainment': 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200',
  'Utilities': 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200',
  'Health & Wellness': 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200',
  'Other': 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
};

const StatusIndicator: React.FC<{ status: Receipt['status'] }> = ({ status }) => {
  switch (status) {
    case 'pending':
      return <CloudSlashIcon className="w-5 h-5 text-amber-500" title="Pending upload" />;
    case 'syncing':
      return <SpinnerIcon className="w-5 h-5 text-blue-500" title="Syncing..." />;
    case 'synced':
      return <CheckCircleIcon className="w-5 h-5 text-green-500" title="Synced" />;
    default:
      return null;
  }
}

export const ReceiptItem: React.FC<ReceiptItemProps> = ({ receipt, onDelete, onUpdate }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editedReceipt, setEditedReceipt] = useState<Receipt>(receipt);
  const [isItemsVisible, setIsItemsVisible] = useState(false);
  const [isImageModalOpen, setIsImageModalOpen] = useState(false);

  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    if (name.startsWith('merchant.')) {
        const key = name.split('.')[1] as 'original' | 'translated';
        setEditedReceipt(prev => ({ ...prev, merchant: { ...prev.merchant, [key]: value } }));
    } else {
        setEditedReceipt(prev => ({ ...prev, [name]: name === 'total' ? parseFloat(value) || 0 : value }));
    }
  };

  const handleItemChange = (index: number, field: 'translated' | 'original' | 'price' | 'category', value: string) => {
    const newItems = [...editedReceipt.items];
    const itemToUpdate = { ...newItems[index] };

    if (field === 'price') {
      itemToUpdate.price = parseFloat(value) || 0;
    } else if (field === 'category') {
        itemToUpdate.category = value as Category;
    } else {
      itemToUpdate.description = { ...itemToUpdate.description, [field]: value };
    }
    
    newItems[index] = itemToUpdate;
    const newTotal = newItems.reduce((sum, item) => sum + item.price, 0);
    setEditedReceipt(prev => ({ ...prev, items: newItems, total: newTotal }));
  };

  const handleAddItem = () => {
    const newItem: ReceiptItemData = { description: { original: '', translated: '' }, price: 0, category: 'Other' };
    setEditedReceipt(prev => ({ ...prev, items: [...(prev.items || []), newItem] }));
  }

  const handleRemoveItem = (index: number) => {
    const newItems = editedReceipt.items.filter((_, i) => i !== index);
    const newTotal = newItems.reduce((sum, item) => sum + item.price, 0);
    setEditedReceipt(prev => ({ ...prev, items: newItems, total: newTotal }));
  }

  const handleSave = () => {
    onUpdate(editedReceipt);
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setEditedReceipt(receipt);
    setIsEditing(false);
  }

  // FIX: Explicitly type `uniqueCategories` as `Category[]` to prevent `category` from being inferred as `unknown`.
  const uniqueCategories: Category[] = Array.from(new Set(receipt.items?.map(item => item.category).filter(Boolean) || []));

  return (
    <>
      <div className="p-4 border border-gray-200 dark:border-gray-700 rounded-lg hover:bg-gray-50 dark:hover:bg-gray-700/50 transition-colors">
        <div className="flex justify-between items-start mb-2">
          <button 
            onClick={() => setIsImageModalOpen(true)}
            className="w-20 h-20 sm:w-24 sm:h-24 flex-shrink-0 bg-gray-100 dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            aria-label="View receipt image fullscreen"
          >
            <img 
              src={receipt.image} 
              alt="Receipt thumbnail" 
              className="w-full h-full object-contain rounded-md" 
            />
          </button>
          
          <div className="flex items-start space-x-2 pl-4">
            {isEditing ? (
              <>
                <button onClick={handleSave} className="p-2 text-green-600 hover:bg-green-100 dark:hover:bg-green-900/50 rounded-full" aria-label="Save changes"><SaveIcon className="w-6 h-6"/></button>
                <button onClick={handleCancel} className="p-2 text-gray-600 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-full" aria-label="Cancel edit"><CancelIcon className="w-6 h-6"/></button>
              </>
            ) : (
              <>
                <button onClick={() => setIsEditing(true)} className="p-2 text-blue-600 dark:text-blue-400 hover:bg-blue-100 dark:hover:bg-blue-900/50 rounded-full" aria-label="Edit receipt"><EditIcon className="w-6 h-6"/></button>
                <button onClick={() => onDelete(receipt.id)} className="p-2 text-red-600 dark:text-red-400 hover:bg-red-100 dark:hover:bg-red-900/50 rounded-full" aria-label="Delete receipt"><TrashIcon className="w-6 h-6"/></button>
              </>
            )}
          </div>
        </div>
        
        <div className="w-full">
          {isEditing ? (
              <div className="space-y-2">
                  <input type="text" name="merchant.translated" value={editedReceipt.merchant.translated} onChange={handleEditChange} className="w-full p-1 border rounded text-lg font-semibold bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" placeholder="Merchant (EN)"/>
                  <input type="text" name="merchant.original" value={editedReceipt.merchant.original} onChange={handleEditChange} className="w-full p-1 border rounded text-sm bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-500 dark:text-gray-400" placeholder="Merchant (JP)"/>
                  <input type="date" name="date" value={editedReceipt.date} onChange={handleEditChange} className="w-full p-1 border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white"/>
                  <div className="flex space-x-2">
                      <input type="number" name="total" value={editedReceipt.total} onChange={handleEditChange} className="w-1/2 p-1 border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" placeholder="Total"/>
                      <input type="text" name="currency" value={editedReceipt.currency} onChange={handleEditChange} className="w-1/2 p-1 border rounded bg-white dark:bg-gray-700 border-gray-300 dark:border-gray-600 text-gray-900 dark:text-white" placeholder="Currency"/>
                  </div>

                  <div className="mt-4 pt-4 border-t dark:border-gray-700">
                    <h3 className="text-md font-medium text-gray-800 dark:text-gray-200 mb-2">Items</h3>
                    <div className="space-y-2 max-h-40 overflow-y-auto pr-2">
                      {(editedReceipt.items || []).map((item, index) => (
                        <div key={index} className="grid grid-cols-12 gap-2 items-center">
                          <div className="col-span-4">
                            <input type="text" value={item.description.translated} onChange={(e) => handleItemChange(index, 'translated', e.target.value)} placeholder="Item (EN)" className="w-full text-sm p-1 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"/>
                          </div>
                          <div className="col-span-2">
                            <input type="text" value={item.description.original} onChange={(e) => handleItemChange(index, 'original', e.target.value)} placeholder="Item (JP)" className="w-full text-sm p-1 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"/>
                          </div>
                          <div className="col-span-2">
                            <input type="number" value={item.price} onChange={(e) => handleItemChange(index, 'price', e.target.value)} placeholder="Price" className="w-full text-sm p-1 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"/>
                          </div>
                          <div className="col-span-3">
                            <select value={item.category} onChange={(e) => handleItemChange(index, 'category', e.target.value)} className="w-full text-sm p-1 border-gray-300 dark:border-gray-600 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white">
                                {CATEGORIES.map(cat => <option key={cat} value={cat}>{cat}</option>)}
                            </select>
                          </div>
                          <div className="col-span-1">
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
              </div>
          ) : (
              <>
                  <div className="flex items-start justify-between">
                      <div>
                        <h3 className="text-lg font-semibold text-gray-800 dark:text-gray-100">{receipt.merchant.translated}</h3>
                        <p className="text-sm text-gray-500 dark:text-gray-400 italic mb-2">{receipt.merchant.original}</p>
                        <div className="flex flex-wrap gap-2">
                        {uniqueCategories.map(category => (
                          <span key={category} className={`text-xs font-semibold px-2.5 py-1 rounded-full ${categoryColorMap[category] || categoryColorMap['Other']}`}>
                            {category}
                          </span>
                        ))}
                        </div>
                      </div>
                      <StatusIndicator status={receipt.status} />
                  </div>
                  <p className="mt-2 text-2xl font-bold text-blue-600 dark:text-blue-400">
                    {new Intl.NumberFormat('ja-JP', { style: 'currency', currency: receipt.currency, minimumFractionDigits: 0 }).format(receipt.total)}
                  </p>
                  {receipt.items && receipt.items.length > 0 && (
                    <div className="mt-3">
                      <button onClick={() => setIsItemsVisible(!isItemsVisible)} className="flex items-center text-sm text-gray-600 dark:text-gray-400 hover:text-gray-900 dark:hover:text-gray-200 font-medium py-1">
                        <span>{isItemsVisible ? 'Hide' : 'Show'} {receipt.items.length} item{receipt.items.length > 1 ? 's' : ''}</span>
                        <ChevronDownIcon className={`w-4 h-4 ml-1 transition-transform ${isItemsVisible ? 'rotate-180' : ''}`} />
                      </button>
                      {isItemsVisible && (
                        <ul className="mt-2 pl-4 border-l-2 border-gray-200 dark:border-gray-600 space-y-1 text-sm">
                          {receipt.items.map((item, index) => (
                            <li key={index} className="flex justify-between items-center">
                              <div className="flex items-center">
                                <span className="text-gray-700 dark:text-gray-300 truncate pr-4" title={item.description.translated}>{item.description.translated}</span>
                                <span className={`text-xs font-medium ml-2 px-2 py-0.5 rounded-full ${categoryColorMap[item.category] || categoryColorMap['Other']}`}>{item.category}</span>
                              </div>
                              <span className="text-gray-800 dark:text-gray-100 font-medium flex-shrink-0">
                                {new Intl.NumberFormat('ja-JP', { style: 'currency', currency: receipt.currency, minimumFractionDigits: 0 }).format(item.price)}
                              </span>
                            </li>
                          ))}
                        </ul>
                      )}
                    </div>
                  )}
              </>
          )}
        </div>
      </div>

      {isImageModalOpen && (
        <ImageModal
          imageSrc={receipt.image}
          onClose={() => setIsImageModalOpen(false)}
        />
      )}
    </>
  );
};