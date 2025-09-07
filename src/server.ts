import express, { Request, Response } from "express";
import cors from "cors";
import cookieParser from "cookie-parser";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import dotenv from "dotenv";

// ROUTES (giữ nguyên cấu trúc dự án của bạn)
import authRoutes from "./routes/authRoutes";
import userRoutes from "./routes/userRoutes";
import postRoutes from "./routes/postRoutes";
import commentRoutes from "./routes/commentRoutes";
import categoryRoutes from "./routes/categoryRoutes";
import tagRoutes from "./routes/tagRoutes";
import adminPostRoutes from "./routes/adminPostRoutes";

// SWAGGER & ERROR HANDLER (giữ nguyên)
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./config/swagger";
import { errorHandler } from "./middlewares/errorHandler";

dotenv.config();

const app = express();
const isProd = process.env.NODE_ENV === "production";
const PORT = Number(process.env.PORT) || 3001;

// Cho phép nhiều origin từ ENV (FE local + FE prod)
const origins = (process.env.CORS_ORIGINS || "")
  .split(",")
  .map((s) => s.trim())
  .filter(Boolean);

// Security & basics
app.set("trust proxy", 1);
app.use(helmet());
app.use(rateLimit({ windowMs: 60_000, limit: 300 }));
app.use(express.json({ limit: "1mb" }));
app.use(cookieParser());

// CORS cho cookie/JWT (credentials)
app.use(
  cors({
    origin: (origin, cb) => {
      if (!origin || origins.includes(origin)) return cb(null, true);
      return cb(new Error("CORS blocked"), false);
    },
    credentials: true,
  }),
);

// Healthcheck để Render check container sống
app.get("/healthz", (_req: Request, res: Response) =>
  res.json({ ok: true, ts: Date.now() }),
);

// Root
app.get("/", (_req: Request, res: Response) => {
  res.send("Blog API is up");
});

// Swagger docs
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/posts", postRoutes);
app.use("/api", commentRoutes);
app.use("/api/categories", categoryRoutes);
app.use("/api/tags", tagRoutes);
app.use("/api/admin", adminPostRoutes);

app.use(errorHandler);

app.listen(PORT, () => {
  console.log(`Server listening on :${PORT}`);
});
