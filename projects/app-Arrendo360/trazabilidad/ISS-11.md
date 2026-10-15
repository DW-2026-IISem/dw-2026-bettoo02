> **Workspace:** `app-Arrendo360` (repo `dw-2026-bettoo02`) · **Proyecto:** `Arrendo360` · **Pista:** Fase II: Auth con RBAC · **Guion:** `docs/Guion_IA_Desarrollo_Software.md` · **Metodología:** `docs/Metodologia_Desarrollo_Software_SDD_Kanban.md` · **Arquitectura:** `docs/Prompt.md`

# ISS-11 — Features Roles y Resources (Catálogo de Autorización)

**Naturaleza:** práctico (desarrollo de software backend)  
**Issue GitHub:** `dw-2026-bettoo02 #11`  
**Responsable (desarrollador):** Alberto José Ortiz Ortiz (@bettoo02)  
**Revisor humano:** Ing. Alberto José Ortiz Ortiz  
**Dependencias:** ISS-10 (Feature Users) en **Hecho**  
**Commit esperado:** `feat(iss-11): features roles y resources, catalogo de autorizacion Refs #11`

> El estado del issue **vive en el tablero Kanban**, no en este archivo. Cada sección indica en qué estado se diligencia; hasta entonces se deja como está.

---

## 1. SDD — se escribe en **Preparado**

**OBJ:** Al finalizar, el backend dispondrá de las entidades, modelos y catálogos de los dos extremos de la autorización: los **Sujetos** (`Role`) y los **Objetos** (`Resource`), permitiendo catalogar roles de acceso y recursos protegidos mediante el par `(method, path)` con soporte de expresiones regulares para rutas dinámicas.

**SPEC (qué debe quedar):**
- Entidad de dominio `RoleEntity` con validación de nombre requerido, normalización forzosa a MAYÚSCULAS y métodos de activación/desactivación lógica.
- Entidad de dominio `ResourceEntity` con validación de método HTTP, normalización de ruta a minúsculas y método de coincidencia `matches(method, path)` con soporte para parámetros `:param`.
- Modelos de persistencia Sequelize: `RoleModel` (tabla `roles`) y `ResourceModel` (tabla `resources`) con columnas `id`, `name`, `description`/`path`, `method` y `status`.
- Catálogo base de roles del negocio: `ADMIN`, `ASESOR`, `CARTERA`, `MANTENIMIENTO`, `PROPIETARIO_CONSULTA`.
- Catálogo de recursos que indexa los endpoints de los 5 bounded contexts de negocio y de los módulos de soporte.
- Pruebas unitarias de validación y *route pattern matching* en Vitest.

**REQ (restricciones):**
- Los nombres de rol se normalizan automáticamente a mayúsculas sin espacios redundantes.
- Los recursos identifican inequívocamente cada operación REST mediante su verbo (`GET`, `POST`, `PUT`, `PATCH`, `DELETE`) y patrón de URI.
- Se mantiene el principio de que los roles y recursos no definen permisos aislados por sí mismos hasta ser enlazados mediante las tablas pivote (ISS-12).

**AC (Dado → Cuando → Entonces; deciden el Gate):**
- [x] **AC-1** Dado un nombre de rol en minúsculas (ej. `'asesor'`); cuando se crea la instancia `RoleEntity`; entonces su atributo `name` se almacena normalizado en mayúsculas (`'ASESOR'`).
- [x] **AC-2** Dado un intento de instanciar un rol o recurso con datos vacíos; cuando se invoca el constructor; entonces lanza una excepción descriptiva de validación.
- [x] **AC-3** Dado un recurso registrado con ruta parametrizada `/api/ventas/:id` y método `GET`; cuando se invoca `resource.matches('GET', '/api/ventas/99')`; entonces retorna `true`.
- [x] **AC-4** Dado el mismo recurso `/api/ventas/:id`; cuando se evalúa contra un verbo diferente (`POST /api/ventas/99`) o una ruta anidada no correspondiente (`GET /api/ventas/99/extra`); entonces retorna `false`.
- [x] **AC-5** Dado un recurso en estado inactivo (`status === 'inactive'`); cuando se evalúa cualquier coincidencia de ruta; entonces retorna `false` impidiendo accesos sobre recursos desactivados.

**Checklist interno (IA, En curso):**
- [x] Entidad `RoleEntity` con normalización a mayúsculas
- [x] Entidad `ResourceEntity` con evaluador regex `matches`
- [x] Modelos `RoleModel` y `ResourceModel` creados y registrados
- [x] Cobertura de tests unitarios de validación y concordancia de rutas
- [x] Catálogo de roles alineado con el enum `Role` del sistema

---

## 2. Revisión de AC — autoriza **En curso**

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
| 2026-10-14 | Ing. Alberto José Ortiz Ortiz | Revisión de especificación del catálogo de roles y recursos | AC-1 a AC-5 | Especificaciones del ISS-11 de la guía académica y arquitectura RBAC | Modelo claro y desacoplado. El evaluador de rutas con regex resuelve eficazmente los identificadores dinámicos. | AC aprobados — puede En curso |

---

## 3. IA usada — se diligencia en **En curso**

**Herramienta / modelo:** Antigravity / Gemini 3.8 Flash  
**Fecha:** 2026-10-14  
**Prompt enviado:**
```text
Implementa las entidades y modelos para Roles y Resources en src/features/auth/ conforme al ISS-11:
1. RoleEntity con validación e invariante de nombre en mayúsculas.
2. ResourceEntity con normalización de método HTTP, ruta y método matches(method, path) basado en regex.
3. Modelos Sequelize RoleModel y ResourceModel en tablas roles y resources.
4. Pruebas unitarias de validación y coincidencias en test/auth.spec.ts.
```

**Ajustes o correcciones que hiciste a lo generado:**
- Se diseñó el algoritmo de sustitución de parámetros `:param` en `ResourceEntity.matches` para asegurar que las barras diagonales finales (`/`) no interfieran con la evaluación de los endpoints.

---

## 4. EVI — se diligencia en **Verificación**

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
| 2026-10-14 | Test de Roles | AC-1, AC-2 | `backend/test/auth.spec.ts` | `npm test -- test/auth.spec.ts` |
| 2026-10-14 | Test de Resource Matcher | AC-3, AC-4, AC-5 | `backend/test/auth.spec.ts` | `npm test -- test/auth.spec.ts` |
| 2026-10-14 | Modelos Sequelize | Integridad BD | `backend/src/infrastructure/database/sequelize/sequelize.factory.ts` | `npm run build` |

### Evidencia de ejecución real:

#### 1. Pruebas de Roles y Resources (Vitest):
```text
 ✓ test/auth.spec.ts (15 tests)
   ✓ RoleEntity valida nombre y mayúsculas
   ✓ ResourceEntity valida campos requeridos y realiza route pattern matching
```

#### 2. Comprobación del Matcher Dinámico:
```typescript
const resource = new ResourceEntity({
  name: 'Ventas - Detalle por ID',
  path: '/api/ventas/:id',
  method: 'get',
});

resource.matches('GET', '/api/ventas/42');       // -> true
resource.matches('POST', '/api/ventas/42');      // -> false (verbo distinto)
resource.matches('GET', '/api/ventas/42/extra'); // -> false (ruta distinta)
```

**Commit (hash):** `feat(iss-11): features roles y resources, catalogo de autorizacion Refs #11`  
**Autoevaluación de AC:** AC-1: sí · AC-2: sí · AC-3: sí · AC-4: sí · AC-5: sí

---

## 5. Revisión humana del resultado — la escribe el revisor en **Revisión humana**

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
| 2026-10-14 | Ing. Alberto José Ortiz Ortiz | Auditoría del catálogo de autorización | AC-1 a AC-5 | Archivos de dominio, modelos y pruebas automatizadas | Las pruebas cubren exhaustivamente las rutas dinámicas y la normalización de métodos. | Conforme |

**Pregunta del revisor:** ¿Cómo se gestionan las rutas con múltiples parámetros (ej. `/api/inmuebles/:id/contratos/:contratoId`)?  
**Respuesta del desarrollador:** La expresión regular global `/:[a-zA-Z0-9_]+/g` reemplaza secuencialmente cada segmento parametrizado por `[^/]+`, permitiendo hacer *matching* preciso de rutas complejas sin importar la cantidad de identificadores numéricos o alfanuméricos.

---

## 6. Gate — decide **Hecho** (solo el revisor)

**Estado:** aprobado  
**Conclusión:** Se verifica el cumplimiento riguroso de todos los criterios de aceptación (AC-1 a AC-5). El catálogo de sujetos y objetos de autorización queda validado.  
**Trazabilidad final:** `feat(iss-11): features roles y resources, catalogo de autorizacion` · `Refs #11`
