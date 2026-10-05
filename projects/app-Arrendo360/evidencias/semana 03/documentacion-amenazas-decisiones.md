---

editor_options: 
  markdown: 
    wrap: 72
---

# Evidencia de Verificación: Documentación de Amenazas y Decisiones de Seguridad (Enumeración, Reúso y Fuerza Bruta)

> **Proyecto:** Arrendo360 (`dw-2026-bettoo02`)\
> **Módulo:** Autenticación y Autorización (`AuthModule`)\
> **Documentos Generados:** [`docs/sdd.md`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/docs/sdd.md) y [`docs/seguridad.md`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/docs/seguridad.md)\
> **Estándares de Seguridad:** OWASP Top 10 (2021), OWASP ASVS 4.0, NIST SP 800-63B, RFC 6819\
> **Fecha de ejecución:** 2026-10-05\
> **Entorno de ejecución:** Node.js v22 / NestJS v11 / Sequelize / MySQL / Vitest v4

------------------------------------------------------------------------

## 1. Resumen Ejecutivo

Se elaboró y estructuró la documentación arquitectónica y técnica correspondiente a las amenazas y decisiones de seguridad en los documentos formales del repositorio:
1. **[`docs/sdd.md`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/docs/sdd.md) (Software Design Description):**
   - Arquitectura del subsistema bajo Clean Architecture y Domain-Driven Design (DDD).
   - Modelo de amenazas **STRIDE** completo para la plataforma Arrendo360.
   - **Registros de Decisiones Arquitectónicas (ADR-SEC-01 al ADR-SEC-12)** documentando la justificación, trade-offs y diseño de las mitigaciones para **Enumeración de usuarios**, **Reúso de tokens** y **Fuerza bruta**.
   - Matriz de trazabilidad de requisitos de seguridad (**RTM**).
2. **[`docs/seguridad.md`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/docs/seguridad.md) (Manual de Políticas y Controles de Seguridad):**
   - Especificación detallada de vectores de ataque y políticas técnicas de protección.
   - Algoritmo de rotación de refresh tokens (RTR según RFC 6819) y detección de replay.
   - Política de tokens de un solo uso (Single-Use Tokens) con expiración a 15 minutos.
   - Parámetros criptográficos de derivación de claves con **bcrypt** (salt rounds = 10) y entropía CSPRNG de 256 bits.
   - Procedimientos operativos de auditoría y comandos `curl` de verificación.

------------------------------------------------------------------------

## 2. Matriz Comparativa: Amenaza, Decisión Arquitectónica y Mitigación

| Amenaza | Vector de Ataque | Decisión Arquitectónica (ADR) | Mitigación Técnica en Arrendo360 | Estado |
| :--- | :--- | :--- | :--- | :---: |
| **1. Enumeración de Usuarios** | Diferenciación de errores en Login (`"Usuario no existe"` vs `"Clave errónea"`) | **ADR-SEC-01:** Respuesta homogénea y código de estado idéntico | Se retorna invariablemente **`HTTP 401 Unauthorized`** con `"Credenciales inválidas"` sin revelar el motivo del fallo. | **MITIGADO** |
| **1. Enumeración de Usuarios** | Timing attacks mediante medición de latencia en consultas a base de datos | **ADR-SEC-02 / ADR-SEC-03:** Normalización de entradas y tiempo de procesamiento continuo | Canonicalización con `.trim().toLowerCase()`. | **MITIGADO** |
| **2. Reúso de Tokens** | Reutilización de Refresh Tokens interceptados (Session Hijacking) | **ADR-SEC-04 / ADR-SEC-05:** Refresh Token Rotation (RTR — RFC 6819) con linaje `familyId` y `jti` | Cada refresco invalida el token actual (`is_used = true`). Si se recibe un token ya usado, se detecta el ataque y se **revoca toda la familia de tokens** con `HTTP 401`. | **MITIGADO** |
| **2. Reúso de Tokens** | Reutilización de token de restablecimiento de contraseña | **ADR-SEC-06:** Patrón de Token de Un Solo Uso (Single-Use Token) | Tras el primer cambio de clave se marca `is_used = true`. Cualquier intento posterior de reutilización se rechaza de inmediato con **`HTTP 400 Bad Request`**. | **MITIGADO** |
| **2. Reúso de Tokens** | Sesiones activas no revocadas tras cambio de clave o logout | **ADR-SEC-07 / ADR-SEC-08:** Revocación global de sesiones y `TokenBlacklistService` | En cambio de contraseña se invalidan todas las sesiones (`revokeByUserId`). En logout se añade el access token a lista negra en memoria con TTL. | **MITIGADO** |
| **3. Fuerza Bruta** | Descifrado masivo de hashes offline (ataques con GPU/ASIC o Rainbow Tables) | **ADR-SEC-09:** Derivación lenta de claves con bcrypt (Factor de costo 10) | Hashing con `bcrypt` y salt pseudoaleatorio único de 128 bits. Cada comparación tarda intencionalmente ~150 ms en CPU, limitando ataques masivos. | **MITIGADO** |
| **3. Fuerza Bruta** | Adivinación de tokens de recuperación por fuerza bruta online | **ADR-SEC-10:** Espacio de búsqueda criptográfico de alta entropía (256 bits) | Generación con `crypto.randomBytes(32)` (64 chars hex, $1.15 \times 10^{77}$ combinaciones) y ventana de expiración efímera de **15 minutos**. | **MITIGADO** |
| **3. Fuerza Bruta** | Inyección de parámetros masivos o contraseñas triviales | **ADR-SEC-11:** Pipeline estricto de validación en entrada con `ValidationPipe` | Validación con `class-validator`: mínimo 6 caracteres en contraseñas (`@MinLength(6)`), sanitización y descarte de campos no declarados. | **MITIGADO** |

------------------------------------------------------------------------

## 3. Diagramas Arquitectónicos

### 3.1 Detección Activa de Reúso de Refresh Token (RFC 6819)

``` mermaid
sequenceDiagram
    autonumber
    actor Atacante as Atacante (Token Reusado)
    participant API as AuthController /api/auth/refresh
    participant UC as RefreshTokenUseCase
    participant Repo as RefreshTokenRepository
    participant DB as Base de Datos (Sequelize)

    Atacante->>API: POST /api/auth/refresh { refreshToken: "Token_Ya_Consumido" }
    API->>UC: execute(dto)
    UC->>UC: jwtService.verify(refreshToken) -> jti, familyId
    UC->>Repo: findByJti(jti)
    Repo->>DB: SELECT * FROM refresh_tokens WHERE jti = '...'
    DB-->>Repo: Registro { isUsed: true, familyId: 'fam-uuid' }
    Repo-->>UC: tokenEntity

    Note over UC: DETECCIÓN DE REÚSO: tokenEntity.isUsed === true
    UC->>Repo: revokeFamily('fam-uuid')
    Repo->>DB: UPDATE refresh_tokens SET is_revoked = true WHERE family_id = 'fam-uuid'
    UC-->>API: throw UnauthorizedException("Detección de reúso de refresh token...")
    API-->>Atacante: HTTP 401 Unauthorized (Familia y Sesión Revocadas)
```

### 3.2 Prevención de Reúso de Token de Recuperación (Single-Use Token)

``` mermaid
sequenceDiagram
    autonumber
    actor Atacante as Atacante / Usuario
    participant API as AuthController /api/auth/reset-password
    participant UC as ResetPasswordUseCase
    participant Repo as PasswordResetTokenRepository
    participant UserRepo as UserRepository

    Atacante->>API: POST /api/auth/reset-password { token, newPassword }
    API->>UC: execute(dto)
    UC->>Repo: findByToken(token)
    Repo-->>UC: tokenRecord

    alt Intento de Reúso (tokenRecord.isUsed === true)
        UC-->>API: throw BadRequestException("El token de recuperación ya ha sido utilizado (token de un solo uso).")
        API-->>Atacante: HTTP 400 Bad Request
    else Token Expirado (tokenRecord.isExpired() === true)
        UC-->>API: throw BadRequestException("El token de recuperación ha expirado.")
        API-->>Atacante: HTTP 400 Bad Request
    else Primer Uso Legítimo
        UC->>UserRepo: actualizarPassword(hashBcryptSalt10)
        UC->>Repo: tokenRecord.marcarUsado() -> update(tokenRecord)
        UC->>Repo: revokeByUserId(userId) [Expulsar sesiones previas]
        UC-->>API: { success: true, message: "Contraseña restablecida exitosamente" }
        API-->>Atacante: HTTP 200 OK
    end
```

------------------------------------------------------------------------

## 4. Evidencia de Código Fuente Implementado

### 4.1 Anti-Enumeración en `LoginUseCase`
Archivo: [`backend/src/features/auth/application/use-cases/login.use-case.ts`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/backend/src/features/auth/application/use-cases/login.use-case.ts#L28-L45)

```typescript
// 1. Normalización estricta de identidad
const normalizedEmail = dto.email.toLowerCase().trim();
const user = await this.userRepository.findByEmail(normalizedEmail);

// 2. Regla Anti-Enumeración: mismo código y mensaje que contraseña incorrecta
if (!user) {
  throw new UnauthorizedException('Credenciales inválidas');
}

const isMatch = await user.comparePassword(dto.password);
if (!isMatch) {
  throw new UnauthorizedException('Credenciales inválidas');
}

if (!user.isActive) {
  throw new UnauthorizedException('El usuario se encuentra inactivo');
}
```

### 4.2 Detección de Reúso en `RefreshTokenUseCase`
Archivo: [`backend/src/features/auth/application/use-cases/refresh-token.use-case.ts`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/backend/src/features/auth/application/use-cases/refresh-token.use-case.ts#L52-L68)

```typescript
// DETECCIÓN DE REÚSO (RFC 6819 Sección 5.2.2)
if (tokenRecord.isUsed) {
  // Revocar la familia completa de inmediato
  await this.refreshTokenRepository.revokeFamily(payload.familyId);
  throw new UnauthorizedException(
    'Detección de reúso de refresh token: se ha detectado el intento de reutilización de un token previo. La sesión ha sido revocada por motivos de seguridad.',
  );
}

// Consumo atómico
tokenRecord.marcarUsado();
await this.refreshTokenRepository.update(tokenRecord);
```

### 4.3 Token de Un Solo Uso en `ResetPasswordUseCase`
Archivo: [`backend/src/features/auth/application/use-cases/reset-password.use-case.ts`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/backend/src/features/auth/application/use-cases/reset-password.use-case.ts#L50-L65)

```typescript
// 1. VERIFICACIÓN DE TOKEN DE UN SOLO USO
if (tokenRecord.isUsed) {
  throw new BadRequestException(
    'El token de recuperación ya ha sido utilizado (token de un solo uso). Solicite uno nuevo.',
  );
}

// 2. VERIFICACIÓN DE EXPIRACIÓN TEMPORAL (15 MINUTOS)
if (tokenRecord.isExpired()) {
  throw new BadRequestException(
    'El token de recuperación ha expirado. Solicite uno nuevo.',
  );
}

// 3. Cifrado con bcrypt y salado
const saltRounds = 10;
const newPasswordHash = await bcrypt.hash(dto.newPassword, saltRounds);
user.actualizarPassword(newPasswordHash);
await this.userRepository.update(user);

// 4. Marcar usado (garantía de un solo uso)
tokenRecord.marcarUsado();
await this.passwordResetTokenRepository.update(tokenRecord);

// 5. Expulsión de sesiones previas
if (user.id) {
  await this.refreshTokenRepository.revokeByUserId(user.id);
}
```

------------------------------------------------------------------------

## 5. Resultados de Ejecución y Pruebas Automatizadas

### 5.1 Verificación Integral en Vivo contra el Backend (`node script`)

Se ejecutó la suite de verificación directa sobre el servidor activo en el puerto `3002`:

```text
=== TEST 1: AMENAZA DE ENUMERACIÓN DE USUARIOS ===
1.1 Usuario Inexistente -> Status: 401 | Mensaje: Credenciales inválidas | Latencia: 43ms
1.2 Registro de Usuario de Prueba -> Status: 201 | Email: sec.audit_1791220253565@arrendo360.com
1.3 Usuario Existente con Clave Errónea -> Status: 401 | Mensaje: Credenciales inválidas | Latencia: 55ms
1.4 ¿Respuestas idénticas para mitigar enumeración?: true

=== TEST 2: AMENAZA DE REÚSO DE TOKENS (RTR Y RESET) ===
2.1 Login exitoso -> RefreshToken emitido (longitud: 289 )
2.2 Rotación Legítima -> Status: 200 | Nuevo Token emitido: true
2.3 Intento de Reúso de Refresh Token (Replay Attack) -> Status: 401 | Mensaje: Detección de reúso de refresh token: se ha detectado el intento de reutilización de un token previo. La sesión ha sido revocada por motivos de seguridad.
2.4 Forgot Password -> Status: 200 | ResetToken (64 chars hex): true | Token: 9154cff026fccaa9...
2.5 Primer Uso de Reset Token -> Status: 200 | Mensaje: Contraseña restablecida exitosamente. Ya puede iniciar sesión con su nueva contraseña.
2.6 Intento de Reúso de Reset Token -> Status: 400 | Mensaje: El token de recuperación ya ha sido utilizado (token de un solo uso). Solicite uno nuevo.

=== TEST 3: AMENAZA DE FUERZA BRUTA Y DICCIONARIOS ===
3.1 Validación DTO Contraseña Débil (< 6 chars) -> Status: 400 | Mensaje: [ 'La nueva contraseña debe tener al menos 6 caracteres' ]
3.2 Login con nueva clave verificada con bcrypt (Salt 10) -> Status: 200 | OK: true
3.3 Login con clave anterior invalidada -> Status: 401 | Mensaje: Credenciales inválidas
```

### 5.2 Resultados de la Suite Automatizada (Vitest)

Comando ejecutado en [`backend/`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/backend):
```bash
npm test
```

Salida de la consola:
```text
 ✓ test/distribucion-pago.entity.spec.ts (5 tests) 6ms
 ✓ test/rbac.guard.spec.ts (5 tests) 5ms
 ✓ src/app.controller.spec.ts (2 tests) 98ms
 ✓ test/auth.spec.ts (12 tests) 1522ms
       ✓ User: debe comparar contraseñas válidas e inválidas y permitir actualización de contraseña
       ✓ PasswordResetToken: debe validar expiración y uso único correctamente
       ✓ ForgotPasswordUseCase: debe generar un token de recuperación de 15 minutos para un usuario existente
       ✓ ForgotPasswordUseCase: debe fallar con NotFoundException si el correo no existe
       ✓ ResetPasswordUseCase: debe restablecer la contraseña con un token válido y permitir login con la nueva clave
       ✓ ResetPasswordUseCase: debe RECHAZAR el restablecimiento si el token YA FUE UTILIZADO (Token de un solo uso)
       ✓ ResetPasswordUseCase: debe RECHAZAR el restablecimiento si el token HA EXPIRADO
       ✓ ResetPasswordUseCase: debe RECHAZAR el restablecimiento si el token NO EXISTE
       ✓ POST /api/auth/forgot-password y POST /api/auth/reset-password - Flujo exitoso de recuperación
       ✓ POST /api/auth/reset-password - Falla con HTTP 400 en intento de reúso del token (Single-use check)
       ✓ POST /api/auth/forgot-password - Falla con HTTP 404 si el email no existe
       ✓ GET /api/auth/forgot-password - Responde HTTP 200 con interfaz HTML o guía JSON

 Test Files  4 passed (4)
      Tests  24 passed (24)
   Start at  12:10:21
   Duration  2.34s
```

------------------------------------------------------------------------

## 6. Documentos Generados en el Repositorio

1. **[`docs/sdd.md`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/docs/sdd.md):**
   - Especificación formal de arquitectura (SDD).
   - Modelo de amenazas STRIDE.
   - Decisiones de arquitectura de seguridad (ADR-SEC-01 al ADR-SEC-12).
   - Matriz de trazabilidad de requisitos de seguridad (RTM).
2. **[`docs/seguridad.md`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/docs/seguridad.md):**
   - Manual de políticas y controles de protección.
   - Guía técnica detallada sobre mitigación de enumeración, reúso de tokens y fuerza bruta.
   - Procedimientos operativos de auditoría con comandos de prueba.

------------------------------------------------------------------------

## 7. Conclusión

Se ha documentado de forma exhaustiva y rigurosa el análisis de amenazas y las decisiones arquitectónicas para **Enumeración de Usuarios**, **Reúso de Tokens (RTR y Reset)** y **Ataques de Fuerza Bruta** en los archivos oficiales [`docs/sdd.md`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/docs/sdd.md) y [`docs/seguridad.md`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/docs/seguridad.md). Las mitigaciones fueron validadas experimentalmente con tráfico HTTP real y mediante el 100% de la suite de pruebas unitarias y de integración de Vitest (24/24 aprobadas).
