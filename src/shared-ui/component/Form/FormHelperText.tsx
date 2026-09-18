//Files: src/shared-ui/component/Form/FormHelperText.tsx
"use client"

import clsx from "clsx"
import type {ReactNode} from "react"

interface Props {
  children: ReactNode
  error?: boolean | undefined
  success?: boolean | undefined
}

export default function FormHelperText({ children, error, success }: Props) {
  return (
    <p className={clsx("mt-1 text-xs", error && "text-red-600", success && "text-green-600", !error && !success && "text-gray-500")}>{children}</p>
  )
}
