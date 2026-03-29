const TOKEN_KEY = "fm_mobile_token";

export function getMobileToken(): string | null {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setMobileToken(token: string): void {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearMobileToken(): void {
  localStorage.removeItem(TOKEN_KEY);
}

export async function mobileFetch<T>(path: string, options?: RequestInit): Promise<T> {
  const token = getMobileToken();
  const res = await fetch(path, {
    ...options,
    headers: {
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...((options?.headers as Record<string, string>) ?? {}),
    },
  });
  if (res.status === 401) {
    clearMobileToken();
    window.location.href = "/mobile";
    throw new Error("Unauthorized");
  }
  if (!res.ok) {
    const err = await res.json().catch(() => ({ error: "Request failed" }));
    throw new Error(err.error ?? `HTTP ${res.status}`);
  }
  return res.json();
}
