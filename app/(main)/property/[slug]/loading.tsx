/**
 * Shown the instant a house is clicked, while its page loads (route-level
 * Suspense). Mirrors the real layout — full-bleed hero with the name at the
 * bottom, then the details column and the booking card — so nothing jumps
 * when the page arrives.
 */
export default function PropertyLoading() {
  return (
    <div className="min-h-screen bg-canvas" aria-busy="true" aria-live="polite">
      <span className="sr-only">Loading…</span>

      {/* Hero */}
      <div className="relative w-full h-[72vh] md:h-[88vh] min-h-[460px] max-h-[960px] bg-sand overflow-hidden">
        <div className="absolute inset-0 animate-pulse bg-gradient-to-b from-sand via-line/40 to-sand" />
        <div className="absolute inset-x-0 bottom-0 pb-10 md:pb-14 flex flex-col items-center gap-3">
          <div className="h-12 md:h-14 w-64 md:w-96 rounded-sm bg-white/60 animate-pulse" />
          <div className="h-4 w-48 rounded-sm bg-white/50 animate-pulse" />
          <div className="mt-2 h-3 w-36 rounded-sm bg-white/40 animate-pulse" />
        </div>
      </div>

      {/* Body */}
      <div className="container mx-auto px-4 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          <div className="lg:col-span-2 space-y-6 animate-pulse">
            <div className="flex gap-2">
              <div className="h-6 w-20 rounded-full bg-sand" />
              <div className="h-6 w-24 rounded-full bg-sand" />
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 py-6 border-y border-line">
              {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="space-y-2">
                  <div className="h-3 w-16 rounded-sm bg-sand" />
                  <div className="h-6 w-10 rounded-sm bg-sand" />
                </div>
              ))}
            </div>
            <div className="space-y-3">
              <div className="h-7 w-56 rounded-sm bg-sand" />
              <div className="h-4 w-full rounded-sm bg-sand" />
              <div className="h-4 w-full rounded-sm bg-sand" />
              <div className="h-4 w-11/12 rounded-sm bg-sand" />
              <div className="h-4 w-4/5 rounded-sm bg-sand" />
            </div>
          </div>

          <div className="hidden lg:block">
            <div className="border border-line bg-white p-6 space-y-4 animate-pulse">
              <div className="h-8 w-40 rounded-sm bg-sand" />
              <div className="h-12 w-full rounded-sm bg-sand" />
              <div className="h-12 w-full rounded-sm bg-sand" />
              <div className="h-11 w-full rounded-sm bg-ink/15" />
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
