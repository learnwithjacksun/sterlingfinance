import { create } from "zustand";
import {
  api,
  ApiRequestError,
  isPasscodeVerified,
  readSession,
  saveSession,
  setSessionExpiredHandler,
  toApiError,
  Session,
} from "@/Libs/api";
import type { User } from "@/Types/api";

type AuthResponse = Session & { user: User };

interface AuthStore {
  user: User | null;
  /** True once the second-step admin passcode has been accepted for this session. */
  passcodeVerified: boolean;
  isLoading: boolean;
  isCheckingAuth: boolean;
  login: (email: string, password: string) => Promise<void>;
  verifyPasscode: (passcode: string) => Promise<void>;
  logout: () => Promise<void>;
  checkAuth: () => Promise<void>;
  forgotPassword: (email: string) => Promise<void>;
  resetPassword: (token: string, password: string) => Promise<void>;
}

const persist = ({ accessToken, accessTokenExpiresAt, refreshToken }: AuthResponse) =>
  saveSession({ accessToken, accessTokenExpiresAt, refreshToken });

const useAuthStore = create<AuthStore>((set) => {
  setSessionExpiredHandler(() => set({ user: null, passcodeVerified: false }));

  const checkAuth = async () => {
    if (!readSession()) {
      set({ user: null, passcodeVerified: false, isCheckingAuth: false });
      return;
    }
    set({ isCheckingAuth: true });
    try {
      const { data } = await api.get<{ user: User }>("/auth/me");
      if (data.user.role !== "admin") throw new ApiRequestError("Admin access required", "NOT_ADMIN", 403);
      set({ user: data.user, passcodeVerified: isPasscodeVerified() });
    } catch (error) {
      // A dead network keeps the stored session; any other failure signs out.
      if (toApiError(error).code !== "NETWORK_ERROR") {
        saveSession(null);
        set({ user: null, passcodeVerified: false });
      }
    } finally {
      set({ isCheckingAuth: false });
    }
  };

  return {
    user: null,
    passcodeVerified: false,
    isLoading: false,
    isCheckingAuth: true,
    checkAuth,

    login: async (email, password) => {
      set({ isLoading: true });
      try {
        const res = await api.post<AuthResponse>("/auth/login", { email, password });
        if (res.data.user.role !== "admin") {
          // A normal customer account must never get an admin session.
          await api.post("/auth/logout", { refreshToken: res.data.refreshToken }).catch(() => undefined);
          throw new ApiRequestError("This account does not have admin access", "NOT_ADMIN", 403);
        }
        persist(res.data);
        set({ user: res.data.user, passcodeVerified: false });
      } finally {
        set({ isLoading: false });
      }
    },

    verifyPasscode: async (passcode) => {
      set({ isLoading: true });
      try {
        const refreshToken = readSession()?.refreshToken;
        const { data } = await api.post<AuthResponse>("/admin/auth/passcode", { passcode, refreshToken });
        persist(data);
        set({ user: data.user, passcodeVerified: true });
      } finally {
        set({ isLoading: false });
      }
    },

    logout: async () => {
      set({ isLoading: true });
      try {
        const session = readSession();
        await api.post("/auth/logout", { refreshToken: session?.refreshToken }).catch(() => undefined);
      } finally {
        saveSession(null);
        set({ user: null, passcodeVerified: false, isLoading: false });
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
        if (data.user.role !== "admin") {
          await api.post("/auth/logout", { refreshToken: data.refreshToken }).catch(() => undefined);
          throw new ApiRequestError("This account does not have admin access", "NOT_ADMIN", 403);
        }
        persist(data);
        set({ user: data.user, passcodeVerified: false });
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
