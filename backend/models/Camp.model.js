import mongoose from "mongoose";

const campSchema = new mongoose.Schema(
  {
    campName: {
      type: String,
      required: [true, "Camp name is required"],
      trim: true,
    },

    // ── References ────────────────────────────────────────────────────────────
    village: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Village",
      required: [true, "Village is required"],
    },

    healthWorker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",   // role: healthworker
      required: [true, "Health worker is required"],
    },

    // ── Camp schedule ─────────────────────────────────────────────────────────
    campDate: {
      type: Date,
      required: [true, "Camp date is required"],
    },

    startTime: {
      type: String,   // e.g. "09:00 AM"
      trim: true,
    },

    endTime: {
      type: String,   // e.g. "05:00 PM"
      trim: true,
    },

    // ── Services provided at this camp ────────────────────────────────────────
    servicesOffered: [
      {
        type: String,
        trim: true,
        // e.g. "Blood Pressure Check", "Vaccination", "Eye Checkup", "Malaria Test"
      },
    ],

    // ── Diseases targeted / addressed at this camp ────────────────────────────
    targetedDiseases: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Disease",
      },
    ],

    // ── Activities done during the camp ───────────────────────────────────────
    activitiesDone: [
      {
        activityName: { type: String, trim: true },
        description:  { type: String, trim: true },
      },
    ],

    // ── Outcomes / stats ──────────────────────────────────────────────────────
    patientsAttended: {
      type: Number,
      default: 0,
    },

    medicinesDistributed: [
      {
        medicineName: { type: String, trim: true },
        quantity:     { type: Number, default: 0 },
      },
    ],

    // ── Status ────────────────────────────────────────────────────────────────
    status: {
      type: String,
      enum: ["Scheduled", "Ongoing", "Completed", "Cancelled"],
      default: "Scheduled",
    },

    notes: {
      type: String,
      trim: true,
    },
  },
  { timestamps: true }
);

const Camp = mongoose.model("Camp", campSchema);
export default Camp;