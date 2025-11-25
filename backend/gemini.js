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
 */
const geminiResponse = async ({ userPrompt, assistantName, userName, personalityType }) => {
  try {
    const apiUrl = process.env.GEMINI_API;
    const apiKey = process.env.GEMINI_API_KEY;

    // Get personality text
    const personality =
      personalities[personalityType] ||
      "You are friendly, helpful, and conversational.";

    // ============================
    //      BUILD MASTER PROMPT
    // ============================
    const prompt = `
You are a virtual assistant named ${assistantName}, created by ${userName}.
You are NOT Google. You behave like a voice-enabled personal assistant.

Your personality is: ${personality}.
Always speak in a natural, friendly, voice-friendly way.

Your ONLY job:
Return a JSON object EXACTLY in this format — nothing extra:

{
  "type": "<general | google_search | youtube_search | youtube_play | calculator_open | instagram_open | facebook_open | weather-show | get_time | get_date | get_day | get_month>",
  "userinput": "<the cleaned user input>",
  "response": "<short spoken-style reply matching personality>"
}

Rules:
- "type": determine the intent.
- "userinput": MUST be the user's message with your name removed.
- If it's a Google or YouTube search, your userinput MUST ONLY be the search query.
- Reply in JSON ONLY. No backticks. No markdown. No explanation.
- If someone asks “tumhe kisne banaya?”, answer: "${userName}".
- Be consistent with the assigned personality.

User message: "${userPrompt}"
`;

    // ============================
    //     GEMINI API REQUEST
    // ============================
    const response = await axios.post(
      apiUrl,
      {
        contents: [
          {
            role: "user",
            parts: [
              {
                text: prompt
              }
            ]
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

    let text = response?.data?.candidates?.[0]?.content?.parts?.[0]?.text;
if(!text) throw new Error("No content returned from Gemini");


    // ============================
    //     CLEANUP & SANITIZATION
    // ============================

    // Remove escaped quotes / newlines
    text = text.replace(/\\"/g, '"').replace(/\\n/g, "\n");

    // Remove Markdown code blocks (```json or ```)
    text = text.replace(/```json/g, "").replace(/```/g, "").trim();

    // ============================
    //     PARSE JSON SAFELY
    // ============================
    let jsonResponse;

    try {
      jsonResponse = JSON.parse(text);
    } catch (err) {
      console.error("Failed to parse JSON (raw output shown below):\n", text);
      return {
        error: "Invalid JSON returned by model",
        raw: text
      };
    }

    return jsonResponse;
  } catch (error) {
    console.error("Gemini API Error:", error.response?.data || error.message);
    return { error: "API error" };
  }
};

export default geminiResponse;
