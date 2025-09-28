import mongoose from "mongoose";

/**
 * @openapi
 * components:
 *   schemas:
 *     Role:
 *       type: object
 *       required: [name]
 *       properties:
 *         _id:
 *           type: string
 *           description: Mongo ObjectId
 *           example: "66f4b9f0b9a01234567890ff"
 *         name:
 *           type: string
 *           description: Role name
 *           enum: [admin, user]
 *           example: "admin"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */

const roleSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      enum: ["admin", "user"], // จำกัดค่า
      required: true,
      unique: true,
    },
  },
  { timestamps: true }
);

export default mongoose.model("Role", roleSchema);
