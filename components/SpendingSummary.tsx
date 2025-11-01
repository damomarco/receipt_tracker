import React from 'react';
import { useReceipts } from '../contexts/ReceiptsContext';
import { ReceiptIcon, CashIcon } from './icons';
import { CategorySpendingChart } from './CategorySpendingChart';

interface Totals {
  [currency: string]: number;
}

export const SpendingSummary: React.FC = () => {
  const { receipts } = useReceipts();

  const totalsByCurrency = React.useMemo(() => {
    return receipts.reduce((acc, receipt) => {
      const currency = receipt.currency || 'UNKNOWN';
      if (!acc[currency]) {
        acc[currency] = 0;
      }
      // Correctly sum item prices instead of using the potentially mismatched receipt.total
      const receiptTotalFromItems = receipt.items.reduce((sum, item) => sum + (item.price || 0), 0);
      acc[currency] += receiptTotalFromItems;
      return acc;
    }, {} as Totals);
  }, [receipts]);
  
  const sortedCurrencies = Object.keys(totalsByCurrency).sort();

  if (receipts.length === 0) {
    return null; // Don't show summary if there are no receipts
  }

  return (
    <div className="mb-6 p-4 md:p-6 bg-white dark:bg-gray-800/50 rounded-lg shadow-md">
      <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100 mb-4">Spending Summary</h2>
      
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4 mb-4">
        <div className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
          <div className="flex items-center text-gray-500 dark:text-gray-400">
            <ReceiptIcon className="w-5 h-5 mr-2" />
            <h3 className="text-sm font-medium uppercase tracking-wider">Total Receipts</h3>
          </div>
          <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-2">{receipts.length}</p>
        </div>
        
        {sortedCurrencies.map(currency => (
          <div key={currency} className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg">
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <CashIcon className="w-5 h-5 mr-2" />
              <h3 className="text-sm font-medium uppercase tracking-wider">Total Spent ({currency})</h3>
            </div>
            <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-2">
              {new Intl.NumberFormat('ja-JP', { style: 'currency', currency, minimumFractionDigits: 0 }).format(totalsByCurrency[currency])}
            </p>
          </div>
        ))}
      </div>
      
      <CategorySpendingChart />
    </div>
  );
};