export const handleAction = async (action) => {
  const { type, userinput, response } = action;

  switch (type) {

    case "google_search":
      return {
        actionType: type,
        url: `https://www.google.com/search?q=${encodeURIComponent(userinput)}`,
        message: response
      };

    case "youtube_search":
      return {
        actionType: type,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(userinput)}`,
        message: response
      };

    case "youtube_play":
      return {
        actionType: type,
        url: `https://www.youtube.com/results?search_query=${encodeURIComponent(userinput)}`,
        message: response
      };

    case "instagram_open":
      return {
        actionType: type,
        url: "https://instagram.com",
        message: response
      };

    case "facebook_open":
      return {
        actionType: type,
        url: "https://facebook.com",
        message: response
      };

    case "calculator_open":
      return {
        actionType: type,
        openApp: "calculator",
        message: response
      };

    case "weather_show":
      return {
        actionType: type,
        api: `https://api.weatherapi.com/v1/current.json?q=${encodeURIComponent(userinput)}`,
        message: response
      };

    case "get_time":
      return {
        actionType: type,
        message: `${response} ${new Date().toLocaleTimeString()}`,
      };

    case "get_date":
      return {
        actionType: type,
        message: `${response} ${new Date().toLocaleDateString()}`,
      };

    case "get_day":
      return {
        actionType: type,
        message: `${response} ${new Date().toLocaleDateString("en-US", { weekday: "long" })}`,
      };

    case "get_month":
      return {
        actionType: type,
        message: `${response} ${new Date().toLocaleDateString("en-US", { month: "long" })}`,
      };

    default:
      return {
        actionType: "general",
        message: response
      };
  }
};
