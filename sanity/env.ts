export const apiVersion =
  process.env.NEXT_PUBLIC_SANITY_API_VERSION || '2025-09-06'

// Debug logging
console.log('Sanity env.ts - Raw dataset value:', process.env.NEXT_PUBLIC_SANITY_DATASET)
console.log('Sanity env.ts - Raw project ID:', process.env.NEXT_PUBLIC_SANITY_PROJECT_ID)

export const dataset = assertValue(
  process.env.NEXT_PUBLIC_SANITY_DATASET,
  'Missing environment variable: NEXT_PUBLIC_SANITY_DATASET'
)

export const projectId = assertValue(
  process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  'Missing environment variable: NEXT_PUBLIC_SANITY_PROJECT_ID'
)

console.log('Sanity env.ts - Final dataset:', dataset)
console.log('Sanity env.ts - Final projectId:', projectId)

function assertValue<T>(v: T | undefined, errorMessage: string): T {
  if (v === undefined) {
    throw new Error(errorMessage)
  }

  return v
}
