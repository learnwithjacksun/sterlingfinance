import { useEffect } from "react";
import { useAuthStore, useFinanceStore } from "@/Stores";

const INTERVAL_MS = 20_000;

/**
 * While signed in, quietly re-fetch the user (balance,
 * activation) and the latest transactions every 20s and whenever the tab regains focus.
 */
export default function useAutoRefresh() {
  const signedIn = useAuthStore((s) => Boolean(s.user));

  useEffect(() => {
    if (!signedIn) return;

    const refresh = () => {
      if (document.visibilityState !== "visible") return;
      void useAuthStore.getState().refreshUser();
      void useFinanceStore.getState().fetchTransactions(true);
    };

    const timer = window.setInterval(refresh, INTERVAL_MS);
    document.addEventListener("visibilitychange", refresh);
    window.addEventListener("focus", refresh);
    return () => {
      window.clearInterval(timer);
      document.removeEventListener("visibilitychange", refresh);
      window.removeEventListener("focus", refresh);
    };
  }, [signedIn]);
}
