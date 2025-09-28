// routes/kpiUpdate.routes.js
import { Router } from "express";
import { listUpdatesByKPI, createUpdate } from "../controllers/kpiUpdate.controller.js";
import { auth } from "../middleware/auth.js"; // ถ้าคุณใช้ JWT

const r = Router();

// ถ้าจะบังคับล็อกอินเฉพาะ POST

/**
 * @openapi
 * /api/kpi-update/{kpiId}/updates:
 *   get:
 *     summary: Get updates for a KPI
 *     parameters:
 *       - in: path
 *         name: kpiId
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of updates
 */
r.get("/:kpiId/updates", listUpdatesByKPI);

/**
 * @openapi
 * /api/kpi-update/{kpiId}/updates:
 *   post:
 *     summary: Create update for a KPI
 *     parameters:
 *       - in: path
 *         name: kpiId
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Update created
 */
r.post("/:kpiId/updates", auth, createUpdate);

export default r;
