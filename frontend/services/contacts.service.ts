
const API_URL = process.env.NEXT_PUBLIC_API_URL;

export interface Contact {
  id: number;
  firstName: string;
  lastName: string;
  company?: string | null;
  jobTitle?: string | null;
  notes?: string | null;
  createdAt?: string;
  updatedAt?: string;
}

export interface ContactsResult {
  content: Contact[];
  totalPages: number;
  totalElements: number;
  number: number;
}

export interface CreateContactData {
  firstName: string;
  lastName: string;
  company?: string;
  jobTitle?: string;
  notes?: string;
}

export async function getContacts(
  search = "",
  page = 0,
  size = 10
): Promise<ContactsResult> {
  if (!API_URL) {
    throw new Error("No está configurada la URL del backend.");
  }

  const token = sessionStorage.getItem("sgc_token");

  if (!token) {
    throw new Error("Tu sesión ha expirado. Inicia sesión nuevamente.");
  }

  const params = new URLSearchParams({
    page: String(page),
    size: String(size),
  });

  if (search.trim()) {
    params.set("search", search.trim());
  }

  const response = await fetch(
    `${API_URL}/api/contacts?${params.toString()}`,
    {
      method: "GET",
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: "application/json",
      },
      cache: "no-store",
    }
  );

  if (!response.ok) {
    if (response.status === 401 || response.status === 403) {
      throw new Error(
        "No tienes autorización para consultar los contactos. Verifica tu sesión."
      );
    }

    throw new Error(
      `No fue posible cargar los contactos (HTTP ${response.status}).`
    );
  }

  const data: unknown = await response.json();

  if (Array.isArray(data)) {
    return {
      content: data as Contact[],
      totalPages: 1,
      totalElements: data.length,
      number: 0,
    };
  }

  if (typeof data !== "object" || data === null) {
    throw new Error("El backend devolvió una respuesta no válida.");
  }

  const result = data as Record<string, unknown>;

  if (!Array.isArray(result.content)) {
    throw new Error(
      "La respuesta no contiene la lista de contactos esperada."
    );
  }

  return {
    content: result.content as Contact[],
    totalPages:
      typeof result.totalPages === "number" ? result.totalPages : 1,
    totalElements:
      typeof result.totalElements === "number"
        ? result.totalElements
        : result.content.length,
    number: typeof result.number === "number" ? result.number : page,
  };
}

export async function createContact(
  data: CreateContactData
): Promise<Contact> {
  if (!API_URL) {
    throw new Error("No está configurada la URL del backend.");
  }

  const token = sessionStorage.getItem("sgc_token");

  if (!token) {
    throw new Error("Tu sesión ha expirado. Inicia sesión nuevamente.");
  }

  const response = await fetch(`${API_URL}/api/contacts`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const result: unknown = await response.json().catch(() => null);
    const body =
      typeof result === "object" && result !== null
        ? (result as Record<string, unknown>)
        : {};

    throw new Error(
      typeof body.message === "string"
        ? body.message
        : `No fue posible crear el contacto (HTTP ${response.status}).`
    );
  }

  // Algunos endpoints devuelven el contacto creado y otros no devuelven contenido.
  const text = await response.text();

  if (!text.trim()) {
    return {
      id: Date.now(),
      ...data,
    };
  }

  const result: unknown = JSON.parse(text);

  if (typeof result !== "object" || result === null) {
    throw new Error("El backend devolvió una respuesta no válida.");
  }

  return result as Contact;
}


export async function getContactById(id: number): Promise<Contact> {
  if (!API_URL) {
    throw new Error("No está configurada la URL del backend.");
  }

  const token = sessionStorage.getItem("sgc_token");

  if (!token) {
    throw new Error("Tu sesión ha expirado. Inicia sesión nuevamente.");
  }

  const response = await fetch(`${API_URL}/api/contacts/${id}`, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(
      `No fue posible consultar el contacto (HTTP ${response.status}).`
    );
  }

  return (await response.json()) as Contact;
}

export async function updateContact(
  id: number,
  data: CreateContactData
): Promise<Contact | null> {
  if (!API_URL) {
    throw new Error("No está configurada la URL del backend.");
  }

  const token = sessionStorage.getItem("sgc_token");

  if (!token) {
    throw new Error("Tu sesión ha expirado. Inicia sesión nuevamente.");
  }

  const response = await fetch(`${API_URL}/api/contacts/${id}`, {
    method: "PUT",
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
      Accept: "application/json",
    },
    body: JSON.stringify(data),
  });

  if (!response.ok) {
    const result: unknown = await response.json().catch(() => null);
    const body =
      typeof result === "object" && result !== null
        ? (result as Record<string, unknown>)
        : {};

    throw new Error(
      typeof body.message === "string"
        ? body.message
        : `No fue posible actualizar el contacto (HTTP ${response.status}).`
    );
  }

  const text = await response.text();

  if (!text.trim()) {
    return null;
  }

  return JSON.parse(text) as Contact;
}


export async function deleteContact(id: number): Promise<void> {
  if (!API_URL) {
    throw new Error("No está configurada la URL del backend.");
  }

  const token = sessionStorage.getItem("sgc_token");

  if (!token) {
    throw new Error("Tu sesión ha expirado. Inicia sesión nuevamente.");
  }

  const response = await fetch(`${API_URL}/api/contacts/${id}`, {
    method: "DELETE",
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: "application/json",
    },
  });

  if (!response.ok) {
    const result: unknown = await response.json().catch(() => null);
    const body =
      typeof result === "object" && result !== null
        ? (result as Record<string, unknown>)
        : {};

    throw new Error(
      typeof body.message === "string"
        ? body.message
        : `No fue posible eliminar el contacto (HTTP ${response.status}).`
    );
  }
}
