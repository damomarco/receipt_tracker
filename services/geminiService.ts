import { GoogleGenAI, Type } from "@google/genai";
// FIX: Import the 'Receipt' type to resolve a type error.
import { ExtractedReceiptData, Receipt } from "../types";

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
      location: {
        type: Type.STRING,
        description: "The city or country where the transaction took place, if identifiable from the receipt. e.g., 'Tokyo, Japan'. If it cannot be determined, leave this field empty.",
      },
      total: {
        type: Type.NUMBER,
        description: "The final total amount of the transaction. This should be the sum of all items, including taxes and fees.",
      },
      currency: {
        type: Type.STRING,
        description: "The currency of the transaction (e.g., JPY, USD). Use the currency symbol or code from the receipt.",
      },
      items: {
        type: Type.ARRAY,
        description: "A list of all items purchased. This MUST include not only products, but also any taxes (like 消費税), service charges, discounts, or other fees that contribute to the final total. Each should be a separate item in the array. Translate Japanese item descriptions to English.",
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
              description: `Categorize the item. Choose one of the following categories: ${allCategories.join(', ')}. For items like tax or service fees, use 'Other' or an appropriate category if available. If unsure, use 'Other'.`,
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
    text: `Analyze this receipt. First, try to identify the location (city, country) from the receipt's text. Then extract all other details: merchant name, date (in YYYY-MM-DD format), total, currency, and a detailed list of items. This list MUST include products, taxes (like 消費税), service charges, and any other fees to ensure the sum of item prices equals the final total. Translate Japanese text to English. Assign an expense category for each item from the provided list. If you cannot determine a location, leave the location field empty.`,
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
    
    // Enforce data integrity: The final total MUST be the sum of its items.
    // This overrides the 'total' extracted by the AI, making the item list the single source of truth.
    const calculatedTotal = parsedData.items.reduce((acc, item) => acc + (Number(item.price) || 0), 0);
    parsedData.total = calculatedTotal;

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