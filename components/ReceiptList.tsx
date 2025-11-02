import React, { useState, useMemo } from 'react';
import { Receipt, Trip } from '../types';
import { ReceiptItem } from './ReceiptItem';
import { DownloadIcon, CalendarIcon, ChevronDownIcon, BriefcaseIcon } from './icons';
import { exportToCSV } from '../utils/csv';
import { useReceipts } from '../contexts/ReceiptsContext';
import { useTrips } from '../contexts/TripsContext';
import { TripSpendingSummary } from './TripSpendingSummary';
import { useCurrency } from '../contexts/CurrencyContext';

interface ReceiptListProps {
  totalReceiptCount: number;
}

type GroupedByDay = Record<string, Receipt[]>;

interface GroupedByTrip {
  [tripId: string]: {
    tripDetails: Trip | { id: 'unassigned', name: string };
    receiptsByDay: GroupedByDay;
  }
}

export const ReceiptList: React.FC<ReceiptListProps> = ({ totalReceiptCount }) => {
  const { receipts } = useReceipts();
  const { trips } = useTrips();
  const { formatDate } = useCurrency();
  
  const groupedData = useMemo(() => {
    const receiptsToGroup = receipts;
    
    return receiptsToGroup.reduce((acc, receipt) => {
      const tripId = receipt.tripId || 'unassigned';
      const date = receipt.date;

      if (!acc[tripId]) {
        // FIX: Replaced nullish coalescing with a more explicit check to avoid potential TypeScript inference issues with complex union types.
        const foundTrip = trips.find(t => t.id === tripId);
        // FIX: Add an explicit type annotation to prevent TypeScript from incorrectly widening the type of the union.
        const tripDetails: Trip | { id: 'unassigned'; name: string } = foundTrip ? foundTrip : { id: 'unassigned', name: 'Unassigned Receipts' };
        acc[tripId] = { tripDetails, receiptsByDay: {} };
      }
      
      if (!acc[tripId].receiptsByDay[date]) {
        acc[tripId].receiptsByDay[date] = [];
      }
      acc[tripId].receiptsByDay[date].push(receipt);
      return acc;
    }, {} as GroupedByTrip);
  }, [receipts, trips]);

  const sortedTripIds = useMemo(() => {
    const tripDetailsMap = new Map(trips.map(t => [t.id, t]));
    return Object.keys(groupedData).sort((a, b) => {
      if (a === 'unassigned') return 1;
      if (b === 'unassigned') return -1;
      const tripA = tripDetailsMap.get(a);
      const tripB = tripDetailsMap.get(b);
      return new Date(tripB?.startDate || 0).getTime() - new Date(tripA?.startDate || 0).getTime();
    });
  }, [groupedData, trips]);
  
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
     if (sortedTripIds.length > 0) {
      return { [sortedTripIds[0]]: true }; // Expand the most recent trip by default
    }
    return {};
  });

  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>(() => {
    if (sortedTripIds.length > 0) {
      const mostRecentTripId = sortedTripIds[0];
      const daysInTrip = Object.keys(groupedData[mostRecentTripId].receiptsByDay).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      if (daysInTrip.length > 0) {
        return { [daysInTrip[0]]: true }; // Expand the most recent day in the most recent trip by default
      }
    }
    return {};
  });

  const toggleGroupExpansion = (groupId: string) => {
    setExpandedGroups(prev => ({ ...prev, [groupId]: !prev[groupId] }));
  };

  const toggleDayExpansion = (date: string) => {
    setExpandedDays(prev => ({ ...prev, [date]: !prev[date] }));
  };


  if (totalReceiptCount === 0) {
    return (
      <div className="text-center py-20 px-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">No receipts yet</h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Tap the '+' button to add your first receipt.</p>
      </div>
    );
  }

  if (receipts.length === 0) {
    return (
      <div className="text-center py-20 px-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm">
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">No Receipts Found</h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">No receipts match the current filter. Try selecting a different trip.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {sortedTripIds.map(tripId => {
        const { tripDetails, receiptsByDay } = groupedData[tripId];
        const isGroupExpanded = !!expandedGroups[tripId];
        const daysInGroup = Object.keys(receiptsByDay).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
        const allReceiptsInGroup = daysInGroup.flatMap(date => receiptsByDay[date]);

        return (
          <div key={tripId} className="bg-white dark:bg-gray-800/50 rounded-lg shadow-md transition-all duration-300">
            <div
              className="flex justify-between items-center p-4 md:p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-lg"
              onClick={() => toggleGroupExpansion(tripId)}
              role="button"
              aria-expanded={isGroupExpanded}
              aria-controls={`receipts-for-${tripId}`}
            >
              <div className="flex items-center space-x-3">
                <BriefcaseIcon className="w-7 h-7 text-gray-500 dark:text-gray-400" />
                <div>
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100">{tripDetails.name}</h2>
                    {'startDate' in tripDetails && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(tripDetails.startDate)} to {formatDate(tripDetails.endDate)}</p>
                    )}
                </div>
              </div>
              <div className="flex items-center space-x-4">
                 <button
                  onClick={(e) => {
                    e.stopPropagation();
                    exportToCSV(allReceiptsInGroup, tripDetails.name.replace(/\s+/g, '_'));
                  }}
                  className="flex items-center space-x-2 text-sm bg-gray-100 hover:bg-gray-200 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-700 dark:text-gray-200 font-semibold py-2 px-3 rounded-md transition-colors"
                  aria-label={`Export receipts for ${tripDetails.name} to CSV`}
                >
                  <DownloadIcon className="w-4 h-4" />
                  <span className="hidden sm:inline">Export Trip</span>
                </button>
                <ChevronDownIcon className={`w-6 h-6 text-gray-500 dark:text-gray-400 transition-transform transform ${isGroupExpanded ? 'rotate-180' : ''}`} />
              </div>
            </div>
            
            {isGroupExpanded && (
              <div>
                {tripId !== 'unassigned' && (
                  <TripSpendingSummary receipts={allReceiptsInGroup} />
                )}
                
                {allReceiptsInGroup.length > 0 && (
                  <div 
                    id={`receipts-for-${tripId}`} 
                    className={`px-4 md:px-6 pb-4 md:pb-6 space-y-4
                      ${tripId === 'unassigned' ? 'border-t border-gray-200 dark:border-gray-700 pt-4' : ''}
                    `}
                  >
                    {daysInGroup.map(date => {
                      const isDayExpanded = !!expandedDays[date];
                      const formattedDate = formatDate(date, {
                        weekday: 'long',
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      });

                      return (
                        <div key={date} className="bg-gray-50 dark:bg-gray-800 rounded-lg">
                          <div
                            className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-lg"
                            onClick={() => toggleDayExpansion(date)}
                            role="button"
                            aria-expanded={isDayExpanded}
                            aria-controls={`receipts-for-${date}`}
                          >
                            <div className="flex items-center space-x-3">
                              <CalendarIcon className="w-5 h-5 text-gray-400 dark:text-gray-500"/>
                              <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">{formattedDate}</h3>
                            </div>
                            <div className="flex items-center space-x-4">
                              <button
                                onClick={(e) => {
                                  e.stopPropagation();
                                  exportToCSV(receiptsByDay[date], date);
                                }}
                                className="flex items-center space-x-2 text-xs bg-gray-200 hover:bg-gray-300 dark:bg-gray-700 dark:hover:bg-gray-600 text-gray-600 dark:text-gray-300 font-semibold py-1 px-2 rounded-md transition-colors"
                                aria-label={`Export receipts for ${formattedDate} to CSV`}
                              >
                                <DownloadIcon className="w-3 h-3" />
                                <span className="hidden sm:inline">Export Day</span>
                              </button>
                              <ChevronDownIcon className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform transform ${isDayExpanded ? 'rotate-180' : ''}`} />
                            </div>
                          </div>
                          
                          {isDayExpanded && (
                            <div id={`receipts-for-${date}`} className="px-4 pb-4">
                              <div className="space-y-4 border-t border-gray-200 dark:border-gray-600 pt-4">
                                {receiptsByDay[date].map(receipt => (
                                  <ReceiptItem key={receipt.id} receipt={receipt} />
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      );
                    })}
                  </div>
                )}

                {isGroupExpanded && allReceiptsInGroup.length === 0 && tripId === 'unassigned' && (
                    <div className="px-4 md:px-6 py-4 border-t border-gray-200 dark:border-gray-700 text-center text-sm text-gray-500 dark:text-gray-400">
                        No unassigned receipts found.
                    </div>
                )}
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};
