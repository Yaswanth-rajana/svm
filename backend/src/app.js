import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import { env } from "./config/env.js";
import mongoSanitize from "express-mongo-sanitize";
import leadRoutes from "./routes/leadRoutes.js";
import otpRoutes from "./routes/otpRoutes.js";
import paymentRoutes from "./routes/paymentRoutes.js";
import authRoutes from "./routes/authRoutes.js";
import certificateRoutes from "./routes/certificateRoutes.js";
import biginRoutes from "./routes/biginRoutes.js";
import studentRoutes from "./routes/studentRoutes.js";
import adminRoutes from "./routes/adminRoutes.js";
import studentAuthRoutes from "./routes/studentAuthRoutes.js";


const allowedOrigins = [
  "https://smven.com",
  "https://www.smven.com",
  "https://admin.smven.com",
  "https://student.smven.com",
  "https://portal.smven.com",
  "http://localhost:5173",
  "http://localhost:5174",
  "http://localhost:5175",
  ...(env.ALLOWED_ORIGINS || []),
];

const app = express();

app.use(
  cors({
    origin: (origin, callback) => {
      // Allow requests with no origin (like mobile apps, curl, postman)
      if (!origin) return callback(null, true);
      if (
        allowedOrigins.includes(origin) ||
        /^https:\/\/(.*\.)?smven\.com$/.test(origin) ||
        /^http:\/\/localhost:\d+$/.test(origin) ||
        /\.vercel\.app$/.test(origin)
      ) {
        return callback(null, true);
      }
      return callback(new Error("CORS Policy: Origin not allowed"), false);
    },
    credentials: true,
  })
);
// Trust Proxy (Required for correct IP detection behind Render/Railway/Nginx)
app.set("trust proxy", 1);

// Security Headers with Razorpay Compatibility
app.use(
  helmet({
    crossOriginEmbedderPolicy: false,
    crossOriginOpenerPolicy: false,
    contentSecurityPolicy: false,
  })
);

// Global Rate Limiting
const globalLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: process.env.NODE_ENV === "production" ? 100 : 10000, // Raise limit significantly in development
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many requests from this IP, please try again after 15 minutes"
  },
});
app.use(globalLimiter);

// Specific Rate Limiting for OTP and Auth (Strict)
const authLimiter = rateLimit({
  windowMs: 60 * 60 * 1000, // 1 hour
  max: 10, // Limit each IP to 10 requests per hour
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many attempts, please try again after an hour"
  },
});

// Strict Rate Limiting for Certificate claims (30 requests per 15 minutes per IP)
const certificateLimiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 30, // Limit each IP to 30 requests per 15 minutes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    success: false,
    message: "Too many certificate attempts, please try again after 15 minutes"
  },
});



app.use(
  express.json({
    verify: (req, res, buf) => {
      req.rawBody = buf.toString();
    },
  })
);


// Express 5 Compatibility: Make req.query mutable for express-mongo-sanitize
app.use((req, res, next) => {
  if (req.query) {
    Object.defineProperty(req, 'query', {
      value: { ...req.query },
      writable: true,
      configurable: true,
      enumerable: true,
    });
  }
  next();
});

// NoSQL Injection Protection
app.use(mongoSanitize());


// Routes
app.use("/api/send-otp", authLimiter);
app.use("/api/resend-otp", authLimiter);
app.use("/api/verify-otp", authLimiter);
app.use("/auth", authLimiter);

app.use("/api", leadRoutes);
app.use("/api", otpRoutes);
app.use("/api", paymentRoutes);
app.use("/auth", authRoutes); // Zoho Auth
app.use("/api/auth", authLimiter, studentAuthRoutes); // Student Password Auth
app.use("/api/certificate", certificateLimiter);
app.use("/api/certificate", certificateRoutes);
app.use("/api", biginRoutes);
app.use("/api/student", studentRoutes);
app.use("/api/admin", adminRoutes);



app.get("/", (req, res) => {
  res.send("API running..."); // trigger nodemon restart
});

export default app;