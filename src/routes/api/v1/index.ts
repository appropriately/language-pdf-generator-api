import { FastifyInstance, FastifyReply, FastifyRequest } from "fastify";
import { ResponseStandardizer } from "../../../utils/responseStandardizer.js";

export default async function routes(fastify: FastifyInstance): Promise<void> {
  fastify.get("/", async (_request: FastifyRequest, reply: FastifyReply) => {
    ResponseStandardizer.success(
      reply,
      {
        name: "Language PDF Generator API",
        version: process.env.npm_package_version,
      },
      "API is running"
    );
  });
}
