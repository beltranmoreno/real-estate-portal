import { z } from 'zod'

/**
 * A booking's primary guest as an admin enters it: email, phone or both
 * (some guests only give a WhatsApp number), plus nationality and an
 * optional postal address. Shared by booking creation and the guest editor.
 */
const text = (max: number) => z.string().trim().max(max).optional().nullable()

export const addressSchema = z.object({
  addressLine1: text(200),
  addressLine2: text(200),
  city: text(100),
  region: text(100),
  postalCode: text(30),
  country: text(100),
})

export const guestDetailsSchema = z
  .object({
    firstName: text(80),
    lastName: text(80),
    email: z.string().trim().toLowerCase().email().optional().nullable().or(z.literal('')),
    phone: text(40),
    nationality: text(60),
  })
  .merge(addressSchema)

export type GuestDetails = z.infer<typeof guestDetailsSchema>

/** Form values → User columns; blanks become null so a field can be cleared. */
export function guestDetailsToData(g: GuestDetails) {
  const v = (s: string | null | undefined) => s?.trim() || null
  return {
    firstName: v(g.firstName),
    lastName: v(g.lastName),
    email: v(g.email),
    phone: v(g.phone),
    nationality: v(g.nationality),
    addressLine1: v(g.addressLine1),
    addressLine2: v(g.addressLine2),
    city: v(g.city),
    region: v(g.region),
    postalCode: v(g.postalCode),
    country: v(g.country),
  }
}
