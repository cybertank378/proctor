// src/shared-ui/provider/AppUiProvider.tsx
"use client";

import "react-toastify/dist/ReactToastify.css";

import {
  createContext,
  type ReactNode,
  useCallback,
  useContext,
  useMemo,
  useState,
} from "react";
import { ToastContainer } from "react-toastify";

interface AppUiContextValue {
  isSidebarOpen: boolean;
  toggleSidebar: () => void;
  setSidebarOpen: (open: boolean) => void;
}

const AppUiContext = createContext<AppUiContextValue | null>(null);

interface AppUiProviderProps {
  children: ReactNode;
}

export function AppUiProvider({ children }: AppUiProviderProps) {
  const [isSidebarOpen, setIsSidebarOpen] = useState(true);

  const toggleSidebar = useCallback(() => {
    setIsSidebarOpen((prev) => !prev);
  }, []);

  const setSidebarOpen = useCallback((open: boolean) => {
    setIsSidebarOpen(open);
  }, []);

  const value = useMemo(
    () => ({
      isSidebarOpen,
      toggleSidebar,
      setSidebarOpen,
    }),
    [isSidebarOpen, toggleSidebar, setSidebarOpen],
  );

  return (
    <AppUiContext.Provider value={value}>
      {children}

      {/* Global Toast Container bertema terang (light) */}
      <ToastContainer
        position="bottom-right"
        theme="light"
        hideProgressBar={false}
        newestOnTop
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
    </AppUiContext.Provider>
  );
}

export function useAppUi(): AppUiContextValue {
  const context = useContext(AppUiContext);
  if (!context) {
    throw new Error("useAppUi harus digunakan di dalam AppUiProvider");
  }
  return context;
}
