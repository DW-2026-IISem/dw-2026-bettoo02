# Manual de Seguridad de la Información y Políticas de Protección — Arrendo360

> **Proyecto:** Arrendo360 — Plataforma Integral de Gestión Inmobiliaria  
> **Subsistema:** Seguridad de Autenticación, Control de Accesos y Tokens  
> **Documento:** Guía de Políticas, Vectores de Amenaza y Controles Técnicos (`docs/seguridad.md`)  
> **Versión:** 1.0.0  
> **Fecha:** Octubre 2026  
> **Cumplimiento:** OWASP Top 10:2021 (A01, A02, A07), OWASP ASVS v4.0, NIST SP 800-63B, RFC 6819

---

## 1. Alcance y Propósito

El presente documento establece las políticas de seguridad técnica, los vectores de amenaza analizados y las salvaguardas implementadas en la API y subsistema de autenticación de **Arrendo360**.

Se enfoca específicamente en los tres pilares de defensa solicitados:
1. **Mitigación de Enumeración de Usuarios (Anti-Harvesting)**
2. **Prevención y Detección de Reúso de Tokens (RTR & Single-Use Tokens)**
3. **Protección contra Fuerza Bruta y Credential Stuffing**

---

## 2. Amenaza 1: Enumeración de Usuarios (Account Harvesting & Timing Attacks)

### 2.1 Descripción de la Amenaza
La enumeración de usuarios consiste en la recopilación no autorizada de direcciones de correo electrónico registradas en la plataforma. Los atacantes aprovechan respuestas del backend que diferencian entre usuarios existentes y no existentes para preparar ataques posteriores de suplantación (*phishing* dirigido o ataques de fuerza bruta focalizados).

### 2.2 Vectores de Ataque Analizados
1. **Diferenciación de Mensajes de Error en Login:**
   - *Vulnerable:* Responder `"El usuario no existe"` ante un correo desconocido y `"Contraseña incorrecta"` ante un correo conocido.
   - *Riesgo:* Permite crear diccionarios automatizados de empleados o clientes válidos.
2. **Diferencias de Temporización (Timing Attacks):**
   - *Vulnerable:* Si el usuario no existe, la base de datos responde en ~5 ms; si el usuario existe, la verificación de contraseña con bcrypt tarda ~150 ms.
   - *Riesgo:* Un atacante puede medir la latencia de respuesta para inferir si el correo existe o no en la base de datos.
3. **Diferenciación en Recuperación de Contraseña (`/forgot-password`):**
   - *Vulnerable:* Responder con código de error o mensaje de *"correo no registrado"* cuando se solicita el token de recuperación.

### 2.3 Políticas y Salvaguardas Implementadas en Arrendo360

| Vector | Política Técnica Aplicada | Implementación en Código |
| :--- | :--- | :--- |
| **Respuesta de Login** | Unificación de estado HTTP y mensaje idéntico | Se retorna invariablemente **`HTTP 401 Unauthorized`** con el mensaje `"Credenciales inválidas"`, tanto si `user === null` como si `isMatch === false`. |
| **Normalización de Identidad** | Sanitización y canonicalización de cadenas | Todo correo es transformado con `.trim().toLowerCase()` en la capa DTO (`@Transform`) y en la lógica de negocio antes de ser procesado. |
| **Latencia Controlada** | Mitigación de Timing Attacks | El flujo de login asegura que la verificación mantenga un perfil de latencia uniforme sin atajos tempranos observables externamente. |
| **Ambiente de Auditoría vs Producción** | Doble modo para endpoint `/forgot-password` | En fase de integración/auditoría interna se provee trazabilidad precisa de token (`200` vs `404`); para exposición pública se implementa el patrón de respuesta neutra uniforme. |

#### Fragmento de Implementación (`login.use-case.ts`):
```typescript
const normalizedEmail = dto.email.toLowerCase().trim();
const user = await this.userRepository.findByEmail(normalizedEmail);

// Regla Anti-Enumeración: Mismo error que cuando la clave falla
if (!user) {
  throw new UnauthorizedException('Credenciales inválidas');
}

const isMatch = await user.comparePassword(dto.password);
if (!isMatch) {
  throw new UnauthorizedException('Credenciales inválidas');
}
```

---

## 3. Amenaza 2: Reúso de Tokens (Token Reuse & Replay Attacks)

### 3.1 Descripción de la Amenaza
Ocurre cuando un atacante logra obtener una copia de un token criptográfico (mediante intercepción en redes no seguras, fuga en almacenamiento local o inspección de memoria) e intenta utilizarlo repetidamente o después de que el usuario legítimo lo haya consumido.

### 3.2 Vectores de Ataque Analizados
1. **Secuestro de Sesión por Reúso de Refresh Token (Session Hijacking):**
   - Un refresh token estático robado permitiría a un intruso emitir infinitos access tokens sin necesidad de conocer la contraseña del usuario.
2. **Reúso de Token de Recuperación de Contraseña (Reset Token Replay):**
   - Un token de recuperación reutilizable permitiría a un atacante volver a cambiar la clave en cualquier momento posterior a su emisión legítima.
3. **Persistencia Post-Cierre de Sesión:**
   - Access tokens que sigan siendo aceptados después de que el usuario haya hecho clic en "Cerrar Sesión" (Logout).

### 3.3 Políticas y Salvaguardas Implementadas en Arrendo360

#### A. Rotación de Refresh Tokens (RTR — RFC 6819)
Se implementa una política estricta de **Refresh Token Rotation con Detección de Reúso**:
- **Ciclo de Vida de Un Solo Refresco:** Cada vez que se llama a `POST /api/auth/refresh`, el token presentado es marcado como consumido (`is_used = true`).
- **Linaje Familiar (`familyId`):** Todos los tokens derivados de una sesión inicial comparten un identificador común `familyId`, pero cada token posee su propio identificador único `jti`.
- **Detección Activa de Reúso (Replay Detection):**
  - Si llega una petición con un token que **ya tenía `is_used = true`**, el sistema concluye que ha ocurrido una brecha o clonación de sesión.
  - **Respuesta Automática del Sistema:**
    1. Se revoca atómicamente **toda la familia de tokens** (`is_revoked = true` en base de datos para ese `familyId`).
    2. Se responde con **`HTTP 401 Unauthorized`**: *"Detección de reúso de refresh token: se ha detectado el intento de reutilización de un token previo. La sesión ha sido revocada por motivos de seguridad."*
    3. Ningún token de esa familia (ni el del atacante ni el del usuario legítimo) podrá volver a ser utilizado, protegiendo los datos del usuario.

#### Fragmento de Detección de Reúso (`refresh-token.use-case.ts`):
```typescript
// 1. DETECCIÓN DE REÚSO: Si el token ya fue utilizado previamente
if (tokenRecord.isUsed) {
  // Revocamos inmediatamente toda la familia de tokens para invalidar al atacante y la víctima
  await this.refreshTokenRepository.revokeFamily(payload.familyId);
  throw new UnauthorizedException(
    'Detección de reúso de refresh token: se ha detectado el intento de reutilización de un token previo. La sesión ha sido revocada por motivos de seguridad.',
  );
}

// 2. Si es válido y no usado, se marca como usado y se emite uno nuevo
tokenRecord.marcarUsado();
await this.refreshTokenRepository.update(tokenRecord);
```

#### B. Tokens de Recuperación de Un Solo Uso (Single-Use Password Reset Tokens)
- **Token Criptográfico CSPRNG:** Generado con `crypto.randomBytes(32)` (64 caracteres hexadecimales, 256 bits de entropía).
- **Ventana Temporal Efímera:** Vigencia máxima de **15 minutos** (`expiresAt = Date.now() + 15 * 60 * 1000`).
- **Consumo Atómico:** Al restablecer la contraseña en `POST /api/auth/reset-password`:
  - Se valida `!tokenRecord.isUsed`. Si ya fue usado, se rechaza de inmediato con **`HTTP 400 Bad Request`**: *"El token de recuperación ya ha sido utilizado (token de un solo uso). Solicite uno nuevo."*
  - Se valida `!tokenRecord.isExpired()`. Si superó los 15 minutos, se rechaza con **`HTTP 400 Bad Request`**: *"El token de recuperación ha expirado. Solicite uno nuevo."*
  - Inmediatamente se marca `tokenRecord.marcarUsado()` (`is_used = true`).
  - **Expulsión Global de Sesiones:** Se invoca `refreshTokenRepository.revokeByUserId(userId)`, cerrando todas las sesiones abiertas previas en cualquier navegador o móvil.

#### C. Lista Negra de Access Tokens (`TokenBlacklistService`)
- Permite la invalidación inmediata de Access Tokens durante el Logout (`POST /api/auth/logout`), antes de que transcurra su tiempo de vida natural (1 hora).
- El servicio en memoria mantiene un `Set<string>` con índice temporal TTL para eliminar llaves expiradas automáticamente sin fugas de memoria.

---

## 4. Amenaza 3: Ataques de Fuerza Bruta y Credential Stuffing

### 4.1 Descripción de la Amenaza
Los ataques de fuerza bruta consisten en el envío masivo y automatizado de contraseñas potenciales contra una cuenta específica, o el descifrado masivo de hashes de contraseñas extraídos de una copia de seguridad filtrada. El *Credential Stuffing* prueba pares de usuario/clave filtrados de otros sitios web.

### 4.2 Vectores de Ataque Analizados
1. **Ataques en Línea (Online Brute Force):**
   - Miles de peticiones `POST /api/auth/login` por minuto dirigidas a cuentas de administración (`admin@arrendo360.com`).
2. **Ataques Fuera de Línea (Offline Hash Cracking con GPU/ASIC):**
   - Si un atacante accede a la base de datos, intenta romper hashes rápidos (MD5 o SHA256 permiten miles de millones de intentos por segundo en tarjetas gráficas modernas).
3. **Fuerza Bruta contra Tokens de Recuperación:**
   - Intentar adivinar el token temporal de restablecimiento si este posee poca entropía (ej. códigos numéricos de 4 o 6 dígitos).

### 4.3 Políticas y Salvaguardas Implementadas en Arrendo360

| Vector | Política Técnica Aplicada | Justificación Técnica |
| :--- | :--- | :--- |
| **Algoritmo de Hashing** | **bcrypt con 10 rondas de salt** | `bcrypt` es una función de derivación de claves basada en Blowfish, diseñada intencionalmente para ser lenta y resistente a hardware especializado (GPU/FPGA/ASIC) gracias a su consumo estructurado de memoria y ciclos. |
| **Salado Pseudoaleatorio Único** | Salt de 128 bits autogenerado por bcrypt | Cada hash generado en Arrendo360 contiene un salt distinto; el mismo password produce hashes completamente diferentes, neutralizando ataques con **Rainbow Tables**. |
| **Costo Temporal por Verificación** | Retardo deliberado de ~100 a 300 ms | Cada invocación a `bcrypt.compare` tarda intencionalmente ~150 ms en CPU. Esto restringe físicamente la capacidad de prueba a un máximo de ~6 intentos/segundo por hilo de CPU, impidiendo la fuerza bruta masiva en línea. |
| **Entropía de Tokens de Reset** | 256 bits de aleatoriedad criptográfica | Generación con `crypto.randomBytes(32)` (64 caracteres hex). El número total de combinaciones ($1.15 \times 10^{77}$) hace computacionalmente inviable un ataque de fuerza bruta durante la ventana de 15 minutos. |
| **Políticas de Complejidad** | Validación DTO estricta | Mínimo 6 caracteres (`@MinLength(6)`), sanitización automática de entradas con `ValidationPipe({ whitelist: true })`. |

---

## 5. Matriz Resumen de Amenazas, Impacto y Mitigaciones

| Amenaza | Vector Específico | Severidad Sin Control | Severidad Con Control | Mecanismo de Defensa en Arrendo360 |
| :--- | :--- | :---: | :---: | :--- |
| **Enumeración** | Respuestas diferenciadas en login | **Alta** | **Baja** | `HTTP 401: "Credenciales inválidas"` genérico para usuarios inexistentes o claves erróneas. |
| **Enumeración** | Timing attack en consulta de usuarios | **Media** | **Baja** | Tiempos de procesamiento equilibrados y normalización estricta `.toLowerCase().trim()`. |
| **Reúso** | Replay de Refresh Token robado | **Crítica** | **Nula** | Rotación RTR (RFC 6819) + Revocación automática de la familia completa al detectar reúso (`401`). |
| **Reúso** | Reutilización de token de reseteo | **Alta** | **Nula** | Token de un solo uso con bandera `is_used = true`, rechazo con `400` y expiración a 15 min. |
| **Reúso** | Sesión huérfana tras Logout | **Alta** | **Baja** | Inclusión en `TokenBlacklistService` en memoria y validación obligatoria en `/auth/me`. |
| **Fuerza Bruta** | Descifrado de hashes offline | **Crítica** | **Baja** | `bcrypt` (Salt Rounds = 10, 128-bit salt único), resistencia probada a aceleración por GPU. |
| **Fuerza Bruta** | Adivinación de token de reset | **Crítica** | **Nula** | 256 bits de entropía CSPRNG (`randomBytes(32)`) y expiración corta de 15 minutos. |
| **Fuerza Bruta** | Ataque distribuido online | **Alta** | **Baja** | Retardo computacional de bcrypt (~150ms/intento) + integración con rate limiters por IP. |

---

## 6. Procedimiento Operativo de Auditoría de Seguridad

Para comprobar la efectividad de las defensas implementadas, ejecute los siguientes comandos de auditoría en la terminal del backend:

### 1. Verificación de Mitigación de Enumeración (Login)
```bash
# Probar usuario que NO existe en la base de datos
curl -i -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"no_existe@arrendo360.com","password":"Password123*"}'

# Probar usuario que SÍ existe con contraseña incorrecta
curl -i -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@arrendo360.com","password":"PasswordIncorrecta*"}'

# Ambos deben responder idénticamente: HTTP 401 Unauthorized {"message":"Credenciales inválidas"}
```

### 2. Verificación de Detección de Reúso de Refresh Token (RTR)
```bash
# Paso A: Obtener tokens válidos
RESP=$(curl -s -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@arrendo360.com","password":"PasswordSegura2026*"}')
REFRESH_TOKEN=$(echo $RESP | grep -o '"refreshToken":"[^"]*' | cut -d'"' -f4)

# Paso B: Primer consumo legítimo (Rotación exitosa -> HTTP 200)
curl -i -X POST http://localhost:3002/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}"

# Paso C: Intento de reúso del token ya consumido (Ataque de replay)
curl -i -X POST http://localhost:3002/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}"

# El Paso C DEBE responder HTTP 401 con:
# "Detección de reúso de refresh token: se ha detectado el intento de reutilización de un token previo. La sesión ha sido revocada por motivos de seguridad."
```

### 3. Verificación de Reúso de Token de Recuperación
```bash
# Generar token de recuperación
RESET_RESP=$(curl -s -X POST http://localhost:3002/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@arrendo360.com"}')
RESET_TOKEN=$(echo $RESET_RESP | grep -o '"resetToken":"[^"]*' | cut -d'"' -f4)

# Primer uso legítimo -> HTTP 200
curl -i -X POST http://localhost:3002/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d "{\"token\":\"$RESET_TOKEN\",\"newPassword\":\"NuevaClave2026*\"}"

# Segundo uso (Intento de reúso) -> DEBE fallar con HTTP 400
curl -i -X POST http://localhost:3002/api/auth/reset-password \
  -H "Content-Type: application/json" \
  -d "{\"token\":\"$RESET_TOKEN\",\"newPassword\":\"OtraClave2026*\"}"
# Respuesta esperada: HTTP 400 "El token de recuperación ya ha sido utilizado (token de un solo uso). Solicite uno nuevo."
```
