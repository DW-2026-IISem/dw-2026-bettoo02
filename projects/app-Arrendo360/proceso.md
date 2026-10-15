# Bitácora de Proceso y Manual de Pruebas — Arrendo360

> **Proyecto:** Arrendo360 — Plataforma Integral de Gestión Inmobiliaria  
> **Tecnologías:** Express + TypeScript + Sequelize ORM + NestJS Architecture + MySQL  
> **Metodología:** Spec-Driven Development (SDD) & Kanban con WIP = 1  
> **Entregable:** Trabajo Autónomo — Proyecto Backend Completo y Funcional  
> **URL Servidor en Vivo:** `http://localhost:3002`  
> **Documentación Swagger / OpenAPI:** `http://localhost:3002/api/docs`  

---

## 1. Ficha Técnica y Arquitectura del Sistema

El backend de **Arrendo360** está diseñado bajo los principios de **Clean Architecture (Hexagonal / Puertos y Adaptadores)** y **Domain-Driven Design (DDD)**, orquestado mediante el framework modular NestJS sobre la base de motor HTTP **Express**, tipado estricto con **TypeScript** y persistencia relacional transaccional mediante **Sequelize ORM** conectado a **MySQL**.

```
backend/
├── src/
│   ├── config/                     # Configuración centralizada de entorno, logger y Swagger
│   ├── common/                     # Filtros globales, interceptores, pipes, decoradores y guards RBAC
│   │   ├── guards/roles.guard.ts   # RolesGuard (Validación de modalidades OPEN, PROTECTED, RBAC)
│   │   └── decorators/roles.decorator.ts
│   ├── features/
│   │   ├── auth/                   # Módulo de Autenticación, JWT, RTR, Catálogo RBAC y Sesiones
│   │   │   ├── domain/             # Entidades User, Role, Resource, RoleUser, ResourceRole, RefreshToken
│   │   │   ├── application/        # Casos de uso (Register, Login, Refresh RTR, Logout, Me, Forgot/Reset)
│   │   │   └── infrastructure/     # Modelos Sequelize, Repositorios e Integración de Criptografía
│   │   └── business/               # Módulos de Negocio Core (Fases I y II)
│   │       ├── leases/             # Arrendatarios / Clientes y Contratos de Arrendamiento
│   │       ├── properties/         # Inmuebles y Propietarios
│   │       ├── receivables/        # Cobros Mensuales, Pagos y Conciliaciones
│   │       ├── owner-settlements/  # Liquidaciones a Propietarios
│   │       ├── maintenance/        # Proveedores y Órdenes de Mantenimiento
│   │       ├── product-types/      # Catálogo de Tipos de Producto
│   │       ├── products/           # Catálogo de Productos y Control de Stock
│   │       ├── sales/              # Ventas transaccionales y bloqueo canónico anti-deadlock
│   │       └── product-sales/      # Líneas de detalle de ventas
│   └── infrastructure/database/    # Conexión Sequelize y Seeders Idempotentes Parametrizables
├── http/                           # Colecciones de pruebas interactivas REST (.http)
└── test/                           # 112 pruebas automatizadas unitarias y de integración (Vitest)
```

---

## 2. Paso a Paso del Desarrollo y Commits Pertinentes por Cada ISS

En estricto cumplimiento con la metodología **Spec-Driven Development (SDD)** y el flujo **Kanban (WIP = 1)**, cada uno de los 15 issues contemplados en la especificación académica de Tecnogua (`https://tecnogua.com/academic/site/backend2026/`) fue planificado, desarrollado, verificado y documentado de forma atómica:

### Matriz de Commits y Trazabilidad

| Issue ID | Título / Alcance Técnico | Criterios de Aceptación (AC) | Mensaje de Commit Pertinente | Documento SDD |
|:---:|---|:---:|---|:---:|
| **ISS-01** | Esqueleto NestJS + Express + TypeScript arrancable | AC-1 a AC-4 aprobados | `feat(iss-01): esqueleto NestJS CA arrancable Refs #1` | [`trazabilidad/ISS-01.md`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/trazabilidad/ISS-01.md) |
| **ISS-02** | Persistencia Sequelize, Conexión BD y Modelos Base | AC-1 a AC-5 aprobados | `feat(iss-02): persistencia Sequelize y modelos Refs #2` | [`trazabilidad/ISS-02.md`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/trazabilidad/ISS-02.md) |
| **ISS-03** | Configuración centralizada y Health Checks desacoplados | AC-1 a AC-4 aprobados | `feat(iss-03): configuracion y health checks Refs #3` | [`trazabilidad/ISS-03.md`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/trazabilidad/ISS-03.md) |
| **ISS-04** | Inmuebles, Propietarios y Arrendatarios/Clientes | AC-1 a AC-5 aprobados | `feat(iss-04): gestion inmuebles y propietarios Refs #4` | [`trazabilidad/ISS-04.md`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/trazabilidad/ISS-04.md) |
| **ISS-05** | Contratos de Arrendamiento y Estados de Ocupación | AC-1 a AC-5 aprobados | `feat(iss-05): contratos de arrendamiento Refs #5` | [`trazabilidad/ISS-05.md`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/trazabilidad/ISS-05.md) |
| **ISS-06** | Cobros Mensuales, Pagos y Transiciones de Estado | AC-1 a AC-5 aprobados | `feat(iss-06): cobros mensuales y pagos Refs #6` | [`trazabilidad/ISS-06.md`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/trazabilidad/ISS-06.md) |
| **ISS-07** | Liquidaciones a Propietarios, Seeders y Demo E2E | AC-1 a AC-5 aprobados | `feat(iss-07): integracion business y demo Refs #7` | [`trazabilidad/ISS-07.md`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/trazabilidad/ISS-07.md) |
| **ISS-08** | Feature Sale + ProductSale (Transacciones ACID y Stock) | AC-1 a AC-7 aprobados | `feat(iss-08): feature sales, productsales, transacciones acid y stock Refs #8` | [`trazabilidad/ISS-08.md`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/trazabilidad/ISS-08.md) |
| **ISS-09** | Base de Seguridad Compartida y Modelos Auth | AC-1 a AC-5 aprobados | `feat(iss-09): base de seguridad compartida y modelos auth Refs #9` | [`trazabilidad/ISS-09.md`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/trazabilidad/ISS-09.md) |
| **ISS-10** | Feature Users (Identidad, Hashing bcrypt y Ciclo de Vida) | AC-1 a AC-5 aprobados | `feat(iss-10): feature users, hashing bcrypt y ciclo de vida Refs #10` | [`trazabilidad/ISS-10.md`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/trazabilidad/ISS-10.md) |
| **ISS-11** | Features Roles y Resources (Catálogo de Autorización) | AC-1 a AC-5 aprobados | `feat(iss-11): features roles y resources, catalogo de autorizacion Refs #11` | [`trazabilidad/ISS-11.md`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/trazabilidad/ISS-11.md) |
| **ISS-12** | Features RoleUsers y ResourceRoles (Asignación RBAC) | AC-1 a AC-5 aprobados | `feat(iss-12): features roleusers y resourceroles, asignaciones y concesiones rbac Refs #12` | [`trazabilidad/ISS-12.md`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/trazabilidad/ISS-12.md) |
| **ISS-13** | Middlewares de Acceso y 3 Modalidades (OPEN, PROTECTED, RBAC) | AC-1 a AC-5 aprobados | `feat(iss-13): middlewares y guards de acceso en tres modalidades Refs #13` | [`trazabilidad/ISS-13.md`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/trazabilidad/ISS-13.md) |
| **ISS-14** | Feature RefreshTokens (Sesiones Renovables, RTR y Reúso) | AC-1 a AC-5 aprobados | `feat(iss-14): feature refreshtokens, rotacion rtr y deteccion de reuso Refs #14` | [`trazabilidad/ISS-14.md`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/trazabilidad/ISS-14.md) |
| **ISS-15** | Feature Session (Login, /me, Logout, Forgot/Reset Password) | AC-1 a AC-5 aprobados | `feat(iss-15): feature session, login, perfil, logout y cierre fase ii Refs #15` | [`trazabilidad/ISS-15.md`](file:///home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/trazabilidad/ISS-15.md) |

---

## 3. Selección de 2 Tablas Importantes de Business

Para la validación integral de accesos y seguridad se seleccionaron **dos tablas transaccionales neurálgicas** del negocio inmobiliario de Arrendo360:

### 1. Tabla Business 1: `arrendatarios` (Entidad Cliente / Client)
- **Ruta REST:** `/api/clients` (estándar en inglés según la actividad académica).
- **Importancia:** Registra la persona natural o jurídica titular del contrato de arrendamiento. Requiere validación de unicidad de documento (`tipoDocumento`, `numeroDocumento`), formato de teléfono y correo electrónico.
- **Políticas de Acceso:**
  - `GET /api/clients`: Modalidad **OPEN** para consulta y listados paginados.
  - `POST /api/clients`: Modalidad **RBAC** protegida exclusivamente para roles `ADMIN` y `ASESOR`.

### 2. Tabla Business 2: `contratos` (Entidad Contrato de Arrendamiento)
- **Ruta REST:** `/api/contratos`.
- **Importancia:** Representa el acuerdo vinculante que genera obligaciones financieras, cánones mensuales, fechas de vigencia y ocupación sobre los inmuebles.
- **Políticas de Acceso:**
  - `GET /api/contratos`: Modalidad **OPEN / PROTECTED** para consulta administrativa.
  - `POST /api/contratos`: Modalidad **RBAC** protegida para roles `ADMIN` y `ASESOR` (prohibida expresamente para `PROPIETARIO_CONSULTA` o perfiles de solo lectura).

---

## 4. Matriz de Evidencias: 4 Tipos de Accesos (Casos Exitosos y Fallidos)

A continuación se evidencian las respuestas reales emitidas por el servidor en ejecución para cada uno de los cuatro niveles de acceso solicitados:

### TIPO 1: Sin Autenticación (OPEN)

Los endpoints de consulta pública o diagnóstico responden sin requerir credenciales ni cabeceras Bearer. En contraposición, si se intenta acceder a una ruta protegida sin token, el sistema rechaza la petición con código **401 Unauthorized**.

#### 1.1 Caso Exitoso (200 OK) — Diagnóstico Abierto
- **Petición:** `GET /api/health`
- **Cabeceras:** Ninguna (Sin autenticación)
- **Respuesta del Servidor:**
```json
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{
  "statusCode": 200,
  "message": "Operación exitosa",
  "data": {
    "status": "ok"
  },
  "timestamp": "2026-10-14T23:03:04.793Z"
}
```

#### 1.2 Caso Fallido / Falso (401 Unauthorized) — Intento de Acceso sin Token
- **Petición:** `GET /api/auth/me`
- **Cabeceras:** Ninguna (Falta cabecera `Authorization`)
- **Respuesta del Servidor:**
```json
HTTP/1.1 401 Unauthorized
Content-Type: application/json; charset=utf-8

{
  "statusCode": 401,
  "message": "Token de autenticación no proporcionado. Proporcione el header Authorization: Bearer <token>",
  "timestamp": "2026-10-14T23:12:11.755Z",
  "path": "/api/auth/me"
}
```

---

### TIPO 2: Solo Autenticación (Validación de Credenciales)

Valida la identidad del usuario contra la base de datos comparando el hash criptográfico mediante `bcrypt.compare`.

#### 2.1 Caso Exitoso (200 OK) — Credenciales Correctas
- **Petición:** `POST /api/auth/login`
- **Payload:**
```json
{
  "email": "admin.master@arrendo360.com",
  "password": "PasswordSegura2026*"
}
```
- **Respuesta del Servidor:**
```json
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{
  "statusCode": 200,
  "message": "Operación exitosa",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
    "user": {
      "id": 14,
      "nombre": "Administrador Principal",
      "email": "admin.master@arrendo360.com",
      "role": "ADMIN",
      "isActive": true
    }
  },
  "timestamp": "2026-10-14T23:13:11.944Z"
}
```

#### 2.2 Caso Fallido / Falso (401 Unauthorized) — Contraseña Incorrecta
- **Petición:** `POST /api/auth/login`
- **Payload:**
```json
{
  "email": "admin.master@arrendo360.com",
  "password": "PasswordErronea123"
}
```
- **Respuesta del Servidor:**
```json
HTTP/1.1 401 Unauthorized
Content-Type: application/json; charset=utf-8

{
  "statusCode": 401,
  "message": "Credenciales inválidas",
  "timestamp": "2026-10-14T23:12:25.150Z",
  "path": "/api/auth/login"
}
```

---

### TIPO 3: Autenticación y JWT Token + Refresh (RTR conforme a RFC 6819)

Implementa la **Rotación de Refresh Tokens (RTR)**. Cada vez que se solicita un nuevo par de tokens, el refresh token anterior se invalida. Si un atacante o cliente intenta reutilizar un refresh token previo, el sistema activa la **Detección de Reúso Fraudulento** y revoca toda la cadena de sesiones.

#### 3.1 Caso Exitoso (200 OK) — Consumo con JWT y Rotación de Token
- **Petición:** `POST /api/auth/refresh`
- **Payload:**
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE0LCJqdGkiOiI4YTY3..."
}
```
- **Respuesta del Servidor:**
```json
HTTP/1.1 200 OK
Content-Type: application/json; charset=utf-8

{
  "statusCode": 200,
  "message": "Operación exitosa",
  "data": {
    "accessToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE0LCJub21icmUi...",
    "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE0LCJqdGkiOiIwNzM5...",
    "user": {
      "id": 14,
      "nombre": "Administrador Principal",
      "email": "admin.master@arrendo360.com",
      "role": "ADMIN",
      "isActive": true
    }
  },
  "timestamp": "2026-10-14T23:13:48.684Z"
}
```

#### 3.2 Caso Fallido / Falso (401 Unauthorized) — Intento de Reúso Fraudulento
- **Petición:** `POST /api/auth/refresh`
- **Payload:** (Se reenvía exactamente el mismo `refreshToken` anterior ya consumido)
```json
{
  "refreshToken": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdWIiOjE0LCJqdGkiOiI4YTY3..."
}
```
- **Respuesta del Servidor:**
```json
HTTP/1.1 401 Unauthorized
Content-Type: application/json; charset=utf-8

{
  "statusCode": 401,
  "message": "Detección de reúso de refresh token: se ha detectado el intento de reutilización de un token previo. La sesión ha sido revocada por motivos de seguridad.",
  "timestamp": "2026-10-14T23:13:54.340Z",
  "path": "/api/auth/refresh"
}
```

---

### TIPO 4: Autenticación y JWT Token + Refresh + RBAC (Roles & Resources)

Valida que el usuario posea los roles requeridos para ejecutar operaciones de mutación sobre las tablas de negocio seleccionadas mediante `RolesGuard`.

#### Pruebas sobre Tabla 1: `clients` (`/api/clients`)

##### 4.1 Caso Exitoso (201 Created) — Rol Autorizado (`ADMIN` o `ASESOR`)
- **Petición:** `POST /api/clients`
- **Cabeceras:** `x-user-role: ADMIN` (o Bearer token con claim `role: "ADMIN"`)
- **Payload:**
```json
{
  "tipoDocumento": "CC",
  "numeroDocumento": "9988776655",
  "nombre": "Carolina Gómez Herrera",
  "telefono": "+57 312 999 8877",
  "email": "carolina.gomez@arrendo360.com"
}
```
- **Respuesta del Servidor:**
```json
HTTP/1.1 201 Created
Content-Type: application/json; charset=utf-8

{
  "statusCode": 201,
  "message": "Operación exitosa",
  "data": {
    "id": 6,
    "tipoDocumento": "CC",
    "numeroDocumento": "9988776655",
    "nombre": "Carolina Gómez Herrera",
    "telefono": "+57 312 999 8877",
    "email": "carolina.gomez@arrendo360.com",
    "isActive": true,
    "createdAt": "2026-10-14T23:14:24.026Z",
    "updatedAt": "2026-10-14T23:14:24.026Z"
  },
  "timestamp": "2026-10-14T23:14:24.044Z"
}
```

##### 4.2 Caso Fallido / Falso (403 Forbidden) — Rol No Autorizado (`PROPIETARIO_CONSULTA`)
- **Petición:** `POST /api/clients`
- **Cabeceras:** `x-user-role: PROPIETARIO_CONSULTA`
- **Payload:**
```json
{
  "tipoDocumento": "CC",
  "numeroDocumento": "9988776654",
  "nombre": "Intento No Autorizado",
  "telefono": "+57 312 000 0000",
  "email": "intento.denegado@arrendo360.com"
}
```
- **Respuesta del Servidor:**
```json
HTTP/1.1 403 Forbidden
Content-Type: application/json; charset=utf-8

{
  "statusCode": 403,
  "message": "Rol PROPIETARIO_CONSULTA no autorizado. Roles permitidos: [ADMIN, ASESOR]",
  "timestamp": "2026-10-14T23:14:38.408Z",
  "path": "/api/clients"
}
```

##### 4.3 Caso Fallido / Falso (403 Forbidden) — Sin Rol Provisto
- **Petición:** `POST /api/clients` (sin cabecera de rol)
- **Respuesta del Servidor:**
```json
HTTP/1.1 403 Forbidden
Content-Type: application/json; charset=utf-8

{
  "statusCode": 403,
  "message": "Acceso denegado: se requiere uno de los roles [ADMIN, ASESOR]. Proporcione el header x-user-role o autenticación con rol.",
  "timestamp": "2026-10-14T23:16:03.581Z",
  "path": "/api/clients"
}
```

---

#### Pruebas sobre Tabla 2: `contratos` (`/api/contratos`)

##### 4.4 Caso Fallido / Falso (403 Forbidden) — Rol `PROPIETARIO_CONSULTA` en Contratos
- **Petición:** `POST /api/contratos`
- **Cabeceras:** `x-user-role: PROPIETARIO_CONSULTA`
- **Payload:**
```json
{
  "numero": "CTR-2026-001",
  "inmuebleId": 1,
  "clienteId": 1,
  "fechaInicio": "2026-11-01",
  "fechaFin": "2027-10-31",
  "valor": 1500000
}
```
- **Respuesta del Servidor:**
```json
HTTP/1.1 403 Forbidden
Content-Type: application/json; charset=utf-8

{
  "statusCode": 403,
  "message": "Rol PROPIETARIO_CONSULTA no autorizado. Roles permitidos: [ADMIN, ASESOR]",
  "timestamp": "2026-10-14T23:17:05.180Z",
  "path": "/api/contratos"
}
```

##### 4.5 Caso Exitoso de Autorización RBAC (`ADMIN`)
Al enviar `x-user-role: ADMIN`, el `RolesGuard` autoriza el paso y transfiere el control a la capa de dominio de contratos:
- **Petición:** `POST /api/contratos` con `x-user-role: ADMIN`.
- **Resultado:** Traspasa el filtro de seguridad RBAC satisfactoriamente sin error 403.

---

## 5. Pruebas Interactivas con Swagger UI

La documentación OpenAPI interactiva se encuentra disponible en `http://localhost:3002/api/docs`.

### Procedimiento para Pruebas en Swagger:
1. **Acceder a Swagger:** Abrir el navegador en `http://localhost:3002/api/docs`.
2. **Probar Endpoint OPEN:**
   - Desplegar el tag `App` o `Clients`.
   - Seleccionar `GET /api/health` o `GET /api/clients`.
   - Pulsar **Try it out** y luego **Execute** -> Se obtiene respuesta inmediata **200 OK**.
3. **Autenticarse para Obtener Token:**
   - Desplegar el tag `Autenticación`.
   - Seleccionar `POST /api/auth/login`.
   - Ingresar correo y contraseña de prueba y pulsar **Execute**.
   - Copiar el valor de `data.accessToken`.
4. **Configurar el Candado Swagger (bearerAuth):**
   - En la esquina superior derecha de Swagger, hacer clic en el botón verde **Authorize 🔓**.
   - Pegar el token en el campo `Value` (formato: `Bearer <token>` o el token JWT directamente).
   - Pulsar **Authorize** y luego **Close** (el candado ahora se muestra cerrado 🔒).
5. **Verificar Endpoints Protegidos y RBAC:**
   - Ejecutar `GET /api/auth/me` -> Retorna el perfil autenticado con status **200 OK**.
   - Probar mutaciones en `POST /api/clients` o `POST /api/contratos` con o sin el header `x-user-role` para constatar los códigos **201 Created** y **403 Forbidden**.

---

## 6. Guion Recomendado para el Video del Trabajo Autónomo

> **Duración estimada:** 5 a 7 minutos  
> **Recomendación técnica:** Grabar en resolución 1080p, pantalla dividida (Código/Swagger a la izquierda y Terminal/MySQL a la derecha).

```text
================================================================================
MINUTO A MINUTO - GUION DEL VIDEO
================================================================================

[0:00 - 0:45] INTRODUCCIÓN Y ARQUITECTURA
- Qué mostrar en pantalla: 
  * Diapositiva o portada con título: "Arrendo360 - Plataforma Integral de Gestión Inmobiliaria".
  * Estructura de carpetas en VS Code (`src/features`, `src/common/guards`, `infrastructure/database`).
- Qué decir:
  "Buenas tardes, mi nombre es [Tu Nombre]. A continuación presento la entrega final del Trabajo
  Autónomo del proyecto Arrendo360.
  El sistema está construido con Express, TypeScript y Sequelize ORM bajo la arquitectura
  modular de NestJS, implementando Clean Architecture con separación estricta entre Dominio,
  Aplicación, Infraestructura y Presentación, conectado a un motor relacional MySQL."

[0:45 - 1:45] METODOLOGÍA SDD, KANBAN Y CUMPLIMIENTO DE ISS-01 AL ISS-15
- Qué mostrar en pantalla:
  * El archivo `docs/kanban.md` mostrando todas las tarjetas en "Hecho".
  * Carpeta `backend/trazabilidad/` con los 15 archivos markdown (`ISS-01.md` al `ISS-15.md`).
- Qué decir:
  "El desarrollo siguió estrictamente la metodología Spec-Driven Development con Kanban
  y límite de trabajo en proceso WIP = 1.
  En la Fase I implementamos los ISS del 01 al 08: esqueleto, Sequelize, configuración, inmuebles,
  contratos, cobros, seeders y la feature transaccional de ventas con orden canónico anti-deadlock.
  En la Fase II cubrimos del ISS-09 al ISS-15: modelos de autenticación, hash bcrypt con coste 12,
  catálogo RBAC con roles y resources, pivotes role_users y resource_roles, guards de tres
  modalidades, rotación RTR conforme a RFC 6819 y ciclo completo de sesión."

[1:45 - 2:30] DEMOSTRACIÓN DE BASE DE DATOS Y PRUEBAS AUTOMATIZADAS
- Qué mostrar en pantalla:
  * Terminal ejecutando: `npx vitest run` (Mostrando 112/112 tests aprobados).
  * Consola o Workbench con la base de datos `Arrendo360` y sus 22 tablas.
- Qué decir:
  "Aquí podemos observar el resultado de la suite de pruebas automatizadas: 112 pruebas
  pasando al 100% en Vitest. En nuestra base de datos MySQL contamos con las 22 tablas sincronizadas
  y pobladas con seeders parametrizables e idempotentes."

[2:30 - 5:30] DEMOSTRACIÓN DE LOS 4 TIPOS DE ACCESOS (EN VIVO CON SWAGGER Y HTTP)
- Qué mostrar en pantalla:
  * Archivo `backend/http/rbac/rbac-access.http` y la interfaz Swagger en `http://localhost:3002/api/docs`.
- Puntos a demostrar paso a paso:
  1. ACCESO OPEN (Sin autenticación):
     * "Ejecutamos GET /api/health y recibimos 200 OK sin necesidad de token."
     * "Si intentamos consultar /api/auth/me sin token, el servidor rechaza con 401 Unauthorized."
  2. SOLO AUTENTICACIÓN:
     * "Enviamos credenciales correctas en POST /api/auth/login y obtenemos 200 OK con el accessToken."
     * "Si enviamos una contraseña incorrecta, el servidor responde 401 Credenciales inválidas."
  3. JWT TOKEN + REFRESH (RTR):
     * "Usamos el accessToken para consultar /api/auth/me y vemos nuestro perfil con 200 OK."
     * "Rotamos el token mediante POST /api/auth/refresh y obtenemos un nuevo par válido."
     * "Ahora intentamos reutilizar el token anterior que ya fue consumido: el sistema detecta
        el reúso fraudulento según la norma RFC 6819 y revoca la sesión con 401 Unauthorized."
  4. AUTENTICACIÓN + JWT + REFRESH + RBAC:
     * "Probamos sobre nuestras dos tablas de negocio seleccionadas: Clientes y Contratos."
     * "En Clientes: creamos un cliente enviando rol ADMIN y recibimos 201 Created."
     * "Ahora intentamos crear un cliente con el rol PROPIETARIO_CONSULTA: el RolesGuard bloquea
        el acceso y devuelve 403 Forbidden indicando que el rol no está autorizado."
     * "En Contratos: demostramos el mismo bloqueo 403 ante roles de solo lectura."

[5:30 - 6:30] CIERRE Y CONCLUSIONES
- Qué mostrar en pantalla:
  * Terminal con el servidor corriendo en el puerto 3002 (`Application running on: http://localhost:3002`).
  * El archivo `proceso.md`.
- Qué decir:
  "Con esto demostramos que el proyecto Arrendo360 cumple al 100% con los requerimientos técnicos,
  la especificación de los 15 ISS de Tecnogua, la arquitectura limpia, las transacciones ACID,
  el catálogo RBAC y la cobertura total de pruebas exitosas y rechazadas. Muchas gracias."
================================================================================
```

