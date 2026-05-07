import app from "./src/app.js";
import { initScheduler } from "./src/scheduler.js";
const PORT = process.env.PORT || 5001;

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  initScheduler();
});