import { GoogleGenAI, Type, Schema } from "@google/genai";
import { AnalysisResult, RedFlag } from "../types";

const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });

const analysisSchema: Schema = {
  type: Type.OBJECT,
  properties: {
    summary: {
      type: Type.STRING,
      description: "A 2-sentence explanation of the document for a 10-year-old.",
    },
    redFlags: {
      type: Type.ARRAY,
      description: "List of potential risks, hidden fees, or aggressive clauses.",
      items: {
        type: Type.OBJECT,
        properties: {
          risk: {
            type: Type.STRING,
            description: "The specific risk or clause found.",
          },
          severity: {
            type: Type.STRING,
            description: "Level of risk: 'high', 'medium', or 'low'.",
            enum: ["high", "medium", "low"],
          },
        },
        required: ["risk", "severity"],
      },
    },
    actionItems: {
      type: Type.ARRAY,
      description: "A checklist of what the user needs to sign, pay, or do next.",
      items: {
        type: Type.STRING,
      },
    },
    reasoning: {
      type: Type.STRING,
      description: "A detailed chain-of-thought narrative explaining the step-by-step analysis. Use first-person perspective (e.g., 'Scanning Section 4... Found an indemnity clause...').",
    },
  },
  required: ["summary", "redFlags", "actionItems", "reasoning"],
};

export const analyzeDocument = async (base64Data: string, mimeType: string): Promise<AnalysisResult> => {
  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: {
        parts: [
          {
            inlineData: {
              mimeType: mimeType,
              data: base64Data,
            },
          },
          {
            text: "Analyze this document image. Provide a simple summary, identify red flags (risks/fees), list actionable next steps, and explain your reasoning process.",
          },
        ],
      },
      config: {
        responseMimeType: "application/json",
        responseSchema: analysisSchema,
        systemInstruction: "You are an expert legal aide. Your goal is to protect the user by finding hidden risks in contracts, bills, and policies. Be concise, clear, and trustworthy. In the 'reasoning' field, document your internal thought process as you analyze the text, highlighting specific sections you are checking.",
      },
    });

    if (response.text) {
      return JSON.parse(response.text) as AnalysisResult;
    } else {
      throw new Error("No analysis generated.");
    }
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw new Error("Failed to analyze the document. Please try again.");
  }
};

export const generateNegotiation = async (summary: string, redFlags: RedFlag[]): Promise<string> => {
  try {
    const prompt = `
      Context: The user has uploaded a document with the following summary: "${summary}".
      
      Identified Red Flags:
      ${JSON.stringify(redFlags, null, 2)}
      
      Task: Draft a professional, firm, but polite negotiation email or addendum request to the counterparty.
      The goal is to request the removal or modification of these specific red flags.
      Keep the tone constructive but protective of the user's interests.
      Output ONLY the email body text.
    `;

    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
    });

    return response.text || "Could not generate negotiation text.";
  } catch (error) {
    console.error("Negotiation Generation Error:", error);
    throw new Error("Failed to generate negotiation text.");
  }
};
