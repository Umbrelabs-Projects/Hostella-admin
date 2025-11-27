"use client"

import * as React from "react"

interface ListCardProps {
  children?: React.ReactNode
  footer?: React.ReactNode
  className?: string
}

export default function ListCard({ children, footer, className = "" }: ListCardProps) {
  return (
    <div className={`bg-card border rounded-md ${className}`}>
      <div className="p-4">{children}</div>
      {footer && <div className="p-3 border-t">{footer}</div>}
    </div>
  )
}
