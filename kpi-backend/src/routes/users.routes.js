import { Router } from "express";
import { auth } from "../middleware/auth.js";
import { requireRole } from "../middleware/roles.js";
import { listUsers, getUser, createUser, updateUser, deleteUser } from "../Controllers/user.controller.js";

const r = Router();
r.use(auth, requireRole("admin"));

/**
 * @openapi
 * /api/users:
 *   get:
 *     tags: [User]
 *     summary: Get all users
 *     responses:
 *       200:
 *         description: List of all users
 *         content:
 *           application/json:
 *             schema:
 *               type: array
 *               items:
 *                 $ref: '#/components/schemas/User'
 */
r.get("/", listUsers);

/**
 * @openapi
 * /api/users/{id}:
 *   get:
 *     tags: [User]
 *     summary: Get user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User found
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       404:
 *         description: Not found
 */
r.get("/:id", getUser);

/**
 * @openapi
 * /api/users:
 *   post:
 *     tags: [User]
 *     summary: Create a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [username, email, password, name]
 *             properties:
 *               username: { type: string, example: "johndoe" }
 *               email: { type: string, example: "user@example.com" }
 *               password: { type: string, example: "secret123" }
 *               name: { type: string, example: "John Doe" }
 *               role: { type: string, example: "user" }
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Missing fields
 *       409:
 *         description: User already exists
 */
r.post("/", createUser);       // admin create

/**
 * @openapi
 * /api/users/{id}:
 *   put:
 *     tags: [User]
 *     summary: Update user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               username: { type: string, example: "johndoe" }
 *               email: { type: string, example: "user@example.com" }
 *               password: { type: string, example: "secret123" }
 *               name: { type: string, example: "John Doe" }
 *               role: { type: string, example: "user" }
 *     responses:
 *       200:
 *         description: User updated successfully
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/User'
 *       400:
 *         description: Invalid input
 *       404:
 *         description: Not found
 *       409:
 *         description: Email or Username already taken
 */
r.put("/:id", updateUser);

/**
 * @openapi
 * /api/users/{id}:
 *   delete:
 *     tags: [User]
 *     summary: Delete user by ID
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: User ID
 *     responses:
 *       200:
 *         description: User deleted successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 ok:
 *                   type: boolean
 *                   example: true
 *       404:
 *         description: Not found
 */
r.delete("/:id", deleteUser);

export default r;
