let authToken: string | null = null;
const errorCache = new Map<string, APIException>();

export const setAuthToken = (token: string | null) => {
  authToken = token;
  if (typeof document !== "undefined") {
    if (token) {
      const expiryDate = new Date();
      expiryDate.setTime(expiryDate.getTime() + 7 * 24 * 60 * 60 * 1000);
      document.cookie = `auth-token=${encodeURIComponent(token)}; path=/; SameSite=Lax; expires=${expiryDate.toUTCString()}`;
    } else {
      document.cookie = "auth-token=; path=/; expires=Thu, 01 Jan 1970 00:00:00 GMT; SameSite=Lax";
    }
  }
};

export const getAuthToken = () => {
  // localStorage first (keeps existing tests stable)
  try {
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem("auth-storage") : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      const token = parsed?.token ?? parsed?.state?.token ?? null;
      if (typeof token === "string") {
        return token;
      }
    }
  } catch {
    // ignore
  }
  // Cookie fallback
  try {
    if (typeof document !== "undefined" && document.cookie) {
      const cookies = document.cookie.split("; ");
      const tokenCookie = cookies.find((c) => c.startsWith("auth-token="));
      if (tokenCookie) {
        const token = decodeURIComponent(tokenCookie.substring("auth-token=".length));
        return token;
      }
    }
  } catch {
    // ignore
  }
  return null;
};

export interface ApiError {
  message: string;
  status: number;
  details?: unknown;
}

export class APIException extends Error implements ApiError {
  status: number;
  details?: unknown;

  constructor(message: string, status: number, details?: unknown) {
    super(message);
    this.status = status;
    this.details = details;
    Object.setPrototypeOf(this, APIException.prototype);
  }
}

export async function apiFetch<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const baseUrl = process.env.API_URL ?? "";
  const versionedEndpoint = endpoint.startsWith("/api/v1") ? endpoint : `/api/v1${endpoint}`;
  const isFormData = typeof FormData !== "undefined" && options.body instanceof FormData;
  const headers: Record<string, string> = {
    ...(isFormData ? {} : { "Content-Type": "application/json" }),
    ...(options.headers as Record<string, string> | undefined),
  };

  const effectiveToken = getAuthToken();
  if (effectiveToken) {
    headers["Authorization"] = `Bearer ${effectiveToken}`;
  }

  const url = `${baseUrl}${versionedEndpoint}`;
  const cacheKey = `${options.method || "GET"}:${url}`;

  if (errorCache.has(cacheKey)) {
    throw errorCache.get(cacheKey)!;
  }

  try {
    const res = await fetch(url, { ...options, headers });

    const contentType = res.headers.get("content-type");
    let data: unknown;

    if (contentType?.includes("application/json")) {
      data = await res.json();
    } else {
      data = await res.text();
    }

    if (!res.ok) {
      // Handle error response format: { success: false, message: "...", errors: [...] } or { message: "..." }
      let errorMessage = `API error: ${res.status}`;
      
      if (typeof data === "object" && data !== null) {
        const errorData = data as Record<string, unknown>;
        
        // Check for validation errors array
        if ("errors" in errorData && Array.isArray(errorData.errors)) {
          const errors = errorData.errors as Array<{ path?: string[]; message?: string }>;
          if (errors.length > 0) {
            const firstError = errors[0];
            const fieldPath = firstError.path?.join(".") || "field";
            errorMessage = `${fieldPath}: ${firstError.message || "Validation error"}`;
          } else if ("message" in errorData) {
            errorMessage = String(errorData.message);
          }
        } else if ("message" in errorData) {
          errorMessage = String(errorData.message);
        } else if ("error" in errorData) {
          errorMessage = String(errorData.error);
        }
      } else if (typeof data === "string") {
        errorMessage = data;
      }

      const ex = new APIException(errorMessage, res.status, data);
      errorCache.set(cacheKey, ex);
      
      // Handle 401 Unauthorized - clear auth and redirect to login
      if (res.status === 401 && typeof window !== "undefined") {
        // Clear auth token
        setAuthToken(null);
        // Redirect to login if not already on login page
        if (window.location.pathname !== "/") {
          window.location.href = "/";
        }
      }
      
      throw ex;
    }

    return data as T;
  } catch (error) {
    if (error instanceof APIException) {
      throw error;
    }

    if (error instanceof TypeError) {
      throw new APIException(
        "Network error. Please check your connection.",
        0,
        error.message
      );
    }

    throw new APIException(
      error instanceof Error ? error.message : "An unexpected error occurred",
      500,
      error
    );
  }
}
