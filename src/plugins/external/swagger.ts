import fp from "fastify-plugin";

export default fp(async (fastify) => {
  await fastify.register(import("@fastify/swagger"), {
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
  await fastify.register(import("@fastify/swagger-ui"), {
    routePrefix: "/docs",
    uiConfig: {
      docExpansion: "full",
      deepLinking: true,
    },
  });
});
