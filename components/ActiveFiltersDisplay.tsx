import React from 'react';
import { Filters } from '../types';
import { XCircleIcon } from './icons';

interface ActiveFiltersDisplayProps {
  filters: Filters;
  onClearAll: () => void;
  onRemoveFilter: (filterType: keyof Filters, valueToRemove?: any) => void;
}

const FilterTag: React.FC<{ onRemove: () => void, children: React.ReactNode }> = ({ onRemove, children }) => (
  <span className="inline-flex items-center pl-3 pr-2 py-1 text-xs font-medium bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200 rounded-full">
    {children}
    <button onClick={onRemove} className="ml-1.5 flex-shrink-0 text-blue-500 hover:text-blue-700 dark:text-blue-300 dark:hover:text-blue-100">
      <XCircleIcon className="h-4 w-4" />
    </button>
  </span>
);

export const ActiveFiltersDisplay: React.FC<ActiveFiltersDisplayProps> = ({ filters, onClearAll, onRemoveFilter }) => {
  const { dateRange, categories, amountRange } = filters;
  const hasDateFilter = dateRange.start || dateRange.end;
  const hasAmountFilter = amountRange.min !== null || amountRange.max !== null;
  
  const activeFiltersCount = (hasDateFilter ? 1 : 0) + categories.length + (hasAmountFilter ? 1 : 0);

  if (activeFiltersCount === 0) {
    return null;
  }

  return (
    <div className="mt-4 flex flex-wrap items-center gap-2">
      <span className="text-sm font-semibold text-gray-600 dark:text-gray-300">Active Filters:</span>
      
      {hasDateFilter && (
        <FilterTag onRemove={() => onRemoveFilter('dateRange')}>
          Date: {dateRange.start || '...'} to {dateRange.end || '...'}
        </FilterTag>
      )}

      {categories.map(category => (
        <FilterTag key={category} onRemove={() => onRemoveFilter('categories', category)}>
          {category}
        </FilterTag>
      ))}

      {hasAmountFilter && (
        <FilterTag onRemove={() => onRemoveFilter('amountRange')}>
          Amount: {amountRange.min !== null ? `>= ${amountRange.min}` : ''} {amountRange.min !== null && amountRange.max !== null ? ' & ' : ''} {amountRange.max !== null ? `<= ${amountRange.max}` : ''}
        </FilterTag>
      )}
      
      <button onClick={onClearAll} className="text-sm text-red-600 hover:text-red-800 dark:text-red-400 dark:hover:text-red-300 font-semibold ml-2">
        Clear All
      </button>
    </div>
  );
};
