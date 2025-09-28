import { Router } from "express";
import { auth } from "../middleware/auth.js";
import {
  listKPIs,
  getKPI,
  createKPI,
  updateKPI,
  deleteKPI,
} from "../Controllers/kpi.controller.js";

const r = Router();
r.use(auth); // ทุกคนที่ login ใช้ได้

/**
 * @openapi
 * /api/kpi:
 *   get:
 *     tags: [KPI]
 *     summary: Get all KPIs
 *     responses:
 *       200:
 *         description: List of KPIs
 */
r.get("/", listKPIs);

/**
 * @openapi
 * /api/kpi/{id}:
 *   get:
 *     tags: [KPI]
 *     summary: Get KPI by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: KPI object
 *       404:
 *         description: Not found
 */
r.get("/:id", getKPI);

/**
 * @openapi
 * /api/kpi:
 *   post:
 *     tags: [KPI]
 *     summary: Create a new KPI
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: KPI created
 */
r.post("/", createKPI); // ถ้าต้องการจำกัดให้ admin เท่านั้นก็ครอบ requireRole("admin")

/**
 * @openapi
 * /api/kpi/{id}:
 *   put:
 *     tags: [KPI]
 *     summary: Update KPI by ID
 *     parameters:
 *       - in: path
 *         name: id
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
 *       200:
 *         description: KPI updated
 *       404:
 *         description: Not found
 */
r.put("/:id", updateKPI);

/**
 * @openapi
 * /api/kpi/{id}:
 *   delete:
 *     tags: [KPI]
 *     summary: Delete KPI by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: KPI deleted
 *       404:
 *         description: Not found
 */
r.delete("/:id", deleteKPI);

export default r;
