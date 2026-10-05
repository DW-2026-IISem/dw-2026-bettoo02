# Arrendo360 — Backend API (Clean Architecture & DDD)

Plataforma de Administración Inmobiliaria Integral desarrollada en **NestJS** bajo los principios de **Clean Architecture**, **Domain-Driven Design (DDD)** y metodología **SDD & Kanban**.

---

## 1. Descripción del Proyecto

Arrendo360 gestiona de forma desacoplada y robusta el ciclo completo del negocio inmobiliario a través de cinco *Bounded Contexts* (`src/features/business/`):

1. **Properties:** Gestión de Propietarios e Inmuebles asociados.
2. **Leases:** Gestión de Arrendatarios y Contratos de Arrendamiento con vigencia y cánones mensuales.
3. **Receivables:** Generación periódica de Cobros Mensuales y registro y aplicación de Pagos recaudados.
4. **Owner Settlements:** Dispersión financiera y liquidación neta a Propietarios con control estricto de saldo.
5. **Maintenance:** Tickets de solicitud, catálogo de Proveedores y Órdenes de Mantenimiento correctivo/preventivo.

---

## 2. Requisitos Previos

- **Node.js:** Versión $\ge 20.x$
- **npm:** Versión $\ge 10.x$
- **Base de Datos:** Cualquier motor relacional soportado (MySQL 8.x, PostgreSQL 15+, Microsoft SQL Server o Oracle XE)
- **Base de datos creada:** `Arrendo360`

---

## 3. Configuración del Entorno (.env)

Copia el archivo de ejemplo para configurar tus credenciales locales:

```bash
cp .env.example .env
```

Configura el selector de base de datos (`DB_DIALECT`) y el bloque de conexión activo:

```dotenv
PORT=3002
NODE_ENV=development
DB_DIALECT=mysql

# Bloque MySQL
DB_MYSQL_HOST=localhost
DB_MYSQL_PORT=3306
DB_MYSQL_USERNAME=root
DB_MYSQL_PASSWORD=secreto
DB_MYSQL_NAME=Arrendo360
```

> **Fail-Fast:** El sistema valida síncronamente al arrancar que todas las variables requeridas para el motor activo existan. Si falta alguna, el proceso aborta de inmediato indicando exactamente qué variable falta.

---

## 4. Instalación y Ejecución

```bash
# 1. Instalar dependencias
npm install

# 2. Liberar el puerto 3002 y arrancar en modo desarrollo
npm run start:dev

# 3. Ejecutar pruebas unitarias automatizadas (Vitest)
npm run test

# 4. Análisis estático y linter (Oxlint)
npm run lint

# 5. Compilación de producción
npm run build
```

---

## 5. Endpoints y Documentación Swagger

- **Healthcheck:** `GET http://localhost:3002/api/health` → `{"statusCode":200,"data":{"status":"ok"}}`
- **Documentación Swagger UI:** `http://localhost:3002/api/docs`
- **Prefijo Global:** Todos los endpoints responden bajo `/api`.

### Resumen de Rutas Principales:
| Dominio | Endpoint Base | Operaciones Soportadas |
|---------|---------------|------------------------|
| **Salud** | `/api/health` | `GET` |
| **Properties** | `/api/propietarios`, `/api/inmuebles` | `GET`, `POST`, `PATCH`, `DELETE` |
| **Leases** | `/api/arrendatarios`, `/api/contratos` | `GET`, `POST`, `PATCH`, `DELETE` |
| **Receivables** | `/api/cobros`, `/api/pagos` | `GET`, `POST`, `PATCH`, `DELETE` |
| **Owner Settlements** | `/api/distribuciones-pago` | `GET`, `POST`, `PATCH`, `DELETE` |
| **Maintenance** | `/api/tickets-mantenimiento`, `/api/proveedores`, `/api/ordenes-mantenimiento` | `GET`, `POST`, `PATCH`, `DELETE` |

---

## 6. Libreto de la Demo (Recorrido E2E del Negocio)

Este guion permite verificar el flujo completo de vida inmobiliaria de la plataforma:

1. **Arranque e Idempotencia:**
   Arrancar la aplicación (`npm run start:dev`). El `DatabaseSeederService` crea las tablas con `alter: false` y siembra datos iniciales (`findOrCreate`). Arrancar nuevamente no duplica filas.
2. **Crear Inmueble:**
   `POST /api/inmuebles` asociando el inmueble al propietario (`propietarioId: 1`). Responde `201 Created`.
3. **Crear Contrato de Arrendamiento:**
   `POST /api/contratos` vinculando inmueble y arrendatario (`arrendatarioId: 1`). Responde `201 Created`. Si se intenta repetir el mismo `numero` de contrato, responde `409 Conflict`.
4. **Emitir Cobro Mensual:**
   `POST /api/cobros` con `referenciaId` (ID del contrato activo) y `valor: 1500000`. Responde `201 Created`. Si el contrato no existe, responde `404 Not Found`.
5. **Registrar Pago y Transición de Estado:**
   `POST /api/pagos` con `referenciaId` (ID del cobro) y `monto: 1500000`. El cobro transiciona automáticamente a estado `PAGADO`.
6. **Dispersión y Liquidación a Propietario:**
   `POST /api/distribuciones-pago` con `pagoId: 1`, `propietarioId: 1` y `monto: 1350000` (descontando 10% de administración). Responde `201 Created`.
7. **Control de Invariante de Saldo (Gate Estricto):**
   `POST /api/distribuciones-pago` intentando liquidar `monto: 1800000` (superior al recaudo de 1500000) → Responde `409 Conflict` (`El monto a distribuir no puede superar el monto recaudado del pago`) y no crea fila.

---

## 7. Arquitectura y Tecnologías

- **Framework:** NestJS 12
- **ORM:** Sequelize TypeScript 2.1 con multi-dialecto (`mysql2`, `pg`, `tedious`, `oracledb`)
- **Testing:** Vitest con pruebas unitarias de dominio e invariantes
- **Linter:** Oxlint (Type-aware)
- **Metodología:** SDD (Spec-Driven Development) & Kanban (Pista Solo Business - 7 Issues)
