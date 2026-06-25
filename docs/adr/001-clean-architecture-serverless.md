# ADR 001: Clean Architecture pragmática + Serverless

## Estado

Aceptado

## Contexto

Participamos en un hackathon de 11 horas donde el 70 % de la rúbrica depende de arquitectura y funcionalidad desplegada. Necesitamos:

- Separar la lógica de negocio de los proveedores (base de datos, hosting).
- Desplegar rápido sin preocuparnos por servidores.
- Minimizar boilerplate para no caer en sobreingeniería.

## Decisión

Usar Clean Architecture en 3 capas pragmáticas:

1. `domain/` — entidades y casos de uso puros.
2. `infrastructure/` — implementaciones concretas (Supabase, cliente HTTP, etc.).
3. `interface/` — route handlers de Next.js que adaptan HTTP al dominio.

El despliegue será serverless en Vercel, aprovechando Next.js API Routes.

## Consecuencias

### Positivas

- El dominio no depende de Supabase ni de Vercel.
- Podemos cambiar de proveedor de DB sin reescribir casos de uso.
- La separación permite que frontend y backend avancen en paralelo usando un contrato de API.

### Negativas / Riesgos

- Más carpetas y archivos que un CRUD tradicional.
- Requiere disciplina para no filtrar dependencias de framework al dominio.
- Bajo presión de tiempo, la tentación de saltarse capas es alta.

## Alternativas consideradas

- **Clean Architecture canónica (4+ capas):** rechazada por exceso de boilerplate en 11 horas.
- **Frontend conectado directamente a Supabase:** rechazada porque acopla la app al proveedor y dificulta los tests.

## Notas

- Esta decisión se revisará después del evento para evaluar si escaló bien.
