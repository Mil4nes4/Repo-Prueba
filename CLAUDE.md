# Reglas de contexto — Torneo de Vibecoding PUCP

@AGENTS.md

## Arquitectura

- Stack: Next.js 16 (App Router) + Vercel + Supabase.
- Patrón: Clean Architecture pragmática de 3 capas:
  - `domain/` → entidades, casos de uso, puertos/repositorios abstractos. Sin dependencias de Next.js ni Supabase.
  - `infrastructure/` → implementaciones concretas (cliente Supabase, repositorios).
  - `interface/` (`app/api/`) → route handlers que reciben requests y delegan a los casos de uso.

## Reglas de dependencia

- `domain/` NO puede importar de `next`, `react`, `@supabase/supabase-js`, ni de `infrastructure/` o `interface/`.
- `infrastructure/` puede importar de `domain/`.
- `interface/` puede importar de `domain/` e `infrastructure/`.
- Frontend (`app/`) consume la API por contrato HTTP; no hace queries directos a Supabase salvo AUTH si es estrictamente necesario.

## Convenciones

- Usa TypeScript estricto.
- Prefiere inyección de dependencias en los casos de uso (pasar el repositorio por constructor).
- Valida inputs en el dominio; devuelve errores explícitos, no strings mágicos.
- Escribe tests unitarios para dominio: happy path + al menos un caso de error.
- Comenta deuda técnica con `// TECH-DEBT: [razón]`.

## Antes de commits grandes con IA

- Explica con tus propias palabras el código generado.
- Si no puedes sustentarlo ante un jurado técnico, no hagas commit todavía.
- Haz commit limpio antes de pedir refactors grandes.

## Deploy

- Ningún comando `vercel --prod` se ejecuta sin supervisión humana.
- Deploy frecuentes durante el día, no uno solo al final.
