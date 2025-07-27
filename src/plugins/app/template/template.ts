import PDFDocument from "pdfkit";
import { Template } from "../../../schemas/template.js";
import { FONTS, getFont } from "../../../utils/fonts/index.js";

export class TemplateHandler {
  constructor(public template: Template) {
    this.template = template;
  }

  /**
   * Creates a new PDF document based on the template settings
   * @returns The PDF document
   */
  newDocument(): typeof PDFDocument {
    const document = new PDFDocument({
      size: this.template.size,
      margins: this.template.margins,
    });


    const font = getFont(this.template.font as keyof typeof FONTS);
    if (!font) throw new Error(`Font '${this.template.font}' not found`);

    document.font(font);
    document.fontSize(this.template.fontSize);

    return document;
  }
}

export const DefaultTemplate = new TemplateHandler({
  id: "default",
  name: "Default",
  description: "Default template",
  font: Object.keys(FONTS)[0],
  fontSize: 12,
  size: "A4",
  margins: {
    top: 20,
    bottom: 20,
    left: 20,
    right: 20,
  },
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
});
