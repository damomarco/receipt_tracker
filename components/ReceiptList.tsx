import React, { useState, useMemo } from 'react';
import { Receipt, Trip } from '../types';
import { ReceiptItem } from './ReceiptItem';
import { CalendarIcon, ChevronDownIcon, BriefcaseIcon } from './icons';
import { useReceipts } from '../contexts/ReceiptsContext';
import { useTrips } from '../contexts/TripsContext';
import { TripSpendingSummary } from './TripSpendingSummary';
import { useCurrency } from '../contexts/CurrencyContext';

interface ReceiptListProps {
  totalReceiptCount: number;
  filteredReceiptCount: number;
  searchTerm: string;
}

type GroupedByDay = Record<string, Receipt[]>;

interface GroupedByTrip {
  [tripId: string]: {
    tripDetails: Trip | { id: 'unassigned', name: string };
    receiptsByDay: GroupedByDay;
  }
}

export const ReceiptList: React.FC<ReceiptListProps> = ({ totalReceiptCount, filteredReceiptCount, searchTerm }) => {
  const { receipts } = useReceipts();
  const { trips } = useTrips();
  const { formatDate } = useCurrency();
  
  const isSearching = searchTerm.trim() !== '';

  const groupedData = useMemo(() => {
    if (isSearching) return {};
    
    return receipts.reduce((acc, receipt) => {
      const tripId = receipt.tripId || 'unassigned';
      const date = receipt.date;

      if (!acc[tripId]) {
        const foundTrip = trips.find(t => t.id === tripId);
        const tripDetails: Trip | { id: 'unassigned'; name: string } = foundTrip ? foundTrip : { id: 'unassigned', name: 'Unassigned Receipts' };
        acc[tripId] = { tripDetails, receiptsByDay: {} };
      }
      
      if (!acc[tripId].receiptsByDay[date]) {
        acc[tripId].receiptsByDay[date] = [];
      }
      acc[tripId].receiptsByDay[date].push(receipt);
      return acc;
    }, {} as GroupedByTrip);
  }, [receipts, trips, isSearching]);

  const sortedTripIds = useMemo(() => {
    if (isSearching) return [];

    const tripDetailsMap = new Map(trips.map(t => [t.id, t]));
    return Object.keys(groupedData).sort((a, b) => {
      if (a === 'unassigned') return 1;
      if (b === 'unassigned') return -1;
      const tripA = tripDetailsMap.get(a);
      const tripB = tripDetailsMap.get(b);
      return new Date(tripB?.startDate || 0).getTime() - new Date(tripA?.startDate || 0).getTime();
    });
  }, [groupedData, trips, isSearching]);
  
  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>(() => {
     if (sortedTripIds.length > 0) {
      return { [sortedTripIds[0]]: true };
    }
    return {};
  });

  const [expandedDays, setExpandedDays] = useState<Record<string, boolean>>(() => {
    if (sortedTripIds.length > 0) {
      const mostRecentTripId = sortedTripIds[0];
      const daysInTrip = Object.keys(groupedData[mostRecentTripId]?.receiptsByDay || {}).sort((a, b) => new Date(b).getTime() - new Date(a).getTime());
      if (daysInTrip.length > 0) {
        return { [daysInTrip[0]]: true };
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
      <div className="text-center py-20 px-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm mt-6">
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">No receipts yet</h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">Tap the '+' button to add your first receipt.</p>
      </div>
    );
  }

  if (filteredReceiptCount === 0) {
    return (
      <div className="text-center py-20 px-6 bg-white dark:bg-gray-800 rounded-lg shadow-sm mt-6">
        <h2 className="text-2xl font-semibold text-gray-700 dark:text-gray-200">No Receipts Found</h2>
        <p className="mt-2 text-gray-500 dark:text-gray-400">No receipts match your current search and filter criteria.</p>
      </div>
    );
  }
  
  // Render a flat list when searching
  if (isSearching) {
    return (
      <div className="space-y-4 mt-6">
        {receipts.map(receipt => (
          <ReceiptItem key={receipt.id} receipt={receipt} searchTerm={searchTerm} />
        ))}
      </div>
    );
  }

  // Render original grouped view when not searching
  return (
    <div className="space-y-6 mt-6">
      {sortedTripIds.map(tripId => {
        const group = groupedData[tripId];
        if (!group) return null;
        const { tripDetails, receiptsByDay } = group;

        const daysInGroup = Object.keys(receiptsByDay)
            .filter(date => receiptsByDay[date] && receiptsByDay[date].length > 0)
            .sort((a, b) => new Date(b).getTime() - new Date(a).getTime());

        if (daysInGroup.length === 0) return null;

        const isGroupExpanded = !!expandedGroups[tripId];
        const allReceiptsInGroup = daysInGroup.flatMap(date => receiptsByDay[date]);

        return (
          <div key={tripId} className="bg-white dark:bg-gray-800/50 rounded-lg shadow-md transition-all duration-300">
            <div
              className="flex justify-between items-center p-4 md:p-6 cursor-pointer hover:bg-gray-50 dark:hover:bg-gray-700/50 rounded-t-lg"
              onClick={() => toggleGroupExpansion(tripId)}
              role="button"
              aria-expanded={isGroupExpanded}
              aria-controls={`receipts-for-${tripId}`}
            >
              <div className="flex items-center space-x-3 min-w-0">
                <BriefcaseIcon className="w-7 h-7 text-gray-500 dark:text-gray-400 flex-shrink-0" />
                <div className="min-w-0">
                    <h2 className="text-2xl font-bold text-gray-800 dark:text-gray-100 truncate" title={tripDetails.name}>{tripDetails.name}</h2>
                    {'startDate' in tripDetails && (
                        <p className="text-sm text-gray-500 dark:text-gray-400">{formatDate(tripDetails.startDate)} to {formatDate(tripDetails.endDate)}</p>
                    )}
                </div>
              </div>
              <ChevronDownIcon className={`w-6 h-6 text-gray-500 dark:text-gray-400 transition-transform transform ${isGroupExpanded ? 'rotate-180' : ''}`} />
            </div>
            
            {isGroupExpanded && (
              <div className="rounded-b-lg overflow-hidden">
                {tripId !== 'unassigned' && (
                  <TripSpendingSummary receipts={allReceiptsInGroup} />
                )}
                
                <div 
                  id={`receipts-for-${tripId}`} 
                  className={`px-4 md:px-6 pb-4 md:pb-6 space-y-4
                    ${tripId === 'unassigned' && allReceiptsInGroup.length > 0 ? 'border-t border-gray-200 dark:border-gray-700 pt-4' : ''}
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
                          className="flex justify-between items-center p-4 cursor-pointer hover:bg-gray-100 dark:hover:bg-gray-700/50 rounded-t-lg"
                          onClick={() => toggleDayExpansion(date)}
                          role="button"
                          aria-expanded={isDayExpanded}
                          aria-controls={`receipts-for-${date}`}
                        >
                          <div className="flex items-center space-x-3">
                            <CalendarIcon className="w-5 h-5 text-gray-400 dark:text-gray-500"/>
                            <h3 className="text-lg font-semibold text-gray-700 dark:text-gray-200">{formattedDate}</h3>
                          </div>
                          <ChevronDownIcon className={`w-5 h-5 text-gray-500 dark:text-gray-400 transition-transform transform ${isDayExpanded ? 'rotate-180' : ''}`} />
                        </div>
                        
                        {isDayExpanded && (
                          <div id={`receipts-for-${date}`} className="px-4 pb-4 rounded-b-lg">
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
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};