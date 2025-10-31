import { GoogleGenAI, Type } from "@google/genai";
import { ExtractedReceiptData } from "../types";

const API_KEY = process.env.API_KEY;

if (!API_KEY) {
  console.warn("Gemini API key not found. Please set the API_KEY environment variable.");
}

const ai = new GoogleGenAI({ apiKey: API_KEY });

const model = 'gemini-2.5-flash';

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
  },
  required: ['merchant', 'date', 'total', 'currency'],
};

export const processReceiptImage = async (base64Image: string): Promise<ExtractedReceiptData> => {
  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64Image,
    },
  };

  const textPart = {
    text: `Analyze this Japanese receipt. Extract the merchant name, date, total amount, and currency. Translate the merchant name to English. Provide the date in YYYY-MM-DD format. Ensure accuracy.`,
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
    if (!parsedData.merchant || !parsedData.date || typeof parsedData.total !== 'number' || !parsedData.currency) {
      throw new Error("Extracted data is missing required fields.");
    }

    return parsedData;

  } catch (error) {
    console.error("Error processing receipt with Gemini API:", error);
    throw new Error("Failed to analyze receipt. The image might be unclear or the format unsupported.");
  }
};

export const askAboutImage = async (base64Image: string, prompt: string): Promise<string> => {
  const imagePart = {
    inlineData: {
      mimeType: 'image/jpeg',
      data: base64Image,
    },
  };

  const textPart = {
    text: prompt,
  };

  try {
    const response = await ai.models.generateContent({
      model: model,
      contents: { parts: [imagePart, textPart] },
    });

    return response.text;
  } catch (error) {
    console.error("Error asking about image with Gemini API:", error);
    throw new Error("Failed to get an answer from the AI.");
  }
};
