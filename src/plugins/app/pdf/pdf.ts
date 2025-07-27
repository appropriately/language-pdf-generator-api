import { Static } from "@sinclair/typebox";
import { FastifyInstance } from "fastify";
import fs from "fs";
import os from "os";
import path from "path";
import { ComponentType, QuestionSchema } from "../../../schemas/components.js";
import { Pdf } from "../../../schemas/pdf.js";
import { TemplateHandler } from "../template/template.js";
import { addAnswerToDocument, addComponentToDocument } from "./components.js";

/**
 * Creates a PDF document and returns the file path
 * @param pdf - The PDF object
 * @param template - The template object
 * @returns The file path of the created PDF
 */
export const createPdf = async (
  fastify: FastifyInstance,
  pdf: Pdf,
  template: TemplateHandler
): Promise<string> => {
  const aiManager = fastify.aiManager;

  const doc = template.newDocument();

  const filePath = path.join(os.tmpdir(), pdf.fileName!);
  const stream = fs.createWriteStream(filePath);

  doc.pipe(stream);

  if (!pdf.skipAi) {
    const components = await aiManager.generateComponents(pdf);
    if (!components) throw new Error("Failed to generate PDF content");

    fastify.log.debug(JSON.stringify(components, null, 2));

    for (const component of components)
      addComponentToDocument(doc, template, component, pdf.debug);

    const answers = components.filter(
      ({ type }) => type === ComponentType.Question
    ) as Static<typeof QuestionSchema>[];

    if (answers.length > 0) {
      addComponentToDocument(
        doc,
        template,
        {
          type: ComponentType.NewPage,
        },
        pdf.debug
      );

      addComponentToDocument(
        doc,
        template,
        {
          type: ComponentType.Header,
          text: "Answers",
          level: 2,
        },
        pdf.debug
      );

      for (const answer of answers) addAnswerToDocument(doc, answer);
    }
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
