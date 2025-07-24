import { FastifyInstance } from "fastify";
import fp from "fastify-plugin";
import { Template, TemplatePost } from "../../../schemas/template.js";
import { TemplateHandler } from "./template.js";

interface TemplateManager {
  get: (id: string) => TemplateHandler | undefined;
  getAll: () => Template[];
  create: (data: TemplatePost) => Promise<Template>;
  delete: (id: string) => void;
}

declare module "fastify" {
  interface FastifyInstance {
    templateManager: TemplateManager;
  }
}

export function createTemplateManager(): TemplateManager {
  const templates: Map<string, Template> = new Map();

  const get = (id: string): TemplateHandler | undefined => {
    const template = templates.get(id);
    if (!template) return undefined;
    return new TemplateHandler(template);
  };

  const create = async (data: TemplatePost): Promise<Template> => {
    const template: Template = {
      ...data,
      id: crypto.randomUUID(),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    templates.set(template.id, template);

    return template;
  };

  return {
    get,
    getAll: () => Array.from(templates.values()),
    create,
    delete: (id: string) => templates.delete(id),
  };
}

export default fp(
  async function (fastify: FastifyInstance) {
    const templateManager = createTemplateManager();
    fastify.decorate("templateManager", templateManager);
  },
  {
    name: "template-manager",
  }
);
