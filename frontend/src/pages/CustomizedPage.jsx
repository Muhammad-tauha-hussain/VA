import React, { useContext, useState } from 'react';
import { Upload } from 'lucide-react';
import {  useNavigate } from 'react-router-dom';
import { userDataContext } from '../context/UserContext';
// Assistant image URLs (with proper query params)
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
  const Navigate = useNavigate()
  const {setAssistantImage} = useContext(userDataContext)

  const handleImageSelect = (id) => {
    setSelectedImage(id);
    setCustomImage(null);
  };

  const handleCustomUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setCustomImage(event.target.result);
        setSelectedImage('custom');
      };
      reader.readAsDataURL(file);
    }
  };

  const handleNext = () => {
    const selected =
      selectedImage === 'custom'
        ? customImage
        : ASSISTANT_IMAGES.find((img) => img.id === selectedImage)?.url;

    if (selected) {
      setAssistantImage(selected)
      Navigate("/customized2")
    } else {
      alert('Please select an image first.');
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
              className={`relative cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 ${
                selectedImage === img.id
                  ? 'ring-4 ring-cyan-400 shadow-lg shadow-cyan-400/50'
                  : 'ring-2 ring-transparent hover:ring-cyan-400/50'
              }`}
            >
              <img
                src={img.url}
                alt={`Assistant ${img.id}`}
                className="w-full h-64 object-cover"
              />
              {selectedImage === img.id && (
                <div className="absolute inset-0 bg-cyan-400/20 flex items-center justify-center">
                  <div className="w-8 h-8 bg-cyan-400 rounded-full flex items-center justify-center">
                    <svg
                      className="w-5 h-5 text-white"
                      fill="none"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path d="M5 13l4 4L19 7"></path>
                    </svg>
                  </div>
                </div>
              )}
            </div>
          ))}

          {/* Custom Upload Box */}
          <label
            htmlFor="customUpload"
            className={`relative cursor-pointer rounded-2xl overflow-hidden transition-all duration-300 hover:scale-105 bg-blue-900/30 border-2 border-dashed flex flex-col items-center justify-center h-64 ${
              selectedImage === 'custom'
                ? 'border-cyan-400 ring-4 ring-cyan-400 shadow-lg shadow-cyan-400/50'
                : 'border-blue-700 hover:border-cyan-400/50'
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
                <img
                  src={customImage}
                  alt="Custom upload"
                  className="w-full h-full object-cover absolute inset-0"
                />
                {selectedImage === 'custom' && (
                  <div className="absolute inset-0 bg-cyan-400/20 flex items-center justify-center z-10">
                    <div className="w-8 h-8 bg-cyan-400 rounded-full flex items-center justify-center">
                      <svg
                        className="w-5 h-5 text-white"
                        fill="none"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path d="M5 13l4 4L19 7"></path>
                      </svg>
                    </div>
                  </div>
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

        {/* Next Button */}
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





