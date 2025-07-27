import { Static, Type } from "@fastify/type-provider-typebox";
import { UUIDSchema } from "./common.js";
import { LANGUAGES } from "../utils/languages.js";

const PdfJobLanguageEnum: Record<string, keyof typeof LANGUAGES> = {
  Romanian: "ro",
  English: "en-gb",
};

const PdfJobLevelEnum = {
  Beginner: "beginner",
  Intermediate: "intermediate",
  Advanced: "advanced",
} as const;

export const PdfPostSchema = Type.Object({
  templateId: Type.Optional(UUIDSchema),
  originalLanguage: Type.Union(
    [
      Type.Literal(PdfJobLanguageEnum.Romanian),
      Type.Literal(PdfJobLanguageEnum.English),
    ],
    {
      default: PdfJobLanguageEnum.English,
    }
  ),
  targetLanguage: Type.Union(
    [
      Type.Literal(PdfJobLanguageEnum.Romanian),
      Type.Literal(PdfJobLanguageEnum.English),
    ],
    {
      default: PdfJobLanguageEnum.Romanian,
    }
  ),
  level: Type.Union([
    Type.Literal(PdfJobLevelEnum.Beginner),
    Type.Literal(PdfJobLevelEnum.Intermediate),
    Type.Literal(PdfJobLevelEnum.Advanced),
  ]),
  prompt: Type.Optional(
    Type.String({
      description: "The prompt for the PDF job",
      examples: [
        "Focus on the following topics: grammar, vocabulary, and pronunciation.",
      ],
    })
  ),
  skipAi: Type.Optional(
    Type.Boolean({
      description: "Whether to skip the AI generation",
      default: false,
    })
  ),
  debug: Type.Optional(
    Type.Boolean({
      description: "Whether to enable debug mode",
      default: false,
    })
  ),
});

export type PdfPost = Static<typeof PdfPostSchema>;

const PdfJobStatusEnum = {
  pending: "pending",
  processing: "processing",
  completed: "completed",
  failed: "failed",
} as const;

const PdfJobStatusEnumSchema = Type.Union(
  [
    Type.Literal(PdfJobStatusEnum.pending),
    Type.Literal(PdfJobStatusEnum.processing),
    Type.Literal(PdfJobStatusEnum.completed),
    Type.Literal(PdfJobStatusEnum.failed),
  ],
  {
    description: "The status of the PDF job",
  }
);

const ErrorSchema = Type.String({
  description: "The error message if the job failed",
});

const NameSchema = Type.String({
  description: "The name of the PDF file",
});

export type Pdf = {
  id: string;
  templateId?: string;
  status: (typeof PdfJobStatusEnum)[keyof typeof PdfJobStatusEnum];
  error?: string;
  filePath?: string;
  name?: string;
  fileName?: string;
  originalLanguage: (typeof PdfJobLanguageEnum)[keyof typeof PdfJobLanguageEnum];
  targetLanguage: (typeof PdfJobLanguageEnum)[keyof typeof PdfJobLanguageEnum];
  level: (typeof PdfJobLevelEnum)[keyof typeof PdfJobLevelEnum];
  prompt?: string;
  skipAi?: boolean;
  debug?: boolean;
};

export const PdfResponseSchema = Type.Object({
  id: UUIDSchema,
  templateId: Type.Optional(UUIDSchema),
  status: PdfJobStatusEnumSchema,
  error: Type.Optional(ErrorSchema),
  name: Type.Optional(NameSchema),
  fileName: Type.Optional(NameSchema),
});
