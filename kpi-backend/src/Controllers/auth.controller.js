import bcrypt from "bcryptjs";
import User from "../models/User.js";
import Role from "../models/Role.js";
import { signToken } from "../utils/jwt.js";

export const register = async (req, res) => {
  try {
    const { username, email, password, role = "user", name } = req.body;
    if (!username || !email || !password)
      return res.status(400).json({ message: "Missing fields" });

    const exists = await User.findOne({ $or: [{ email }, { username }] });
    if (exists)
      return res.status(409).json({ message: "User already exists" });

    const roleDoc =
      (await Role.findOne({ name: role })) || (await Role.create({ name: role }));
    const passwordHash = await bcrypt.hash(password, 10);

    
    const displayName = (name && name.trim()) || username;

    const user = await User.create({
      username,
      name: displayName,
      email,
      passwordHash,
      role: roleDoc._id,
    });

    const token = signToken({ id: user._id });

    res.status(201).json({
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        role,
      },
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};

export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    const user = await User.findOne({ email }).populate("role");
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const ok = await bcrypt.compare(password, user.passwordHash);
    if (!ok) return res.status(400).json({ message: "Invalid credentials" });

    const token = signToken({ id: user._id });

    res.json({
      token,
      user: {
        id: user._id,
        username: user.username,
        name: user.name,
        email: user.email,
        role: user.role?.name || "user",
      },
    });
  } catch (e) {
    res.status(500).json({ message: e.message });
  }
};
