const { Document } = require("../models");
const fs = require("fs");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");

// Initialize Gemini Client
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });

// Upload Document Endpoint
exports.uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({ success: false, message: "No file uploaded" });
    }

    const userId = req.user.id; // Assuming auth middleware sets req.user

    const newDocument = await Document.create({
      userId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      mimeType: req.file.mimetype,
    });

    res.status(201).json({
      success: true,
      message: "Document uploaded successfully",
      data: newDocument,
    });
  } catch (error) {
    next(error);
  }
};

// Query Document Endpoint
exports.queryDocument = async (req, res, next) => {
  try {
    const { documentId, question } = req.body;
    const userId = req.user.id;

    if (!documentId || !question) {
      return res.status(400).json({ success: false, message: "documentId and question are required" });
    }

    const document = await Document.findOne({ where: { id: documentId, userId } });
    if (!document) {
      return res.status(404).json({ success: false, message: "Document not found" });
    }

    let geminiFileName = document.geminiFileName;

    // If document is not uploaded to Gemini File API yet, upload it
    if (!geminiFileName) {
      const fullPath = path.resolve(document.filePath);
      
      const uploadResult = await ai.files.upload({
          file: fullPath,
          mimeType: document.mimeType,
      });
      
      geminiFileName = uploadResult.name;

      // Save URI to DB
      await document.update({
        geminiFileUri: uploadResult.uri,
        geminiFileName: uploadResult.name,
      });
    }

    // Query Gemini
    const response = await ai.models.generateContent({
        model: 'gemini-1.5-flash',
        contents: [
            {
                role: 'user',
                parts: [
                    {
                        fileData: {
                            fileUri: document.geminiFileUri,
                            mimeType: document.mimeType
                        }
                    },
                    { text: question }
                ]
            }
        ]
    });

    res.status(200).json({
      success: true,
      data: response.text.replace(/\*/g, ''),
    });

  } catch (error) {
    next(error);
  }
};

// Get User Documents
exports.getUserDocuments = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const documents = await Document.findAll({
      where: { userId },
      order: [["createdAt", "DESC"]],
    });

    res.status(200).json({
      success: true,
      data: documents,
    });
  } catch (error) {
    next(error);
  }
};
