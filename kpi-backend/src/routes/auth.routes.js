import { Router } from "express";
import { login, register } from "../Controllers/auth.controller.js";
const r = Router();

/**
 * @openapi
 * /api/auth/login:
 *   post:
 *     tags: [Auth]
 *     summary: Login to get JWT
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email: { type: string, example: "admin@gmail.com" }
 *               password: { type: string, example: "123456" }
 *     responses:
 *       200: { description: OK }
 */
r.post("/login", login);
/**
 * @openapi
 * /api/auth/register:
 *   post:
 *     tags: [Auth]
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password]
 *             properties:
 *               username: { type: string, example: "johndoe" }
 *               email: { type: string, example: "user@example.com" }
 *               password: { type: string, example: "secret123" }
 *     responses:
 *       201: { description: User registered successfully }
 *       400: { description: Invalid input }
 */
r.post("/register", register); // ใช้สำหรับ public register หรือให้ admin เรียกก็ได้

export default r;
