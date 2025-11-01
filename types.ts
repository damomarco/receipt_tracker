

export const DEFAULT_CATEGORIES = [
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

export type DefaultCategory = typeof DEFAULT_CATEGORIES[number];
export type Category = string;

export interface ReceiptItemData {
  description: {
    original: string;
    translated: string;
  };
  price: number;
  category: Category;
}

export interface Receipt {
  id: string;
  image: string; // base64 data URL
  merchant: {
    original: string;
    translated: string;
  };
  date: string; // YYYY-MM-DD
  location?: string; // e.g., "Tokyo, Japan"
  total: number;
  currency: string;
  items: ReceiptItemData[];
  status: 'pending' | 'syncing' | 'synced';
}

export interface ExtractedReceiptData {
  merchant: {
    original: string;
    translated: string;
  };
  date: string; // Should be in YYYY-MM-DD format
  location?: {
    determined: string; // The AI's best guess for the location.
    suggestions: string[]; // A list of possible countries if the AI is uncertain.
  };
  total: number;
  currency: string;
  items: ReceiptItemData[];
}