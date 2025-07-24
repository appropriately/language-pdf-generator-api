import path from "path";

const FONTS = {
  "dejavu-sans": {
    path: path.join(import.meta.dirname, "dejavu-sans", "DejaVuSans.ttf"),
  },
};

export const getFont = (font: keyof typeof FONTS): string | undefined => {
  return FONTS[font]?.path;
};

export { FONTS };
