import multer from "multer";
import path from "path";

// Configure storage (files will be stored temporarily before uploading to Cloudinary)
const storage = multer.diskStorage({
  filename: (req, file, cb) => {
    cb(null, "./public" ); // unique filename
  },
});

// File filter — restricts uploads to images only
const fileFilter = (req, file, cb) => {
  const allowedTypes = /jpeg|jpg|png|webp/;
  const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
  const mimetype = allowedTypes.test(file.mimetype);

  if (extname && mimetype) {
    cb(null, true);
  } else {
    cb(new Error("Only image files are allowed (jpeg, jpg, png, webp)"));
  }
};

// Initialize multer
const upload = multer({
  storage,
  fileFilter,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB max
});

export default upload;
