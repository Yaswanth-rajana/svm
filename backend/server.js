import { env } from "./src/config/env.js";
import connectDB from "./src/config/db.js";
import app from "./src/app.js";
import { initScheduler } from "./src/scheduler.js";

const PORT = env.PORT || 5001;

const startServer = async () => {
  await connectDB();
  initScheduler();
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
};

startServer();