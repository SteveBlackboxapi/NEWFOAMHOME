import manifest from '../data/imageVariants.json';
import { A } from './assets';

type ImageRecord = { src: string; width: number; height: number; variants: { src: string; width: number }[] };
const images = manifest.images as Record<string, ImageRecord>;
const url = (src: string) => `${A}/${src.replace(/^assets\//, '')}`;
function record(src: string) {
  if (import.meta.env.VITE_PRIVATE_LAB === 'true') return undefined;
  // Never rewrite uploads, blob URLs, or another site's images.
  if (!src.startsWith(`${A}/`)) return undefined;
  return images[`assets/${src.slice(A.length + 1)}`];
}

/** Physical pixel width, also used by the low-priority warm-up queue. */
export function imageSource(src: string, width?: number): string {
  const image = record(src);
  if (!image || !width) return src;
  return url(image.variants.find((variant) => variant.width >= width)?.src || image.src);
}

export function imageSources(src: string): string | undefined {
  const image = record(src);
  if (!image?.variants.length) return undefined;
  return [...image.variants, { src: image.src, width: image.width }]
    .map((variant) => `${url(variant.src)} ${variant.width}w`).join(', ');
}
