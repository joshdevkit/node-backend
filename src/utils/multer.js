import multer from "multer";

// Configure Multer Storage
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/attachments"); // Destination folder
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});

// Filter to Allow Only Images and Videos
const fileFilter = (req, file, cb) => {
  if (file.mimetype.startsWith("image/") || file.mimetype.startsWith("video/")) {
    cb(null, true);
  } else {
    cb(new Error("Only image and video files are allowed!"), false);
  }
};

// Initialize Multer
const upload = multer({
  storage,
  limits: { fileSize: 150 * 1024 * 1024 }, // 50 MB file size limit
  fileFilter,
});

export default upload;
