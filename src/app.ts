import fastifyAutoload from "@fastify/autoload";
import fastify, {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import path from "node:path";
import { config } from "./config/index.js";
import { ResponseStandardizer } from "./utils/responseStandardizer.js";

/**
 * Create a Fastify instance
 * @description This function creates a Fastify instance and registers the necessary plugins.
 * It also sets up the connection timeout and keep-alive timeout for better shutdown.
 * It waits for the app to be ready before returning.
 * @returns Fastify instance
 */
export const createInstance = async (): Promise<FastifyInstance> => {
  const app: FastifyInstance = fastify({
    logger: {
      level: config.logLevel,
    },
    bodyLimit: config.fastify.requestBodySizeLimit,
    connectionTimeout: config.fastify.connectionTimeout,
    keepAliveTimeout: config.fastify.keepAliveTimeout,
  });

  await app.register(import("@fastify/helmet"));
  await app.register(import("@fastify/cors"), {
    origin: config.cors.origin,
    credentials: config.cors.credentials,
    methods: config.cors.methods,
    allowedHeaders: config.cors.allowedHeaders,
  });
  await app.register(import("@fastify/rate-limit"), {
    max: 100,
    timeWindow: "15 minutes",
  });

  // Register routes by reading the routes directory and automatically constructing the path.
  // @see https://github.com/fastify/fastify-autoload
  await app.register(fastifyAutoload, {
    dir: path.join(import.meta.dirname, "routes"),
    autoHooks: true,
    cascadeHooks: true,
  });

  app.setNotFoundHandler((request: FastifyRequest, reply: FastifyReply) =>
    ResponseStandardizer.notFound(
      reply,
      `Route ${request.method} ${request.url} not found`
    )
  );

  app.setErrorHandler((err, _req, reply) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";

    app.log.error(`Error ${statusCode}: ${message}`);
    app.log.error(err.stack);

    ResponseStandardizer.error(reply, message, statusCode);
  });

  await app.ready();

  return app;
};

export default createInstance;
