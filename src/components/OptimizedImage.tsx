import type { ComponentPropsWithRef } from 'react';
import { imageSources } from '../lib/imageAssets';
import { useWebsiteImageResolver } from './WebsiteImageScope';

export type WebsiteImageProps = ComponentPropsWithRef<'img'> & { section?: string };

/** Resolve this placement before selecting its responsive variants. */
export function OptimizedImage({ src, section, sizes = '(max-width: 700px) 90vw, 640px', srcSet, decoding = 'async', ...props }: WebsiteImageProps) {
  const resolve = useWebsiteImageResolver(section);
  const resolved = src ? resolve(src) : src;
  return <img {...props} src={resolved} srcSet={srcSet || (resolved ? imageSources(resolved) : undefined)} sizes={sizes} decoding={decoding} />;
}
