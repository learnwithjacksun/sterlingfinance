import axios, { AxiosError, InternalAxiosRequestConfig } from "axios";

const baseURL = (import.meta.env.VITE_API_URL as string | undefined) ?? "http://localhost:5000/api";

/**
 * Token based auth: the access token goes in the Authorization header and the refresh
 * token lives in localStorage. No cookies are used, so Safari/iOS cross-site tracking
 * prevention cannot drop the session when the API is on another domain.
 */
export interface Session {
  accessToken: string;
  accessTokenExpiresAt: number;
  refreshToken: string;
}

const STORAGE_KEY = "tm_admin_session";

export const readSession = (): Session | null => {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? (JSON.parse(raw) as Session) : null;
  } catch {
    return memorySession;
  }
};

// Fallback for browsers where localStorage is blocked (private mode etc.).
let memorySession: Session | null = null;

export const saveSession = (session: Session | null) => {
  memorySession = session;
  try {
    if (session) localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
    else localStorage.removeItem(STORAGE_KEY);
  } catch {
    /* storage unavailable, memory fallback is used */
  }
};

export class ApiRequestError extends Error {
  code: string;
  status: number;
  constructor(message: string, code = "UNKNOWN", status = 0) {
    super(message);
    this.code = code;
    this.status = status;
  }
}

export const toApiError = (error: unknown): ApiRequestError => {
  if (error instanceof ApiRequestError) return error;
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as { error?: { code?: string; message?: string } } | undefined;
    if (data?.error) return new ApiRequestError(data.error.message ?? "Request failed", data.error.code, error.response?.status);
    if (!error.response) return new ApiRequestError("Cannot reach the server. Check your connection and try again.", "NETWORK_ERROR");
    return new ApiRequestError(error.message, "HTTP_ERROR", error.response.status);
  }
  return new ApiRequestError(error instanceof Error ? error.message : "Something went wrong");
};

let onSessionExpired: (() => void) | null = null;
export const setSessionExpiredHandler = (fn: () => void) => {
  onSessionExpired = fn;
};

export const api = axios.create({ baseURL, timeout: 30_000 });

// Plain client for the refresh call so it can't recurse through the interceptors.
const bare = axios.create({ baseURL, timeout: 30_000 });

let refreshing: Promise<Session | null> | null = null;

async function refreshSession(staleAccessToken?: string): Promise<Session | null> {
  if (refreshing) return refreshing;

  const run = async (): Promise<Session | null> => {
    const current = readSession();
    if (!current) return null;
    // Another tab may have refreshed while we waited for the lock: reuse its tokens,
    // since replaying a rotated refresh token would revoke the whole session.
    if (staleAccessToken && current.accessToken !== staleAccessToken) return current;
    try {
      const { data } = await bare.post("/auth/refresh", { refreshToken: current.refreshToken });
      const next: Session = {
        accessToken: data.accessToken,
        accessTokenExpiresAt: data.accessTokenExpiresAt,
        refreshToken: data.refreshToken,
      };
      saveSession(next);
      return next;
    } catch (error) {
      const status = axios.isAxiosError(error) ? error.response?.status : undefined;
      // Only a definite rejection ends the session; network blips keep it.
      if (status === 401 || status === 403) {
        saveSession(null);
        onSessionExpired?.();
      }
      return null;
    }
  };

  refreshing = (navigator.locks ? navigator.locks.request("tm-admin-refresh", run) : run()).finally(() => {
    refreshing = null;
  });
  return refreshing;
}

api.interceptors.request.use(async (config: InternalAxiosRequestConfig) => {
  let session = readSession();
  if (session && session.accessTokenExpiresAt - Date.now() < 10_000 && !config.url?.startsWith("/auth/")) {
    session = (await refreshSession(session.accessToken)) ?? session;
  }
  if (session) config.headers.set("Authorization", `Bearer ${session.accessToken}`);
  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error: AxiosError) => {
    const original = error.config as (InternalAxiosRequestConfig & { _retried?: boolean }) | undefined;
    const isAuthCall = original?.url?.startsWith("/auth/");
    if (error.response?.status === 401 && original && !original._retried && !isAuthCall) {
      original._retried = true;
      const stale = original.headers.get("Authorization")?.toString().replace("Bearer ", "");
      const session = await refreshSession(stale);
      if (session) {
        original.headers.set("Authorization", `Bearer ${session.accessToken}`);
        return api(original);
      }
    }
    return Promise.reject(toApiError(error));
  },
);

/** Reads the `pc` claim: true once the admin passcode step has been completed for this session. */
export const isPasscodeVerified = (): boolean => {
  const token = readSession()?.accessToken;
  if (!token) return false;
  try {
    const payload = JSON.parse(atob(token.split(".")[1].replace(/-/g, "+").replace(/_/g, "/")));
    return payload.pc === true;
  } catch {
    return false;
  }
};
