//Files: src/shared-ui/component/Checkbox.tsx
"use client";

import clsx from "clsx";
import { forwardRef, type InputHTMLAttributes } from "react";

interface Props extends Omit<InputHTMLAttributes<HTMLInputElement>, "type"> {
  label?: string;
  indeterminate?: boolean;
}

const Checkbox = forwardRef<HTMLInputElement, Props>(
  (
    {
      label,
      disabled = false,
      indeterminate = false,
      className,
      ...props // checked, defaultChecked, dan onChange otomatis diteruskan dari sini
    },
    ref,
  ) => {
    return (
      <label
        className={clsx(
          "inline-flex select-none items-center gap-2",
          disabled ? "cursor-not-allowed" : "cursor-pointer",
        )}
      >
        <span className="relative">
          <input
            {...props}
            ref={ref}
            type="checkbox"
            disabled={disabled}
            aria-checked={indeterminate ? "mixed" : undefined}
            className="peer sr-only"
          />

          <span
            aria-hidden="true"
            className={clsx(
              "flex h-5 w-5 items-center justify-center rounded-md border-2",
              "transition-all duration-200",
              "peer-focus-visible:ring-2 peer-focus-visible:ring-indigo-300",
              "peer-focus-visible:ring-offset-2",
              // Tampilan Unchecked (Default)
              "border-gray-300 bg-white",
              // Tampilan Checked (Diatur otomatis oleh CSS)
              "peer-checked:border-indigo-600 peer-checked:bg-indigo-600",
              // Override manual hanya untuk state Indeterminate
              indeterminate && "!border-indigo-600 !bg-indigo-600",
              disabled && "opacity-50",
              className,
            )}
          >
            {indeterminate ? (
              <span className="h-0.5 w-3 rounded-sm bg-white" />
            ) : (
              <svg
                aria-hidden="true"
                focusable="false"
                // Disembunyikan secara default, dimunculkan saat peer-checked
                className="hidden h-3 w-3 text-white peer-checked:block"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth={3}
              >
                <path d="M5 13l4 4L19 7" />
              </svg>
            )}
          </span>
        </span>

        {label && <span className="text-sm text-gray-700">{label}</span>}
      </label>
    );
  },
);

Checkbox.displayName = "Checkbox";

export default Checkbox;
