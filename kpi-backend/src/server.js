import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import roleRoutes from "./routes/role.routes.js";
import kpiRoutes from "./routes/kpi.routes.js";
import kpiUpdateRoutes from "./routes/kpiUpdate.routes.js";

dotenv.config();
const app = express();

app.use(cors());
app.use(express.json());

// Routes (prefix /api)
app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/roles", roleRoutes);
app.use("/api/kpis", kpiRoutes);
app.use("/api/kpi-updates", kpiUpdateRoutes);

// Health
app.get("/api/health", (_req, res) => res.json({ ok: true }));

// DB & Start
const PORT = process.env.PORT || 5000;
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => app.listen(PORT, () => console.log(`API listening on :${PORT}`)))
  .catch((e) => console.error("Mongo connect error:", e.message));
