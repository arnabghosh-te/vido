const { Transcript, TranscriptSegment, Call } = require("../models");
const { Op } = require("sequelize");

const getTranscripts = async (req, res, next) => {
  try {
    const transcripts = await Transcript.findAll({
      include: [
        {
          model: Call,
          as: "call",
          where: {
            [Op.or]: [
              { callerId: req.user.id },
              { receiverId: req.user.id },
            ],
          },
        },
      ],
      order: [["createdAt", "DESC"]],
    });

    return res.status(200).json({
      success: true,
      message: "Transcripts fetched successfully",
      data: transcripts,
    });
  } catch (error) {
    next(error);
  }
};

const getTranscriptById = async (req, res, next) => {
  try {
    const { id } = req.params;

    const transcript = await Transcript.findOne({
      where: { id },
      include: [
        {
          model: TranscriptSegment,
          as: "segments",
        },
        {
          model: Call,
          as: "call",
        },
      ],
      order: [
        [{ model: TranscriptSegment, as: "segments" }, "startTime", "ASC"],
      ],
    });

    if (!transcript) {
      return res.status(404).json({ success: false, message: "Transcript not found" });
    }

    if (transcript.call.callerId !== req.user.id && transcript.call.receiverId !== req.user.id) {
      return res.status(403).json({ success: false, message: "Not authorized to view this transcript" });
    }

    return res.status(200).json({
      success: true,
      message: "Transcript fetched successfully",
      data: transcript,
    });
  } catch (error) {
    next(error);
  }
};

const deleteTranscript = async (req, res, next) => {
  try {
    const { id } = req.params;

    const transcript = await Transcript.findOne({
      where: { id },
      include: [{ model: Call, as: "call" }],
    });

    if (!transcript) {
      return res.status(404).json({ success: false, message: "Transcript not found" });
    }

    if (!transcript.call) {
      console.error(`Transcript ${id} has no associated call`);
      return res.status(404).json({ success: false, message: "Associated call not found" });
    }

    const userId = Number(req.user.id);
    if (transcript.call.callerId !== userId && transcript.call.receiverId !== userId) {
      console.error(`User ${userId} unauthorized to delete transcript ${id}. Caller: ${transcript.call.callerId}, Receiver: ${transcript.call.receiverId}`);
      return res.status(403).json({ success: false, message: "Not authorized to delete this transcript" });
    }

    await transcript.destroy();

    return res.status(200).json({
      success: true,
      message: "Transcript deleted successfully",
    });
  } catch (error) {
    console.error("Delete transcript error:", error);
    next(error);
  }
};

const generateSummary = async (req, res, next) => {
  try {
    const { id } = req.params;

    const transcript = await Transcript.findOne({
      where: { id },
      include: [{ model: Call, as: "call" }],
    });

    if (!transcript) {
      return res.status(404).json({ success: false, message: "Transcript not found" });
    }

    const userId = Number(req.user.id);
    if (transcript.call.callerId !== userId && transcript.call.receiverId !== userId) {
      return res.status(403).json({ success: false, message: "Not authorized to access this transcript" });
    }

    if (transcript.summary) {
      return res.status(200).json({
        success: true,
        message: "Summary already exists",
        data: transcript.summary,
      });
    }

    const { generateTranscriptSummary } = require("../services/geminiService");
    const summary = await generateTranscriptSummary(transcript.fullText);

    transcript.summary = summary;
    await transcript.save();

    return res.status(200).json({
      success: true,
      message: "Summary generated successfully",
      data: summary,
    });
  } catch (error) {
    console.error("Generate summary error:", error);
    next(error);
  }
};

const chatTranscript = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { question } = req.body;

    if (!question) {
      return res.status(400).json({ success: false, message: "Question is required" });
    }

    const transcript = await Transcript.findOne({
      where: { id },
      include: [{ model: Call, as: "call" }],
    });

    if (!transcript) {
      return res.status(404).json({ success: false, message: "Transcript not found" });
    }

    const userId = Number(req.user.id);
    if (transcript.call.callerId !== userId && transcript.call.receiverId !== userId) {
      return res.status(403).json({ success: false, message: "Not authorized to access this transcript" });
    }

    const { chatWithTranscript } = require("../services/geminiService");
    const answer = await chatWithTranscript(transcript.fullText, question);

    return res.status(200).json({
      success: true,
      message: "Answer generated successfully",
      data: answer,
    });
  } catch (error) {
    console.error("Chat transcript error:", error);
    next(error);
  }
};

module.exports = {
  getTranscripts,
  getTranscriptById,
  deleteTranscript,
  generateSummary,
  chatTranscript,
};
