/**
 * Route-level Suspense fallback for all /admin pages. Next renders this in
 * the layout's <main> slot while the server component streams, so navigation
 * feels instant instead of blank.
 */
export default function AdminLoading() {
  return (
    <div className="flex-1 flex items-center justify-center min-h-screen">
      <div className="flex flex-col items-center gap-3">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-stone-800" />
        <p className="text-sm font-light text-stone-500">Loading…</p>
      </div>
    </div>
  )
}
