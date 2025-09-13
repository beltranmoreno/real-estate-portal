'use client'

import dynamic from 'next/dynamic'

const SearchBar = dynamic(
  () => import('./SearchBar'),
  { 
    ssr: false,
    loading: () => (
      <div className="w-full">
        <div className="flex flex-col lg:flex-row gap-3 rounded-2xl bg-white/80 backdrop-blur-md shadow-lg border border-slate-200 p-4">
          <div className="flex-1 min-h-[40px] bg-slate-100 animate-pulse rounded" />
          <div className="w-px bg-slate-200 hidden lg:block" />
          <div className="flex-1 min-h-[40px] bg-slate-100 animate-pulse rounded" />
          <div className="w-px bg-slate-200 hidden lg:block" />
          <div className="flex-1 min-h-[40px] bg-slate-100 animate-pulse rounded" />
          <div className="w-24 min-h-[40px] bg-slate-700 animate-pulse rounded" />
        </div>
      </div>
    )
  }
)

export default SearchBar