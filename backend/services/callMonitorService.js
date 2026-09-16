const { Call, Subscription } = require("../models");
const tokenService = require("./tokenService");
const livekitService = require("./livekitService");
const socketService = require("../sockets/index");

const CALLER_RATE = parseInt(process.env.CALLER_TOKENS_PER_MINUTE) || 10;
const RECEIVER_RATE = parseInt(process.env.RECEIVER_TOKENS_PER_MINUTE) || 5;
const LOW_TOKEN_THRESHOLD = parseInt(process.env.LOW_TOKEN_THRESHOLD) || 20;

// To avoid duplicate notifications, we track who has been warned for which call
const warnedUsers = new Set();

const startMonitoring = () => {
  console.log("Started Call Monitor Service...");

  setInterval(async () => {
    try {
      const activeCalls = await Call.findAll({
        where: { status: "ACTIVE" },
      });

      for (const call of activeCalls) {
        if (!call.startedAt) continue;

        const durationMinutes = (new Date() - new Date(call.startedAt)) / 60000;
        
        // Check Caller
        const callerSub = await Subscription.findOne({ where: { userId: call.callerId, status: "ACTIVE" }});
        // Check Receiver
        const receiverSub = await Subscription.findOne({ where: { userId: call.receiverId, status: "ACTIVE" }});

        const callerTokensNeeded = Math.ceil(durationMinutes * CALLER_RATE);
        const receiverTokensNeeded = Math.ceil(durationMinutes * RECEIVER_RATE);

        let terminateCall = false;

        // Caller Check
        if (callerSub) {
          const callerRemaining = callerSub.remainingTokens - callerTokensNeeded;
          
          if (callerRemaining <= 0) {
            terminateCall = true;
          } else if (callerRemaining <= LOW_TOKEN_THRESHOLD && !warnedUsers.has(`${call.id}_caller`)) {
            socketService.sendToUser(call.callerId, "LOW_TOKEN", { remaining: callerRemaining });
            await tokenService.notifyLowToken(call.callerId, callerRemaining);
            warnedUsers.add(`${call.id}_caller`);
          }
        } else {
          terminateCall = true; // No active sub
        }

        // Receiver Check
        if (receiverSub) {
          const receiverRemaining = receiverSub.remainingTokens - receiverTokensNeeded;

          if (receiverRemaining <= 0) {
            terminateCall = true;
          } else if (receiverRemaining <= LOW_TOKEN_THRESHOLD && !warnedUsers.has(`${call.id}_receiver`)) {
            socketService.sendToUser(call.receiverId, "LOW_TOKEN", { remaining: receiverRemaining });
            await tokenService.notifyLowToken(call.receiverId, receiverRemaining);
            warnedUsers.add(`${call.id}_receiver`);
          }
        } else {
          terminateCall = true;
        }

        if (terminateCall) {
          console.log(`Terminating call ${call.id} due to token exhaustion or missing subscription.`);
          
          socketService.sendToUser(call.callerId, "CALL_TERMINATED", { reason: "TOKEN_EXHAUSTED" });
          socketService.sendToUser(call.receiverId, "CALL_TERMINATED", { reason: "TOKEN_EXHAUSTED" });

          try {
            await livekitService.endRoom(call.roomName);
          } catch (err) {
            console.error("Error ending LiveKit room:", err.message);
          }

          call.status = "COMPLETED";
          call.endedAt = new Date();
          call.durationSeconds = Math.floor((call.endedAt - new Date(call.startedAt)) / 1000);
          call.callerTokensUsed = callerTokensNeeded;
          call.receiverTokensUsed = receiverTokensNeeded;
          await call.save();

          // Deduct final tokens
          if (callerSub) await tokenService.deductTokens(call.callerId, callerTokensNeeded, "CALL", call.id, "Call charges");
          if (receiverSub) await tokenService.deductTokens(call.receiverId, receiverTokensNeeded, "CALL", call.id, "Call charges");
        }
      }
    } catch (error) {
      console.error("Error in Call Monitor interval:", error);
    }
  }, 10000); // Check every 10 seconds
};

module.exports = {
  startMonitoring,
};
