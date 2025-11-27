"use client"

import * as React from "react"

interface PaginationProps {
  current: number
  total: number
  onChange: (page: number) => void
}

export default function Pagination({ current, total, onChange }: PaginationProps) {
  const pages = Array.from({ length: total }, (_, i) => i + 1)
  return (
    <div className="flex items-center gap-2">
      {pages.map((p) => (
        <button
          key={p}
          className={`px-2 py-1 rounded ${p === current ? 'bg-primary text-primary-foreground' : 'bg-muted'}`}
          onClick={() => onChange(p)}
        >
          {p}
        </button>
      ))}
    </div>
  )
}
