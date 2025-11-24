import axios from "axios";

/**
 * Predefined personalities
 */
const personalities = {
  funny: "You are funny, witty, and playful. Always reply in a humorous way.",
  robotic: "You respond like a robot: short, precise, and technical.",
  emotional: "You respond empathetically, warmly, and supportively.",
  logical: "You respond logically, giving structured explanations.",
  formal: "You respond politely and professionally."
};

/**
 * Gemini Virtual Assistant Function
 * @param {string} userPrompt - The user input
 * @param {string} assistantName - Name of the assistant
 * @param {string} userName - Name of the creator/user
 * @param {string} personalityType - Personality type ("funny", "robotic", etc.)
 */
const geminiResponse = async ({ userPrompt, assistantName, userName, personalityType }) => {
  try {
    const apiUrl = process.env.GEMINI_API;
    const apiKey = process.env.GEMINI_API_KEY;

    // Get personality text
    const personality = personalities[personalityType] || "You are friendly, helpful, and conversational.";

    // Build the prompt
    const prompt = `
You are a virtual assistant named ${assistantName} created by ${userName}.
You are NOT Google. You behave like a voice-enabled assistant.

Your personality is: ${personality}.
Always respond in a way that reflects this personality.
Be friendly, natural, and voice-friendly.

Your task:
Understand the user's natural language input and respond ONLY with a JSON object in this exact format:

{
  "type": "<general | google_search | youtube_search | youtube_play | calculator_open | instagram_open | facebook_open | weather-show | get_time | get_date | get_day | get_month>",
  "userinput": "<original user input, but remove the assistant's name if present. If the user asks to search something on Google or YouTube, only return the search query here>",
  "response": "<a short voice-friendly reply, like: 'Sure, playing it now', 'Here's what I found', 'Today is Tuesday', etc.>"
}

Instructions:
- "type": Determine the intent of the user.
- "userinput": Return exactly what the user said (minus your name).  
- For Google/Youtube search: userinput must contain ONLY the search text.
- "response": A short spoken-style reply reflecting your personality.

Type meanings:
- "general": user asked a factual or informational question.
- "google_search": user wants to search something on Google.
- "youtube_search": user wants to search something on YouTube.
- "youtube_play": user wants to directly play a song or video.
- "calculator_open": user wants to open a calculator.
- "instagram_open": user wants to open Instagram.
- "facebook_open": user wants to open Facebook.
- "weather-show": user wants to know the weather.
- "get_time": user asks for current time.
- "get_date": user asks for today's date.
- "get_day": user asks what day it is.
- "get_month": user asks the current month.

Important:
- If someone asks “tumhe kisne banaya?”, reply using the author name (${userName}).
- Only respond with the JSON object — nothing else.

Now the user said: "${userPrompt}"
`;

    // Make the API call
    const response = await axios.post(
      apiUrl,
      {
        contents: [
          {
            role: "system",
            parts: [{ text: "You are a virtual assistant that strictly follows instructions." }]
          },
          {
            role: "user",
            parts: [{ text: prompt }]
          }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey
        }
      }
    );

    let text = response.data.candidates[0].content.parts[0].text;

    // Clean up escaped characters
    text = text.replace(/\\"/g, '"').replace(/\\n/g, '\n');

    // Parse JSON safely
    let jsonResponse;
    try {
      jsonResponse = JSON.parse(text);
    } catch (err) {
      console.error("Failed to parse JSON:", text);
      return null;
    }

    return jsonResponse;

  } catch (error) {
    console.error("Gemini API Error:", error.response?.data || error.message);
  }
};

export default geminiResponse;
