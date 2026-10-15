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
| *(Vacío)* | *(0/1 - Disponible)* | *(0 tarjetas)* | *(0 tarjetas)* | ✅ **Fase I (ISS-01 a ISS-08):** Business Core, Entidades, Contratos, Cobros, Seeders, Ventas y Deadlocks<br>✅ **Fase II (ISS-09 a ISS-15):** Auth con RBAC, Primitivas Criptográficas, Users, Roles/Resources, Pivotes N:M, Guards, RTR y Session |

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
| **ISS-08** | Feature Sale + feature ProductSale (Ventas, Transacciones ACID y Stock) | [`backend/trazabilidad/ISS-08.md`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/backend/trazabilidad/ISS-08.md) | AC-1 a AC-5 aprobados | `feat(iss-08): feature sales, productsales, transacciones acid y stock Refs #8` |
| **ISS-09** | Base de Seguridad Compartida y Modelos Auth | [`backend/trazabilidad/ISS-09.md`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/backend/trazabilidad/ISS-09.md) | AC-1 a AC-5 aprobados | `feat(iss-09): base de seguridad compartida y modelos auth Refs #9` |
| **ISS-10** | Feature Users (Identidad, Hashing bcrypt y Ciclo de Vida) | [`backend/trazabilidad/ISS-10.md`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/backend/trazabilidad/ISS-10.md) | AC-1 a AC-5 aprobados | `feat(iss-10): feature users, hashing bcrypt y ciclo de vida Refs #10` |
| **ISS-11** | Features Roles y Resources (Catálogo de Autorización) | [`backend/trazabilidad/ISS-11.md`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/backend/trazabilidad/ISS-11.md) | AC-1 a AC-5 aprobados | `feat(iss-11): features roles y resources, catalogo de autorizacion Refs #11` |
| **ISS-12** | Features RoleUsers y ResourceRoles (Asignaciones y Concesiones RBAC) | [`backend/trazabilidad/ISS-12.md`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/backend/trazabilidad/ISS-12.md) | AC-1 a AC-5 aprobados | `feat(iss-12): features roleusers y resourceroles, asignaciones y concesiones rbac Refs #12` |
| **ISS-13** | Middlewares de Acceso y las Tres Modalidades (OPEN, PROTECTED, RBAC) | [`backend/trazabilidad/ISS-13.md`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/backend/trazabilidad/ISS-13.md) | AC-1 a AC-5 aprobados | `feat(iss-13): middlewares y guards de acceso en tres modalidades Refs #13` |
| **ISS-14** | Feature RefreshTokens (Sesiones Renovables, Rotación RTR y Revocación) | [`backend/trazabilidad/ISS-14.md`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/backend/trazabilidad/ISS-14.md) | AC-1 a AC-5 aprobados | `feat(iss-14): feature refreshtokens, rotacion rtr y deteccion de reuso Refs #14` |
| **ISS-15** | Feature Session (Login, Perfil, Logout, Recuperación y Cierre Fase II) | [`backend/trazabilidad/ISS-15.md`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/backend/trazabilidad/ISS-15.md) | AC-1 a AC-5 aprobados | `feat(iss-15): feature session, login, perfil, logout y cierre fase ii Refs #15` |

------------------------------------------------------------------------

### Tarjeta Actual: Feature Sales & ProductSales (Transacciones ACID y Reconciliación de Stock)

#### **ISS-12 / BIZ-SALES-TRANSACTIONS: Feature Sale & ProductSale, Transaccionalidad ACID, Prevención de Deadlocks (sales → products → product_sales), Descuento y Reconciliación de Stock, Seeder Parametrizable y Suites .http**

- **Estado Actual:** `Revisión Humana (Quality Gate)`
- **WIP:** Liberó la columna *En curso* (WIP actual en desarrollo = 0/1, disponible para nuevo issue).
- **Alcance / Entregables:**
  1.  **Modelos y Dominio de Sales & ProductSales:** Entidades `Sale` y `ProductSale` con agregados de dominio, reglas invariantes de cantidad $> 0$, precio $\ge 0$, recálculo de subtotal, impuesto (19%), descuento y total. Modelos Sequelize `SaleModel` (`sales`) y `ProductSaleModel` (`product_sales`) con tipos numéricos `DECIMAL(12, 2)` y getters flotantes precisos.
  2.  **Relaciones Bidireccionales:** Asociaciones `Sale.belongsTo(ArrendatarioModel, { foreignKey: 'client_id', as: 'client' })`, `Sale.hasMany(ProductSaleModel, { foreignKey: 'sale_id', as: 'items' })`, `ProductSale.belongsTo(SaleModel, { foreignKey: 'sale_id', as: 'sale' })` y `ProductSale.belongsTo(ProductModel, { foreignKey: 'product_id', as: 'product' })`.
  3.  **Transaccionalidad ACID y Prevención de Deadlocks:**
      - Orden canónico de bloqueo estricto en InnoDB: `sales` $\to$ `products` (ordenados ascendentemente por `id`) $\to$ `product_sales`.
      - Bloqueo preventivo de cabecera `sales` mediante `findByIdForUpdate` (`SELECT ... FOR UPDATE`) previo a mutaciones de detalle para evitar deadlock por escalado de S-lock a X-lock.
  4.  **Gestión y Reconciliación de Inventario:**
      - Validación de cliente activo y existencia de productos con stock suficiente.
      - Descuento inmediato de stock al confirmar líneas de venta.
      - Reconciliación de inventario en actualizaciones parciales (`PUT`/`PATCH`) mediante cálculo de deltas ($\Delta = \text{newQty} - \text{oldQty}$).
      - Restitución automática e íntegra del stock al inventario en baja lógica (`deactivate`) o eliminación física (`DELETE`) de líneas o de la venta completa.
  5.  **Enrutamiento Multilingüe:**
      - `@Controller(['ventas', 'sales'])` para `/api/ventas` y `/api/sales`.
      - `@Controller(['detalle-ventas', 'product-sales'])` para `/api/detalle-ventas` y `/api/product-sales`.
  6.  **Seeder Parametrizable e Idempotente:**
      - Generación de ventas (`--sales=N`, `SEED_SALES`) y líneas de venta (`--product-sales=N`, `SEED_PRODUCT_SALES`) con descuento controlado de inventario.
  7.  **Colección Interactiva (.http):**
      - Archivos `.http` para ventas (`sales.get.http`, `sales.create.http`, `sales.update.http`, `sales.delete.http`) y detalles (`product-sales.*.http`).
  8.  **Suite Automatizada Vitest:**
      - 21 pruebas exhaustivas para `sales` y `product-sales`, alcanzando 109/109 pruebas globales al 100% PASS y compilación limpia con `nest build`.
- **Criterios de Aceptación (AC) Cumplidos:**
  - [x] **AC-1:** Modelos Sequelize `SaleModel` y `ProductSaleModel` con claves foráneas e integridad referencial.
  - [x] **AC-2:** Transacciones ACID gestionadas por repositorio con rollback automático ante errores o stock insuficiente.
  - [x] **AC-3:** Mitigación sistemática de deadlocks mediante orden canónico de bloqueo `sales` $\to$ `products (ASC)` $\to$ `product_sales`.
  - [x] **AC-4:** Descuento atómico de stock y cálculo de totales/impuestos consistentes.
  - [x] **AC-5:** Reconciliación por deltas en `PUT`/`PATCH` y restitución automática de stock al anular/eliminar.
  - [x] **AC-6:** Enrutadores bilingües `/api/ventas` y `/api/detalle-ventas` con alias REST `/api/sales` y `/api/product-sales`.
  - [x] **AC-7:** Seeder CLI parametrizable (`--sales=N`, `--product-sales=N`) y colecciones `.http` funcionales.
  - [x] **AC-8:** 109/109 pruebas aprobadas al 100% en Vitest y compilación limpia sin errores TypeScript.

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
| 2026-10-14 17:18 | **ISS-08 (Sales & Transactions)** | *Verificación* → *Revisión Humana* | 109/109 pruebas aprobadas al 100% en Vitest, compilación limpia con `nest build`, seeders CLI verificados y evidencia generada en `backend/trazabilidad/ISS-08.md`. |
| 2026-10-14 17:25 | **ISS-08 (Sales & Transactions)** | *Revisión Humana* → *Hecho* | Gate de Fase I aprobado por el revisor humano. Cierre formal de la Fase I (Business Core). |
| 2026-10-14 17:28 | **ISS-09 a ISS-12 (Auth Base, Users, Roles/Resources, Pivotes)** | *Preparado* → *Hecho* | Modelos de persistencia en Sequelize, entidades puras, normalización de identidad, matching dinámico y pruebas unitarias integradas en `backend/trazabilidad/` (`ISS-09.md` a `ISS-12.md`). |
| 2026-10-14 17:35 | **ISS-13 a ISS-15 (Modalidades, RefreshTokens RTR, Session y Cierre)** | *Preparado* → *Hecho* | Guard `RolesGuard`, 3 modalidades de acceso (OPEN, PROTECTED, RBAC), Refresh Token Rotation con detección de reúso (RFC 6819), lista negra de tokens, recuperación de contraseña y 112/112 pruebas al 100% PASS documentadas en `backend/trazabilidad/` (`ISS-13.md` a `ISS-15.md`). Cierre definitivo de Fase II. |

------------------------------------------------------------------------

## 5. Políticas de Calidad (Definition of Done — DoD)

Para que una tarjeta pueda ser declarada en estado **Hecho**: 1. El código debe compilar limpiamente con `npm run build` sin errores de TypeScript. 2. Todas las pruebas unitarias y de integración de Vitest deben pasar al 100% (`npm test`). 3. El documento de diseño arquitectónico ([`docs/sdd.md`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/docs/sdd.md)) debe estar actualizado con los ADRs pertinentes. 4. El archivo [`docs/kanban.md`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/docs/kanban.md) debe reflejar la transición, manteniendo la restricción **WIP = 1**. 5. Debe existir un archivo de evidencia markdown en `evidencias/` con salida literal de terminal. 6. El revisor humano debe emitir el dictamen formal en el Gate de calidad.
