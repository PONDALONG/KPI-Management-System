import KPI from "../models/KPI.js";

export const listKPIs = async (_req, res) => {
  const kpis = await KPI.find().populate("assignedUser", "name username email");
  res.json(kpis);
};

export const getKPI = async (req, res) => {
  const kpi = await KPI.findById(req.params.id).populate(
    "assignedUser",
    "name username email"
  );
  if (!kpi) return res.status(404).json({ message: "Not found" });
  res.json(kpi);
};

export const createKPI = async (req, res) => {
  const kpi = await KPI.create(req.body);
  res.status(201).json(kpi);
};

export const updateKPI = async (req, res) => {
  const kpi = await KPI.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!kpi) return res.status(404).json({ message: "Not found" });
  res.json(kpi);
};

export const deleteKPI = async (req, res) => {
  const kpi = await KPI.findByIdAndDelete(req.params.id);
  if (!kpi) return res.status(404).json({ message: "Not found" });
  res.json({ ok: true });
};
