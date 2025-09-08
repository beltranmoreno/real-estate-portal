const { createClient } = require('@sanity/client')
const path = require('path')
const dotenv = require('dotenv')

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

// Configure your Sanity client
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'development',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  apiVersion: '2023-10-01'
})

// Your Unsplash image URLs
const unsplashImageUrls = [
  'https://images.unsplash.com/photo-1516156008625-3a9d6067fab5?w=900&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8aG91c2VzfGVufDB8fDB8fHww',
  'https://images.unsplash.com/photo-1613490493576-7fde63acd811?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8M3x8dmlsbGFzfGVufDB8fDB8fHww',
  'https://images.unsplash.com/photo-1580587771525-78b9dba3b914?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NHx8dmlsbGFzfGVufDB8fDB8fHww',
  'https://images.unsplash.com/photo-1613977257365-aaae5a9817ff?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8NXx8dmlsbGFzfGVufDB8fDB8fHww',
  'https://images.unsplash.com/photo-1582610116397-edb318620f90?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OHx8dmlsbGFzfGVufDB8fDB8fHww',
  'https://images.unsplash.com/photo-1723110994499-df46435aa4b3?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8OXx8dmlsbGFzfGVufDB8fDB8fHww',
  'https://images.unsplash.com/photo-1613977257363-707ba9348227?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTJ8fHZpbGxhc3xlbnwwfHwwfHx8MA%3D%3D',
  'https://images.unsplash.com/photo-1582268611958-ebfd161ef9cf?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MTZ8fHZpbGxhc3xlbnwwfHwwfHx8MA%3D%3D',
  'https://images.unsplash.com/photo-1628870571248-4f5db428986c?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjB8fHZpbGxhc3xlbnwwfHwwfHx8MA%3D%3D',
  'https://images.unsplash.com/photo-1512917774080-9991f1c4c750?w=800&auto=format&fit=crop&q=60&ixlib=rb-4.1.0&ixid=M3wxMjA3fDB8MHxzZWFyY2h8MjF8fHZpbGxhc3xlbnwwfHwwfHx8MA%3D%3D'
]

function getRandomElement(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function getRandomNumber(min, max) {
  return Math.floor(Math.random() * (max - min + 1)) + min
}

async function uploadImageFromUrl(imageUrl, filename) {
  try {
    // Download image from URL
    const response = await fetch(imageUrl)
    if (!response.ok) {
      throw new Error(`Failed to fetch image: ${response.statusText}`)
    }
    
    const buffer = await response.arrayBuffer()
    const imageBuffer = Buffer.from(buffer)
    
    // Upload to Sanity
    const asset = await client.assets.upload('image', imageBuffer, {
      filename: filename
    })
    
    return asset._id
  } catch (error) {
    console.error(`Failed to upload image ${filename}:`, error.message)
    return null
  }
}

async function updatePropertyImages() {
  try {
    console.log('🎨 Starting property image update...')
    console.log('📸 Using Unsplash images to update existing properties\n')
    
    // First check total properties
    const totalProperties = await client.fetch(`count(*[_type == "property"])`)
    console.log(`📊 Total properties in database: ${totalProperties}`)
    
    // Fetch all properties without images or with null mainImage
    const properties = await client.fetch(`*[_type == "property" && (!defined(mainImage) || mainImage == null)]`)
    console.log(`🖼️  Properties without images: ${properties.length}`)
    
    if (properties.length === 0) {
      console.log('✅ All properties already have images!')
      return
    }
    
    let updated = 0
    let failed = 0
    
    // Process properties in batches
    const batchSize = 10
    const maxProperties = Math.min(properties.length, 30) // Limit to 30 for testing
    
    for (let i = 0; i < maxProperties; i += batchSize) {
      const batch = properties.slice(i, Math.min(i + batchSize, maxProperties))
      console.log(`\n🔄 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(maxProperties / batchSize)}`)
      
      for (const property of batch) {
        try {
          console.log(`  📷 Updating ${property.title_en || property._id}...`)
          
          // Upload main image
          const mainImageUrl = getRandomElement(unsplashImageUrls)
          const mainImageId = await uploadImageFromUrl(
            mainImageUrl,
            `${property.propertyCode || property._id}-main.jpg`
          )
          
          if (!mainImageId) {
            throw new Error('Failed to upload main image')
          }
          
          // Skip gallery images for now - just upload main image
          const galleryImages = []
          
          // Update the property with images
          await client
            .patch(property._id)
            .set({
              mainImage: {
                _type: 'image',
                asset: {
                  _type: 'reference',
                  _ref: mainImageId
                },
                alt: property.title_en || 'Property Image'
              },
              gallery: galleryImages
            })
            .commit()
          
          updated++
          console.log(`  ✅ Updated ${property.title_en || property._id}`)
          
        } catch (error) {
          failed++
          console.error(`  ❌ Failed to update ${property.title_en || property._id}:`, error.message)
        }
        
        // No delay needed since we're only uploading main images
      }
    }
    
    console.log('\n🎉 Image update completed!')
    console.log(`   📊 Total properties: ${totalProperties}`)
    console.log(`   ✅ Updated: ${updated} properties`)
    console.log(`   ⏭️  Already had images: ${totalProperties - properties.length} properties`)
    console.log(`   ❌ Failed: ${failed} properties`)
    
    if (properties.length > maxProperties) {
      console.log(`   ⚠️  Note: Only updated first ${maxProperties} properties (out of ${properties.length} without images)`)
      console.log(`      Run the script again to update more properties`)
    }
    
    console.log('\n✨ Your properties now have images from Unsplash!')
    console.log('   View them on your frontend at http://localhost:3000')
    
  } catch (error) {
    console.error('❌ Update failed:', error)
    process.exit(1)
  }
}

// Check for required environment variables
if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
  console.error('❌ Missing NEXT_PUBLIC_SANITY_PROJECT_ID environment variable')
  process.exit(1)
}

if (!process.env.SANITY_API_WRITE_TOKEN) {
  console.error('❌ Missing SANITY_API_WRITE_TOKEN environment variable')
  process.exit(1)
}

// Run update
updatePropertyImages()