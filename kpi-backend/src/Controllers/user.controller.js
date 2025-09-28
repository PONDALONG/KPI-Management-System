import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Role from "../models/Role.js";

/** Helper: หา/สร้าง role จากชื่อ (string) */
async function upsertRoleByName(roleInput) {
  const roleName =
    typeof roleInput === "string"
      ? roleInput
      : roleInput?.name ?? "user";

  const roleDoc = await Role.findOneAndUpdate(
    { name: roleName },
    { $setOnInsert: { name: roleName } },
    { new: true, upsert: true }
  );
  return roleDoc;
}

/** Helper: ตอบกลับ user object ที่ flatten role เป็นชื่อ */
function toUserDTO(u, roleNameFallback = "user") {
  const roleName =
    (u.role && (u.role.name || u.role)) || roleNameFallback;
  return {
    id: u._id,
    username: u.username,
    name: u.name,
    email: u.email,
    role: roleName,
  };
}

export const listUsers = async (_req, res) => {
  try {
    const users = await User.find()
      .populate("role", "name")
      .select("-passwordHash");
    res.json(users.map((u) => toUserDTO(u)));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

export const getUser = async (req, res) => {
  try {
    const u = await User.findById(req.params.id)
      .populate("role", "name")
      .select("-passwordHash");
    if (!u) return res.status(404).json({ message: "Not found" });
    res.json(toUserDTO(u));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Admin create user
export const createUser = async (req, res) => {
  try {
    const { username, email, password, role = "user", name } = req.body;

    const missing = [];
    if (!username) missing.push("username");
    if (!email) missing.push("email");
    if (!password) missing.push("password");
    if (!name) missing.push("name");
    if (missing.length) {
      return res.status(400).json({
        message: "Missing fields",
        details: missing,
      });
    }

    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists) {
      return res.status(409).json({ message: "User already exists" });
    }

    const roleDoc = await upsertRoleByName(role);
    const passwordHash = await bcrypt.hash(password, 10);

    const u = await User.create({
      username: username.trim(),
      name: name.trim(),
      email: email.trim().toLowerCase(),
      passwordHash,
      role: roleDoc._id,
    });

    res.status(201).json(toUserDTO(u, roleDoc.name));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};

// ✅ Update user (แก้ไขไม่ให้ error ถ้า password ว่าง)
export const updateUser = async (req, res) => {
  try {
    const { username, email, role, password, name } = req.body;

    const u = await User.findById(req.params.id);
    if (!u) return res.status(404).json({ message: "Not found" });

    // กันซ้ำ email
    if (email && email.trim().toLowerCase() !== u.email) {
      const dupEmail = await User.findOne({
        _id: { $ne: u._id },
        email: email.trim().toLowerCase(),
      });
      if (dupEmail) {
        return res.status(409).json({ message: "Email already taken" });
      }
      u.email = email.trim().toLowerCase();
    }

    // กันซ้ำ username
    if (username && username.trim() !== u.username) {
      const dupUsername = await User.findOne({
        _id: { $ne: u._id },
        username: username.trim(),
      });
      if (dupUsername) {
        return res.status(409).json({ message: "Username already taken" });
      }
      u.username = username.trim();
    }

    // name (optional)
    if (name !== undefined) {
      u.name = name?.trim() || "";
    }

    // role
    if (role) {
      const roleDoc = await upsertRoleByName(role);
      u.role = roleDoc._id;
    }

    // password (อัปเดตเฉพาะถ้ามีจริงและไม่ว่าง)
    if (password && password.trim() !== "") {
      u.passwordHash = await bcrypt.hash(password, 10);
    }

    await u.save();
    await u.populate("role", "name");

    res.json(toUserDTO(u));
  } catch (error) {
    return res.status(500).json({ message: error.message });
  }
};

export const deleteUser = async (req, res) => {
  try {
    const u = await User.findById(req.params.id);
    if (!u) return res.status(404).json({ message: "Not found" });
    await u.deleteOne();
    res.json({ ok: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
};
