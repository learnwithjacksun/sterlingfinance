import { create } from "zustand";
import { api } from "@/Libs/api";
import type { Paginated, User, VerificationCode } from "@/Types/api";

const PAGE_SIZE = 25;

export interface UserFormData {
  name: string;
  email?: string;
  phone: string;
  dob?: string;
  gender: string;
  employment_status: string;
  country: string;
  address: string;
  city: string;
  state: string;
  zip: string;
  accountType: string;
  currency: string;
  pin?: string;
  password?: string;
}

// The form uses the old snake_case names; the API uses camelCase.
const toPayload = (data: UserFormData) => {
  const { address, employment_status, pin, password, email, dob, ...rest } = data;
  return {
    ...rest,
    ...(email ? { email } : {}),
    ...(dob ? { dob } : {}),
    street: address,
    employmentStatus: employment_status,
    ...(pin ? { pin } : {}),
    ...(password ? { password } : {}),
  };
};

interface AdminStore {
  users: User[];
  /** Every user the admin has opened, so detail pages survive a refresh of the list. */
  usersById: Record<string, User>;
  total: number;
  page: number;
  search: string;
  isLoading: boolean;
  isUpdating: boolean;
  isDeletingUser: boolean;
  isAddingCode: boolean;
  isSendingMessage: boolean;
  isFetchingCode: boolean;
  code: VerificationCode | null;

  fetchUsers: (opts?: { page?: number; search?: string; silent?: boolean }) => Promise<void>;
  getUser: (id: string) => Promise<User>;
  upsertUser: (user: User) => void;
  activateAccount: (id: string | undefined) => Promise<void>;
  deactivateAccount: (id: string | undefined) => Promise<void>;
  createUser: (data: UserFormData) => Promise<User>;
  updateUser: (id: string, data: UserFormData) => Promise<void>;
  updateAvatar: (id: string, image: File) => Promise<void>;
  sendResetEmail: (id: string) => Promise<void>;
  deleteUser: (id: string | undefined) => Promise<void>;
  changePasscode: (currentPasscode: string, newPasscode: string) => Promise<void>;
  fetchCode: (id: string | undefined) => Promise<void>;
  addCode: (id: string, data: { name: string; code: string; instructions: string }) => Promise<void>;
  sendMessage: (id: string, data: { message: string; status: string }) => Promise<void>;
}

const useAdminStore = create<AdminStore>((set, get) => {
  const upsertUser = (user: User) =>
    set((s) => ({
      usersById: { ...s.usersById, [user.id]: user },
      users: s.users.map((u) => (u.id === user.id ? user : u)),
    }));

  const setActive = async (id: string | undefined, isActive: boolean) => {
    if (!id) throw new Error("User ID is required");
    set({ isUpdating: true });
    try {
      const { data } = await api.patch<{ user: User }>(`/admin/users/${id}/status`, { isActive });
      upsertUser(data.user);
    } finally {
      set({ isUpdating: false });
    }
  };

  return {
    users: [],
    usersById: {},
    total: 0,
    page: 1,
    search: "",
    isLoading: false,
    isUpdating: false,
    isDeletingUser: false,
    isAddingCode: false,
    isSendingMessage: false,
    isFetchingCode: false,
    code: null,
    upsertUser,

    fetchUsers: async ({ page, search, silent } = {}) => {
      const nextPage = page ?? get().page;
      const nextSearch = search ?? get().search;
      if (!silent) set({ isLoading: true });
      try {
        const { data } = await api.get<Paginated<User>>("/admin/users", {
          params: { page: nextPage, limit: PAGE_SIZE, search: nextSearch || undefined },
        });
        set((s) => ({
          users: data.items,
          total: data.total,
          page: data.page,
          search: nextSearch,
          usersById: { ...s.usersById, ...Object.fromEntries(data.items.map((u) => [u.id, u])) },
        }));
      } finally {
        if (!silent) set({ isLoading: false });
      }
    },

    getUser: async (id) => {
      const { data } = await api.get<{ user: User }>(`/admin/users/${id}`);
      upsertUser(data.user);
      set((s) => ({ usersById: { ...s.usersById, [id]: data.user } }));
      return data.user;
    },

    activateAccount: (id) => setActive(id, true),
    deactivateAccount: (id) => setActive(id, false),

    createUser: async (data) => {
      set({ isLoading: true });
      try {
        const res = await api.post<{ user: User }>("/admin/users", toPayload(data));
        return res.data.user;
      } finally {
        set({ isLoading: false });
      }
    },

    updateUser: async (id, data) => {
      set({ isUpdating: true });
      try {
        const { email: _email, dob: _dob, password: _password, ...editable } = data;
        const res = await api.patch<{ user: User }>(`/admin/users/${id}`, toPayload(editable));
        upsertUser(res.data.user);
      } finally {
        set({ isUpdating: false });
      }
    },

    updateAvatar: async (id, image) => {
      set({ isUpdating: true });
      try {
        const form = new FormData();
        form.append("avatar", image);
        const res = await api.patch<{ user: User }>(`/admin/users/${id}`, form);
        upsertUser(res.data.user);
      } finally {
        set({ isUpdating: false });
      }
    },

    sendResetEmail: async (id) => {
      await api.post(`/admin/users/${id}/send-reset`);
    },

    deleteUser: async (id) => {
      if (!id) throw new Error("User ID is required");
      set({ isDeletingUser: true });
      try {
        await api.delete(`/admin/users/${id}`);
        set((s) => {
          const { [id]: _removed, ...rest } = s.usersById;
          return { users: s.users.filter((u) => u.id !== id), usersById: rest, total: Math.max(0, s.total - 1) };
        });
      } finally {
        set({ isDeletingUser: false });
      }
    },

    changePasscode: async (currentPasscode, newPasscode) => {
      set({ isUpdating: true });
      try {
        await api.put("/admin/settings/passcode", { currentPasscode, newPasscode });
      } finally {
        set({ isUpdating: false });
      }
    },

    fetchCode: async (id) => {
      if (!id) return;
      set({ isFetchingCode: true, code: null });
      try {
        const { data } = await api.get<{ code: VerificationCode | null }>(`/admin/users/${id}/code`);
        set({ code: data.code });
      } finally {
        set({ isFetchingCode: false });
      }
    },

    addCode: async (id, { name, code, instructions }) => {
      set({ isAddingCode: true });
      try {
        const res = await api.put<{ code: VerificationCode }>(`/admin/users/${id}/code`, {
          codeName: name,
          codeNumber: code,
          instruction: instructions,
        });
        set({ code: res.data.code });
      } finally {
        set({ isAddingCode: false });
      }
    },

    sendMessage: async (id, data) => {
      set({ isSendingMessage: true });
      try {
        const res = await api.post<{ code: VerificationCode }>(`/admin/users/${id}/code/message`, data);
        set({ code: res.data.code });
      } finally {
        set({ isSendingMessage: false });
      }
    },
  };
});

export default useAdminStore;
