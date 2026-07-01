/**
 * One-off migration for two schema changes:
 *
 *  1. location.distanceToAirport (number)  →  location.airports[] ({name, distanceKm})
 *     The distance comes from the property's own distanceToAirport; the name
 *     is pulled from the property's area sector (area->distanceFromAirport.airport)
 *     when available. The old distanceToAirport field is then unset.
 *
 *  2. contactInfo.hostName  →  contactInfo.name
 *     Plus unsetting the now-removed contactInfo fields: hostName, whatsapp,
 *     responseTime, languages_es, languages_en.
 *
 *  3. area.distanceFromAirport ({airport, distance, driveTime})  →  area.airports[]
 *     ({name, distanceKm, driveTime}). The old object is then unset.
 *
 * Usage:
 *   node scripts/migrate-airport-and-contact.js            # dry run (logs only)
 *   node scripts/migrate-airport-and-contact.js --commit   # apply changes
 */
const { createClient } = require('@sanity/client')
const path = require('path')
const dotenv = require('dotenv')

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const commit = process.argv.includes('--commit')

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  // dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  dataset: 'production',
  token: process.env.SANITY_API_WRITE_TOKEN,
  useCdn: false,
  apiVersion: '2025-09-06',
})

if (!process.env.SANITY_API_WRITE_TOKEN) {
  console.error('Missing SANITY_API_WRITE_TOKEN in .env.local')
  process.exit(1)
}

// contactInfo fields removed from the schema — unset them everywhere.
const REMOVED_CONTACT_FIELDS = [
  'contactInfo.hostName',
  'contactInfo.whatsapp',
  'contactInfo.responseTime',
  'contactInfo.languages_es',
  'contactInfo.languages_en',
]

async function run() {
  console.log(
    `Migration ${commit ? '(COMMIT)' : '(dry run)'} on dataset "${client.config().dataset}"\n`
  )

  // Fetch everything we need in one pass.
  const properties = await client.fetch(
    `*[_type == "property" && (defined(location.distanceToAirport) || defined(contactInfo))]{
      _id,
      "title": coalesce(title_en, title_es),
      "distanceToAirport": location.distanceToAirport,
      "existingAirports": location.airports,
      "areaAirportName": coalesce(location.area->airports[0].name, location.area->distanceFromAirport.airport),
      "hostName": contactInfo.hostName,
      "name": contactInfo.name,
      "hasContact": defined(contactInfo)
    }`
  )

  let airportMigrated = 0
  let airportDistanceOnlyCleaned = 0
  let contactMigrated = 0
  let contactCleaned = 0
  let patched = 0

  for (const p of properties) {
    const set = {}
    const unset = []
    const notes = []

    // ---- 1. Airport ----
    if (typeof p.distanceToAirport === 'number') {
      const hasAirports =
        Array.isArray(p.existingAirports) && p.existingAirports.length > 0
      if (!hasAirports) {
        const airport = {
          _key: 'airport-0',
          _type: 'object',
          ...(p.areaAirportName ? { name: p.areaAirportName } : {}),
          distanceKm: p.distanceToAirport,
        }
        set['location.airports'] = [airport]
        notes.push(
          `airports = [{ name: ${p.areaAirportName ? `"${p.areaAirportName}"` : '(none)'}, distanceKm: ${p.distanceToAirport} }]`
        )
        airportMigrated++
      } else {
        notes.push('airports already set — only clearing old distanceToAirport')
        airportDistanceOnlyCleaned++
      }
      unset.push('location.distanceToAirport')
    }

    // ---- 2. Contact ----
    if (p.hasContact) {
      if (p.hostName && !p.name) {
        set['contactInfo.name'] = p.hostName
        notes.push(`contactInfo.name = "${p.hostName}" (from hostName)`)
        contactMigrated++
      }
      // Always clear removed fields when a contactInfo object exists.
      unset.push(...REMOVED_CONTACT_FIELDS)
      contactCleaned++
    }

    if (Object.keys(set).length === 0 && unset.length === 0) continue

    patched++
    console.log(`• ${p.title || p._id}`)
    notes.forEach((n) => console.log(`    - ${n}`))
    if (unset.length) console.log(`    - unset: ${unset.join(', ')}`)

    if (commit) {
      let tx = client.patch(p._id)
      if (Object.keys(set).length) tx = tx.set(set)
      if (unset.length) tx = tx.unset(unset)
      await tx.commit()
    }
  }

  // ---- 3. Area: distanceFromAirport → airports[] ----
  const areas = await client.fetch(
    `*[_type == "area" && defined(distanceFromAirport)]{
      _id,
      "title": coalesce(title_en, title_es),
      "old": distanceFromAirport,
      "existingAirports": airports
    }`
  )

  let areasMigrated = 0
  let areasCleaned = 0

  for (const a of areas) {
    const set = {}
    const unset = ['distanceFromAirport']
    const hasAirports =
      Array.isArray(a.existingAirports) && a.existingAirports.length > 0

    if (!hasAirports && a.old && (a.old.airport || a.old.distance != null || a.old.driveTime != null)) {
      const airport = {
        _key: 'airport-0',
        _type: 'object',
        ...(a.old.airport ? { name: a.old.airport } : {}),
        ...(a.old.distance != null ? { distanceKm: a.old.distance } : {}),
        ...(a.old.driveTime != null ? { driveTime: a.old.driveTime } : {}),
      }
      set['airports'] = [airport]
      areasMigrated++
      console.log(`• [area] ${a.title || a._id}`)
      console.log(
        `    - airports = [{ name: ${a.old.airport ? `"${a.old.airport}"` : '(none)'}, distanceKm: ${a.old.distance ?? '-'}, driveTime: ${a.old.driveTime ?? '-'} }]`
      )
    } else {
      areasCleaned++
      console.log(`• [area] ${a.title || a._id}`)
      console.log('    - airports already set / empty source — clearing old distanceFromAirport')
    }
    console.log(`    - unset: distanceFromAirport`)

    if (commit) {
      let tx = client.patch(a._id)
      if (Object.keys(set).length) tx = tx.set(set)
      tx = tx.unset(unset)
      await tx.commit()
    }
  }

  console.log(
    `\n${commit ? 'Applied' : 'Would apply'}: ${patched} properties patched` +
      `\n  airports migrated (name+distance): ${airportMigrated}` +
      `\n  distanceToAirport cleared (airports already existed): ${airportDistanceOnlyCleaned}` +
      `\n  contactInfo.hostName → name: ${contactMigrated}` +
      `\n  contactInfo removed-fields cleaned: ${contactCleaned}` +
      `\n  areas: distanceFromAirport → airports: ${areasMigrated}` +
      `\n  areas: old field cleared (airports already existed): ${areasCleaned}`
  )
  if (!commit) console.log('\nRe-run with --commit to apply.')
}

run().catch((err) => {
  console.error('Migration failed:', err)
  process.exit(1)
})
