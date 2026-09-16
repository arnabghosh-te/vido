const socketIo = require("socket.io");
const jwt = require("jsonwebtoken");

let io;
const activeSockets = new Map(); // Map<userId, socketId>

const initSockets = (server) => {
  io = socketIo(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.use((socket, next) => {
    const token = socket.handshake.auth.token;
    if (!token) {
      return next(new Error("Authentication error: No token provided"));
    }

    try {
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      socket.userId = decoded.userId;
      next();
    } catch (err) {
      next(new Error("Authentication error: Invalid token"));
    }
  });

  io.on("connection", (socket) => {
    console.log(`User connected to socket: ${socket.userId}`);
    activeSockets.set(socket.userId, socket.id);

    socket.on("disconnect", () => {
      console.log(`User disconnected from socket: ${socket.userId}`);
      activeSockets.delete(socket.userId);
    });
  });

  return io;
};

const sendToUser = (userId, event, data) => {
  const socketId = activeSockets.get(Number(userId));
  if (socketId && io) {
    io.to(socketId).emit(event, data);
  }
};

module.exports = {
  initSockets,
  sendToUser,
};
