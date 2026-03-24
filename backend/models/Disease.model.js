import mongoose from "mongoose";

const diseaseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Disease name is required"],
      unique: true,
      trim: true,
    },

    category: {
      type: String,
      required: [true, "Category is required"],
      enum: [
        "Communicable",       // e.g. Cholera, TB, Malaria
        "Non-Communicable",   // e.g. Diabetes, Hypertension
        "Vector-Borne",       // e.g. Dengue, Malaria, Chikungunya
        "Water-Borne",        // e.g. Typhoid, Cholera
        "Air-Borne",          // e.g. Influenza, COVID-19
        "Nutritional",        // e.g. Anaemia, Malnutrition
        "Maternal & Child",   // e.g. Neonatal infections
        "Other",
      ],
      default: "Other",
    },

    symptoms: [
      {
        type: String,
        trim: true,
      },
    ],

    description: {
      type: String,
      trim: true,
    },

    // Severity helps in sorting/visualizing on charts
    severity: {
      type: String,
      enum: ["Low", "Medium", "High", "Critical"],
      default: "Medium",
    },

    icdCode: {
      type: String,    // International Classification of Diseases code (optional)
      trim: true,
    },

    preventionTips: [
      {
        type: String,
        trim: true,
      },
    ],

    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User", // admin
    },
  },
  { timestamps: true }
);

const Disease = mongoose.model("Disease", diseaseSchema);
export default Disease;