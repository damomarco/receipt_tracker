// A curated palette of Tailwind CSS color names for good contrast and variety.
const colorPalette = [
  'blue', 'green', 'purple', 'pink', 'orange', 'teal', 'yellow', 'red', 'indigo', 'cyan'
];

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
 * Determines the base color name for a given category.
 * It uses a predefined mapping for default categories and generates a hash-based
 * color for any custom categories.
 * @param {string} category The name of the category.
 * @returns {string} The Tailwind CSS color name (e.g., 'blue', 'green').
 */
export const getCategoryColorName = (category: string): string => {
  const defaultColorNames: Record<string, string> = {
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

  if (defaultColorNames[category]) {
    return defaultColorNames[category];
  }

  const hash = simpleHash(category);
  // Use the hash to pick a color from the palette
  return colorPalette[hash % colorPalette.length];
};

/**
 * Generates the Tailwind CSS classes for displaying a category tag.
 * @param {string} colorName The base color name (e.g., 'blue').
 * @returns {string} The full set of classes for styling the tag.
 */
export const getCategoryDisplayClasses = (colorName: string): string => {
  if (colorName === 'gray') {
    return 'bg-gray-200 text-gray-800 dark:bg-gray-700 dark:text-gray-200';
  }
  return `bg-${colorName}-100 text-${colorName}-800 dark:bg-${colorName}-900/50 dark:text-${colorName}-200`;
};
