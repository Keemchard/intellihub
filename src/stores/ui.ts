"use client";
import { create } from "zustand";
import { persist } from "zustand/middleware";

interface UiState {
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
  botOpen: boolean;
  botMode: "panel" | "minimized" | "full";
  openBot: () => void;
  closeBot: () => void;
  setBotMode: (m: UiState["botMode"]) => void;
}

export const useUi = create<UiState>()(
  persist(
    (set) => ({
      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
      botOpen: false,
      botMode: "panel",
      openBot: () => set({ botOpen: true }),
      closeBot: () => set({ botOpen: false }),
      setBotMode: (botMode) => set({ botMode }),
    }),
    { name: "ih_ui", partialize: (s) => ({ sidebarCollapsed: s.sidebarCollapsed }) },
  ),
);
