import { NextResponse } from 'next/server'
import { createClient } from 'next-sanity'

export async function GET() {
  console.log('=== DIRECT SANITY TEST ===')
  
  // Direct values - no env.ts
  const projectId = 'twkvxngw'
  const dataset = 'development'
  const apiVersion = '2025-09-06'
  
  console.log('Using:', { projectId, dataset, apiVersion })
  
  const directClient = createClient({
    projectId,
    dataset,
    apiVersion,
    useCdn: false,
  })
  
  try {
    // Query 1: All properties including drafts
    const allQuery = `*[_type == "property"] {
      _id,
      title_en,
      status,
      _rev
    }`
    
    // Query 2: Only published (non-draft) properties
    const publishedQuery = `*[_type == "property" && !(_id in path("drafts.**"))] {
      _id,
      title_en,
      status
    }`
    
    // Query 3: Only drafts
    const draftsQuery = `*[_type == "property" && _id in path("drafts.**")] {
      _id,
      title_en,
      status
    }`
    
    console.log('Running queries...')
    const allProperties = await directClient.fetch(allQuery)
    const published = await directClient.fetch(publishedQuery)
    const drafts = await directClient.fetch(draftsQuery)
    
    console.log('All properties:', allProperties)
    console.log('Published:', published)
    console.log('Drafts:', drafts)
    
    return NextResponse.json({
      success: true,
      config: { projectId, dataset, apiVersion },
      all: allProperties,
      published,
      drafts,
      counts: {
        all: allProperties.length,
        published: published.length,
        drafts: drafts.length
      }
    })
  } catch (error) {
    console.error('Direct query error:', error)
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error',
      config: { projectId, dataset, apiVersion }
    }, { status: 500 })
  }
}