import mongoose from "mongoose";

// Each entry = one disease's data for a specific village in a given period
const diseaseEntrySchema = new mongoose.Schema(
  {
    disease: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Disease",
      required: true,
    },

    affectedCount: {
      type: Number,
      required: [true, "Affected patient count is required"],
      min: [0, "Count cannot be negative"],
    },

    recoveredCount: {
      type: Number,
      default: 0,
    },

    deathCount: {
      type: Number,
      default: 0,
    },

    ageGroups: {
      children:  { type: Number, default: 0 },   // 0–14 years
      adults:    { type: Number, default: 0 },   // 15–59 years
      seniors:   { type: Number, default: 0 },   // 60+ years
    },

    notes: {
      type: String,
      trim: true,
    },
  },
  { _id: false }
);

// ─────────────────────────────────────────────────────────────────────────────
const diseaseReportSchema = new mongoose.Schema(
  {
    // ── Who submitted ─────────────────────────────────────────────────────────
    submittedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",  // role: healthworker
      required: [true, "Submitter is required"],
    },

    // ── Which village ─────────────────────────────────────────────────────────
    village: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Village",
      required: [true, "Village is required"],
    },

    // ── Reporting period ──────────────────────────────────────────────────────
    reportMonth: {
      type: Number,  // 1–12
      required: [true, "Report month is required"],
      min: 1,
      max: 12,
    },

    reportYear: {
      type: Number,
      required: [true, "Report year is required"],
    },

    // ── Disease-wise data ─────────────────────────────────────────────────────
    diseases: {
      type: [diseaseEntrySchema],
      required: [true, "At least one disease entry is required"],
      validate: {
        validator: (arr) => arr.length > 0,
        message: "Disease list cannot be empty",
      },
    },

    // ── General village health observations ───────────────────────────────────
    generalObservations: {
      type: String,
      trim: true,
    },

    // ── Linked camp (optional — if report comes after a camp) ─────────────────
    linkedCamp: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Camp",
      default: null,
    },

    // ── Review by admin ───────────────────────────────────────────────────────
    isReviewed: {
      type: Boolean,
      default: false,
    },

    reviewedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

// ── One report per worker per village per month/year ──────────────────────────
diseaseReportSchema.index(
  { submittedBy: 1, village: 1, reportMonth: 1, reportYear: 1 },
  { unique: true }
);

const DiseaseReport = mongoose.model("DiseaseReport", diseaseReportSchema);
export default DiseaseReport;