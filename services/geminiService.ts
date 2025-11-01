

import { GoogleGenAI, Type } from "@google/genai";
import { ExtractedReceiptData, Receipt, DEFAULT_CATEGORIES } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const model = 'gemini-2.5-flash';

export const processReceiptImage = async (base64Image: string, allCategories: string[]): Promise<ExtractedReceiptData> => {
  const receiptSchema = {
    type: Type.OBJECT,
    properties: {
      merchant: {
        type: Type.OBJECT,
        properties: {
          original: {
            type: Type.STRING,
            description: "The original merchant name as it appears on the receipt, in Japanese.",
          },
          translated: {
            type: Type.STRING,
            description: "The English translation of the merchant name.",
          },
        },
        required: ['original', 'translated'],
      },
      date: {
        type: Type.STRING,
        description: "The date of the transaction in YYYY-MM-DD format. Handle Japanese date formats like 令和 (Reiwa).",
      },
      total: {
        type: Type.NUMBER,
        description: "The final total amount of the transaction.",
      },
      currency: {
        type: Type.STRING,
        description: "The currency of the transaction (e.g., JPY, USD). Use the currency symbol or code from the receipt.",
      },
      items: {
        type: Type.ARRAY,
        description: "A list of all items purchased, including their description and price. Translate Japanese item descriptions to English.",
        items: {
          type: Type.OBJECT,
          properties: {
            description: {
              type: Type.OBJECT,
              properties: {
                original: {
                  type: Type.STRING,
                  description: "The original item name as it appears on the receipt, in Japanese.",
                },
                translated: {
                  type: Type.STRING,
                  description: "The English translation of the item name.",
                },
              },
              required: ['original', 'translated'],
            },
            price: {
              type: Type.NUMBER,
              description: "The price of the individual item.",
            },
            category: {
              type: Type.STRING,
              description: `Categorize the item. Choose one of the following categories: ${allCategories.join(', ')}. If unsure, use 'Other'.`,
              enum: allCategories,
            },
          },
          required: ['description', 'price', 'category'],
        }
      }
    },
    required: ['merchant', 'date', 'total', 'currency', 'items'],
  };
  
  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64Image,
    },
  };

  const textPart = {
    text: `Analyze this Japanese receipt. Extract the merchant name, date, total amount, currency, and a list of all purchased items with their prices. For each item, translate its description to English and assign it an appropriate expense category from the provided list. Provide the date in YYYY-MM-DD format. Ensure accuracy.`,
  };

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [imagePart, textPart] },
      config: {
        responseMimeType: "application/json",
        responseSchema: receiptSchema,
      },
    });

    const jsonText = response.text.trim();
    const parsedData: ExtractedReceiptData = JSON.parse(jsonText);

    // Basic validation
    const itemsAreValid = parsedData.items.every(item => item.description && typeof item.price === 'number' && item.category);
    if (!parsedData.merchant || !parsedData.date || typeof parsedData.total !== 'number' || !parsedData.currency || !Array.isArray(parsedData.items) || !itemsAreValid) {
        throw new Error("Extracted data is missing required fields or items are malformed.");
    }
    
    // If Gemini fails itemization but gets a total, create a fallback item to prevent errors.
    if (parsedData.items.length === 0 && parsedData.total > 0) {
        parsedData.items.push({
            description: {
                original: '不明',
                translated: 'Uncategorized Item'
            },
            price: parsedData.total,
            category: 'Other'
        });
    }

    return parsedData;

  } catch (error) {
    console.error("Error processing receipt with Gemini API:", error);
    throw new Error("Failed to analyze receipt. The image might be unclear or the format unsupported.");
  }
};

export const askAboutAllReceipts = async (receipts: Receipt[], prompt: string): Promise<string> => {
  if (receipts.length === 0) {
    return "You haven't added any receipts yet. Please add some receipts to start asking questions.";
  }

  // Sanitize receipts for the prompt to remove the base64 image data
  const sanitizedReceipts = receipts.map(({ image, ...rest }) => rest);

  const contextPrompt = `You are a helpful assistant for managing travel expenses. Based on the following JSON data, which represents a list of receipts, please answer the user's question. The 'items' array in each receipt contains individual products with their own categories. Provide concise and helpful answers. Do not mention the JSON structure in your answer.

Here is the receipt data:
${JSON.stringify(sanitizedReceipts, null, 2)}

User's question: "${prompt}"`;

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: contextPrompt,
    });
    return response.text;
  } catch (error) {
    console.error("Error querying about all receipts with Gemini API:", error);
    throw new Error("Failed to get an answer from the AI.");
  }
};
