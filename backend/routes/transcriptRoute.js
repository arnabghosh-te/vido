const express = require("express");
const { authenticate } = require("../middleware/auth");
const { getTranscripts, getTranscriptById, deleteTranscript, generateSummary, chatTranscript } = require("../controllers/transcriptController");

const router = express.Router();

router.use(authenticate);

router.get("/", getTranscripts);
router.get("/:id", getTranscriptById);
router.delete("/:id", deleteTranscript);
router.post("/:id/summary", generateSummary);
router.post("/:id/chat", chatTranscript);

module.exports = router;
