import { GoogleGenAI, Type } from "@google/genai";
// FIX: Import the 'Receipt' type to resolve a type error.
import { ExtractedReceiptData, Receipt } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const model = 'gemini-2.5-flash';

export const processReceiptImage = async (base64Image: string, allCategories: string[], location: { latitude: number; longitude: number } | null): Promise<ExtractedReceiptData> => {
  const receiptSchema = {
    type: Type.OBJECT,
    properties: {
      merchant: {
        type: Type.OBJECT,
        properties: {
          original: {
            type: Type.STRING,
            description: "The original merchant name as it appears on the receipt, in its original language.",
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
        description: "The date of the transaction in YYYY-MM-DD format. Handle various international date formats.",
      },
      location: {
        type: Type.OBJECT,
        description: "The location of the transaction. If you are certain, provide the city and country in the 'determined' field and leave 'suggestions' empty. If you are uncertain about the country (e.g., for a receipt in Spanish), provide the city in 'determined' and list possible countries in 'suggestions'. If no location can be found, leave both fields empty.",
        properties: {
          determined: {
            type: Type.STRING,
            description: "The AI's best guess for the location, e.g., 'Tokyo, Japan' or just 'Barcelona'.",
          },
          suggestions: {
            type: Type.ARRAY,
            description: "A list of possible countries if the AI is uncertain.",
            items: {
              type: Type.STRING,
            },
          },
        },
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
        description: "A list of all items purchased. This MUST include not only products, but also any taxes, service charges, discounts, or other fees that contribute to the final total. Each should be a separate item in the array. Translate item descriptions from their original language to English.",
        items: {
          type: Type.OBJECT,
          properties: {
            description: {
              type: Type.OBJECT,
              properties: {
                original: {
                  type: Type.STRING,
                  description: "The original item name as it appears on the receipt, in its original language.",
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

  let promptText = `Analyze this receipt. Extract all details. For the location, if you are certain, provide the city/country in the 'determined' field. If you are uncertain about the country (e.g., because the language is spoken in many places), put your best guess for the city in 'determined' and list possible countries in 'suggestions'. Then, extract merchant name, date (YYYY-MM-DD), total, currency, and a detailed list of items. This list MUST include products, taxes, etc., to ensure the sum of item prices equals the final total. Translate text to English and categorize each item.`;

  if (location) {
      promptText = `Analyze this receipt. User's GPS is at Lat ${location.latitude}, Lng ${location.longitude}. Use this as a strong hint, but verify with the text to determine the final location. For the location, if you are certain, provide city/country in the 'determined' field. If uncertain about the country, put your best guess for the city in 'determined' and list possible countries in 'suggestions'. Then, extract merchant name, date (YYYY-MM-DD), total, currency, and a detailed list of items. This list MUST include all fees to ensure the sum of prices equals the total. Translate to English and categorize each item.`;
  }

  const textPart = { text: promptText };

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