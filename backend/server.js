import { env } from "./src/config/env.js";
import connectDB from "./src/config/db.js";
import app from "./src/app.js";
import { initScheduler } from "./src/scheduler.js";

const PORT = env.PORT || 5001;

app.listen(PORT, async () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  await connectDB();
  initScheduler();
});