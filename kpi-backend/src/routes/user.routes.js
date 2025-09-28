import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import { listUsers, getUser, createUser, updateUser, deleteUser } from "../Controllers/user.controller.js";

const r = Router();
r.use(auth, requireRole("admin"));

r.get("/", listUsers);
r.get("/:id", getUser);
r.post("/", createUser);       // admin create
r.put("/:id", updateUser);
r.delete("/:id", deleteUser);

export default r;
