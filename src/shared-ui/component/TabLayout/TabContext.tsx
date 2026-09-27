//Files: src/shared-ui/component/TabLayout/TabContext.tsx

"use client";

import { createContext, useContext } from "react";

import type { TabContextValue } from "./types";

const TabContext = createContext<TabContextValue | null>(null);

/**
 * Provider Tab Layout.
 */
export default TabContext;

/**
 * Hook untuk mengakses Tab Context.
 */
export function useTabContext(): TabContextValue {
  const context = useContext(TabContext);

  if (!context) {
    throw new Error("Tab components must be used within <TabLayout>.");
  }

  return context;
}
