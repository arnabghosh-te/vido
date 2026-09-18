require("dotenv").config();
const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");

const subscriptionRoutes = require("./routes/subscriptionRoutes");
const stripeRoutes = require("./routes/stripeRoutes");
const adminRoutes = require("./routes/adminRoutes");
const userRoutes = require("./routes/userRoute");
const authRoutes = require("./routes/authRoutes");
const transcriptRoutes = require("./routes/transcriptRoute");
const geminiDocumentRoutes = require("./routes/geminiDocumentRoutes");


const app = express();

app.use(helmet({ crossOriginResourcePolicy: false }));

app.use(
  cors({
    origin: "*",
  })
);
app.use("/api/stripe", stripeRoutes);

app.use(express.json());
app.use(express.urlencoded({ extended: true }));

app.use(morgan("dev"));

app.use("/uploads", express.static("uploads"));
app.use("/public", express.static("public"));


app.get("/api/health", (req, res) => {
  res.status(200).json({
    success: true,
    message: "Backend is running successfully",
  });
});

// const authRoutes = require('./routes/authRoutes');
// const adminRoutes = require('./routes/adminRoutes');


app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/users', userRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/transcripts", transcriptRoutes);
app.use("/api/documents", geminiDocumentRoutes);

const { getAllPlans } = require('./controllers/adminController');
app.get('/api/plans', getAllPlans);

// Global Error Handler
app.use((err, req, res, next) => {
  console.error('Unhandled Error:', err);
  res.status(err.status || 500).json({
    success: false,
    message: err.message || 'Internal Server Error'
  });
});

module.exports = app;