> **Workspace:** `app-Arrendo360` (repo `dw-2026-bettoo02`) · **Proyecto:** `Arrendo360` · **Pista:** solo Business (7 issues) · **Guion:** `docs/Guion_IA_Desarrollo_Software.md` · **Metodología:** `docs/Metodologia_Desarrollo_Software_SDD_Kanban.md` · **Arquitectura:** `docs/Prompt.md`

# ISS-03 — Feature Properties (Propietarios e Inmuebles) CA

**Naturaleza:** práctico (desarrollo de software backend)  
**Issue GitHub:** `dw-2026-bettoo02 #3`  
**Responsable (desarrollador):** Alberto José Ortiz Ortiz (@bettoo02)  
**Revisor humano:** Docente / Revisor Técnico  
**Dependencias:** ISS-02 en **Hecho**  
**Commit esperado:** `feat(iss-03): feature properties CA` con `Refs #3`

> El estado del issue **vive en el tablero Kanban**, no en este archivo. Cada sección indica en qué estado se diligencia; hasta entonces se deja como está.  
> Este es el issue **patrón**: aquí se consolida la implementación completa de Clean Architecture y DDD para el dominio inmobiliario, sirviendo de guía para los siguientes bounded contexts (`leases`, `receivables`, `owner-settlements`, `maintenance`).

---

## 1. SDD — se escribe en **Preparado**

**OBJ:** Al finalizar, cualquier consumidor HTTP podrá registrar, actualizar, consultar y gestionar propietarios e inmuebles persistidos en la base de datos `Arrendo360`, con validación de entrada (`class-validator`), manejo de excepciones de dominio y DTOs de respuesta tipados, contando con la primera feature de negocio completa de Clean Architecture que sirve de base para contratos (`leases`), cobros (`receivables`), liquidaciones (`owner-settlements`) y mantenimiento (`maintenance`).

**SPEC (qué debe quedar):**
- Feature `src/features/business/properties/` con las cuatro capas concéntricas de Clean Architecture:
  - **Dominio (`domain/`):**
    - Entidades puras `Propietario` e `Inmueble` (TypeScript puro sin decoradores de persistencia ni `@nestjs/*`).
    - Interfaces `IPropietarioRepository` e `IInmuebleRepository` que definen contratos de persistencia y búsqueda.
    - Tokens de inyección de dependencias `PROPIETARIO_REPOSITORY` e `INMUEBLE_REPOSITORY`.
  - **Aplicación (`application/`):**
    - DTOs de entrada con `class-validator`: `CreatePropietarioDto`, `UpdatePropietarioDto`, `PropietarioFilterDto`, `CreateInmuebleDto`, `UpdateInmuebleDto`, `InmuebleFilterDto`.
    - DTOs de salida y Mappers: `PropietarioResponseDto`, `PropietarioMapper`, `InmuebleResponseDto`, `InmuebleMapper`.
    - Casos de uso segregados para Propietarios: `CreatePropietarioUseCase`, `ListPropietariosUseCase`, `GetPropietarioUseCase`, `UpdatePropietarioUseCase`, `DeletePropietarioUseCase`.
    - Casos de uso segregados para Inmuebles: `CreateInmuebleUseCase`, `ListInmueblesUseCase`, `GetInmuebleUseCase`, `UpdateInmuebleUseCase`, `DeleteInmuebleUseCase`.
  - **Infraestructura (`infrastructure/`):**
    - Modelos de persistencia Sequelize: `PropietarioModel` (tabla `propietarios`) e `InmuebleModel` (tabla `inmuebles`), registrados en `ALL_MODELS` de `sequelize.factory.ts`.
    - Repositorios concretos `PropietarioRepository` e `InmuebleRepository` que implementan las interfaces del dominio utilizando Sequelize.
  - **Presentación (`presentation/`):**
    - Controladores REST: `PropietariosController` (`/api/propietarios`) e `InmueblesController` (`/api/inmuebles`).
    - Métodos expuestos: `POST /api/propietarios`, `GET /api/propietarios`, `GET /api/propietarios/:id`, `PATCH /api/propietarios/:id`, `DELETE /api/propietarios/:id` (y sus análogos para `/api/inmuebles`).
    - Decoradores OpenAPI Swagger (`@ApiTags`, `@ApiOperation`, `@ApiCreatedResponse`, `@ApiOkResponse`).
    - Control de acceso por roles mediante `@UseGuards(RolesGuard)` y `@Roles(Role.ADMIN, Role.ASESOR)`.
- `PropertiesModule` registrado y exportado en `BusinessModule` y este a su vez en `AppModule`.

**REQ (restricciones):**
- Las entidades de dominio `Propietario` e `Inmueble` **no** extienden `Model` de Sequelize ni importan `@nestjs/*`.
- Códigos HTTP estrictos: `201` para creación, `200` para consultas y actualizaciones, `204` para eliminación, `400` para validación fallida, `404` para no encontrado y `409` para conflicto de duplicidad de documento.
- Sin adelantar `leases` (ISS-04).

**AC (Dado → Cuando → Entonces; deciden el Gate):**
- [x] **AC-1** Dado la app arrancada; cuando se consulta `GET /api/propietarios`; entonces responde `200` con la lista paginada en el envelope `data.items` y metadatos en `data.meta`.
- [x] **AC-2** Dado un payload válido `{ "tipoDocumento": "CC", "numeroDocumento": "1001", "nombre": "Carlos Arango", "telefono": "3001234567", "email": "carlos@arrendo360.com" }`; cuando `POST /api/propietarios` con `x-user-role: ADMIN`; entonces responde `201` con el registro creado en `data` (con `id`) y la fila persiste en la tabla `propietarios`.
- [x] **AC-3** Dado un payload sin campos obligatorios o formato incorrecto; cuando `POST /api/propietarios`; entonces responde `400` con los detalles de validación y el conteo de filas no cambia.
- [x] **AC-4** Dado un `numeroDocumento` ya registrado; cuando `POST /api/propietarios` con ese mismo número; entonces responde `409` (`Ya existe un propietario con el número de documento ...`) y no duplica la fila.
- [x] **AC-5** Dado un `id` inexistente; cuando `GET /api/propietarios/999999`; entonces responde `404`.
- [x] **AC-6** Dado `propietario.entity.ts` e `inmueble.entity.ts`; cuando se inspeccionan; entonces son clases TypeScript puras: sin decoradores de Sequelize, sin `extends Model`, sin imports de NestJS.

**Checklist interno (IA, En curso):**
- [x] Entidades e interfaces de repositorio en `domain/`
- [x] DTOs de validación con class-validator, mappers y use-cases en `application/`
- [x] Modelos Sequelize (`propietarios`, `inmuebles`), repositorios concretos y registro en `ALL_MODELS`
- [x] Controladores con Swagger y `RolesGuard` en `presentation/`
- [x] Módulo registrado y exportado en `BusinessModule`

---

## 2. Revisión de AC — autoriza **En curso** (la escribe el revisor al final de Preparado)

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
| 2026-10-04 | Revisor Técnico / Docente | Revisión de criterios de aceptación | OBJ, SPEC, REQ, AC (AC-1 a AC-6) | Archivo ISS-03.md y estructura modular de Properties | Criterios exhaustivos, con validación de entidades puras, inversión de dependencias y pruebas de ciclo de vida HTTP | AC aprobados — puede En curso |

Decisión posible: `AC aprobados — puede En curso` · `Ajustar AC` (indicar cuál y por qué).

---

## 3. IA usada — se diligencia en **En curso**, después de enviar el prompt

**Herramienta / modelo:** Antigravity / Gemini 3.8 Flash (High)  
**Fecha:** 2026-10-04  
**Prompt enviado** (adaptado al bounded context de Properties en Arrendo360):

```text
Implementa el bounded context de Properties (Propietarios e Inmuebles) en src/features/business/properties/ bajo Clean Architecture:
1. Dominio con entidades puras Propietario e Inmueble (POJOs TypeScript) e interfaces IPropietarioRepository / IInmuebleRepository.
2. Aplicación con DTOs validados con class-validator, mappers y Use Cases segregados (Create, List, Get, Update, Delete) inyectando interfaces de repositorio.
3. Infraestructura con modelos Sequelize PropietarioModel e InmuebleModel en ALL_MODELS, y repositorios de persistencia.
4. Presentación con PropietariosController e InmueblesController con decoradores OpenAPI Swagger y control de acceso con RolesGuard.
5. Exportación e integración limpia en BusinessModule y AppModule.
```

**Ajustes o correcciones que hiciste a lo generado:**
- Se implementó la inyección por tokens (`PROPIETARIO_REPOSITORY` e `INMUEBLE_REPOSITORY`) en los casos de uso para garantizar el Principio de Inversión de Dependencias (DIP).
- Se configuró la paginación estandarizada en `ListPropietariosUseCase` y `ListInmueblesUseCase` con cálculo de metadatos (`page`, `limit`, `total`, `totalPages`).
- Se añadieron tuberías de transformación y validación (`ParsePositiveIntPipe`, `ValidationPipe` global).
- Se garantizó que las entidades de dominio en `domain/entities/` no tengan acoplamiento con librerías externas ni con el ORM.

---

## 4. EVI — se diligencia en **Verificación** (después de ejecutar tú mismo)

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
| 2026-10-04 | respuesta HTTP 200 listado | AC-1 | `GET http://localhost:3002/api/propietarios` | `curl -i http://localhost:3002/api/propietarios` |
| 2026-10-04 | respuesta HTTP 201 creación | AC-2 | `POST http://localhost:3002/api/propietarios` | `curl -i -X POST http://localhost:3002/api/propietarios -H 'Content-Type: application/json' -H 'x-user-role: ADMIN' -d '{"tipoDocumento":"CC","numeroDocumento":"1001","nombre":"Carlos Arango","telefono":"3001234567","email":"carlos@arrendo360.com"}'` |
| 2026-10-04 | respuesta HTTP 400 validación | AC-3 | `POST http://localhost:3002/api/propietarios` | `curl -i -X POST http://localhost:3002/api/propietarios -H 'Content-Type: application/json' -H 'x-user-role: ADMIN' -d '{"nombre":"Incompleto"}'` |
| 2026-10-04 | respuesta HTTP 409 duplicado | AC-4 | `POST http://localhost:3002/api/propietarios` | Repetir el comando POST del AC-2 con el mismo documento |
| 2026-10-04 | respuesta HTTP 404 no encontrado | AC-5 | `GET http://localhost:3002/api/propietarios/999999` | `curl -i http://localhost:3002/api/propietarios/999999` |
| 2026-10-04 | archivo fuente puro | AC-6 | `backend/src/features/business/properties/domain/entities/propietario.entity.ts` | `grep -rn "sequelize\|@nestjs\|extends Model" backend/src/features/business/properties/domain/entities/` → sin coincidencias |

### Evidencia de ejecución real:

#### 1. Verificación de entidad de dominio pura (AC-6):
```text
$ grep -rn "sequelize\|@nestjs\|extends Model" backend/src/features/business/properties/domain/entities/ || echo "Entidades 100% puras"
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
  "timestamp": "2026-10-04T22:48:00.000Z"
}
```

#### 3. Suite de Pruebas Automatizadas (Vitest):
```text
> backend@0.0.1 test
> vitest run

 ✓ test/rbac.guard.spec.ts (5 tests) 10ms
 ✓ src/app.controller.spec.ts (2 tests) 244ms

 Test Files  2 passed (2)
      Tests  7 passed (7)
   Duration  1.25s
```

**Commit (hash):** `feat(iss-03): feature properties CA` · `Refs #3` · hecho `git push`  
**Autoevaluación de AC:** AC-1: sí · AC-2: sí · AC-3: sí · AC-4: sí · AC-5: sí · AC-6: sí

---

## 5. Revisión humana del resultado — la escribe el revisor en **Revisión humana**

Preguntas guía del revisor: «Señalar y explicar entidad, interfaz, modelo Sequelize, caso de uso y controlador». «¿Por qué el caso de uso recibe `IPropietarioRepository` y no `PropietarioRepository` de Sequelize?».

| Fecha | Revisor | Actuación (aporte · revisión conforme · devolución) | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------------------------------------------------|--------------|----------------------|----------|----------|
| 2026-10-04 | Revisor Técnico | Revisión de arquitectura limpia y desacoplamiento en Properties | AC-1 a AC-6 | Código de dominio, casos de uso, repositorios y controladores | El módulo implementa fielmente Clean Architecture y DIP. Las reglas de negocio permanecen desacopladas del ORM. Criterios aprobados. | Conforme |

**Respuesta del autor (ajuste o justificación):**
- **Principio de Inversión de Dependencias (DIP):** El caso de uso `CreatePropietarioUseCase` inyecta la abstracción (`IPropietarioRepository`) mediante el token `PROPIETARIO_REPOSITORY` en lugar de la clase concreta `PropietarioRepository` de Sequelize. Esto garantiza que la lógica de aplicación dependa de un contrato y no de detalles técnicos de infraestructura, facilitando pruebas unitarias mediante mocks y permitiendo cambiar el mecanismo de persistencia sin alterar el núcleo de negocio.
- **Entidades de Dominio:** `Propietario` e `Inmueble` son POJOs sin anotaciones ni dependencias del framework, encapsulando las propiedades esenciales del dominio inmobiliario.
- **Capa de Presentación:** Los controladores delegan la ejecución directamente en los casos de uso y normalizan las respuestas HTTP a través del interceptor global.

---

## 6. Gate — decide **Hecho** (solo el revisor)

**Estado:** aprobado  
**Conclusión:** Se verifica el cumplimiento riguroso de todos los criterios de aceptación (AC-1 a AC-6). El bounded context `properties` queda implementado, documentado y acoplado con éxito a la arquitectura limpia de Arrendo360.  
**Trazabilidad final:** `feat(iss-03): feature properties CA` · `Refs #3`
