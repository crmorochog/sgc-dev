
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface LoginData {
  email: string;
  password: string;
}

export async function login(data: LoginData): Promise<string> {
  if (!API_URL) {
    throw new Error("No está configurada la URL del backend.");
  }

  const response = await fetch(`${API_URL}/api/auth/login`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(data),
  });

  const result: unknown = await response.json().catch(() => null);

  if (!response.ok) {
    const body =
      typeof result === "object" && result !== null
        ? (result as Record<string, unknown>)
        : {};

    throw new Error(
      typeof body.message === "string"
        ? body.message
        : "No fue posible iniciar sesión."
    );
  }

  if (typeof result !== "object" || result === null) {
    throw new Error("La respuesta del servidor no es válida.");
  }

  const body = result as Record<string, unknown>;
  const nested =
    typeof body.result === "object" && body.result !== null
      ? (body.result as Record<string, unknown>)
      : {};

  const token =
    body.token ??
    body.accessToken ??
    body.access_token ??
    nested.token ??
    nested.accessToken ??
    nested.access_token;

  if (typeof token !== "string" || !token) {
    throw new Error("No se encontró el token JWT en la respuesta.");
  }

  sessionStorage.setItem("sgc_token", token);
  return token;
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return sessionStorage.getItem("sgc_token");
}

export function logout() {
  if (typeof window !== 'undefined') {
    sessionStorage.removeItem('sgc_token');
  }
}
