/// <reference types="vite/client" />
import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

export const getSimulationExplanation = async (mode: string, state: string) => {
  try {
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    
    const prompt = `
      You are an AI assistant for HoloLab, a 3D science learning platform.
      The user is currently in ${mode} mode.
      The current simulation state is: ${state}
      
      Provide a concise, engaging, and educational explanation (max 3 sentences) 
      about what is happening in the simulation. Focus on scientific concepts.
    `;

    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text();
  } catch (error) {
    console.error("Gemini Error:", error);
    return "I'm having trouble connecting to my science database right now.";
  }
};
