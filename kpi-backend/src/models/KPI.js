// import mongoose from "mongoose";

// const KPISchema = new mongoose.Schema(
//   {
//     title: { type: String, required: true },
//     description: String,
//     targetValue: Number,
//     actualValue: Number,
//     status: { type: String, enum: ["On Track", "At Risk", "Off Track"], default: "On Track" },
//     assignedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
//     startDate: Date,
//     endDate: Date
//   },
//   { timestamps: true }
// );

// export default mongoose.model("KPI", KPISchema);

import mongoose from "mongoose";

const kpiSchema = new mongoose.Schema(
  {
    title: { type: String, required: true, maxlength: 255 },
    description: String,
    targetValue: { type: Number, required: true },
    actualValue: { type: Number, default: 0 },
    status: { type: String, enum: ["On Track", "At Risk", "Off Track"], default: "On Track" },
    assignedUser: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
  },
  { timestamps: true }
);

export default mongoose.model("KPI", kpiSchema);


