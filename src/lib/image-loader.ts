"use client";

/**
 * next/image loader. Unsplash's CDN resizes and re-encodes on the fly, so we
 * ask it for the exact width instead of proxying through the Next optimizer.
 * Local /public images are served as-is.
 */
export default function imageLoader({ src, width, quality }: { src: string; width: number; quality?: number }) {
  if (src.startsWith("https://images.unsplash.com/")) {
    const url = new URL(src);
    url.searchParams.set("auto", "format");
    url.searchParams.set("fit", "crop");
    url.searchParams.set("w", String(width));
    url.searchParams.set("q", String(quality ?? 70));
    return url.toString();
  }
  // Width hint keeps next/image happy; static files ignore the query.
  return `${src}?w=${width}`;
}
