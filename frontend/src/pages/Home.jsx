import React, { useContext, useEffect, useState } from 'react';
import { userDataContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Home = () => {
  const { currentUser, serverUrl } = useContext(userDataContext);
  const navigate = useNavigate();
  const [isActivated, setIsActivated] = useState(false);
  const [lastHeard, setLastHeard] = useState("");

  const [dropdownOpen, setDropdownOpen] = useState(false);

  useEffect(() => {

    console.log(currentUser);

  }, [currentUser])

  useEffect(() => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Your browser does not support speech recognition");
      return;
    }

    const recognition = new SpeechRecognition();

    recognition.continuous = true;
    recognition.interimResults = false;
    recognition.lang = "en-US";

    let isListening = false;

    const assistantName = currentUser?.assistantName?.toLowerCase() || "assistant";
    const personalityType = currentUser?.personalityType;

    const startRecognition = () => {
      if (!isListening) {
        try {
          recognition.start();
          isListening = true;
        } catch (err) { }
      }
    };

    recognition.onresult = async (event) => {
      const transcript =
        event.results[event.results.length - 1][0].transcript.toLowerCase();

      console.log("🗣 Heard:", transcript);
      setLastHeard(transcript);

      // 🟢 Step 1: Detect wake word
      if (!isActivated && transcript.includes(assistantName)) {
        console.log("🎉 Wake word detected:", assistantName);
        setIsActivated(true);
        return;
      }

      // 🟢 Step 2: If activated → treat next sentence as command
      if (isActivated) {
        console.log("🎤 Command:", transcript);
        setIsActivated(false);

        const response = await getGeminiResponse(transcript, personalityType);
        console.log("🤖 Gemini says:", response);

        // Optional: make the assistant speak it
        if (response) {
          const speech = new SpeechSynthesisUtterance(response.text || response);
          window.speechSynthesis.speak(speech);
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
  }, [currentUser]);




  const handleLogOut = async () => {
    try {
      const logOut = await axios.get(`${serverUrl}/api/auth/logout`, { withCredentials: true });
      console.log(logOut);
      navigate('/login')
    } catch (error) {
      console.log(error);
    }
  }

  const getUserInitials = (name) => {
    if (!name) return 'U';
    return name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
  };

  return (
    <div className="min-h-screen bg-black bg-linear-gradient-to-br from-slate-950 via-blue-950 to-slate-900 flex flex-col items-center justify-center relative overflow-hidden">

      {/* Subtle background effects */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,var(--tw-gradient-stops))] from-blue-900/20 via-transparent to-transparent pointer-events-none"></div>
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_bottom,var(--tw-gradient-stops))] from-cyan-900/10 via-transparent to-transparent pointer-events-none"></div>

      {/* Top left user dropdown */}
      <div className="absolute top-8 left-8 z-20">
        <div className="relative">
          {/* User button */}
          <button
            onClick={() => setDropdownOpen(!dropdownOpen)}
            className="flex items-center gap-3 bg-white/10 backdrop-blur-md border border-white/20 px-4 py-2.5 rounded-full hover:bg-white/20 transition-all duration-300 shadow-lg group"
          >
            {/* User avatar or initials */}
            {currentUser?.image ? (
              <img
                src={currentUser.image}
                alt={currentUser.name}
                className="w-9 h-9 rounded-full object-cover border-2 border-cyan-400/50"
              />
            ) : (
              <div className="w-9 h-9 rounded-full bg-linear-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-semibold text-sm border-2 border-cyan-400/50">
                {getUserInitials(currentUser?.name)}
              </div>
            )}

            {/* User name */}
            <span className="text-white font-medium hidden sm:block">
              {currentUser?.name || 'User'}
            </span>

            {/* Dropdown arrow */}
            <svg
              className={`w-4 h-4 text-white transition-transform duration-300 ${dropdownOpen ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {/* Dropdown menu */}
          {dropdownOpen && (
            <div className="absolute top-full left-0 mt-2 w-64 bg-white/95 backdrop-blur-xl rounded-2xl shadow-2xl border border-white/20 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">
              {/* User info section */}
              <div className="px-4 py-3 bg-linear-gradient-to-r from-cyan-50 to-blue-50 border-b border-slate-200">
                <div className="flex items-center gap-3">
                  {currentUser?.image ? (
                    <img
                      src={currentUser.image}
                      alt={currentUser.name}
                      className="w-12 h-12 rounded-full object-cover border-2 border-cyan-400"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-linear-gradient-to-br from-cyan-400 to-blue-500 flex items-center justify-center text-white font-bold text-lg border-2 border-cyan-400">
                      {getUserInitials(currentUser?.name)}
                    </div>
                  )}
                  <div className="flex-1 min-w-0">
                    <p className="text-sm font-semibold text-slate-900 truncate">
                      {currentUser?.name || 'User'}
                    </p>
                    <p className="text-xs text-slate-600 truncate">
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
                  className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-linear-gradient-to-r hover:from-cyan-50 hover:to-blue-50 transition-all duration-200 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-linear-gradient-to-br from-cyan-100 to-blue-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <svg className="w-5 h-5 text-cyan-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 110-4m0 4v2m0-6V4" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Customize Assistant</p>
                    <p className="text-xs text-slate-500">Personalize your AI</p>
                  </div>
                </button>

                <button
                  onClick={() => {
                    handleLogOut();
                    setDropdownOpen(false);
                  }}
                  className="w-full px-4 py-3 text-left flex items-center gap-3 hover:bg-linear-gradient-to-r hover:from-red-50 hover:to-orange-50 transition-all duration-200 group"
                >
                  <div className="w-9 h-9 rounded-lg bg-linear-gradient-to-br from-red-100 to-orange-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-200">
                    <svg className="w-5 h-5 text-red-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-slate-900">Log Out</p>
                    <p className="text-xs text-slate-500">Sign out of your account</p>
                  </div>
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main content */}
      <div className="relative z-10 flex flex-col items-center">
        <div className="relative mb-8 group">

          {/* Glow behind image */}
          <div className="absolute inset-0 bg-cyan-500/30 blur-3xl rounded-full scale-110 group-hover:scale-125 transition-transform duration-500 pointer-events-none"></div>

          {/* Assistant image */}
          <div className="relative w-64 sm:w-72 h-80 sm:h-96 rounded-3xl overflow-hidden shadow-2xl border-4 border-cyan-400/30 group-hover:border-cyan-400/50 transition-all duration-300">
            <img
              src={
                currentUser?.assistantImage ||
                "https://images.unsplash.com/photo-1677442136019-21780ecad995?w=400&h=500&fit=crop"
              }
              alt={currentUser?.assistantName || "Assistant"}
              className="w-full h-full object-cover"
            />

            {/* Overlay gradient */}
            <div className="absolute inset-0 bg-linear-gradient-to-t from-slate-900/80 via-transparent to-transparent pointer-events-none"></div>
          </div>
        </div>

        {/* Assistant name */}
        <h1 className="text-white text-2xl sm:text-3xl font-light tracking-wide">
          I'm {currentUser?.assistantName || "Assistant"}
        </h1>
      </div>

      {/* Decorative elements */}
      <div className="absolute top-1/4 left-1/4 w-48 sm:w-64 h-48 sm:h-64 bg-blue-500/5 rounded-full blur-3xl pointer-events-none"></div>
      <div className="absolute bottom-1/4 right-1/4 w-72 sm:w-96 h-72 sm:h-96 bg-cyan-500/5 rounded-full blur-3xl pointer-events-none"></div>
    </div>
  );
};

export default Home;