import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import budgetRoutes from "./src/routes/budget.routes.js";
import budgetEstimatorRoutes from "./src/routes/budgetEstimator.routes.js";
import authRoutes from "./src/routes/auth.routes.js";
import userRoutes from "./src/routes/user.routes.js";

dotenv.config();
const app = express();

// Security middleware
app.use(helmet({
  crossOriginResourcePolicy: { policy: "cross-origin" },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", "'unsafe-inline'"],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", "data:", "blob:", "https://*.s3.amazonaws.com", "https://*.cloudfront.net"],
    },
  },
}));

// CORS configuration - allows all origins (fine for portfolio)
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

// Body parsing with size limits
app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));
app.use(cookieParser());

// Routes
app.use("/api", budgetRoutes);
app.use("/api", budgetEstimatorRoutes);
app.use("/api/auth", authRoutes);
app.use("/api", userRoutes);

// Health check route
app.get("/api/health", (req, res) => {
  res.json({ status: "OK", message: "Backend is running on Lambda" });
});

// Error handling middleware
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ message: 'Something went wrong!' });
});

// Only listen if NOT in Lambda environment
if (!process.env.AWS_LAMBDA_RUNTIME_API) {
  const PORT = process.env.PORT || 5000;
  app.listen(PORT, () => {
    console.log(`🚀 Server running on port ${PORT}`);
    console.log(`📧 Email service: Brevo SMTP configured`);
    console.log(`📁 Uploads will go to S3 bucket: ${process.env.S3_BUCKET_NAME || 'Not configured'}`);
  });
}

export default app;