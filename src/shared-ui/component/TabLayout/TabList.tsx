// Files: src/shared-ui/component/TabLayout/TabList.tsx

"use client"

import clsx from "clsx"
import {forwardRef} from "react"

import {useTabContext} from "./TabContext"

import type {TabListProps} from "./types"

export const TabList = forwardRef<HTMLDivElement, TabListProps>(function TabList({ children, className, ...props }, ref) {
  const { orientation } = useTabContext()

  return (
    <div
      {...props}
      ref={ref}
      role="tablist"
      aria-orientation={orientation}
      className={clsx(
        "flex border-border",
        orientation === "horizontal" ? "flex-row items-center" : "flex-col items-stretch border-b-0 border-r",
        className
      )}
    >
      {children}
    </div>
  )
})

TabList.displayName = "TabList"

export default TabList
