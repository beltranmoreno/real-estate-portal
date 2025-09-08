const { createClient } = require('@sanity/client')
const fs = require('fs')
const path = require('path')
const dotenv = require('dotenv')

// Load environment variables from .env.local
dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

// Configure your Sanity client
const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'your-project-id',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'development',
  token: process.env.SANITY_API_WRITE_TOKEN || 'your-write-token', // You'll need a write token
  useCdn: false,
  apiVersion: '2023-10-01'
})

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

async function processPropertyImages(property) {
  const processedProperty = { ...property }
  
  // Remove temporary URL fields
  const mainImageUrl = property._mainImageUrl
  const galleryUrls = property._galleryUrls || []
  delete processedProperty._mainImageUrl
  delete processedProperty._galleryUrls
  
  // Upload main image
  if (mainImageUrl) {
    const mainImageId = await uploadImageFromUrl(
      mainImageUrl,
      `${property.propertyCode}-main.jpg`
    )
    
    if (mainImageId) {
      processedProperty.mainImage = {
        _type: 'image',
        asset: {
          _type: 'reference',
          _ref: mainImageId
        },
        alt: property.title_en
      }
    }
  }
  
  // Upload gallery images
  if (galleryUrls.length > 0) {
    const processedGallery = []
    
    for (let i = 0; i < galleryUrls.length; i++) {
      const galleryUrl = galleryUrls[i]
      const galleryImageId = await uploadImageFromUrl(
        galleryUrl,
        `${property.propertyCode}-gallery-${i + 1}.jpg`
      )
      
      if (galleryImageId) {
        processedGallery.push({
          _type: 'image',
          asset: {
            _type: 'reference',
            _ref: galleryImageId
          },
          alt: `${property.title_en} - Gallery ${i + 1}`
        })
      }
      
      // Small delay to avoid rate limiting
      await new Promise(resolve => setTimeout(resolve, 200))
    }
    
    processedProperty.gallery = processedGallery
  }
  
  return processedProperty
}

async function importData() {
  try {
    console.log('🚀 Starting data import to Sanity...')
    
    const dataDir = path.join(__dirname, 'test-data')
    
    // Check if data files exist
    const areasFile = path.join(dataDir, 'areas.json')
    const propertiesFile = path.join(dataDir, 'properties.json')
    
    if (!fs.existsSync(areasFile) || !fs.existsSync(propertiesFile)) {
      console.error('❌ Test data files not found. Please run generate-test-properties.js first.')
      process.exit(1)
    }
    
    // Load data
    const areas = JSON.parse(fs.readFileSync(areasFile, 'utf8'))
    const properties = JSON.parse(fs.readFileSync(propertiesFile, 'utf8'))
    
    console.log(`📊 Found ${areas.length} areas and ${properties.length} properties`)
    
    // Import areas first (as properties reference them)
    console.log('\n📍 Checking and importing areas...')
    let areasImported = 0
    let areasSkipped = 0
    
    for (const area of areas) {
      try {
        // Check if area already exists
        const existingArea = await client.fetch(
          `*[_type == "area" && _id == $id][0]`,
          { id: area._id }
        )
        
        if (existingArea) {
          console.log(`  ⏭️  Skipping existing area: ${area.title_en}`)
          areasSkipped++
        } else {
          await client.createOrReplace(area)
          console.log(`  ✅ Imported area: ${area.title_en}`)
          areasImported++
        }
      } catch (error) {
        console.error(`  ❌ Failed to import area ${area.title_en}:`, error.message)
      }
    }
    console.log(`✅ Areas: ${areasImported} imported, ${areasSkipped} skipped (already existed)`)
    
    // Import properties with image processing
    console.log('\n🏠 Importing properties with images...')
    console.log('📸 This will upload images from Unsplash URLs - it may take a few minutes...\n')
    
    // Process properties in batches to avoid overwhelming the API
    const batchSize = 3 // Smaller batch size when uploading images
    const processedProperties = []
    
    for (let i = 0; i < properties.length; i += batchSize) {
      const batch = properties.slice(i, i + batchSize)
      console.log(`🔄 Processing batch ${Math.floor(i / batchSize) + 1}/${Math.ceil(properties.length / batchSize)}`)
      
      for (const property of batch) {
        try {
          console.log(`  📷 Processing ${property.title_en}...`)
          // Process property with image uploads
          const processedProperty = await processPropertyImages(property)
          processedProperties.push(processedProperty)
          console.log(`  ✅ Processed ${property.title_en}`)
          
        } catch (error) {
          console.error(`  ❌ Error processing property ${property.propertyCode}:`, error.message)
          // Add property without images if upload fails
          const cleanProperty = { ...property }
          delete cleanProperty._mainImageUrl
          delete cleanProperty._galleryUrls
          processedProperties.push(cleanProperty)
        }
      }
    }
    
    // Import all processed properties
    console.log(`\n📤 Uploading ${processedProperties.length} properties to Sanity...`)
    
    // Import in smaller batches to avoid timeouts
    const importBatchSize = 10
    for (let i = 0; i < processedProperties.length; i += importBatchSize) {
      const batch = processedProperties.slice(i, i + importBatchSize)
      
      try {
        const results = await Promise.all(
          batch.map(property => client.createOrReplace(property))
        )
        console.log(`✅ Imported batch ${Math.floor(i / importBatchSize) + 1}/${Math.ceil(processedProperties.length / importBatchSize)} (${results.length} properties)`)
      } catch (error) {
        console.error(`❌ Error importing batch:`, error.message)
      }
      
      // Small delay between batches
      await new Promise(resolve => setTimeout(resolve, 1000))
    }
    
    console.log('\n🎉 Import completed!')
    console.log(`📍 Areas: ${areasImported} new, ${areasSkipped} existing`)
    console.log(`🏠 Properties imported: ${processedProperties.length}`)
    console.log('🖼️  Images uploaded from Unsplash URLs')
    console.log('\n✨ Your properties are now ready to view on the frontend!')
    
  } catch (error) {
    console.error('❌ Import failed:', error)
    process.exit(1)
  }
}

// Check for required environment variables
if (!process.env.NEXT_PUBLIC_SANITY_PROJECT_ID) {
  console.error('❌ Missing NEXT_PUBLIC_SANITY_PROJECT_ID environment variable')
  process.exit(1)
}

if (!process.env.SANITY_API_WRITE_TOKEN) {
  console.warn('⚠️  No SANITY_API_WRITE_TOKEN found. You\'ll need a write token to import data.')
  console.log('   Get one from: https://sanity.io/manage')
  console.log('   Then set it as an environment variable: SANITY_API_WRITE_TOKEN=your_token')
}

// Run import
importData()