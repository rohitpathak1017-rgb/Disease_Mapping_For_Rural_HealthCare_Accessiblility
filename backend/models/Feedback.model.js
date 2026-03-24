import mongoose from "mongoose";

const feedbackSchema = new mongoose.Schema(
  {
    // ── Who gave feedback ─────────────────────────────────────────────────────
    givenBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",   // role: public
      required: [true, "Feedback giver is required"],
    },

    // ── To which health worker ────────────────────────────────────────────────
    healthWorker: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",   // role: healthworker
      required: [true, "Health worker reference is required"],
    },

    // ── Related village ───────────────────────────────────────────────────────
    village: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Village",
      required: [true, "Village is required"],
    },

    // ── Related camp (optional) ───────────────────────────────────────────────
    relatedCamp: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Camp",
      default: null,
    },

    // ── Feedback content ──────────────────────────────────────────────────────
    rating: {
      type: Number,
      required: [true, "Rating is required"],
      min: [1, "Minimum rating is 1"],
      max: [5, "Maximum rating is 5"],
    },

    category: {
      type: String,
      enum: [
        "Camp Service",       // quality of services at camp
        "Doctor Behaviour",   // how the worker treated patients
        "Medicine Supply",    // availability of medicines
        "Response Time",      // how quickly worker responded
        "Overall Experience",
        "Other",
      ],
      default: "Overall Experience",
    },

    message: {
      type: String,
      required: [true, "Feedback message is required"],
      trim: true,
      minlength: [10, "Feedback must be at least 10 characters"],
      maxlength: [500, "Feedback cannot exceed 500 characters"],
    },

    isAnonymous: {
      type: Boolean,
      default: false,  // if true, public name won't be shown to worker
    },

    // ── Admin moderation ──────────────────────────────────────────────────────
    isApproved: {
      type: Boolean,
      default: true,   // auto-approve; admin can set false to hide abusive content
    },

    // ── Worker acknowledgement ────────────────────────────────────────────────
    isReadByWorker: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

// ── Index for fast lookup by health worker ────────────────────────────────────
feedbackSchema.index({ healthWorker: 1, createdAt: -1 });

const Feedback = mongoose.model("Feedback", feedbackSchema);
export default Feedback;