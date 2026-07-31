/**
 * Backfill per-booking availability allow-lists for bookings created before
 * the "admin turns it on" gating.
 *
 *   - offeredServiceSanityIds → all currently-active concierge services, so
 *     existing guests keep the services they could already request.
 *   - offeredMenuSanityIds / offeredPlateSanityIds → the booking's property
 *     dining defaults (availableMenus / availablePlates).
 *   - offerGroceries → true, since grocery ordering was previously always on.
 *
 * Only fills a field that's currently EMPTY, so it never clobbers choices an
 * admin already made. Dry-run by default; pass --apply to write.
 *
 * Usage:
 *   node scripts/backfill-booking-offerings.js          # dry run
 *   node scripts/backfill-booking-offerings.js --apply   # write
 */
const path = require('path')
require('dotenv').config({ path: path.resolve(process.cwd(), '.env.local') })

const { PrismaClient } = require('@prisma/client')
const { createClient } = require('@sanity/client')

const apply = process.argv.includes('--apply')
const prisma = new PrismaClient()
const sanity = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'development',
  useCdn: false,
  apiVersion: '2025-09-06',
})

async function run() {
  console.log(`Backfill booking offerings — ${apply ? 'APPLY' : 'dry run'}`)

  const activeServiceIds = (
    await sanity.fetch(`*[_type == "conciergeService" && isActive == true]._id`)
  ).filter(Boolean)
  console.log(`Active concierge services: ${activeServiceIds.length}`)

  const propertyCache = new Map()
  async function diningDefaults(propertyId) {
    if (propertyCache.has(propertyId)) return propertyCache.get(propertyId)
    const res = await sanity.fetch(
      `*[_type == "property" && _id == $id][0]{
        "menuIds": availableMenus[]->_id,
        "plateIds": availablePlates[]->_id
      }`,
      { id: propertyId }
    )
    const out = {
      menuIds: (res?.menuIds ?? []).filter(Boolean),
      plateIds: (res?.plateIds ?? []).filter(Boolean),
    }
    propertyCache.set(propertyId, out)
    return out
  }

  const bookings = await prisma.booking.findMany({
    select: {
      id: true,
      propertyTitle: true,
      propertySanityId: true,
      offeredServiceSanityIds: true,
      offeredMenuSanityIds: true,
      offeredPlateSanityIds: true,
      offerGroceries: true,
    },
  })
  console.log(`Bookings: ${bookings.length}\n`)

  let changed = 0
  for (const b of bookings) {
    const defaults = await diningDefaults(b.propertySanityId)
    const data = {}
    if ((b.offeredServiceSanityIds ?? []).length === 0 && activeServiceIds.length) {
      data.offeredServiceSanityIds = activeServiceIds
    }
    if ((b.offeredMenuSanityIds ?? []).length === 0 && defaults.menuIds.length) {
      data.offeredMenuSanityIds = defaults.menuIds
    }
    if ((b.offeredPlateSanityIds ?? []).length === 0 && defaults.plateIds.length) {
      data.offeredPlateSanityIds = defaults.plateIds
    }
    if (!b.offerGroceries) {
      data.offerGroceries = true
    }
    if (Object.keys(data).length === 0) continue

    changed++
    console.log(
      `  ${b.id} (${b.propertyTitle}) → ` +
        Object.entries(data)
          .map(([k, v]) => `${k}=${Array.isArray(v) ? v.length : v}`)
          .join(', ')
    )
    if (apply) {
      await prisma.booking.update({ where: { id: b.id }, data })
    }
  }

  console.log(
    `\n${apply ? 'Updated' : 'Would update'} ${changed} booking(s).` +
      (apply ? '' : '\nRe-run with --apply to write.')
  )
}

run()
  .catch((err) => {
    console.error('Backfill failed:', err)
    process.exitCode = 1
  })
  .finally(() => prisma.$disconnect())
