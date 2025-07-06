import fastifyAutoload from "@fastify/autoload";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import fastify, {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import path from "node:path";
import { config } from "./config/index.js";

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
  }).withTypeProvider<TypeBoxTypeProvider>();

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
  await app.register(import("@fastify/swagger"), {
    openapi: {
      openapi: "3.0.0",
      info: {
        title: "Language PDF Generator API",
        description: "Language PDF Generator API",
        version: process.env.npm_package_version || "1.0.0",
      },
      tags: [
        {
          name: "root",
          description: "Root endpoint",
        },
      ],
    },
  });
  await app.register(import("@fastify/swagger-ui"), {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "full",
      deepLinking: true,
    },
  });

  // Register routes by reading the routes directory and automatically constructing the path.
  // @see https://github.com/fastify/fastify-autoload
  await app.register(fastifyAutoload, {
    dir: path.join(import.meta.dirname, "routes"),
    autoHooks: true,
    cascadeHooks: true,
  });

  app.setNotFoundHandler((request: FastifyRequest, reply: FastifyReply) =>
    reply.status(404).send({
      error: `Route ${request.method} ${request.url} not found`,
    })
  );

  app.setErrorHandler((err, _req, reply) => {
    const statusCode = err.statusCode || 500;
    const error = err.message || "Internal Server Error";

    app.log.error(`Error ${statusCode}: ${error}`);
    app.log.error(err.stack);

    reply.status(statusCode).send({
      error,
    });
  });

  await app.ready();

  return app;
};

export default createInstance;
