// /store/useAuthStore.ts
import { create } from "zustand";
import { persist } from "zustand/middleware";
import { apiFetch } from "@/lib/api";
import { SignInFormData } from "@/app/(auth)/validations/signInSchema";

interface User {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone?: string;
  avatar?: string;
  emailVerified?: boolean;
  phoneVerified?: boolean;
  role?: "STUDENT" | "ADMIN" | "SUPER_ADMIN";
  hostelId?: string | null;
  updatedAt?: string; // ISO timestamp of last profile update
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  loading: boolean;
  initializing: boolean; // Separate state for initial session restore
  error: string | null;

  signIn: (data: SignInFormData) => Promise<void>;
  signOut: () => void;
  restoreSession: () => Promise<void>;
  fetchProfile: () => Promise<void>;

  updateProfile: (updates: FormData) => Promise<void>;
  updatePassword: (payload: {
    currentPassword: string;
    newPassword: string;
  }) => Promise<void>;
  clearError: () => void;
}

// Helper function to extract user from different API response formats
function extractUserFromResponse<T extends User>(
  response: T | { success: boolean; data: T } | { data: T }
): T {
  if ("data" in response && response.data) {
    return response.data;
  }
  if ("success" in response && "data" in response && response.data) {
    return response.data;
  }
  return response as T;
}

const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      loading: false,
      initializing: true, // Start as true, will be set to false after session check
      error: null,

      clearError: () => set({ error: null }),

      // --- Sign In ---
      signIn: async (data) => {
        set({ loading: true, error: null });
        try {
          const res = await apiFetch<
            | { user: User; token: string }
            | { success: boolean; data: { user: User; token: string } }
            | { data: { user: User; token: string } }
            | { user: User; accessToken: string }
            | { user: User; access_token: string }
          >("/auth/login", {
            method: "POST",
            body: JSON.stringify(data),
          });

          // Log the response for debugging
          console.log("[signIn] Raw API response:", res);
          console.log("[signIn] Response type:", typeof res);
          console.log("[signIn] Response keys:", res ? Object.keys(res) : "null");

          // Handle different response formats
          let user: User | null = null;
          let token: string | null = null;

          // Format 1: { user: {...}, token: "..." }
          if ("user" in res && "token" in res) {
            user = res.user;
            token = res.token;
          }
          // Format 2: { success: true, data: { user: {...}, token: "..." } }
          else if ("success" in res && "data" in res && res.data) {
            user = res.data.user;
            token = res.data.token;
          }
          // Format 3: { data: { user: {...}, token: "..." } }
          else if ("data" in res && res.data) {
            user = res.data.user;
            token = res.data.token;
          }
          // Format 4: { user: {...}, accessToken: "..." }
          else if ("user" in res && "accessToken" in res) {
            user = res.user;
            token = res.accessToken;
          }
          // Format 5: { user: {...}, access_token: "..." }
          else if ("user" in res && "access_token" in res) {
            user = res.user;
            token = res.access_token;
          }

          // Defensive: Only proceed if token is a non-empty string
          if (!token || typeof token !== "string" || !token.trim()) {
            // Log the actual response for debugging
            console.error("[signIn] Unexpected response format. Received:", JSON.stringify(res, null, 2));
            console.error("[signIn] Response keys:", Object.keys(res || {}));
            // Clear all auth state and force logout
            set({ user: null, token: null, isAuthenticated: false, loading: false });
            if (typeof document !== "undefined") {
              document.cookie = `auth-token=; Path=/; Max-Age=0; SameSite=Lax`;
            }
            throw new Error("Login failed: No token returned from server. Check console for response details.");
          }

          if (!user) {
            if (process.env.NODE_ENV === "development") {
              console.error("[signIn] No user in response:", res);
            }
            throw new Error("Login failed: No user data returned from server.");
          }

          set({ user, token, isAuthenticated: true, loading: false });
          // Sync cookie for middleware
          if (typeof document !== "undefined") {
            const maxAge = 7 * 24 * 60 * 60;
            document.cookie = `auth-token=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
          }
        } catch (err: unknown) {
          // Always clear state and cookie on error
          const message = err instanceof Error ? err.message : "Sign in failed";
          set({ user: null, token: null, isAuthenticated: false, loading: false, error: message });
          if (typeof document !== "undefined") {
            document.cookie = `auth-token=; Path=/; Max-Age=0; SameSite=Lax`;
          }
          throw new Error(message);
        }
      },

      // --- Sign Out ---
      signOut: () => {
        set({ user: null, token: null, isAuthenticated: false, error: null });
        localStorage.removeItem("auth-storage");
        if (typeof document !== "undefined") {
          document.cookie = `auth-token=; Path=/; Max-Age=0; SameSite=Lax`;
        }
      },

      // --- Restore Session ---
      restoreSession: async () => {
        try {
          const stored = localStorage.getItem("auth-storage");

          let parsedToken: string | null = null;
          let parsedUser: User | null = null;

          if (stored) {
            const parsed = JSON.parse(stored);
            parsedToken = parsed?.state?.token ?? parsed?.token ?? null;
            parsedUser = parsed?.state?.user ?? parsed?.user ?? null;
          }

          // Source of truth is persisted storage
          const token = parsedToken ?? null;
          const cachedUser: User | null = parsedUser ?? null;

          if (token) {
            let restoredUser: User;
            if (cachedUser) {
              restoredUser = cachedUser;
            } else {
              // Fetch profile - handle wrapped response format
              const profileRes = await apiFetch<
                | User
                | { success: boolean; data: User }
                | { data: User }
              >("/user/profile");
              
              restoredUser = extractUserFromResponse(profileRes);
            }
            
            set({ user: restoredUser, token, isAuthenticated: true, initializing: false });
            // Normalize persisted shape so future rehydration matches
            try {
              localStorage.setItem(
                "auth-storage",
                JSON.stringify({ state: { token, user: restoredUser }, version: 0 })
              );
            } catch {}
            if (typeof document !== "undefined") {
              const maxAge = 7 * 24 * 60 * 60;
              document.cookie = `auth-token=${encodeURIComponent(token)}; Path=/; Max-Age=${maxAge}; SameSite=Lax`;
            }
            return;
          }

          set({ isAuthenticated: false, initializing: false });
        } catch {
          set({ user: null, token: null, isAuthenticated: false, initializing: false });
          if (typeof document !== "undefined") {
            document.cookie = `auth-token=; Path=/; Max-Age=0; SameSite=Lax`;
          }
        }
      },

      // --- Fetch Profile ---
      fetchProfile: async () => {
        // Don't set loading state for background fetches
        set({ error: null });
        try {
          const profileRes = await apiFetch<
            | User
            | { success: boolean; data: User }
            | { data: User }
          >("/user/profile");
          
          const user = extractUserFromResponse(profileRes);
          // Only update if we got valid user data
          if (user && user.id) {
            set({ user });
            if (process.env.NODE_ENV === "development") {
              console.log("[fetchProfile] Profile synced:", user);
            }
          } else {
            console.error("[fetchProfile] Invalid user data received:", user);
            set({ error: "Invalid user data received from server" });
          }
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Failed to fetch profile";
          console.error("[fetchProfile] Error:", err);
          set({ error: message });
          // Don't clear user on error - keep existing user data
        }
      },

      // --- Update Profile ---
      updateProfile: async (formData) => {
        set({ loading: true, error: null });
        try {
          if (process.env.NODE_ENV === "development") {
            console.log("[updateProfile] Uploading profile data...");
          }
          // API returns wrapped response: { success: true, data: User } or { data: User }
          const updateRes = await apiFetch<
            | User
            | { success: boolean; data: User }
            | { data: User }
          >("/user/profile", {
            method: "PUT",
            body: formData,
          });
          
          const updated = extractUserFromResponse(updateRes);
          
          if (process.env.NODE_ENV === "development") {
            console.log("[updateProfile] Received updated user:", updated);
          }
          // Update user with returned data and refetch full profile
          set({ user: updated, loading: false });
          // Refetch to ensure we have the latest data from server
          try {
            const profileRes = await apiFetch<
              | User
              | { success: boolean; data: User }
              | { data: User }
            >("/user/profile");
            
            const latestUser = extractUserFromResponse(profileRes);
            
            if (process.env.NODE_ENV === "development") {
              console.log(
                "[updateProfile] Refetched user from /user/profile:",
                latestUser
              );
            }
            set({ user: latestUser });
          } catch (error) {
            if (process.env.NODE_ENV === "development") {
              console.error("[updateProfile] Refetch failed:", error);
            }
            // If refetch fails, still keep the returned user data
          }
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Profile update failed";
          set({ error: message, loading: false });
          throw new Error(message);
        }
      },

      // --- Update Password ---
      updatePassword: async (payload) => {
        set({ loading: true, error: null });
        try {
          await apiFetch<{ message: string }>("/user/password", {
            method: "PUT",
            body: JSON.stringify(payload),
          });
          set({ loading: false, error: null });
        } catch (err) {
          const message =
            err instanceof Error ? err.message : "Password update failed";
          set({ error: message, loading: false });
          throw new Error(message);
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

export { useAuthStore };
