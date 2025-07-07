import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { Pdf, PdfPost } from "../../../schemas/pdf.js";
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
  const pdfJobs: Map<string, Pdf> = new Map();

  const create = async (data: PdfPost): Promise<Pdf> => {
    const job: Pdf = {
      ...data,
      id: crypto.randomUUID(),
      status: "pending",
    };
    pdfJobs.set(job.id, job);

    // TODO: Build a more robust job queue system.
    const processJob = async (job: Pdf): Promise<void> => {
      try {
        job = {
          ...job,
          status: "processing",
          fileName: `${job.id}.pdf`,
        };
        pdfJobs.set(job.id, job);

        const filePath = await createPdf(job);
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
  }
);
