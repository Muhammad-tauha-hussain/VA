import React, { useContext, useEffect, useState } from 'react';
import { userDataContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';


const Home = () => {
  const { currentUser, serverUrl, getGeminiResponse } = useContext(userDataContext);
  const navigate = useNavigate();

  const [isActivated, setIsActivated] = useState(false);
  const [lastHeard, setLastHeard] = useState("");
  const [messages, setMessages] = useState([]);
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const personalityType = currentUser?.personalityType || "logical";
  const assistantName = currentUser?.assistantName?.toLowerCase() || "assistant";

  useEffect(() => {
    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    if (!SpeechRecognition) {
      alert("Your browser does not support speech recognition");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    let isListening = false;

    const startRecognition = () => {
      if (!isListening) {
        try {
          recognition.start();
          isListening = true;
        } catch (err) {}
      }
    };

    recognition.onresult = async (event) => {
      const transcript = event.results[event.results.length - 1][0].transcript.toLowerCase();
      setLastHeard(transcript);
      console.log("🗣 Heard:", transcript);

      if (!isActivated && transcript.includes(assistantName)) {
        console.log("🎉 Wake word detected:", assistantName);
        setIsActivated(true);
        return;
      }

      if (isActivated) {
        setIsActivated(false);
        console.log("🎤 Command:", transcript);

        setMessages(prev => [...prev, { sender: "user", text: transcript }]);

        const result = await getGeminiResponse(transcript, serverUrl);
        console.log("🛠 Result from Gemini:", result);

        if (!result || result.error) {
          const speech = new SpeechSynthesisUtterance("Sorry, I could not understand that.");
          window.speechSynthesis.speak(speech);
          return;
        }

        const responseText = result.gemini?.response || "Sorry, I could not process your request.";
        setMessages(prev => [...prev, { sender: "assistant", text: responseText }]);

        const speech = new SpeechSynthesisUtterance(responseText);
        window.speechSynthesis.speak(speech);

        if (result.action) {
          handleAction(result.action);
        }
      }
    };

    recognition.onerror = (event) => {
      if (event.error === "no-speech") {
        recognition.stop();
        setTimeout(startRecognition, 400);
      }
    };

    recognition.onend = () => {
      isListening = false;
      setTimeout(startRecognition, 300);
    };

    const enableMic = () => {
      startRecognition();
      window.removeEventListener("click", enableMic);
    };
    window.addEventListener("click", enableMic);

    return () => {
      recognition.stop();
      window.removeEventListener("click", enableMic);
    };
  }, [currentUser, isActivated, serverUrl]);

  const handleAction = (action) => {
    switch (action.type) {
      case "google_search":
        window.open(`https://www.google.com/search?q=${action.userinput}`, "_blank");
        break;
      case "youtube_search":
        window.open(`https://www.youtube.com/results?search_query=${action.userinput}`, "_blank");
        break;
      case "youtube_play":
        window.open(`https://www.youtube.com/watch?v=${action.videoId || ""}`, "_blank");
        break;
      case "calculator_open":
        window.open("https://www.google.com/search?q=calculator", "_blank");
        break;
      case "instagram_open":
        window.open("https://www.instagram.com/", "_blank");
        break;
      case "facebook_open":
        window.open("https://www.facebook.com/", "_blank");
        break;
      case "weather_show":
        window.open(`https://www.google.com/search?q=weather+${action.userinput || ""}`, "_blank");
        break;
      case "get_time":
        alert(`Current time: ${new Date().toLocaleTimeString()}`);
        break;
      case "get_date":
        alert(`Today's date: ${new Date().toLocaleDateString()}`);
        break;
      default:
        console.log("No action defined for:", action);
    }
  };

  const handleLogOut = async () => {
    try {
      await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true });
      navigate('/login');
    } catch (error) {
      console.log(error);
    }
  };

  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-200 via-gray-300 to-slate-300 flex flex-col items-center justify-center relative overflow-hidden">
      
      {/* Decorative background gradients - darker shadows */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_left,var(--tw-gradient-stops))] from-slate-400/40 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom_right,var(--tw-gradient-stops))] from-gray-400/30 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,var(--tw-gradient-stops))] from-transparent via-slate-300/20 to-slate-400/30 pointer-events-none"></div>

      {/* User dropdown */}
      <div className="absolute top-8 left-8 z-20">
        <div className="relative">
          {/* User button */}
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 bg-slate-100/90 backdrop-blur-md border border-slate-300 px-4 py-2.5 rounded-full hover:bg-white/95 hover:shadow-lg transition-all duration-300 shadow-md group"
          >
            {/* User avatar or initials */}
            {currentUser?.image ? (
              <img
                src={currentUser.image}
                alt={currentUser.name}
                className="w-9 h-9 rounded-full object-cover border-2 border-slate-400"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-gradient-to-br from-slate-500 to-gray-600 flex items-center justify-center text-white font-semibold text-sm border-2 border-slate-400">
                {getUserInitials(currentUser?.name)}
              </div>
            )}

            {/* User name */}
            <span className="text-gray-700 font-medium hidden sm:block">
              {currentUser?.name || 'User'}
            </span>

            {/* Dropdown arrow */}
            <svg
              className={`w-4 h-4 text-gray-600 transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-slate-100/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-slate-300 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              {/* User info section */}
              <div className="px-4 py-3 bg-gradient-to-r from-slate-200 to-gray-200 border-b border-slate-300">
                <div className="flex items-center gap-3">
                  {currentUser?.image ? (
                    <img
                      src={currentUser.image}
                      alt={currentUser.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-slate-400"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-gradient-to-br from-slate-500 to-gray-600 flex items-center justify-center text-white font-bold text-lg border-2 border-slate-400">
                      {getUserInitials(currentUser?.name)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-gray-800 truncate">
                      {currentUser?.name || 'User'}
                    </p>
                    <p className="text-xs text-gray-600 truncate">
                      {currentUser?.email || 'user@example.com'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Menu items */}
              <div className="py-2">
                <button
                  onClick={() => {
                    navigate('/customized');
                    setDropdownOpen(false);
                  }}
                  className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gradient-to-r hover:from-slate-200 hover:to-gray-200 transition-all duration-200 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-slate-200 to-gray-300 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <svg className="w-5 h-5 text-slate-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Customize Assistant</p>
                    <p className="text-xs text-gray-600">Personalize your AI</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    handleLogOut();
                    setDropdownOpen(false);
                  }}
                  className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-gradient-to-r hover:from-red-50 hover:to-orange-50 transition-all duration-200 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-800">Log Out</p>
                    <p className="text-xs text-gray-600">Sign out of your account</p>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main assistant area */}
      <div className="relative z-10 flex flex-col items-center">
        {/* Assistant image */}
        <div className="relative mb-8 group">

          {/* Glow behind image */}
          <div className="absolute inset-0 bg-slate-400/40 blur-3xl rounded-full scale-110 group-hover:scale-125 transition-transform duration-500 pointer-events-none"></div>

          {/* Assistant image */}
          <div className="relative w-64 sm:w-72 h-80 sm:h-96 rounded-3xl overflow-hidden shadow-2xl border-4 border-slate-400/50 group-hover:border-slate-500/70 transition-all duration-300">
            <img
              src={currentUser?.assistantImage || "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=500&fit=crop"}
              alt={currentUser?.assistantName || "Assistant"}
              className="w-full h-full object-cover"
            />

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-gradient-to-t from-slate-800/60 via-transparent to-transparent pointer-events-none"></div>
          </div>
        </div>

        {/* Assistant name */}
        <h1 className="text-gray-800 text-2xl sm:text-3xl font-light tracking-wide">
          I'm {currentUser?.assistantName || "Assistant"}
        </h1>
      </div>

      {/* Conversation Box */}
      <div className="absolute bottom-10 w-96 h-80 overflow-y-auto p-4 bg-slate-100/80 backdrop-blur-md rounded-xl shadow-xl border border-slate-300 text-gray-800 space-y-2">
        {messages.map((msg, idx) => (
          <div key={idx} className={msg.sender === "user" ? "text-right" : "text-left"}>
            <span className={msg.sender === "user" ? "bg-slate-600 text-white px-3 py-2 rounded-lg inline-block shadow-sm" : "bg-white/90 text-gray-800 px-3 py-2 rounded-lg inline-block shadow-sm"}>
              {msg.text}
            </span>
          </div>
        ))}
      </div>

      {/* Decorative elements - darker shadows */}
      <div className="absolute top-1/4 left-1/4 w-48 sm:w-64 h-48 sm:h-64 bg-slate-500/25 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-gray-500/20 rounded-full blur-3xl pointer-events-none"></div>
    </div>
  );
};

export default Home;