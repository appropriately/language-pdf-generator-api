import dotenv from "dotenv";

dotenv.config();

export const config = {
  port: process.env.PORT || 3000,
  nodeEnv: process.env.NODE_ENV || "development",

  corsOrigins: process.env.CORS_ORIGINS?.split(",") || [
    "http://localhost:3000",
  ],

  express: {
    requestBodySizeLimit: process.env.REQUEST_BODY_SIZE_LIMIT || "10mb",
  },

  logLevel: process.env.LOG_LEVEL || "info",
} as const;

export type Config = typeof config;
