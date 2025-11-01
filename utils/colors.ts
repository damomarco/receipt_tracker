// A curated palette of Tailwind CSS color names for good contrast and variety.
const colorPalette = [
  'blue', 'green', 'purple', 'pink', 'orange', 'teal', 'yellow', 'red', 'indigo', 'cyan'
] as const;

type ColorName = typeof colorPalette[number];

interface CategoryStyling {
    tag: string;
    bar: string;
    dot: string;
}

// Maps color names to full, static Tailwind class strings.
// This is critical for Tailwind's JIT compiler to find and include these classes in the final build.
const colorMap: Record<ColorName | 'gray', CategoryStyling> = {
    blue: {
        tag: 'bg-blue-100 text-blue-800 dark:bg-blue-900/50 dark:text-blue-200',
        bar: 'bg-blue-500',
        dot: 'bg-blue-500'
    },
    green: {
        tag: 'bg-green-100 text-green-800 dark:bg-green-900/50 dark:text-green-200',
        bar: 'bg-green-500',
        dot: 'bg-green-500'
    },
    purple: {
        tag: 'bg-purple-100 text-purple-800 dark:bg-purple-900/50 dark:text-purple-200',
        bar: 'bg-purple-500',
        dot: 'bg-purple-500'
    },
    pink: {
        tag: 'bg-pink-100 text-pink-800 dark:bg-pink-900/50 dark:text-pink-200',
        bar: 'bg-pink-500',
        dot: 'bg-pink-500'
    },
    orange: {
        tag: 'bg-orange-100 text-orange-800 dark:bg-orange-900/50 dark:text-orange-200',
        bar: 'bg-orange-500',
        dot: 'bg-orange-500'
    },
    teal: {
        tag: 'bg-teal-100 text-teal-800 dark:bg-teal-900/50 dark:text-teal-200',
        bar: 'bg-teal-500',
        dot: 'bg-teal-500'
    },
    yellow: {
        tag: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/50 dark:text-yellow-200',
        bar: 'bg-yellow-500',
        dot: 'bg-yellow-500'
    },
    red: {
        tag: 'bg-red-100 text-red-800 dark:bg-red-900/50 dark:text-red-200',
        bar: 'bg-red-500',
        dot: 'bg-red-500'
    },
    indigo: {
        tag: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/50 dark:text-indigo-200',
        bar: 'bg-indigo-500',
        dot: 'bg-indigo-500'
    },
    cyan: {
        tag: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-900/50 dark:text-cyan-200',
        bar: 'bg-cyan-500',
        dot: 'bg-cyan-500'
    },
    gray: {
        tag: 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200',
        bar: 'bg-gray-500 dark:bg-gray-400',
        dot: 'bg-gray-500 dark:bg-gray-400'
    }
};

/**
 * A simple, non-cryptographic hash function that converts a string to a number.
 * Used to deterministically pick a color from the palette.
 * @param {string} str The input string (e.g., category name).
 * @returns {number} A positive integer hash.
 */
const simpleHash = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash |= 0; // Convert to 32bit integer
  }
  return Math.abs(hash);
};

/**
 * Determines the full styling object for a given category.
 * It uses a predefined mapping for default categories and generates a hash-based
 * color for any custom categories.
 * @param {string} category The name of the category.
 * @returns {CategoryStyling} An object with full Tailwind class strings.
 */
export const getCategoryStyling = (category: string): CategoryStyling => {
  const defaultColorMapping: Record<string, ColorName | 'gray'> = {
    'Food & Drink': 'blue',
    'Groceries': 'green',
    'Transportation': 'purple',
    'Shopping': 'pink',
    'Lodging': 'orange',
    'Entertainment': 'teal',
    'Utilities': 'yellow',
    'Health & Wellness': 'red',
    'Other': 'gray',
  };

  const colorName = defaultColorMapping[category];
  if (colorName) {
    return colorMap[colorName];
  }

  const hash = simpleHash(category);
  // Use the hash to pick a color from the palette
  const customColorName = colorPalette[hash % colorPalette.length];
  return colorMap[customColorName];
};