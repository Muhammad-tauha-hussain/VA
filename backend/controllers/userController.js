import { uploadOnCloudinary } from "../config/cloudinary.js";
import User from "../models/userModel.js";
const getCurrentUser = async (req, res) => {
  try {
    const userId = req.userId;
    const user = await User.findById(userId).select("-password");
    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }
    res.status(200).json(user);
  } catch (error) {
    res.status(500).json({ message: `getCurrentUser Error ${error.message}` });
  }
};

export const updateAssistant = async (req, res) => {
  try {
    const { assistantName, imageUrl } = req.body;

    let assistantImage = null;

    // ---- CASE 1: User selected a preset URL ----
    if (imageUrl && !req.file) {
      assistantImage = imageUrl;
    }

    // ---- CASE 2: User uploaded file ----
    if (req.file) {
      const upload = await uploadOnCloudinary(req.file.path);
      assistantImage = upload.secure_url;
    }

    // ⭐ FIX: Allow updating only name (NO IMAGE)
    let existingUser = await User.findById(req.userId).select("-password");
    if (!existingUser) {
      return res.status(404).json({ message: "User not found" });
    }

    if (!assistantImage) {
      // If no image sent → keep existing image
      assistantImage = existingUser.assistantImage;
    }

    // ⭐ Now update both name & image safely
    const updatedUser = await User.findByIdAndUpdate(
      req.userId,
      {
        assistantName: assistantName || existingUser.assistantName,
        assistantImage: assistantImage,
      },
      { new: true }
    ).select("-password");

    return res.json({
      message: "Assistant updated successfully",
      user: updatedUser,
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ message: "Update Assistant Error" });
  }
};


export default getCurrentUser;
