// routes/kpiUpdate.routes.js
import { Router } from "express";
import { listUpdatesByKPI, createUpdate } from "../controllers/kpiUpdate.controller.js";
import { auth } from "../middleware/auth.js"; // ถ้าคุณใช้ JWT

const r = Router();

// ถ้าจะบังคับล็อกอินเฉพาะ POST
r.get("/:kpiId/updates", listUpdatesByKPI);
r.post("/:kpiId/updates", auth, createUpdate);

export default r;
