// /store/useAuthStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { setAuthToken, apiFetch } from "@/lib/api";
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

  signIn: (data: SignInFormData) => Promise<void>;
  signOut: () => void;
  restoreSession: () => Promise<void>;

  updateProfile: (updates: FormData) => Promise<void>;
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
          set({ user: res.user, token: res.token, loading: false });
        } catch (err: unknown) {
          const message = err instanceof Error ? err.message : "Sign in failed";
          set({ error: message, loading: false });
        }
      },

      // --- Sign Out ---
      signOut: () => {
        setAuthToken(null);
        set({ user: null, token: null });
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
              set({ user, token, loading: false });
              return;
            }
          }

          set({ loading: false });
        } catch {
          setAuthToken(null);
          set({ user: null, token: null, loading: false });
        }
      },

      // --- Update Profile ---
      updateProfile: async (formData) => {
        set({ loading: true });
        try {
          const updated = await apiFetch<User>("/user/updateProfile", {
            method: "PUT",
            body: formData,
          });
          set({ user: updated, loading: false });
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Profile update failed";
          set({ error: message, loading: false });
        }
      },

      // --- Update Password ---
      updatePassword: async (payload) => {
        set({ loading: true });
        try {
          await apiFetch("/user/updatePassword", {
            method: "POST",
            body: JSON.stringify(payload),
          });
          set({ loading: false });
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Password update failed";
          set({ error: message, loading: false });
        }
      },
    }),
    {
      name: "auth-storage",
      partialize: (state) => ({
        token: state.token,
        user: state.user,
      }),
    }
  )
);
