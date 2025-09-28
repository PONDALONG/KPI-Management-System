import KPIUpdate from "../models/KPIUpdate.js";

export const listUpdatesByKPI = async (req, res) => {
  const updates = await KPIUpdate.find({ kpi: req.params.kpiId })
    .populate("updatedBy", "username email")
    .sort({ updatedAt: -1 });
  res.json(updates);
};
export const createUpdate = async (req, res) => {
  const doc = await KPIUpdate.create({
    ...req.body,
    kpi: req.params.kpiId,
    updatedBy: req.user?.id || null,
  });
  res.status(201).json(doc);
};
