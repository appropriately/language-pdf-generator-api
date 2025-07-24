import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { Pdf, PdfPost } from "../../../schemas/pdf.js";
import { LANGUAGES } from "../../../utils/languages.js";
import { createPdf } from "./pdf.js";

interface PdfManager {
  get: (id: string) => Pdf | undefined;
  getAll: () => Pdf[];
  create: (data: PdfPost) => Promise<Pdf>;
  delete: (id: string) => void;
}

declare module "fastify" {
  interface FastifyInstance {
    pdfManager: PdfManager;
  }
}

export function createPdfManager(fastify: FastifyInstance): PdfManager {
  const { templateManager } = fastify;

  const pdfJobs: Map<string, Pdf> = new Map();

  const create = async (data: PdfPost): Promise<Pdf> => {
    const job: Pdf = {
      ...data,
      id: crypto.randomUUID(),
      status: "pending",
      originalLanguage: data.originalLanguage as keyof typeof LANGUAGES,
      targetLanguage: data.targetLanguage as keyof typeof LANGUAGES,
    };
    pdfJobs.set(job.id, job);

    // TODO: Build a more robust job queue system.
    const processJob = async (job: Pdf): Promise<void> => {
      try {
        const name = `${LANGUAGES[job.targetLanguage]} - ${job.level.charAt(0).toUpperCase() + job.level.slice(1)}`;

        job = {
          ...job,
          status: "processing",
          fileName: `${name.toLowerCase().replace(/\s+/g, "")}.pdf`,
          name,
        };
        pdfJobs.set(job.id, job);

        const template = templateManager.get(job.templateId);
        if (!template) throw new Error("Template not found");

        const filePath = await createPdf(fastify, job, template);
        job = {
          ...job,
          status: "completed",
          filePath,
        };
        pdfJobs.set(job.id, job);
      } catch (error) {
        pdfJobs.set(job.id, {
          ...job,
          status: "failed",
          error: error instanceof Error ? error.message : "Unknown error",
        });
        throw error;
      }
    };

    processJob(job).catch((error) => {
      fastify.log.error(`Error processing PDF job ${job.id}:`, error);
      fastify.log.debug(error.stack);
    });

    return job;
  };

  return {
    get: (id: string) => pdfJobs.get(id),
    getAll: () => Array.from(pdfJobs.values()),
    create,
    delete: (id: string) => pdfJobs.delete(id),
  };
}

export default fp(
  async function (fastify: FastifyInstance) {
    const pdfManager = createPdfManager(fastify);
    fastify.decorate("pdfManager", pdfManager);
  },
  {
    name: "pdf-manager",
    dependencies: ["ai-manager", "template-manager"],
  }
);
