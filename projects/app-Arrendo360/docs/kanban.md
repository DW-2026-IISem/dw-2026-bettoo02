---

editor_options: 
  markdown: 
    wrap: sentence
---

# Tablero Kanban del Proyecto — Arrendo360

> **Proyecto:** Arrendo360 — Plataforma Integral de Gestión Inmobiliaria\
> **Repositorio:** `dw-2026-bettoo02`\
> **Metodología:** Spec-Driven Development (SDD) & Kanban con Gates de Calidad\
> **Guía Metodológica:** [`docs/Metodologia_Desarrollo_Software_SDD_Kanban.md`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/docs/Metodologia_Desarrollo_Software_SDD_Kanban.md)\
> **Política de Límites:** **WIP = 1** (Work In Progress estricto en la columna *En curso*)\
> **Última Actualización:** Octubre 2026

------------------------------------------------------------------------

## 1. Definición del Flujo y Regla WIP = 1

Conforme a la metodología del proyecto, el flujo de trabajo sigue 5 columnas secuenciales:

``` text
[ Preparado ] ──(Revisión AC)──> [ En curso (WIP=1) ] ──(Desarrollo)──> [ Verificación (EVI) ] ──(Pruebas)──> [ Revisión humana ] ──(Gate)──> [ Hecho ]
```

### Regla Fundamental: WIP = 1

- **Límite de Trabajo en Proceso:** La columna **`En curso`** tiene una restricción estricta de **WIP = 1**.
- **Significado:** El desarrollador solo puede trabajar activamente en **una única tarjeta/issue a la vez**.
- **Regla de Avance:** Para ingresar una nueva tarea a *En curso*, la tarea previa debe haber culminado su desarrollo y pasado a la fase de *Verificación* o *Hecho*. Está prohibido el paralelismo que genere dispersión de contexto.

------------------------------------------------------------------------

## 2. Estado Visual del Tablero Kanban

| 1\. Preparado | 2\. En curso <br>**(WIP = 1)** | 3\. Verificación <br>*(Pruebas & EVI)* | 4\. Revisión Humana <br>*(Quality Gate)* | 5\. Hecho <br>*(Commit & Gate OK)* |
|:--------------|:-------------:|:-------------:|:-------------:|:--------------|
| *(Vacío)* | *(0/1 - Disponible)* | *(0 tarjetas)* | 🔹 **ISS-11 / BIZ-PRODUCTS**<br>Products (Productos/Inmuebles), Relación ProductType, RN-PROD-01..06, Seeder Parametrizable, Endpoints Lógicos y Suites .http | ✅ **ISS-01 a ISS-07:** Bounded Contexts y Demo E2E<br>✅ **ISS-08 / SEC-AUTH:** Seguridad, Anti-Enumeración, RTR<br>✅ **ISS-09 / BIZ-CLIENTS:** Ciclo de Vida Clients, Reglas y Seeder<br>✅ **ISS-10 / BIZ-PRODUCT-TYPES:** Tipos de Producto, Seeder y Reglas |

------------------------------------------------------------------------

## 3. Detalle de Tarjetas e Issues

### Tarjetas en Estado "Hecho"

| ID Issue | Título / Alcance | Trazabilidad | Criterios AC | Commit Asociado |
|:--------------|:--------------|:-------------:|:-------------:|:--------------|
| **ISS-01** | Esqueleto NestJS Clean Architecture arrancable | [`trazabilidad/ISS-01.md`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/trazabilidad/ISS-01.md) | AC-1 a AC-4 aprobados | `feat(iss-01): esqueleto NestJS CA arrancable Refs #1` |
| **ISS-02** | Persistencia Sequelize, Conexión BD y Modelos Base | [`trazabilidad/ISS-02.md`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/trazabilidad/ISS-02.md) | AC-1 a AC-5 aprobados | `feat(iss-02): persistencia Sequelize y modelos Refs #2` |
| **ISS-03** | Configuración centralizada y Health Checks desacoplados | [`trazabilidad/ISS-03.md`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/trazabilidad/ISS-03.md) | AC-1 a AC-4 aprobados | `feat(iss-03): configuracion y health checks Refs #3` |
| **ISS-04** | Inmuebles, Propietarios y Reglas de Dominio | [`trazabilidad/ISS-04.md`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/trazabilidad/ISS-04.md) | AC-1 a AC-5 aprobados | `feat(iss-04): gestion inmuebles y propietarios Refs #4` |
| **ISS-05** | Contratos de Arrendamiento y Estados de Ocupación | [`trazabilidad/ISS-05.md`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/trazabilidad/ISS-05.md) | AC-1 a AC-5 aprobados | `feat(iss-05): contratos de arrendamiento Refs #5` |
| **ISS-06** | Cobros Mensuales, Pagos y Transiciones de Estado | [`trazabilidad/ISS-06.md`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/trazabilidad/ISS-06.md) | AC-1 a AC-5 aprobados | `feat(iss-06): cobros mensuales y pagos Refs #6` |
| **ISS-07** | Liquidaciones a Propietarios, Seeders y Demo E2E | [`trazabilidad/ISS-07.md`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/trazabilidad/ISS-07.md) | AC-1 a AC-5 aprobados | `feat(iss-07): integracion business y demo Refs #7` |
| **ISS-08** | Seguridad, Anti-Enumeración, RTR, Token Blacklist y Recuperación | [`docs/seguridad.md`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/docs/seguridad.md) | AC-1 a AC-6 aprobados | `feat(iss-08): seguridad auth, rtr y recuperacion Refs #8` |
| **ISS-09** | Ciclo de Vida Clients, Reglas de Negocio, Seeder Parametrizable | [`evidencias/semana 03/verificacion-clients.md`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/evidencias/semana%2003/verificacion-clients.md) | AC-1 a AC-7 aprobados | `feat(iss-09): feature clients y seeder Refs #9` |
| **ISS-10** | Feature ProductTypes, Reglas de Negocio y Seeder Parametrizable | [`evidencias/semana 03/verificacion-product-types.md`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/evidencias/semana%2003/verificacion-product-types.md) | AC-1 a AC-8 aprobados | `feat(iss-10): feature product-types, reglas de negocio y seeder Refs #10` |

------------------------------------------------------------------------

### Tarjeta Actual: Feature Products (Productos / Inmuebles)

#### **ISS-11 / BIZ-PRODUCTS: Feature Products, Relación ProductType, Reglas de Negocio, Seeder Parametrizable y Endpoints REST**

- **Estado Actual:** `Revisión Humana (Quality Gate)`
- **WIP:** Liberó la columna *En curso* (WIP actual en desarrollo = 0/1, disponible para nuevo issue).
- **Alcance / Entregables:**
  1.  **Modelo y Dominio de Products:** Entidad `Product` y modelo Sequelize `products` con `id`, `name`, `brand`, `price`, `min_stock`, `quantity`, `product_type_id`, `status` (`'active'` | `'inactive'`) y timestamps.
  2.  **Relación Bireccional:** Asociación `Product.belongsTo(ProductType, { foreignKey: 'product_type_id', as: 'product_type' })` y `ProductType.hasMany(Product, { foreignKey: 'product_type_id', as: 'products' })`.
  3.  **Reglas de Negocio Estrictas (RN-PROD-01 a RN-PROD-06):**
      - **RN-PROD-01 (Validación de Tipo de Producto Activo):** Al crear (`POST`) o actualizar (`PUT` / `PATCH` con `product_type_id`), verificar que el tipo de producto exista (HTTP 404 si no existe) y esté activo (`status === 'active'`; HTTP 400 "Product type must be active" si está inactivo).
      - **RN-PROD-02 (Normalización y Sanitización):** Aplicar `trim()` a nombre y marca (`name`, `brand`).
      - **RN-PROD-03 (Validación Numérica):** `price > 0`, `min_stock >= 0`, `quantity >= 0`.
      - **RN-PROD-04 (Actualización Completa y Parcial):** Soporte de `PUT` (reemplazo completo) y `PATCH` (actualización selectiva con revalidación de tipo si cambia).
      - **RN-PROD-05 (Ciclo de Vida Lógico):** `PATCH /api/productos/:id/deactivate` y `PATCH /api/productos/:id/activate`.
      - **RN-PROD-06 (Baja Permanente):** `DELETE /api/productos/:id` (HTTP 204).
  4.  **Enrutamiento Multilingüe:** `@Controller(['productos', 'products'])` para atender peticiones en `/api/productos` y `/api/products`.
  5.  **Seeder Parametrizable e Idempotente:** `seedProducts(count)` con catálogo inicial `INITIAL_PRODUCTS` (10 ítems), asignando `product_type_id` de tipos activos. Soporte CLI `--products=N` y `SEED_PRODUCTS=N`.
  6.  **Colección Interactiva (.http):** Archivos `products.get.http`, `products.create.http`, `products.update.http`, `products.delete.http` en `http/products/`.
  7.  **Suite Automatizada Vitest:** 24 pruebas de Products y 88/88 pruebas globales al 100% PASS (`npm test`).
- **Criterios de Aceptación (AC) Cumplidos:**
  - [x] **AC-1:** Modelo `ProductModel` en tabla `products` con clave foránea `product_type_id`.
  - [x] **AC-2:** Asociación bidireccional ProductType ↔ Product (`belongsTo` / `hasMany`).
  - [x] **AC-3:** Validación estricta de tipo activo (HTTP 400 si está inactivo, HTTP 404 si no existe).
  - [x] **AC-4:** Sanitización con `trim()` y validaciones de rango numérico (`price > 0`, `min_stock >= 0`, `quantity >= 0`).
  - [x] **AC-5:** Operaciones de actualización completa (PUT) y granular (PATCH).
  - [x] **AC-6:** Ciclo de vida con desactivación/activación lógica y eliminación física (HTTP 204).
  - [x] **AC-7:** Seeder idempotente parametrizable por CLI (`--products=N`) y variables de entorno.
  - [x] **AC-8:** 100% de la suite de pruebas automatizadas aprobada (24/24 tests para Products, 88/88 total) y compilación limpia con `npm run build`.

------------------------------------------------------------------------

## 4. Registro Histórico de Transiciones de Estado (Log de Auditoría)

| Fecha y Hora | Tarjeta / Issue | Transición Realizada | Justificación / Evidencia |
|:-----------------|:-----------------|:-----------------|:-----------------|
| 2026-10-04 | **ISS-01 a ISS-07** | *En curso* → *Hecho* | Completada la pista Business con 7 issues aprobados en Gate y demo E2E funcional. |
| 2026-10-05 06:00 | **ISS-08 (Auth)** | *Preparado* → *En curso* | Criterios de aceptación revisados para el módulo de Autenticación (WIP = 1/1). |
| 2026-10-05 08:30 | **ISS-08 (Auth)** | *En curso* → *Verificación* | Implementados use cases, DTOs, entidades y vista web interactiva. Pruebas iniciadas. |
| 2026-10-05 12:15 | **ISS-08 (Auth)** | *Verificación* → *Revisión Humana* | Ejecutadas las 24 pruebas de Vitest (100% PASS), generadas las 5 evidencias en markdown y redactados `docs/sdd.md` y `docs/seguridad.md`. Columna *En curso* queda en 0/1. |
| 2026-10-05 13:00 | **ISS-08 (Auth)** | *Revisión Humana* → *Hecho* | Quality Gate aprobado por el revisor humano. |
| 2026-10-05 14:00 | **ISS-09 (Clients)** | *Preparado* → *En curso* | Inicio de especificación y blindaje de reglas de negocio para Clients (WIP = 1/1). |
| 2026-10-05 17:30 | **ISS-09 (Clients)** | *En curso* → *Verificación* | Implementación de use cases, seeder idempotente y suite de pruebas. |
| 2026-10-06 08:15 | **ISS-09 (Clients)** | *Verificación* → *Revisión Humana* | Acoplamiento de ventajas técnicas de Express 5, 45 pruebas al 100% PASS, seeder parametrizable y evidencia completada. |
| 2026-10-06 08:20 | **ISS-09 (Clients)** | *Revisión Humana* → *Hecho* | Gate aprobado con suite de pruebas y runner CLI operativo. |
| 2026-10-06 08:25 | **ISS-10 (ProductTypes)** | *Preparado* → *En curso* | Especificación y diseño de ProductTypes (tipologías de inmuebles/productos) bajo Clean Architecture (WIP = 1/1). |
| 2026-10-06 08:40 | **ISS-10 (ProductTypes)** | *En curso* → *Verificación* | Implementación de entidad, use cases, seeder idempotente y suite de pruebas. |
| 2026-10-06 08:45 | **ISS-10 (ProductTypes)** | *Verificación* → *Revisión Humana* | 64/64 pruebas al 100% PASS en Vitest, runner CLI verificado y evidencia `verificacion-product-types.md` generada. |
| 2026-10-06 08:50 | **ISS-10 (ProductTypes)** | *Revisión Humana* → *Hecho* | Quality Gate formalmente aprobado por el usuario. Suite de 64 pruebas íntegras y compilación limpia. |
| 2026-10-06 08:52 | **ISS-11 (Products)** | *Preparado* → *En curso* | Inicio de especificación, relación ProductType ↔ Product, reglas de negocio y seeder parametrizable (WIP = 1/1). |
| 2026-10-06 09:15 | **ISS-11 (Products)** | *En curso* → *Verificación* | Implementados use cases, modelo, entidad, relación ProductType, DTOs y suite de 24 pruebas en Vitest. |
| 2026-10-06 09:20 | **ISS-11 (Products)** | *Verificación* → *Revisión Humana* | 88/88 pruebas aprobadas al 100% en Vitest, compilación limpia con `npm run build` y evidencia `verificacion-products.md` completada. Columna *En curso* queda en 0/1. |

------------------------------------------------------------------------

## 5. Políticas de Calidad (Definition of Done — DoD)

Para que una tarjeta pueda ser declarada en estado **Hecho**: 1. El código debe compilar limpiamente con `npm run build` sin errores de TypeScript. 2. Todas las pruebas unitarias y de integración de Vitest deben pasar al 100% (`npm test`). 3. El documento de diseño arquitectónico ([`docs/sdd.md`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/docs/sdd.md)) debe estar actualizado con los ADRs pertinentes. 4. El archivo [`docs/kanban.md`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/docs/kanban.md) debe reflejar la transición, manteniendo la restricción **WIP = 1**. 5. Debe existir un archivo de evidencia markdown en `evidencias/` con salida literal de terminal. 6. El revisor humano debe emitir el dictamen formal en el Gate de calidad.
