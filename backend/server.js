require("dotenv").config();
const http = require("http");
const app = require("./app");
const sequelize = require("./config/database");
const { initSockets } = require("./sockets/index");
const callMonitorService = require("./services/callMonitorService");

const PORT = process.env.PORT || 5000;

const server = http.createServer(app);

const startServer = async () => {
  try {
    await sequelize.authenticate();

    console.log("PostgreSQL connected successfully");

    initSockets(server);
    callMonitorService.startMonitoring();

    server.listen(PORT, () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  } catch (error) {
    console.error("Database connection failed:", error.message);
    process.exit(1);
  }
};

startServer();