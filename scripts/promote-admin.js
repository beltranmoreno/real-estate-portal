/**
 * Promotes a User row to ADMIN (or another role). Use this after signing
 * up for the first time — regular signup creates a RENTER user, and you
 * can't reach /admin to promote anyone else until at least one admin exists.
 *
 * Target database:
 *   - default          → the DB in .env.local (your dev / Neon branch)
 *   - --prod           → the production DB. Reads it from either
 *                        .env.production.local (a file you create with the
 *                        prod DATABASE_URL) or a PROD_DATABASE_URL env var.
 *
 * Usage:
 *   yarn promote-admin you@yourdomain.com
 *   yarn promote-admin you@yourdomain.com --prod
 *   yarn promote-admin someone@x.com --role=AGENT
 *   PROD_DATABASE_URL="postgres://…" yarn promote-admin you@x.com --prod
 */
const path = require('path')
const fs = require('fs')
const dotenv = require('dotenv')

const VALID_ROLES = [
  'ADMIN',
  'AGENT',
  'STAFF',
  'OWNER',
  'RENTER',
  'ADDITIONAL_GUEST',
]

const args = process.argv.slice(2)
const useProd = args.includes('--prod')
const email = args.find((a) => !a.startsWith('--'))
const roleArg = (args.find((a) => a.startsWith('--role=')) || '').split('=')[1]
const role = (roleArg || 'ADMIN').toUpperCase()

// ---- Load the right environment ----
if (useProd) {
  const prodEnvFile = path.resolve(process.cwd(), '.env.production.local')
  if (fs.existsSync(prodEnvFile)) {
    dotenv.config({ path: prodEnvFile })
  }
  // An explicit PROD_DATABASE_URL always wins, so you can run it inline
  // without keeping a prod env file on disk.
  if (process.env.PROD_DATABASE_URL) {
    process.env.DATABASE_URL = process.env.PROD_DATABASE_URL
  }
} else {
  dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })
}

async function main() {
  if (!email) {
    console.error('Usage: yarn promote-admin <email> [--prod] [--role=ADMIN]')
    process.exit(1)
  }
  if (!VALID_ROLES.includes(role)) {
    console.error(`Invalid role "${role}". One of: ${VALID_ROLES.join(', ')}`)
    process.exit(1)
  }
  if (!process.env.DATABASE_URL) {
    console.error(
      useProd
        ? 'Missing prod DATABASE_URL. Set PROD_DATABASE_URL or create .env.production.local.'
        : 'Missing DATABASE_URL in .env.local'
    )
    process.exit(1)
  }

  // Show which database we're about to modify — important when --prod.
  let host = '(unknown)'
  try {
    host = new URL(process.env.DATABASE_URL).host
  } catch {}
  console.log(
    `Target: ${useProd ? 'PRODUCTION' : 'local'} DB (${host})\nSetting ${email} -> ${role}\n`
  )

  const { PrismaClient } = require('@prisma/client')
  const prisma = new PrismaClient({
    datasources: { db: { url: process.env.DATABASE_URL } },
  })

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    })
    if (!user) {
      console.error(
        `No user found with email "${email}". Sign up via Clerk first, then re-run.`
      )
      process.exit(1)
    }

    if (user.role === role) {
      console.log(`✓ ${user.email} is already ${role}. Nothing to do.`)
      return
    }

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { role },
    })

    console.log(
      `✓ ${updated.email} is now ${updated.role} (was ${user.role}). ` +
        `If they're logged in, sign out and back in to refresh the session.`
    )
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
