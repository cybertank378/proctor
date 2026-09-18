//Files: src/shared-ui/component/Badge.tsx

"use client";

import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

//////////////////////////////////////////////////////////////
// TYPES
//////////////////////////////////////////////////////////////

export type BadgeColor =
  | "primary"
  | "secondary"
  | "success"
  | "warning"
  | "danger"
  | "info"
  | "gray";

export type BadgeVariant = "solid" | "soft" | "outline";

export type BadgeSize = "sm" | "md" | "lg";

//////////////////////////////////////////////////////////////
// PROPS
//////////////////////////////////////////////////////////////

export interface BadgeProps extends HTMLAttributes<HTMLSpanElement> {
  readonly children: ReactNode;

  readonly color?: BadgeColor;

  readonly variant?: BadgeVariant;

  readonly size?: BadgeSize;
}

//////////////////////////////////////////////////////////////
// SIZE
//////////////////////////////////////////////////////////////

const SIZE_CLASS: Record<BadgeSize, string> = {
  sm: "h-5 px-2 text-[11px]",

  md: "h-6 px-2.5 text-xs",

  lg: "h-7 px-3 text-sm",
};

//////////////////////////////////////////////////////////////
// COLOR
//////////////////////////////////////////////////////////////

const COLOR_CLASS: Record<BadgeVariant, Record<BadgeColor, string>> = {
  solid: {
    primary: "bg-indigo-600 text-white",

    secondary: "bg-slate-700 text-white",

    success: "bg-emerald-600 text-white",

    warning: "bg-amber-500 text-white",

    danger: "bg-red-600 text-white",

    info: "bg-sky-600 text-white",

    gray: "bg-gray-600 text-white",
  },

  soft: {
    primary: "bg-indigo-50 text-indigo-700",

    secondary: "bg-slate-100 text-slate-700",

    success: "bg-emerald-50 text-emerald-700",

    warning: "bg-amber-50 text-amber-700",

    danger: "bg-red-50 text-red-700",

    info: "bg-sky-50 text-sky-700",

    gray: "bg-gray-100 text-gray-700",
  },

  outline: {
    primary: "border border-indigo-300 text-indigo-700",

    secondary: "border border-slate-300 text-slate-700",

    success: "border border-emerald-300 text-emerald-700",

    warning: "border border-amber-300 text-amber-700",

    danger: "border border-red-300 text-red-700",

    info: "border border-sky-300 text-sky-700",

    gray: "border border-gray-300 text-gray-700",
  },
};

//////////////////////////////////////////////////////////////
// COMPONENT
//////////////////////////////////////////////////////////////

export default function Badge({
  children,

  color = "gray",

  variant = "soft",

  size = "md",

  className,

  ...props
}: BadgeProps) {
  return (
    <span
      {...props}
      className={clsx(
        "inline-flex items-center justify-center rounded-md font-medium whitespace-nowrap",
        SIZE_CLASS[size],
        COLOR_CLASS[variant][color],
        className,
      )}
    >
      {children}
    </span>
  );
}
