import {
  CAPTION_FONT_OPTIONS,
  type TileCaptionSettings,
} from "../data/stagedTalent";

// Both the SVG preview and PNG export use this 1080px coordinate space.
export const CAPTION_CANVAS_WIDTH = 1080;
export const captionFont = (s: TileCaptionSettings) =>
  `${s.italic ? "italic " : ""}${s.weight} ${s.size * 3.6}px ${CAPTION_FONT_OPTIONS.find((f) => f.id === s.font)!.css}`;

export function captionLayout(
  settings: TileCaptionSettings,
  measure: (text: string) => number,
  metrics: { ascent: number; descent: number },
) {
  const padding = settings.background === "none" ? 0 : settings.padding * 3.6;
  const maxWidth = CAPTION_CANVAS_WIDTH * 0.88 - padding * 2;
  const text = settings.uppercase
    ? settings.text.toLocaleUpperCase()
    : settings.text;
  const lines: string[] = [];
  // Keep intentional newlines; split long URLs/words too so exports cannot overflow.
  for (const paragraph of text.replace(/\r\n?/g, "\n").split("\n")) {
    let line = "";
    for (const word of paragraph.trim().split(/\s+/)) {
      if (line && measure(`${line} ${word}`) > maxWidth) {
        lines.push(line);
        line = "";
      }
      for (const letter of Array.from((line ? " " : "") + word)) {
        if (line && measure(line + letter) > maxWidth) {
          lines.push(line);
          line = "";
        }
        line += letter;
      }
    }
    lines.push(line);
  }
  const widths = lines.map(measure);
  const contentWidth = Math.max(1, ...widths);
  const lineHeight = settings.size * 3.6 * 1.3;
  const width = contentWidth + padding * 2;
  const height = lines.length * lineHeight + padding * 2;
  const baseline =
    (lineHeight - metrics.ascent - metrics.descent) / 2 + metrics.ascent;
  return {
    width,
    height,
    padding,
    lineHeight,
    lines: lines.map((text, index) => {
      const offset =
        settings.align === "left"
          ? 0
          : settings.align === "right"
            ? contentWidth - widths[index]
            : (contentWidth - widths[index]) / 2;
      return {
        text,
        width: widths[index],
        x: padding + offset,
        y: padding + index * lineHeight + baseline,
        top: index * lineHeight,
      };
    }),
  };
}

export function measureCaption(
  ctx: CanvasRenderingContext2D,
  settings: TileCaptionSettings,
) {
  ctx.font = captionFont(settings);
  const metrics = ctx.measureText("Mg");
  return captionLayout(settings, (text) => ctx.measureText(text).width, {
    ascent: metrics.fontBoundingBoxAscent ?? settings.size * 3.6 * 0.8,
    descent: metrics.fontBoundingBoxDescent ?? settings.size * 3.6 * 0.2,
  });
}

export function captionBackgrounds(
  layout: ReturnType<typeof captionLayout>,
  settings: TileCaptionSettings,
) {
  if (settings.background === "none") return [];
  if (settings.background === "box")
    return [{ x: 0, y: 0, width: layout.width, height: layout.height }];
  return layout.lines
    .filter((line) => line.text.trim())
    .map((line) => ({
      x: line.x - layout.padding,
      y: line.top,
      width: line.width + layout.padding * 2,
      height: layout.lineHeight + layout.padding * 2,
    }));
}

export function captionPosition(
  center: number,
  extent: number,
  available: number,
) {
  return Math.max(
    extent / 2,
    Math.min(available - extent / 2, (available * center) / 100),
  );
}
