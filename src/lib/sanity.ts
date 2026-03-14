import { createClient } from '@sanity/client';

export const sanityClient = createClient({
  projectId: import.meta.env.PUBLIC_SANITY_PROJECT_ID || 'yy21gxjr',
  dataset: import.meta.env.PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: true,
});

// Helper: turn a Sanity image reference into a URL
// Uses the simple image URL pattern — no @sanity/image-url package needed
export function imageUrl(ref: string, projectId: string, dataset: string): string {
  // ref format: "image-{id}-{width}x{height}-{format}"
  const [, id, dimensionStr, format] = ref.split('-');
  const [width, height] = dimensionStr ? dimensionStr.split('x') : ['', ''];
  return `https://cdn.sanity.io/images/${projectId}/${dataset}/${id}-${width}x${height}.${format}`;
}

export function sanityImageUrl(asset: { _ref?: string; url?: string } | null | undefined): string {
  if (!asset) return '';
  if (asset.url) return asset.url;
  if (asset._ref) {
    const projectId = import.meta.env.PUBLIC_SANITY_PROJECT_ID || 'yy21gxjr';
    const dataset = import.meta.env.PUBLIC_SANITY_DATASET || 'production';
    return imageUrl(asset._ref, projectId, dataset);
  }
  return '';
}
