import { Router } from "express";
import { login, register } from "../Controllers/auth.controller.js";
const r = Router();

r.post("/login", login);
r.post("/register", register); // ใช้สำหรับ public register หรือให้ admin เรียกก็ได้

export default r;
