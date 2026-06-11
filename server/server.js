const dotenv = require("dotenv");
dotenv.config();

const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const connectDB = require("./config/db");
const chatRoutes = require("./routes/chatRoutes");
const errorHandler = require("./middleware/errorHandler");

const app = express();

const localhostOriginPattern = /^https?:\/\/(localhost|127\.0\.0\.1)(?::\d+)?$/;
const allowedOrigins = new Set([process.env.CLIENT_URL].filter(Boolean));

const requiredEnv = ["MONGO_URI"];
const missingEnv = requiredEnv.filter((name) => !process.env[name]);
const hasAiKey = process.env.GROQ_API_KEY;

if (missingEnv.length > 0) {
  throw new Error(
    `Missing required environment variables: ${missingEnv.join(", ")}`,
  );
}

if (!hasAiKey) {
  throw new Error("Missing required environment variables: GROQ_API_KEY");
}

// Connect to MongoDB
connectDB();

// Middleware
app.use(helmet());
app.use(
  cors({
    origin: function (origin, callback) {
      if (
        !origin ||
        localhostOriginPattern.test(origin) ||
        allowedOrigins.has(origin)
      ) {
        callback(null, true);
      } else {
        callback(new Error(`Not allowed by CORS: ${origin}`));
      }
    },
    methods: ["GET", "POST", "DELETE"],
    credentials: true,
  }),
);
app.use(morgan("dev"));
app.use(express.json());

// Routes
app.use("/api", chatRoutes);

// Health check
app.get("/", (req, res) => {
  res.json({ status: "API is running" });
});

// Global error handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
