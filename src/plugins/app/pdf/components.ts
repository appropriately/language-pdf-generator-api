import { Static } from "@fastify/type-provider-typebox";
import {
  Component,
  ComponentType,
  HeaderComponentSchema,
  QuestionSchema,
  SpacingComponentSchema,
  TableComponentSchema,
  TextComponentSchema,
} from "../../../schemas/components.js";
import { TemplateHandler } from "../template/template.js";

export const addAnswerToDocument = (
  doc: PDFKit.PDFDocument,
  component: Static<typeof QuestionSchema>
): void => {
  doc.text(component.text);
  doc.moveDown(0.25);

  doc.table({
    data: [
      [
        {
          text: component.answer,
          padding: "0.75em",
        },
      ],
    ],
    rowStyles: () => ({
      border: [0, 0, 0, 0],
      backgroundColor: "#f0f0f0",
    }),
  });

  doc.moveDown();
};

export const addComponentToDocument = (
  doc: PDFKit.PDFDocument,
  template: TemplateHandler,
  component: Component,
  debug = false
): void => {
  switch (component.type) {
    case ComponentType.NewPage:
      doc.addPage();
      break;

    case ComponentType.Spacing:
      const spacing = component as Static<typeof SpacingComponentSchema>;
      doc.moveDown(spacing.height);
      break;

    case ComponentType.Header:
      const header = component as Static<typeof HeaderComponentSchema>;

      switch (header.level) {
        case 1:
          doc.fontSize(template.template.fontSize * 2);
          break;
        case 2:
          doc.fontSize(template.template.fontSize * 1.5);
          break;
        case 3:
          doc.fontSize(template.template.fontSize * 1.35);
          break;
        case 4:
          doc.fontSize(template.template.fontSize * 1.2);
          break;
        case 5:
          doc.fontSize(template.template.fontSize * 1.1);
          break;
      }

      doc.text(header.text, {
        align: header.align as "left" | "center" | "right",
      });

      doc.fontSize(template.template.fontSize);

      if (header.level === 1)
        doc.outline.addItem(header.text, { expanded: true });

      doc.moveDown();

      break;

    case ComponentType.Text:
      const text = component as Static<typeof TextComponentSchema>;
      doc.text(text.text);
      doc.moveDown();
      break;

    case ComponentType.Table:
      const table = component as Static<typeof TableComponentSchema>;
      const data = [];
      if (table.headers) data.push(table.headers);
      for (const row of table.rows) data.push(row);

      doc.table({
        data,
        rowStyles: (i) => {
          return i < 1
            ? { border: [0, 0, 2, 0], borderColor: "black" }
            : { border: [0, 0, 1, 0], borderColor: "#aaa" };
        },
      });
      doc.moveDown();

      break;

    case ComponentType.Question:
      const question = component as Static<typeof QuestionSchema>;

      doc.text(question.text);
      doc.moveDown(0.25);

      if (question.hint) {
        doc.fontSize(8).text(question.hint);
        doc.moveDown(0.25);
        doc.fontSize(template.template.fontSize);
      }

      doc.table({
        data: [
          [
            {
              text: "",
              padding: "1.25em",
            },
          ],
        ],
        rowStyles: () => ({
          border: [0, 0, 0, 0],
          backgroundColor: "#f0f0f0",
        }),
      });

      doc.moveDown();
      break;
  }

  if (debug) {
    doc.fontSize(8);
    doc.table({
      data: [[JSON.stringify(component, null, 2)]],
    });
    doc.fontSize(template.template.fontSize);
  }
};
