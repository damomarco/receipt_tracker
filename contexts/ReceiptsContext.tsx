import React, { createContext, useContext } from 'react';
import { Receipt } from '../types';

interface ReceiptsContextType {
  receipts: Receipt[];
  deleteReceipt: (id: string) => void;
  updateReceipt: (receipt: Receipt) => void;
  allCategories: string[];
}

const ReceiptsContext = createContext<ReceiptsContextType | undefined>(undefined);

export const ReceiptsProvider = ReceiptsContext.Provider;

export const useReceipts = (): ReceiptsContextType => {
  const context = useContext(ReceiptsContext);
  if (!context) {
    throw new Error('useReceipts must be used within a ReceiptsProvider');
  }
  return context;
};
