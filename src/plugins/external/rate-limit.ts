import fp from "fastify-plugin";

export default fp(async (fastify) => {
  await fastify.register(import("@fastify/rate-limit"), {
    max: 100,
    timeWindow: "15 minutes",
  });
});
