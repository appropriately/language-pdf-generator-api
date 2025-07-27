import {
  FastifyPluginAsyncTypebox,
  Type,
} from "@fastify/type-provider-typebox";
import { ErrorSchema, UUIDSchema } from "../../../../schemas/common.js";
import {
  TemplatePostSchema,
  TemplateSchema,
} from "../../../../schemas/template.js";

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { templateManager } = fastify;

  fastify.get(
    "/",
    {
      schema: {
        description: "Get all templates",
        tags: ["template"],
        response: {
          200: Type.Array(TemplateSchema),
        },
      },
    },
    async () => {
      return templateManager.getAll();
    }
  );

  fastify.post(
    "/",
    {
      schema: {
        description: "Create a new template",
        tags: ["template"],
        body: TemplatePostSchema,
        response: {
          201: Type.Object({
            id: UUIDSchema,
          }),
        },
      },
    },
    async (request, reply) => {
      const template = await templateManager.create(request.body);
      reply.code(201);
      return template;
    }
  );

  fastify.get(
    "/:id",
    {
      schema: {
        description: "Get a template by id",
        tags: ["template"],
        params: Type.Object({
          id: UUIDSchema,
        }),
        response: {
          200: TemplateSchema,
          404: ErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      const template = templateManager.get(id);
      if (!template) {
        reply.code(404);
        return { error: "Template not found" };
      }

      return template.template;
    }
  );

  fastify.delete(
    "/:id",
    {
      schema: {
        description: "Delete a template by id",
        tags: ["template"],
        params: Type.Object({
          id: UUIDSchema,
        }),
        response: {
          204: Type.Null(),
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      templateManager.delete(id);
      reply.code(204);
    }
  );
};

export default plugin;
