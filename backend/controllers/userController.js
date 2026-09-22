const callService = require("../services/callService");
const livekitService = require("../services/livekitService");
const transcriptionService = require("../services/transcriptionService");


const createCall = async (req, res, next) => {
  try {
    const { receiverId } = req.body;

    if (!receiverId) {
      return res.status(422).json({
        success: false,
        message: "receiverId is required",
      });
    }

    const call = await callService.createCall({
      callerId: req.user.id,
      receiverId,
    });

    const token = await livekitService.generateToken(
      call.roomName,
      req.user.name,
      req.user.id.toString()
    );

    const socketService = require("../sockets/index");
    
    // Create notification in DB
    const { Notification } = require("../models");
    const notification = await Notification.create({
      userId: receiverId,
      title: 'Incoming Call',
      message: `${req.user.name} is calling you.`,
      type: 'call',
      isRead: false
    });

    socketService.sendToUser(receiverId, "INCOMING_CALL", { call, caller: req.user });
    socketService.sendToUser(receiverId, "new_notification", notification);

    return res.status(201).json({
      success: true,
      message: "Call created successfully",
      data: {
        call,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

const getCall = async (req, res, next) => {
  try {
    const call = await callService.getCallById({
      callId: req.params.callId,
      userId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      message: "Call fetched successfully",
      data: call,
    });
  } catch (error) {
    next(error);
  }
};

const getCallHistory = async (req, res, next) => {
  try {
    const calls = await callService.getCallHistory({
      userId: req.user.id,
    });

    return res.status(200).json({
      success: true,
      message: "Call history fetched successfully",
      data: calls,
    });
  } catch (error) {
    next(error);
  }
};

const acceptCall = async (req, res, next) => {
  try {
    const call = await callService.acceptCall({
      callId: req.params.callId,
      userId: req.user.id,
    });

    const token = await livekitService.generateToken(
      call.roomName,
      req.user.name,
      req.user.id.toString()
    );

    return res.status(200).json({
      success: true,
      message: "Call accepted successfully",
      data: {
        call,
        token,
      },
    });
  } catch (error) {
    next(error);
  }
};

const rejectCall = async (req, res, next) => {
  try {
    const call = await callService.rejectCall({
      callId: req.params.callId,
      userId: req.user.id,
    });

    const socketService = require("../sockets/index");
    socketService.sendToUser(call.callerId, "CALL_TERMINATED", { reason: "Receiver rejected the call" });

    return res.status(200).json({
      success: true,
      message: "Call rejected successfully",
      data: call,
    });
  } catch (error) {
    next(error);
  }
};

const endCall = async (req, res, next) => {
  try {
    const call = await callService.endCall({
      callId: req.params.callId,
      userId: req.user.id,
    });

    const socketService = require("../sockets/index");
    const otherUserId = call.callerId === req.user.id ? call.receiverId : call.callerId;
    socketService.sendToUser(otherUserId, "CALL_TERMINATED", { reason: "The other user ended the call" });

    return res.status(200).json({
      success: true,
      message: "Call ended successfully",
      data: call,
    });
  } catch (error) {
    next(error);
  }
};

const addTranscriptSegment = async (req, res, next) => {
  try {
    const { callId } = req.params;
    const { text, language } = req.body;

    if (!text) {
      return res.status(400).json({ success: false, message: "Text is required" });
    }

    const transcript = await transcriptionService.appendTranscript(
      callId,
      req.user.id,
      text,
      language
    );

    const call = await callService.getCallById({ callId, userId: req.user.id });
    if (call) {
      const otherUserId = call.callerId === req.user.id ? call.receiverId : call.callerId;
      const socketService = require("../sockets/index");
      socketService.sendToUser(otherUserId, "NEW_TRANSCRIPT", { text, speakerId: req.user.id, speakerName: req.user.name, language });
    }

    return res.status(200).json({
      success: true,
      message: "Transcript saved successfully",
      data: transcript,
    });
  } catch (error) {
    next(error);
  }
};

module.exports = {
  createCall,
  getCall,
  getCallHistory,
  acceptCall,
  rejectCall,
  endCall,
  addTranscriptSegment,
};