import { Static, Type } from "@fastify/type-provider-typebox";
import { GoogleGenAI } from "@google/genai";
import { Value } from "@sinclair/typebox/value";
import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { config } from "../../../config/index.js";
import { Component, ComponentSchema, ComponentType, QuestionSchema } from "../../../schemas/components.js";
import { PdfPost } from "../../../schemas/pdf.js";
import { generatePrompt } from "./utils.js";

interface AiManager {
  setModel: (model: string) => void;
  generateComponents: (
    body: PdfPost,
  ) => Promise<Component[] | undefined>;
}

declare module "fastify" {
  interface FastifyInstance {
    aiManager: AiManager;
  }
}

export function createAiManager(fastify: FastifyInstance): AiManager {
  let geminiModel = "gemini-2.0-flash-001";

  const client = new GoogleGenAI({ apiKey: config.gemini.apiKey });

  return {
    setModel: (model: string): void => {
      geminiModel = model;
    },
    generateComponents: async (
      body: PdfPost
    ): Promise<Component[] | undefined> => {
      const response = await client.models.generateContent({
        model: geminiModel,
        config: {
          responseMimeType: "application/json",
          responseSchema: Type.Array(ComponentSchema),
        },
        contents: [
          {
            role: "user",
            parts: [
              {
                text: generatePrompt(
                  body.originalLanguage,
                  body.targetLanguage,
                  body.level,
                  body.prompt ? `The prompt is: ${body.prompt}` : ""
                ),
              },
            ],
          },
        ],
      });

      fastify.log.debug("AI response: %s", response.text);
      if (!response.text) return undefined;

      // Because AI works on pure vibes and can't be trusted, we need to perform some manual validation
      // and clean up.
      const components = (JSON.parse(response.text) as Component[]).filter(
        (component) => {
          switch (component.type) {
            case ComponentType.Question:
              const question = component as Static<typeof QuestionSchema>;
              return question.answer && question.answer.trim() !== "";
            default:
              return true;
          }
        }
      );

      Value.Parse(Type.Array(ComponentSchema), components);
      return components;
    },
  };
}

export default fp(
  async function (fastify: FastifyInstance) {
    const aiManager = createAiManager(fastify);
    fastify.decorate("aiManager", aiManager);
  },
  {
    name: "ai-manager",
  }
);
