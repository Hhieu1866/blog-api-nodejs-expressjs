import express from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

// Routes
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import postRoutes from "./routes/postRoutes";
import commentRoutes from "./routes/commentRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import tagRoutes from "./routes/tagRoutes";
import adminPostRoutes from "./routes/adminPostRoutes";

// Swagger & Error Handler
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import { errorHandler } from "./middlewares/errorHandler";

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3001;

// Allowed origins from ENV
const origins =
  process.env.CORS_ORIGINS?.split(",").map((s) => s.trim()) || [];

// Security middleware
app.set("trust proxy", 1);
app.use(helmet());
app.use(rateLimit({ windowMs: 60_000, limit: 300 }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// CORS setup
app.use(
  cors({
    origin: origins,
    credentials: true,
  }),
);

// Health check
app.get("/healthz", (req, res) => res.json({ ok: true }));

// Root endpoint
app.get("/", (req, res) => res.send("Blog API is running"));

// API docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api", commentRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/admin", adminPostRoutes);

// Error handling
app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
