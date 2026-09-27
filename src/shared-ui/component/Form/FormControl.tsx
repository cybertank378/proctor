//Files: src/shared-ui/component/Form/FormControl.tsx
"use client";

import clsx from "clsx";
import type { HTMLAttributes, ReactNode } from "react";

interface Props extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode;
  error?: boolean | undefined;
  success?: boolean | undefined;
  disabled?: boolean | undefined;
}

export default function FormControl({
  children,
  className,
  error,
  success,
  disabled,
  ...props
}: Props) {
  return (
    <div
      className={clsx(
        "flex flex-col w-auto gap-1",
        disabled && "opacity-70",
        className,
      )}
      {...props}
    >
      {children}
    </div>
  );
}
