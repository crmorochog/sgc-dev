
"use client";

import {
  useCallback,
  useEffect,
  useState,
  type ChangeEvent,
  type FormEvent,
} from "react";
import { useRouter } from "next/navigation";
import { getToken, logout } from "../../services/auth.service";
import {
  getContacts,
  createContact,
  getContactById,
  updateContact,
  deleteContact,
  type Contact,
  type CreateContactData,
} from "../../services/contacts.service";

type ContactFormData = {
  firstName: string;
  lastName: string;
  company: string;
  jobTitle: string;
  notes: string;
};

type FormMode = "create" | "edit";

const EMPTY_FORM: ContactFormData = {
  firstName: "",
  lastName: "",
  company: "",
  jobTitle: "",
  notes: "",
};

const PAGE_SIZE = 10;

export default function ContactsPage() {
  const router = useRouter();

  const [contacts, setContacts] = useState<Contact[]>([]);
  const [searchInput, setSearchInput] = useState("");
  const [search, setSearch] = useState("");
  const [page, setPage] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [totalElements, setTotalElements] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [formMode, setFormMode] = useState<FormMode>("create");
  const [editingId, setEditingId] = useState<number | null>(null);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState("");
  const [formSuccess, setFormSuccess] = useState("");
  const [formData, setFormData] =
    useState<ContactFormData>(EMPTY_FORM);

  const [selectedContact, setSelectedContact] =
    useState<Contact | null>(null);
  const [showDetail, setShowDetail] = useState(false);
  const [loadingDetail, setLoadingDetail] = useState(false);
  const [detailError, setDetailError] = useState("");

  const [contactToDelete, setContactToDelete] =
    useState<Contact | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [deleteError, setDeleteError] = useState("");

  const loadContacts = useCallback(async () => {
    setLoading(true);
    setError("");

    try {
      const result = await getContacts(search, page, PAGE_SIZE);

      setContacts(result.content);
      setTotalPages(Math.max(result.totalPages, 1));
      setTotalElements(result.totalElements);
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "No fue posible cargar los contactos."
      );
    } finally {
      setLoading(false);
    }
  }, [search, page]);

  useEffect(() => {
    if (!getToken()) {
      router.replace("/login");
      return;
    }

    void loadContacts();
  }, [router, loadContacts]);

  function handleLogout() {
    logout();
    router.replace("/login");
  }

  function handleSearch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPage(0);
    setSearch(searchInput.trim());
  }

  function handleFormChange(
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  function handleOpenCreateForm() {
    setFormMode("create");
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setFormError("");
    setFormSuccess("");
    setShowForm(true);
  }

  function handleCancelForm() {
    setShowForm(false);
    setEditingId(null);
    setFormData(EMPTY_FORM);
    setFormError("");
  }

  async function handleViewContact(id: number) {
    setShowDetail(true);
    setSelectedContact(null);
    setDetailError("");
    setLoadingDetail(true);

    try {
      const contact = await getContactById(id);
      setSelectedContact(contact);
    } catch (err: unknown) {
      setDetailError(
        err instanceof Error
          ? err.message
          : "No fue posible consultar el contacto."
      );
    } finally {
      setLoadingDetail(false);
    }
  }

  function handleCloseDetail() {
    setShowDetail(false);
    setSelectedContact(null);
    setDetailError("");
  }

  async function handleEditContact(id: number) {
    setFormError("");
    setFormSuccess("");
    setError("");

    try {
      const contact = await getContactById(id);

      setFormData({
        firstName: contact.firstName ?? "",
        lastName: contact.lastName ?? "",
        company: contact.company ?? "",
        jobTitle: contact.jobTitle ?? "",
        notes: contact.notes ?? "",
      });

      setEditingId(contact.id);
      setFormMode("edit");
      setShowForm(true);
      handleCloseDetail();

      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err: unknown) {
      setError(
        err instanceof Error
          ? err.message
          : "No fue posible cargar el contacto para editarlo."
      );
    }
  }

  async function handleSaveContact(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    setFormError("");
    setFormSuccess("");

    if (!formData.firstName.trim() || !formData.lastName.trim()) {
      setFormError("El nombre y el apellido son obligatorios.");
      return;
    }

    const payload: CreateContactData = {
      firstName: formData.firstName.trim(),
      lastName: formData.lastName.trim(),
      company: formData.company.trim() || undefined,
      jobTitle: formData.jobTitle.trim() || undefined,
      notes: formData.notes.trim() || undefined,
    };

    setSaving(true);

    try {
      if (formMode === "create") {
        await createContact(payload);
        setFormSuccess("El contacto se creó correctamente.");
      } else {
        if (editingId === null) {
          throw new Error(
            "No se encontró el contacto que deseas editar."
          );
        }

        await updateContact(editingId, payload);
        setFormSuccess("El contacto se actualizó correctamente.");
      }

      setShowForm(false);
      setFormData(EMPTY_FORM);
      setEditingId(null);
      setSearchInput("");
      setSearch("");
      setPage(0);

      const result = await getContacts("", 0, PAGE_SIZE);

      setContacts(result.content);
      setTotalPages(Math.max(result.totalPages, 1));
      setTotalElements(result.totalElements);
    } catch (err: unknown) {
      setFormError(
        err instanceof Error
          ? err.message
          : "No fue posible guardar el contacto."
      );
    } finally {
      setSaving(false);
    }
  }

  async function handleConfirmDelete() {
    if (!contactToDelete || deleting) return;

    setDeleting(true);
    setDeleteError("");
    setFormSuccess("");

    try {
      const deletedName =
        `${contactToDelete.firstName} ${contactToDelete.lastName}`;

      await deleteContact(contactToDelete.id);

      setContactToDelete(null);
      setFormSuccess(
        `El contacto ${deletedName} se eliminó correctamente.`
      );

      
      const result = await getContacts(search, page, PAGE_SIZE);

      setTotalElements(result.totalElements);
      setTotalPages(Math.max(result.totalPages, 1));

      if (result.content.length === 0 && page > 0) {
        
        setPage((current) => Math.max(0, current - 1));
      } else {
        setContacts(result.content);
      }
    } catch (err: unknown) {
      setDeleteError(
        err instanceof Error
          ? err.message
          : "No fue posible eliminar el contacto."
      );
    } finally {
      setDeleting(false);
    }
  }

  return (
    <main className="min-h-screen bg-slate-50">
      
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6 lg:px-8">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Gestión de contactos
            </h1>
            <p className="mt-1 text-sm text-slate-500">
              Administra y consulta tus contactos.
            </p>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              type="button"
              onClick={handleOpenCreateForm}
              className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700"
            >
              + Nuevo contacto
            </button>

            <button
              type="button"
              onClick={handleLogout}
              className="rounded-lg border border-slate-300 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 transition hover:bg-slate-100"
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </header>

      <div className="mx-auto max-w-7xl space-y-6 px-4 py-8 sm:px-6 lg:px-8">
        
        {formSuccess && (
          <div
            role="status"
            className="rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-800"
          >
            {formSuccess}
            <button
              type="button"
              onClick={() => setFormSuccess("")}
              className="ml-3 font-semibold underline"
            >
              Cerrar
            </button>
          </div>
        )}

        {error && (
          <div
            role="alert"
            className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
          >
            {error}
            <button
              type="button"
              onClick={() => void loadContacts()}
              className="ml-3 font-semibold underline"
            >
              Reintentar
            </button>
          </div>
        )}

        {showForm && (
          <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm sm:p-6">
            <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
              <div>
                <h2 className="text-xl font-bold text-slate-900">
                  {formMode === "create"
                    ? "Crear contacto"
                    : "Editar contacto"}
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Los campos marcados con * son obligatorios.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCancelForm}
                disabled={saving}
                className="rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancelar
              </button>
            </div>

            {formError && (
              <div
                role="alert"
                className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
              >
                {formError}
              </div>
            )}

            <form onSubmit={handleSaveContact} className="space-y-5">
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div>
                  <label
                    htmlFor="firstName"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Nombre *
                  </label>
                  <input
                    id="firstName"
                    name="firstName"
                    value={formData.firstName}
                    onChange={handleFormChange}
                    required
                    maxLength={100}
                    autoComplete="given-name"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Nombre"
                  />
                </div>

                <div>
                  <label
                    htmlFor="lastName"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Apellido *
                  </label>
                  <input
                    id="lastName"
                    name="lastName"
                    value={formData.lastName}
                    onChange={handleFormChange}
                    required
                    maxLength={100}
                    autoComplete="family-name"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Apellido"
                  />
                </div>

                <div>
                  <label
                    htmlFor="company"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Empresa
                  </label>
                  <input
                    id="company"
                    name="company"
                    value={formData.company}
                    onChange={handleFormChange}
                    maxLength={150}
                    autoComplete="organization"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Nombre de la empresa"
                  />
                </div>

                <div>
                  <label
                    htmlFor="jobTitle"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Cargo
                  </label>
                  <input
                    id="jobTitle"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleFormChange}
                    maxLength={150}
                    autoComplete="organization-title"
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Cargo o puesto"
                  />
                </div>

                <div className="sm:col-span-2">
                  <label
                    htmlFor="notes"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Notas
                  </label>
                  <textarea
                    id="notes"
                    name="notes"
                    value={formData.notes}
                    onChange={handleFormChange}
                    rows={4}
                    maxLength={2000}
                    className="w-full resize-y rounded-lg border border-slate-300 px-3 py-2.5 text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                    placeholder="Información adicional..."
                  />
                </div>
              </div>

              <div className="flex flex-wrap gap-3 border-t border-slate-100 pt-5">
                <button
                  type="submit"
                  disabled={saving}
                  className="rounded-lg bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {saving
                    ? "Guardando..."
                    : formMode === "create"
                      ? "Crear contacto"
                      : "Guardar cambios"}
                </button>

                <button
                  type="button"
                  onClick={handleCancelForm}
                  disabled={saving}
                  className="rounded-lg border border-slate-300 px-5 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
                >
                  Cancelar
                </button>
              </div>
            </form>
          </section>
        )}

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-5 py-5 sm:px-6">
            <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <h2 className="text-lg font-bold text-slate-900">
                  Mis contactos
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  {totalElements} contacto(s) en total
                </p>
              </div>

              <form
                onSubmit={handleSearch}
                className="flex w-full gap-2 sm:max-w-md"
              >
                <input
                  type="search"
                  value={searchInput}
                  onChange={(event) =>
                    setSearchInput(event.target.value)
                  }
                  placeholder="Buscar por nombre o empresa..."
                  aria-label="Buscar contactos"
                  className="min-w-0 flex-1 rounded-lg border border-slate-300 px-3 py-2.5 text-sm text-slate-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-100"
                />

                <button
                  type="submit"
                  className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
                >
                  Buscar
                </button>
              </form>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-left text-sm">
              <thead className="bg-slate-50 text-xs uppercase tracking-wide text-slate-500">
                <tr>
                  <th className="px-5 py-4 font-semibold">Nombre</th>
                  <th className="px-5 py-4 font-semibold">Empresa</th>
                  <th className="px-5 py-4 font-semibold">Cargo</th>
                  <th className="px-5 py-4 text-right font-semibold">
                    Acciones
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-12 text-center text-slate-500"
                    >
                      Cargando contactos...
                    </td>
                  </tr>
                ) : contacts.length === 0 ? (
                  <tr>
                    <td
                      colSpan={4}
                      className="px-5 py-12 text-center"
                    >
                      <p className="font-medium text-slate-700">
                        No se encontraron contactos
                      </p>
                      <p className="mt-1 text-slate-500">
                        Prueba otra búsqueda o crea un contacto nuevo.
                      </p>
                    </td>
                  </tr>
                ) : (
                  contacts.map((contact) => (
                    <tr
                      key={contact.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-5 py-4">
                        <div className="font-semibold text-slate-900">
                          {contact.firstName} {contact.lastName}
                        </div>
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {contact.company || "—"}
                      </td>

                      <td className="px-5 py-4 text-slate-600">
                        {contact.jobTitle || "—"}
                      </td>

                      <td className="px-5 py-4">
                        <div className="flex justify-end gap-2">
                          <button
                            type="button"
                            onClick={() =>
                              void handleViewContact(contact.id)
                            }
                            className="rounded-md border border-slate-300 px-3 py-1.5 text-xs font-semibold text-slate-700 hover:bg-slate-100"
                          >
                            Ver
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              void handleEditContact(contact.id)
                            }
                            className="rounded-md border border-blue-200 px-3 py-1.5 text-xs font-semibold text-blue-700 hover:bg-blue-50"
                          >
                            Editar
                          </button>

                          <button
                            type="button"
                            onClick={() => {
                              setDeleteError("");
                              setContactToDelete(contact);
                            }}
                            className="rounded-md border border-red-200 px-3 py-1.5 text-xs font-semibold text-red-700 hover:bg-red-50"
                          >
                            Eliminar
                          </button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          <div className="flex flex-col gap-3 border-t border-slate-200 px-5 py-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-slate-500">
              Página {page + 1} de {totalPages}
            </p>

            <div className="flex gap-2">
              <button
                type="button"
                disabled={loading || page <= 0}
                onClick={() =>
                  setPage((current) => Math.max(0, current - 1))
                }
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Anterior
              </button>

              <button
                type="button"
                disabled={loading || page + 1 >= totalPages}
                onClick={() =>
                  setPage((current) =>
                    Math.min(totalPages - 1, current + 1)
                  )
                }
                className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
              >
                Siguiente
              </button>
            </div>
          </div>
        </section>
      </div>

      {showDetail && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-y-auto bg-slate-950/50 p-4"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget) {
              handleCloseDetail();
            }
          }}
        >
          <section
            role="dialog"
            aria-modal="true"
            aria-labelledby="contact-detail-title"
            className="my-8 w-full max-w-2xl rounded-2xl bg-white shadow-xl"
          >
            <div className="flex items-start justify-between gap-4 border-b border-slate-200 px-6 py-5">
              <div>
                <h2
                  id="contact-detail-title"
                  className="text-xl font-bold text-slate-900"
                >
                  Detalle del contacto
                </h2>
                <p className="mt-1 text-sm text-slate-500">
                  Información registrada del contacto.
                </p>
              </div>

              <button
                type="button"
                onClick={handleCloseDetail}
                aria-label="Cerrar detalle"
                className="rounded-lg px-3 py-1 text-xl text-slate-500 hover:bg-slate-100 hover:text-slate-900"
              >
                ×
              </button>
            </div>

            <div className="space-y-5 px-6 py-6">
              {loadingDetail ? (
                <p className="py-8 text-center text-slate-500">
                  Cargando información...
                </p>
              ) : detailError ? (
                <div
                  role="alert"
                  className="rounded-lg border border-red-200 bg-red-50 p-4 text-sm text-red-700"
                >
                  {detailError}
                </div>
              ) : selectedContact ? (
                <>
                  <div className="rounded-xl bg-slate-50 p-4">
                    <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
                      Nombre completo
                    </p>
                    <p className="mt-1 text-lg font-bold text-slate-900">
                      {selectedContact.firstName}{" "}
                      {selectedContact.lastName}
                    </p>
                  </div>

                  <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                    <DetailField
                      label="Empresa"
                      value={selectedContact.company}
                    />
                    <DetailField
                      label="Cargo"
                      value={selectedContact.jobTitle}
                    />
                    <DetailField
                      label="Fecha de creación"
                      value={formatDate(selectedContact.createdAt)}
                    />
                    <DetailField
                      label="Última actualización"
                      value={formatDate(selectedContact.updatedAt)}
                    />
                    <div className="sm:col-span-2">
                      <DetailField
                        label="Notas"
                        value={selectedContact.notes}
                      />
                    </div>
                  </div>
                </>
              ) : null}
            </div>

            <div className="flex flex-wrap justify-end gap-3 border-t border-slate-200 px-6 py-4">
              <button
                type="button"
                onClick={handleCloseDetail}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50"
              >
                Cerrar
              </button>

              {selectedContact && !loadingDetail && (
                <button
                  type="button"
                  onClick={() =>
                    void handleEditContact(selectedContact.id)
                  }
                  className="rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-blue-700"
                >
                  Editar contacto
                </button>
              )}
            </div>
          </section>
        </div>
      )}

      {contactToDelete && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-slate-950/50 p-4">
          <section
            role="alertdialog"
            aria-modal="true"
            aria-labelledby="delete-contact-title"
            className="w-full max-w-md rounded-2xl bg-white p-6 shadow-xl"
          >
            <div className="mb-4 flex h-12 w-12 items-center justify-center rounded-full bg-red-100 text-red-600">
              <span className="text-2xl">!</span>
            </div>

            <h2
              id="delete-contact-title"
              className="text-lg font-bold text-slate-900"
            >
              ¿Eliminar contacto?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-600">
              Estás a punto de eliminar a{" "}
              <strong>
                {contactToDelete.firstName}{" "}
                {contactToDelete.lastName}
              </strong>
              . Esta acción no se puede deshacer.
            </p>

            {deleteError && (
              <div
                role="alert"
                className="mt-4 rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700"
              >
                {deleteError}
              </div>
            )}

            <div className="mt-6 flex flex-wrap justify-end gap-3">
              <button
                type="button"
                disabled={deleting}
                onClick={() => {
                  setContactToDelete(null);
                  setDeleteError("");
                }}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-semibold text-slate-700 hover:bg-slate-50 disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="button"
                disabled={deleting}
                onClick={() => void handleConfirmDelete()}
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-semibold text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleting ? "Eliminando..." : "Sí, eliminar"}
              </button>
            </div>
          </section>
        </div>
      )}
    </main>
  );
}

function DetailField({
  label,
  value,
}: {
  label: string;
  value: string | null | undefined;
}) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-wide text-slate-500">
        {label}
      </p>
      <p className="mt-1 whitespace-pre-wrap break-words text-sm text-slate-800">
        {value || "No registrado"}
      </p>
    </div>
  );
}

function formatDate(value: string | undefined): string {
  if (!value) return "No registrada";

  const date = new Date(value);

  if (Number.isNaN(date.getTime())) return value;

  return new Intl.DateTimeFormat("es-EC", {
    dateStyle: "medium",
    timeStyle: "short",
  }).format(date);
}
