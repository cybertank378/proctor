// Files: src/shared-ui/component/TabLayout/types.ts

import type {ButtonHTMLAttributes, HTMLAttributes, ReactNode} from "react"

//////////////////////////////////////////////////////////////
// TYPES
//////////////////////////////////////////////////////////////

export type TabOrientation = "horizontal" | "vertical"

export type TabSize = "sm" | "md" | "lg"

//////////////////////////////////////////////////////////////
// TAB LAYOUT
//////////////////////////////////////////////////////////////

export interface TabLayoutProps extends HTMLAttributes<HTMLDivElement> {
  readonly value?: string

  readonly defaultValue?: string

  readonly size?: TabSize

  readonly orientation?: TabOrientation

  readonly fullWidth?: boolean

  readonly keepMounted?: boolean

  readonly children: ReactNode

  readonly onValueChange?: (value: string) => void
}

//////////////////////////////////////////////////////////////
// TAB LIST
//////////////////////////////////////////////////////////////

export interface TabListProps extends HTMLAttributes<HTMLDivElement> {
  readonly children: ReactNode
}

//////////////////////////////////////////////////////////////
// TAB
//////////////////////////////////////////////////////////////

export interface TabProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  readonly value: string

  readonly disabled?: boolean

  readonly children: ReactNode
}

//////////////////////////////////////////////////////////////
// TAB PANEL
//////////////////////////////////////////////////////////////

export interface TabPanelProps extends HTMLAttributes<HTMLDivElement> {
  readonly value: string

  readonly children: ReactNode
}

//////////////////////////////////////////////////////////////
// TAB CONTEXT
//////////////////////////////////////////////////////////////

export interface TabContextValue {
  readonly value: string

  readonly size: TabSize

  readonly orientation: TabOrientation

  readonly fullWidth: boolean

  readonly keepMounted: boolean

  readonly setValue: (value: string) => void
}
