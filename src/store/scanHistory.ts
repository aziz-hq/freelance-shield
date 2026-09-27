import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";

import type { ScanResult } from "@/lib/scanner/types";

interface Scan {
  id: string;
  title: string;
  score: number;
  verdict: string;
  riskLevel: string;
  timestamp: number;
  fullResult: ScanResult;
}

interface ScanStore {
  scans: Scan[];
  addScan: (scan: Omit<Scan, "id" | "timestamp">) => void;
  clearHistory: () => void;
}

export const useScanHistory = create<ScanStore>()(
  persist(
    (set) => ({
      scans: [],
      addScan: (scan) =>
        set((state) => ({
          scans: [
            {
              ...scan,
              id: crypto.randomUUID(),
              timestamp: Date.now(),
            },
            ...state.scans,
          ].slice(0, 20),
        })),
      clearHistory: () => set({ scans: [] }),
    }),
    {
      name: "freelance-shield-history",
      storage: createJSONStorage(() => localStorage),
    }
  )
);
