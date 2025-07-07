import fs from "fs";
import os from "os";
import path from "path";
import PDFDocument from "pdfkit";
import { Pdf } from "../../../schemas/pdf.js";

/**
 * Creates a PDF document and returns the file path
 * @param pdf - The PDF object
 * @returns The file path of the created PDF
 */
export const createPdf = async (pdf: Pdf): Promise<string> => {
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

  doc.fontSize(25).text("Basic PDF", { align: "center" });

  doc.addPage();

  for (const component of pdf.components) {
    switch (component.type) {
      case "header":
        doc.fontSize(25).text(component.text, { align: component.align });
        if (component.level === 1)
          doc.outline.addItem(component.text, { expanded: true });
        break;

      case "text":
        doc.fontSize(12).text(component.text);
        break;

      case "table":
        const data = [];
        if (component.headers) data.push(component.headers);
        for (const row of component.rows) data.push(row);

        doc.table({
          data,
          rowStyles: (i) => {
            if (component.headers && i === 0) {
              return {
                fontSize: 12,
                border: {
                  bottom: 2,
                },
                borderColor: {
                  bottom: "black",
                },
              };
            }
          },
        });

        break;
    }
  }

  doc.end();

  return new Promise((resolve, reject) => {
    stream.on("finish", () => {
      resolve(filePath);
    });
    stream.on("error", (error) => {
      reject(error);
    });
  });
};
