import { create } from "zustand";
import { api } from "@/Libs/api";
import useAdminStore from "./useAdminStore";
import type { AdminTransaction, Paginated, User } from "@/Types/api";

const PAGE_SIZE = 50;

export interface MoneyPayload {
  amount: number;
  description: string;
}

interface FinanceStore {
  transactions: AdminTransaction[];
  total: number;
  page: number;
  hasMore: boolean;
  isFetching: boolean;
  isLoading: boolean;
  isSendingSms: boolean;
  fetchUserTransactions: (userId: string, opts?: { more?: boolean }) => Promise<void>;
  getTransaction: (id: string) => Promise<AdminTransaction>;
  fund: (userId: string, payload: MoneyPayload) => Promise<void>;
  debit: (userId: string, payload: MoneyPayload) => Promise<void>;
  updateTransaction: (id: string | undefined, status: string) => Promise<AdminTransaction>;
  deleteTransaction: (id: string) => Promise<void>;
  sendSms: (id: string) => Promise<void>;
  clear: () => void;
}

const useFinanceStore = create<FinanceStore>((set, get) => ({
  transactions: [],
  total: 0,
  page: 0,
  hasMore: false,
  isFetching: false,
  isLoading: false,
  isSendingSms: false,

  fetchUserTransactions: async (userId, { more = false } = {}) => {
    const page = more ? get().page + 1 : 1;
    set({ isFetching: true });
    try {
      const { data } = await api.get<Paginated<AdminTransaction>>("/admin/transactions", {
        params: { user: userId, page, limit: PAGE_SIZE },
      });
      const merged = more ? [...get().transactions, ...data.items] : data.items;
      set({ transactions: merged, total: data.total, page, hasMore: merged.length < data.total });
    } finally {
      set({ isFetching: false });
    }
  },

  getTransaction: async (id) => {
    const { data } = await api.get<{ transaction: AdminTransaction }>(`/admin/transactions/${id}`);
    return data.transaction;
  },

  // Balance math, the insufficient-funds check and the ledger row are done atomically by the server.
  fund: async (userId, payload) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post<{ user: User }>(`/admin/users/${userId}/fund`, payload);
      useAdminStore.getState().upsertUser(data.user);
    } finally {
      set({ isLoading: false });
    }
  },

  debit: async (userId, payload) => {
    set({ isLoading: true });
    try {
      const { data } = await api.post<{ user: User }>(`/admin/users/${userId}/debit`, payload);
      useAdminStore.getState().upsertUser(data.user);
    } finally {
      set({ isLoading: false });
    }
  },

  updateTransaction: async (id, status) => {
    if (!id) throw new Error("Transaction ID is required");
    set({ isLoading: true });
    try {
      const { data } = await api.patch<{ transaction: AdminTransaction; user: User | null }>(
        `/admin/transactions/${id}`,
        { status },
      );
      // Marking a debit as failed refunds it, so pick up the adjusted balance.
      if (data.user) useAdminStore.getState().upsertUser(data.user);
      set((s) => ({ transactions: s.transactions.map((t) => (t.id === id ? { ...t, status: data.transaction.status } : t)) }));
      return data.transaction;
    } finally {
      set({ isLoading: false });
    }
  },

  deleteTransaction: async (id) => {
    set({ isLoading: true });
    try {
      await api.delete(`/admin/transactions/${id}`);
      set((s) => ({ transactions: s.transactions.filter((t) => t.id !== id), total: Math.max(0, s.total - 1) }));
    } finally {
      set({ isLoading: false });
    }
  },

  sendSms: async (id) => {
    set({ isSendingSms: true });
    try {
      await api.post(`/admin/transactions/${id}/sms`, {});
    } finally {
      set({ isSendingSms: false });
    }
  },

  clear: () => set({ transactions: [], total: 0, page: 0, hasMore: false }),
}));

export default useFinanceStore;
