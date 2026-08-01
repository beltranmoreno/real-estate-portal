/**
 * Route-level Suspense fallback for all /portal pages. Shows while the
 * server component streams so the guest sees a calm loading state rather
 * than a blank screen on navigation.
 */
export default function PortalLoading() {
  return (
    <div className="min-h-screen bg-stone-50 flex items-center justify-center">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-800" />
        <p className="text-sm font-light text-stone-500">Loading…</p>
      </div>
    </div>
  )
}
