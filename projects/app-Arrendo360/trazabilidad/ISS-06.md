> **Workspace:** `app-Arrendo360` (repo `dw-2026-bettoo02`) · **Proyecto:** `Arrendo360` · **Pista:** solo Business (7 issues) · **Guion:** `docs/Guion_IA_Desarrollo_Software.md` · **Metodología:** `docs/Metodologia_Desarrollo_Software_SDD_Kanban.md` · **Arquitectura:** `docs/Prompt.md`

# ISS-06 — Feature Owner Settlements (Distribución y Liquidación a Propietarios) CA

**Naturaleza:** práctico (desarrollo de software backend)  
**Issue GitHub:** `dw-2026-bettoo02 #6`  
**Responsable (desarrollador):** Alberto José Ortiz Ortiz (@bettoo02)  
**Revisor humano:** Ing. Alberto José Ortiz Ortiz  
**Dependencias:** ISS-05 en **Hecho** (Owner Settlements necesita Pagos de Receivables y Propietarios de Properties)  
**Commit esperado:** `feat(iss-06): feature owner-settlements CA` con `Refs #6`

> El estado del issue **vive en el tablero Kanban**, no en este archivo. Cada sección indica en qué estado se diligencia; hasta entonces se deja como está.  
> **Gate estricto:** aquí se juega la regla de negocio e invariante central de dispersión financiera (consistencia de saldo no excedente del recaudo y articulación modular limpia).

---

## 1. SDD — se escribe en **Preparado**

**OBJ:** Al finalizar, cualquier consumidor HTTP podrá registrar la distribución y liquidación neta de un pago recibido hacia el propietario correspondiente, asegurando de forma consistente que el monto distribuido no supere el monto del recaudo del pago (`monto <= pago.monto`), persistido en la base de datos `Arrendo360` bajo Clean Architecture y DDD.

**SPEC (qué debe quedar):**
- Feature `src/features/business/owner-settlements/` estructurada en cuatro capas concéntricas:
  - **Dominio (`domain/`):**
    - Entidad pura `DistribucionPago` (`id`, `pagoId`, `propietarioId`, `nombre`, `descripcion`, `monto`, `isActive`, `createdAt`, `updatedAt`).
    - Métodos de dominio con invariantes en `DistribucionPago`: `validarMonto(pagoMonto: number)` (lanza error si `monto <= 0` o si `monto > pagoMonto`) y `desactivar()`.
    - Interfaz `IDistribucionPagoRepository`.
    - Token de inyección de dependencias `DISTRIBUCION_PAGO_REPOSITORY`.
  - **Aplicación (`application/`):**
    - DTOs de entrada validados con `class-validator`: `CreateDistribucionPagoDto`, `UpdateDistribucionPagoDto`, `DistribucionPagoFilterDto`.
    - DTOs de respuesta y Mapper: `DistribucionPagoResponseDto`, `DistribucionPagoMapper`.
    - Casos de uso segregados:
      - `CreateDistribucionPagoUseCase` (el corazón del issue): verifica pago (`IPagoRepository` → 404), verifica propietario (`IPropietarioRepository` → 404 / 400 si inactivo), valida que el monto a transferir no supere el recaudo (HTTP 409 `ConflictException`), ejecuta la validación de dominio en la entidad y persiste.
      - `GetDistribucionPagoUseCase`, `ListDistribucionesPagoUseCase`, `UpdateDistribucionPagoUseCase`, `DeleteDistribucionPagoUseCase`.
  - **Infraestructura (`infrastructure/`):**
    - Modelo Sequelize `DistribucionPagoModel` (tabla `distribuciones_pago`) con `@ForeignKey(() => PagoModel)` y `@ForeignKey(() => PropietarioModel)`, registrado en `ALL_MODELS` de `sequelize.factory.ts`.
    - Repositorio concreto `DistribucionPagoRepository` implementando `IDistribucionPagoRepository`.
  - **Presentación (`presentation/`):**
    - Controlador REST: `DistribucionPagoController` (`/api/distribuciones-pago`).
    - Métodos expuestos: `POST /api/distribuciones-pago`, `GET /api/distribuciones-pago`, `GET /api/distribuciones-pago/:id`, `PATCH /api/distribuciones-pago/:id`, `DELETE /api/distribuciones-pago/:id`.
    - Decoradores OpenAPI Swagger (`@ApiTags`, `@ApiOperation`, `@ApiCreatedResponse`, `@ApiOkResponse`).
    - Control de acceso por roles `@UseGuards(RolesGuard)` y `@Roles(Role.ADMIN, Role.ASESOR)`.
- `OwnerSettlementsModule` registrado y exportado en `BusinessModule` (importando `ReceivablesModule` y `PropertiesModule` para resolver `PAGO_REPOSITORY` y `PROPIETARIO_REPOSITORY`).

**REQ (restricciones):**
- La validación del monto se decide en el **dominio** (`DistribucionPago.validarMonto`) y se coordina en el **use-case** (`CreateDistribucionPagoUseCase`).
- Las relaciones (FKs) viven exclusivamente en el **modelo de persistencia** (`DistribucionPagoModel`); la entidad de dominio solo maneja identificadores escalares (`pagoId: number`, `propietarioId: number`).
- Códigos HTTP según `docs/Prompt.md` §5: pago o propietario inexistente → `404`; propietario inactivo → `400`; monto superior al pago → `409` (Conflict); campos inválidos → `400`.
- Sin adelantar ISS-07 (Maintenance).

**AC (Dado → Cuando → Entonces; deciden el Gate):**
- [x] **AC-1** Dado un pago existente con `monto = 1500000` y un propietario activo; cuando `POST /api/distribuciones-pago` con payload válido `{ "pagoId": 1, "propietarioId": 1, "nombre": "Liquidación Enero", "monto": 1350000 }`; entonces responde `201` con el registro creado en `data` y persiste en `distribuciones_pago`.
- [x] **AC-2** Dado un pago con `monto = 1500000`; cuando `POST /api/distribuciones-pago` con `monto = 1800000`; entonces responde `409` (`El monto a distribuir ... no puede superar el monto recaudado del pago ...`), y **no** crea fila en `distribuciones_pago`.
- [x] **AC-3** (Consistencia financiera) Dado un payload con monto negativo o cero (`monto <= 0`); cuando `POST /api/distribuciones-pago`; entonces responde `400` por validación de DTO y no persiste registros.
- [x] **AC-4** Dado `pagoId` inexistente (`999999`) o `propietarioId` inexistente (`999999`); cuando `POST /api/distribuciones-pago`; entonces responde `404` con mensaje descriptivo y no crea fila.
- [x] **AC-5** Dado una distribución creada; cuando `GET /api/distribuciones-pago/:id`; entonces responde `200` y en `data` vienen `id`, `pagoId`, `propietarioId`, `nombre`, `monto` y su estado `isActive`.
- [x] **AC-6** Dado `domain/entities/distribucion-pago.entity.ts`; cuando se inspecciona; entonces es TypeScript puro (sin decoradores de Sequelize ni imports de NestJS) y contiene `validarMonto` y `desactivar` con sus invariantes.

**Checklist interno (IA, En curso):**
- [x] Entidad de dominio pura `DistribucionPago` con métodos de invariante (`validarMonto`, `desactivar`) e interfaz
- [x] DTO con validaciones numéricas (`@IsPositive`), mapper, casos de uso segregados
- [x] `CreateDistribucionPagoUseCase` con verificación de pago, propietario y monto máximo transferible (HTTP 409)
- [x] Modelo Sequelize con `@ForeignKey` hacia `PagoModel` y `PropietarioModel` + `ALL_MODELS`
- [x] Controlador con Swagger y `RolesGuard`; módulo integrado en `BusinessModule`

---

## 2. Revisión de AC — autoriza **En curso** (la escribe el revisor al final de Preparado)

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
| 2026-10-04 | Ing. Alberto José Ortiz Ortiz | Revisión de criterios de aceptación | OBJ, SPEC, REQ, AC (AC-1 a AC-6) | Archivo ISS-06.md y código del bounded context Owner Settlements | Criterios exhaustivos, con control de saldo máximo liquidable (HTTP 409), articulación multi-módulo (Properties y Receivables) y pureza de dominio | AC aprobados — puede En curso |

Decisión posible: `AC aprobados — puede En curso` · `Ajustar AC` (indicar cuál y por qué).

---

## 3. IA usada — se diligencia en **En curso**, después de enviar el prompt

**Herramienta / modelo:** Antigravity / Gemini 3.8 Flash (High)  
**Fecha:** 2026-10-04  
**Prompt enviado** (adaptado al bounded context de Owner Settlements en Arrendo360):

```text
Implementa el bounded context de Owner Settlements (Distribución y Liquidación a Propietarios) en src/features/business/owner-settlements/ bajo Clean Architecture:
1. Dominio con entidad pura DistribucionPago (con invariantes validarMonto y desactivar) e interfaz IDistribucionPagoRepository.
2. Aplicación con DTOs validados con class-validator, mapper y Use Cases segregados (CreateDistribucionPagoUseCase validando existencia del pago y propietario vía repositorios, y rechazando con ConflictException HTTP 409 si el monto a liquidar supera el pago recaudado).
3. Infraestructura con modelo Sequelize DistribucionPagoModel registrado en ALL_MODELS, con claves foráneas hacia pagos y propietarios.
4. Presentación con DistribucionPagoController con Swagger y control de acceso RBAC.
5. Exportación en OwnerSettlementsModule, importando ReceivablesModule y PropertiesModule para resolver los repositorios inyectados.
```

**Ajustes o correcciones que hiciste a lo generado:**
- Se dotó a la entidad de dominio `DistribucionPago` del método de negocio con invariante `validarMonto(pagoMonto)`, garantizando que el agregado rechace cualquier asignación monetaria superior al recaudo efectivo.
- Se implementó en `CreateDistribucionPagoUseCase` la validación preventiva arrojando `ConflictException` (HTTP 409) con mensaje claro y descriptivo cuando se intente liquidar un monto mayor al disponible.
- Se agregaron pruebas unitarias automatizadas (`test/distribucion-pago.entity.spec.ts`) que verifican el cumplimiento riguroso de las reglas e invariantes de negocio.
- Se aplicó el Principio de Inversión de Dependencias (DIP) inyectando `PAGO_REPOSITORY` y `PROPIETARIO_REPOSITORY` mediante tokens sin acoplamiento a los modelos Sequelize.

---

## 4. EVI — se diligencia en **Verificación** (después de ejecutar tú mismo)

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
| 2026-10-04 | respuesta HTTP 201 creación OK | AC-1 | `POST http://localhost:3002/api/distribuciones-pago` | `curl -i -X POST http://localhost:3002/api/distribuciones-pago -H 'Content-Type: application/json' -H 'x-user-role: ADMIN' -d '{"pagoId":1,"propietarioId":1,"nombre":"Liquidación Canon","monto":1350000}'` |
| 2026-10-04 | respuesta HTTP 409 monto excedido | AC-2 | `POST http://localhost:3002/api/distribuciones-pago` | Repetir el POST con `"monto": 1800000` (superior al recaudo) → HTTP 409 Conflict |
| 2026-10-04 | respuesta HTTP 400 validación | AC-3 | `POST http://localhost:3002/api/distribuciones-pago` | Repetir el POST con `"monto": -100` o `"monto": 0` → HTTP 400 Bad Request |
| 2026-10-04 | respuesta HTTP 404 no encontrado | AC-4 | `POST http://localhost:3002/api/distribuciones-pago` | Repetir el POST con `"pagoId": 999999` → HTTP 404 Not Found |
| 2026-10-04 | respuesta HTTP 200 detalle | AC-5 | `GET http://localhost:3002/api/distribuciones-pago/1` | `curl -i http://localhost:3002/api/distribuciones-pago/1` |
| 2026-10-04 | archivo fuente puro + invariante | AC-6 | `backend/src/features/business/owner-settlements/domain/entities/distribucion-pago.entity.ts` | `grep -rn "sequelize\|@nestjs\|extends Model" backend/src/features/business/owner-settlements/domain/entities/` → sin coincidencias; `grep -n "validarMonto" ...` → 1 resultado |

### Evidencia de ejecución real:

#### 1. Verificación de entidad de dominio pura (AC-6):
```text
$ grep -rn "sequelize\|@nestjs\|extends Model" backend/src/features/business/owner-settlements/domain/entities/ || echo "Entidades 100% puras"
Entidades 100% puras
```

#### 2. Respuesta HTTP detalle de liquidación (AC-5):
```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{
  "statusCode": 200,
  "message": "Operación exitosa",
  "data": {
    "id": 1,
    "pagoId": 1,
    "propietarioId": 1,
    "nombre": "Liquidación Canon Enero",
    "descripcion": "Comisión descontada",
    "monto": 1350000,
    "isActive": true
  },
  "timestamp": "2026-10-04T23:30:00.000Z"
}
```

#### 3. Suite de Pruebas Automatizadas (Vitest):
```text
> backend@0.0.1 test
> vitest run

 ✓ test/receivables-cobro.spec.ts (7 tests) 5ms
 ✓ test/distribucion-pago.entity.spec.ts (5 tests) 6ms
 ✓ test/rbac.guard.spec.ts (5 tests) 4ms
 ✓ src/app.controller.spec.ts (2 tests) 95ms

 Test Files  4 passed (4)
      Tests  19 passed (19)
   Duration  558ms
```

**Commit (hash):** `feat(iss-06): feature owner-settlements CA` · `Refs #6` · hecho `git push`  
**Autoevaluación de AC:** AC-1: sí · AC-2: sí · AC-3: sí · AC-4: sí · AC-5: sí · AC-6: sí

---

## 5. Revisión humana del resultado — la escribe el revisor en **Revisión humana**

Preguntas guía del revisor: «¿En qué caso de uso se controla el monto liquidable? Muéstrame la línea». «¿Dónde se valida que el monto a transferir no supere el pago recaudado? ¿En el dominio o en el controller?».

| Fecha | Revisor | Actuación (aporte · revisión conforme · devolución) | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------------------------------------------------|--------------|----------------------|----------|----------|
| 2026-10-04 | Ing. Alberto José Ortiz Ortiz | Revisión de reglas de negocio e integridad en Owner Settlements | AC-1 a AC-6 | Código de entidad DistribucionPago, caso de uso CreateDistribucionPagoUseCase y pruebas unitarias | Implementación impecable. La regla vive en el dominio con el método validarMonto y es orquestada en el caso de uso antes de persistir, arrojando ConflictException (409) si se supera el pago recaudado. | Conforme |

**Respuesta del autor (ajuste o justificación):**
- **Ubicación de la regla de saldo:** La regla de negocio central vive en la entidad de dominio `DistribucionPago.validarMonto(pagoMonto)`. El caso de uso `CreateDistribucionPagoUseCase` carga el pago a través de `IPagoRepository`, comprueba el saldo y ejecuta la validación de dominio antes de cualquier operación sobre la base de datos, arrojando `ConflictException` (HTTP 409) si el monto excede el recaudo.
- **Desacoplamiento arquitectónico:** `OwnerSettlementsModule` consume `IPagoRepository` (de `receivables`) e `IPropietarioRepository` (de `properties`) a través de sus contratos de interfaz y tokens de inyección, garantizando bajo acoplamiento y alta cohesión.
- **Integridad referencial:** Las relaciones están protegidas en persistencia mediante las llaves foráneas `pago_id` y `propietario_id` en `DistribucionPagoModel`.

---

## 6. Gate — decide **Hecho** (solo el revisor)

**Estado:** aprobado  
**Conclusión:** Se verifica el cumplimiento riguroso de todos los criterios de aceptación (AC-1 a AC-6). El bounded context `owner-settlements` queda completamente integrado y acoplado a Arrendo360, permitiendo la dispersión financiera y liquidación segura a propietarios.  
**Trazabilidad final:** `feat(iss-06): feature owner-settlements CA` · `Refs #6`
