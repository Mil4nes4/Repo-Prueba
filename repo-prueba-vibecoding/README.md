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
interface/       → Route handlers de Next.js (app/api/).
```

### Reglas de dependencia

- `domain/` no importa de Next.js, React ni Supabase.
- `infrastructure/` puede importar de `domain/`.
- `interface/` puede importar de `domain/` e `infrastructure/`.

## Instalación local

```bash
npm install
```

Crea un archivo `.env.local` a partir de `.env.local.example` y completa las variables de Supabase.

```bash
npm run dev
```

Abre [http://localhost:3000](http://localhost:3000).

## Tests

```bash
npm test
```

## Deploy

El proyecto está configurado para desplegarse en Vercel. Los deploys a producción deben ser aprobados por un humano.

## Estructura de decisiones

Ver `/docs/adr/`.

## Equipo

- Persona A — Dominio + Backend
- Persona B — Frontend
- Persona C — Infraestructura, testing, deploy y documentación
