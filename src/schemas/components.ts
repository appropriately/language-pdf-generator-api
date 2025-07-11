// TODO: Type.Enum breaks switching, but Type.Literal doesn't work with gemini response schema. Fix this.
import { Static, Type } from "@fastify/type-provider-typebox";

export enum ComponentType {
  Header = "header",
  Text = "text",
  Table = "table",
  NewPage = "newPage",
  Question = "question",
  Spacing = "spacing",
}

export const QuestionSchema = Type.Object(
  {
    type: Type.String({
      enum: Object.values(ComponentType),
      default: ComponentType.Question,
      description:
        "The type of component - must be 'question' for question components",
    }),
    id: Type.String({
      description:
        "A required unique identifier for the question. This should be a short, descriptive name that identifies the question (e.g., 'hello_translation', 'sentence_translation').",
    }),
    text: Type.String({
      description:
        "The question text that will be displayed to the user. This should be a clear, concise question that expects a single answer. Examples: 'How would you say 'hello' in Romanian?', 'Translate the following sentence into Romanian: 'I am a student.'",
    }),
    hint: Type.Optional(
      Type.String({
        description:
          "An optional hint or help text that provides additional guidance to the user about how to answer the question. This can include examples, clarification, or instructions.",
      })
    ),
    answer: Type.String({
      description:
        "The answer to the question. This should be the actual answer value, not placeholder text. For example, if the question is 'How do you say 'hello' in Romanian?', the answer might be 'Salut!'.",
    }),
  },
  {
    description:
      "A question component that displays a question to the user and stores the answer. Questions are used to collect information from users that will be included in the generated PDF.",
  }
);

export const HeaderComponentSchema = Type.Object(
  {
    type: Type.String({
      enum: Object.values(ComponentType),
      default: ComponentType.Header,
      description:
        "The type of component - must be 'header' for header components",
    }),
    text: Type.String({
      description:
        "The header text to display. This should be a concise, descriptive title that clearly indicates the section or content that follows.",
    }),
    align: Type.Optional(
      Type.String({
        enum: ["left", "center", "right"],
        default: "left",
        description:
          "The text alignment for the header. 'left' is the default alignment, 'center' centers the text, and 'right' aligns the text to the right.",
      })
    ),
    level: Type.Number({
      description:
        "The header level (1-6), where 1 is the largest and most prominent header, 2 is a sub-header, and so on. Use level 1 for main section titles, level 2 for subsections, etc.",
      minimum: 1,
      maximum: 6,
    }),
  },
  {
    description:
      "A header component that displays a title or section heading in the PDF. Headers help organize content and provide visual hierarchy to the document.",
  }
);

export const TextComponentSchema = Type.Object(
  {
    type: Type.String({
      enum: Object.values(ComponentType),
      default: ComponentType.Text,
      description: "The type of component - must be 'text' for text components",
    }),
    text: Type.String({
      description:
        "The text content to display. This can be a paragraph, sentence, or any text content that should appear in the PDF. The text will be formatted as a regular paragraph.",
    }),
  },
  {
    description:
      "A text component that displays regular paragraph text in the PDF. This is used for body content, descriptions, explanations, or any general text content.",
  }
);

export const TableComponentSchema = Type.Object(
  {
    type: Type.String({
      enum: Object.values(ComponentType),
      default: ComponentType.Table,
      description:
        "The type of component - must be 'table' for table components",
    }),
    headers: Type.Optional(
      Type.Array(
        Type.String({
          description:
            "The column headers for the table. Each string represents the header text for a column. If not provided, the table will have no headers.",
        })
      )
    ),
    rows: Type.Array(Type.Array(Type.String()), {
      description:
        "The table data as a 2D array. Each inner array represents a row, and each string in the row represents a cell value. All rows should have the same number of columns.",
    }),
  },
  {
    description:
      "A table component that displays tabular data in the PDF. Tables are useful for presenting structured data, comparisons, or organized information in a grid format.",
  }
);

export const NewPageComponentSchema = Type.Object(
  {
    type: Type.String({
      enum: Object.values(ComponentType),
      default: ComponentType.NewPage,
      description:
        "The type of component - must be 'newPage' for new page components",
    }),
  },
  {
    description:
      "A new page component that forces a page break in the PDF. This is used to start content on a new page, such as beginning a new section or chapter.",
  }
);

export const SpacingComponentSchema = Type.Object(
  {
    type: Type.String({
      enum: Object.values(ComponentType),
      default: ComponentType.Spacing,
      description:
        "The type of component - must be 'spacing' for spacing components",
    }),
    height: Type.Number({
      description:
        "The height of the spacing in font units, where 1 equals the height of the current font. Use this to add vertical space between components. For example, 0.5 adds half a line of space, 2 adds two lines of space.",
    }),
  },
  {
    description:
      "A spacing component that adds vertical space between other components in the PDF. This is useful for improving layout and readability by adding breathing room between sections.",
  }
);

export const ComponentSchema = Type.Union(
  [
    HeaderComponentSchema,
    TextComponentSchema,
    TableComponentSchema,
    NewPageComponentSchema,
    QuestionSchema,
    SpacingComponentSchema,
  ],
  {
    description:
      "A union of all possible component types that can be included in a PDF. Each component type serves a specific purpose: headers for titles, text for content, tables for data, questions for user input, newPage for page breaks, and spacing for layout.",
  }
);

export type Component = Static<typeof ComponentSchema>;
