
import mongoose from "mongoose";

/**
 * @openapi
 * components:
 *   schemas:
 *     User:
 *       type: object
 *       required: [username, email, role]
 *       properties:
 *         _id:
 *           type: string
 *           description: Mongo ObjectId
 *           example: "66f4b9f0b9a01234567890ab"
 *         username:
 *           type: string
 *           example: "alice_01"
 *         name:
 *           type: string
 *           nullable: true
 *           example: "Alice Johnson"
 *         email:
 *           type: string
 *           format: email
 *           example: "alice@example.com"
 *         role:
 *           type: string
 *           description: Role ObjectId
 *           example: "66f4b9f0b9a01234567890ff"
 *         createdAt:
 *           type: string
 *           format: date-time
 *         updatedAt:
 *           type: string
 *           format: date-time
 */


const userSchema = new mongoose.Schema(
  {
    // ✅ ใช้เป็นคีย์หลักที่ controller อ้างถึง
    username: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      minlength: 3,
      maxlength: 30,
      match: /^[a-zA-Z0-9._-]+$/, // จำกัดตัวอักษรที่ปลอดภัยสำหรับ username
    },

    // ✅ ชื่อแสดงผล (ไม่บังคับ/ไม่ unique)
    name: {
      type: String,
      trim: true,
      maxlength: 50,
      default: null,
    },

    email: {
      type: String,
      required: true,
      unique: true,
      trim: true,
      lowercase: true,       // เก็บเป็นตัวพิมพ์เล็กเสมอ
      maxlength: 100,
      match:
        /^[^\s@]+@[^\s@]+\.[^\s@]+$/, // ตรวจรูปแบบอีเมลเบื้องต้น
    },

    passwordHash: {
      type: String,
      required: true,
      // ถ้าต้องการความปลอดภัยเพิ่ม: ใส่ select: false แล้วเวลา query ต้อง .select('+passwordHash')
      // select: false,
    },

    role: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Role",
      required: true, // แนะนำให้บังคับ เพื่อความสม่ำเสมอของข้อมูล
    },
  },
  {
    timestamps: true,
    versionKey: false,
    toJSON: {
      transform(_doc, ret) {
        delete ret.passwordHash; // ไม่ส่ง hash ออกไปเวลา toJSON
        return ret;
      },
    },
  }
);

// เผื่อบางเวอร์ชันของ Mongoose ต้องประกาศดัชนีซ้ำ
userSchema.index({ username: 1 }, { unique: true });
userSchema.index({ email: 1 }, { unique: true });

export default mongoose.model("User", userSchema);
