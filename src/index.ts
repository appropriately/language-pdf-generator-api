import app from "./app";
import { config } from "./config";

const server = app.listen(config.port, () => {
  console.log(`🚀 Language PDF Generator API running on port ${config.port}`);
  console.log(`📊 Environment: ${config.nodeEnv}`);
});

process.on("SIGTERM", () => {
  console.log("SIGTERM received, shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
    process.exit(0);
  });
});

process.on("SIGINT", () => {
  console.log("SIGINT received, shutting down gracefully");
  server.close(() => {
    console.log("Process terminated");
    process.exit(0);
  });
});

export default server;
