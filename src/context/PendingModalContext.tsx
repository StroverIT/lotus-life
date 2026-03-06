"use client";

import { createContext, useCallback, useContext, type ReactNode } from "react";

export const STORAGE_KEY = "openModalOnReturn";

export interface StoredModalPayload {
  modalId: string;
  data?: Record<string, unknown> | null;
}

interface PendingModalContextType {
  getStoredModalId: () => string | null;
  getStoredModalData: () => StoredModalPayload | null;
  clearPendingModal: () => void;
}

const PendingModalContext = createContext<PendingModalContextType>({
  getStoredModalId: () => null,
  getStoredModalData: () => null,
  clearPendingModal: () => {},
});

export function usePendingModal() {
  return useContext(PendingModalContext);
}

export function PendingModalProvider({ children }: { children: ReactNode }) {
  const getStoredModalId = useCallback(() => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw) as StoredModalPayload;
      return parsed.modalId ?? raw;
    } catch {
      return raw;
    }
  }, []);

  const getStoredModalData = useCallback((): StoredModalPayload | null => {
    if (typeof window === "undefined") return null;
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      return JSON.parse(raw) as StoredModalPayload;
    } catch {
      return { modalId: raw, data: null };
    }
  }, []);

  const clearPendingModal = useCallback(() => {
    console.log("clearPendingModal");
    if (typeof window !== "undefined") localStorage.removeItem(STORAGE_KEY);
  }, []);

  return (
    <PendingModalContext.Provider value={{ getStoredModalId, getStoredModalData, clearPendingModal }}>
      {children}
    </PendingModalContext.Provider>
  );
}
