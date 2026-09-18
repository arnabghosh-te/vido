const express = require("express");
const multer = require("multer");
const path = require("path");
const fs = require("fs");
const { uploadDocument, queryDocument, getUserDocuments } = require("../controllers/geminiDocumentController");
const { authenticate } = require("../middleware/auth");

const router = express.Router();

// Multer config
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    const uploadPath = path.join(__dirname, "../uploads/documents");
    if (!fs.existsSync(uploadPath)) {
      fs.mkdirSync(uploadPath, { recursive: true });
    }
    cb(null, uploadPath);
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + "-" + file.originalname.replace(/\s+/g, "_"));
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 50 * 1024 * 1024 }, // 50MB limit
  fileFilter: (req, file, cb) => {
    if (file.mimetype === "application/pdf" || file.mimetype === "text/plain") {
      cb(null, true);
    } else {
      cb(new Error("Only PDF and TXT files are allowed"));
    }
  },
});

router.post("/upload", authenticate, upload.single("document"), uploadDocument);
router.post("/query", authenticate, queryDocument);
router.get("/", authenticate, getUserDocuments);

module.exports = router;
