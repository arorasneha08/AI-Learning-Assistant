// import multer from 'multer';
// import path, { parse } from 'path';
// import { fileURLToPath } from 'url';
// import fs from 'fs/promises';

// const __filename = fileURLToPath(import.meta.url);
// const __dirname = path.dirname(__filename);

// const uploadDir = path.join(__dirname, "../uploads/documents");
// await fs.mkdir(uploadDir, { recursive: true });

// const storage = multer.diskStorage({
//     destination: function (req, file, cb) {
//         cb(null, uploadDir);
//     },
//     filename: function (req, file, cb) {
//         const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
//         cb(null, `${uniqueSuffix}-${file.originalname}`);
//     }
// });

// const fileFilter = (req, file, cb) => {
//     if(file.mimetype === 'application/pdf') {
//         cb(null, true);
//     }   
//     else {
//         cb(new Error('Only PDF files are allowed'), false);
//     }   
// };

// const upload = multer({
//     storage: storage,
//     fileFilter: fileFilter,
//     limits: {
//         fileSize: parseInt(process.env.MAX_FILE_SIZE) || 10 * 1024 * 1024
//     }
// });

// export default upload;

import multer from "multer";
import { CloudinaryStorage } from "multer-storage-cloudinary";
import cloudinary from "./cloudinary.js";

const storage = new CloudinaryStorage({
  cloudinary,
  params: {
    folder: "documents", // folder in cloudinary
    resource_type: "raw", // IMPORTANT for PDFs
    allowed_formats: ["pdf"],
    public_id: (req, file) => {
      return `${Date.now()}-${file.originalname}`;
    }
  }
});

const fileFilter = (req, file, cb) => {
  if (file.mimetype === "application/pdf") {
    cb(null, true);
  } else {
    cb(new Error("Only PDF files are allowed"), false);
  }
};

const upload = multer({
  storage,
  fileFilter,
  limits: {
    fileSize: parseInt(process.env.MAX_FILE_SIZE) || 5 * 1024 * 1024
  }
});

export default upload;