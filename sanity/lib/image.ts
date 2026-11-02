import createImageUrlBuilder from '@sanity/image-url'
import { SanityImageSource } from "@sanity/image-url/lib/types/types";

import { dataset, projectId } from '../env'

// https://www.sanity.io/docs/image-url
const builder = createImageUrlBuilder({ projectId, dataset })

export const urlFor = (source: SanityImageSource) => {
  return builder.image(source)
}

/**
 * A photo shown large (heroes, the property gallery, lightboxes). No width cap
 * or crop box: next/image's srcset (see lib/imageLoader.ts) asks Sanity for the
 * width each screen needs, up to the uploaded original (fit=max never
 * upscales), at near-original quality. Only for next/image, which sizes it;
 * a plain <img> would download the original.
 */
export const fullImageUrl = (source: SanityImageSource) =>
  builder.image(source).fit('max').quality(90).url()
