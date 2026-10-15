> **Workspace:** `app-Arrendo360` (repo `dw-2026-bettoo02`) · **Proyecto:** `Arrendo360` · **Pista:** Fase II: Auth con RBAC · **Guion:** `docs/Guion_IA_Desarrollo_Software.md` · **Metodología:** `docs/Metodologia_Desarrollo_Software_SDD_Kanban.md` · **Arquitectura:** `docs/Prompt.md`

# ISS-12 — Features RoleUsers y ResourceRoles (Asignación de Roles y Concesión de Permisos)

**Naturaleza:** práctico (desarrollo de software backend)  
**Issue GitHub:** `dw-2026-bettoo02 #12`  
**Responsable (desarrollador):** Alberto José Ortiz Ortiz (@bettoo02)  
**Revisor humano:** Ing. Alberto José Ortiz Ortiz  
**Dependencias:** ISS-11 (Roles y Resources) en **Hecho**  
**Commit esperado:** `feat(iss-12): features roleusers y resourceroles, asignaciones y concesiones rbac Refs #12`

> El estado del issue **vive en el tablero Kanban**, no en este archivo. Cada sección indica en qué estado se diligencia; hasta entonces se deja como está.

---

## 1. SDD — se escribe en **Preparado**

**OBJ:** Al finalizar, el sistema permitirá articular la matriz de control de acceso basada en roles mediante las entidades pivote `RoleUser` (asignación de roles a identidades de usuario) y `ResourceRole` (concesión de recursos y endpoints a roles), habilitando el cálculo de permisos efectivos por consulta relacional o pertenencia de roles.

**SPEC (qué debe quedar):**
- Entidad de dominio `RoleUserEntity` con validación de identificadores de usuario y rol positivos, y gestión de estado activo/inactivo.
- Entidad de dominio `ResourceRoleEntity` con validación de identificadores de rol y recurso positivos, y gestión de estado activo/inactivo.
- Modelos Sequelize: `RoleUserModel` (tabla `role_users`) y `ResourceRoleModel` (tabla `resource_roles`) con claves foráneas hacia `users`, `roles` y `resources`.
- Lógica de consulta de autorización efectiva: para un usuario dado, resolución de sus roles activos y de la totalidad de endpoints permitidos.
- Pruebas unitarias en Vitest de validación de invariantes de las entidades intermedias.

**REQ (restricciones):**
- Los identificadores foráneos deben ser siempre enteros estrictamente positivos ($> 0$).
- La eliminación de una asignación o concesión puede gestionarse de forma lógica (`status = 'inactive'`) para preservar trazabilidad o física.
- El sistema no requiere ni debe crear una entidad `Permission`, puesto que el permiso es la unión efectiva $\text{Role} \times \text{Resource}$.

**AC (Dado → Cuando → Entonces; deciden el Gate):**
- [x] **AC-1** Dado un intento de instanciar `RoleUserEntity` con `userId <= 0` o `roleId <= 0`; cuando se invoca el constructor; entonces lanza un error de validación descriptivo.
- [x] **AC-2** Dado un intento de instanciar `ResourceRoleEntity` con `roleId <= 0` o `resourceId <= 0`; cuando se invoca el constructor; entonces lanza un error de validación descriptivo.
- [x] **AC-3** Dado un usuario con roles asignados en `RoleUser`; cuando se consultan sus permisos; entonces se obtienen únicamente los recursos asociados a sus roles activos.
- [x] **AC-4** Dado un rol con una concesión en `ResourceRole` marcada como inactiva; cuando se evalúa el acceso; entonces no se concede autorización para ese recurso.
- [x] **AC-5** Dado el esquema relacional en Sequelize; cuando se definen las tablas `role_users` y `resource_roles`; entonces se configuran con integridad referencial y claves foráneas correspondientes.

**Checklist interno (IA, En curso):**
- [x] Entidad pura `RoleUserEntity`
- [x] Entidad pura `ResourceRoleEntity`
- [x] Modelos Sequelize `RoleUserModel` y `ResourceRoleModel`
- [x] Registro en `ALL_MODELS` de la factoría Sequelize
- [x] Pruebas unitarias de validación numérica en `test/auth.spec.ts`

---

## 2. Revisión de AC — autoriza **En curso**

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
| 2026-10-14 | Ing. Alberto José Ortiz Ortiz | Revisión de especificaciones de las tablas intermedias RBAC | AC-1 a AC-5 | Guía académica ISS-12 y diseño de datos en `docs/sdd.md` | Invariantes claras y modelado de relaciones N:M acorde a Clean Architecture. | AC aprobados — puede En curso |

---

## 3. IA usada — se diligencia en **En curso**

**Herramienta / modelo:** Antigravity / Gemini 3.8 Flash  
**Fecha:** 2026-10-14  
**Prompt enviado:**
```text
Crea las entidades y modelos de unión N:M para el RBAC en src/features/auth/:
1. RoleUserEntity y ResourceRoleEntity con validación de IDs estrictamente positivos.
2. Modelos Sequelize RoleUserModel y ResourceRoleModel con claves foráneas.
3. Registro en ALL_MODELS de sequelize.factory.ts.
4. Pruebas unitarias en test/auth.spec.ts.
```

**Ajustes o correcciones que hiciste a lo generado:**
- Se aseguró que los modelos de persistencia respeten las convenciones de nombres de columna en snake_case (`user_id`, `role_id`, `resource_id`) mientras las entidades y propiedades en TypeScript utilizan camelCase.

---

## 4. EVI — se diligencia en **Verificación**

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
| 2026-10-14 | Test Unitario de Entidades Pivote | AC-1, AC-2 | `backend/test/auth.spec.ts` | `npm test -- test/auth.spec.ts` |
| 2026-10-14 | Modelos Sequelize Registrados | AC-5 | `backend/src/infrastructure/database/sequelize/sequelize.factory.ts` | `npm run build` |

### Evidencia de ejecución real:

#### 1. Pruebas Automatizadas de Validaciones Pivote (Vitest):
```text
 ✓ test/auth.spec.ts (15 tests)
   ✓ RoleUserEntity y ResourceRoleEntity validan IDs positivos
```

#### 2. Fragmento de Validación en Dominio:
```typescript
const roleUser = new RoleUserEntity({ userId: 1, roleId: 2 });
expect(roleUser.userId).toBe(1);
expect(roleUser.roleId).toBe(2);

expect(() => new RoleUserEntity({ userId: 0, roleId: 1 })).toThrow('El userId es requerido y debe ser positivo');
```

**Commit (hash):** `feat(iss-12): features roleusers y resourceroles, asignaciones y concesiones rbac Refs #12`  
**Autoevaluación de AC:** AC-1: sí · AC-2: sí · AC-3: sí · AC-4: sí · AC-5: sí

---

## 5. Revisión humana del resultado — la escribe el revisor en **Revisión humana**

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
| 2026-10-14 | Ing. Alberto José Ortiz Ortiz | Auditoría de capas pivote de autorización | AC-1 a AC-5 | Entidades de dominio, modelos Sequelize y tests | Las relaciones N:M están correctamente aisladas en el dominio e implementadas en infraestructura. | Conforme |

**Pregunta del revisor:** ¿Cómo se garantiza que no existan duplicados (un usuario con el mismo rol asignado dos veces)?  
**Respuesta del desarrollador:** Mediante un índice único compuesto sobre `(user_id, role_id)` en la tabla `role_users` y sobre `(role_id, resource_id)` en `resource_roles`, impidiendo duplicidades a nivel de base de datos y aplicando `findOrCreate` en la capa de servicios/casos de uso.

---

## 6. Gate — decide **Hecho** (solo el revisor)

**Estado:** aprobado  
**Conclusión:** Se verifica el cumplimiento riguroso de todos los criterios de aceptación (AC-1 a AC-5). Las asignaciones de roles y concesiones de recursos quedan integradas.  
**Trazabilidad final:** `feat(iss-12): features roleusers y resourceroles, asignaciones y concesiones rbac` · `Refs #12`
