import React from 'react';
import { Receipt, Category } from '../types';
import { ChartBarIcon } from './icons';
import { useReceipts } from '../contexts/ReceiptsContext';
import { getCategoryStyling } from '../utils/colors';

interface SpendingData {
  categories: Record<string, number>;
  overallTotal: number;
}
type SpendingByCurrency = Record<string, SpendingData>;

export const CategorySpendingChart: React.FC = () => {
  const { receipts } = useReceipts();

  const spendingByCurrency = React.useMemo(() => {
    return receipts.reduce((acc, receipt) => {
      const currency = receipt.currency || 'UNKNOWN';
      if (!acc[currency]) {
        acc[currency] = { categories: {}, overallTotal: 0 };
      }
  
      if (receipt.items) {
        receipt.items.forEach(item => {
          const category = item.category || 'Other';
          acc[currency].categories[category] = (acc[currency].categories[category] || 0) + item.price;
          acc[currency].overallTotal += item.price;
        });
      }
  
      return acc;
    }, {} as SpendingByCurrency);
  }, [receipts]);

  const currencyEntries = Object.entries(spendingByCurrency);

  if (currencyEntries.length === 0 || currencyEntries.every(([, data]) => (data as SpendingData).overallTotal <= 0)) {
    return null;
  }

  return (
    <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
      <div className="flex items-center mb-3">
        <ChartBarIcon className="w-5 h-5 text-gray-500 dark:text-gray-400 mr-2" />
        <h3 className="text-md font-semibold text-gray-700 dark:text-gray-200">Spending by Category</h3>
      </div>
      
      <div className="space-y-6">
        {currencyEntries.map(([currency, data]) => {
          const { categories, overallTotal } = data as SpendingData;
          const sortedCategories = Object.entries(categories)
            .map(([category, total]) => ({ category: category as Category, total }))
            .sort((a, b) => b.total - a.total);

          if (overallTotal <= 0) return null;

          return (
            <div key={currency}>
              <h4 className="text-sm font-medium text-gray-600 dark:text-gray-400 mb-2">
                Total ({currency})
              </h4>
              
              {/* Segmented Bar */}
              <div className="flex h-4 rounded-full overflow-hidden bg-gray-200 dark:bg-gray-700" role="progressbar" aria-label={`Spending breakdown for ${currency}`}>
                {sortedCategories.map(({ category, total }) => {
                  const percentage = (total / overallTotal) * 100;
                  const styling = getCategoryStyling(category);
                  
                  return (
                    <div
                      key={category}
                      className={styling.bar}
                      style={{ width: `${percentage}%` }}
                      title={`${category}: ${percentage.toFixed(1)}%`}
                    />
                  );
                })}
              </div>

              {/* Legend */}
              <div className="mt-3 grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-2">
                {sortedCategories.map(({ category, total }) => {
                  const percentage = (total / overallTotal) * 100;
                  const styling = getCategoryStyling(category);

                  return (
                    <div key={category} className="flex justify-between items-center text-sm">
                      <div className="flex items-center truncate">
                        <span className={`w-2.5 h-2.5 rounded-full mr-2 flex-shrink-0 ${styling.dot}`} />
                        <span className="text-gray-700 dark:text-gray-300 truncate" title={category}>{category}</span>
                        <span className="ml-2 text-gray-500 dark:text-gray-400">({percentage.toFixed(1)}%)</span>
                      </div>
                      <span className="font-semibold text-gray-800 dark:text-gray-100 flex-shrink-0 ml-2">
                        {new Intl.NumberFormat(undefined, { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(total)}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};