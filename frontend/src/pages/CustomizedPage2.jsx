import React, { useState, useContext } from 'react';
import { userDataContext } from '../context/UserContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

export default function CustomizedPage2() {
  const { currentUser, setAssistantName, setCurrentUser, serverUrl } =
    useContext(userDataContext);

  const [isCreating, setIsCreating] = useState(false);
  const [isCreated, setIsCreated] = useState(false);

  // Pre-fill from DB if already set
  const [assistantName, setName] = useState(currentUser?.assistantName || '');

  const Navigate = useNavigate();

  const handleCreate = async () => {
    if (!assistantName.trim()) return;

    setIsCreating(true);

    try {
      // ⭐ SEND NEW NAME TO BACKEND (IMPORTANT FIX)
      const response = await axios.post(
        `${serverUrl}/api/user/update`,
        { assistantName },
        { withCredentials: true }
      );

      // ⭐ UPDATE CONTEXT WITH NEW NAME
      if (response?.data?.user) {
        setAssistantName(response.data.user.assistantName);
        setCurrentUser(response.data.user); // <-- ensures home page loads correctly
      }

      // Show animation
      setIsCreating(false);
      setIsCreated(true);

      setTimeout(() => {
        setIsCreated(false);
        Navigate('/'); // return home
      }, 1500);
    } catch (err) {
      console.log(err);
      setIsCreating(false);
      alert('Failed to save name.');
    }
  };

  const handleKeyPress = (e) => {
    if (e.key === 'Enter') handleCreate();
  };

  return (
    <div
      className="min-h-screen flex items-center justify-center relative overflow-hidden"
      style={{
        background: 'linear-gradient(to bottom, #000428 0%, #004e92 100%)',
      }}
    >
      <div className="relative z-10 w-full max-w-md px-6">
        <div className="text-center mb-12">
          <h1 className="text-3xl font-normal text-white mb-2 tracking-wide">
            Enter Your Assistant Name
          </h1>
        </div>

        <div className="space-y-6">
          <div className="relative">
            <input
              type="text"
              placeholder="e.g. Shifra"
              value={assistantName}
              onChange={(e) => setName(e.target.value)}
              onKeyPress={handleKeyPress}
              className="w-full px-6 py-4 bg-transparent border-2 border-white rounded-full text-white placeholder-gray-400 focus:outline-none focus:border-white transition-all duration-300 text-left"
              style={{ fontSize: '16px' }}
            />
          </div>

          <div className="flex justify-center">
            <button
              onClick={handleCreate}
              disabled={!assistantName.trim() || isCreating}
              className={`px-12 py-3 rounded-full font-normal transition-all duration-300 ${
                assistantName.trim() && !isCreating
                  ? 'bg-white text-black hover:bg-gray-100 cursor-pointer'
                  : 'bg-white/50 text-black/50 cursor-not-allowed'
              }`}
              style={{ fontSize: '15px' }}
            >
              {isCreating ? (
                <span className="flex items-center justify-center">
                  <svg className="animate-spin h-5 w-5 mr-3" viewBox="0 0 24 24">
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="none"
                    ></circle>
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    ></path>
                  </svg>
                  Creating...
                </span>
              ) : isCreated ? (
                <span className="flex items-center justify-center">
                  <svg
                    className="w-5 h-5 mr-2"
                    fill="currentColor"
                    viewBox="0 0 20 20"
                  >
                    <path
                      fillRule="evenodd"
                      d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                      clipRule="evenodd"
                    ></path>
                  </svg>
                  Created!
                </span>
              ) : (
                'Finally Create Your Assistant'
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
