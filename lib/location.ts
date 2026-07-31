/**
 * Location visibility — how much of a property's location is revealed on
 * public pages. Replaces the old boolean `isPrivateAddress` flag with a
 * three-way control:
 *
 *   - 'full'   → show the exact address + a pinned map
 *   - 'sector' → show only the area/sector, with an approximate map
 *                centered on the sector (no street revealed)
 *   - 'hidden' → show no map and no address at all
 *
 * Private (access-code-gated) collections always reveal the full address
 * regardless of this setting — the gating happens at the collection level.
 */
export type LocationVisibility = 'full' | 'sector' | 'hidden'

/**
 * Resolve the effective visibility for a location, falling back to the
 * legacy `isPrivateAddress` boolean when the new field isn't set. This lets
 * existing documents behave correctly without a data migration:
 *   isPrivateAddress === true  → 'hidden'
 *   isPrivateAddress !== true   → 'full'
 */
export function resolveLocationVisibility(loc?: {
  locationVisibility?: string | null
  isPrivateAddress?: boolean | null
} | null): LocationVisibility {
  const v = loc?.locationVisibility
  if (v === 'full' || v === 'sector' || v === 'hidden') return v
  return loc?.isPrivateAddress ? 'hidden' : 'full'
}
