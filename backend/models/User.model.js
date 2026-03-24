import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, "Name is required"],
      trim: true,
    },

    email: {
      type: String,
      required: [true, "Email is required"],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, "Please enter a valid email"],
    },

    password: {
      type: String,
      required: [true, "Password is required"],
      minlength: [6, "Password must be at least 6 characters"],
      select: false, // never returned in queries by default
    },

    role: {
      type: String,
      enum: ["admin", "healthworker", "public"],
      default: "public",
    },

    phone: {
      type: String,
      trim: true,
    },

    // ── HealthWorker-specific fields ──────────────────────────────────────────
    assignedVillage: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Village",
      default: null, // only set for healthworker role
    },

    qualification: {
      type: String,
      trim: true, // e.g. MBBS, ASHA Worker, ANM
    },

    employeeId: {
      type: String,
      trim: true, // government employee ID for health workers
    },

    // ── Public-specific fields ────────────────────────────────────────────────
    villageLocation: {
      state: { type: String, trim: true },
      district: { type: String, trim: true },
      subdistrict: { type: String, trim: true },
    },

    // ── Account status ────────────────────────────────────────────────────────
    isActive: {
      type: Boolean,
      default: true,
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null, // admin who created this healthworker account
    },

    refreshToken: {
      type: String,
      select: false,
    },
  },
  { timestamps: true }
);

// ── Hash password before save ─────────────────────────────────────────────────
// ✅ next() removed — async/await alone handles flow in newer Mongoose versions
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 12);
});

// ── Instance method: compare password ─────────────────────────────────────────
userSchema.methods.isPasswordCorrect = async function (candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// ── Instance method: return safe user object (no password/token) ──────────────
userSchema.methods.toSafeObject = function () {
  const obj = this.toObject();
  delete obj.password;
  delete obj.refreshToken;
  return obj;
};

const User = mongoose.model("User", userSchema);
export default User;