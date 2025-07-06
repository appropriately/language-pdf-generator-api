import { createInstance } from "./app.js";
import { config } from "./config/index.js";

const startServer = async (): Promise<void> => {
  try {
    const app = await createInstance();

    await app.listen({ port: config.port, host: "0.0.0.0" }, (err, address) => {
      if (err) {
        app.log.error(err);
        process.exit(1);
      }

      app.log.info(
        `Server running, environment: ${config.nodeEnv}, address: ${address}, log level: ${config.logLevel}`
      );
      app.log.debug(`Documentation available at ${address}/docs`);
    });

    const gracefulShutdown = async (signal: string): Promise<void> => {
      app.log.info(`${signal} received, shutting down gracefully`);

      const shutdownTimeout = setTimeout(() => {
        app.log.warn("Forced shutdown after timeout");
        process.exit(1);
      }, 30000);

      try {
        await app.close();
        app.log.info("Server closed successfully");

        clearTimeout(shutdownTimeout);
        app.log.info("Process terminated gracefully");
        process.exit(0);
      } catch (error) {
        app.log.error("Error during shutdown:", error);
        clearTimeout(shutdownTimeout);
        process.exit(1);
      }
    };

    process.on("SIGTERM", () => gracefulShutdown("SIGTERM"));
    process.on("SIGINT", () => gracefulShutdown("SIGINT"));
    process.on("uncaughtException", (error) => {
      app.log.error("Uncaught Exception:", error);
      gracefulShutdown("uncaughtException");
    });
    process.on("unhandledRejection", (reason, promise) => {
      app.log.error("Unhandled Rejection at:", promise, "reason:", reason);
      gracefulShutdown("unhandledRejection");
    });
  } catch (error) {
    console.error("Failed to start server:", error);
    process.exit(1);
  }
};

startServer();
