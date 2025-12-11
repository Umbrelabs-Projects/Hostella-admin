// /store/useAuthStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { setAuthToken, apiFetch, APIException } from "@/lib/api";
import { SignInFormData } from "@/app/(auth)/validations/signInSchema";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  loading: boolean;
  error: string | null;
  isAuthenticated: boolean;

  signIn: (data: SignInFormData) => Promise<void>;
  signOut: () => void;
  restoreSession: () => Promise<void>;
  clearError: () => void;

  updateProfile: (updates: Partial<User>) => Promise<void>;
  updatePassword: (payload: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<void>;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      loading: false,
      error: null,
      isAuthenticated: false,

      // --- Sign In ---
      signIn: async (data) => {
        set({ loading: true, error: null });
        try {
          const res = await apiFetch<{ user: User; token: string }>(
            "/auth/login",
            {
              method: "POST",
              body: JSON.stringify(data),
            }
          );

          setAuthToken(res.token);
          set({
            user: res.user,
            token: res.token,
            loading: false,
            isAuthenticated: true,
            error: null,
          });
        } catch (err: unknown) {
          const message =
            err instanceof APIException
              ? err.message
              : err instanceof Error
                ? err.message
                : "Sign in failed";
          set({ error: message, loading: false, isAuthenticated: false });
          throw err;
        }
      },

      // --- Sign Out ---
      signOut: () => {
        setAuthToken(null);
        set({
          user: null,
          token: null,
          isAuthenticated: false,
          error: null,
        });
        localStorage.removeItem("auth-storage");
      },

      // --- Restore Session ---
      restoreSession: async () => {
        set({ loading: true });
        try {
          const stored = localStorage.getItem("auth-storage");

          if (stored) {
            const parsed = JSON.parse(stored);
            const token = parsed?.state?.token;

            if (token) {
              setAuthToken(token);
              const user = await apiFetch<User>("/auth/me");
              set({
                user,
                token,
                loading: false,
                isAuthenticated: true,
                error: null,
              });
              return;
            }
          }

          set({ loading: false, isAuthenticated: false });
        } catch (err) {
          setAuthToken(null);
          set({
            user: null,
            token: null,
            loading: false,
            isAuthenticated: false,
            error:
              err instanceof Error ? err.message : "Session restoration failed",
          });
        }
      },

      // --- Clear Error ---
      clearError: () => {
        set({ error: null });
      },

      // --- Update Profile ---
      updateProfile: async (updates) => {
        set({ loading: true });
        try {
          const updated = await apiFetch<User>("/auth/profile", {
            method: "PUT",
            body: JSON.stringify(updates),
          });
          set({ user: updated, loading: false, error: null });
        } catch (err) {
          const message =
            err instanceof APIException
              ? err.message
              : err instanceof Error
                ? err.message
                : "Profile update failed";
          set({ error: message, loading: false });
          throw err;
        }
      },

      // --- Update Password ---
      updatePassword: async (payload) => {
        set({ loading: true });
        try {
          await apiFetch("/auth/password", {
            method: "POST",
            body: JSON.stringify(payload),
          });
          set({ loading: false, error: null });
        } catch (err) {
          const message =
            err instanceof APIException
              ? err.message
              : err instanceof Error
                ? err.message
                : "Password update failed";
          set({ error: message, loading: false });
          throw err;
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
        isAuthenticated: state.isAuthenticated,
      }),
    }
  )
);
