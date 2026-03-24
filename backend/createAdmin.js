import mongoose from "mongoose";
import dotenv from "dotenv";

dotenv.config();

import User from "./models/User.model.js";

await mongoose.connect(process.env.MONGO_URI);
console.log("✅ DB Connected");

// Purana admin delete karo
await User.deleteOne({ email: "admin@disease.com" });
console.log("🗑️ Old admin deleted");

// Fresh admin banao
await User.create({
  name: "Super Admin",
  email: "admin@disease.com",
  password: "admin123",
  role: "admin",
});
console.log("✅ Fresh admin created with hashed password!");

await mongoose.disconnect();
process.exit();