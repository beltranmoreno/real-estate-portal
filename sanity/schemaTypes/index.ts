import { type SchemaTypeDefinition } from 'sanity'

// Document schemas
import { area } from './documents/area'
import { property } from './documents/property'
import { collection } from './documents/collection'
import { agent } from './documents/agent'
import { infoPage } from './documents/infoPage'
import { golfCourse } from './documents/golfCourse'
import { restaurant } from './documents/restaurant'
import { review } from './documents/review'
import leticiaRecommendation from './documents/leticiaRecommendation'
import featuredMedia from './documents/featuredMedia'
import homepageMediaConfig from './documents/homepageMediaConfig'

// Object schemas
import { amenities } from './objects/amenities'
import { availability } from './objects/availability'
import { location } from './objects/location'
import { pricing } from './objects/pricing'
import { pageBlocks } from './objects/pageBlocks'
import { seo } from './objects/seo'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    // Documents
    property,
    area,
    collection,
    agent,
    infoPage,
    golfCourse,
    restaurant,
    review,
    leticiaRecommendation,
    featuredMedia,
    homepageMediaConfig,

    // Objects
    amenities,
    availability,
    location,
    pricing,
    pageBlocks,
    seo,
  ],
}
