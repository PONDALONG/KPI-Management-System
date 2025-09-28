import { verifyToken } from "../utils/jwt.js";
import User from "../models/User.js";

export const auth = async (req, res, next) => {
  try {
    const header = req.headers.authorization || "";
    const token = header.startsWith("Bearer ") ? header.slice(7) : null;
    if (!token) return res.status(401).json({ message: "Unauthorized" });

    const payload = verifyToken(token);
    const user = await User.findById(payload.id).populate("role");
    if (!user) return res.status(401).json({ message: "Unauthorized" });

    req.user = { id: user._id.toString(), email: user.email, role: user.role?.name || "user" };
    next();
  } catch (e) {
    res.status(401).json({ message: "Unauthorized" });
  }
};
