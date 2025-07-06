import fp from "fastify-plugin";
import { config } from "../../config/index.js";

export default fp(async (fastify) => {
  await fastify.register(import("@fastify/cors"), {
    origin: config.cors.origin,
    credentials: config.cors.credentials,
    methods: config.cors.methods,
    allowedHeaders: config.cors.allowedHeaders,
  });
});
