let authToken: string | null = null;
const errorCache = new Map<string, APIException>();

export const setAuthToken = (token: string | null) => {
  authToken = token;
};

export const getAuthToken = () => {
  authToken = null;
  try {
    const raw = typeof localStorage !== "undefined" ? localStorage.getItem("auth-storage") : null;
    if (raw) {
      const parsed = JSON.parse(raw);
      const token = parsed?.token ?? parsed?.state?.token ?? null;
      authToken = typeof token === "string" ? token : null;
    }
  } catch {
    authToken = null;
  }
  return authToken;
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
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
    ...(options.headers as Record<string, string> | undefined),
  };

  const effectiveToken = getAuthToken();
  if (effectiveToken) {
    headers["Authorization"] = `Bearer ${effectiveToken}`;
  }

  const url = `${baseUrl}${endpoint}`;
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
      const errorMessage =
        typeof data === "object" && data !== null && "message" in data
          ? (data as Record<string, unknown>).message
          : typeof data === "string"
            ? data
            : `API error: ${res.status}`;

      const ex = new APIException(String(errorMessage), res.status, data);
      errorCache.set(cacheKey, ex);
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
