import { FastifyInstance } from "fastify";
import {
  ResponseStandardizer,
  SuccessResponse,
  SuccessResponseType,
} from "../../../utils/responseStandardizer.js";

export default async function routes(fastify: FastifyInstance): Promise<void> {
  fastify.get<{ Reply: SuccessResponseType }>(
    "/",
    {
      schema: {
        tags: ["root"],
        response: {
          200: SuccessResponse,
        },
      },
    },
    async (_request, reply) => {
      ResponseStandardizer.success(
        reply,
        {
          name: "Language PDF Generator API",
          version: process.env.npm_package_version,
        },
        "API is running"
      );
    }
  );
}
