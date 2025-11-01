
export const CATEGORIES = [
  'Food & Drink',
  'Groceries',
  'Transportation',
  'Shopping',
  'Lodging',
  'Entertainment',
  'Utilities',
  'Health & Wellness',
  'Other',
] as const;

export type Category = typeof CATEGORIES[number];

export interface ReceiptItemData {
  description: {
    original: string;
    translated: string;
  };
  price: number;
}

export interface Receipt {
  id: string;
  image: string; // base64 data URL
  merchant: {
    original: string;
    translated: string;
  };
  date: string; // YYYY-MM-DD
  total: number;
  currency: string;
  items: ReceiptItemData[];
  category: Category;
  status: 'pending' | 'syncing' | 'synced';
}

export interface ExtractedReceiptData {
  merchant: {
    original: string;
    translated: string;
  };
  date: string; // Should be in YYYY-MM-DD format
  total: number;
  currency: string;
  items: ReceiptItemData[];
  category: Category;
}
