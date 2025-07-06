import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: Number(process.env.PORT) || 3000,
  nodeEnv: process.env.NODE_ENV || "development",

  cors: {
    origin: process.env.CORS_ORIGINS?.split(",") || ["http://localhost:3000"],
    credentials: process.env.CORS_CREDENTIALS === "true",
    methods: process.env.CORS_METHODS?.split(",") || [
      "GET",
      "POST",
      "PUT",
      "DELETE",
      "OPTIONS",
    ],
    allowedHeaders: process.env.CORS_ALLOWED_HEADERS?.split(",") || [
      "Content-Type",
      "Authorization",
      "X-Requested-With",
    ],
  },

  fastify: {
    connectionTimeout: Number(process.env.CONNECTION_TIMEOUT) || 30000,
    keepAliveTimeout: Number(process.env.KEEP_ALIVE_TIMEOUT) || 5000,
    requestBodySizeLimit:
      Number(process.env.REQUEST_BODY_SIZE_LIMIT) || 10000000,
  },

  logLevel: process.env.LOG_LEVEL || "info",
} as const;

export type Config = typeof config;
