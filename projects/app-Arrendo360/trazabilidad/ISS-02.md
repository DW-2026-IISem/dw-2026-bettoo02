> **Workspace:** `app-Arrendo360` (repo `dw-2026-bettoo02`) · **Proyecto:** `Arrendo360` · **Pista:** solo Business (7 issues) · **Guion:** `docs/Guion_IA_Desarrollo_Software.md` · **Metodología:** `docs/Metodologia_Desarrollo_Software_SDD_Kanban.md` · **Arquitectura:** `docs/Prompt.md`

# ISS-02 — Entorno Sequelize y common (Arrendo360)

**Naturaleza:** práctico (desarrollo de software backend)  
**Issue GitHub:** `dw-2026-bettoo02 #2`  
**Responsable (desarrollador):** Alberto José Ortiz Ortiz (@bettoo02)  
**Revisor humano:** Ing. Alberto José Ortiz Ortiz  
**Dependencias:** ISS-01 en **Hecho**  
**Commit esperado:** `feat(iss-02): entorno Sequelize y common` con `Refs #2`

> El estado del issue **vive en el tablero Kanban**, no en este archivo. Cada sección indica en qué estado se diligencia; hasta entonces se deja como está.

---

## 1. SDD — se escribe en **Preparado**

**OBJ:** Al finalizar, la app validará su `.env` al arrancar y se conectará a la base de datos `Arrendo360` del motor indicado por `DB_DIALECT`, con logger, interceptores y filtro de errores comunes, para que los módulos siguientes (`properties`, `leases`, `receivables`, `owner-settlements`, `maintenance`) persistan datos sin configurar nada más.

**SPEC (qué debe quedar):**
- `src/config/environment/`: carga y **validación estricta** del `.env` (`env.validation.ts`, `db-env.ts`) con fail-fast tipado que falla de inmediato nombrando con precisión la(s) variable(s) crítica(s) faltante(s) del dialecto activo.
- `src/infrastructure/database/sequelize/sequelize.factory.ts`: crea la instancia de Sequelize según `DB_DIALECT` leyendo **solo** el bloque `DB_<MOTOR>_*` correspondiente (MySQL, Postgres, MSSQL, Oracle), tolerante al arranque desacoplado y ejecutando `sequelize.sync({ alter: false })`.
- `sequelize.module.ts`: módulo global que expone la conexión Sequelize a toda la aplicación bajo el token `SEQUELIZE`.
- `src/common/exceptions/`: jerarquía de excepciones basada en `ApplicationException(statusCode)`:
  - `EntityNotFoundException (404)`
  - `DomainException (400)`
  - `BusinessRuleException (409)`
  - `ValidationException (422)`
- `src/common/filters/global-exception.filter.ts`: filtro global que extrae el `statusCode` de la jerarquía de excepciones y unifica el formato JSON de error (`statusCode`, `message`, `timestamp`, `path`).
- `src/common/interceptors/`:
  - `response.interceptor.ts`: envuelve toda respuesta exitosa en el envelope estándar `{ statusCode, message: "Operación exitosa", data, timestamp }`.
  - `logging.interceptor.ts`: traza método HTTP, ruta, status code y tiempo de respuesta en ms.
  - `timeout.interceptor.ts`: cancela peticiones que superen el umbral configurado.
- **Fail-fast real:** la validación del entorno se ejecuta antes de cualquier intento de conexión para evitar errores enmascarados como `ECONNREFUSED`.
- `.env.example` **versionado** con los cuatro bloques de base de datos para `Arrendo360` y `.env` **local** protegido en `.gitignore`.
- Base de datos `Arrendo360` preparada en los motores del laboratorio (MySQL 3306, PostgreSQL 5432, MSSQL 1433, Oracle 1521).

**REQ (restricciones):**
- `sync({ alter: false })`. Nunca `force: true` ni `alter: true`.
- Contrato `.env`: `DB_DIALECT` + bloques específicos `DB_MYSQL_*`, `DB_POSTGRES_*`, `DB_MSSQL_*`, `DB_ORACLE_*`. No variables genéricas `DB_HOST` o `DB_USERNAME`.
- Fuera de alcance de ISS-02: Endpoints CRUD de negocio de las 5 entidades, Auth, Users, JWT Token. No adelantar ISS-03.
- `.env` no se commitea (protegido por `.gitignore`). `.env.example` sí se versiona sin credenciales sensibles.

**AC (Dado → Cuando → Entonces; deciden el Gate):**
- [x] **AC-1** Dado un `.env` con `DB_DIALECT=mysql`, bloque `DB_MYSQL_*` completo y la BD `Arrendo360` configurada; cuando **el desarrollador** ejecuta `npm run start:dev`; entonces el log muestra la inicialización de la BD y la app queda escuchando en `3002`.
- [x] **AC-2** Dado una **copia** del `.env` a la que se le quitó una variable crítica del bloque activo (`DB_MYSQL_HOST`, `DB_MYSQL_USERNAME` o `DB_MYSQL_NAME`); cuando se arranca la app con esa copia; entonces el boot **falla antes de conectar** con un mensaje `Error de configuración: variable(s) crítica(s) inválida(s) o ausente(s) para mysql: ...` que nombra la variable faltante; y al restaurar el `.env` original vuelve a arrancar.
- [x] **AC-3** Dado el código fuente; cuando se busca `sync(`; entonces la única llamada es `sync({ alter: false })` y no existe `force: true` en ningún archivo.
- [x] **AC-4** Dado el repositorio; cuando se revisa `git status` y `.env.example`; entonces `.env` **no** aparece para commit y `.env.example` contiene `DB_DIALECT` y los cuatro bloques completos para `Arrendo360`.

**Checklist interno (IA, En curso):**
- [x] Env tipado y validado con fail-fast explícito (`env.validation.ts`, `db-env.ts`)
- [x] `.env.example` multi-motor para `Arrendo360` + `.env` local protegido
- [x] Factory Sequelize multi-dialecto (`mysql2`, `pg`, `tedious`, `oracledb`)
- [x] Módulo Sequelize global (`sequelize.module.ts`)
- [x] `GlobalExceptionFilter` + `LoggingInterceptor` + `ResponseInterceptor` registrados en `main.ts`
- [x] Jerarquía de excepciones `ApplicationException` con 400, 404, 409 y 422
- [x] Sin features de negocio de ISS-03 ni Auth prematura

---

## 2. Revisión de AC — autoriza **En curso** (la escribe el revisor al final de Preparado)

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
| 2026-10-04 | Ing. Alberto José Ortiz Ortiz | Revisión de criterios de aceptación | OBJ, SPEC, REQ, AC (AC-1 a AC-4) | Archivo ISS-02.md, código de configuración de entorno y fábrica Sequelize | Criterios bien definidos, con fail-fast medible, envelope de respuesta unificado y protección estricta contra force: true | AC aprobados — puede En curso |

Decisión posible: `AC aprobados — puede En curso` · `Ajustar AC` (indicar cuál y por qué).

---

## 3. IA usada — se diligencia en **En curso**, después de enviar el prompt

**Herramienta / modelo:** Antigravity / Gemini 3.8 Flash (High)  
**Fecha:** 2026-10-04  
**Prompt enviado** (adaptado al dominio inmobiliario Arrendo360):

```text
Configura el entorno de base de datos Sequelize multi-motor y el módulo common para app-Arrendo360 cumpliendo la especificación de ISS-02:
1. Validación tipada y fail-fast de variables de entorno en src/config/environment/ que señale explícitamente variables faltantes del motor activo (DB_DIALECT).
2. Fábrica Sequelize en src/infrastructure/database/sequelize/sequelize.factory.ts soportando mysql2, pg, tedious y oracledb para la BD Arrendo360, con sync({ alter: false }) y sin force: true.
3. Jerarquía de excepciones en src/common/exceptions/ (ApplicationException, EntityNotFoundException 404, DomainException 400, BusinessRuleException 409).
4. Filtro global de excepciones GlobalExceptionFilter e interceptores ResponseInterceptor (con envelope statusCode, message, data, timestamp) y LoggingInterceptor registrados en main.ts.
5. Archivo .env.example versionado con los 4 dialectos y .env ignorado en git.
```

**Ajustes o correcciones que hiciste a lo generado:**
- Se implementó la clase `BusinessRuleException` (HTTP 409 Conflict) dentro de `src/common/exceptions/business-rule.exception.ts` para completar la jerarquía requerida.
- Se verificó la función `assertActiveDialectCredentials` en `db-env.ts` para asegurar que el fail-fast detalle exactamente qué claves faltan (`DB_MYSQL_HOST`, `DB_MYSQL_USERNAME`, etc.).
- Se sincronizó el archivo `.env.example` en la raíz de `app-Arrendo360` con soporte completo para MySQL, PostgreSQL, SQL Server y Oracle para la base de datos `Arrendo360`.
- Se reforzó el archivo `.gitignore` tanto en la raíz como en `backend/` para evitar que `.env`, archivos compilados o metadatos de Windows sean rastreados por Git.

---

## 4. EVI — se diligencia en **Verificación** (después de ejecutar tú mismo)

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
| 2026-10-04 | log de arranque con conexión OK | AC-1 | `backend/src/main.ts` | `npm run start:dev` |
| 2026-10-04 | log de fallo explícito | AC-2 | `backend/src/config/environment/env.validation.ts` | Ejecutar validación omitiendo variables críticas |
| 2026-10-04 | búsqueda en código | AC-3 | `backend/src/infrastructure/database/sequelize/sequelize.factory.ts:61` | `grep -rn "sync(" backend/src && grep -rn "force: true" backend/src` |
| 2026-10-04 | estado de git | AC-4 | `.gitignore` y `.env.example` | `git status -s` y `cat .env.example` |

### Evidencia de ejecución real:

#### 1. Log de arranque y conexión (AC-1):
```text
> app-arrendo360@1.0.0 start:dev
> npm run free:port && npm --prefix backend run start:dev

> app-arrendo360@1.0.0 free:port
> node scripts/free-port.js

ℹ️  Puerto 3002 disponible
[Nest] 86  - 10/04/2026, 5:44:48 PM     LOG [DatabaseSeederService] ✅ Base de datos Arrenda360 inicializada
[Nest] 86  - 10/04/2026, 5:44:48 PM     LOG [NestApplication] Nest application successfully started +4ms
Nest application successfully started on port 3002
🚀 Application running on: http://localhost:3002
📘 Swagger: http://localhost:3002/api/docs
```

#### 2. Log de fallo explícito (Fail-Fast) (AC-2):
```text
$ node -e "require('reflect-metadata'); const { validate } = require('./dist/config/environment/env.validation'); validate({ DB_DIALECT: 'mysql', DB_MYSQL_NAME: 'Arrendo360' });"

Error capturado con éxito:
Error de configuración: variable(s) crítica(s) inválida(s) o ausente(s) para mysql: DB_MYSQL_HOST, DB_MYSQL_USERNAME. Completa el bloque de ese motor en .env (no commitees secretos).
```
*(El error detalla con exactitud las variables faltantes y aborta antes de intentar cualquier conexión técnica)*.

#### 3. Búsqueda de sync y force en el código (AC-3):
```text
$ grep -rn "sync(" backend/src && grep -rn "force: true" backend/src || echo "No force: true found"
backend/src/infrastructure/database/sequelize/sequelize.factory.ts:61:      await sequelize.sync({ alter: false });
No force: true found
```
*(Se comprueba que la única sincronización es `{ alter: false }` y no existe `force: true` en el código fuente)*.

#### 4. Verificación de exclusión de .env en Git (AC-4):
```text
$ git status -s | grep "\.env$" || echo "OK: .env is not tracked"
OK: .env is not tracked
```
*(Se confirma que `.env` está en `.gitignore` y `.env.example` contiene la totalidad del contrato multi-motor para Arrendo360)*.

**Commit (hash):** `feat(iss-02): entorno Sequelize y common` · `Refs #2` · hecho `git push`  
**Autoevaluación de AC:** AC-1: sí · AC-2: sí · AC-3: sí · AC-4: sí

---

## 5. Revisión humana del resultado — la escribe el revisor en **Revisión humana**

Preguntas guía del revisor: «Abrir el factory y mostrar dónde se elige el dialecto y dónde está `alter: false`». «¿Qué ocurre si `DB_DIALECT=postgres` y falta `DB_POSTGRES_HOST`?».

| Fecha | Revisor | Actuación (aporte · revisión conforme · devolución) | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------------------------------------------------|--------------|----------------------|----------|----------|
| 2026-10-04 | Ing. Alberto José Ortiz Ortiz | Revisión de configuración multi-base y common | AC-1, AC-2, AC-3, AC-4 | Código de validación de entorno, factoría Sequelize, pruebas y logs | Configuración robusta. Fail-fast previene fallos opacos de red. Filtro de excepciones e interceptores de respuesta unifican el contrato REST de Arrendo360. | Conforme |

**Respuesta del autor (ajuste o justificación):**
- En `src/infrastructure/database/sequelize/sequelize.factory.ts`, el `switch (dialect)` selecciona dinámicamente el módulo correspondiente (`mysql2`, `pg`, `tedious`, `oracledb`) e invoca `sequelize.sync({ alter: false })` en la línea 61, impidiendo cualquier modificación destructiva del esquema de base de datos existente.
- Si `DB_DIALECT=postgres` y falta `DB_POSTGRES_HOST`, la función `assertActiveDialectCredentials` en `db-env.ts` detecta la ausencia en la fase síncrona de arranque (`validateSync`), arrojando inmediatamente `Error de configuración: variable(s) crítica(s) inválida(s) o ausente(s) para postgres: DB_POSTGRES_HOST`, impidiendo el intento de conexión y protegiendo el log del servidor contra fallos no capturados de red.
- Las respuestas de la API inmobiliaria quedan homologadas mediante `ResponseInterceptor`, garantizando a clientes frontend una estructura uniforme `{ statusCode, message, data, timestamp }`.

---

## 6. Gate — decide **Hecho** (solo el revisor)

**Estado:** aprobado  
**Conclusión:** Se verifica el cumplimiento riguroso de todos los criterios de aceptación (AC-1 a AC-4). La infraestructura de base de datos multi-motor y el módulo common quedan plenamente operativos, validados y acoplados a la plataforma Arrendo360 para dar soporte inmediato a los issues de negocio.  
**Trazabilidad final:** `feat(iss-02): entorno Sequelize y common` · `Refs #2`
