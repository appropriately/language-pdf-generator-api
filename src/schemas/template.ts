import { Static, Type } from "@sinclair/typebox";
import { UUIDSchema } from "./common.js";
import { FONTS } from "../utils/fonts/index.js";

const TemplateNameSchema = Type.String({
  description: "The name of the template",
  minLength: 1,
  maxLength: 255,
});

const TemplateDescriptionSchema = Type.String({
  description: "The description of the template",
  minLength: 1,
  maxLength: 1024,
});

const TemplateSizeSchema = Type.String({
  description: "The size of the template",
  default: "A4",
  enum: ["A4", "A3", "A2", "A1", "A0"],
});

const TemplateFontSchema = Type.String({
  description: "The font to use for the template",
  default: "dejavu-sans",
  enum: Object.keys(FONTS),
});

const TemplateFontSizeSchema = Type.Number({
  description: "The font size to use for the template",
  default: 12,
  minimum: 6,
  maximum: 24,
});

export const TemplateMarginsSchema = Type.Object(
  {
    top: Type.Number({
      description: "The top margin to use for the template",
      default: 50,
    }),
    bottom: Type.Number({
      description: "The bottom margin to use for the template",
      default: 50,
    }),
    left: Type.Number({
      description: "The left margin to use for the template",
      default: 50,
    }),
    right: Type.Number({
      description: "The right margin to use for the template",
      default: 50,
    }),
  },
  {
    default: {
      top: 50,
      bottom: 50,
      left: 50,
      right: 50,
    },
  }
);

export const TemplateSchema = Type.Object({
  id: UUIDSchema,
  name: TemplateNameSchema,
  description: TemplateDescriptionSchema,
  font: TemplateFontSchema,
  fontSize: TemplateFontSizeSchema,
  margins: TemplateMarginsSchema,
  size: TemplateSizeSchema,
  createdAt: Type.String({
    description: "The date and time the template was created",
    format: "date-time",
  }),
  updatedAt: Type.String({
    description: "The date and time the template was updated",
    format: "date-time",
  }),
});

export type Template = Static<typeof TemplateSchema>;

export const TemplatePostSchema = Type.Object({
  name: TemplateNameSchema,
  description: TemplateDescriptionSchema,
  font: TemplateFontSchema,
  fontSize: TemplateFontSizeSchema,
  margins: TemplateMarginsSchema,
  size: TemplateSizeSchema,
});

export type TemplatePost = Static<typeof TemplatePostSchema>;
