// Files: src/shared-ui/component/Modal.tsx
"use client"

import clsx from "clsx"
import type {FC, KeyboardEvent, MouseEvent, ReactNode} from "react"
import {useEffect} from "react"
import Button from "@/shared-ui/component/Button"

interface ModalProps {
  title?: string

  subtitle?: string

  open: boolean

  onClose: () => void

  onSubmit?: () => void

  submitText?: string

  cancelText?: string

  children: ReactNode

  className?: string

  titleClassName?: string

  submitButtonClassName?: string

  cancelButtonClassName?: string

  size?: "sm" | "md" | "lg" | "xl"

  submitColor?: "primary" | "secondary" | "error" | "warning" | "info" | "success"

  cancelColor?: "primary" | "secondary" | "error" | "warning" | "info" | "success"

  submitDisabled?: boolean

  submitLoading?: boolean
}

const sizeMap: Record<NonNullable<ModalProps["size"]>, string> = {
  sm: "max-w-md",

  md: "max-w-lg",

  lg: "max-w-3xl",

  xl: "max-w-5xl",
}

export const Modal: FC<ModalProps> = ({
  title,
  subtitle,
  open,
  onClose,
  onSubmit,
  submitText = "Save",
  cancelText = "Cancel",
  children,
  className,
  titleClassName,
  submitButtonClassName,
  cancelButtonClassName,
  size = "md",
  submitColor = "primary",
  cancelColor = "secondary",
  submitDisabled = false,
  submitLoading = false,
}) => {
  useEffect(() => {
    if (!open) {
      return
    }

    const originalOverflow = document.body.style.overflow

    document.body.style.overflow = "hidden"

    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose()
      }
    }

    document.addEventListener("keydown", handleKeyDown)

    return () => {
      document.body.style.overflow = originalOverflow

      document.removeEventListener("keydown", handleKeyDown)
    }
  }, [open, onClose])

  if (!open) {
    return null
  }

  const handleOverlayClick = (event: MouseEvent<HTMLDivElement>) => {
    if (event.target === event.currentTarget) {
      onClose()
    }
  }

  const handleOverlayKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key === "Escape") {
      onClose()
    }
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      tabIndex={-1}
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 px-4 backdrop-blur-sm"
      onClick={handleOverlayClick}
      onKeyDown={handleOverlayKeyDown}
    >
      <div
        className={clsx(
          "w-full rounded-2xl border border-gray-100 bg-white p-8 shadow-2xl",
          "max-h-[90vh] overflow-y-auto scrollbar-modern",
          sizeMap[size],
          className
        )}
      >
        {title && (
          <div className="mb-6 text-center">
            <h2 className={clsx("text-xl font-semibold text-gray-900", titleClassName)}>{title}</h2>

            {subtitle && <p className="mt-2 text-sm text-gray-500">{subtitle}</p>}
          </div>
        )}

        <div>{children}</div>

        {onSubmit && (
          <div className="mt-8 flex justify-center gap-4">
            <Button
              variant="outline"
              color={cancelColor}
              className={clsx("min-w-27.5", cancelButtonClassName)}
              onClick={onClose}
              disabled={submitLoading}
            >
              {cancelText}
            </Button>

            <Button
              variant="filled"
              color={submitColor}
              className={clsx("min-w-27.5", submitButtonClassName)}
              onClick={onSubmit}
              disabled={submitDisabled || submitLoading}
              loading={submitLoading}
            >
              {submitText}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}
