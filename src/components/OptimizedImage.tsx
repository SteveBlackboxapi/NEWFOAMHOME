import type { ComponentPropsWithRef } from 'react';
import { imageSources } from '../lib/imageAssets';

/** Native responsive selection retains the original image as a safe fallback. */
export function OptimizedImage({ src, sizes = '(max-width: 700px) 90vw, 640px', srcSet, decoding = 'async', ...props }: ComponentPropsWithRef<'img'>) {
  return <img {...props} src={src} srcSet={srcSet || (src ? imageSources(src) : undefined)} sizes={sizes} decoding={decoding} />;
}
