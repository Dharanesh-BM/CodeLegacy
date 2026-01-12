import { GoogleGenerativeAI } from "@google/generative-ai";

// Access the API key from environment variables (Vite)
const apiKey = import.meta.env.VITE_GOOGLE_AI_KEY;

// Initialize the Gemini API
const genAI = new GoogleGenerativeAI(apiKey);
const model = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

const SYSTEM_PROMPT = `
You are a smart meal planning assistant. Your goal is to help users find recipes OR add meals to their plan.

RULES:
1. If the user asks for a recipe or general advice, just chat normally.
2. If the user wants to ADD a meal, you must collect two pieces of info: "Meal Name" and "Meal Time" (Breakfast, Lunch, Dinner, etc.).
3. If the user says "Add Dosa" but missing the time, ASK "For which meal time?". Do NOT assume.
4. Once you have BOTH "Meal Name" and "Meal Time", do NOT chat. Instead, output a JSON object strictly in this format:
   {
     "action": "CONFIRM_MEAL",
     "mealName": "Name of meal",
     "mealTime": "Pre-Breakfast/Breakfast/Mid-morning Snacks/Lunch/Dinner",
     "ingredients": ["List", "of", "guessed", "ingredients"]
   }
5. Do not use markdown (like \`\`\`json). Just return the raw JSON string if you are triggering the action.
`;

let chat;

export const initializeChat = () => {
    chat = model.startChat({
        history: [
            {
                role: "user",
                parts: [{ text: SYSTEM_PROMPT }]
            },
            {
                role: "model",
                parts: [{ text: "Understood. I am ready to help plan meals." }]
            }
        ],
    });
};

// Initialize immediately
initializeChat();

export const sendMessageToAgent = async (userMessage) => {
  if (!apiKey) {
      console.error("VITE_GOOGLE_AI_KEY is missing!");
      return { type: "TEXT", message: "Error: API Key missing. Please check your configuration." };
  }

  try {
    const result = await chat.sendMessage(userMessage);
    const response = result.response.text();
    
    // Attempt to identify Action
    try {
      // Clean up potential markdown code blocks if the model adds them despite instructions
      const cleanResponse = response.replace(/```json/g, '').replace(/```/g, '').trim();
      
      const jsonAction = JSON.parse(cleanResponse);
      if (jsonAction.action === "CONFIRM_MEAL") {
        return { type: "ACTION", data: jsonAction };
      }
    } catch (e) {
      // Not JSON, just normal text
      // console.log("Response is not JSON:", e);
    }

    return { type: "TEXT", message: response };
    
  } catch (error) {
    console.error("Agent Error", error);
    return { type: "TEXT", message: "Sorry, I'm having trouble connecting to the AI service." };
  }
};

// Use 'gemini-1.5-flash' (Faster & Cheaper for images)
const visionModel = genAI.getGenerativeModel({ model: "gemini-2.5-flash" });

export const identifyFoodFromImage = async (base64Image) => {
  const prompt = `
    Analyze this food image. Identify the dish Name and its Ingredients.
    Return ONLY a valid JSON object with this exact structure:
    {
      "dishName": "Name of the dish",
      "ingredients": ["Ingredient 1", "Ingredient 2", "Ingredient 3"],
      "recipe": "Short 3-step recipe instructions"
    }
    Do not use Markdown code blocks. Just the raw JSON string.
  `;

  const imagePart = {
    inlineData: {
      data: base64Image,
      mimeType: "image/jpeg",
    },
  };

  try {
    const result = await visionModel.generateContent([prompt, imagePart]);
    const response = result.response.text();
    // Clean potential markdown just in case
    const cleanResponse = response.replace(/```json|```/g, "").trim();
    return JSON.parse(cleanResponse); // Return structured data
  } catch (error) {
    console.error("Vision Error", error);
    return null;
  }
};
