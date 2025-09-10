import { type SchemaTypeDefinition } from 'sanity'

// Document schemas
import { area } from './documents/area'
import { property } from './documents/property'
import { collection } from './documents/collection'
import { agent } from './documents/agent'

// Object schemas
import { amenities } from './objects/amenities'
import { availability } from './objects/availability'
import { location } from './objects/location'
import { pricing } from './objects/pricing'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [
    // Documents
    property,
    area,
    collection,
    agent,
    
    // Objects
    amenities,
    availability,
    location,
    pricing,
  ],
}
