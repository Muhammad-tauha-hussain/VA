// import axios from "axios";
// // import { responseSchema } from "./models/responseSchema.js"; 
// // ❌ Do NOT send schema to Gemini

// const geminiResponse = async ({ prompt, assistantName, userName }) => {
//   try {
//     const MODEL = "gemini-2.0-flash-lite";
//     const apiKey = process.env.GEMINI_API_URL;

//     const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/${MODEL}:generateContent`;

//     // ===== MASTER PROMPT =====
//     const fullPrompt = `
// You are a virtual assistant named ${assistantName || "Fasso"}, created by ${userName || "fasso"}.
// You are friendly, helpful, and conversational.
// Speak in a natural voice tone.

// Rules:
// - Remove your name from "userinput" if present
// - Detect the correct intent type
// - Keep response short and voice-friendly
// - If user asks "tumhe kisne banaya?", answer "${userName || "fasso"}"

// Respond ONLY in valid JSON like this:
// {
//   "type": "general",
//   "userinput": "hello",
//   "response": "Hello! How can I help you today?"
// }

// User message: "${prompt}"
// `;

//     // 🔹 Debug log
//     console.log(
//       "🔹 Gemini Request Payload:",
//       JSON.stringify(
//         {
//           contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
//         },
//         null,
//         2
//       )
//     );

//     // ===== GEMINI REQUEST =====
//     const response = await axios.post(
//       apiUrl,
//       {
//         contents: [{ role: "user", parts: [{ text: fullPrompt }] }],
//       },
//       {
//         headers: {
//           "Content-Type": "application/json",
//           "X-goog-api-key": apiKey, // ✅ correct way
//         },
//       }
//     );

//     console.log("🔹 Gemini Response:", response.data);

//     // ===== RESPONSE HANDLING =====
//     const rawText =
//       response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

//     console.log("🔹 Gemini Raw Output:", rawText);

//     if (!rawText) {
//       console.warn("⚠️ Gemini returned no text", response.data);
//       return { error: "Empty response from Gemini" };
//     }

//     let jsonResponse;
//     try {
//       jsonResponse = JSON.parse(rawText);
//     } catch (err) {
//       console.error("❌ JSON Parse Failed:", rawText);
//       return { error: "Invalid JSON from Gemini" };
//     }

//     return jsonResponse; // { type, userinput, response }

//   } catch (error) {
//     console.error("❌ Gemini API Error:", error || error.message);
//     return { error: "Gemini API error" };
//   }
// };

// export default geminiResponse;
import axios from "axios";

const geminiResponse = async ({ prompt, assistantName = "Fasso", userName = "fasso" }) => {
  const MODEL = "gemini-1.5-flash"; // ✅ safer
  const apiKey = process.env.GEMINI_API_URL;
  const apiUrl = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent`;

  try {
    const response = await axios.post(
      apiUrl,
      {
        contents: [
          {
            role: "user",
            parts: [{ text: `User says: "${prompt}"` }]
          }
        ]
      },
      {
        headers: {
          "Content-Type": "application/json",
          "X-goog-api-key": apiKey
        }
      }
    );

    const text =
      response.data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // 🧠 Backend intelligence (NOT Gemini)
    let finalResponse = text.trim();

    if (/tumhe kisne banaya/i.test(prompt)) {
      finalResponse = userName;
    }

    return {
      type: "general",
      userinput: prompt.replace(new RegExp(assistantName, "ig"), "").trim(),
      response: finalResponse || "I’m here to help 🙂"
    };

  } catch (error) {
    if (error.response?.status === 429) {
      console.warn("⚠️ Gemini rate limited, retrying...");
      await sleep(2000);
      return geminiResponse({ prompt, assistantName, userName });
    }

    console.error("❌ Gemini Error:", error.message);
    return {
      type: "error",
      userinput: prompt,
      response: "I’m having trouble right now. Please try again."
    };
  }
};

export default geminiResponse;
