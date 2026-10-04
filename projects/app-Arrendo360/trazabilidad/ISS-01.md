> **Workspace:** `backend-nest-ia` · **Pista:** solo Business (7 issues) · **Guion:** `docs/Guion_IA_Desarrollo_Software.md` · **Metodología:** `docs/Metodologia_Desarrollo_Software_SDD_Kanban.md` · **Arquitectura:** `docs/Prompt.md`

# ISS-01 — Esqueleto NestJS CA arrancable

**Naturaleza:** práctico (desarrollo de software backend)  
**Issue GitHub:** `backend-nest-ia #__` (número que asigna GitHub al crear el Issue; anótalo aquí y en el cuerpo del Issue)  
**Responsable (desarrollador):**  
**Revisor humano:**  
**Dependencias:** ninguna (primer issue del proyecto)  
**Commit esperado:** `feat(iss-01): esqueleto NestJS CA arrancable` con `Refs #__`

> El estado del issue **vive en el tablero Kanban**, no en este archivo. Cada sección indica en qué estado se diligencia; hasta entonces se deja como está.

---

## 1. SDD — se escribe en **Preparado**

**OBJ:** Al finalizar, el desarrollador podrá arrancar un proyecto NestJS versionado en Git, con el árbol de Clean Architecture de la pista, para construir sobre él las features siguientes sin reorganizar carpetas.

**SPEC (qué debe quedar):**
- Proyecto NestJS (npm) generado **en la raíz del workspace**, conservando intactos `.git/`, `docs/` y `trazabilidad/`.
- Árbol `src/config/`, `src/common/`, `src/infrastructure/database/`, `src/features/business/` (vacío o con `business.module.ts` stub). Ver `docs/Prompt.md` §3.
- `main.ts` con prefijo global `/api`, CORS (`enableCors({ origin: 'http://localhost:4200', credentials: true })`), `ValidationPipe` global (`whitelist`, `forbidNonWhitelisted`, `transform`) y `listen(PORT ?? 3002)`.
- Endpoint de salud `GET /api/health` → `200 { "status": "ok" }` (sirve para comprobar el arranque sin BD).
- Script `free:port` (`scripts/free-port.js`) y `start:dev` que lo invoque antes de `nest start --watch`.
- `.gitignore` con `node_modules/`, `dist/`, `.env`.

**REQ (restricciones):**
- Fuera de alcance: Sequelize, base de datos, `.env` de BD, Auth, Users, JWT Token, login. Eso es ISS-02 en adelante.
- No `sync({ force: true })` (aquí ni siquiera hay Sequelize).
- No adelantar ISS-02. No borrar ni reescribir `docs/` ni `trazabilidad/`.

**AC (Dado → Cuando → Entonces; deciden el Gate):**
- [ ] **AC-1** Dado el workspace con `.git/`, `docs/` y `trazabilidad/`; cuando la IA termina; entonces existen `package.json` y `src/main.ts`, y `docs/` y `trazabilidad/` siguen intactos (`git status` no muestra borrados en esas carpetas).
- [ ] **AC-2** Dado el proyecto con dependencias instaladas; cuando **el desarrollador** ejecuta `npm run start:dev`; entonces la app levanta sin error y el log muestra `Nest application successfully started` en el puerto `3002`.
- [ ] **AC-3** Dado la app arriba; cuando se hace `GET http://localhost:3002/api/health`; entonces responde `200` con `{ "status": "ok" }`.
- [ ] **AC-4** Dado `src/`; cuando se listan sus carpetas; entonces existen `config/`, `common/`, `infrastructure/database/`, `features/business/` y **no** existe `features/auth/`.

**Checklist interno (lo ejecuta la IA en En curso; no sale al tablero):**
- [ ] Generar Nest sin borrar `.git`, `docs/`, `trazabilidad/`
- [ ] Árbol CA de la pista
- [ ] `main.ts`: prefijo `/api`, CORS, `ValidationPipe`, puerto
- [ ] `GET /api/health`
- [ ] `scripts/free-port.js` + scripts npm
- [ ] `.gitignore`

---

## 2. Revisión de AC — autoriza **En curso** (la escribe el revisor al final de Preparado)

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|       |         |           | OBJ, SPEC, REQ, AC | este archivo   |          | pendiente |

Decisión posible: `AC aprobados — puede En curso` · `Ajustar AC` (indicar cuál y por qué).

---

## 3. IA usada — se diligencia en **En curso**, después de enviar el prompt

**Herramienta / modelo:** (pendiente — p. ej. Cursor + modelo usado)  
**Fecha:** (pendiente)  
**Prompt enviado** (copiado **tal cual** del **Paso 6 de la Parte A** del Guion):

```text
(pendiente — pegar aquí el prompt exacto)
```

**Ajustes o correcciones que hiciste a lo generado:** (pendiente — p. ej. «la IA usó `ng`; le pedí `nest`»)

---

## 4. EVI — se diligencia en **Verificación** (después de ejecutar tú mismo)

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
|       | log de arranque | AC-2 | (pegar 3–5 líneas del log o ruta a captura) | `npm run start:dev` |
|       | respuesta HTTP | AC-3 | (pegar respuesta) | `curl -i http://localhost:3002/api/health` |
|       | árbol | AC-1, AC-4 | (salida de `ls src src/features`) | `ls src src/features` |

**Commit (hash):** pendiente — `feat(iss-01): esqueleto NestJS CA arrancable` · `Refs #__` · hecho `git push`  
**Autoevaluación de AC:** pendiente (AC-1: sí/no · AC-2: sí/no · AC-3: sí/no · AC-4: sí/no)

---

## 5. Revisión humana del resultado — la escribe el revisor en **Revisión humana**

Preguntas guía del revisor: «Señala en el árbol qué va en `config`, qué en `common`, qué en `infrastructure` y qué en `features`». «¿Por qué el prefijo `/api` y el `ValidationPipe` están en `main.ts` y no en un controller?»

| Fecha | Revisor | Actuación (aporte · revisión conforme · devolución) | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------------------------------------------------|--------------|----------------------|----------|----------|
|       |         |           |              |                      |          |          |

**Respuesta del autor (ajuste o justificación):**

---

## 6. Gate — decide **Hecho** (solo el revisor)

**Estado:** pendiente (`aprobado` · `aprobado con observación` · `devuelto` · `cancelado`)  
**Conclusión:**  
**Trazabilidad final:** (hash del commit definitivo + enlace al Issue)
