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
