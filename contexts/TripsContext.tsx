import React, { createContext, useContext } from 'react';
import { Trip } from '../types';

interface TripsContextType {
  trips: Trip[];
}

const TripsContext = createContext<TripsContextType | undefined>(undefined);

export const TripsProvider = TripsContext.Provider;

export const useTrips = (): TripsContextType => {
  const context = useContext(TripsContext);
  if (!context) {
    throw new Error('useTrips must be used within a TripsProvider');
  }
  return context;
};
