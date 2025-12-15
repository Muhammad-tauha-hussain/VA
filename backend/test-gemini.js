import axios from "axios";
import dotenv from "dotenv";
dotenv.config();

const testGemini = async () => {
  try {
    const apiKey = process.env.GEMINI_API_KEY;
    const apiUrl = process.env.GEMINI_API;

    console.log("API Key:", apiKey);
    console.log("API URL:", apiUrl);

    const response = await axios.post(
      apiUrl,
      {
        contents: [{ role: "user", parts: [{ text: "Say hello" }] }]
      },
      {
        headers: {
          "Content-Type": "application/json",
          "x-goog-api-key": apiKey,
        },
      }
    );

    console.log("✅ Success:", JSON.stringify(response.data, null, 2));
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
  }
};

testGemini();
