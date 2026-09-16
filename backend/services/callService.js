const { Call, User, } = require("../models");
const { Op } = require("sequelize");

const createCall = async ({ callerId, receiverId }) => {
  receiverId = Number(receiverId);

  if (callerId === receiverId) {
    throw new Error("You cannot call yourself");
  }

  const receiver = await User.findByPk(receiverId);

  if (!receiver) {
    throw new Error("Receiver not found");
  }

  if (!receiver.isActive) {
    throw new Error("Receiver account is inactive");
  }

  const activeCall = await Call.findOne({
    where: {
      [Op.or]: [
        {
          callerId,
          status: {
            [Op.in]: ["RINGING", "ACTIVE"],
          },
        },
        {
          receiverId: callerId,
          status: {
            [Op.in]: ["RINGING", "ACTIVE"],
          },
        },
      ],
    },
  });

  if (activeCall) {
    throw new Error("You already have an active call");
  }

  const roomName = `call_${callerId}_${receiverId}_${Date.now()}`;

  const call = await Call.create({
    callerId,
    receiverId,
    roomName,
    status: "RINGING",
  });

  return call;
};

const getCallById = async ({ callId, userId }) => {
  const call = await Call.findByPk(callId, {
    include: [
      {
        model: User,
        as: "caller",
        attributes: ["id", "name", "email", "profilePicture"],
      },
      {
        model: User,
        as: "receiver",
        attributes: ["id", "name", "email", "profilePicture"],
      },
    ],
  });

  if (!call) {
    throw new Error("Call not found");
  }

  if (
    Number(call.callerId) !== Number(userId) &&
    Number(call.receiverId) !== Number(userId)
  ) {
    throw new Error("Access denied");
  }

  return call;
};

const getCallHistory = async ({ userId }) => {
  return await Call.findAll({
    where: {
      [Op.or]: [
        { callerId: userId },
        { receiverId: userId },
      ],
    },
    include: [
      {
        model: User,
        as: "caller",
        attributes: ["id", "name", "email", "profilePicture"],
      },
      {
        model: User,
        as: "receiver",
        attributes: ["id", "name", "email", "profilePicture"],
      },
    ],
    order: [["createdAt", "DESC"]],
  });
};

const acceptCall = async ({ callId, userId }) => {
  const call = await Call.findByPk(callId);

  console.log(call)

  if (!call) {
    throw new Error("Call not found");
  }

  if (Number(call.receiverId) !== Number(userId)) {
    throw new Error("Only the receiver can accept the call");
  }

  if (call.status !== "RINGING") {
    throw new Error("Call cannot be accepted");
  }

  call.status = "ACTIVE";
  call.startedAt = new Date();

  await call.save();

  return call;
};

const rejectCall = async ({ callId, userId }) => {
  const call = await Call.findByPk(callId);

  if (!call) {
    throw new Error("Call not found");
  }

  if (Number(call.receiverId) !== Number(userId)) {
    throw new Error("Only the receiver can reject the call");
  }

  if (call.status !== "RINGING") {
    throw new Error("Call cannot be rejected");
  }

  call.status = "CANCELLED";
  call.endedAt = new Date();

  await call.save();

  return call;
};

const endCall = async ({ callId, userId }) => {
  const call = await Call.findByPk(callId);

  if (!call) {
    throw new Error("Call not found");
  }

  if (
    Number(call.callerId) !== Number(userId) &&
    Number(call.receiverId) !== Number(userId)
  ) {
    throw new Error("Access denied");
  }

  if (["COMPLETED", "CANCELLED", "FAILED"].includes(call.status)) {
    throw new Error("Call is already finished");
  }

  const endedAt = new Date();

  call.status = "COMPLETED";
  call.endedAt = endedAt;

  if (call.startedAt) {
    call.durationSeconds = Math.floor(
      (endedAt - new Date(call.startedAt)) / 1000
    );

    const CALLER_RATE = parseInt(process.env.CALLER_TOKENS_PER_MINUTE) || 10;
    const RECEIVER_RATE = parseInt(process.env.RECEIVER_TOKENS_PER_MINUTE) || 5;

    const durationMinutes = call.durationSeconds / 60;
    const callerTokensNeeded = Math.ceil(durationMinutes * CALLER_RATE);
    const receiverTokensNeeded = Math.ceil(durationMinutes * RECEIVER_RATE);

    call.callerTokensUsed = callerTokensNeeded;
    call.receiverTokensUsed = receiverTokensNeeded;

    const tokenService = require("./tokenService");
    try {
      await tokenService.deductTokens(call.callerId, callerTokensNeeded, "CALL", call.id, "Call charges");
    } catch (err) {
      console.error("Failed to deduct caller tokens:", err.message);
    }
    
    try {
      await tokenService.deductTokens(call.receiverId, receiverTokensNeeded, "CALL", call.id, "Call charges");
    } catch (err) {
      console.error("Failed to deduct receiver tokens:", err.message);
    }
  }

  await call.save();

  return call;
};

module.exports = {
  createCall,
  getCallById,
  getCallHistory,
  acceptCall,
  rejectCall,
  endCall,
};