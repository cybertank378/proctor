// File: src/shared-ui/component/Switch.tsx

"use client";

import clsx from "clsx";
import { forwardRef } from "react";

type Variant =
  | "primary"
  | "secondary"
  | "error"
  | "warning"
  | "info"
  | "success";

interface SwitchProps {
  name?: string;
  checked: boolean;
  onChange: (checked: boolean) => void;
  disabled?: boolean;
  label?: string;
  variant?: Variant;
  className?: string;
}

const variantStyles: Record<Variant, string> = {
  primary: "peer-checked:bg-indigo-600 peer-focus-visible:ring-indigo-300",
  secondary: "peer-checked:bg-gray-600 peer-focus-visible:ring-gray-300",
  error: "peer-checked:bg-red-500 peer-focus-visible:ring-red-300",
  warning: "peer-checked:bg-amber-500 peer-focus-visible:ring-amber-300",
  info: "peer-checked:bg-cyan-500 peer-focus-visible:ring-cyan-300",
  success: "peer-checked:bg-lime-500 peer-focus-visible:ring-lime-300",
};

const Switch = forwardRef<HTMLInputElement, SwitchProps>(
  (
    {
      name,
      checked,
      onChange,
      disabled = false,
      label,
      variant = "primary",
      className,
    },
    ref,
  ) => (
    <label
      className={clsx(
        "inline-flex select-none items-center gap-3",
        disabled ? "cursor-not-allowed opacity-60" : "cursor-pointer",
        className,
      )}
    >
      <span className="relative inline-block h-6 w-11">
        <input
          ref={ref}
          type="checkbox"
          role="switch"
          aria-checked={checked}
          aria-label={label ?? name ?? "Toggle switch"}
          name={name}
          data-field={name}
          checked={checked}
          disabled={disabled}
          onChange={(event) => {
            onChange(event.currentTarget.checked);
          }}
          className="peer sr-only"
        />

        <span
          aria-hidden="true"
          className={clsx(
            "absolute inset-0 rounded-full bg-gray-300 transition-all",
            "peer-focus-visible:ring-2",
            variantStyles[variant],
          )}
        />

        <span
          aria-hidden="true"
          className={clsx(
            "absolute top-1 left-1 h-4 w-4 rounded-full bg-white",
            "transition-transform peer-checked:translate-x-5",
          )}
        />
      </span>

      {label && <span className="text-sm text-gray-700">{label}</span>}
    </label>
  ),
);

Switch.displayName = "Switch";

export default Switch;
