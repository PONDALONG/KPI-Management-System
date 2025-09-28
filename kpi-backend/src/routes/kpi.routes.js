import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { listKPIs, getKPI, createKPI, updateKPI, deleteKPI } from "../Controllers/kpi.controller.js";

const r = Router();
r.use(auth); // ทุกคนที่ login ใช้ได้

r.get("/", listKPIs);
r.get("/:id", getKPI);
r.post("/", createKPI);      // ถ้าต้องการจำกัดให้ admin เท่านั้นก็ครอบ requireRole("admin")
r.put("/:id", updateKPI);
r.delete("/:id", deleteKPI);

export default r;
