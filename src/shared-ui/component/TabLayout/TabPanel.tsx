//Files: src/shared-ui/component/TabLayout/TabPanel.tsx
// Files: src/shared-ui/component/TabLayout/TabPanel.tsx

"use client";

import clsx from "clsx";
import { forwardRef } from "react";

import { useTabContext } from "./TabContext";

import type { TabPanelProps } from "./types";

export const TabPanel = forwardRef<HTMLDivElement, TabPanelProps>(
  function TabPanel({ value, children, className, ...props }, ref) {
    const { value: activeValue, keepMounted } = useTabContext();

    const active = activeValue === value;

    if (!keepMounted && !active) {
      return null;
    }

    return (
      <div
        {...props}
        ref={ref}
        id={`panel-${value}`}
        role="tabpanel"
        aria-labelledby={`tab-${value}`}
        hidden={!active}
        className={clsx("w-full", !active && "hidden", className)}
      >
        {children}
      </div>
    );
  },
);

TabPanel.displayName = "TabPanel";

export default TabPanel;
