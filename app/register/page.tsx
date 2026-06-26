"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { AuthForm } from "@/app/components/AuthForm";
import { useAuth } from "@/app/components/AuthProvider";

export default function RegisterPage() {
  const { signUp, user, loading } = useAuth();
  const router = useRouter();
  const [registered, setRegistered] = useState(false);

  useEffect(() => {
    if (!loading && user) {
      router.replace("/");
    }
  }, [user, loading, router]);

  if (loading || user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-indigo-400" />
      </main>
    );
  }

  if (registered) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-slate-950 px-4 py-12 text-zinc-100">
        <div className="w-full max-w-md rounded-2xl border border-emerald-900/50 bg-zinc-900/60 p-8 text-center shadow-2xl backdrop-blur-sm">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-emerald-500/20 text-emerald-400">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="h-7 w-7"
            >
              <path
                fillRule="evenodd"
                d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                clipRule="evenodd"
              />
            </svg>
          </div>
          <h1 className="mb-2 text-2xl font-bold text-zinc-100">
            ¡Cuenta creada!
          </h1>
          <p className="mb-6 text-zinc-400">
            Tu cuenta se registró correctamente. Ahora puedes iniciar sesión.
          </p>
          <Link
            href="/login"
            className="inline-block w-full rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-6 py-3 font-semibold text-white shadow-lg shadow-indigo-500/20 transition hover:from-indigo-400 hover:to-cyan-400"
          >
            Iniciar sesión
          </Link>
        </div>
      </main>
    );
  }

  return (
    <AuthForm
      mode="signup"
      onSubmit={async (email, password) => {
        await signUp(email, password);
        setRegistered(true);
      }}
    />
  );
}
