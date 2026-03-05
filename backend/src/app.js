const express = require("express");
const cors = require("cors");
const helmet = require("helmet");
const morgan = require("morgan");
const rateLimit = require("express-rate-limit");
const authMiddleware = require("./middleware/authMiddleware");
const errorMiddleware = require("./middleware/errorMiddleware");

// Import All Routes
const authRoutes = require("./routes/authRoutes");
const adminRoutes = require("./routes/adminRoutes");
const entityRoutes = require("./routes/entityRoutes");
const staffRoutes = require("./routes/staffRoutes");
const approvalRoutes = require("./routes/approvalRoutes");

const app = express();

// Trust proxy headers from ngrok/reverse proxies (required for express-rate-limit)
app.set('trust proxy', 1);

// Rate Limiting Configuration
const generalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 requests per window
  message: "Too many requests from this IP, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

const authLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // 100 login attempts per window
  message: "Too many login attempts, please try again later.",
  standardHeaders: true,
  legacyHeaders: false,
});

// Middleware
app.use(cors());
app.use(
  helmet({
    contentSecurityPolicy: {
      directives: {
        ...helmet.contentSecurityPolicy.getDefaultDirectives(),
        "frame-ancestors": ["'self'", "http://localhost:3000", "http://localhost:5173"],
      },
    },
    crossOriginResourcePolicy: { policy: "cross-origin" },
  })
);
app.use(morgan("dev"));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Serve uploaded files with relaxed headers for iframe embedding
app.use("/uploads", (req, res, next) => {
  res.removeHeader("X-Frame-Options");
  res.setHeader("Content-Security-Policy", "frame-ancestors 'self' http://localhost:3000 http://localhost:5173");
  res.setHeader("Cross-Origin-Resource-Policy", "cross-origin");
  next();
}, express.static("uploads"));

app.use("/api/", generalLimiter); // Apply rate limiting to all API routes

// Health check endpoint
app.get("/health", (req, res) => {
  res.json({ status: "ok", message: "Server is running" });
});

// Public Routes (no auth required)
app.use("/api/auth/login", authLimiter); // Stricter limit for login
app.use("/api/auth", authRoutes);

// Protected Routes (auth required)
app.use("/api/admin", authMiddleware.protect, adminRoutes);
app.use("/api/entities", authMiddleware.protect, entityRoutes);
app.use("/api/entity", authMiddleware.protect, entityRoutes);
app.use("/api/staff", authMiddleware.protect, staffRoutes);
app.use("/api/approvals", authMiddleware.protect, approvalRoutes);

// 404 Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: "Endpoint not found",
  });
});

// Global Error Handler
app.use(errorMiddleware);

module.exports = app;
