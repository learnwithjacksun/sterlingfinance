import { create } from "zustand";
import { z } from "zod";
import { registerSchema } from "@/Schemas/registerSchema";
import { loginSchema } from "@/Schemas/loginSchema";
import { api, readSession, saveSession, setSessionExpiredHandler, toApiError, Session } from "@/Libs/api";
import type { User } from "@/Types/api";

interface AuthStore {
  user: User | null;
  isLoading: boolean;
  isUpdating: boolean;
  isCheckingAuth: boolean;
  login: (data: z.infer<typeof loginSchema>) => Promise<void>;
  register: (data: z.infer<typeof registerSchema>) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  /** Silent re-fetch of the current user (balance etc.), used by background polling. */
  refreshUser: () => Promise<void>;
  updateAvatar: (image: File) => Promise<void>;
  updatePin: (currentPin: string, newPin: string) => Promise<void>;
  updatePassword: (currentPassword: string, newPassword: string) => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
}

type AuthResponse = Session & { user: User };

const persist = ({ accessToken, accessTokenExpiresAt, refreshToken }: AuthResponse) =>
  saveSession({ accessToken, accessTokenExpiresAt, refreshToken });

const useAuthStore = create<AuthStore>((set) => {
  setSessionExpiredHandler(() => set({ user: null }));

  const checkAuth = async () => {
    // No stored session means there is nothing to verify, skip the network call.
    if (!readSession()) {
      set({ user: null, isCheckingAuth: false });
      return;
    }
    set({ isCheckingAuth: true });
    try {
      const { data } = await api.get<{ user: User }>("/auth/me");
      set({ user: data.user });
    } catch (error) {
      // A dead network keeps the stored session; only a rejected one signs the user out.
      if (toApiError(error).code !== "NETWORK_ERROR") set({ user: null });
    } finally {
      set({ isCheckingAuth: false });
    }
  };

  return {
    user: null,
    isLoading: false,
    isUpdating: false,
    isCheckingAuth: true,
    checkAuth,

    refreshUser: async () => {
      if (!readSession()) return;
      try {
        const { data } = await api.get<{ user: User }>("/auth/me");
        set({ user: data.user });
      } catch {
        /* background refresh: ignore, the next tick will retry */
      }
    },

    login: async (data) => {
      set({ isLoading: true });
      try {
        const res = await api.post<AuthResponse>("/auth/login", data);
        persist(res.data);
        set({ user: res.data.user });
      } finally {
        set({ isLoading: false });
      }
    },

    register: async (data) => {
      set({ isLoading: true });
      try {
        const { address, employment_status, accountType, ...rest } = data;
        const res = await api.post<AuthResponse>("/auth/register", {
          ...rest,
          street: address,
          employmentStatus: employment_status,
          accountType,
        });
        persist(res.data);
        set({ user: res.data.user });
      } finally {
        set({ isLoading: false });
      }
    },

    logout: async () => {
      set({ isLoading: true });
      try {
        const session = readSession();
        // Best effort: the local session is cleared even if the server can't be reached.
        await api.post("/auth/logout", { refreshToken: session?.refreshToken }).catch(() => undefined);
      } finally {
        saveSession(null);
        set({ user: null, isLoading: false });
      }
    },

    updateAvatar: async (image) => {
      set({ isUpdating: true });
      try {
        const form = new FormData();
        form.append("avatar", image);
        const { data } = await api.patch<{ user: User }>("/me/avatar", form);
        set({ user: data.user });
      } finally {
        set({ isUpdating: false });
      }
    },

    updatePin: async (currentPin, newPin) => {
      set({ isUpdating: true });
      try {
        const { data } = await api.patch<{ user: User }>("/me/pin", { currentPin, newPin });
        set({ user: data.user });
      } finally {
        set({ isUpdating: false });
      }
    },

    updatePassword: async (currentPassword, newPassword) => {
      set({ isUpdating: true });
      try {
        // The server revokes every other session and returns a fresh token pair.
        const { data } = await api.post<AuthResponse>("/auth/change-password", { currentPassword, newPassword });
        persist(data);
        set({ user: data.user });
      } finally {
        set({ isUpdating: false });
      }
    },

    forgotPassword: async (email) => {
      set({ isLoading: true });
      try {
        await api.post("/auth/forgot-password", { email });
      } finally {
        set({ isLoading: false });
      }
    },

    resetPassword: async (token, password) => {
      set({ isLoading: true });
      try {
        const { data } = await api.post<AuthResponse>("/auth/reset-password", { token, password });
        persist(data);
        set({ user: data.user });
      } finally {
        set({ isLoading: false });
      }
    },
  };
});

// Must run after the store exists: calling it inside the initializer let its synchronous
// `set` be overwritten by the initial state, leaving `isCheckingAuth` stuck on true.
void useAuthStore.getState().checkAuth();

export default useAuthStore;
