import { FastifyInstance } from "fastify";
import fs from "fs";
import os from "os";
import path from "path";
import PDFDocument from "pdfkit";
import { Pdf } from "../../../schemas/pdf.js";
import { addComponentToDocument } from "./components.js";
import { getFont } from "./fonts.js";

const BASE_FONT_SIZE = 12;

/**
 * Creates a PDF document and returns the file path
 * @param pdf - The PDF object
 * @returns The file path of the created PDF
 */
export const createPdf = async (
  fastify: FastifyInstance,
  pdf: Pdf
): Promise<string> => {
  const aiManager = fastify.aiManager;

  const doc = new PDFDocument({
    size: "A4",
    margins: {
      top: 50,
      bottom: 50,
      left: 50,
      right: 50,
    },
  });

  const filePath = path.join(os.tmpdir(), pdf.fileName!);
  const stream = fs.createWriteStream(filePath);

  doc.pipe(stream);

  const font = getFont("dejavu-sans");
  if (!font) throw new Error("Font not found");

  doc.font(font);
  doc.fontSize(BASE_FONT_SIZE);

  if (!pdf.skipAi) {
    const components = await aiManager.generateComponents(pdf);
    if (!components) throw new Error("Failed to generate PDF content");

    fastify.log.debug(JSON.stringify(components, null, 2));

    for (const component of components)
      addComponentToDocument(doc, component, pdf.debug);
  }

  doc.end();

  fastify.log.debug("Document created");

  return new Promise((resolve, reject) => {
    stream.on("finish", () => {
      fastify.log.debug("Document finished");
      resolve(filePath);
    });
    stream.on("error", (error) => {
      reject(error);
    });
  });
};
