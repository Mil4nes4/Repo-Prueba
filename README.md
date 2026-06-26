# [Nombre del Proyecto]

Breve descripción del problema que resuelve y por qué importa.

## Stack

- **Frontend:** Next.js 16 (App Router), React 19, Tailwind CSS v4.
- **Backend:** Next.js API Routes (serverless).
- **Base de datos y auth:** Supabase.
- **Hosting:** Vercel.

## Arquitectura

Clean Architecture pragmática de 3 capas:

```
domain/          → Entidades, casos de uso y repositorios abstractos.
infrastructure/  → Implementaciones concretas (Supabase, etc.).
app/api/         → Route handlers de Next.js (capa interface).
```

### Reglas de dependencia

- `domain/` no importa de Next.js, React ni Supabase.
- `infrastructure/` puede importar de `domain/`.
- `interface/` puede importar de `domain/` e `infrastructure/`.

## Instalación local

```bash
npm install
```

Crea un archivo `.env.local` a partir de `.env.local.example` y completa las variables de Supabase:

- `NEXT_PUBLIC_SUPABASE_URL`
- `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` (llave pública del cliente)
- `SUPABASE_SECRET_KEY` (llave de servidor, equivalente a la antigua service role key)

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Endpoints de prueba

### Autenticación

- `POST /api/auth/signup` — Registro. Body: `{ "email": "string", "password": "string" }`.
- `POST /api/auth/signin` — Inicio de sesión. Body: `{ "email": "string", "password": "string" }`.
- `POST /api/auth/signout` — Cierre de sesión. Header: `Authorization: Bearer <token>`.
- `GET /api/auth/me` — Usuario actual. Header: `Authorization: Bearer <token>`.

### Tareas

- `GET /api/tasks` — Lista todas las tareas ordenadas por fecha de creación descendente.
- `POST /api/tasks` — Crea una tarea. Body: `{ "title": "string", "description?": "string" }`.
- `PUT /api/tasks/[id]` — Actualiza título y/o descripción. Body: `{ "title?": "string", "description?": "string | null" }`.
- `PATCH /api/tasks/[id]` — Alterna el estado completado/pendiente de una tarea.
- `DELETE /api/tasks/[id]` — Elimina una tarea.

Todos los endpoints de tareas requieren autenticación mediante el header `Authorization: Bearer <token>`.

## Tests

```bash
npm test
```

## Deploy

- **Producción:** https://repo-prueba-nzpm.vercel.app
- El proyecto está configurado para desplegarse en Vercel. Los deploys a producción deben ser aprobados por un humano.

## Estructura de decisiones

Ver `/docs/adr/`.

## Equipo

- Persona A — Dominio + Backend
- Persona B — Frontend
- Persona C — Infraestructura, testing, deploy y documentación
