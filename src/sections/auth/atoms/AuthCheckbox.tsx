//Files: src/sections/auth/atoms/AuthCheckbox.tsx
"use client";

import clsx from "clsx";
import type { ReactNode } from "react";

type Props = {
  label: ReactNode;

  checked: boolean;

  onChangeAction: (checked: boolean) => void;

  disabled?: boolean;

  className?: string;
};

export default function AuthCheckbox({
  label,

  checked,

  onChangeAction,

  disabled = false,

  className,
}: Props) {
  return (
    <label
      className={clsx(
        "inline-flex items-center gap-3 text-sm text-gray-700 transition",

        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",

        className,
      )}
    >
      <input
        type="checkbox"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChangeAction(e.target.checked)}
        className="peer sr-only"
      />

      <span
        className={clsx(
          "flex h-4 w-4 items-center justify-center rounded border transition-all",

          checked
            ? "border-emerald-500 bg-emerald-500"
            : "border-gray-300 bg-white",

          "peer-focus:ring-2 peer-focus:ring-emerald-200",
        )}
      >
        {checked && (
          <svg
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true"
            className="h-3 w-3 text-white"
          >
            <path
              d="M11.667 3L5.25 9.417 2.333 6.5"
              stroke="currentColor"
              strokeWidth="1.6"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
        )}
      </span>

      <span>{label}</span>
    </label>
  );
}
