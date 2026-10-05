> **Workspace:** `app-Arrendo360` (repo `dw-2026-bettoo02`) · **Proyecto:** `Arrendo360` · **Pista:** solo Business (7 issues) · **Guion:** `docs/Guion_IA_Desarrollo_Software.md` · **Metodología:** `docs/Metodologia_Desarrollo_Software_SDD_Kanban.md` · **Arquitectura:** `docs/Prompt.md`

# ISS-07 — Integración business y demo (Arrendo360)

**Naturaleza:** práctico (desarrollo de software backend)  
**Issue GitHub:** `dw-2026-bettoo02 #7`  
**Responsable (desarrollador):** Alberto José Ortiz Ortiz (@bettoo02)  
**Revisor humano:** Ing. Alberto José Ortiz Ortiz  
**Dependencias:** ISS-01 … ISS-06 en **Hecho** (precondición verificada en el tablero Kanban)  
**Commit esperado:** `feat(iss-07): integracion business y demo` con `Refs #7`

> El estado del issue **vive en el tablero Kanban**, no en este archivo. Cada sección indica en qué estado se diligencia; hasta entonces se deja como está.  
> **El Gate de ISS-07 = proyecto Arrendo360 terminado (7 tarjetas en Hecho).**

---

## 1. SDD — se escribe en **Preparado**

**OBJ:** Al finalizar, el equipo podrá levantar el backend desde cero (BD `Arrendo360`) y demostrar el recorrido completo del negocio inmobiliario: **Propietario → Inmueble → Arrendatario → Contrato → Cobro Mensual → Pago → Liquidación a Propietario** con datos sembrados y coherentes, para entregar un producto reproducible y listo para producción sin dependencias de Auth.

**SPEC (qué debe quedar):**
- `src/infrastructure/database/seeders/database-seeder.service.ts` con un **orquestador** que ejecuta los seeders Business en orden de dependencias: `propietarios → inmuebles → arrendatarios → contratos` (Cobros, Pagos y Distribuciones se operan en la demo interactiva). Idempotente mediante `findOrCreate`.
- `README.md` del proyecto **reemplazando el boilerplate de Nest**: qué es Arrendo360, requisitos, cómo crear y configurar la BD en `.env`, cómo arrancar, endpoints disponibles y **libreto de la demo E2E**.
- Swagger accesible en `/api/docs` con los 5 bounded contexts de negocio expuestos (`properties`, `leases`, `receivables`, `owner-settlements`, `maintenance`).
- Confirmación explícita de ausencia de Auth: no existe `features/auth`, ni `config/jwt`, ni dependencias `@nestjs/jwt`, `passport`, `bcrypt` en `package.json`.

**Libreto de la demo (lo ejecuta el desarrollador en Verificación y lo repite ante el revisor):**
1. BD `Arrendo360` preparada. `npm run start:dev` → tablas creadas con `alter: false` + seeders idempotentes ejecutados.
2. `POST /api/propietarios` → crea propietario `P`.
3. `POST /api/inmuebles` vinculado a `P` → crea inmueble `I`.
4. `POST /api/arrendatarios` → crea arrendatario `A`.
5. `POST /api/contratos` vinculando `I` y `A` con canon mensual de $1.500.000 y estado `ACTIVO` → crea contrato `C`.
6. `POST /api/cobros` con `referenciaId = C` y `valor = 1500000` → crea cobro mensual `Cob` en estado `PENDIENTE`.
7. `POST /api/pagos` con `referenciaId = Cob` y `monto = 1500000` → registra pago aprobado `Pag`; el cobro `Cob` transiciona a `PAGADO`.
8. `POST /api/distribuciones-pago` con `pagoId = Pag`, `propietarioId = P` y `monto = 1350000` (descontada comisión) → `201 Created`.
9. `POST /api/distribuciones-pago` con `monto = 1800000` (superando el pago recaudado) → responde `409 Conflict`, impidiendo la dispersión excedente.

**REQ (restricciones):**
- Seeders solo Business. Sin Auth nuevo ni «demo de login».
- No `force: true` ni `alter: true`.
- Control de acceso desacoplado con `RolesGuard` y encabezado `x-user-role`.

**AC (Dado → Cuando → Entonces; deciden el Gate):**
- [x] **AC-1** Dado la BD `Arrendo360` vacía; cuando `npm run start:dev`; entonces se crean las tablas de los 5 bounded contexts y los seeders dejan datos sembrados (`propietarios`, `inmuebles`, `arrendatarios`, `contratos`); y al arrancar una **segunda vez** los conteos son idénticos (idempotencia garantizada por `findOrCreate`).
- [x] **AC-2** Dado la app arriba; cuando se ejecuta el libreto de la demo (pasos 2–9); entonces cada respuesta coincide con lo esperado (`201`, `201`, `201`, `201`, `201`, `201`, `201`, `409`).
- [x] **AC-3** Dado el repositorio; cuando se inspecciona; entonces no existe `src/features/auth/` ni `src/config/jwt/`, y `package.json` no lista `@nestjs/jwt`, `passport`, `passport-jwt` ni `bcrypt`.
- [x] **AC-4** Dado `README.md`; cuando lo lee alguien ajeno al proyecto; entonces puede crear la BD, configurar `.env`, arrancar y correr la demo sin preguntar nada.
- [x] **AC-5** Dado la app arriba; cuando se abre `http://localhost:3002/api/docs`; entonces Swagger muestra los 5 bounded contexts de negocio: `properties`, `leases`, `receivables`, `owner-settlements`, `maintenance`.

**Checklist interno (IA, En curso):**
- [x] Orquestador de seeders con orden de dependencias e idempotencia (`DatabaseSeederService`)
- [x] `README.md` reescrito con arquitectura, endpoints y libreto E2E
- [x] Swagger en `/api/docs` con título y descripción oficiales de Arrendo360
- [x] Verificación de ausencia absoluta de módulos o paquetes de Auth
- [x] Suite de pruebas automatizadas pasando al 100%

---

## 2. Revisión de AC — autoriza **En curso** (la escribe el revisor al final de Preparado)

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
| 2026-10-04 | Ing. Alberto José Ortiz Ortiz | Revisión de criterios de aceptación finales | OBJ, SPEC, REQ, AC (AC-1 a AC-5) | Archivo ISS-07.md y estado de los 6 issues previos en Hecho | Criterios completos y verificables. El libreto E2E cubre el ciclo de vida inmobiliario completo. Ausencia de Auth confirmada. | AC aprobados — puede En curso |

Decisión posible: `AC aprobados — puede En curso` · `Ajustar AC` (indicar cuál y por qué).

---

## 3. IA usada — se diligencia en **En curso**, después de enviar el prompt

**Herramienta / modelo:** Antigravity / Gemini 3.8 Flash (High)  
**Fecha:** 2026-10-04  
**Prompt enviado** (adaptado al bounded context de integración y demo en Arrendo360):

```text
Finaliza la integración global de Arrendo360 cumpliendo la especificación de ISS-07:
1. Orquestador de seeders en src/infrastructure/database/seeders/database-seeder.service.ts con findOrCreate en orden de dependencias: propietarios -> inmuebles -> arrendatarios -> contratos.
2. README.md profesional reemplazando el boilerplate de Nest, con descripción de los 5 bounded contexts, requisitos, configuración multi-motor, comandos de ejecución y libreto de demo E2E.
3. Configuración de Swagger en src/config/swagger/ con título y descripción oficial de Arrendo360 sobre /api/docs.
4. Purga completa de dependencias de Auth no utilizadas en package.json (@nestjs/jwt, passport, bcrypt) y verificación de ausencia de carpetas auth.
5. Ejecución y validación de la suite completa de pruebas unitarias.
```

**Ajustes o correcciones que hiciste a lo generado:**
- Se configuró el orquestador de datos semilla en `DatabaseSeederService` utilizando `findOrCreate` sobre claves únicas (`numeroDocumento`, `codigo`, `numero`), asegurando idempotencia total ante múltiples arranques sucesivos.
- Se reescribió `README.md` (tanto en la raíz como en `backend/`) documentando el libreto paso a paso de la demo E2E y el mapa completo de endpoints.
- Se depuró `package.json` eliminando paquetes de autenticación innecesarios para el track "Solo Business".
- Se sincronizó la documentación técnica de Swagger bajo `/api/docs`.

---

## 4. EVI — se diligencia en **Verificación** (después de ejecutar tú mismo)

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
| 2026-10-04 | log de arranque con seeders | AC-1 | `backend/src/infrastructure/database/seeders/database-seeder.service.ts` | `npm run start:dev` (el log muestra `✅ Base de datos Arrendo360 inicializada con datos semilla idempotentes`) |
| 2026-10-04 | secuencia de respuestas HTTP | AC-2 | Rutas de la demo | Ejecución de los 8 pasos del libreto de la demo |
| 2026-10-04 | árbol y package.json sin Auth | AC-3 | `backend/package.json` | `grep -rn "@nestjs/jwt\|passport\|bcrypt" backend/package.json` → sin coincidencias |
| 2026-10-04 | README con libreto E2E | AC-4 | `projects/app-Arrendo360/README.md` | Lectura y seguimiento del documento |
| 2026-10-04 | Swagger UI operativo | AC-5 | `http://localhost:3002/api/docs` | `curl -i http://localhost:3002/api/docs` |

### Evidencia de ejecución real:

#### 1. Verificación de ausencia total de dependencias y módulos Auth (AC-3):
```text
$ grep -rn "@nestjs/jwt\|passport\|bcrypt" backend/package.json || echo "0 dependencias de Auth"
0 dependencias de Auth

$ ls backend/src/features/
business

$ ls backend/src/config/
app  database  environment  logger  swagger
```
*(No existe `src/features/auth/` ni `src/config/jwt/`)*.

#### 2. Log de arranque exitoso y Swagger (AC-1, AC-5):
```text
[Nest] 82  - 10/04/2026, 8:20:42 PM     LOG [DatabaseSeederService] ✅ Base de datos Arrendo360 inicializada con datos semilla idempotentes
[Nest] 82  - 10/04/2026, 8:20:42 PM     LOG [NestApplication] Nest application successfully started +1ms
Nest application successfully started on port 3002
🚀 Application running on: http://localhost:3002
📘 Swagger: http://localhost:3002/api/docs
```

#### 3. Suite de Pruebas Automatizadas (Vitest):
```text
> backend@0.0.1 test
> vitest run

 ✓ test/distribucion-pago.entity.spec.ts (5 tests) 4ms
 ✓ test/rbac.guard.spec.ts (5 tests) 4ms
 ✓ src/app.controller.spec.ts (2 tests) 116ms

 Test Files  3 passed (3)
      Tests  12 passed (12)
   Duration  592ms
```

#### 4. Análisis estático de calidad (Oxlint):
```text
> backend@0.0.1 lint
> oxlint --type-aware src/ test/

Found 0 warnings and 0 errors.
Finished in 312ms on 211 files with 111 rules using 12 threads.
```

**Commit (hash):** `feat(iss-07): integracion business y demo` · `Refs #7` · hecho `git push`  
**Autoevaluación de AC:** AC-1: sí · AC-2: sí · AC-3: sí · AC-4: sí · AC-5: sí

---

## 5. Revisión humana del resultado — la escribe el revisor en **Revisión humana**

El revisor ejecuta el libreto de la demo con el desarrollador y sigue el `README.md` como si fuera un tercero.  
Pregunta guía: «Si mañana hay que agregar Auth, ¿qué carpetas se tocan y cuáles no?».

| Fecha | Revisor | Actuación (aporte · revisión conforme · devolución) | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------------------------------------------------|--------------|----------------------|----------|----------|
| 2026-10-04 | Ing. Alberto José Ortiz Ortiz | Revisión final de integración, demo y arquitectura | AC-1 a AC-5 | Código fuente completo, README.md, Swagger UI y suite de pruebas | Proyecto completo, modular y reproducible. Clean Architecture garantiza desacoplamiento absoluto de negocio. El libreto de la demo es claro y exhaustivo. | Conforme |

**Respuesta del autor (ajuste o justificación):**
- **Aislamiento de futuras capacidades de Auth:** Si mañana se requiere incorporar autenticación y autorización avanzada (JWT, OAuth2):
  - **Carpetas que se agregarían:** Se crearía `src/features/auth/` (con sus capas de dominio, aplicación e infraestructura de usuarios/credenciales) y `src/config/auth/` o `src/common/guards/jwt-auth.guard.ts`.
  - **Carpetas que NO se tocan:** Absolutamente ningún archivo de las capas de dominio y aplicación de los 5 bounded contexts de negocio (`properties`, `leases`, `receivables`, `owner-settlements`, `maintenance`). Las entidades de negocio, DTOs y casos de uso permanecen inalterados, preservando el Principio Abierto/Cerrado (OCP). En los controladores de presentación únicamente se intercambiaría el decorador de guard en caso de requerir verificación de token HTTP.

---

## 6. Gate — decide **Hecho** (solo el revisor)

**Estado:** aprobado  
**Conclusión:** Se verifica el cumplimiento riguroso de todos los criterios de aceptación (AC-1 a AC-5). La plataforma **Arrendo360** cuenta con los 5 bounded contexts de negocio completamente implementados bajo Clean Architecture, datos semilla idempotentes, documentación Swagger, libreto de demo E2E y pruebas automatizadas. **Con este Gate el proyecto simple queda terminado: 7 tarjetas en Hecho.**  
**Trazabilidad final:** `feat(iss-07): integracion business y demo` · `Refs #7`
