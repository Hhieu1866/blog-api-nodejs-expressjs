"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const cookie_parser_1 = __importDefault(require("cookie-parser"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const dotenv_1 = __importDefault(require("dotenv"));
// ROUTES (giữ nguyên cấu trúc dự án của bạn)
const authRoutes_1 = __importDefault(require("./routes/authRoutes"));
const userRoutes_1 = __importDefault(require("./routes/userRoutes"));
const postRoutes_1 = __importDefault(require("./routes/postRoutes"));
const commentRoutes_1 = __importDefault(require("./routes/commentRoutes"));
const categoryRoutes_1 = __importDefault(require("./routes/categoryRoutes"));
const tagRoutes_1 = __importDefault(require("./routes/tagRoutes"));
const adminPostRoutes_1 = __importDefault(require("./routes/adminPostRoutes"));
// SWAGGER & ERROR HANDLER (giữ nguyên)
const swagger_ui_express_1 = __importDefault(require("swagger-ui-express"));
const swagger_1 = require("./config/swagger");
const errorHandler_1 = require("./middlewares/errorHandler");
dotenv_1.default.config();
const app = (0, express_1.default)();
const isProd = process.env.NODE_ENV === "production";
const PORT = Number(process.env.PORT) || 3001;
// Cho phép nhiều origin từ ENV (FE local + FE prod)
const origins = (process.env.CORS_ORIGINS || "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean);
// Security & basics
app.set("trust proxy", 1);
app.use((0, helmet_1.default)());
app.use((0, express_rate_limit_1.default)({ windowMs: 60000, limit: 300 }));
app.use(express_1.default.json({ limit: "1mb" }));
app.use((0, cookie_parser_1.default)());
// CORS cho cookie/JWT (credentials)
app.use((0, cors_1.default)({
    origin: (origin, cb) => {
        if (!origin || origins.includes(origin))
            return cb(null, true);
        return cb(new Error("CORS blocked"), false);
    },
    credentials: true,
}));
// Healthcheck để Render check container sống
app.get("/healthz", (_req, res) => res.json({ ok: true, ts: Date.now() }));
// Root
app.get("/", (_req, res) => {
    res.send("Blog API is up");
});
// Swagger docs
app.use("/api-docs", swagger_ui_express_1.default.serve, swagger_ui_express_1.default.setup(swagger_1.swaggerSpec));
app.use("/api/auth", authRoutes_1.default);
app.use("/api/users", userRoutes_1.default);
app.use("/api/posts", postRoutes_1.default);
app.use("/api", commentRoutes_1.default);
app.use("/api/categories", categoryRoutes_1.default);
app.use("/api/tags", tagRoutes_1.default);
app.use("/api/admin", adminPostRoutes_1.default);
app.use(errorHandler_1.errorHandler);
app.listen(PORT, () => {
    console.log(`Server listening on :${PORT}`);
});
