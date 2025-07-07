import {
  FastifyPluginAsyncTypebox,
  Type,
} from "@fastify/type-provider-typebox";

const rootSchema = {
  response: {
    200: Type.Object({
      name: Type.String(),
      version: Type.String(),
    }),
  },
};

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  fastify.get(
    "/",
    {
      schema: rootSchema,
    },
    async () => ({
      name: "Language PDF Generator API",
      version: process.env.npm_package_version || "unknown",
    })
  );
};

export default plugin;
