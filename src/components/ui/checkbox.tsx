"use client"

import * as React from "react"

interface CheckboxProps {
  checked?: boolean
  onCheckedChange?: (checked: boolean) => void
  className?: string
}

export function Checkbox({ checked, onCheckedChange, className }: CheckboxProps) {
  return (
    <input
      type="checkbox"
      className={className}
      checked={!!checked}
      onChange={(e) => onCheckedChange?.(e.target.checked)}
    />
  )
}

export default Checkbox
