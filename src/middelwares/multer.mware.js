import multer from "multer";
import path from "path";
import fs from "fs";

const uploadDir = "./public/temp";
if (!fs.existsSync(uploadDir)) {
  fs.mkdirSync(uploadDir, { recursive: true });
}

const diskStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + "-" + Math.round(Math.random() * 1e9);
    cb(null, uniqueSuffix + path.extname(file.originalname));
  },
});

const memoryStorage = multer.memoryStorage();

export const upload = multer({
  storage: diskStorage,
  limits: { fileSize: 10 * 1024 * 1024 },
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|gif|pdf|doc|docx|xls|xlsx|txt|zip/;
    const extname = allowedTypes.test(
      path.extname(file.originalname).toLowerCase()
    );
    const mimetype = allowedTypes.test(file.mimetype);

    if (extname || mimetype) {
      return cb(null, true);
    }
    cb(new Error("Only images and documents are allowed!"));
  },
});

export const uploadMulter = multer({
  storage: memoryStorage,
  limits: { fileSize: 5 * 1024 * 1024 },
});
