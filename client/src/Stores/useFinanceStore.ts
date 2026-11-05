import { create } from "zustand";
import { api } from "@/Libs/api";
import useAuthStore from "./useAuthStore";
import type { ApiTransaction, Paginated, User } from "@/Types/api";

const PAGE_SIZE = 50;

export interface TransferPayload {
  amount: number;
  description: string;
  pin: string;
  recipient: Record<string, string>;
}

interface FinanceStore {
  transactions: ApiTransaction[];
  total: number;
  page: number;
  isFetching: boolean;
  isLoading: boolean;
  hasMore: boolean;
  /** Loads the newest page. Pass silent=true for background polling (no spinner, keeps extra pages). */
  fetchTransactions: (silent?: boolean) => Promise<void>;
  loadMore: () => Promise<void>;
  transfer: (payload: TransferPayload) => Promise<void>;
  reset: () => void;
}

const useFinanceStore = create<FinanceStore>((set, get) => ({
  transactions: [],
  total: 0,
  page: 0,
  isFetching: false,
  isLoading: false,
  hasMore: false,

  fetchTransactions: async (silent = false) => {
    if (!silent) set({ isFetching: true });
    try {
      const { data } = await api.get<Paginated<ApiTransaction>>("/me/transactions", {
        params: { page: 1, limit: PAGE_SIZE },
      });
      const { transactions, page } = get();
      let merged = data.items;
      if (silent && page > 1) {
        // Keep older pages the user already loaded, refresh the newest page.
        const fresh = new Set(data.items.map((t) => t.id));
        merged = [...data.items, ...transactions.filter((t) => !fresh.has(t.id)).slice(0, (page - 1) * PAGE_SIZE)];
      }
      set({
        transactions: merged,
        total: data.total,
        page: silent && page > 1 ? page : 1,
        hasMore: merged.length < data.total,
      });
    } catch (error) {
      if (!silent) throw error;
    } finally {
      if (!silent) set({ isFetching: false });
    }
  },

  loadMore: async () => {
    const { page, transactions, isFetching } = get();
    if (isFetching) return;
    set({ isFetching: true });
    try {
      const { data } = await api.get<Paginated<ApiTransaction>>("/me/transactions", {
        params: { page: page + 1, limit: PAGE_SIZE },
      });
      const known = new Set(transactions.map((t) => t.id));
      const merged = [...transactions, ...data.items.filter((t) => !known.has(t.id))];
      set({ transactions: merged, total: data.total, page: page + 1, hasMore: merged.length < data.total });
    } finally {
      set({ isFetching: false });
    }
  },

  transfer: async (payload) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post<{ user: User }>("/me/transfer", payload);
      // The server returns the debited balance; no client-side math.
      useAuthStore.setState({ user: data.user });
      await get().fetchTransactions(true);
    } finally {
      set({ isLoading: false });
    }
  },

  reset: () => set({ transactions: [], total: 0, page: 0, hasMore: false }),
}));

// Never keep one user's transactions around after they sign out.
useAuthStore.subscribe((state, prev) => {
  if (prev.user && !state.user) useFinanceStore.getState().reset();
});

export default useFinanceStore;
