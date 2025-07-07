import fastifyAutoload from "@fastify/autoload";
import { TypeBoxTypeProvider } from "@fastify/type-provider-typebox";
import fastify, {
  FastifyInstance,
  FastifyReply,
  FastifyRequest,
} from "fastify";
import path from "node:path";
import { config } from "./config/index.js";

interface InstanceOptions {
  logLevel?: "trace" | "debug" | "info" | "warn" | "error" | "fatal";
}

/**
 * Create a Fastify instance
 * @description This function creates a Fastify instance and registers the necessary plugins.
 * It also sets up the connection timeout and keep-alive timeout for better shutdown.
 * It waits for the app to be ready before returning.
 * @returns Fastify instance
 */
export const createInstance = async (
  opts: InstanceOptions = {}
): Promise<FastifyInstance> => {
  const app: FastifyInstance = fastify({
    logger: {
      level: opts.logLevel ?? config.logLevel,
    },
    bodyLimit: config.fastify.requestBodySizeLimit,
    connectionTimeout: config.fastify.connectionTimeout,
    keepAliveTimeout: config.fastify.keepAliveTimeout,
  }).withTypeProvider<TypeBoxTypeProvider>();

  // Registers external plugins.
  await app.register(fastifyAutoload, {
    dir: path.join(import.meta.dirname, "plugins/external"),
  });

  // Registers app plugins.
  await app.register(fastifyAutoload, {
    dir: path.join(import.meta.dirname, "plugins/app"),
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
