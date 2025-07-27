import {
  FastifyPluginAsyncTypebox,
  Type,
} from "@fastify/type-provider-typebox";
import fs from "fs";
import { ErrorSchema, UUIDSchema } from "../../../../schemas/common.js";
import { PdfPostSchema, PdfResponseSchema } from "../../../../schemas/pdf.js";

const plugin: FastifyPluginAsyncTypebox = async (fastify) => {
  const { pdfManager, templateManager } = fastify;

  fastify.get(
    "/",
    {
      schema: {
        description: "Get all PDFs",
        tags: ["pdf"],
        response: {
          200: Type.Array(PdfResponseSchema),
        },
      },
    },
    async () => pdfManager.getAll()
  );

  fastify.post(
    "/",
    {
      schema: {
        description: "Create a new PDF",
        tags: ["pdf"],
        body: PdfPostSchema,
        response: {
          201: Type.Object({
            id: UUIDSchema,
          }),
          404: ErrorSchema,
        },
      },
    },
    async (request, reply) => {
      if (request.body.templateId) {
        const template = templateManager.get(request.body.templateId);
        if (!template) {
          reply.code(404);
          return { error: "Template not found" };
        }
      }

      const job = await pdfManager.create({
        ...request.body,
      });
      reply.code(201);
      return job;
    }
  );

  fastify.get(
    "/:id",
    {
      schema: {
        description: "Get a PDF by id",
        tags: ["pdf"],
        params: Type.Object({
          id: UUIDSchema,
        }),
        response: {
          200: PdfResponseSchema,
          404: ErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;

      const pdf = pdfManager.get(id);
      if (!pdf) {
        reply.code(404);
        return { error: "PDF not found" };
      }

      return pdf;
    }
  );

  fastify.get(
    "/:id/download",
    {
      schema: {
        description: "Download a PDF by id",
        tags: ["pdf"],
        params: Type.Object({
          id: UUIDSchema,
        }),
        response: {
          200: Type.Any(),
          404: ErrorSchema,
          409: ErrorSchema,
        },
      },
    },
    async (request, reply) => {
      const { id } = request.params;
      const pdf = pdfManager.get(id);
      
      if (!pdf) {
        reply.code(404);
        return { error: "PDF not found" };
      }

      if (pdf.status !== "completed") {
        reply.code(409);
        return { error: "PDF is not ready for download yet" };
      }

      if (!pdf.filePath) {
        reply.code(404);
        return { error: "PDF file is missing" };
      }

      if (!fs.existsSync(pdf.filePath)) {
        reply.code(404);
        return { error: "PDF file no longer exists" };
      }

      fastify.log.info(`Downloading PDF ${pdf.id} from ${pdf.filePath}`);

      try {
        const stats = fs.statSync(pdf.filePath);
        if (stats.size === 0) {
          reply.code(404);
          return { error: "PDF file is empty" };
        }

        fastify.log.info(`PDF file size: ${stats.size}`);

        reply.header("Content-Type", "application/pdf");
        reply.header(
          "Content-Disposition",
          `attachment; filename="${pdf.fileName}"`
        );
        reply.header("Content-Length", stats.size.toString());

        const fileBuffer = fs.readFileSync(pdf.filePath);
        reply.send(fileBuffer);

        fs.unlinkSync(pdf.filePath);
      } catch (error) {
        fastify.log.error(`Error reading PDF file: ${error}`);
        reply.code(404);
        return { error: "Error reading PDF file" };
      }
    }
  );

  fastify.delete(
    "/:id",
    {
      schema: {
        description: "Delete a PDF by id",
        tags: ["pdf"],
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
      pdfManager.delete(id);
      reply.code(204);
    }
  );
};

export default plugin;
