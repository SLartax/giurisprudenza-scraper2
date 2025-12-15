import { GoogleGenAI, Type } from "@google/genai";
import { AnalysisResult } from '../types';

const getClient = () => {
  const apiKey = process.env.API_KEY;
  if (!apiKey) {
    console.error("API_KEY is missing from environment variables");
  }
  return new GoogleGenAI({ apiKey: apiKey || 'dummy-key-for-build' });
};

export const analyzeLegalText = async (text: string): Promise<AnalysisResult> => {
  const ai = getClient();
  
  const prompt = `
    Analizza il seguente testo di una sentenza tributaria italiana. 
    Estrai le seguenti informazioni in formato JSON strutturato:
    1. "summary": Una massima giuridica sintetica che spieghi esplicitamente i motivi di accoglimento, evidenziando il principio di diritto che ha favorito il contribuente (max 4 frasi).
    2. "outcome": L'esito finale per il contribuente (FAVOREVOLE, SFAVOREVOLE, PARZIALE, RINVIO).
    3. "judge": Il nome dell'organo giudicante (es. "Corte di Cassazione", "CGT Lombardia").
    4. "caseNumber": Il numero della sentenza (es. "n. 1234/2025") se presente nel testo.
    5. "year": L'anno della sentenza.
    6. "legalReferences": Una lista dei riferimenti normativi citati.
    7. "keyPoints": 3-5 punti chiave del ragionamento giuridico.

    Testo della sentenza:
    ${text}
  `;

  try {
    const response = await ai.models.generateContent({
      model: "gemini-2.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            summary: { type: Type.STRING, description: "Massima giuridica con principio di diritto favorevole al contribuente" },
            outcome: { 
              type: Type.STRING, 
              enum: ["FAVOREVOLE", "SFAVOREVOLE", "PARZIALE", "RINVIO", "UNKNOWN"],
              description: "Esito per il contribuente" 
            },
            judge: { type: Type.STRING, description: "Organo giudicante" },
            caseNumber: { type: Type.STRING, description: "Numero della sentenza" },
            year: { type: Type.STRING, description: "Anno della sentenza" },
            legalReferences: { 
              type: Type.ARRAY, 
              items: { type: Type.STRING },
              description: "Leggi citate" 
            },
            keyPoints: {
              type: Type.ARRAY,
              items: { type: Type.STRING },
              description: "Punti chiave del ragionamento"
            }
          },
          required: ["summary", "outcome", "judge", "year"]
        }
      }
    });

    if (response.text) {
      return JSON.parse(response.text) as AnalysisResult;
    }
    throw new Error("No response text generated");
  } catch (error) {
    console.error("Gemini Analysis Error:", error);
    throw error;
  }
};