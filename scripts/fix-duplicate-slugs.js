const { createClient } = require('@sanity/client')
const dotenv = require('dotenv')
const path = require('path')

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

// Configure your Sanity client
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  useCdn: false,
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_WRITE_TOKEN
})

function generateSlug(title, propertyCode) {
  const baseSlug = title
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, '')
    .replace(/\s+/g, '-')
    .replace(/-+/g, '-')
    .trim()
  
  // Add property code to ensure uniqueness
  return `${baseSlug}-${propertyCode.toLowerCase()}`
}

async function fixDuplicateSlugs() {
  try {
    console.log('🔍 Fetching all properties...')
    
    // Fetch all properties with their current slugs and property codes
    const properties = await client.fetch(`
      *[_type == "property"] {
        _id,
        title_en,
        propertyCode,
        "currentSlug": slug.current
      }
    `)
    
    console.log(`📋 Found ${properties.length} properties`)
    
    // Check for duplicate slugs
    const slugCounts = {}
    properties.forEach(prop => {
      const slug = prop.currentSlug
      slugCounts[slug] = (slugCounts[slug] || 0) + 1
    })
    
    const duplicates = Object.keys(slugCounts).filter(slug => slugCounts[slug] > 1)
    console.log(`⚠️  Found ${duplicates.length} duplicate slugs:`)
    duplicates.forEach(slug => {
      console.log(`  - "${slug}" (${slugCounts[slug]} times)`)
    })
    
    if (duplicates.length === 0) {
      console.log('✅ No duplicate slugs found!')
      return
    }
    
    // Update all properties with new unique slugs
    console.log('🔧 Updating all property slugs...')
    
    for (const property of properties) {
      const newSlug = generateSlug(property.title_en, property.propertyCode)
      console.log(`  ${property._id}: "${property.currentSlug}" → "${newSlug}"`)
      
      try {
        await client.patch(property._id).set({
          slug: {
            _type: 'slug',
            current: newSlug
          }
        }).commit()
      } catch (error) {
        console.error(`❌ Error updating ${property._id}:`, error.message)
      }
    }
    console.log('✅ Successfully updated all property slugs!')
    
    // Verify no duplicates remain
    console.log('🔍 Verifying fix...')
    const updatedProperties = await client.fetch(`
      *[_type == "property"] {
        "slug": slug.current
      }
    `)
    
    const newSlugCounts = {}
    updatedProperties.forEach(prop => {
      const slug = prop.slug
      newSlugCounts[slug] = (newSlugCounts[slug] || 0) + 1
    })
    
    const remainingDuplicates = Object.keys(newSlugCounts).filter(slug => newSlugCounts[slug] > 1)
    
    if (remainingDuplicates.length === 0) {
      console.log('✅ All slugs are now unique!')
    } else {
      console.log(`❌ Still have ${remainingDuplicates.length} duplicate slugs:`)
      remainingDuplicates.forEach(slug => {
        console.log(`  - "${slug}" (${newSlugCounts[slug]} times)`)
      })
    }
    
  } catch (error) {
    console.error('❌ Error fixing duplicate slugs:', error)
  }
}

fixDuplicateSlugs()