import { GoogleGenerativeAI } from "@google/generative-ai";

const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;
const genAI = new GoogleGenerativeAI(API_KEY);

/**
 * Generates MCQs from educational material (Image or PDF)
 * @param {string} base64Data - Base64 encoded file data
 * @param {string} mimeType - File mime type
 * @returns {Promise<Array>} - Array of MCQ objects
 */
export const generateMCQsFromMaterial = async (base64Data, mimeType) => {
  try {
    if (!API_KEY) {
      throw new Error("Gemini API Key is missing. Please add VITE_GEMINI_API_KEY to your .env file.");
    }

    // Use gemini-1.5-flash
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

    const prompt = `
      You are an expert educational content creator. I have uploaded material from a textbook.
      Please perform the following tasks:
      1. Analyze the content carefully.
      2. If multiple chapters or units are present, focus on extracting the main concepts.
      3. Generate high-quality Multiple Choice Questions (MCQs) based on this material.
      4. Each question must have exactly 4 options.
      5. Ensure one and only one option is correct.
      6. Provide the output strictly in the following JSON format:
      [
        {
          "question": "Question text here (Support Mathematical expressions using $...$ if needed)",
          "options": ["Option 1", "Option 2", "Option 3", "Option 4"],
          "answer": "The exact correct option string from the options array"
        }
      ]
      7. Language: Output the questions in the SAME language as the input material (unless it's a translation request).
      8. Do not include any text other than the JSON array in your response.
    `;

    const result = await model.generateContent([
      prompt,
      {
        inlineData: {
          data: base64Data,
          mimeType: mimeType
        }
      }
    ]);

    const response = await result.response;
    const text = response.text();
    
    // Clean up response (Gemini sometimes wraps JSON in markdown blocks)
    const jsonString = text.replace(/```json|```/g, "").trim();
    const mcqs = JSON.parse(jsonString);

    return mcqs;
  } catch (error) {
    console.error("Gemini AI Error:", error);
    throw error;
  }
};
