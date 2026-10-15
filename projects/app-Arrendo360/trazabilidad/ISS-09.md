> **Workspace:** `app-Arrendo360` (repo `dw-2026-bettoo02`) · **Proyecto:** `Arrendo360` · **Pista:** Fase II: Auth con RBAC · **Guion:** `docs/Guion_IA_Desarrollo_Software.md` · **Metodología:** `docs/Metodologia_Desarrollo_Software_SDD_Kanban.md` · **Arquitectura:** `docs/Prompt.md`

# ISS-09 — Base de Seguridad Compartida y Modelos Auth

**Naturaleza:** práctico (arquitectura e infraestructura de seguridad)  
**Issue GitHub:** `dw-2026-bettoo02 #9`  
**Responsable (desarrollador):** Alberto José Ortiz Ortiz (@bettoo02)  
**Revisor humano:** Ing. Alberto José Ortiz Ortiz  
**Dependencias:** ISS-08 (Cierre Fase I: Business) en **Hecho**  
**Commit esperado:** `feat(iss-09): base de seguridad compartida y modelos auth Refs #9`

> El estado del issue **vive en el tablero Kanban**, no en este archivo. Cada sección indica en qué estado se diligencia; hasta entonces se deja como está.  
> **El Gate de ISS-09 = Inicio formal de la Fase II (Auth con RBAC) fijando primitivas criptográficas y grafo relacional.**

---

## 1. SDD — se escribe en **Preparado**

**OBJ:** Al finalizar, el backend dispondrá de las primitivas criptográficas de seguridad (hashing unidireccional con bcrypt, derivación SHA-256 para tokens opacos de reseteo, firma y verificación estricta de JSON Web Tokens), el normalizador y evaluador de coincidencias de recursos REST, y el conjunto de modelos relacionales de autenticación y autorización en Sequelize.

**SPEC (qué debe quedar):**
- Servicio criptográfico para contraseñas usando `bcrypt` con factor de coste de trabajo (salt rounds 10) resistente a ataques por GPU/ASIC.
- Generador de tokens criptográficamente seguros mediante `crypto.randomBytes(32)` con hashing SHA-256 en almacenamiento.
- Configuración de `JwtModule` para emisión y verificación simétrica HS256 con claims obligatorios: `sub`, `email`, `role`, `jti`, `iat`, `exp`.
- Algoritmo de *matching* de rutas parametrizadas para recursos HTTP (`/api/ventas/:id` coincide con peticiones `GET /api/ventas/123`).
- Definición e integración de los modelos de persistencia en Sequelize: `UserModel`, `RefreshTokenModel`, `PasswordResetTokenModel`, `RoleModel`, `ResourceModel`, `RoleUserModel`, `ResourceRoleModel` registrados en `ALL_MODELS`.
- Documentación OpenAPI/Swagger configurada con esquema de seguridad `bearerAuth`.

**REQ (restricciones):**
- Ninguna contraseña o token en texto plano debe ser persistido en la base de datos.
- La autorización se modela mediante el grafo `User` → `RoleUser` → `Role` → `ResourceRole` → `Resource` sin crear una entidad artificial `Permission`.
- Las respuestas de error no deben filtrar stacktraces ni exponer información interna del motor de base de datos.

**AC (Dado → Cuando → Entonces; deciden el Gate):**
- [x] **AC-1** Dado un texto de contraseña; cuando se invoca la función de hashing; entonces genera un hash bcrypt válido y la comparación con la contraseña correcta retorna `true` y con una errónea retorna `false`.
- [x] **AC-2** Dado un payload de usuario; cuando se firma un JWT; entonces incluye los claims de identidad (`sub`, `email`, `role`, `jti`) y la verificación con clave secreta válida extrae el payload íntegro.
- [x] **AC-3** Dado un recurso registrado con ruta `/api/ventas/:id` y método `GET`; cuando se evalúa contra la ruta de una petición entrante `GET /api/ventas/55`; entonces el matcher dictamina coincidencia afirmativa (`true`).
- [x] **AC-4** Dado el orquestador de Sequelize `ALL_MODELS`; cuando la base de datos se sincroniza; entonces se reconocen y registran todas las tablas de autenticación y la matriz RBAC.
- [x] **AC-5** Dado Swagger en `/api/docs`; cuando se inspecciona la especificación OpenAPI; entonces expone el esquema de seguridad Bearer JWT y las respuestas documentadas `401 Unauthorized` y `403 Forbidden`.

**Checklist interno (IA, En curso):**
- [x] Primitivas de hashing bcrypt y verificación de credenciales
- [x] Generador y comparador SHA-256 para tokens de recuperación
- [x] Configuración JWT con expiración y rotación
- [x] Matcher de rutas y recursos con expresiones regulares
- [x] Modelos Sequelize de Auth registrados en `ALL_MODELS`
- [x] Esquema `bearerAuth` en configuración de Swagger

---

## 2. Revisión de AC — autoriza **En curso**

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
| 2026-10-14 | Ing. Alberto José Ortiz Ortiz | Revisión de criterios de la base de seguridad | AC-1 a AC-5 | Especificación de la Fase II de Tecnogua ISS-09 y manual `docs/seguridad.md` | Primitivas y grafo de autorización bien fundamentados técnica y criptográficamente. | AC aprobados — puede En curso |

---

## 3. IA usada — se diligencia en **En curso**

**Herramienta / modelo:** Antigravity / Gemini 3.8 Flash  
**Fecha:** 2026-10-14  
**Prompt enviado:**
```text
Configura la base de seguridad de Arrendo360 conforme al ISS-09:
1. Primitivas de contraseñas con bcrypt (coste 10) y tokens opacos en src/features/auth/.
2. Módulo JwtModule con firma HS256 y claims estandarizados (sub, email, role, jti).
3. Entidades y modelos Sequelize para el modelo RBAC completo: User, RefreshToken, PasswordResetToken, Role, Resource, RoleUser, ResourceRole.
4. Integración en ALL_MODELS de sequelize.factory.ts.
5. Swagger con esquema bearerAuth para autorización JWT.
```

**Ajustes o correcciones que hiciste a lo generado:**
- Se implementó el patrón de matching con sustitución de parámetros `:param` mediante expresiones regulares para garantizar correspondencia exacta en endpoints REST anidados.
- Se configuró la clave foránea y relaciones en `UserModel` y tablas intermedias para mantener consistencia con los 5 bounded contexts de negocio preexistentes.

---

## 4. EVI — se diligencia en **Verificación**

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
| 2026-10-14 | Pruebas de Criptografía y JWT | AC-1, AC-2 | `backend/test/auth.spec.ts` | `npm test -- test/auth.spec.ts` |
| 2026-10-14 | Test de Resource Matcher | AC-3 | `backend/src/features/auth/domain/entities/resource.entity.ts` | `npm test` |
| 2026-10-14 | Registro de Modelos en Sequelize | AC-4 | `backend/src/infrastructure/database/sequelize/sequelize.factory.ts` | Inspección de `ALL_MODELS` |
| 2026-10-14 | Swagger Security | AC-5 | `backend/src/config/swagger/swagger.config.ts` | `curl -i http://localhost:3002/api/docs.json` |

### Evidencia de ejecución real:

#### 1. Verificación de Modelos Registrados en `ALL_MODELS`:
```typescript
export const ALL_MODELS = [
  UserModel,
  RefreshTokenModel,
  PasswordResetTokenModel,
  RoleModel,
  ResourceModel,
  RoleUserModel,
  ResourceRoleModel,
  // ... Modelos Business
];
```

#### 2. Suite de Pruebas de Primitivas Criptográficas:
```text
 ✓ test/auth.spec.ts (15 tests) 1540ms
   ✓ User: debe comparar contraseñas válidas e inválidas y permitir actualización de contraseña
   ✓ ResourceEntity valida campos requeridos y realiza route pattern matching
   ✓ RoleEntity valida nombre y mayúsculas
   ✓ RoleUserEntity y ResourceRoleEntity validan IDs positivos

Test Files  8 passed (8)
     Tests  112 passed (112)
```

**Commit (hash):** `feat(iss-09): base de seguridad compartida y modelos auth Refs #9`  
**Autoevaluación de AC:** AC-1: sí · AC-2: sí · AC-3: sí · AC-4: sí · AC-5: sí

---

## 5. Revisión humana del resultado — la escribe el revisor en **Revisión humana**

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
| 2026-10-14 | Ing. Alberto José Ortiz Ortiz | Auditoría de componentes de seguridad e infraestructura | AC-1 a AC-5 | Archivos fuente de Auth, entidades, modelos Sequelize y tests unitarios | Estructura robusta. Las primitivas de hashing y el matcher de recursos cumplen con los estándares de seguridad OWASP. | Conforme |

**Pregunta del revisor:** ¿Por qué no se utiliza una tabla simple `permissions`?  
**Respuesta del desarrollador:** Siguiendo los principios de modelado de autorización por grafos, un permiso no es más que la unión del sujeto (`Role`) con el objeto (`Resource`). La tabla intermedia `resource_roles` modela exactamente esa relación N:M evitando redundancias o desincronizaciones entre permisos abstractos y rutas HTTP reales.

---

## 6. Gate — decide **Hecho** (solo el revisor)

**Estado:** aprobado  
**Conclusión:** Se verifica el cumplimiento riguroso de todos los criterios de aceptación (AC-1 a AC-5). La base compartida de seguridad queda establecida y probada.  
**Trazabilidad final:** `feat(iss-09): base de seguridad compartida y modelos auth` · `Refs #9`
