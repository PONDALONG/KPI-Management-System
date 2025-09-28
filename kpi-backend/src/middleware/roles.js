export const requireRole = (roleName) => (req, res, next) => {
  if (req.user?.role === roleName) return next();
  return res.status(403).json({ message: "Forbidden" });
};
