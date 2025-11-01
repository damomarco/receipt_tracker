import React, { useState, useEffect } from 'react';
import { XIcon, EditIcon, TrashIcon, SaveIcon, CancelIcon } from './icons';
import { DefaultCategory } from '../types';

interface ManageCategoriesModalProps {
  onClose: () => void;
  defaultCategories: readonly DefaultCategory[];
  customCategories: string[];
  onAddCategory: (name: string) => boolean; // returns false if duplicate
  onUpdateCategory: (oldName: string, newName: string) => boolean;
  onDeleteCategory: (name: string) => void;
}

export const ManageCategoriesModal: React.FC<ManageCategoriesModalProps> = ({
  onClose,
  defaultCategories,
  customCategories,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory,
}) => {
  const [newCategoryName, setNewCategoryName] = useState('');
  const [editingCategory, setEditingCategory] = useState<{ oldName: string; newName: string } | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    // Clear error when modal inputs change
    setError(null);
  }, [newCategoryName, editingCategory]);

  const handleAdd = () => {
    setError(null);
    if (!newCategoryName.trim()) {
      setError('Category name cannot be empty.');
      return;
    }
    const success = onAddCategory(newCategoryName.trim());
    if (success) {
      setNewCategoryName('');
    } else {
      setError(`Category "${newCategoryName.trim()}" already exists.`);
    }
  };

  const handleUpdate = () => {
    if (!editingCategory) return;
    setError(null);
    if (!editingCategory.newName.trim()) {
      setError('Category name cannot be empty.');
      return;
    }
    if (editingCategory.oldName === editingCategory.newName.trim()) {
      setEditingCategory(null);
      return;
    }
    const success = onUpdateCategory(editingCategory.oldName, editingCategory.newName.trim());
    if (success) {
      setEditingCategory(null);
    } else {
      setError(`Category "${editingCategory.newName.trim()}" already exists.`);
    }
  };

  const handleStartEdit = (name: string) => {
    setEditingCategory({ oldName: name, newName: name });
  };
  
  const handleCancelEdit = () => {
    setEditingCategory(null);
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-md max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Manage Categories</h2>
          <button onClick={onClose} className="p-2 rounded-full text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"><XIcon className="w-6 h-6"/></button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <div>
            <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">Default Categories</h3>
            <div className="flex flex-wrap gap-2">
              {defaultCategories.map(cat => (
                <span key={cat} className="px-3 py-1 text-sm bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200 rounded-full">{cat}</span>
              ))}
            </div>
          </div>
          <div>
            <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-3">Custom Categories</h3>
            <div className="space-y-2">
              {customCategories.length > 0 ? customCategories.map(cat => (
                <div key={cat} className="flex items-center justify-between bg-gray-50 dark:bg-gray-700/50 p-2 rounded-md">
                  {editingCategory?.oldName === cat ? (
                    <>
                      <input 
                        type="text"
                        value={editingCategory.newName}
                        onChange={(e) => setEditingCategory({ ...editingCategory, newName: e.target.value })}
                        className="flex-grow bg-white dark:bg-gray-600 border border-blue-500 rounded-md py-1 px-2 text-gray-900 dark:text-white"
                        autoFocus
                        onKeyDown={(e) => e.key === 'Enter' && handleUpdate()}
                      />
                      <div className="flex items-center ml-2">
                        <button onClick={handleUpdate} className="p-1 text-green-600 hover:text-green-800" aria-label="Save"><SaveIcon className="w-5 h-5" /></button>
                        <button onClick={handleCancelEdit} className="p-1 text-gray-500 hover:text-gray-700" aria-label="Cancel"><CancelIcon className="w-5 h-5" /></button>
                      </div>
                    </>
                  ) : (
                    <>
                      <span className="text-gray-800 dark:text-gray-200">{cat}</span>
                      <div className="flex items-center">
                        <button onClick={() => handleStartEdit(cat)} className="p-1 text-blue-600 hover:text-blue-800" aria-label="Edit"><EditIcon className="w-5 h-5"/></button>
                        <button onClick={() => onDeleteCategory(cat)} className="p-1 text-red-600 hover:text-red-800" aria-label="Delete"><TrashIcon className="w-5 h-5"/></button>
                      </div>
                    </>
                  )}
                </div>
              )) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">You haven't added any custom categories yet.</p>
              )}
            </div>
          </div>
          <div>
            <h3 className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">Add New Category</h3>
            <div className="flex space-x-2">
                <input
                    type="text"
                    value={newCategoryName}
                    onChange={(e) => setNewCategoryName(e.target.value)}
                    placeholder="e.g., Souvenirs"
                    className="flex-grow border border-gray-300 dark:border-gray-600 rounded-md shadow-sm py-2 px-3 focus:outline-none focus:ring-blue-500 focus:border-blue-500 bg-white dark:bg-gray-700 text-gray-900 dark:text-white"
                    onKeyDown={(e) => e.key === 'Enter' && handleAdd()}
                />
                <button
                    onClick={handleAdd}
                    className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm transition"
                >
                    Add
                </button>
            </div>
            {error && <p className="text-red-500 text-sm mt-2">{error}</p>}
          </div>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-end">
          <button onClick={onClose} className="bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm transition">Done</button>
        </div>
      </div>
    </div>
  );
};
