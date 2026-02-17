import { GoogleGenAI } from "@google/genai";
import { Contact, Property, User } from '../types';

let ai: GoogleGenAI | null = null;

const getAIClient = () => {
  if (!ai && process.env.API_KEY) {
    ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
  }
  return ai;
};

export const generateCallScript = async (
  contact: Contact,
  property: Property,
  user: User
): Promise<string> => {
  const client = getAIClient();
  if (!client) {
    console.warn("Gemini API Key not found");
    return "Error: API Key missing. Please check configuration.";
  }

  const prompt = `
    You are an expert real estate sales coach. Write a short, punchy cold-call script for a real estate agent.
    
    Agent Name: ${user.displayName}
    
    Prospect Name: ${contact.firstName} ${contact.lastName}
    Prospect Age: ${contact.age}
    Property Address: ${property.address}, ${property.city}
    
    Goal: The agent wants to know if the prospect is interested in selling this property.
    Tone: Professional, empathetic, and direct.
    Length: Keep it under 50 words.
  `;

  try {
    const response = await client.models.generateContent({
      model: 'gemini-3-flash-preview',
      contents: prompt,
    });
    return response.text || "Could not generate script.";
  } catch (error) {
    console.error("Gemini API Error:", error);
    return "Failed to generate script due to an error.";
  }
};