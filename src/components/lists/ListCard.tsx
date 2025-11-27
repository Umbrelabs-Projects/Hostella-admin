"use client"

import * as React from "react"

interface ListCardProps {
  children?: React.ReactNode
  footer?: React.ReactNode
}

export default function ListCard({ children, footer }: ListCardProps) {
  return (
    <div className="bg-card border rounded-md">
      <div className="p-4">{children}</div>
      {footer && <div className="p-3 border-t">{footer}</div>}
    </div>
  )
}
