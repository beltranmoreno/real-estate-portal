import SiteShell from '@/components/SiteShell'
import NotFoundContent from '@/components/NotFoundContent'

// Unmatched URLs render here, outside the (main) layout — wrap in the site frame.
export default function NotFound() {
  return (
    <SiteShell>
      <NotFoundContent />
    </SiteShell>
  )
}
