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
| *(Vacío)* | *(0/1 - Disponible)* | *(0 tarjetas)* | 🔹 **ISS-08 / SEC-AUTH**<br>Seguridad, Anti-Enumeración, RTR Reúso, Fuerza Bruta y Evidencias Sem. 3 | ✅ **ISS-01:** Esqueleto NestJS CA arrancable<br>✅ **ISS-02:** Persistencia Sequelize y Modelos Base<br>✅ **ISS-03:** Configuración y Health Checks<br>✅ **ISS-04:** Bounded Context Inmuebles & Propietarios<br>✅ **ISS-05:** Bounded Context Contratos Arrendamiento<br>✅ **ISS-06:** Bounded Context Cobros y Recaudos<br>✅ **ISS-07:** Bounded Context Liquidaciones y Demo E2E |

------------------------------------------------------------------------

## 3. Detalle de Tarjetas e Issues

### Tarjetas en Estado "Hecho" (7/7 Pista Business Completada)

| ID Issue | Título / Alcance | Trazabilidad | Criterios AC | Commit Asociado |
|:--------------|:--------------|:-------------:|:-------------:|:--------------|
| **ISS-01** | Esqueleto NestJS Clean Architecture arrancable | [`trazabilidad/ISS-01.md`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/trazabilidad/ISS-01.md) | AC-1 a AC-4 aprobados | `feat(iss-01): esqueleto NestJS CA arrancable Refs #1` |
| **ISS-02** | Persistencia Sequelize, Conexión BD y Modelos Base | [`trazabilidad/ISS-02.md`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/trazabilidad/ISS-02.md) | AC-1 a AC-5 aprobados | `feat(iss-02): persistencia Sequelize y modelos Refs #2` |
| **ISS-03** | Configuración centralizada y Health Checks desacoplados | [`trazabilidad/ISS-03.md`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/trazabilidad/ISS-03.md) | AC-1 a AC-4 aprobados | `feat(iss-03): configuracion y health checks Refs #3` |
| **ISS-04** | Inmuebles, Propietarios y Reglas de Dominio | [`trazabilidad/ISS-04.md`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/trazabilidad/ISS-04.md) | AC-1 a AC-5 aprobados | `feat(iss-04): gestion inmuebles y propietarios Refs #4` |
| **ISS-05** | Contratos de Arrendamiento y Estados de Ocupación | [`trazabilidad/ISS-05.md`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/trazabilidad/ISS-05.md) | AC-1 a AC-5 aprobados | `feat(iss-05): contratos de arrendamiento Refs #5` |
| **ISS-06** | Cobros Mensuales, Pagos y Transiciones de Estado | [`trazabilidad/ISS-06.md`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/trazabilidad/ISS-06.md) | AC-1 a AC-5 aprobados | `feat(iss-06): cobros mensuales y pagos Refs #6` |
| **ISS-07** | Liquidaciones a Propietarios, Seeders y Demo E2E | [`trazabilidad/ISS-07.md`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/trazabilidad/ISS-07.md) | AC-1 a AC-5 aprobados | `feat(iss-07): integracion business y demo Refs #7` |

------------------------------------------------------------------------

### Tarjeta Actual: Semana 03 — Seguridad y Autenticación Integral

#### **ISS-08 / SEC-AUTH: Módulo de Autenticación, Mitigación de Amenazas y Evidencias**

- **Estado Actual:** `Revisión Humana (Quality Gate)`
- **WIP:** Liberó la columna *En curso* (WIP actual en desarrollo = 0/1, disponible para nuevo issue).
- **Alcance / Entregables:**
  1.  **Registro y Login:** Autenticación con bcrypt (salt 10) y mitigación de enumeración de usuarios (`HTTP 401: "Credenciales inválidas"` genérico).
  2.  **Refresh Token Rotation (RTR — RFC 6819):** Detección activa de reúso con revocación total de familia de tokens (`familyId`).
  3.  **Control de Perfil y Logout:** Endpoint `/auth/me` con validación de Bearer Token y lista negra en memoria con TTL (`TokenBlacklistService`).
  4.  **Recuperación de Contraseña (Forgot/Reset):** Tokens de un solo uso (`is_used = true`) con caducidad a 15 minutos y 256 bits de entropía CSPRNG.
  5.  **Interfaz Web SaaS Arrendo360:** Consola de validación directa sin escenarios preconfigurados, evaluando datos ingresados en tiempo real.
  6.  **Documentación Formal:** [`docs/sdd.md`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/docs/sdd.md), [`docs/seguridad.md`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/docs/seguridad.md) y [`docs/kanban.md`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/docs/kanban.md).
  7.  **Evidencias Semanales:** 5 documentos formales en `evidencias/semana 03/`.
- **Criterios de Aceptación (AC) Cumplidos:**
  - [x] **AC-1:** Registro y login con validaciones de unicidad y códigos 401 unificados.
  - [x] **AC-2:** Rotación RTR con detección de replay y revocación de familia completa.
  - [x] **AC-3:** Logout instantáneo invalidando tokens en `/auth/me`.
  - [x] **AC-4:** Recuperación con token de un solo uso y rechazo HTTP 400 ante reintentos.
  - [x] **AC-5:** 100% de la suite de pruebas automatizadas aprobada (24/24 tests en Vitest).
  - [x] **AC-6:** Documentación de amenazas (Enumeración, Reúso, Fuerza Bruta) en SDD y Guía de Seguridad.

------------------------------------------------------------------------

## 4. Registro Histórico de Transiciones de Estado (Log de Auditoría)

| Fecha y Hora | Tarjeta / Issue | Transición Realizada | Justificación / Evidencia |
|:-----------------|:-----------------|:-----------------|:-----------------|
| 2026-10-04 | **ISS-01 a ISS-07** | *En curso* → *Hecho* | Completada la pista Business con 7 issues aprobados en Gate y demo E2E funcional. |
| 2026-10-05 06:00 | **ISS-08 (Auth)** | *Preparado* → *En curso* | Criterios de aceptación revisados para el módulo de Autenticación (WIP = 1/1). |
| 2026-10-05 08:30 | **ISS-08 (Auth)** | *En curso* → *Verificación* | Implementados use cases, DTOs, entidades y vista web interactiva. Pruebas iniciadas. |
| 2026-10-05 12:15 | **ISS-08 (Auth)** | *Verificación* → *Revisión Humana* | Ejecutadas las 24 pruebas de Vitest (100% PASS), generadas las 5 evidencias en markdown y redactados `docs/sdd.md` y `docs/seguridad.md`. Columna *En curso* queda en 0/1. |

------------------------------------------------------------------------

## 5. Políticas de Calidad (Definition of Done — DoD)

Para que una tarjeta pueda ser declarada en estado **Hecho**: 1. El código debe compilar limpiamente con `npm run build` sin errores de TypeScript. 2. Todas las pruebas unitarias y de integración de Vitest deben pasar al 100% (`npm test`). 3. El documento de diseño arquitectónico ([`docs/sdd.md`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/docs/sdd.md)) debe estar actualizado con los ADRs pertinentes. 4. El archivo [`docs/kanban.md`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/docs/kanban.md) debe reflejar la transición, manteniendo la restricción **WIP = 1**. 5. Debe existir un archivo de evidencia markdown en `evidencias/` con salida literal de terminal. 6. El revisor humano debe emitir el dictamen formal en el Gate de calidad.
