// Files: src/shared-ui/component/TabLayout/Tab.tsx

"use client"

import clsx from "clsx"
import {forwardRef} from "react"

import {useTabContext} from "./TabContext"

import type {TabProps} from "./types"

const SIZE_CLASS = {
  sm: "h-9 px-3 text-sm",
  md: "h-11 px-4 text-sm",
  lg: "h-12 px-5 text-base",
} as const

const ACTIVE_CLASS = ["border-b-2", "border-blue-600", "text-blue-600", "font-semibold"].join(" ")

const INACTIVE_CLASS = ["border-b-2", "border-transparent", "text-slate-500", "hover:text-blue-600", "hover:border-blue-200"].join(" ")

export const Tab = forwardRef<HTMLButtonElement, TabProps>(function Tab({ value, disabled = false, children, className, onClick, ...props }, ref) {
  const { value: currentValue, size, fullWidth, setValue } = useTabContext()

  const active = currentValue === value

  return (
    <button
      {...props}
      ref={ref}
      id={`tab-${value}`}
      type="button"
      role="tab"
      aria-selected={active}
      aria-controls={`panel-${value}`}
      tabIndex={active ? 0 : -1}
      disabled={disabled}
      onClick={(event) => {
        if (disabled) {
          return
        }

        setValue(value)

        onClick?.(event)
      }}
      className={clsx(
        "inline-flex",
        "items-center",
        "justify-center",
        "h-12",
        "px-4",
        "text-sm",
        "transition-colors",
        active ? ACTIVE_CLASS : INACTIVE_CLASS,
        className
      )}
    >
      {children}
    </button>
  )
})

Tab.displayName = "Tab"

export default Tab
