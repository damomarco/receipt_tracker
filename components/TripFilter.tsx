import React from 'react';
import { useTrips } from '../contexts/TripsContext';
import { BriefcaseIcon } from './icons';

interface TripFilterProps {
  selectedTripId: string | null;
  onTripChange: (tripId: string | null) => void;
}

export const TripFilter: React.FC<TripFilterProps> = ({ selectedTripId, onTripChange }) => {
  const { trips } = useTrips();

  return (
    <div>
      <label htmlFor="trip-filter" className="flex items-center text-sm font-medium text-gray-700 dark:text-gray-300 mb-2">
        <BriefcaseIcon className="w-5 h-5 mr-2" />
        Filter by Trip
      </label>
      <select
        id="trip-filter"
        value={selectedTripId || 'all'}
        onChange={(e) => onTripChange(e.target.value === 'all' ? null : e.target.value)}
        className="block w-full border-gray-300 dark:border-gray-600 rounded-md shadow-sm sm:text-sm bg-white dark:bg-gray-700 text-gray-900 dark:text-white focus:ring-blue-500 focus:border-blue-500"
      >
        <option value="all">All Receipts</option>
        {trips.map(trip => (
          <option key={trip.id} value={trip.id}>{trip.name}</option>
        ))}
      </select>
    </div>
  );
};
