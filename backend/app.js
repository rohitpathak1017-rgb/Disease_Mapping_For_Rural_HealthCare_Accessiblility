import express      from "express";
import cors         from "cors";
import cookieParser from "cookie-parser";

// ── Route Imports ─────────────────────────────────────────────────────────────
import authRoutes     from "./routes/auth.routes.js";
import adminRoutes    from "./routes/admin.routes.js";
import villageRoutes  from "./routes/village.routes.js";
import diseaseRoutes  from "./routes/disease.routes.js";
import campRoutes     from "./routes/camp.routes.js";
import reportRoutes   from "./routes/report.routes.js";
import feedbackRoutes from "./routes/feedback.routes.js";

// ── Error Handler ─────────────────────────────────────────────────────────────
import errorHandler from "./middlewares/errorHandler.middleware.js";

const app = express();

// ── Global Middlewares ────────────────────────────────────────────────────────
app.use(cors({
  origin:      process.env.CLIENT_URL || "http://localhost:5173",
  credentials: true,        // cookies cross-origin allow karne ke liye
}));

app.use(express.json({ limit: "10kb" }));
app.use(express.urlencoded({ extended: true, limit: "10kb" }));
app.use(cookieParser());    // req.cookies read karne ke liye

// ── Health Check ──────────────────────────────────────────────────────────────
app.get("/api/health", (req, res) => {
  res.status(200).json({ success: true, message: "Server is running 🚀" });
});

// ── Mount All Routes ──────────────────────────────────────────────────────────
app.use("/api/auth",     authRoutes);
app.use("/api/admin",    adminRoutes);
app.use("/api/villages", villageRoutes);
app.use("/api/diseases", diseaseRoutes);
app.use("/api/camps",    campRoutes);
app.use("/api/reports",  reportRoutes);
app.use("/api/feedback", feedbackRoutes);

// ── 404 Handler ───────────────────────────────────────────────────────────────
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Route ${req.originalUrl} not found`,
  });
});

// ── Global Error Handler (MUST be last middleware) ────────────────────────────
app.use(errorHandler);

export default app;