> **Workspace:** `app-Arrendo360` (repo `dw-2026-bettoo02`) · **Proyecto:** `Arrendo360` · **Pista:** Fase II: Auth con RBAC · **Guion:** `docs/Guion_IA_Desarrollo_Software.md` · **Metodología:** `docs/Metodologia_Desarrollo_Software_SDD_Kanban.md` · **Arquitectura:** `docs/Prompt.md`

# ISS-10 — Feature Users (Identidad, Contraseñas y Ciclo de Vida)

**Naturaleza:** práctico (desarrollo de software backend)  
**Issue GitHub:** `dw-2026-bettoo02 #10`  
**Responsable (desarrollador):** Alberto José Ortiz Ortiz (@bettoo02)  
**Revisor humano:** Ing. Alberto José Ortiz Ortiz  
**Dependencias:** ISS-09 (Base de seguridad compartida) en **Hecho**  
**Commit esperado:** `feat(iss-10): feature users, hashing bcrypt y ciclo de vida Refs #10`

> El estado del issue **vive en el tablero Kanban**, no en este archivo. Cada sección indica en qué estado se diligencia; hasta entonces se deja como está.

---

## 1. SDD — se escribe en **Preparado**

**OBJ:** Al finalizar, el sistema permitirá la gestión integral de identidades de usuario (creación, consulta, actualización de contraseñas y desactivación lógica), aplicando normalización estricta de correo electrónico (`trim` y minúsculas), hashing irreversible mediante `bcrypt` y validación de unicidad de cuentas.

**SPEC (qué debe quedar):**
- Entidad pura `User` en `src/features/auth/domain/entities/user.entity.ts` con métodos `comparePassword`, `setPassword`, `activar`, `desactivar` y `cambiarRol`.
- Contrato e implementación de persistencia: `IUserRepository` y `UserRepository` en Sequelize sobre la tabla `usuarios`.
- DTOs con `class-validator`: `RegisterDto` (validación de formato de email, longitud de clave $\ge 8$, sanitización con `@Transform`), `UpdateUserDto` y respuestas seguras `AuthResponseDto` sin filtrar `passwordHash`.
- Casos de uso: `RegisterUseCase` con verificación de no colisión de email (`ConflictException`), y búsqueda por ID o email.
- Controlador REST en `AuthController` atendiendo `/api/auth/register` y consultas de usuario.
- Cobertura de pruebas unitarias sobre hashing, comparación de credenciales válidas/inválidas y unicidad.

**REQ (restricciones):**
- El correo electrónico debe normalizarse siempre a minúsculas (`email.toLowerCase().trim()`).
- La contraseña en texto claro no puede almacenarse ni transmitirse en objetos de respuesta (`AuthResponseDto` nunca incluye `passwordHash`).
- Si se intenta registrar un correo ya existente, se debe responder con `HTTP 409 Conflict` (*"Ya existe un usuario con este correo electrónico"*).

**AC (Dado → Cuando → Entonces; deciden el Gate):**
- [x] **AC-1** Dado un payload de registro con nombre, email y contraseña válida; cuando se envía `POST /api/auth/register`; entonces responde `201 Created` con el usuario registrado, id asignado y hash de contraseña generado con bcrypt.
- [x] **AC-2** Dado un intento de registro con un email ya persistido; cuando se envía la solicitud; entonces responde `409 Conflict` evitando la duplicidad.
- [x] **AC-3** Dado un usuario con contraseña almacenada; cuando se invoca `user.comparePassword('claveCorrecta')`; entonces retorna `true`; y cuando se prueba con clave errónea retorna `false`.
- [x] **AC-4** Dado un usuario activo; cuando se invoca su desactivación lógica; entonces su propiedad `isActive` cambia a `false` impidiendo futuros inicios de sesión.
- [x] **AC-5** Dado el DTO de respuesta; cuando se mapea la entidad `User` a `AuthResponseDto`; entonces la propiedad `passwordHash` no existe en la salida serializada.

**Checklist interno (IA, En curso):**
- [x] Entidad de dominio `User` con métodos de ciclo de vida y comparación bcrypt
- [x] Modelo `UserModel` en tabla `usuarios`
- [x] `UserRepository` con operaciones CRUD y búsqueda por email normalizado
- [x] `RegisterUseCase` con validación de conflictos y hashing
- [x] `RegisterDto` y `AuthResponseDto` sanitizados
- [x] Pruebas unitarias en `test/auth.spec.ts`

---

## 2. Revisión de AC — autoriza **En curso**

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
| 2026-10-14 | Ing. Alberto José Ortiz Ortiz | Revisión de criterios de gestión de usuarios e identidades | AC-1 a AC-5 | Requerimientos de la guía académica ISS-10 y manual `docs/seguridad.md` | Especificaciones de seguridad sólidas: hashing forzoso y normalización estricta. | AC aprobados — puede En curso |

---

## 3. IA usada — se diligencia en **En curso**

**Herramienta / modelo:** Antigravity / Gemini 3.8 Flash  
**Fecha:** 2026-10-14  
**Prompt enviado:**
```text
Desarrolla el Feature Users en src/features/auth/ cumpliendo los requisitos del ISS-10:
1. Entidad User con métodos comparePassword y setPassword usando bcrypt (salt 10).
2. Modelo Sequelize UserModel con columnas id, nombre, email único, password_hash, role e is_active.
3. IUserRepository y UserRepository implementando findByEmail, findById, create y update.
4. RegisterUseCase con detección de conflicto de correo (409) y hashing seguro.
5. RegisterDto con validaciones de class-validator y filtro de salida en AuthResponseDto.
6. Pruebas unitarias de identidad y ciclo de vida en test/auth.spec.ts.
```

**Ajustes o correcciones que hiciste a lo generado:**
- Se aseguró que el método `findByEmail` en el repositorio ejecute una búsqueda con normalización `.toLowerCase().trim()` para neutralizar ataques basados en variantes de mayúsculas/minúsculas.
- Se desacopló la entidad `User` de cualquier dependencia con Sequelize, manteniendo métodos de dominio puros.

---

## 4. EVI — se diligencia en **Verificación**

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
| 2026-10-14 | Pruebas Unitarias Vitest | AC-1, AC-2, AC-3 | `backend/test/auth.spec.ts` | `npm test -- test/auth.spec.ts` |
| 2026-10-14 | Inspección de Mapper | AC-5 | `backend/src/features/auth/application/mappers/user.mapper.ts` | Inspección visual de DTO |
| 2026-10-14 | Compilación NestJS | Calidad | `backend/dist/` | `npm run build` |

### Evidencia de ejecución real:

#### 1. Pruebas de Dominio y Casos de Uso de Users:
```text
 ✓ test/auth.spec.ts (15 tests)
   ✓ User: debe comparar contraseñas válidas e inválidas y permitir actualización de contraseña (313ms)
   ✓ RegisterUseCase: debe registrar un usuario correctamente con contraseña hasheada
   ✓ RegisterUseCase: debe lanzar ConflictException si el email ya existe
```

#### 2. DTO Serializado sin Password Hash:
```json
{
  "user": {
    "id": 1,
    "nombre": "Administrador General",
    "email": "admin@arrendo360.com",
    "role": "ADMIN",
    "isActive": true
  }
}
```

**Commit (hash):** `feat(iss-10): feature users, hashing bcrypt y ciclo de vida Refs #10`  
**Autoevaluación de AC:** AC-1: sí · AC-2: sí · AC-3: sí · AC-4: sí · AC-5: sí

---

## 5. Revisión humana del resultado — la escribe el revisor en **Revisión humana**

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
| 2026-10-14 | Ing. Alberto José Ortiz Ortiz | Auditoría de modelo de identidad | AC-1 a AC-5 | Código fuente de User, UserRepository y suite de pruebas | Cumplimiento exhaustivo. Las contraseñas quedan completamente protegidas con bcrypt. | Conforme |

**Pregunta del revisor:** ¿Por qué no se expone el endpoint para actualizar el hash directamente?  
**Respuesta del desarrollador:** Porque violaría el principio de encapsulamiento del dominio. Las mutaciones de contraseña se realizan a través de métodos de entidad explícitos (`setPassword`) que calculan un nuevo salt y hash de forma atómica antes de la persistencia.

---

## 6. Gate — decide **Hecho** (solo el revisor)

**Estado:** aprobado  
**Conclusión:** Se verifica el cumplimiento riguroso de todos los criterios de aceptación (AC-1 a AC-5). El ciclo de vida de usuarios e identidades queda garantizado.  
**Trazabilidad final:** `feat(iss-10): feature users, hashing bcrypt y ciclo de vida` · `Refs #10`
