import React, { createContext, useState, useEffect } from 'react';
import axios from 'axios';

export const userDataContext = createContext();

const UserContext = ({ children }) => {
  const serverUrl = "http://localhost:3333";
  const [currentUser, setCurrentUser] = useState(null);
  const [assistantName, setAssistantName] = useState('');
  const [assistantImage, setAssistantImage] = useState(null);
  const handleCurrentUser = async () => {
    try {
      const result = await axios.get(`${serverUrl}/api/user/current`, { withCredentials: true });
      setCurrentUser(result.data);
      
      if (result.data.user) {
        if (result.data.user.assistantImage) {
          setAssistantImage(result.data.user.assistantImage);
        }
        if (result.data.user.assistantName) {
          setAssistantName(result.data.user.assistantName);
        }
        console.log(result.data);
      }
    } catch (error) {
      console.log("Error fetching current user:", error);
    }
  };

  useEffect(() => {
    handleCurrentUser();
  }, []);

  const value = {
    serverUrl,
    currentUser,
    setCurrentUser,
    assistantName, setAssistantName,
    assistantImage, setAssistantImage
  };

  return (
    <userDataContext.Provider value={value}>
      {children}
    </userDataContext.Provider>
  );
};

export default UserContext;
