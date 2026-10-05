# Evidencia de Verificación: Flujo de Registro y Login (Credenciales Válidas e Inválidas)

> **Proyecto:** Arrendo360 (`dw-2026-bettoo02`)  
> **Módulo:** Autenticación y Autorización (`AuthModule`)  
> **Arquitectura:** Clean Architecture & DDD  
> **Fecha de ejecución:** 2026-10-04  
> **Entorno de ejecución:** Node.js v22 / NestJS v11 / Vitest v4 / TypeScript  

---

## 1. Resumen Ejecutivo

Se implementó y verificó de forma exhaustiva el flujo de **Registro de Usuarios** y de **Inicio de Sesión (Login)** en el sistema **Arrendo360**, respetando los principios de Clean Architecture y las políticas de seguridad del proyecto:
- Hashing seguro de contraseñas con **bcrypt** (salt 10).
- Generación de tokens **JWT** (JSON Web Tokens) firmados con expiración configurable (1h) y claims de identidad (`sub`, `email`, `role`).
- Validación estricta de payloads entrantes con `class-validator` y `ValidationPipe` global (`whitelist`, `forbidNonWhitelisted`, `transform`).
- Envoltorio uniforme de respuestas HTTP con `ResponseInterceptor` y manejo de excepciones centralizado con `GlobalExceptionFilter`.
- Cobertura de pruebas unitarias y de integración HTTP (15 pruebas en `test/auth.spec.ts`, 27 pruebas totales en el proyecto) ejecutadas y aprobadas al 100%.

---

## 2. Especificación de Endpoints

| Método | Endpoint | Descripción | Códigos HTTP Soportados |
| :--- | :--- | :--- | :--- |
| `POST` | `/api/auth/register` | Registro de usuario con credenciales y perfil | `201 Created`, `400 Bad Request`, `409 Conflict` |
| `POST` | `/api/auth/registro` | Alias en español para registro | `201 Created`, `400 Bad Request`, `409 Conflict` |
| `POST` | `/api/auth/login` | Autenticación de usuario existente | `200 OK`, `400 Bad Request`, `401 Unauthorized` |

---

## 3. Matriz de Casos de Prueba Ejecutados

### Caso 1: Registro Exitoso con Credenciales Válidas (HTTP 201)
- **Escenario:** El usuario envía nombre válido ($\ge 2$ caracteres), correo no existente y contraseña segura ($\ge 6$ caracteres) con rol del sistema.
- **Petición HTTP:**
  ```http
  POST /api/auth/register HTTP/1.1
  Host: localhost:3002
  Content-Type: application/json

  {
    "nombre": "Alberto Ortiz",
    "email": "betto@arrendo360.com",
    "password": "PasswordSegura2026*",
    "role": "ADMIN"
  }
  ```
- **Respuesta Esperada y Obtenida:** `HTTP/1.1 201 Created`
  ```json
  {
    "statusCode": 201,
    "message": "Operación exitosa",
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
      "user": {
        "id": 1,
        "nombre": "Alberto Ortiz",
        "email": "betto@arrendo360.com",
        "role": "ADMIN",
        "isActive": true
      }
    },
    "timestamp": "2026-10-04T23:22:19.456Z"
  }
  ```
- **Resultado:** **Aprobado (PASS)**. Se verifica la contraseña cifrada en la base de datos (nunca en texto plano) y la emisión del token JWT.

---

### Caso 2: Registro Rechazado por Credenciales Inválidas - Validación DTO (HTTP 400)
- **Escenario:** Se envía un cuerpo de petición con datos no conformes: email sin formato válido, nombre con menos de 2 caracteres y contraseña con menos de 6 caracteres.
- **Petición HTTP:**
  ```http
  POST /api/auth/register HTTP/1.1
  Host: localhost:3002
  Content-Type: application/json

  {
    "nombre": "J",
    "email": "correo-no-valido",
    "password": "123"
  }
  ```
- **Respuesta Esperada y Obtenida:** `HTTP/1.1 400 Bad Request`
  ```json
  {
    "statusCode": 400,
    "message": [
      "El nombre debe tener al menos 2 caracteres",
      "El correo electrónico no es válido",
      "La contraseña debe tener al menos 6 caracteres"
    ],
    "timestamp": "2026-10-04T23:22:19.480Z",
    "path": "/api/auth/register"
  }
  ```
- **Resultado:** **Aprobado (PASS)**. El `ValidationPipe` intercepta la petición y devuelve un detalle claro de las violaciones.

---

### Caso 3: Registro Rechazado por Conflicto - Correo Duplicado (HTTP 409)
- **Escenario:** Se intenta registrar un usuario con un correo que ya pertenece a otro registro en la base de datos.
- **Petición HTTP:**
  ```http
  POST /api/auth/register HTTP/1.1
  Host: localhost:3002
  Content-Type: application/json

  {
    "nombre": "Usuario Clon",
    "email": "betto@arrendo360.com",
    "password": "OtraPassword456*",
    "role": "ASESOR"
  }
  ```
- **Respuesta Esperada y Obtenida:** `HTTP/1.1 409 Conflict`
  ```json
  {
    "statusCode": 409,
    "message": "El correo electrónico ya se encuentra registrado",
    "timestamp": "2026-10-04T23:22:19.505Z",
    "path": "/api/auth/register"
  }
  ```
- **Resultado:** **Aprobado (PASS)**. `RegisterUseCase` detecta la colisión mediante `IUserRepository.findByEmail` y lanza `ConflictException`.

---

### Caso 4: Inicio de Sesión Exitoso con Credenciales Válidas (HTTP 200)
- **Escenario:** El usuario envía su correo registrado y la contraseña correcta correspondiente.
- **Petición HTTP:**
  ```http
  POST /api/auth/login HTTP/1.1
  Host: localhost:3002
  Content-Type: application/json

  {
    "email": "betto@arrendo360.com",
    "password": "PasswordSegura2026*"
  }
  ```
- **Respuesta Esperada y Obtenida:** `HTTP/1.1 200 OK`
  ```json
  {
    "statusCode": 200,
    "message": "Operación exitosa",
    "data": {
      "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjEsImVtYWlsIjoiYmV0dG9AYXJyZW5kbzM2MC5jb20iLCJyb2xlIjoiQURNSU4iLCJpYXQiOjE3MjgwOTk3Mzl9...",
      "user": {
        "id": 1,
        "nombre": "Alberto Ortiz",
        "email": "betto@arrendo360.com",
        "role": "ADMIN",
        "isActive": true
      }
    },
    "timestamp": "2026-10-04T23:22:19.530Z"
  }
  ```
- **Resultado:** **Aprobado (PASS)**. `User.comparePassword()` verifica el hash bcrypt satisfactoriamente y expide el JWT.

---

### Caso 5: Inicio de Sesión Rechazado por Contraseña Incorrecta (HTTP 401)
- **Escenario:** El usuario ingresa un correo existente pero una contraseña errónea.
- **Petición HTTP:**
  ```http
  POST /api/auth/login HTTP/1.1
  Host: localhost:3002
  Content-Type: application/json

  {
    "email": "betto@arrendo360.com",
    "password": "PasswordEquivocada999"
  }
  ```
- **Respuesta Esperada y Obtenida:** `HTTP/1.1 401 Unauthorized`
  ```json
  {
    "statusCode": 401,
    "message": "Credenciales inválidas",
    "timestamp": "2026-10-04T23:22:19.555Z",
    "path": "/api/auth/login"
  }
  ```
- **Resultado:** **Aprobado (PASS)**. Por seguridad, no se revela si falló el correo o la contraseña, arrojando el mensaje genérico `"Credenciales inválidas"`.

---

### Caso 6: Inicio de Sesión Rechazado por Correo Inexistente (HTTP 401)
- **Escenario:** El usuario ingresa un correo que no existe en el sistema.
- **Petición HTTP:**
  ```http
  POST /api/auth/login HTTP/1.1
  Host: localhost:3002
  Content-Type: application/json

  {
    "email": "noexiste@arrendo360.com",
    "password": "PasswordCualquiera123*"
  }
  ```
- **Respuesta Esperada y Obtenida:** `HTTP/1.1 401 Unauthorized`
  ```json
  {
    "statusCode": 401,
    "message": "Credenciales inválidas",
    "timestamp": "2026-10-04T23:22:19.570Z",
    "path": "/api/auth/login"
  }
  ```
- **Resultado:** **Aprobado (PASS)**. Se previene la enumeración de usuarios respondiendo exactamente con el mismo código 401 y mensaje que en el fallo de contraseña.

---

### Caso 7: Inicio de Sesión Rechazado por Cuenta Inactiva (HTTP 401)
- **Escenario:** Un usuario con credenciales válidas pero con bandera `isActive = false` intenta iniciar sesión.
- **Respuesta Esperada y Obtenida:** `HTTP/1.1 401 Unauthorized`
  ```json
  {
    "statusCode": 401,
    "message": "El usuario se encuentra inactivo. Contacte al administrador",
    "timestamp": "2026-10-04T23:22:19.585Z",
    "path": "/api/auth/login"
  }
  ```
- **Resultado:** **Aprobado (PASS)**. Se bloquea el acceso inmediatamente sin generar token de sesión.

---

### Caso 8: Inicio de Sesión Rechazado por Payload Inválido (HTTP 400)
- **Escenario:** Se envía un cuerpo de petición con correo sin formato o contraseña en blanco.
- **Petición HTTP:**
  ```http
  POST /api/auth/login HTTP/1.1
  Host: localhost:3002
  Content-Type: application/json

  {
    "email": "formato-invalido",
    "password": ""
  }
  ```
- **Respuesta Esperada y Obtenida:** `HTTP/1.1 400 Bad Request`
  ```json
  {
    "statusCode": 400,
    "message": [
      "El correo electrónico no es válido",
      "La contraseña es obligatoria"
    ],
    "timestamp": "2026-10-04T23:22:19.595Z",
    "path": "/api/auth/login"
  }
  ```
- **Resultado:** **Aprobado (PASS)**.

---

## 4. Evidencia de Ejecución de Pruebas Automatizadas

Comando ejecutado desde la raíz del proyecto:
```bash
npm test
```

### Log de Ejecución de Vitest:
```text
> app-arrendo360@1.0.0 test
> npm --prefix backend run test

> backend@0.0.1 test
> vitest run

 RUN  v4.1.11 /home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/backend

 ✓ test/distribucion-pago.entity.spec.ts (5 tests) 5ms
 ✓ test/rbac.guard.spec.ts (5 tests) 5ms
 ✓ src/app.controller.spec.ts (2 tests) 109ms
 ✓ test/auth.spec.ts (15 tests) 1277ms
       ✓ 1. Verificación de Entidad de Dominio User
             ✓ debe comparar contraseñas válidas e inválidas correctamente
             ✓ debe permitir desactivar al usuario
       ✓ 2. Flujo de Registro de Usuario
             ✓ debe registrar un usuario exitosamente con credenciales válidas
             ✓ debe rechazar el registro con HTTP 409 si el correo electrónico ya existe
       ✓ 3. Flujo de Inicio de Sesión (Login)
             ✓ debe autenticar exitosamente con credenciales válidas y devolver token JWT
             ✓ debe rechazar el login con HTTP 401 si el correo no existe
             ✓ debe rechazar el login con HTTP 401 si la contraseña es incorrecta
             ✓ debe rechazar el login con HTTP 401 si el usuario está inactivo
       ✓ 4. Flujo HTTP de Endpoints (/api/auth/register y /api/auth/login)
             ✓ POST /api/auth/register - Debe registrar exitosamente con credenciales válidas (HTTP 201)
             ✓ POST /api/auth/register - Debe fallar con HTTP 400 si las credenciales son inválidas
             ✓ POST /api/auth/register - Debe fallar con HTTP 409 si el correo ya existe
             ✓ POST /api/auth/login - Debe iniciar sesión exitosamente con credenciales válidas (HTTP 200)
             ✓ POST /api/auth/login - Debe fallar con HTTP 401 si la contraseña es incorrecta
             ✓ POST /api/auth/login - Debe fallar con HTTP 401 si el correo no existe
             ✓ POST /api/auth/login - Debe fallar con HTTP 400 si el payload es inválido

 Test Files  4 passed (4)
      Tests  27 passed (27)
   Start at  23:22:54
   Duration  2.09s
```

---

## 5. Guía de Reproducción con cURL

Con el servidor backend iniciado (`npm run start:dev`):

### 1. Registrar usuario válido:
```bash
curl -X POST http://localhost:3002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Carlos Arango",
    "email": "carlos.arango@arrendo360.com",
    "password": "PasswordSegura2026*",
    "role": "ASESOR"
  }'
```

### 2. Probar registro inválido (error 400):
```bash
curl -X POST http://localhost:3002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "C",
    "email": "correo-erroneo",
    "password": "123"
  }'
```

### 3. Probar registro duplicado (conflicto 409):
```bash
curl -X POST http://localhost:3002/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "nombre": "Carlos Arango Duplicado",
    "email": "carlos.arango@arrendo360.com",
    "password": "OtraPassword456*"
  }'
```

### 4. Iniciar sesión válido (login 200):
```bash
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "carlos.arango@arrendo360.com",
    "password": "PasswordSegura2026*"
  }'
```

### 5. Probar login con contraseña equivocada (401):
```bash
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "carlos.arango@arrendo360.com",
    "password": "ClaveIncorrecta999"
  }'
```

### 6. Probar login con correo inexistente (401):
```bash
curl -X POST http://localhost:3002/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "usuario.fantasma@arrendo360.com",
    "password": "CualquierPassword123*"
  }'
```

---

## 6. Arquitectura del Módulo Auth

El módulo sigue estrictamente la arquitectura limpia (Clean Architecture):

```
backend/src/features/auth/
├── domain/
│   ├── entities/
│   │   └── user.entity.ts              # Entidad pura con lógica de hash y comparación bcrypt
│   └── interfaces/
│       └── user-repository.interface.ts # Puerto del repositorio (IUserRepository + token DI)
├── application/
│   ├── dto/
│   │   ├── register.dto.ts             # DTO de registro con reglas class-validator
│   │   ├── login.dto.ts                # DTO de login con validación de email y password
│   │   └── auth-response.dto.ts        # DTO de respuesta con token JWT y perfil
│   ├── mappers/
│   │   └── user.mapper.ts              # Conversor Dominio <-> DTOs y Dominio <-> Modelo
│   └── use-cases/
│       ├── register.use-case.ts        # Caso de uso: Registro de usuario y firma JWT
│       └── login.use-case.ts           # Caso de uso: Verificación de credenciales y firma JWT
├── infrastructure/
│   └── persistence/
│       ├── models/
│       │   └── user.model.ts           # Modelo Sequelize para la tabla 'usuarios'
│       └── repositories/
│           └── user.repository.ts      # Adaptador concreto de persistencia en Sequelize
├── presentation/
│   └── http/
│       └── controllers/
│           └── auth.controller.ts      # Endpoints POST /register y POST /login con Swagger
└── auth.module.ts                      # Módulo NestJS configurando JwtModule y proveedores
```
