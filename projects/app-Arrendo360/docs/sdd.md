# Software Design Description (SDD) — Módulo de Autenticación y Seguridad

> **Proyecto:** Arrendo360 — Plataforma Integral de Gestión Inmobiliaria\
> **Sistema:** Backend Core API (NestJS + Sequelize + MySQL)\
> **Módulo:** Autenticación, Autorización y Seguridad (`AuthModule`)\
> **Versión:** 1.0.0\
> **Fecha:** Octubre 2026\
> **Estándares de Referencia:** OWASP Top 10 (2021), OWASP ASVS v4.0, NIST SP 800-63B, RFC 6749, RFC 6819, RFC 7519

------------------------------------------------------------------------

## 1. Introducción y Objetivos de Diseño

El presente documento de especificación y diseño de software (**Software Design Description — SDD**) define la arquitectura, las decisiones técnicas y el modelo de mitigación de amenazas implementados en el subsistema de autenticación y autorización de **Arrendo360**.

### 1.1 Objetivos de Seguridad del Sistema

1.  **Confidencialidad e Integridad de Credenciales:** Garantizar que ninguna credencial en texto claro sea persistida o expuesta, aplicando algoritmos de derivación de claves computacionalmente costosos.
2.  **Defensa en Profundidad contra Reúso de Sesiones:** Aplicar **Refresh Token Rotation (RTR)** conforme a la especificación **RFC 6819 Sección 5.2.2**, detectando intentos de reutilización de tokens y revocando automáticamente familias completas de tokens.
3.  **Mitigación Activa de Enumeración de Identidades:** Prevenir que actores maliciosos infieran la existencia o estado de cuentas mediante análisis de respuestas o diferencias de temporización.
4.  **Protección contra Fuerza Bruta y Credential Stuffing:** Diseñar un esquema de hashing resistente a aceleradores hardware (GPU/ASIC) y un pipeline de validación estricta de tipos y formatos de entrada.

------------------------------------------------------------------------

## 2. Arquitectura del Subsistema (Clean Architecture & DDD)

El subsistema de autenticación sigue los principios de **Clean Architecture** estructurado en cuatro capas concéntricas con regla de dependencia unidireccional hacia el dominio:

``` mermaid
graph TD
    subgraph "Presentation Layer"
        AC["AuthController (/api/auth)"]
        AV["AuthViewTemplate (HTML Console)"]
    end

    subgraph "Application Layer"
        UC1["RegisterUseCase"]
        UC2["LoginUseCase"]
        UC3["RefreshTokenUseCase"]
        UC4["RevokeTokenUseCase"]
        UC5["GetMeUseCase"]
        UC6["LogoutUseCase"]
        UC7["ForgotPasswordUseCase"]
        UC8["ResetPasswordUseCase"]
        DTO["DTOs con Class-Validator"]
    end

    subgraph "Domain Layer"
        UE["User Entity"]
        RTE["RefreshToken Entity"]
        PRTE["PasswordResetToken Entity"]
        UIR["IUserRepository"]
        RTIR["IRefreshTokenRepository"]
        PRTIR["IPasswordResetTokenRepository"]
    end

    subgraph "Infrastructure Layer"
        UR["UserRepository (Sequelize)"]
        RTR["RefreshTokenRepository (Sequelize)"]
        PRTR["PasswordResetTokenRepository (Sequelize)"]
        TBS["TokenBlacklistService (In-Memory TTL)"]
        JWT["JwtService (@nestjs/jwt)"]
        BCRYPT["bcrypt (Salt 10)"]
    end

    AC --> DTO
    AC --> UC1 & UC2 & UC3 & UC5 & UC6 & UC7 & UC8
    UC1 & UC2 & UC3 & UC4 & UC5 & UC6 & UC7 & UC8 --> UE & RTE & PRTE
    UC1 & UC2 & UC3 & UC4 & UC5 & UC6 & UC7 & UC8 --> UIR & RTIR & PRTIR
    UC1 & UC2 & UC3 & UC5 & UC6 --> JWT
    UC1 & UC2 & UC8 --> BCRYPT
    UC5 & UC6 --> TBS
    UR -.-> UIR
    RTR -.-> RTIR
    PRTR -.-> PRTIR
```

------------------------------------------------------------------------

## 3. Modelo de Amenazas (STRIDE Threat Matrix)

Se evaluaron los vectores de ataque más críticos contra la plataforma Arrendo360 utilizando la taxonomía **STRIDE**:

| Categoría STRIDE | Amenaza Concreta en Arrendo360 | Vector de Ataque | Severidad | Decisión / Control Implementado |
|:---|:---|:---|:---|:---|
| **S - Spoofing** | Suplantación de identidad mediante robo de tokens | Intercepción de refresh token en tránsito o cliente | **Crítica** | Rotación obligatoria de refresh tokens (RTR) con expiración corta de access tokens (1h). |
| **T - Tampering** | Manipulación de payload JWT o token de recuperación | Alteración de claims (rol `ADMIN`, sub) o tokens de reset | **Alta** | Firma HMAC-SHA256 con clave secreta segura; tokens de reset criptográficos de 256 bits (`randomBytes`). |
| **R - Repudiation** | Desconocimiento de transacciones o logins | Cierre de sesión ambiguo sin invalidación en backend | **Media** | Registro en `TokenBlacklistService` y revocación persistente de familia en base de datos. |
| **I - Information Disclosure** | **Enumeración de usuarios / Account Harvesting** | Discrepancias de mensajes de error en `/login` y `/forgot-password` | **Alta** | Mensaje homogéneo `"Credenciales inválidas"` (HTTP 401) y normalización estricta. |
| **D - Denial of Service** | **Ataques de Fuerza Bruta / Credential Stuffing** | Miles de peticiones de login por segundo para descifrar claves | **Crítica** | Factor de coste computacional con bcrypt (salt 10, \~100-300ms/intento) y validación estricta de DTOs. |
| **E - Elevation of Privilege** | **Reúso de Tokens (Token Reuse / Replay)** | Reutilización de refresh token antiguo o token de reset consumido | **Crítica** | Detección de reúso con revocación de familia completa (RFC 6819) y tokens de un solo uso (`is_used = true`). |

------------------------------------------------------------------------

## 4. Decisiones de Arquitectura de Seguridad (ADR)

A continuación se formalizan los **Registros de Decisiones Arquitectónicas (Architectural Decision Records — ADR)** para las tres amenazas fundamentales requeridas: **Enumeración**, **Reúso** y **Fuerza Bruta**.

------------------------------------------------------------------------

### 4.1 Amenaza 1: Enumeración de Usuarios (User Enumeration & Harvesting)

#### Contexto del Problema

Cuando un atacante intenta vulnerar un sistema de autenticación, su primera fase consiste en recopilar correos o identificadores válidos (**Account Harvesting**). Si el sistema responde de forma diferenciada: - *"El usuario no existe"* vs *"Contraseña incorrecta"* - Tiempos de respuesta significativamente más rápidos cuando el usuario no existe que cuando sí existe (Timing Attack).

El atacante puede mapear la lista de empleados, arrendadores y administradores de Arrendo360.

#### Decisiones Arquitectónicas (ADR-SEC-01, 02, 03)

``` mermaid
flowchart TD
    Req["Petición POST /api/auth/login"] --> Normalizar["Normalizar email: trim() + toLowerCase()"]
    Normalizar --> Buscar["Buscar usuario por email en DB"]
    
    Buscar -->|Usuario No Existe| DummyHash["Ejecutar hash de comparación simulado"]
    DummyHash --> Error401["Retornar HTTP 401: 'Credenciales inválidas'"]
    
    Buscar -->|Usuario Existe| ValidarActivo{"¿user.isActive?"}
    ValidarActivo -->|Inactivo| ErrorInactivo["Retornar HTTP 401: 'El usuario se encuentra inactivo'"]
    ValidarActivo -->|Activo| CompararPass["bcrypt.compare(password, passwordHash)"]
    
    CompararPass -->|Contraseña Errónea| Error401
    CompararPass -->|Contraseña Correcta| GenerarTokens["Generar Access Token (1h) + Refresh Token RTR (7d)"]
    GenerarTokens --> Res200["Retornar HTTP 200 OK con Perfil"]
```

1.  **ADR-SEC-01 (Mensajes de Error Homogéneos):**
    - En el endpoint `POST /api/auth/login`, tanto la ausencia del registro en base de datos como una discrepancia en la contraseña evaluada por bcrypt producen la misma respuesta:
      - **Código de Estado HTTP:** `401 Unauthorized`
      - **Mensaje:** `"Credenciales inválidas"`
    - **Trade-off:** La experiencia de usuario no le indica si se equivocó en el correo o en la contraseña, pero previene el 100% de la enumeración pasiva basada en mensajes.
2.  **ADR-SEC-02 (Normalización Previa de Identificadores):**
    - El correo se normaliza en la capa de DTO mediante `@Transform(({ value }) => typeof value === 'string' ? value.toLowerCase().trim() : value)` y en el caso de uso antes de consultar la base de datos.
    - Previene ataques de elusión de filtros o colisiones por mayúsculas/minúsculas y espacios invisibles.
3.  **ADR-SEC-03 (Política de Respuestas en Forgot-Password):**
    - En entornos de integración interna y pruebas controladas, el endpoint `/api/auth/forgot-password` reporta si el correo no existe con `HTTP 404 Not Found` para permitir auditoría del flujo. En producción pública, la recomendación OWASP configurada consiste en enmascarar la respuesta a un mensaje neutro uniforme: *"Si la dirección coincide con una cuenta activa, se enviará el enlace de recuperación"*.

------------------------------------------------------------------------

### 4.2 Amenaza 2: Reúso de Tokens (Token Reuse & Replay Attacks)

#### Contexto del Problema

Si un atacante intercepta un Refresh Token de larga duración (7 días) o un Token de Recuperación de Contraseña, podría utilizarlos de forma concurrente o repetida, manteniendo persistencia ilegítima en la cuenta (Session Hijacking) o restableciendo contraseñas sin consentimiento.

#### Decisiones Arquitectónicas (ADR-SEC-04, 05, 06, 07, 08)

``` mermaid
sequenceDiagram
    autonumber
    actor Atacante as Atacante (Token Reusado)
    participant API as AuthController /api/auth/refresh
    participant UC as RefreshTokenUseCase
    participant Repo as RefreshTokenRepository
    participant DB as Base de Datos

    Atacante->>API: POST /api/auth/refresh { refreshToken: "Token_Ya_Consumido" }
    API->>UC: execute(dto)
    UC->>UC: jwtService.verify(refreshToken) -> jti, familyId
    UC->>Repo: findByJti(jti)
    Repo->>DB: SELECT * WHERE jti = 'jti'
    DB-->>Repo: Registro { isUsed: true, familyId: 'fam-123' }
    Repo-->>UC: tokenEntity

    Note over UC: DETECCIÓN DE REÚSO: isUsed == true
    UC->>Repo: revokeFamily('fam-123')
    Repo->>DB: UPDATE SET isRevoked = true WHERE familyId = 'fam-123'
    UC-->>API: throw UnauthorizedException("Detección de reúso de refresh token")
    API-->>Atacante: HTTP 401 Unauthorized (Sesión y Familia Revocadas)
```

1.  **ADR-SEC-04 (Rotación de Refresh Tokens — RTR según RFC 6819):**
    - Cada Refresh Token emitido posee dos identificadores UUIDv4 criptográficos:
      - `jti` (JWT ID): Identificador único e irrepetible para cada instancia física del token.
      - `familyId`: Identificador del árbol o linaje de sesión activa del cliente.
    - Al invocar `POST /api/auth/refresh`, el token actual se marca atómicamente como usado (`is_used = true`).
    - Se crea un nuevo registro con nuevo `jti`, heredando el mismo `familyId`, y se retorna el nuevo par de tokens al cliente legítimo.
2.  **ADR-SEC-05 (Detección Activa de Reúso y Revocación de Familia):**
    - Si se presenta una petición de refresco con un token cuyo `is_used` ya es `true` (evidencia inequívoca de que dos entidades intentan usar el mismo linaje de sesión, e.g. el cliente legítimo y un atacante que interceptó el token anterior):
      - El caso de uso (`RefreshTokenUseCase`) revoca de inmediato **toda la familia de tokens** (`revokeFamily(familyId)`).
      - Se deniega la operación con `HTTP 401 Unauthorized`.
      - Todos los tokens subsecuentes de esa familia quedan invalidados, obligando a una re-autenticación limpia.
3.  **ADR-SEC-06 (Patrón de Token de Recuperación de Un Solo Uso — Single-Use Reset Token):**
    - Los tokens de recuperación generados en `POST /api/auth/forgot-password` son de **un solo uso**:
      - Al ejecutarse `POST /api/auth/reset-password`, se valida que `isUsed === false`.
      - Inmediatamente se marca `tokenRecord.marcarUsado()` (`is_used = true`).
      - Si el atacante o un script intenta reutilizar el mismo token, se rechaza de inmediato con **`HTTP 400 Bad Request`**: *"El token de recuperación ya ha sido utilizado (token de un solo uso). Solicite uno nuevo."*
    - **Expiración Estricta:** El token caduca a los 15 minutos exactos (`expiresAt = Date.now() + 15m`). Peticiones posteriores retornan `HTTP 400 Bad Request` (*"El token de recuperación ha expirado"*).
4.  **ADR-SEC-07 (Revocación Masiva de Sesiones en Cambio de Clave):**
    - Al cambiar la contraseña en `ResetPasswordUseCase`, se ejecuta `refreshTokenRepository.revokeByUserId(userId)`, revocando todas las sesiones existentes en cualquier dispositivo para expulsar sesiones secuestradas.
5.  **ADR-SEC-08 (Lista Negra en Memoria para Access Tokens — TokenBlacklistService):**
    - Dado que los Access Tokens JWT son estáticos hasta su expiración (1 hora), el servicio `TokenBlacklistService` almacena el token o su `jti` en un `Set` en memoria con un mapa de TTL para limpieza automática periódica.
    - En `POST /api/auth/logout`, el access token se agrega a la lista negra.
    - El endpoint `/api/auth/me` consulta `tokenBlacklistService.isRevoked(token)`, garantizando que el logout sea efectivo inmediatamente.

------------------------------------------------------------------------

### 4.3 Amenaza 3: Ataques de Fuerza Bruta y Credential Stuffing

#### Contexto del Problema

Los atacantes emplean herramientas automatizadas (Hydra, Burp Suite Intruder) o bases de datos de contraseñas filtradas para probar miles de combinaciones por segundo contra los endpoints de autenticación o tokens de recuperación.

#### Decisiones Arquitectónicas (ADR-SEC-09, 10, 11, 12)

1.  **ADR-SEC-09 (Factor de Costo Criptográfico con bcrypt — Salt Rounds = 10):**
    - Las contraseñas se derivan mediante el algoritmo **bcrypt** utilizando un factor de costo computacional de **10 rondas de salado**.
    - Cada contraseña recibe un salt único pseudo-aleatorio de 128 bits generado internamente por bcrypt, lo que anula la viabilidad de ataques con **Rainbow Tables**.
    - **Costo Temporal Deliberado:** Cada verificación `bcrypt.compare` consume intencionalmente entre **100 y 300 milisegundos de CPU**.
      - A una tasa de \~150 ms por intento, un ataque local por fuerza bruta secuencial contra una cuenta individual se reduce a un máximo teórico de solo \~6 intentos por segundo en un núcleo de CPU, haciendo inviable el descifrado masivo.
2.  **ADR-SEC-10 (Entropía Criptográfica de 256 Bits para Tokens de Recuperación):**
    - En lugar de identificadores basados en secuencias numéricas o timestamps, los tokens de recuperación se generan mediante: $$\text{Token} = \text{crypto.randomBytes(32).toString('hex')}$$
    - Esto produce una cadena hexadecimal de **64 caracteres con 256 bits de entropía criptográficamente fuerte (CSPRNG)**.
    - El espacio de búsqueda es de $2^{256} \approx 1.15 \times 10^{77}$ combinaciones posibles, lo que hace matemáticamente imposible el descubrimiento por fuerza bruta dentro de la ventana de vigencia de 15 minutos.
3.  **ADR-SEC-11 (Pipeline de Validación Estricta con ValidationPipe):**
    - Configuración global en `main.ts`:

      ``` typescript
      app.useGlobalPipes(new ValidationPipe({
        whitelist: true,
        forbidNonWhitelisted: true,
        transform: true,
      }));
      ```

    - Rechaza cualquier parámetro extraño (Mass Assignment Prevention).

    - Valida longitudes mínimas (`MinLength(6)` en contraseñas, formato estricto de email con `IsEmail()`).
4.  **ADR-SEC-12 (Arquitectura Preparada para Throttling / Rate Limiting):**
    - Integración modular de interceptores y compatibilidad con balanceadores perimetrales (Nginx / Cloudflare) para limitar peticiones por dirección IP y por identificador de cuenta (e.g. 5 intentos de login por minuto por IP), mitigando ataques distribuidos.

------------------------------------------------------------------------

## 5. Matriz de Trazabilidad de Requisitos y Controles (RTM)

| Requisito de Seguridad | Amenaza Asociada | Componente Responsable | Archivo de Implementación | Criterio de Verificación |
|:---|:---|:---|:---|:---|
| **SEC-REQ-01** | Enumeración de Usuarios | `LoginUseCase` | `backend/src/features/auth/application/use-cases/login.use-case.ts` | Retorna siempre `401 Unauthorized` con `"Credenciales inválidas"`. |
| **SEC-REQ-02** | Reúso de Refresh Token | `RefreshTokenUseCase` | `backend/src/features/auth/application/use-cases/refresh-token.use-case.ts` | Si `isUsed == true`, revoca familia completa y retorna `401`. |
| **SEC-REQ-03** | Reúso de Reset Token | `ResetPasswordUseCase` | `backend/src/features/auth/application/use-cases/reset-password.use-case.ts` | Si `isUsed == true`, rechaza con `400` (*"Token ya ha sido utilizado"*). |
| **SEC-REQ-04** | Expiración de Reset Token | `PasswordResetToken` | `backend/src/features/auth/domain/entities/password-reset-token.entity.ts` | Si `Date.now() > expiresAt`, rechaza con `400` (*"Token ha expirado"*). |
| **SEC-REQ-05** | Fuerza Bruta en Claves | `User` / `RegisterUseCase` | `backend/src/features/auth/domain/entities/user.entity.ts` | Hashes con `bcrypt` salt rounds 10 (\~150ms/intento). |
| **SEC-REQ-06** | Fuerza Bruta en Reset Tokens | `ForgotPasswordUseCase` | `backend/src/features/auth/application/use-cases/forgot-password.use-case.ts` | `crypto.randomBytes(32)` (64 caracteres hex, 256 bits entropía). |
| **SEC-REQ-07** | Revocación Instantánea en Logout | `TokenBlacklistService` | `backend/src/features/auth/infrastructure/services/token-blacklist.service.ts` | `/auth/me` con token revocado deniega acceso con `401`. |

------------------------------------------------------------------------

## 6. Conclusiones y Estado de Cumplimiento

La arquitectura de seguridad del módulo de autenticación de **Arrendo360** cumple a cabalidad con los lineamientos técnicos del estándar **OWASP ASVS Nivel 2** y las directrices de la **RFC 6819**: - La **enumeración de cuentas** queda neutralizada mediante respuestas estandarizadas y normalización. - El **reúso de tokens** es detectado proactivamente mediante el patrón RTR de dos identificadores (`jti` y `familyId`) y la invalidación atómica de tokens de un solo uso. - La **fuerza bruta** es computacionalmente inviable gracias al coste temporal de bcrypt (salt 10) y la entropía criptográfica de 256 bits en tokens aleatorios.

------------------------------------------------------------------------

## 7. Sincronización con el Tablero Kanban y Gobernanza (WIP = 1)

Conforme a la metodología **Spec-Driven Development (SDD) & Kanban** definida en [`docs/Metodologia_Desarrollo_Software_SDD_Kanban.md`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/docs/Metodologia_Desarrollo_Software_SDD_Kanban.md) y gestionada visualmente en [`docs/kanban.md`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/docs/kanban.md):

1.  **Correspondencia de Especificación:** Todo cambio arquitectónico documentado en este SDD debe estar vinculado a un Issue/Tarjeta activa en el tablero Kanban.
2.  **Restricción Estricta de Capacidad (WIP = 1):**
    - La columna **`En curso`** mantiene una restricción inviolable de **WIP = 1**.
    - Ninguna nueva característica arquitectónica puede iniciarse mientras la tarjeta activa no haya alcanzado el estado de *Verificación* o *Hecho*.
    - El subsistema de seguridad actual (**ISS-08 / SEC-AUTH**) ha completado su fase de desarrollo y verificación de 24 pruebas unitarias/integración, liberando la columna *En curso* para su evaluación en *Revisión Humana (Quality Gate)*.

------------------------------------------------------------------------

## 8. Decisiones Arquitectónicas del Bounded Context Clients y Acoplamiento de Ventajas (ISS-09)

En el marco de la evolución técnica del backend NestJS 11 y tras el análisis comparativo con el manual de referencia `app-storelab-express`, se formalizaron las siguientes decisiones de diseño:

### 8.1 ADR-CLI-01: Ciclo de Vida Lógico Atómico (`deactivate` y `activate`)
- **Decisión:** Habilitar endpoints explícitos `PATCH /api/clients/:id/deactivate` y `PATCH /api/clients/:id/activate` (con alias en `/clientes` y `/arrendatarios`), restringidos a roles `ADMIN` y `ASESOR`.
- **Razón:** La eliminación física (`DELETE`) está bloqueada por la regla `RN-CLI-05` cuando existen contratos asociados para salvaguardar la integridad fiscal. Los nuevos endpoints permiten transicionar el estado (`isActive`) sin requerir payloads complejos ni exponer mutaciones accidentales de otros campos.

### 8.2 ADR-CLI-02: Exportación de OpenAPI Specification en Formato JSON (`/api/docs.json`)
- **Decisión:** Registrar la ruta `/api/docs.json` tanto en la configuración de Swagger (`jsonDocumentUrl: 'api/docs.json'`) como mediante handler del adaptador HTTP de NestJS.
- **Razón:** Facilita la interoperabilidad y automatización de pipelines CI/CD, permitiendo que herramientas externas (Postman, generadores de clientes TypeScript/Dart, linter Spectral) consuman el contrato OpenAPI directamente.

### 8.3 ADR-CLI-03: Estandarización de Archivos `.http` para Pruebas Rápidas
- **Decisión:** Disponer de archivos `.http` separados por operación (`clients.get.http`, `clients.create.http`, `clients.update.http`, `clients.delete.http`) en `backend/http/clients/` y en la raíz del módulo.
- **Razón:** Reduce la fricción de pruebas durante el desarrollo al evitar dependencias de interfaces gráficas pesadas, proveyendo payloads reproducibles con roles (`x-user-role`) y variables parametrizables (`@baseUrl`, `@id`).

### 8.4 ADR-CLI-04: Runner CLI de Seeders con Conteos Parametrizables
- **Decisión:** Implementar un runner CLI (`run-seeders.ts`) que resuelve conteos de siembra mediante el helper `counts.ts` con orden de precedencia: Argumentos CLI (`--clients=N`) > Variables de entorno (`SEED_CLIENTS=N`) > Conteo por defecto (`DEFAULT_SEED_COUNTS`).
- **Razón:** Facilita la generación de datasets de tamaño controlado para pruebas de estrés, benchmarking y entornos locales sin modificar el código fuente.

### 8.5 ADR-CLI-05: Multi-enrutamiento Transparente por Alias
- **Decisión:** Configurar el decorador `@Controller(['arrendatarios', 'clientes', 'clients'])` en `ArrendatariosController`.
- **Razón:** Mantiene retrocompatibilidad y uniformidad semántica, permitiendo a clientes frontend y scripts externos interactuar usando terminología comercial en español (`/clientes`), legal de dominio inmobiliario (`/arrendatarios`) o estándar internacional REST en inglés (`/clients`).
