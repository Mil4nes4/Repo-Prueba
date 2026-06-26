"use client";

import { useState, FormEvent } from "react";
import Link from "next/link";

interface AuthFormProps {
  mode: "signin" | "signup";
  onSubmit: (email: string, password: string) => Promise<void>;
}

export function AuthForm({ mode, onSubmit }: AuthFormProps) {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const isSignUp = mode === "signup";
  const title = isSignUp ? "Crear cuenta" : "Iniciar sesión";
  const subtitle = isSignUp
    ? "Regístrate para comenzar a gestionar tus tareas."
    : "Bienvenido de vuelta. Ingresa tus credenciales.";
  const submitLabel = isSignUp ? "Registrarse" : "Ingresar";
  const alternateText = isSignUp
    ? "¿Ya tienes cuenta?"
    : "¿No tienes cuenta?";
  const alternateLink = isSignUp ? "/login" : "/register";
  const alternateLabel = isSignUp ? "Inicia sesión" : "Regístrate";

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      await onSubmit(email.trim(), password);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-slate-950 px-4 py-12 text-zinc-100">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/60 p-8 shadow-2xl backdrop-blur-sm">
        <div className="mb-8 text-center">
          <h1 className="mb-2 text-3xl font-bold">
            <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
              {title}
            </span>
          </h1>
          <p className="text-zinc-400">{subtitle}</p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl border border-red-900/50 bg-red-950/30 p-3 text-sm text-red-200">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label
              htmlFor="email"
              className="mb-1 block text-sm font-medium text-zinc-300"
            >
              Correo electrónico
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="tu@email.com"
              required
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950/60 px-4 py-3 text-zinc-100 placeholder-zinc-500 outline-none ring-indigo-500/20 transition focus:border-indigo-500 focus:ring-4"
            />
          </div>

          <div>
            <label
              htmlFor="password"
              className="mb-1 block text-sm font-medium text-zinc-300"
            >
              Contraseña
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
              minLength={6}
              className="w-full rounded-xl border border-zinc-700 bg-zinc-950/60 px-4 py-3 text-zinc-100 placeholder-zinc-500 outline-none ring-indigo-500/20 transition focus:border-indigo-500 focus:ring-4"
            />
            {isSignUp && (
              <p className="mt-1 text-xs text-zinc-500">
                Mínimo 6 caracteres.
              </p>
            )}
          </div>

          <button
            type="submit"
            disabled={loading || !email.trim() || !password}
            className="w-full rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-500/20 outline-none transition hover:from-indigo-400 hover:to-cyan-400 focus:ring-4 focus:ring-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {loading ? "Procesando..." : submitLabel}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-zinc-400">
          {alternateText}{" "}
          <Link
            href={alternateLink}
            className="font-medium text-indigo-400 transition hover:text-indigo-300"
          >
            {alternateLabel}
          </Link>
        </p>
      </div>
    </main>
  );
}
