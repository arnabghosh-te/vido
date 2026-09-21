const { Document } = require("../models");
const path = require("path");
const { GoogleGenAI } = require("@google/genai");

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});


const formatGeminiResponse = (text) => {
  if (!text) return "";

  return text

    .replace(/^#{1,6}\s*/gm, "")


    .replace(/^\s*[-*+]\s+/gm, "• ")

    .replace(/\*\*/g, "")
    .replace(/\*/g, "")
    .replace(/__/g, "")
    .replace(/_/g, "")

    .replace(/```[a-zA-Z0-9_-]*\n?/g, "")
    .replace(/```/g, "")

  
    .replace(/`/g, "")

 
    .replace(/[ \t]+/g, " ")

  
    .replace(/\n{3,}/g, "\n\n")

    .trim();
};


exports.uploadDocument = async (req, res, next) => {
  try {
    if (!req.file) {
      return res.status(400).json({
        success: false,
        message: "No file uploaded",
        data: null,
      });
    }

    const userId = req.user.id;

    const fullPath = path.resolve(req.file.path);

    // console.log("Uploading document to Gemini...");
    // console.log("File:", fullPath);
    // console.log("MIME type:", req.file.mimetype);

    const uploadResult = await ai.files.upload({
      file: fullPath,
      config: {
        mimeType: req.file.mimetype,
      },
    });

    console.log("Gemini upload result:", uploadResult);

    const document = await Document.create({
      userId,
      filename: req.file.filename,
      originalName: req.file.originalname,
      filePath: req.file.path,
      mimeType: req.file.mimetype,
      geminiFileName: uploadResult.name,
      geminiFileUri: uploadResult.uri,
    });

    return res.status(201).json({
      success: true,
      message: "Document uploaded successfully",
      data: {
        id: document.id,
        userId: document.userId,
        filename: document.filename,
        originalName: document.originalName,
        mimeType: document.mimeType,
        geminiFileName: document.geminiFileName,
        geminiFileUri: document.geminiFileUri,
        createdAt: document.createdAt,
      },
    });

  } catch (error) {
    console.error("Document upload error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to upload document",
      data: null,
    });
  }
};


exports.queryDocument = async (req, res, next) => {
  try {
    const { documentId, question } = req.body;
    const userId = req.user.id;

    if (!documentId || !question || !question.trim()) {
      return res.status(400).json({
        success: false,
        message: "documentId and question are required",
        data: null,
      });
    }

    const document = await Document.findOne({
      where: {
        id: documentId,
        userId,
      },
    });

    if (!document) {
      return res.status(404).json({
        success: false,
        message: "Document not found",
        data: null,
      });
    }

   
    if (!document.geminiFileUri) {
      return res.status(400).json({
        success: false,
        message: "Document is not available in Gemini",
        data: null,
      });
    }

    // console.log("Gemini file name:", document.geminiFileName);
    // console.log("Gemini file URI:", document.geminiFileUri);
    // console.log("User question:", question);


    const interaction = await ai.interactions.create({
      model: "gemini-3.5-flash-lite",

      input: [
        {
          type: "text",
          text: question.trim(),
        },
        {
          type: "document",
          uri: document.geminiFileUri,
          mime_type: document.mimeType,
        },
      ],
    });

    const rawAnswer = interaction.output_text || "";

    const answer = formatGeminiResponse(rawAnswer);


    return res.status(200).json({
      success: true,
      message: "Question answered successfully",
      data: {
        documentId: document.id,
        question: question.trim(),
        answer,
      },
    });

  } catch (error) {
    console.error("Gemini query error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to process document question",
      data: null,
    });
  }
};


/**
 * Get all documents belonging to logged-in user
 */
exports.getUserDocuments = async (req, res, next) => {
  try {
    const userId = req.user.id;

    const documents = await Document.findAll({
      where: {
        userId,
      },
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Documents fetched successfully",
      data: documents,
    });

  } catch (error) {
    console.error("Get documents error:", error);

    return res.status(500).json({
      success: false,
      message: "Failed to fetch documents",
      data: null,
    });
  }
};