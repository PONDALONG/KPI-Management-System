// app.js
import express from "express";
import cors from "cors";
import morgan from "morgan";
import authRoutes from "./routes/auth.routes.js";
import userRoutes from "./routes/user.routes.js";
import kpiRoutes from "./routes/kpi.routes.js";
import kpiUpdateRoutes from "./routes/kpiUpdate.routes.js";

const app = express();
app.use(express.json());
app.use(morgan("dev"));
app.use(cors());

app.use("/api/auth", authRoutes);
app.use("/api/users", userRoutes);
app.use("/api/kpis", kpiRoutes);
app.use("/api/kpis", kpiUpdateRoutes);


// error handler
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || "Server error" });
});
export default app;
