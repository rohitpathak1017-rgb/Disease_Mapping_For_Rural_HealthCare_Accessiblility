import mongoose from "mongoose";

const villageSchema = new mongoose.Schema(
  {
    // ── Location hierarchy ────────────────────────────────────────────────────
    state: {
      type: String,
      required: [true, "State is required"],
      trim: true,
    },

    district: {
      type: String,
      required: [true, "District is required"],
      trim: true,
    },

    subdistrict: {
      type: String,
      required: [true, "Subdistrict / Block is required"],
      trim: true,
    },

    villageName: {
      type: String,
      required: [true, "Village name is required"],
      trim: true,
    },

    pincode: {
      type: String,
      trim: true,
    },

    // ── Population info (optional, useful for disease density charts) ─────────
    population: {
      type: Number,
      default: 0,
    },

    // ── Assigned health worker ────────────────────────────────────────────────
    assignedHealthWorker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",   // role: healthworker
      default: null,
    },

    // ── Active diseases currently reported in this village ────────────────────
    activeDiseases: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Disease",
      },
    ],

    // ── Status ────────────────────────────────────────────────────────────────
    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // admin who added this village
    },
  },
  { timestamps: true }
);

// ── Compound index to avoid duplicate village entries ─────────────────────────
villageSchema.index(
  { state: 1, district: 1, subdistrict: 1, villageName: 1 },
  { unique: true }
);

const Village = mongoose.model("Village", villageSchema);
export default Village;