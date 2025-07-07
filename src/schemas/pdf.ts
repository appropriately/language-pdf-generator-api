import { Static, Type } from "@fastify/type-provider-typebox";
import { IdSchema } from "./common.js";
import { ComponentSchema } from "./components.js";

export const PdfPostSchema = Type.Object({
  components: Type.Array(ComponentSchema),
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
  status: (typeof PdfJobStatusEnum)[keyof typeof PdfJobStatusEnum];
  error?: string;
  filePath?: string;
  fileName?: string;
  components: Static<typeof ComponentSchema>[];
};

export const PdfResponseSchema = Type.Object({
  id: IdSchema,
  status: PdfJobStatusEnumSchema,
  error: Type.Optional(ErrorSchema),
  fileName: Type.Optional(NameSchema),
});
