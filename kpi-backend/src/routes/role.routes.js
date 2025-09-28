import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import { listRoles, createRole } from "../Controllers/role.controller.js";

const r = Router();
r.use(auth, requireRole("admin"));

/**
 * @openapi
 * /api/roles:
 *   get:
 *     tags: [Role]
 *     summary: Get all roles
 *     responses:
 *       200:
 *         description: List of all roles
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/Role'
 */
r.get("/", listRoles);

/**
 * @openapi
 * /api/roles:
 *   post:
 *     tags: [Role]
 *     summary: Create a new role
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name]
 *             properties:
 *               name:
 *                 type: string
 *                 example: "admin"
 *     responses:
 *       201:
 *         description: Role created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/Role'
 *       400:
 *         description: Invalid input
 */
r.post("/", createRole);

export default r;
