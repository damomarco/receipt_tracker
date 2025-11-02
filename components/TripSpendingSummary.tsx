import React, { useState, useEffect } from 'react';
import { Receipt } from '../types';
import { ReceiptIcon, CashIcon, SpinnerIcon } from './icons';
import { CategorySpendingChart } from './CategorySpendingChart';
import { useCurrency } from '../contexts/CurrencyContext';

interface Totals {
  [currency: string]: number;
}

interface TripSpendingSummaryProps {
  receipts: Receipt[];
}

export const TripSpendingSummary: React.FC<TripSpendingSummaryProps> = ({ receipts }) => {
  const { homeCurrency, getRate } = useCurrency();
  const [convertedTotal, setConvertedTotal] = useState<number | null>(null);
  const [isLoadingTotal, setIsLoadingTotal] = useState(false);

  useEffect(() => {
    if (!homeCurrency || receipts.length === 0) {
      setConvertedTotal(null);
      return;
    }

    const calculateTotal = async () => {
        setIsLoadingTotal(true);
        const promises = receipts.map(async receipt => {
            const rate = await getRate(receipt.date, receipt.currency, homeCurrency);
            if (rate !== null) {
                return receipt.total * rate;
            }
            return 0;
        });
        
        const convertedValues = await Promise.all(promises);
        const total = convertedValues.reduce((sum, val) => sum + val, 0);
        
        setConvertedTotal(total);
        setIsLoadingTotal(false);
    };

    calculateTotal();
  }, [receipts, homeCurrency, getRate]);

  const totalsByCurrency = React.useMemo(() => {
    return receipts.reduce((acc, receipt) => {
      const currency = receipt.currency || 'UNKNOWN';
      if (!acc[currency]) {
        acc[currency] = 0;
      }
      acc[currency] += receipt.total;
      return acc;
    }, {} as Totals);
  }, [receipts]);
  
  const sortedCurrencies = Object.keys(totalsByCurrency).sort();

  if (receipts.length === 0) {
    return (
        <div className="text-center py-6 px-6 text-sm text-gray-500 dark:text-gray-400 border-t border-gray-200 dark:border-gray-700">
            No receipts to summarize for this trip.
        </div>
    );
  }

  return (
    <div id="trip-spending-summary-content" className="px-4 md:px-6 pb-4 md:pb-6 pt-4 border-t border-gray-200 dark:border-gray-700">
      <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4">Trip Summary</h3>
      <div className="flex flex-wrap gap-4 mb-4">
        <div className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg flex-1 min-w-[240px]">
          <div className="flex items-center text-gray-500 dark:text-gray-400">
            <ReceiptIcon className="w-5 h-5 mr-2" />
            <h3 className="text-sm font-medium uppercase tracking-wider">Total Receipts</h3>
          </div>
          <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-2">{receipts.length}</p>
        </div>
        
        {homeCurrency && (convertedTotal !== null || isLoadingTotal) && (
          <div className="p-4 bg-blue-100 dark:bg-blue-900/50 rounded-lg flex-1 min-w-[240px]">
            <div className="flex items-center text-blue-600 dark:text-blue-300">
              <CashIcon className="w-5 h-5 mr-2" />
              <h3 className="text-sm font-medium uppercase tracking-wider">Grand Total ({homeCurrency})</h3>
            </div>
             {isLoadingTotal ? (
                <div className="flex items-center justify-center h-10">
                    <SpinnerIcon className="w-8 h-8 text-blue-600 dark:text-blue-400" />
                </div>
            ) : (
                <p className="text-3xl font-semibold text-blue-900 dark:text-blue-100 mt-2">
                {new Intl.NumberFormat(undefined, { style: 'currency', currency: homeCurrency }).format(convertedTotal!)}
                </p>
            )}
          </div>
        )}
        
        {sortedCurrencies.map(currency => (
          <div key={currency} className="p-4 bg-gray-100 dark:bg-gray-700/50 rounded-lg flex-1 min-w-[240px]">
            <div className="flex items-center text-gray-500 dark:text-gray-400">
              <CashIcon className="w-5 h-5 mr-2" />
              <h3 className="text-sm font-medium uppercase tracking-wider">Total Spent ({currency})</h3>
            </div>
            <p className="text-3xl font-semibold text-gray-900 dark:text-gray-100 mt-2">
              {new Intl.NumberFormat(undefined, { style: 'currency', currency, minimumFractionDigits: 0, maximumFractionDigits: 2 }).format(totalsByCurrency[currency])}
            </p>
          </div>
        ))}
      </div>
      
      <CategorySpendingChart receipts={receipts} />
    </div>
  );
};