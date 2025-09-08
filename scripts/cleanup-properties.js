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

async function cleanupProperties() {
  try {
    console.log('🧹 Starting property cleanup...')
    
    // Fetch all properties
    const properties = await client.fetch(`*[_type == "property"]`)
    console.log(`📊 Found ${properties.length} properties to delete`)
    
    if (properties.length === 0) {
      console.log('✅ No properties to delete')
      return
    }
    
    // Delete properties one by one to handle errors
    let deleted = 0
    let skipped = 0
    
    for (const property of properties) {
      try {
        await client.delete(property._id)
        deleted++
        console.log(`  ✅ Deleted: ${property.title_en || property._id}`)
      } catch (error) {
        if (error.statusCode === 409) {
          // Has references, skip it
          console.log(`  ⏭️  Skipped (has references): ${property.title_en || property._id}`)
          skipped++
        } else {
          console.error(`  ❌ Error deleting ${property._id}:`, error.message)
        }
      }
    }
    
    console.log(`\n🎉 Cleanup completed!`)
    console.log(`   Deleted: ${deleted} properties`)
    console.log(`   Skipped: ${skipped} properties (had references)`)
    console.log('\n   You can now run: npm run generate-test-data')
    console.log('   Then run: npm run import-test-data')
    
  } catch (error) {
    console.error('❌ Cleanup failed:', error)
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

// Run cleanup
cleanupProperties()