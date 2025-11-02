import React, { useState } from 'react';
import { XIcon } from './icons';
import { Filters } from '../types';

interface FilterModalProps {
  onClose: () => void;
  onApplyFilters: (filters: Filters) => void;
  currentFilters: Filters;
  availableCategories: string[];
}

export const FilterModal: React.FC<FilterModalProps> = ({
  onClose,
  onApplyFilters,
  currentFilters,
  availableCategories,
}) => {
  const [filters, setFilters] = useState<Filters>(currentFilters);

  const handleDateChange = (field: 'start' | 'end', value: string) => {
    setFilters(prev => ({
      ...prev,
      dateRange: { ...prev.dateRange, [field]: value || null },
    }));
  };

  const handleCategoryChange = (category: string) => {
    setFilters(prev => {
      const newCategories = prev.categories.includes(category)
        ? prev.categories.filter(c => c !== category)
        : [...prev.categories, category];
      return { ...prev, categories: newCategories };
    });
  };
  
  const handleAmountChange = (field: 'min' | 'max', value: string) => {
      const numValue = value === '' ? null : parseFloat(value);
      setFilters(prev => ({
        ...prev,
        amountRange: { ...prev.amountRange, [field]: numValue },
      }));
  };

  const handleApply = () => {
    onApplyFilters(filters);
    onClose();
  };
  
  const handleClear = () => {
    setFilters({
      dateRange: { start: null, end: null },
      categories: [],
      amountRange: { min: null, max: null },
    });
  };
  
  const today = new Date().toISOString().split('T')[0];

  return (
    <div className="fixed inset-0 bg-black bg-opacity-60 flex items-center justify-center z-50 p-4">
      <div className="bg-white dark:bg-gray-800 rounded-lg shadow-xl w-full max-w-lg max-h-[90vh] flex flex-col">
        <div className="flex justify-between items-center p-4 border-b border-gray-200 dark:border-gray-700">
          <h2 className="text-xl font-semibold text-gray-900 dark:text-gray-100">Filter Receipts</h2>
          <button onClick={onClose} className="p-2 rounded-full text-gray-500 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-700"><XIcon className="w-6 h-6"/></button>
        </div>

        <div className="p-6 overflow-y-auto space-y-6">
          <fieldset>
            <legend className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">Date Range</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="start-date" className="block text-sm font-medium text-gray-500 dark:text-gray-400">From</label>
                <input type="date" id="start-date" value={filters.dateRange.start || ''} onChange={e => handleDateChange('start', e.target.value)} max={filters.dateRange.end || today} className="mt-1 w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label htmlFor="end-date" className="block text-sm font-medium text-gray-500 dark:text-gray-400">To</label>
                <input type="date" id="end-date" value={filters.dateRange.end || ''} onChange={e => handleDateChange('end', e.target.value)} min={filters.dateRange.start || undefined} max={today} className="mt-1 w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
            </div>
          </fieldset>
          
          <fieldset>
            <legend className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">Total Amount</legend>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label htmlFor="min-amount" className="block text-sm font-medium text-gray-500 dark:text-gray-400">Min Amount</label>
                <input type="number" id="min-amount" value={filters.amountRange.min ?? ''} onChange={e => handleAmountChange('min', e.target.value)} placeholder="0" min="0" className="mt-1 w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
              <div>
                <label htmlFor="max-amount" className="block text-sm font-medium text-gray-500 dark:text-gray-400">Max Amount</label>
                <input type="number" id="max-amount" value={filters.amountRange.max ?? ''} onChange={e => handleAmountChange('max', e.target.value)} placeholder="e.g., 100" min="0" className="mt-1 w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white" />
              </div>
            </div>
          </fieldset>

          <fieldset>
            <legend className="text-md font-semibold text-gray-700 dark:text-gray-300 mb-2">Categories</legend>
            <div className="mt-2 max-h-48 overflow-y-auto space-y-2 p-2 bg-gray-50 dark:bg-gray-700/50 rounded-md">
              {availableCategories.length > 0 ? (
                availableCategories.map(category => (
                  <div key={category} className="flex items-center">
                    <input
                      id={`category-${category}`}
                      type="checkbox"
                      checked={filters.categories.includes(category)}
                      onChange={() => handleCategoryChange(category)}
                      className="h-4 w-4 text-blue-600 border-gray-300 dark:border-gray-500 rounded focus:ring-blue-500"
                    />
                    <label htmlFor={`category-${category}`} className="ml-3 text-sm text-gray-700 dark:text-gray-300">{category}</label>
                  </div>
                ))
              ) : (
                 <p className="text-sm text-center text-gray-500 dark:text-gray-400 py-4">No categories have been used yet.</p>
              )}
            </div>
          </fieldset>
        </div>

        <div className="p-4 border-t border-gray-200 dark:border-gray-700 bg-gray-50 dark:bg-gray-800/50 flex justify-between items-center">
          <button onClick={handleClear} className="bg-white dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-2 px-4 border border-gray-300 dark:border-gray-600 rounded-md shadow-sm transition">Clear All</button>
          <button onClick={handleApply} className="bg-blue-600 hover:bg-blue-700 text-white font-semibold py-2 px-4 rounded-md shadow-sm transition">Apply Filters</button>
        </div>
      </div>
    </div>
  );
};