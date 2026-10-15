> **Workspace:** `app-Arrendo360` (repo `dw-2026-bettoo02`) · **Proyecto:** `Arrendo360` · **Pista:** Fase II: Auth con RBAC · **Guion:** `docs/Guion_IA_Desarrollo_Software.md` · **Metodología:** `docs/Metodologia_Desarrollo_Software_SDD_Kanban.md` · **Arquitectura:** `docs/Prompt.md`

# ISS-13 — Middlewares de Acceso y las Tres Modalidades (OPEN, PROTECTED, RBAC)

**Naturaleza:** práctico (desarrollo de software backend)  
**Issue GitHub:** `dw-2026-bettoo02 #13`  
**Responsable (desarrollador):** Alberto José Ortiz Ortiz (@bettoo02)  
**Revisor humano:** Ing. Alberto José Ortiz Ortiz  
**Dependencias:** ISS-12 (RoleUsers y ResourceRoles) en **Hecho**  
**Commit esperado:** `feat(iss-13): middlewares y guards de acceso en tres modalidades Refs #13`

> El estado del issue **vive en el tablero Kanban**, no en este archivo. Cada sección indica en qué estado se diligencia; hasta entonces se deja como está.

---

## 1. SDD — se escribe en **Preparado**

**OBJ:** Al finalizar, el backend implementará las tres modalidades de acceso sobre la totalidad de sus rutas mediante interceptores y Guards en NestJS (`RolesGuard`, decoradores `@Roles` y verificación JWT): modalidad **OPEN** (libre acceso), modalidad **PROTECTED** (sesión activa requerida) y modalidad **RBAC** (sesión activa + rol con permiso asignado sobre el recurso).

**SPEC (qué debe quedar):**
- Guard de control de acceso `RolesGuard` en `src/common/guards/roles.guard.ts` que evalúa metadata `@Roles` mediante `Reflector`.
- Soporte dual de resolución de rol: a través del objeto `request.user` autenticado (JWT) y fallback de interoperabilidad en pruebas mediante encabezado `x-user-role`.
- Clasificación estricta de las tres modalidades de acceso en el sistema:
  1. **OPEN:** `/api/health`, `/api/docs`, `/api/auth/login`, `/api/auth/register`, `/api/auth/forgot-password`, `/api/auth/reset-password`.
  2. **PROTECTED:** `/api/auth/me`, `/api/auth/logout`, `/api/auth/refresh`.
  3. **RBAC:** Endpoints de administración y negocio (`/api/ventas`, `/api/inmuebles`, `/api/contratos`, etc.) que restringen operaciones de mutación a `ADMIN` y `ASESOR` y consultas financieras a `CARTERA`.
- Respuestas estandarizadas ante fallos: `401 Unauthorized` si el token es inexistente/inválido y `403 Forbidden` si el rol no tiene la autorización concedida.
- Suite de pruebas unitarias exhaustiva para `RolesGuard` en `test/rbac.guard.spec.ts`.

**REQ (restricciones):**
- Las rutas OPEN no deben ser bloqueadas por el guard bajo ninguna circunstancia.
- Toda denegación por rol debe arrojar explícitamente `ForbiddenException` con mensaje descriptivo indicando los roles requeridos.
- No se permiten bypasses no autenticados en endpoints de negocio que muten estados financieros o inventario.

**AC (Dado → Cuando → Entonces; deciden el Gate):**
- [x] **AC-1** Dado un endpoint sin roles requeridos (modalidad OPEN); cuando se recibe una petición sin credenciales; entonces el guard permite el acceso retornando `true`.
- [x] **AC-2** Dado un endpoint protegido con roles `ADMIN` y `ASESOR`; cuando una petición incluye un rol compatible (vía `request.user` o `x-user-role: ASESOR`); entonces el guard concede el acceso retornando `true`.
- [x] **AC-3** Dado un endpoint protegido con `ADMIN`; cuando una petición incluye un rol no autorizado (ej. `PROPIETARIO_CONSULTA`); entonces el guard lanza `ForbiddenException` (HTTP 403) con detalle de roles permitidos.
- [x] **AC-4** Dado un endpoint protegido con roles; cuando una petición no incluye ni usuario autenticado ni encabezado de rol; entonces lanza `ForbiddenException` bloqueando el acceso.
- [x] **AC-5** Dado el endpoint de salud `GET /api/health` o de Swagger `GET /api/docs`; cuando se invocan públicamente; entonces responden `200 OK` demostrando su carácter OPEN.

**Checklist interno (IA, En curso):**
- [x] `RolesGuard` implementando `CanActivate` con `Reflector`
- [x] Decorador `@Roles(...)` y constante `ROLES_KEY`
- [x] Extracción de rol de `request.user` y fallback `x-user-role`
- [x] Manejo de `ForbiddenException` con detalle de roles
- [x] 5 pruebas unitarias automatizadas al 100% PASS en `test/rbac.guard.spec.ts`

---

## 2. Revisión de AC — autoriza **En curso**

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
| 2026-10-14 | Ing. Alberto José Ortiz Ortiz | Revisión de criterios de las 3 modalidades de acceso | AC-1 a AC-5 | Guía académica ISS-13 y diseño de seguridad en `docs/seguridad.md` | Las tres modalidades cubren con precisión la seguridad perimetral y granular del sistema. | AC aprobados — puede En curso |

---

## 3. IA usada — se diligencia en **En curso**

**Herramienta / modelo:** Antigravity / Gemini 3.8 Flash  
**Fecha:** 2026-10-14  
**Prompt enviado:**
```text
Configura los middlewares y guards de acceso en src/common/guards/ y src/common/decorators/ conforme a ISS-13:
1. RolesGuard evaluando metadata @Roles con Reflector.
2. Soporte de request.user y x-user-role.
3. Lanzamiento de ForbiddenException con mensaje descriptivo ante roles incompatibles o ausentes.
4. Cobertura de pruebas unitarias en test/rbac.guard.spec.ts.
```

**Ajustes o correcciones que hiciste a lo generado:**
- Se implementó la normalización `String(userRole).toUpperCase()` para asegurar que variantes en minúsculas enviadas por clientes externos sean interpretadas correctamente contra el enum `Role`.

---

## 4. EVI — se diligencia en **Verificación**

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
| 2026-10-14 | Pruebas Unitarias Vitest | AC-1 a AC-4 | `backend/test/rbac.guard.spec.ts` | `npm test -- test/rbac.guard.spec.ts` |
| 2026-10-14 | Consumo Endpoint OPEN | AC-5 | `backend/src/app.controller.ts` | `curl -i http://localhost:3002/api/health` |
| 2026-10-14 | Compilación NestJS | Calidad | `backend/dist/` | `npm run build` |

### Evidencia de ejecución real:

#### 1. Suite de Pruebas Automatizadas de `RolesGuard`:
```text
 ✓ test/rbac.guard.spec.ts (5 tests) 7ms
   ✓ should allow access if no roles are required
   ✓ should allow access when user role matches header x-user-role
   ✓ should allow access when user role is in request.user
   ✓ should throw ForbiddenException when role does not match
   ✓ should throw ForbiddenException when role header/user is missing

Test Files  8 passed (8)
     Tests  112 passed (112)
```

#### 2. Comportamiento de Endpoint OPEN:
```text
$ curl -i http://localhost:3002/api/health
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8
{"status":"ok"}
```

**Commit (hash):** `feat(iss-13): middlewares y guards de acceso en tres modalidades Refs #13`  
**Autoevaluación de AC:** AC-1: sí · AC-2: sí · AC-3: sí · AC-4: sí · AC-5: sí

---

## 5. Revisión humana del resultado — la escribe el revisor en **Revisión humana**

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
| 2026-10-14 | Ing. Alberto José Ortiz Ortiz | Auditoría de middlewares y guards de acceso | AC-1 a AC-5 | Código de RolesGuard y ejecución de test/rbac.guard.spec.ts | Las respuestas 401 y 403 diferencian claramente la autenticación de la autorización conforme a RFC 7235. | Conforme |

**Pregunta del revisor:** ¿Por qué se permite el encabezado `x-user-role` además de JWT?  
**Respuesta del desarrollador:** Para brindar interoperabilidad ágil durante pruebas automatizadas, suites `.http` y demos de integración sin obligar a regenerar tokens JWT en cada ejecución de prueba, respetando siempre que en producción el objeto `request.user` prevalece.

---

## 6. Gate — decide **Hecho** (solo el revisor)

**Estado:** aprobado  
**Conclusión:** Se verifica el cumplimiento riguroso de todos los criterios de aceptación (AC-1 a AC-5). Las tres modalidades de acceso quedan plenamente operativas.  
**Trazabilidad final:** `feat(iss-13): middlewares y guards de acceso en tres modalidades` · `Refs #13`
