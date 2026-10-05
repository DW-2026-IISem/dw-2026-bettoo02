> **Workspace:** `app-Arrendo360` (repo `dw-2026-bettoo02`) · **Proyecto:** `Arrendo360` · **Pista:** solo Business (7 issues) · **Guion:** `docs/Guion_IA_Desarrollo_Software.md` · **Metodología:** `docs/Metodologia_Desarrollo_Software_SDD_Kanban.md` · **Arquitectura:** `docs/Prompt.md`

# ISS-05 — Feature Receivables (Cobros Mensuales y Pagos) CA

**Naturaleza:** práctico (desarrollo de software backend)  
**Issue GitHub:** `dw-2026-bettoo02 #5`  
**Responsable (desarrollador):** Alberto José Ortiz Ortiz (@bettoo02)  
**Revisor humano:** Ing. Alberto José Ortiz Ortiz  
**Dependencias:** ISS-04 en **Hecho** (Receivables necesita Contratos activos de Leases)  
**Commit esperado:** `feat(iss-05): feature receivables CA` con `Refs #5`

> El estado del issue **vive en el tablero Kanban**, no en este archivo. Cada sección indica en qué estado se diligencia; hasta entonces se deja como está.  
> Este issue consolida la **gestión de cobranza e ingresos de arrendamiento** de Arrendo360, articulando los contratos activos del issue anterior (`leases`) con la generación de cuentas de cobro y registro de pagos, habilitando la posterior dispersión y liquidación a propietarios del issue siguiente (`owner-settlements`).

---

## 1. SDD — se escribe en **Preparado**

**OBJ:** Al finalizar, cualquier consumidor HTTP podrá generar, listar, consultar y gestionar cobros mensuales vinculados a contratos de arrendamiento activos, así como registrar y aplicar pagos (actualizando el estado del cobro a `PAGADO` cuando corresponda) persistidos en la base de datos `Arrendo360`, con validación estricta, desacoplamiento con Clean Architecture y DDD.

**SPEC (qué debe quedar):**
- Feature `src/features/business/receivables/` con las cuatro capas concéntricas de Clean Architecture:
  - **Dominio (`domain/`):**
    - Entidades puras `CobroMensual` y `Pago` (TypeScript puro, sin decoradores de persistencia ni imports de `@nestjs/*`).
    - Métodos de negocio con invariantes en `CobroMensual`: `aplicarPago(monto: number)` (que transiciona el estado a `PAGADO` si el monto cubre la obligación) y `anular(motivo?: string)` (impidiendo anulación de cobros ya pagados).
    - Interfaces `ICobroMensualRepository` e `IPagoRepository` que definen contratos de persistencia, filtrado y búsqueda.
    - Tokens de inyección de dependencias `COBRO_MENSUAL_REPOSITORY` y `PAGO_REPOSITORY`.
  - **Aplicación (`application/`):**
    - DTOs de entrada con `class-validator`: `CreateCobroDto`, `UpdateCobroDto`, `CobroFilterDto`, `CreatePagoDto`, `UpdatePagoDto`, `PagoFilterDto`.
    - DTOs de salida y Mappers: `CobroResponseDto`, `CobroMapper`, `PagoResponseDto`, `PagoMapper`.
    - Casos de uso segregados para Cobros: `CreateCobroUseCase` (valida la existencia del contrato vía `IContratoRepository` y exige que su estado sea `ACTIVO`), `ListCobrosUseCase`, `GetCobroUseCase`, `UpdateCobroUseCase`, `DeleteCobroUseCase`.
    - Casos de uso segregados para Pagos: `CreatePagoUseCase` (valida la existencia del cobro vía `ICobroMensualRepository`, rechaza cobros anulados, aplica el pago en la entidad e invoca la actualización de estado a `PAGADO`), `ListPagosUseCase`, `GetPagoUseCase`, `UpdatePagoUseCase`, `DeletePagoUseCase`.
  - **Infraestructura (`infrastructure/`):**
    - Modelos de persistencia Sequelize: `CobroMensualModel` (tabla `cobros_mensuales` con `@ForeignKey(() => ContratoModel)`) y `PagoModel` (tabla `pagos` con `@ForeignKey(() => CobroMensualModel)`), registrados en `ALL_MODELS` de `sequelize.factory.ts`.
    - Repositorios concretos `CobroMensualRepository` y `PagoRepository` implementando las interfaces de dominio.
  - **Presentación (`presentation/`):**
    - Controladores REST: `CobrosController` (`/api/cobros`) y `PagosController` (`/api/pagos`).
    - Métodos expuestos: `POST /api/cobros`, `GET /api/cobros`, `GET /api/cobros/:id`, `PATCH /api/cobros/:id`, `DELETE /api/cobros/:id` (y análogos para `/api/pagos`).
    - Decoradores OpenAPI Swagger (`@ApiTags`, `@ApiOperation`, `@ApiCreatedResponse`, `@ApiOkResponse`).
    - Control de acceso por roles `@UseGuards(RolesGuard)` y `@Roles(Role.ADMIN, Role.ASESOR)`.
- `ReceivablesModule` registrado y exportado en `BusinessModule` (e importando `LeasesModule` para acceder a `CONTRATO_REPOSITORY`).

**REQ (restricciones):**
- La **relación** (FK, `BelongsTo`, `HasMany`) vive exclusivamente en los **modelos de infraestructura**; las entidades de dominio solo tienen `referenciaId: number` (id del contrato o del cobro).
- Códigos HTTP estrictos según `docs/Prompt.md` §5: contrato inexistente → `404`, contrato inactivo o cobro anulado → `400`, validación fallida → `400`, recurso no encontrado → `404`.
- Sin adelantar `owner-settlements` (ISS-06).

**AC (Dado → Cuando → Entonces; deciden el Gate):**
- [x] **AC-1** Dado la app arrancada; cuando se consulta `GET /api/cobros`; entonces responde `200` con la lista paginada en el envelope `data.items` y metadatos en `data.meta`.
- [x] **AC-2** Dado un payload válido de cobro `{ "referenciaId": 1, "fecha": "2026-10-01", "valor": 1500000 }` para un contrato existente y activo; cuando `POST /api/cobros`; entonces responde `201` con el cobro creado y persiste en `cobros_mensuales`.
- [x] **AC-3** Dado un payload con `referenciaId` de contrato inexistente; cuando `POST /api/cobros`; entonces responde `404` (`El contrato con ID ... no existe`) y **no** crea fila.
- [x] **AC-4** Dado un payload con `valor <= 0` o sin campos requeridos; cuando `POST /api/cobros`; entonces responde `400` y no crea fila.
- [x] **AC-5** Dado `domain/entities/cobro-mensual.entity.ts` y `pago.entity.ts`; cuando se inspeccionan; entonces son clases TypeScript puras (sin decoradores de Sequelize ni imports de NestJS) y `CobroMensual` contiene `aplicarPago` y `anular` con sus invariantes.

**Checklist interno (IA, En curso):**
- [x] Entidades de dominio puras con métodos de invariante (`aplicarPago`, `anular`), interfaces de repositorio
- [x] DTOs de validación con class-validator, mappers, casos de uso (`CreateCobroUseCase` verifica contrato activo)
- [x] Modelos Sequelize con FK/BelongsTo (`cobros_mensuales`, `pagos`), repositorios + `ALL_MODELS`
- [x] Controladores con Swagger y `RolesGuard` en `presentation/`
- [x] Módulo en `BusinessModule` (importando `LeasesModule`)

---

## 2. Revisión de AC — autoriza **En curso** (la escribe el revisor al final de Preparado)

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
| 2026-10-04 | Ing. Alberto José Ortiz Ortiz | Revisión de criterios de aceptación | OBJ, SPEC, REQ, AC (AC-1 a AC-5) | Archivo ISS-05.md y arquitectura modular de Receivables | Criterios exhaustivos, con validación de existencia y estado del contrato, aplicación de pagos y pureza de dominio | AC aprobados — puede En curso |

Decisión posible: `AC aprobados — puede En curso` · `Ajustar AC` (indicar cuál y por qué).

---

## 3. IA usada — se diligencia en **En curso**, después de enviar el prompt

**Herramienta / modelo:** Antigravity / Gemini 3.8 Flash (High)  
**Fecha:** 2026-10-04  
**Prompt enviado** (adaptado al bounded context de Receivables en Arrendo360):

```text
Implementa el bounded context de Receivables (Cobros Mensuales y Pagos) en src/features/business/receivables/ bajo Clean Architecture:
1. Dominio con entidades puras CobroMensual (con invariantes aplicarPago y anular) y Pago, e interfaces ICobroMensualRepository / IPagoRepository.
2. Aplicación con DTOs validados con class-validator, mappers y Use Cases segregados (CreateCobroUseCase validando existencia y estado ACTIVO del contrato vía IContratoRepository, y CreatePagoUseCase aplicando el pago y actualizando el cobro a PAGADO).
3. Infraestructura con modelos Sequelize CobroMensualModel y PagoModel registrados en ALL_MODELS, con claves foráneas e integridad referencial.
4. Presentación con CobrosController y PagosController con Swagger y control de acceso RBAC.
5. Exportación en ReceivablesModule, importando LeasesModule para inyectar CONTRATO_REPOSITORY.
```

**Ajustes o correcciones que hiciste a lo generado:**
- Se dotó a la entidad de dominio `CobroMensual` de métodos de negocio con invariantes (`aplicarPago` y `anular`), evitando modelos anémicos y asegurando que las reglas de transición de estado radiquen en el núcleo de dominio.
- Se conectó `CreatePagoUseCase` con el método `aplicarPago` de la entidad para asegurar la transición atómica del estado a `PAGADO` cuando el pago aprobado cubra el valor adeudado.
- Se implementó suite completa de pruebas unitarias (`test/cobro-mensual.entity.spec.ts`) con 7 pruebas que verifican el cumplimiento estricto de todas las reglas de negocio e invariantes de dominio.
- Se integró la inyección por tokens (`COBRO_MENSUAL_REPOSITORY`, `PAGO_REPOSITORY`, `CONTRATO_REPOSITORY`) respetando el Principio de Inversión de Dependencias (DIP).

---

## 4. EVI — se diligencia en **Verificación** (después de ejecutar tú mismo)

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
| 2026-10-04 | respuesta HTTP 200 listado | AC-1 | `GET http://localhost:3002/api/cobros` | `curl -i http://localhost:3002/api/cobros` |
| 2026-10-04 | respuesta HTTP 201 creación | AC-2 | `POST http://localhost:3002/api/cobros` | `curl -i -X POST http://localhost:3002/api/cobros -H 'Content-Type: application/json' -H 'x-user-role: ADMIN' -d '{"referenciaId":1,"fecha":"2026-10-01","valor":1500000}'` |
| 2026-10-04 | respuesta HTTP 404 no encontrado | AC-3 | `POST http://localhost:3002/api/cobros` | `curl -i -X POST http://localhost:3002/api/cobros -H 'Content-Type: application/json' -H 'x-user-role: ADMIN' -d '{"referenciaId":999999,"fecha":"2026-10-01","valor":1500000}'` |
| 2026-10-04 | respuesta HTTP 400 validación | AC-4 | `POST http://localhost:3002/api/cobros` | `curl -i -X POST http://localhost:3002/api/cobros -H 'Content-Type: application/json' -H 'x-user-role: ADMIN' -d '{"referenciaId":1,"valor":-500}'` |
| 2026-10-04 | archivo fuente puro + invariante | AC-5 | `backend/src/features/business/receivables/domain/entities/cobro-mensual.entity.ts` | `grep -rn "sequelize\|@nestjs\|extends Model" backend/src/features/business/receivables/domain/entities/` → sin coincidencias; `grep -n "aplicarPago" ...` → 1 resultado |

### Evidencia de ejecución real:

#### 1. Verificación de entidades de dominio puras (AC-5):
```text
$ grep -rn "sequelize\|@nestjs\|extends Model" backend/src/features/business/receivables/domain/entities/ || echo "Entidades 100% puras"
Entidades 100% puras
```

#### 2. Respuesta HTTP listado (AC-1):
```http
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{
  "statusCode": 200,
  "message": "Operación exitosa",
  "data": {
    "items": [],
    "meta": {
      "total": 0,
      "page": 1,
      "limit": 10,
      "totalPages": 0
    }
  },
  "timestamp": "2026-10-04T23:10:00.000Z"
}
```

#### 3. Suite de Pruebas Automatizadas (Vitest):
```text
> backend@0.0.1 test
> vitest run

 ✓ test/cobro-mensual.entity.spec.ts (7 tests) 4ms
 ✓ test/rbac.guard.spec.ts (5 tests) 4ms
 ✓ src/app.controller.spec.ts (2 tests) 95ms

 Test Files  3 passed (3)
      Tests  14 passed (14)
   Duration  555ms
```

**Commit (hash):** `feat(iss-05): feature receivables CA` · `Refs #5` · hecho `git push`  
**Autoevaluación de AC:** AC-1: sí · AC-2: sí · AC-3: sí · AC-4: sí · AC-5: sí

---

## 5. Revisión humana del resultado — la escribe el revisor en **Revisión humana**

Preguntas guía del revisor: «¿Dónde vive la relación con Contrato: en el dominio o en el model? ¿Por qué?» «¿Quién comprueba que el contrato existe y está activo: el controller, el use-case o la BD?».

| Fecha | Revisor | Actuación (aporte · revisión conforme · devolución) | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------------------------------------------------|--------------|----------------------|----------|----------|
| 2026-10-04 | Ing. Alberto José Ortiz Ortiz | Revisión de arquitectura limpia y reglas de negocio en Receivables | AC-1 a AC-5 | Entidades de dominio, casos de uso, modelos Sequelize y tests unitarios | La relación con el contrato vive en el modelo de infraestructura mediante `@ForeignKey`, manteniendo el dominio puro. La validación del contrato y su estado activo reside en el caso de uso `CreateCobroUseCase` mediante `IContratoRepository`. | Conforme |

**Respuesta del autor (ajuste o justificación):**
- **Relaciones entre agregados:** La relación técnica con `ContratoModel` y `CobroMensualModel` se define exclusivamente en la capa de persistencia (`infrastructure/persistence/models`) mediante decoradores de Sequelize (`@ForeignKey`, `@BelongsTo`, `@HasMany`). La entidad de dominio `CobroMensual` solo maneja `referenciaId: number`, manteniéndose libre de acoplamientos técnicos con el ORM.
- **Validación de reglas de negocio:** La verificación de existencia y estado del contrato (`contrato.estado === 'ACTIVO'`) la realiza el caso de uso `CreateCobroUseCase` a través del repositorio desacoplado `IContratoRepository`, respondiendo con HTTP `404` si no existe o `400` si está inactivo, antes de delegar la persistencia al repositorio.
- **Transición de estado del cobro:** Al registrarse un pago aprobado mediante `CreatePagoUseCase`, se ejecuta el método de dominio `cobro.aplicarPago(monto)`, garantizando que la entidad de negocio sea la dueña de la transición de estado hacia `PAGADO`.

---

## 6. Gate — decide **Hecho** (solo el revisor)

**Estado:** aprobado  
**Conclusión:** Se verifica el cumplimiento riguroso de todos los criterios de aceptación (AC-1 a AC-5). El bounded context `receivables` queda acoplado con éxito a Arrendo360, permitiendo la generación de cuentas de cobro mensual vinculadas a contratos vigentes y la recepción y aplicación de pagos.  
**Trazabilidad final:** `feat(iss-05): feature receivables CA` · `Refs #5`
