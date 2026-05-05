/**
 * Promotes a User row to ADMIN role. Use this after signing up for the
 * first time, since regular signup creates a RENTER user. Without an
 * admin, you can't access /admin to invite anyone else.
 *
 * Usage:
 *   yarn promote-admin you@yourdomain.com
 */
const path = require('path')
const dotenv = require('dotenv')

dotenv.config({ path: path.resolve(process.cwd(), '.env.local') })

const { PrismaClient } = require('@prisma/client')

async function main() {
  const email = process.argv[2]
  if (!email) {
    console.error('Usage: yarn promote-admin <email>')
    process.exit(1)
  }

  if (!process.env.DATABASE_URL) {
    console.error('Missing DATABASE_URL in .env.local')
    process.exit(1)
  }

  const prisma = new PrismaClient()

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

    const updated = await prisma.user.update({
      where: { id: user.id },
      data: { role: 'ADMIN' },
    })

    console.log(
      `✓ ${updated.email} is now ADMIN (was ${user.role}). Sign out and back in if you're already logged in.`
    )
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  console.error(err)
  process.exit(1)
})
