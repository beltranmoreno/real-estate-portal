'use client'

import dynamic from 'next/dynamic'

const SearchBar = dynamic(
  () => import('./SearchBar'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full">
        <div className="flex flex-col lg:flex-row gap-3 rounded-none bg-surface/90 backdrop-blur-md shadow-[var(--shadow-float)] border border-line p-2">
          <div className="flex-1 min-h-[52px] bg-sand animate-pulse" />
          <div className="w-px bg-sand hidden lg:block" />
          <div className="flex-1 min-h-[52px] bg-sand animate-pulse" />
          <div className="w-px bg-sand hidden lg:block" />
          <div className="flex-1 min-h-[52px] bg-sand animate-pulse" />
          <div className="w-24 min-h-[52px] bg-ink animate-pulse" />
        </div>
      </div>
    )
  }
)

export default SearchBar