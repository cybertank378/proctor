// Files: src/shared-ui/component/TabLayout/TabLayout.tsx

"use client";

import clsx from "clsx";
import { useCallback, useMemo, useState } from "react";

import TabContext from "./TabContext";

import type { TabContextValue, TabLayoutProps } from "./types";

export default function TabLayout({
  value,
  defaultValue,
  size = "md",
  orientation = "horizontal",
  fullWidth = false,
  keepMounted = false,
  children,
  className,
  onValueChange,
  ...props
}: TabLayoutProps) {
  const [internalValue, setInternalValue] = useState(defaultValue ?? "");

  const currentValue = value ?? internalValue;

  const setValue = useCallback(
    (nextValue: string) => {
      if (value === undefined) {
        setInternalValue(nextValue);
      }

      onValueChange?.(nextValue);
    },
    [value, onValueChange],
  );

  const context = useMemo<TabContextValue>(
    () => ({
      value: currentValue,
      size,
      orientation,
      fullWidth,
      keepMounted,
      setValue,
    }),
    [currentValue, size, orientation, fullWidth, keepMounted, setValue],
  );

  return (
    <TabContext.Provider value={context}>
      <div {...props} className={clsx("w-full", className)}>
        {children}
      </div>
    </TabContext.Provider>
  );
}
