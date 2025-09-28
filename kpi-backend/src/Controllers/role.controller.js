import Role from "../models/Role.js";
export const listRoles = async (_req, res) => res.json(await Role.find());
export const createRole = async (req, res) => {
  const r = await Role.create({ name: req.body.name });
  res.status(201).json(r);
};
