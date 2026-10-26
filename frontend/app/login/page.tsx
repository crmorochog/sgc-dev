
"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { login } from "../../services/auth.service";
import { useEffect } from 'react';

const loginSchema = z.object({
  email: z.string().email("Ingresa un correo electrónico válido."),
  password: z.string().min(1, "Ingresa tu contraseña."),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const router = useRouter();
  const [serverError, setServerError] = useState("");
  const [submitting, setSubmitting] = useState(false);

	const {
	  register,
	  handleSubmit,
	  reset,
	  formState: { errors },
	} = useForm<LoginFormData>({
	  resolver: zodResolver(loginSchema),
	});
  
  useEffect(() => {
	  reset({
		email: '',
		password: '',
	  });
	}, [reset]);

  async function onSubmit(values: LoginFormValues) {
    setServerError("");
    setSubmitting(true);

    try {
      await login(values);
      router.replace("/contacts");
    } catch (error) {
      setServerError(
        error instanceof Error
          ? error.message
          : "Ocurrió un error al iniciar sesión."
      );
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-100 px-4 py-10">
      <section className="w-full max-w-md rounded-2xl border border-slate-200 bg-white p-7 shadow-lg sm:p-9">
        <div className="mb-8 text-center">
         

          <h1 className="text-2xl font-bold text-slate-900">
            Bienvenido a SGC
          </h1>

        </div>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-5" autoComplete="off">
          <div>
            <label
              htmlFor="email"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Correo electrónico
            </label>

            <input
              id="email"
              type="email"
              autoComplete="off"
              placeholder="tu@correo.com"
              {...register("email")}
              aria-invalid={Boolean(errors.email)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />

            {errors.email && (
              <p className="mt-1 text-sm text-red-600">
                {errors.email.message}
              </p>
            )}
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1.5 block text-sm font-medium text-slate-700"
            >
              Contraseña
            </label>

            <input
              id="password"
              type="password"
              autoComplete="new-password"
              placeholder="Ingresa tu contraseña"
              {...register("password")}
              aria-invalid={Boolean(errors.password)}
              className="w-full rounded-lg border border-slate-300 px-4 py-3 text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-600 focus:ring-2 focus:ring-blue-100"
            />

            {errors.password && (
              <p className="mt-1 text-sm text-red-600">
                {errors.password.message}
              </p>
            )}
          </div>

          {serverError && (
            <div
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700"
            >
              {serverError}
            </div>
          )}

          <button
            type="submit"
            disabled={submitting}
            className="w-full rounded-lg bg-blue-700 px-4 py-3 font-semibold text-white transition hover:bg-blue-800 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {submitting ? "Ingresando..." : "Iniciar sesión"}
          </button>
        </form>

        <p className="mt-7 text-center text-xs text-slate-400">
          SGC · Sistema de Gestión de Contactos
        </p>
      </section>
    </main>
  );
}
