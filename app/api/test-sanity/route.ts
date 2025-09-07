import { NextResponse } from 'next/server'
import { client } from '@/sanity/lib/client'

export async function GET() {
  console.log('=== TEST SANITY CONNECTION ===')
  console.log('Project ID:', process.env.NEXT_PUBLIC_SANITY_PROJECT_ID)
  console.log('Dataset:', process.env.NEXT_PUBLIC_SANITY_DATASET)
  
  try {
    // Test 1: Simple count
    const count = await client.fetch(`count(*[_type == "property"])`)
    console.log('Total properties in Sanity:', count)
    
    // Test 2: Get all properties without filters
    const allProperties = await client.fetch(`*[_type == "property"] {
      _id,
      title_en,
      status
    }`)
    console.log('All properties:', allProperties)
    
    // Test 3: Get active properties
    const activeProperties = await client.fetch(`*[_type == "property" && status == "active"] {
      _id,
      title_en,
      status
    }`)
    console.log('Active properties:', activeProperties)
    
    return NextResponse.json({
      success: true,
      totalCount: count,
      allProperties,
      activeProperties,
      activeCount: activeProperties.length
    })
  } catch (error) {
    console.error('Sanity test error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 })
  }
}