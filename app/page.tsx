"use client";

import { useEffect, useMemo, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "./components/AuthProvider";

interface Task {
  id: string;
  title: string;
  description: string | null;
  completed: boolean;
  createdAt: string;
}

type Filter = "all" | "pending" | "completed";

function getHeaders(token: string | null) {
  const headers: Record<string, string> = { "Content-Type": "application/json" };
  if (token) {
    headers.Authorization = `Bearer ${token}`;
  }
  return headers;
}

export default function Home() {
  const { user, loading: authLoading, signOut, getToken } = useAuth();
  const router = useRouter();

  const [tasks, setTasks] = useState<Task[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [actionError, setActionError] = useState<string | null>(null);

  const [newTitle, setNewTitle] = useState("");
  const [newDescription, setNewDescription] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const [editingId, setEditingId] = useState<string | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editDescription, setEditDescription] = useState("");
  const [isUpdating, setIsUpdating] = useState(false);

  const [deletingId, setDeletingId] = useState<string | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);

  const filteredTasks = useMemo(() => {
    if (filter === "pending") return tasks.filter((t) => !t.completed);
    if (filter === "completed") return tasks.filter((t) => t.completed);
    return tasks;
  }, [tasks, filter]);

  async function fetchTasks() {
    try {
      setLoading(true);
      setError(null);
      const token = getToken();
      const res = await fetch("/api/tasks", {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });
      if (!res.ok) {
        if (res.status === 401) {
          router.push("/login");
          return;
        }
        throw new Error("Error al cargar las tareas");
      }
      const data = await res.json();
      setTasks(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
      return;
    }
    if (!authLoading && user) {
      fetchTasks();
    }
  }, [authLoading, user, router]);

  async function handleCreate(e: React.FormEvent) {
    e.preventDefault();
    if (!newTitle.trim()) return;

    try {
      setIsCreating(true);
      setActionError(null);
      const token = getToken();
      const res = await fetch("/api/tasks", {
        method: "POST",
        headers: getHeaders(token),
        body: JSON.stringify({
          title: newTitle.trim(),
          description: newDescription.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al crear la tarea");
      }

      setNewTitle("");
      setNewDescription("");
      await fetchTasks();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsCreating(false);
    }
  }

  async function handleToggle(task: Task) {
    try {
      setActionError(null);
      const token = getToken();
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PATCH",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al actualizar la tarea");
      }

      await fetchTasks();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Error desconocido");
    }
  }

  function startEditing(task: Task) {
    setEditingId(task.id);
    setEditTitle(task.title);
    setEditDescription(task.description || "");
    setActionError(null);
  }

  function cancelEditing() {
    setEditingId(null);
    setEditTitle("");
    setEditDescription("");
  }

  async function handleUpdate(e: React.FormEvent, task: Task) {
    e.preventDefault();
    if (!editTitle.trim()) return;

    try {
      setIsUpdating(true);
      setActionError(null);
      const token = getToken();
      const res = await fetch(`/api/tasks/${task.id}`, {
        method: "PUT",
        headers: getHeaders(token),
        body: JSON.stringify({
          title: editTitle.trim(),
          description: editDescription.trim() || null,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al actualizar la tarea");
      }

      setEditingId(null);
      await fetchTasks();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsUpdating(false);
    }
  }

  function confirmDelete(id: string) {
    setDeletingId(id);
    setActionError(null);
  }

  function cancelDelete() {
    setDeletingId(null);
  }

  async function handleDelete(id: string) {
    try {
      setIsDeleting(true);
      setActionError(null);
      const token = getToken();
      const res = await fetch(`/api/tasks/${id}`, {
        method: "DELETE",
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || "Error al eliminar la tarea");
      }

      setDeletingId(null);
      await fetchTasks();
    } catch (err) {
      setActionError(err instanceof Error ? err.message : "Error desconocido");
    } finally {
      setIsDeleting(false);
    }
  }

  const completedCount = tasks.filter((t) => t.completed).length;
  const pendingCount = tasks.length - completedCount;

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-zinc-950">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-indigo-400" />
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-gradient-to-br from-zinc-950 via-zinc-900 to-slate-950 px-4 py-12 text-zinc-100 sm:px-6 lg:px-8">
      <div className="mx-auto max-w-3xl">
        <div className="mb-10 flex flex-col items-center justify-between gap-4 sm:flex-row sm:items-start">
          <div className="text-center sm:text-left">
            <h1 className="mb-2 text-4xl font-extrabold tracking-tight sm:text-5xl">
              <span className="bg-gradient-to-r from-indigo-400 to-cyan-400 bg-clip-text text-transparent">
                Gestor de Tareas
              </span>
            </h1>
            <p className="text-zinc-400">
              Organiza tu día con una interfaz limpia y oscura.
            </p>
          </div>
          {user && (
            <div className="flex items-center gap-3 rounded-xl border border-zinc-800 bg-zinc-900/60 px-4 py-2">
              <div className="text-right">
                <p className="text-sm font-medium text-zinc-200">
                  {user.email}
                </p>
                <p className="text-xs text-zinc-500">Sesión activa</p>
              </div>
              <button
                onClick={signOut}
                className="rounded-lg bg-zinc-800 px-3 py-1.5 text-sm font-medium text-zinc-300 transition hover:bg-zinc-700 hover:text-zinc-100"
              >
                Salir
              </button>
            </div>
          )}
        </div>

        <section className="mb-8 rounded-2xl border border-zinc-800 bg-zinc-900/60 p-6 shadow-xl backdrop-blur-sm">
          <h2 className="mb-4 text-lg font-semibold text-zinc-100">
            Nueva tarea
          </h2>
          <form onSubmit={handleCreate} className="space-y-4">
            <div>
              <label
                htmlFor="title"
                className="mb-1 block text-sm font-medium text-zinc-300"
              >
                Título
              </label>
              <input
                id="title"
                type="text"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                placeholder="¿Qué necesitas hacer?"
                maxLength={200}
                className="w-full rounded-xl border border-zinc-700 bg-zinc-950/60 px-4 py-3 text-zinc-100 placeholder-zinc-500 outline-none ring-indigo-500/20 transition focus:border-indigo-500 focus:ring-4"
              />
            </div>
            <div>
              <label
                htmlFor="description"
                className="mb-1 block text-sm font-medium text-zinc-300"
              >
                Descripción{" "}
                <span className="font-normal text-zinc-500">(opcional)</span>
              </label>
              <textarea
                id="description"
                value={newDescription}
                onChange={(e) => setNewDescription(e.target.value)}
                placeholder="Añade detalles..."
                rows={3}
                className="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-950/60 px-4 py-3 text-zinc-100 placeholder-zinc-500 outline-none ring-indigo-500/20 transition focus:border-indigo-500 focus:ring-4"
              />
            </div>
            <div className="flex items-center justify-between">
              <span className="text-xs text-zinc-500">
                {newTitle.length}/200 caracteres
              </span>
              <button
                type="submit"
                disabled={isCreating || !newTitle.trim()}
                className="rounded-xl bg-gradient-to-r from-indigo-500 to-cyan-500 px-6 py-2.5 font-semibold text-white shadow-lg shadow-indigo-500/20 outline-none transition hover:from-indigo-400 hover:to-cyan-400 focus:ring-4 focus:ring-indigo-500/30 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isCreating ? "Creando..." : "Crear tarea"}
              </button>
            </div>
          </form>
        </section>

        <section className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex gap-2 rounded-xl border border-zinc-800 bg-zinc-900/60 p-1.5">
            {(["all", "pending", "completed"] as Filter[]).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`rounded-lg px-4 py-2 text-sm font-medium transition ${
                  filter === f
                    ? "bg-zinc-700 text-zinc-100 shadow"
                    : "text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                }`}
              >
                {f === "all" && "Todas"}
                {f === "pending" && "Pendientes"}
                {f === "completed" && "Completadas"}
              </button>
            ))}
          </div>
          <div className="text-sm text-zinc-400">
            <span className="font-semibold text-zinc-200">{pendingCount}</span>{" "}
            pendientes ·{" "}
            <span className="font-semibold text-zinc-200">{completedCount}</span>{" "}
            completadas
          </div>
        </section>

        {actionError && (
          <div className="mb-6 rounded-xl border border-red-900/50 bg-red-950/30 p-4 text-sm text-red-200">
            {actionError}
          </div>
        )}

        {loading ? (
          <div className="flex items-center justify-center py-16">
            <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-indigo-400" />
          </div>
        ) : error ? (
          <div className="rounded-2xl border border-red-900/50 bg-red-950/30 p-8 text-center text-red-200">
            <p className="mb-4">{error}</p>
            <button
              onClick={fetchTasks}
              className="rounded-lg bg-red-900/50 px-4 py-2 text-sm font-medium text-red-100 transition hover:bg-red-900/70"
            >
              Reintentar
            </button>
          </div>
        ) : filteredTasks.length === 0 ? (
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/40 p-12 text-center">
            <p className="text-lg font-medium text-zinc-300">
              No hay tareas {filter === "pending" && "pendientes"}
              {filter === "completed" && "completadas"}
            </p>
            <p className="mt-1 text-sm text-zinc-500">
              {filter === "all"
                ? "Crea tu primera tarea para empezar."
                : "Cambia el filtro para ver más tareas."}
            </p>
          </div>
        ) : (
          <ul className="space-y-4">
            {filteredTasks.map((task) => (
              <li
                key={task.id}
                className={`rounded-2xl border p-5 shadow-lg transition ${
                  task.completed
                    ? "border-emerald-900/40 bg-emerald-950/20"
                    : "border-zinc-800 bg-zinc-900/60 hover:border-zinc-700"
                }`}
              >
                {editingId === task.id ? (
                  <form
                    onSubmit={(e) => handleUpdate(e, task)}
                    className="space-y-3"
                  >
                    <input
                      type="text"
                      value={editTitle}
                      onChange={(e) => setEditTitle(e.target.value)}
                      maxLength={200}
                      className="w-full rounded-xl border border-zinc-700 bg-zinc-950/60 px-4 py-2.5 text-zinc-100 outline-none ring-indigo-500/20 focus:border-indigo-500 focus:ring-4"
                    />
                    <textarea
                      value={editDescription}
                      onChange={(e) => setEditDescription(e.target.value)}
                      rows={2}
                      className="w-full resize-none rounded-xl border border-zinc-700 bg-zinc-950/60 px-4 py-2.5 text-zinc-100 outline-none ring-indigo-500/20 focus:border-indigo-500 focus:ring-4"
                    />
                    <div className="flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={cancelEditing}
                        className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-400 transition hover:bg-zinc-800 hover:text-zinc-200"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={isUpdating || !editTitle.trim()}
                        className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-indigo-500 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isUpdating ? "Guardando..." : "Guardar"}
                      </button>
                    </div>
                  </form>
                ) : (
                  <div className="flex items-start gap-4">
                    <button
                      onClick={() => handleToggle(task)}
                      className={`mt-1 flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 transition ${
                        task.completed
                          ? "border-emerald-500 bg-emerald-500 text-zinc-950"
                          : "border-zinc-600 hover:border-indigo-400"
                      }`}
                      aria-label={
                        task.completed
                          ? "Marcar como pendiente"
                          : "Marcar como completada"
                      }
                    >
                      {task.completed && (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="h-4 w-4"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.704 4.153a.75.75 0 0 1 .143 1.052l-8 10.5a.75.75 0 0 1-1.127.075l-4.5-4.5a.75.75 0 0 1 1.06-1.06l3.894 3.893 7.48-9.817a.75.75 0 0 1 1.05-.143Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      )}
                    </button>

                    <div className="min-w-0 flex-1">
                      <h3
                        className={`text-lg font-semibold ${
                          task.completed
                            ? "text-zinc-500 line-through"
                            : "text-zinc-100"
                        }`}
                      >
                        {task.title}
                      </h3>
                      {task.description && (
                        <p
                          className={`mt-1 text-sm ${
                            task.completed
                              ? "text-zinc-600 line-through"
                              : "text-zinc-400"
                          }`}
                        >
                          {task.description}
                        </p>
                      )}
                      <p className="mt-2 text-xs text-zinc-600">
                        Creada el{" "}
                        {new Date(task.createdAt).toLocaleDateString("es-ES", {
                          day: "numeric",
                          month: "short",
                          year: "numeric",
                        })}
                      </p>
                    </div>

                    <div className="flex shrink-0 gap-2">
                      <button
                        onClick={() => startEditing(task)}
                        className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-indigo-400"
                        aria-label="Editar tarea"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="h-5 w-5"
                        >
                          <path d="m5.433 13.917 1.262-3.155A4 4 0 0 1 7.58 9.42l6.92-6.918a2.121 2.121 0 0 1 3 3l-6.92 6.918c-.383.383-.84.685-1.343.886l-3.154 1.262a.909.909 0 0 1-1.185-1.185Z" />
                          <path d="M3.5 5.75c0-.69.56-1.25 1.25-1.25H10A.75.75 0 0 0 10 3H4.75A2.75 2.75 0 0 0 2 5.75v9.5A2.75 2.75 0 0 0 4.75 18h9.5A2.75 2.75 0 0 0 17 15.25V10a.75.75 0 0 0-1.5 0v5.25c0 .69-.56 1.25-1.25 1.25h-9.5c-.69 0-1.25-.56-1.25-1.25v-9.5Z" />
                        </svg>
                      </button>
                      <button
                        onClick={() => confirmDelete(task.id)}
                        className="rounded-lg p-2 text-zinc-400 transition hover:bg-zinc-800 hover:text-red-400"
                        aria-label="Eliminar tarea"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 20 20"
                          fill="currentColor"
                          className="h-5 w-5"
                        >
                          <path
                            fillRule="evenodd"
                            d="M8.75 1A2.75 2.75 0 0 0 6 3.75v.443c-.795.077-1.584.176-2.365.298a.75.75 0 1 0 .23 1.482l.149-.022.841 10.518A2.75 2.75 0 0 0 7.596 19h4.807a2.75 2.75 0 0 0 2.742-2.53l.841-10.52.149.023a.75.75 0 0 0 .23-1.482A41.03 41.03 0 0 0 14 4.193V3.75A2.75 2.75 0 0 0 11.25 1h-2.5ZM10 4c.84 0 1.673.025 2.5.075V3.75c0-.69-.56-1.25-1.25-1.25h-2.5c-.69 0-1.25.56-1.25 1.25v.325C8.327 4.025 9.16 4 10 4ZM8.58 7.72a.75.75 0 0 0-1.5.06l.3 7.5a.75.75 0 1 0 1.5-.06l-.3-7.5Zm4.34.06a.75.75 0 1 0-1.5-.06l-.3 7.5a.75.75 0 1 0 1.5.06l.3-7.5Z"
                            clipRule="evenodd"
                          />
                        </svg>
                      </button>
                    </div>
                  </div>
                )}

                {deletingId === task.id && (
                  <div className="mt-4 rounded-xl border border-red-900/50 bg-red-950/30 p-4">
                    <p className="text-sm text-red-200">
                      ¿Estás seguro de que quieres eliminar esta tarea?
                    </p>
                    <div className="mt-3 flex justify-end gap-2">
                      <button
                        onClick={cancelDelete}
                        className="rounded-lg px-4 py-2 text-sm font-medium text-zinc-300 transition hover:bg-zinc-800"
                      >
                        Cancelar
                      </button>
                      <button
                        onClick={() => handleDelete(task.id)}
                        disabled={isDeleting}
                        className="rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white transition hover:bg-red-500 disabled:cursor-not-allowed disabled:opacity-50"
                      >
                        {isDeleting ? "Eliminando..." : "Eliminar"}
                      </button>
                    </div>
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </div>
    </main>
  );
}
