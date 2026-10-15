> **Workspace:** `app-Arrendo360` (repo `dw-2026-bettoo02`) · **Proyecto:** `Arrendo360` · **Pista:** Fase II: Auth con RBAC · **Guion:** `docs/Guion_IA_Desarrollo_Software.md` · **Metodología:** `docs/Metodologia_Desarrollo_Software_SDD_Kanban.md` · **Arquitectura:** `docs/Prompt.md`

# ISS-14 — Feature RefreshTokens (Sesiones Renovables, Rotación RTR y Revocación)

**Naturaleza:** práctico (desarrollo de software backend)  
**Issue GitHub:** `dw-2026-bettoo02 #14`  
**Responsable (desarrollador):** Alberto José Ortiz Ortiz (@bettoo02)  
**Revisor humano:** Ing. Alberto José Ortiz Ortiz  
**Dependencias:** ISS-13 (Middlewares y Guards) en **Hecho**  
**Commit esperado:** `feat(iss-14): feature refreshtokens, rotacion rtr y deteccion de reuso Refs #14`

> El estado del issue **vive en el tablero Kanban**, no en este archivo. Cada sección indica en qué estado se diligencia; hasta entonces se deja como está.

---

## 1. SDD — se escribe en **Preparado**

**OBJ:** Al finalizar, el backend dispondrá de un sistema de persistencia y renovación de sesiones mediante tokens de refresco con **Refresh Token Rotation (RTR)** conforme al estándar **RFC 6819**, con detección proactiva de ataques de repetición (*replay attacks*) e invalidación atómica de familias completas de tokens ante sospecha de clonación.

**SPEC (qué debe quedar):**
- Entidad `RefreshToken` en `src/features/auth/domain/entities/refresh-token.entity.ts` con propiedades `userId`, `jti`, `familyId`, `isUsed`, `isRevoked`, `expiresAt` y métodos de mutación `marcarComoUsado` y `revocar`.
- Modelo Sequelize `RefreshTokenModel` sobre la tabla `refresh_tokens`.
- Repositorio `IRefreshTokenRepository` y `RefreshTokenRepository` con método especializado `revokeFamily(familyId)`.
- Caso de uso `RefreshTokenUseCase`:
  - Verificación de no revocación y no expiración.
  - **Detección de Reúso:** Si `tokenRecord.isUsed === true`, se asume una brecha de sesión, se revoca inmediatamente toda la familia (`revokeFamily(familyId)`) y se responde con `HTTP 401 Unauthorized`.
  - Rotación normal: se marca el token presentado como `isUsed = true`, se emite un nuevo `accessToken` y un nuevo `refreshToken` con identificador único `jti` fresco, heredando el mismo `familyId`.
- Caso de uso `RevokeTokenUseCase` para invalidación voluntaria.
- Endpoint `POST /api/auth/refresh` y `POST /api/auth/revoke-token`.
- Pruebas automatizadas en Vitest simulando flujo normal de refresco y detección de ataque de repetición.

**REQ (restricciones):**
- Cada refresh token es estrictamente de un solo uso.
- Ante un intento de reúso de un token previo, deben invalidarse tanto el usuario legítimo como el atacante (revocación de toda la familia `familyId`).
- La expiración del refresh token debe ser verificada antes de cualquier rotación.

**AC (Dado → Cuando → Entonces; deciden el Gate):**
- [x] **AC-1** Dado un refresh token activo y no utilizado; cuando se envía `POST /api/auth/refresh`; entonces responde `200 OK` con un nuevo par de tokens (`accessToken` y `refreshToken`) y marca el token original como consumido (`isUsed = true`).
- [x] **AC-2** Dado un refresh token que ya fue utilizado previamente (`isUsed = true`); cuando un atacante intenta enviarlo nuevamente; entonces el sistema detecta el reúso, revoca atómicamente todos los tokens de ese `familyId` y responde con `401 Unauthorized`.
- [x] **AC-3** Dado un refresh token revocado (`isRevoked = true`); cuando se intenta refrescar; entonces responde `401 Unauthorized` bloqueando la sesión.
- [x] **AC-4** Dado un refresh token expirado temporalmente (`expiresAt < now`); cuando se presenta al endpoint; entonces responde `401 Unauthorized` requiriendo re-autenticación.
- [x] **AC-5** Dado el endpoint de revocación voluntaria; cuando se solicita revocar un token; entonces queda persistido como revocado y no puede volver a ser utilizado.

**Checklist interno (IA, En curso):**
- [x] Entidad `RefreshToken` con reglas de estado
- [x] Modelo Sequelize `RefreshTokenModel` en `refresh_tokens`
- [x] Repositorio con método `revokeFamily`
- [x] `RefreshTokenUseCase` con algoritmo RTR y detección de reúso
- [x] `RevokeTokenUseCase` implementado
- [x] Pruebas unitarias de flujo RTR y detección de ataque en `test/auth.spec.ts`

---

## 2. Revisión de AC — autoriza **En curso**

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
| 2026-10-14 | Ing. Alberto José Ortiz Ortiz | Revisión de especificación de Refresh Tokens y RTR | AC-1 a AC-5 | Especificaciones del ISS-14 y diseño de seguridad RFC 6819 en `docs/seguridad.md` | Protocolo de rotación y mitigación de reúso diseñado con máximo rigor criptográfico. | AC aprobados — puede En curso |

---

## 3. IA usada — se diligencia en **En curso**

**Herramienta / modelo:** Antigravity / Gemini 3.8 Flash  
**Fecha:** 2026-10-14  
**Prompt enviado:**
```text
Implementa el módulo de RefreshTokens con RTR según ISS-14:
1. RefreshToken entity y modelo Sequelize RefreshTokenModel.
2. IRefreshTokenRepository y RefreshTokenRepository con soporte de revokeFamily.
3. RefreshTokenUseCase implementando RTR con detección activa de reúso (RFC 6819) que revoque la familia completa ante tokens usados.
4. RevokeTokenUseCase para cierre selectivo de tokens.
5. Endpoints en AuthController y pruebas exhaustivas en test/auth.spec.ts.
```

**Ajustes o correcciones que hiciste a lo generado:**
- Se implementó la persistencia atómica del campo `isUsed` antes de emitir los nuevos tokens JWT para cerrar ventanas de condición de carrera (*race conditions*).

---

## 4. EVI — se diligencia en **Verificación**

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
| 2026-10-14 | Pruebas Unitarias Vitest | AC-1, AC-2, AC-3 | `backend/test/auth.spec.ts` | `npm test -- test/auth.spec.ts` |
| 2026-10-14 | Test de Expiración y Reúso | AC-2, AC-4 | `backend/test/auth.spec.ts` | `npm test -- test/auth.spec.ts` |
| 2026-10-14 | Compilación NestJS | Calidad | `backend/dist/` | `npm run build` |

### Evidencia de ejecución real:

#### 1. Pruebas de Rotación y Detección de Reúso (Vitest):
```text
 ✓ test/auth.spec.ts
   ✓ RefreshTokenUseCase: debe rotar el refresh token y emitir un nuevo par de tokens
   ✓ RefreshTokenUseCase: DETECCIÓN DE REÚSO - debe revocar la familia si se presenta un token ya usado
   ✓ RefreshTokenUseCase: debe fallar si el token ya está revocado
   ✓ RefreshTokenUseCase: debe fallar si el token ha expirado
```

#### 2. Fragmento de Detección de Ataque de Reúso en Código:
```typescript
if (tokenRecord.isUsed) {
  await this.refreshTokenRepository.revokeFamily(payload.familyId);
  throw new UnauthorizedException(
    'Detección de reúso de refresh token: se ha detectado el intento de reutilización de un token previo. La sesión ha sido revocada por motivos de seguridad.',
  );
}
```

**Commit (hash):** `feat(iss-14): feature refreshtokens, rotacion rtr y deteccion de reuso Refs #14`  
**Autoevaluación de AC:** AC-1: sí · AC-2: sí · AC-3: sí · AC-4: sí · AC-5: sí

---

## 5. Revisión humana del resultado — la escribe el revisor en **Revisión humana**

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
| 2026-10-14 | Ing. Alberto José Ortiz Ortiz | Auditoría de protocolo criptográfico RTR | AC-1 a AC-5 | Código fuente de RefreshTokenUseCase, repositorios y logs de prueba | Implementación canónica del estándar RFC 6819. La revocación en cascada de la familia protege eficazmente contra secuestros de sesión. | Conforme |

**Pregunta del revisor:** ¿Qué ocurre con la experiencia del usuario legítimo si el atacante reúsó el token antes que él?  
**Respuesta del desarrollador:** Conforme a RFC 6819, al revocar la familia completa, la siguiente petición del usuario legítimo recibirá `401 Unauthorized` forzándolo a iniciar sesión nuevamente. Esto previene que el atacante mantenga un acceso silencioso e invisible en el tiempo.

---

## 6. Gate — decide **Hecho** (solo el revisor)

**Estado:** aprobado  
**Conclusión:** Se verifica el cumplimiento riguroso de todos los criterios de aceptación (AC-1 a AC-5). El ciclo de renovación y mitigación de reúso de sesiones queda validado.  
**Trazabilidad final:** `feat(iss-14): feature refreshtokens, rotacion rtr y deteccion de reuso` · `Refs #14`
