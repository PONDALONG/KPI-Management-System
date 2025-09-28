import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import { listRoles, createRole } from "../Controllers/role.controller.js";

const r = Router();
r.use(auth, requireRole("admin"));

r.get("/", listRoles);
r.post("/", createRole);

export default r;
