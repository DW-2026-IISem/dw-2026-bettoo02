# Evidencia de Verificación: Logout y Consulta de Perfil (/auth/me con Token Válido y Revocado)

> **Proyecto:** Arrendo360 (`dw-2026-bettoo02`)  
> **Módulo:** Autenticación y Autorización (`AuthModule`)  
> **Estándar de Seguridad:** RFC 6750 (Bearer Token Usage), RFC 6819 (OAuth 2.0 Threat Model & Token Revocation)  
> **Arquitectura:** Clean Architecture & DDD  
> **Fecha de ejecución:** 2026-10-05  
> **Entorno de ejecución:** Node.js v22 / NestJS v11 / Sequelize / MySQL / Vitest v4  

---

## 1. Resumen Ejecutivo

Se implementó y verificó de forma exhaustiva el flujo de **Cierre de Sesión Seguro (`POST /api/auth/logout`)** y la **Consulta de Perfil Protegida (`GET /api/auth/me`)**, garantizando el control del estado y ciclo de vida de los tokens de autenticación:

1. **Consulta Protegida (`GET /api/auth/me`):**
   - Requiere un JSON Web Token válido y firmado en el encabezado `Authorization: Bearer <accessToken>`.
   - Verifica la firma criptográfica, la vigencia temporal y el estado de revocación del token y de su sesión (`familyId`).
   - Retorna la información de identidad del usuario autenticado (`id`, `nombre`, `email`, `role`, `isActive`) con código `200 OK`.

2. **Cierre de Sesión Inmediato (`POST /api/auth/logout`):**
   - Invalida la sesión activa tanto en base de datos como en memoria.
   - Marca toda la familia de tokens en `refresh_tokens` con `is_revoked = true`.
   - Registra el identificador único del token de acceso (`jti`) en el servicio de lista negra (`TokenBlacklistService`), bloqueando de forma inmediata cualquier uso residual del token aunque no haya expirado cronológicamente.

3. **Protección Ante Token Revocado:**
   - Si un cliente intenta invocar `GET /api/auth/me` con un token correspondiente a una sesión que ya hizo logout, el servidor detecta su revocación y deniega el acceso con `HTTP 401 Unauthorized` (*"Token revocado o sesión finalizada. Inicie sesión nuevamente."*).
   - De igual manera, cualquier intento de rotar el refresh token de esa misma sesión mediante `POST /api/auth/refresh` es rechazado con `HTTP 401 Unauthorized` (*"El refresh token ha sido revocado"*).

4. **Cobertura de Pruebas:**
   - 24 pruebas unitarias y de integración HTTP en [`backend/test/auth.spec.ts`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/backend/test/auth.spec.ts).
   - 36 pruebas automáticas totales del proyecto aprobadas al 100% sin advertencias ni regresiones.

---

## 2. Especificación de Endpoints

| Método | Endpoint | Descripción | Encabezado Requerido | Códigos HTTP |
| :--- | :--- | :--- | :--- | :--- |
| `GET` | `/api/auth/me` | Obtiene el perfil del usuario autenticado | `Authorization: Bearer <accessToken>` | `200 OK`, `401 Unauthorized` |
| `POST` | `/api/auth/logout` | Cierra la sesión activa e invalida tokens | `Authorization: Bearer <accessToken>` (o body con tokens) | `200 OK`, `401 Unauthorized` |
| `POST` | `/api/auth/revoke` | Revoca la familia del refresh token | `Content-Type: application/json` | `200 OK`, `401 Unauthorized` |
| `GET` | `/api/auth/me` *(Navegador)* | Consola gráfica interactiva si `Accept: text/html` | Ninguno (detecta browser) | `200 OK` |

---

## 3. Diagrama de Secuencia del Flujo Verificado

```mermaid
sequenceDiagram
    autonumber
    actor Cliente as Cliente / Navegador
    participant API as NestJS Backend (AuthController)
    participant MeUC as GetMeUseCase
    participant LogoutUC as LogoutUseCase
    participant Blacklist as TokenBlacklistService
    participant DB as MySQL (refresh_tokens & usuarios)

    Note over Cliente,DB: Paso 1: Autenticación y obtención de tokens
    Cliente->>API: POST /api/auth/login (credenciales válidas)
    API->>DB: Validar contraseña (bcrypt) y crear registro en refresh_tokens
    API-->>Cliente: HTTP 200 OK (accessToken con jti & familyId, refreshToken)

    Note over Cliente,DB: Paso 2: Consulta de perfil con Token Válido
    Cliente->>API: GET /api/auth/me (Authorization: Bearer <accessToken>)
    API->>MeUC: execute(token)
    MeUC->>Blacklist: isRevoked(jti / token)? -> NO
    MeUC->>DB: isFamilyRevoked(familyId)? -> NO
    MeUC->>DB: findById(userId) -> Usuario Activo
    MeUC-->>API: UserProfile
    API-->>Cliente: HTTP 200 OK { id, nombre, email, role: 'ADMIN', isActive: true }

    Note over Cliente,DB: Paso 3: Cierre de Sesión (Logout)
    Cliente->>API: POST /api/auth/logout (Authorization: Bearer <accessToken>)
    API->>LogoutUC: execute(accessToken, refreshToken)
    LogoutUC->>Blacklist: revoke(jti) & revoke(token)
    LogoutUC->>DB: revokeFamily(familyId) -> UPDATE refresh_tokens SET is_revoked = 1
    LogoutUC-->>API: { message: "Sesión cerrada...", revoked: true }
    API-->>Cliente: HTTP 200 OK { revoked: true }

    Note over Cliente,DB: Paso 4: Intento de consulta /auth/me con Token Revocado
    Cliente->>API: GET /api/auth/me (Authorization: Bearer <accessToken_revocado>)
    API->>MeUC: execute(token)
    MeUC->>Blacklist: isRevoked(jti)? -> SÍ (REVOCADO)
    MeUC-->>API: UnauthorizedException
    API-->>Cliente: HTTP 401 Unauthorized ("Token revocado o sesión finalizada")

    Note over Cliente,DB: Paso 5: Intento de refresco con Refresh Token Revocado
    Cliente->>API: POST /api/auth/refresh ({ refreshToken })
    API->>DB: findByJti() -> isRevoked === true
    API-->>Cliente: HTTP 401 Unauthorized ("El refresh token ha sido revocado")
```

---

## 4. Matriz de Casos de Prueba Verificados con Tráfico Real

### Caso 1: Consulta de Perfil Exitosa con Token Válido (HTTP 200)

- **Escenario:** El usuario envía su token de acceso JWT legítimo en el encabezado `Authorization: Bearer <token>`.
- **Petición HTTP:**
  ```http
  GET /api/auth/me HTTP/1.1
  Host: localhost:3002
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjYsImVtYWlsIjoidmVyaWYubWUubG9ndXRAYXJyZW5kbzM2MC5jb20iLCJub21icmUiOiJQcnVlYmEgVmVyaWZpY2FjaW9uIiwicm9sZSI6IkFETUlOIiwidHlwZSI6ImFjY2VzcyIsImp0aSI6ImVkYWY1YzkzLTA5MDUtNDc0YS05MmE4LTYxMDBiZmUxZmFmNCIsImZhbWlseUlkIjoiZDU0YTkwZjQtYmIzZS00NGFhLTgxOWMtYTkwYTRiZjUxMTZiIiwiaWF0IjoxNzkxMTk5OTg4LCJleHAiOjE3OTEyMDM1ODh9.Z5p0jA...
  Accept: application/json
  ```
- **Respuesta Obtenida:** `HTTP/1.1 200 OK`
  ```json
  {
    "statusCode": 200,
    "message": "Operación exitosa",
    "data": {
      "id": 6,
      "nombre": "Prueba Verificacion",
      "email": "verif.me.logout@arrendo360.com",
      "role": "ADMIN",
      "isActive": true
    },
    "timestamp": "2026-10-05T11:53:08.426Z"
  }
  ```
- **Resultado:** **Aprobado (PASS)**. Devuelve el perfil completo del usuario sin exponer el password hash.

---

### Caso 2: Rechazo por Ausencia de Token en la Petición (HTTP 401)

- **Escenario:** El cliente intenta consultar `/api/auth/me` sin adjuntar el encabezado `Authorization`.
- **Petición HTTP:**
  ```http
  GET /api/auth/me HTTP/1.1
  Host: localhost:3002
  Accept: application/json
  ```
- **Respuesta Obtenida:** `HTTP/1.1 401 Unauthorized`
  ```json
  {
    "statusCode": 401,
    "message": "Token de autenticación no proporcionado. Proporcione el header Authorization: Bearer <token>",
    "timestamp": "2026-10-05T11:53:08.431Z",
    "path": "/api/auth/me"
  }
  ```
- **Resultado:** **Aprobado (PASS)**. El guard y caso de uso interceptan la solicitud y solicitan credenciales.

---

### Caso 3: Rechazo por Token Falsificado o Corrupto (HTTP 401)

- **Escenario:** El cliente envía una cadena que no corresponde a una firma válida del secreto de la aplicación.
- **Petición HTTP:**
  ```http
  GET /api/auth/me HTTP/1.1
  Host: localhost:3002
  Authorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.falso.invalido
  Accept: application/json
  ```
- **Respuesta Obtenida:** `HTTP/1.1 401 Unauthorized`
  ```json
  {
    "statusCode": 401,
    "message": "Token de acceso inválido o expirado",
    "timestamp": "2026-10-05T11:53:08.435Z",
    "path": "/api/auth/me"
  }
  ```
- **Resultado:** **Aprobado (PASS)**. Falla la verificación de firma criptográfica de JwtService.

---

### Caso 4: Cierre de Sesión Exitoso y Revocación (HTTP 200)

- **Escenario:** El cliente decide cerrar sesión y envía `POST /api/auth/logout` con el token de acceso en el header `Authorization` y el refresh token en el body.
- **Petición HTTP:**
  ```http
  POST /api/auth/logout HTTP/1.1
  Host: localhost:3002
  Authorization: Bearer <accessToken_valido>
  Content-Type: application/json

  {
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjYsImp0aSI6IjgxOGNmYWY4LTgzNmUtNDFlNS1hZGRmLTQ0MmQxMTVkMjM2NiIsImZhbWlseUlkIjoiZDU0YTkwZjQtYmIzZS00NGFhLTgxOWMtYTkwYTRiZjUxMTZiIiwidHlwZSI6InJlZnJlc2giLCJpYXQiOjE3OTExOTk5ODgsImV4cCI6MTc5MTgwNDc4OH0.L1rR_x..."
  }
  ```
- **Respuesta Obtenida:** `HTTP/1.1 200 OK`
  ```json
  {
    "statusCode": 200,
    "message": "Operación exitosa",
    "data": {
      "message": "Sesión cerrada y tokens revocados exitosamente",
      "revoked": true
    },
    "timestamp": "2026-10-05T11:53:08.523Z"
  }
  ```
- **Resultado:** **Aprobado (PASS)**. Se revoca la familia en MySQL (`refresh_tokens.is_revoked = 1`) y se agrega el `jti` a `TokenBlacklistService`.

---

### Caso 5: Consulta de /auth/me con Token Revocado tras Logout (HTTP 401)

- **Escenario:** El cliente intenta reutilizar el `accessToken` inmediatamente después de haber ejecutado el logout.
- **Petición HTTP:**
  ```http
  GET /api/auth/me HTTP/1.1
  Host: localhost:3002
  Authorization: Bearer <mismo_accessToken_previo_al_logout>
  Accept: application/json
  ```
- **Respuesta Obtenida:** `HTTP/1.1 401 Unauthorized`
  ```json
  {
    "statusCode": 401,
    "message": "Token revocado o sesión finalizada. Inicie sesión nuevamente.",
    "timestamp": "2026-10-05T11:53:08.528Z",
    "path": "/api/auth/me"
  }
  ```
- **Resultado:** **Aprobado (PASS)**. El sistema deniega el acceso reconociendo el token como revocado, impidiendo su explotación aun dentro de la ventana de vida del token (1h).

---

### Caso 6: Intento de Refresco con Refresh Token de Sesión Revocada (HTTP 401)

- **Escenario:** Un cliente intenta rotar el `refreshToken` de la sesión cerrada.
- **Petición HTTP:**
  ```http
  POST /api/auth/refresh HTTP/1.1
  Host: localhost:3002
  Content-Type: application/json

  {
    "refreshToken": "<mismo_refreshToken_previo_al_logout>"
  }
  ```
- **Respuesta Obtenida:** `HTTP/1.1 401 Unauthorized`
  ```json
  {
    "statusCode": 401,
    "message": "El refresh token ha sido revocado",
    "timestamp": "2026-10-05T11:53:08.536Z",
    "path": "/api/auth/refresh"
  }
  ```
- **Resultado:** **Aprobado (PASS)**. La familia completa quedó invalidada en base de datos.

---

### Caso 7: Consola Interactiva Web para Navegadores (HTTP 200 HTML)

- **Escenario:** Un desarrollador o usuario abre en Google Chrome / Firefox la dirección `http://localhost:3002/api/auth/me`.
- **Petición HTTP:**
  ```http
  GET /api/auth/me HTTP/1.1
  Host: localhost:3002
  Accept: text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8
  ```
- **Respuesta Obtenida:** `HTTP/1.1 200 OK`
  - `Content-Type: text/html; charset=utf-8`
  - Contenido: Consola gráfica con pestañas (Registro, Login, Refresh RTR y **Mi Perfil & Logout**).
- **Resultado:** **Aprobado (PASS)**. Permite probar de manera visual e interactiva sin necesidad de herramientas de terceros.

---

## 5. Guía de Reproducción de los Pasos

### Opción A: Desde el Navegador Web (Modo Visual)

1. Abrir en el navegador: **[http://localhost:3002/api/auth/register](http://localhost:3002/api/auth/register)** o **[http://localhost:3002/api/auth/me](http://localhost:3002/api/auth/me)**.
2. En la pestaña **🔐 Login**, pulsar **"Iniciar Sesión"**. El sistema guardará automáticamente tu `accessToken` y `refreshToken` en memoria.
3. Cambiar a la pestaña **👤 Mi Perfil & Logout**:
   - **Paso Válido:** Clic en **"👤 Consultar /auth/me (Válido)"**. Verás la respuesta verde **`200 OK`** con tu perfil.
   - **Paso Logout:** Clic en **"🚪 Cerrar Sesión (Logout)"**. Verás la respuesta verde **`200 OK`** indicando revocación exitosa.
   - **Paso Revocado:** Clic en **"🚫 Probar con Token Revocado"**. Verás la alerta roja **`401 Unauthorized`** indicando *"Token revocado o sesión finalizada. Inicie sesión nuevamente."*
   - **Paso Sin Token:** Clic en **"⚠️ Probar Sin Token"**. Verás la alerta roja **`401 Unauthorized`** indicando *"Token de autenticación no proporcionado"*.

---

### Opción B: Mediante Comandos `curl` desde la Terminal

```bash
# 1. Login y obtención del accessToken
LOGIN_RES=$(curl -s -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"betto@arrendo360.com","password":"PasswordSegura2026*"}')
ACCESS_TOKEN=$(echo $LOGIN_RES | grep -o '"accessToken":"[^"]*' | cut -d'"' -f4)

# 2. Consultar perfil con token válido (Respuesta: HTTP 200)
curl -i -X GET http://localhost:3002/api/auth/me \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# 3. Cerrar sesión / Logout (Respuesta: HTTP 200)
curl -i -X POST http://localhost:3002/api/auth/logout \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# 4. Consultar perfil con token revocado (Respuesta: HTTP 401)
curl -i -X GET http://localhost:3002/api/auth/me \
  -H "Authorization: Bearer $ACCESS_TOKEN"

# 5. Consultar perfil sin header Authorization (Respuesta: HTTP 401)
curl -i -X GET http://localhost:3002/api/auth/me
```

---

## 6. Resultados de la Suite de Pruebas Automatizadas (Vitest)

Al ejecutar `npm test` en el proyecto se obtiene:

```text
 RUN  v4.1.11 /home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/backend

 ✓ test/distribucion-pago.entity.spec.ts (5 tests)
 ✓ test/rbac.guard.spec.ts (5 tests)
 ✓ src/app.controller.spec.ts (2 tests)
 ✓ test/auth.spec.ts (24 tests)
       ✓ User: debe comparar contraseñas válidas e inválidas correctamente con bcrypt
       ✓ User: debe permitir desactivar al usuario
       ✓ RefreshToken: debe validar expiración y rotación correctamente
       ✓ Register: debe registrar un usuario exitosamente con credenciales válidas y devolver tokens
       ✓ Register: debe rechazar el registro con HTTP 409 si el correo electrónico ya existe
       ✓ Login: debe autenticar exitosamente con credenciales válidas y devolver accessToken y refreshToken
       ✓ Login: debe rechazar el login con HTTP 401 si el correo no existe
       ✓ Login: debe rechazar el login con HTTP 401 si la contraseña es incorrecta
       ✓ Login: debe rechazar el login con HTTP 401 si el usuario está inactivo
       ✓ RTR: debe rotar el refresh token legítimamente entregando nuevos tokens
       ✓ RTR: debe detectar reúso de refresh token y revocar la familia con HTTP 401
       ✓ GetMe: debe devolver el perfil del usuario autenticado con un token válido
       ✓ GetMe: debe rechazar con HTTP 401 si no se envía token
       ✓ GetMe: debe rechazar con HTTP 401 si el token es corrupto o inválido
       ✓ Logout & GetMe: el token debe quedar revocado tras el logout
       ✓ POST /api/auth/register - Debe registrar exitosamente y emitir tokens (HTTP 201)
       ✓ POST /api/auth/login - Debe iniciar sesión exitosamente con credenciales válidas (HTTP 200)
       ✓ GET /api/auth/me - Debe devolver el perfil con token Bearer válido (HTTP 200)
       ✓ GET /api/auth/me - Debe fallar con HTTP 401 si no se envía header Authorization
       ✓ GET /api/auth/me - Debe fallar con HTTP 401 si el token es inválido o corrupto
       ✓ POST /api/auth/logout y GET /api/auth/me - El token revocado debe ser rechazado en /auth/me con HTTP 401
       ✓ POST /api/auth/refresh - Debe rotar token con HTTP 200 y fallar en intento de reúso con HTTP 401
       ✓ GET /api/auth/register - Debe responder HTTP 200 con guía JSON si el cliente solicita application/json
       ✓ GET /api/auth/register - Debe responder HTTP 200 con interfaz HTML si el cliente es navegador

 Test Files  4 passed (4)
      Tests  36 passed (36)
   Start at  06:50:24
   Duration  5.13s
```

---

## 7. Conclusión

El módulo de autenticación de **Arrendo360** cumple plenamente con los estándares de la industria para autenticación basada en tokens (JWT y RTR), soportando:
- Registro y login seguro con contraseñas hash (bcrypt).
- Emisión dual de tokens (`accessToken` y `refreshToken`).
- Rotación continua (RTR) y mitigación proactiva contra robo de tokens (RFC 6819).
- Endpoint protegido `GET /api/auth/me` con validación rigurosa de vigencia y revocación.
- Cierre de sesión seguro `POST /api/auth/logout` con bloqueo inmediato de tokens tanto en capa de aplicación como en persistencia.
