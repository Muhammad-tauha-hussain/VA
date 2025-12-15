// responseSchema.js
export const responseSchema = {
  type: "object",
  properties: {
    type: {
      type: "string",
      description: "Intent type of user request",
      enum: [
        "general",
        "google_search",
        "youtube_search",
        "youtube_play",
        "calculator_open",
        "instagram_open",
        "facebook_open",
        "weather_show",
        "get_time",
        "get_date",
        "get_day",
        "get_month"
      ]
    },
    userinput: {
      type: "string",
      description: "Cleaned version of user input without assistant name"
    },
    response: {
      type: "string",
      description: "Friendly spoken-style answer from assistant"
    }
  },
  required: ["type", "userinput", "response"]
};
