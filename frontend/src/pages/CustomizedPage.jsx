import React, { useContext, useState } from 'react';
import { Upload } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { userDataContext } from '../context/UserContext';
import axios from 'axios';

// Assistant image URLs
const ASSISTANT_IMAGES = [
  { id: 1, url: 'https://images.pexels.com/photos/2085831/pexels-photo-2085831.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 2, url: 'https://images.pexels.com/photos/2085832/pexels-photo-2085832.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 3, url: 'https://images.pexels.com/photos/8294792/pexels-photo-8294792.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 4, url: 'https://images.pexels.com/photos/4310574/pexels-photo-4310574.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 5, url: 'https://images.pexels.com/photos/8294625/pexels-photo-8294625.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 6, url: 'https://images.pexels.com/photos/9026734/pexels-photo-9026734.jpeg?auto=compress&cs=tinysrgb&w=600' },
  { id: 7, url: 'https://images.pexels.com/photos/13696018/pexels-photo-13696018.jpeg?auto=compress&cs=tinysrgb&w=600' },
];

export default function CustomizedPage() {

  const [selectedImage, setSelectedImage] = useState(null);
  const [customImage, setCustomImage] = useState(null);

  const navigate = useNavigate();

  // ⬇️ Extracting context values from provider
  const { 
    setAssistantImage, 
    setAssistantName, 
    setCurrentUser,     // ← FIX happens using this!
    serverUrl 
  } = useContext(userDataContext);


  // Select one of the built images
  const handleImageSelect = (id) => {
    setSelectedImage(id);
    setCustomImage(null);
  };

  // Upload custom image and preview it
  const handleCustomUpload = (e) => {
    const file = e.target.files[0];
    console.log(file);
    

    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomImage(event.target.result);
        setSelectedImage("custom");
      };
      reader.readAsDataURL(file);
    }
  };


  // Save selected image to backend
  const handleNext = async () => {
    try {
      let response;

      // ✅ Case 1 — User uploaded custom image
      if (selectedImage === "custom") {

        const fileInput = document.getElementById("customUpload");
        const file = fileInput?.files[0];

        if (!file) {
          alert("Please upload an image.");
          return;
        }

        const formData = new FormData();
        formData.append("assistantName", "My Assistant");
        formData.append("assistantImage", file); // Multer field

        response = await axios.post(
          `${serverUrl}/api/user/update`,
          formData,
          {
            withCredentials: true,
            headers: { "Content-Type": "multipart/form-data" }
          }
        );
      }

      // ✅ Case 2 — User picked predefined image
      else {
        const selectedURL = ASSISTANT_IMAGES.find(
          (img) => img.id === selectedImage
        )?.url;

        if (!selectedURL) {
          alert("Please select an image first.");
          return;
        }

        response = await axios.post(
          `${serverUrl}/api/user/update`,
          {
            assistantName: "My Assistant",
            imageUrl: selectedURL
          },
          { withCredentials: true }
        );
      }


      // ----------- ⭐ FIX BEGINS HERE ⭐ -------------

      // Update assistant image in context
      if (response?.data?.user?.assistantImage) {
        setAssistantImage(response.data.user.assistantImage);
      }

      // Update assistant name in context
      if (response?.data?.user?.assistantName) {
        setAssistantName(response.data.user.assistantName);
      }

      // ⬇️ SUPER IMPORTANT FIX:
      // Update FULL user object so Home.jsx re-renders immediately
      if (response?.data?.user) {
        setCurrentUser(response.data.user);   // ← THIS WAS MISSING BEFORE
      }

      // ----------- ⭐ FIX ENDS HERE ⭐ -------------


      navigate("/customized2");

    } catch (error) {
      console.log(error);
      alert("Error updating assistant.");
    }
  };



  return (
    <div className="min-h-screen bg-linear-to-b from-blue-950 via-blue-900 to-black flex items-center justify-center p-8">
      <div className="max-w-5xl w-full">
        <h1 className="text-4xl font-bold text-white text-center mb-12">
          Select your Assistant Image
        </h1>

        {/* Image Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-6 mb-12">

          {ASSISTANT_IMAGES.map((img) => (
            <div
              key={img.id}
              onClick={() => handleImageSelect(img.id)}
              className={`relative cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 
                ${selectedImage === img.id
                  ? "ring-4 ring-cyan-400 shadow-lg shadow-cyan-400/50"
                  : "ring-2 ring-transparent hover:ring-cyan-400/50"
                }`}
            >
              <img
                src={img.url}
                alt="Assistant option"
                className="w-full h-64 object-cover"
              />
            </div>
          ))}

          {/* Custom Upload */}
          <label
            htmlFor="customUpload"
            className={`relative cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 bg-blue-900/30 border-2 border-dashed flex flex-col items-center justify-center h-64 
              ${selectedImage === "custom"
                ? "border-cyan-400 ring-4 ring-cyan-400 shadow-lg shadow-cyan-400/50"
                : "border-blue-700 hover:border-cyan-400/50"
              }`}
          >
            <input
              id="customUpload"
              type="file"
              accept="image/*"
              onChange={handleCustomUpload}
              className="hidden"
            />

            {customImage ? (
              <>
                <img src={customImage} className="absolute inset-0 w-full h-full object-cover" />

                {selectedImage === "custom" && (
                  <div className="absolute inset-0 bg-cyan-400/20"></div>
                )}
              </>
            ) : (
              <>
                <Upload className="w-10 h-10 text-blue-400 mb-3" />
                <span className="text-blue-300 text-sm text-center px-4">
                  Upload Custom Image
                </span>
              </>
            )}
          </label>
        </div>

        <div className="flex justify-center">
          <button
            onClick={handleNext}
            className="px-16 py-4 bg-white text-blue-950 rounded-full font-semibold text-lg hover:bg-gray-100 transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
          >
            Next
          </button>
        </div>
      </div>
    </div>
  );
}
