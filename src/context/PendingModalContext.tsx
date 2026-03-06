"use client";

import { createContext, useCallback, useContext, type ReactNode } from "react";

const STORAGE_KEY = "openModalOnReturn";

interface PendingModalContextType {
  getStoredModalId: () => string | null;
  clearPendingModal: () => void;
}

const PendingModalContext = createContext<PendingModalContextType>({
  getStoredModalId: () => null,
  clearPendingModal: () => { },
});

export function usePendingModal() {
  return useContext(PendingModalContext);
}

export function PendingModalProvider({ children }: { children: ReactNode }) {
  const getStoredModalId = useCallback(() => {
    if (typeof window === "undefined") return null;
    return localStorage.getItem(STORAGE_KEY);
  }, []);

  const clearPendingModal = useCallback(() => {
    console.log("clearPendingModal");
    if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <PendingModalContext.Provider value={{ getStoredModalId, clearPendingModal }}>
      {children}
    </PendingModalContext.Provider>
  );
}
