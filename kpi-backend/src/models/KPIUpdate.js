import mongoose from "mongoose";

const kpiUpdateSchema = new mongoose.Schema(
  {
    kpi: { type: mongoose.Schema.Types.ObjectId, ref: "KPI", required: true },
    updatedValue: { type: Number, required: true },
    comment: String,
    updatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: { createdAt: "updatedAt", updatedAt: false } }
);

export default mongoose.model("KPIUpdate", kpiUpdateSchema);
