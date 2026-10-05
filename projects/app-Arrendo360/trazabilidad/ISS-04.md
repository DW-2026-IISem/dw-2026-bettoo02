> **Workspace:** `app-Arrendo360` (repo `dw-2026-bettoo02`) · **Proyecto:** `Arrendo360` · **Pista:** solo Business (7 issues) · **Guion:** `docs/Guion_IA_Desarrollo_Software.md` · **Metodología:** `docs/Metodologia_Desarrollo_Software_SDD_Kanban.md` · **Arquitectura:** `docs/Prompt.md`

# ISS-04 — Feature Leases (Arrendatarios y Contratos) CA

**Naturaleza:** práctico (desarrollo de software backend)  
**Issue GitHub:** `dw-2026-bettoo02 #4`  
**Responsable (desarrollador):** Alberto José Ortiz Ortiz (@bettoo02)  
**Revisor humano:** Ing. Alberto José Ortiz Ortiz  
**Dependencias:** ISS-03 en **Hecho**  
**Commit esperado:** `feat(iss-04): feature leases CA` con `Refs #4`

> El estado del issue **vive en el tablero Kanban**, no en este archivo. Cada sección indica en qué estado se diligencia; hasta entonces se deja como está.  
> Este issue consolida la **gestión contractual de arrendamiento** de Arrendo360, articulando los inmuebles y propietarios del issue anterior (`properties`) con los arrendatarios para habilitar los cobros mensuales del issue siguiente (`receivables`).

---

## 1. SDD — se escribe en **Preparado**

**OBJ:** Al finalizar, cualquier consumidor HTTP podrá registrar, consultar, actualizar y gestionar contratos de arrendamiento y arrendatarios persistidos en la base de datos `Arrendo360`, con validación estricta de entrada (`class-validator`), cálculo de vigencias y cánones mensuales, sirviendo de base contractual para la generación de cobros (`receivables`) y dispersión a propietarios (`owner-settlements`).

**SPEC (qué debe quedar):**
- Feature `src/features/business/leases/` con las cuatro capas concéntricas de Clean Architecture:
  - **Dominio (`domain/`):**
    - Entidades puras `Contrato` y `Arrendatario` (TypeScript puro, sin decoradores de persistencia ni `@nestjs/*`).
    - Interfaces `IContratoRepository` y `IArrendatarioRepository` que definen contratos de persistencia, búsquedas por número de documento o contrato, y filtrado.
    - Tokens de inyección de dependencias `CONTRATO_REPOSITORY` y `ARRENDATARIO_REPOSITORY`.
  - **Aplicación (`application/`):**
    - DTOs de entrada con `class-validator`: `CreateContratoDto`, `UpdateContratoDto`, `ContratoFilterDto`, `CreateArrendatarioDto`, `UpdateArrendatarioDto`, `ArrendatarioFilterDto`.
    - DTOs de salida y Mappers: `ContratoResponseDto`, `ContratoMapper`, `ArrendatarioResponseDto`, `ArrendatarioMapper`.
    - Casos de uso segregados para Contratos: `CreateContratoUseCase`, `ListContratosUseCase`, `GetContratoUseCase`, `UpdateContratoUseCase`, `DeleteContratoUseCase`.
    - Casos de uso segregados para Arrendatarios: `CreateArrendatarioUseCase`, `ListArrendatariosUseCase`, `GetArrendatarioUseCase`, `UpdateArrendatarioUseCase`, `DeleteArrendatarioUseCase`.
  - **Infraestructura (`infrastructure/`):**
    - Modelos de persistencia Sequelize: `ContratoModel` (tabla `contratos`) y `ArrendatarioModel` (tabla `arrendatarios`), registrados en `ALL_MODELS` de `sequelize.factory.ts`.
    - Repositorios concretos `ContratoRepository` y `ArrendatarioRepository` implementando las interfaces del dominio.
  - **Presentación (`presentation/`):**
    - Controladores REST: `ContratosController` (`/api/contratos`) y `ArrendatariosController` (`/api/arrendatarios`).
    - Métodos expuestos: `POST /api/contratos`, `GET /api/contratos`, `GET /api/contratos/:id`, `PATCH /api/contratos/:id`, `DELETE /api/contratos/:id` (y análogos para `/api/arrendatarios`).
    - Decoradores OpenAPI Swagger (`@ApiTags`, `@ApiOperation`, `@ApiCreatedResponse`, `@ApiOkResponse`).
    - Control de acceso por roles `@UseGuards(RolesGuard)` y `@Roles(Role.ADMIN, Role.ASESOR)`.
- `LeasesModule` registrado y exportado en `BusinessModule` y este en `AppModule`.

**REQ (restricciones):**
- Las entidades de dominio `Contrato` y `Arrendatario` **no** extienden `Model` de Sequelize ni importan `@nestjs/*`.
- Códigos HTTP estrictos: `201` para creación, `200` para consultas/actualizaciones, `204` para borrado, `400` para validación fallida, `404` para no encontrado y `409` para número de contrato o documento duplicado.
- Sin adelantar `receivables` (ISS-05).

**AC (Dado → Cuando → Entonces; deciden el Gate):**
- [x] **AC-1** Dado la app arrancada; cuando se consulta `GET /api/contratos`; entonces responde `200` con la lista paginada en el envelope `data.items` y metadatos en `data.meta`.
- [x] **AC-2** Dado un payload válido de contrato (`inmuebleId`, `arrendatarioId`, `numero`, `fechaInicio`, `fechaFin`, `valor`); cuando `POST /api/contratos` con rol autorizado (`ADMIN`/`ASESOR`); entonces responde `201` con el contrato creado en `data` (con `id`) y persiste en la tabla `contratos`.
- [x] **AC-3** Dado un payload sin campos requeridos o con formato incorrecto; cuando `POST /api/contratos`; entonces responde `400` con los detalles de validación y el conteo de filas no cambia.
- [x] **AC-4** Dado un `numero` de contrato ya registrado; cuando `POST /api/contratos` con ese mismo número; entonces responde `409` (`Ya existe un contrato con el número ...`) y no duplica la fila.
- [x] **AC-5** Dado `contrato.entity.ts` y `arrendatario.entity.ts`; cuando se inspeccionan; entonces son clases TypeScript puras: sin decoradores de Sequelize, sin `extends Model`, sin imports de NestJS.

**Checklist interno (IA, En curso):**
- [x] Entidades e interfaces de repositorio en `domain/`
- [x] DTOs de validación con class-validator, mappers y use-cases en `application/`
- [x] Modelos Sequelize (`contratos`, `arrendatarios`), repositorios concretos y registro en `ALL_MODELS`
- [x] Controladores con Swagger y `RolesGuard` en `presentation/`
- [x] Módulo registrado y exportado en `BusinessModule`

---

## 2. Revisión de AC — autoriza **En curso** (la escribe el revisor al final de Preparado)

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
| 2026-10-04 | Ing. Alberto José Ortiz Ortiz | Revisión de criterios de aceptación | OBJ, SPEC, REQ, AC (AC-1 a AC-5) | Archivo ISS-04.md y estructura modular de Leases | Criterios exhaustivos, con validación de contratos, relaciones entre entidades y pureza de dominio | AC aprobados — puede En curso |

Decisión posible: `AC aprobados — puede En curso` · `Ajustar AC` (indicar cuál y por qué).

---

## 3. IA usada — se diligencia en **En curso**, después de enviar el prompt

**Herramienta / modelo:** Antigravity / Gemini 3.8 Flash (High)  
**Fecha:** 2026-10-04  
**Prompt enviado** (adaptado al bounded context de Leases en Arrendo360):

```text
Implementa el bounded context de Leases (Arrendatarios y Contratos de Arrendamiento) en src/features/business/leases/ bajo Clean Architecture:
1. Dominio con entidades puras Contrato y Arrendatario (POJOs TypeScript) e interfaces IContratoRepository / IArrendatarioRepository.
2. Aplicación con DTOs validados con class-validator, mappers y Use Cases segregados (Create, List, Get, Update, Delete) inyectando interfaces de repositorio mediante tokens.
3. Infraestructura con modelos Sequelize ContratoModel y ArrendatarioModel en ALL_MODELS, y repositorios de persistencia.
4. Presentación con ContratosController y ArrendatariosController con decoradores OpenAPI Swagger y control de acceso con RolesGuard.
5. Exportación e integración limpia en BusinessModule y AppModule.
```

**Ajustes o correcciones que hiciste a lo generado:**
- Se implementó la inyección por tokens (`CONTRATO_REPOSITORY` y `ARRENDATARIO_REPOSITORY`) en los casos de uso para garantizar el Principio de Inversión de Dependencias (DIP).
- Se garantizó compatibilidad y sincronización entre identificadores (`clienteId` y `arrendatarioId`) mediante getters/setters en la entidad de dominio.
- Se configuró la paginación unificada con metadatos (`page`, `limit`, `total`, `totalPages`) en `ListContratosUseCase`.
- Se integró la validación RBAC con `@Roles(Role.ADMIN, Role.ASESOR)` en los endpoints de mutación.

---

## 4. EVI — se diligencia en **Verificación** (después de ejecutar tú mismo)

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
| 2026-10-04 | respuesta HTTP 200 listado | AC-1 | `GET http://localhost:3002/api/contratos` | `curl -i http://localhost:3002/api/contratos` |
| 2026-10-04 | respuesta HTTP 201 creación | AC-2 | `POST http://localhost:3002/api/contratos` | `curl -i -X POST http://localhost:3002/api/contratos -H 'Content-Type: application/json' -H 'x-user-role: ADMIN' -d '{"inmuebleId":1,"arrendatarioId":1,"numero":"CTR-2026-001","fechaInicio":"2026-01-01","fechaFin":"2026-12-31","valor":1500000}'` |
| 2026-10-04 | respuesta HTTP 400 validación | AC-3 | `POST http://localhost:3002/api/contratos` | `curl -i -X POST http://localhost:3002/api/contratos -H 'Content-Type: application/json' -H 'x-user-role: ADMIN' -d '{"valor":"invalido"}'` |
| 2026-10-04 | respuesta HTTP 409 duplicado | AC-4 | `POST http://localhost:3002/api/contratos` | Repetir el comando POST del AC-2 con el mismo número de contrato |
| 2026-10-04 | archivo fuente puro | AC-5 | `backend/src/features/business/leases/domain/entities/contrato.entity.ts` | `grep -rn "sequelize\|@nestjs\|extends Model" backend/src/features/business/leases/domain/entities/` → sin coincidencias |

### Evidencia de ejecución real:

#### 1. Verificación de entidad de dominio pura (AC-5):
```text
$ grep -rn "sequelize\|@nestjs\|extends Model" backend/src/features/business/leases/domain/entities/ || echo "Entidades 100% puras"
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
  "timestamp": "2026-10-04T22:50:00.000Z"
}
```

#### 3. Suite de Pruebas Automatizadas (Vitest):
```text
> backend@0.0.1 test
> vitest run

 ✓ test/rbac.guard.spec.ts (5 tests) 4ms
 ✓ src/app.controller.spec.ts (2 tests) 122ms

 Test Files  2 passed (2)
      Tests  7 passed (7)
   Duration  592ms
```

**Commit (hash):** `feat(iss-04): feature leases CA` · `Refs #4` · hecho `git push`  
**Autoevaluación de AC:** AC-1: sí · AC-2: sí · AC-3: sí · AC-4: sí · AC-5: sí

---

## 5. Revisión humana del resultado — la escribe el revisor en **Revisión humana**

Preguntas guía del revisor: «Señalar y explicar entidad, interfaz, modelo Sequelize, caso de uso y controlador en Leases». «¿Dónde se valida la regla de unicidad del número de contrato: en el dominio, en el use-case o en la base de datos?».

| Fecha | Revisor | Actuación (aporte · revisión conforme · devolución) | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------------------------------------------------|--------------|----------------------|----------|----------|
| 2026-10-04 | Ing. Alberto José Ortiz Ortiz | Revisión de arquitectura limpia y reglas de negocio en Leases | AC-1 a AC-5 | Código de dominio, casos de uso, modelos y controladores | Implementación conforme a Clean Architecture. La unicidad se comprueba preventivamente en el Use Case mediante repositorio y se asegura en la BD con restricción unique. | Conforme |

**Respuesta del autor (ajuste o justificación):**
- **Regla de unicidad de contrato:** Se valida en dos niveles: en el caso de uso `CreateContratoUseCase` mediante `findByNumero()` (arrojando `ConflictException` HTTP 409 descriptivo antes de persistir), y a nivel de base de datos en `ContratoModel` mediante el índice único (`unique: true`), garantizando integridad referencial ante concurrencia.
- **Inversión de Dependencias (DIP):** Los casos de uso inyectan `IContratoRepository` e `IArrendatarioRepository` desacoplándose completamente de la tecnología del ORM.

---

## 6. Gate — decide **Hecho** (solo el revisor)

**Estado:** aprobado  
**Conclusión:** Se verifica el cumplimiento riguroso de todos los criterios de aceptación (AC-1 a AC-5). El bounded context `leases` queda acoplado a Arrendo360, permitiendo la gestión integral de arrendatarios y contratos de arrendamiento.  
**Trazabilidad final:** `feat(iss-04): feature leases CA` · `Refs #4`
 