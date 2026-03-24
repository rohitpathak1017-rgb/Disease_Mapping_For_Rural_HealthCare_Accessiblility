import app from "./app.js";
import connectDB from "./config/db.js";
import { ENV } from "./config/env.js";

const PORT = ENV.PORT || 5000;

// Connect DB first, then start server
connectDB()
  .then(() => {
    app.listen(PORT, () => {
      console.log(`🔥 Server running on http://localhost:${PORT}`);
    });
  })
  .catch((err) => {
    console.error("❌ DB connection failed:", err.message);
    process.exit(1);  // crash fast — don't run server without DB
  });