/**
 * Darkens a hero photo from the bottom up, behind the text, and leaves the
 * top of the photo clear. `strength` is Studio's "Darken the photo" setting
 * (0–0.7): it sets how dark the bottom gets.
 */
export function HeroScrim({ strength }: { strength: number }) {
  const bottom = Math.min(0.9, 0.5 + strength)
  return (
    <div
      aria-hidden
      className="absolute inset-0"
      style={{
        background: `linear-gradient(to top, rgb(28 25 23 / ${bottom}) 0%, rgb(28 25 23 / ${bottom * 0.5}) 50%, rgb(28 25 23 / 0) 85%)`,
      }}
    />
  )
}
