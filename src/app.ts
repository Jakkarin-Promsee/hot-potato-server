import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/db";
import userRoutes from "./routes/user.routes";
import { errorHandler } from "./middlewares/error.middleware";
import statusRoutes from "./routes/status.routes";
import authRoutes from "./routes/auth.routes";
import contentRoutes from "./routes/content.routes";
import answerRoutes from "./routes/answer.routes";
import imageRoutes from "./routes/image.routes";
import categoryRoutes from "./routes/category.routes";

dotenv.config();
connectDB().catch((err) => {
  console.error("DB connection failed:", err);
  process.exit(1);
});

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Status
app.get("/", (req, res) => {
  res.json({
    res: "Hot Potato said Hello World (//O-O//)\n You can use this api via .../api/xxx",
  });
});

app.use("/api/status", statusRoutes);

app.use("/api/auth", authRoutes);

app.use("/api/users", userRoutes);

app.use("/api/categories", categoryRoutes);

app.use("/api/images", imageRoutes);

app.use("/api/content", contentRoutes);

app.use("/api/content-answer", answerRoutes);

// Error Handler (must be last)
app.use(errorHandler);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
