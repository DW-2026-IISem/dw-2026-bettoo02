# Evidencia de Verificación: ProductTypes (Tipos de Producto / Inmueble), Reglas de Negocio y Seeder

> **Proyecto:** Arrendo360 (`dw-2026-bettoo02`)\
> **Módulo:** ProductTypes (`ProductTypesController`, `ProductTypesModule`)\
> **Arquitectura:** Clean Architecture & Domain-Driven Design (DDD)\
> **Fecha de ejecución:** 2026-10-06\
> **Entorno de ejecución:** Node.js v22 / NestJS v11 / Vitest v4 / TypeScript / Sequelize

------------------------------------------------------------------------

## 1. Resumen Ejecutivo

En la plataforma **Arrendo360**, el bounded context **ProductTypes (Tipos de Producto)** modela la tipología y categorización de los activos inmobiliarios (e.g. *Apartamento Residencial*, *Casa Campestre*, *Local Comercial*, *Oficina Corporativa*, *Bodega Industrial*). Esta clasificación es fundamental para las reglas de tasación, contratos de arrendamiento y liquidación de recaudos.

Se diseñó, implementó y validó el ciclo de vida completo de **ProductTypes**, integrando:
1. **Reglas de Negocio de Dominio Estrictas:**
   - **RN-PT-01 (Unicidad de Nombre):** Prohibición de duplicados por nombre normalizado (insensible a mayúsculas y espacios en blanco), arrojando `ConflictException` (HTTP 409).
   - **RN-PT-02 (Normalización y Sanitización):** Limpieza automática de espacios (`trim()`) en `name` y `description`.
   - **RN-PT-03 (Integridad de Estado):** El campo `status` solo admite valores `'active'` o `'inactive'`, con valor por defecto `'active'`.
   - **RN-PT-04 (Actualizaciones Completas y Parciales):** Soporte de actualización total (`PUT`) y modificación granular (`PATCH`), validando colisiones de nombre con otros registros existentes.
   - **RN-PT-05 (Ciclo de Vida Lógico y Físico):** Eliminación física permanente (`DELETE /api/tipos-producto/:id`) con código HTTP 204 No Content, y endpoints atómicos de desactivación/reactivación lógica (`PATCH :id/deactivate` y `PATCH :id/activate`).
2. **Multi-enrutamiento por Alias REST:**
   - Controlador `@Controller(['tipos-producto', 'product-types'])` con soporte transparente para rutas en español e inglés: `/api/tipos-producto` y `/api/product-types`.
3. **Seeder Idempotente y Parametrizable (`DatabaseSeederService`):**
   - Siembra basada en `ProductTypeModel.findOrCreate`, garantizando ejecuciones repetidas y concurrentes sin duplicación de registros ni colisiones de claves.
   - Jerarquía de conteo dinámico: Argumentos CLI (`--product-types=N` / `--product_types=N`) > Variables de entorno (`SEED_PRODUCT_TYPES=N`) > Conteo por defecto (`DEFAULT_SEED_COUNTS`).
4. **Validación Automatizada Integral:**
   - **64 de 64 pruebas aprobadas al 100%** en Vitest, incluyendo 19 pruebas dedicadas a ProductTypes en `test/product-types.spec.ts`.

------------------------------------------------------------------------

## 2. Especificación Arquitectónica y Reglas de Negocio

### 2.1 Mapeo de Capas Clean Architecture

```mermaid
flowchart TD
    subgraph Presentation["Capa de Presentación (HTTP)"]
        PC["ProductTypesController<br/>['/tipos-producto', '/product-types']"]
        VP["ValidationPipe (Whitelist, Transform)"]
        DOC["OpenAPI / Swagger Annotations"]
    end

    subgraph Application["Capa de Aplicación (Use Cases & DTOs)"]
        UC1["CreateProductTypeUseCase (RN-PT-01)"]
        UC2["UpdateProductTypeUseCase (PUT / PATCH)"]
        UC3["DeleteProductTypeUseCase (Físico)"]
        UC4["ListProductTypesUseCase (Paginación/Filtros)"]
        UC5["GetProductTypeUseCase (Búsqueda por ID)"]
        MAP["ProductTypeMapper"]
    end

    subgraph Domain["Capa de Dominio (Entities & Interfaces)"]
        ENT["Entity: ProductType<br/>- activar()<br/>- desactivar()<br/>- esActivo()<br/>- validarInvariantes()"]
        REP_INT["IProductTypeRepository<br/>- create()<br/>- update()<br/>- delete()<br/>- findById()<br/>- findByName()<br/>- findAll()"]
    end

    subgraph Infrastructure["Capa de Infraestructura (Persistencia & Seeders)"]
        REP_IMPL["ProductTypeRepository (Sequelize)"]
        MOD["ProductTypeModel (tableName: 'product_types')"]
        SEED["DatabaseSeederService (seedProductTypes)"]
        RUN["SeedersRunner CLI (counts.ts)"]
    end

    PC --> VP --> UC1 & UC2 & UC3 & UC4 & UC5
    UC1 & UC2 & UC3 & UC4 & UC5 --> REP_INT
    UC1 & UC2 & UC4 & UC5 --> MAP
    REP_INT <|.. REP_IMPL
    REP_IMPL --> MOD
    SEED --> MOD
    RUN --> SEED
    ENT -.->|Reglas de Negocio y Estados| Application
```

### 2.2 Matriz de Reglas de Negocio (Business Rules)

| Identificador | Nombre de la Regla | Capa Responsable | Comportamiento del Sistema | Código HTTP |
|:---|:---|:---|:---|:---:|
| **RN-PT-01** | Unicidad de Nombre | Dominio / Aplicación | Si el nombre normalizado ya existe en la base de datos, se cancela la operación y se lanza `ConflictException`. | `409 Conflict` |
| **RN-PT-02** | Normalización y Sanitización | Dominio / DTO | Sanitización automática con `trim()` en nombre y descripción. Nombre obligatorio de máximo 100 caracteres. | `201 Created` / `400 Bad Request` |
| **RN-PT-03** | Dominio de Estados | Dominio / DTO | Admite únicamente valores `'active'` o `'inactive'`. Valor por defecto `'active'`. | `200 OK` / `201 Created` |
| **RN-PT-04** | Flexibilidad de Mutación | Aplicación / Repositorio | Soporta actualización total (`PUT`) y actualización parcial (`PATCH`). Si cambia el nombre, valida unicidad contra otros IDs. | `200 OK` / `409 Conflict` |
| **RN-PT-05** | Ciclo de Vida Lógico Atómico | Presentación / Aplicación | Endpoints dedicados `PATCH :id/deactivate` y `PATCH :id/activate` alternan el estado sin requerir payloads complejos. | `200 OK` |
| **RN-PT-06** | Enrutamiento Multilingüe | Presentación | `@Controller(['tipos-producto', 'product-types'])` atiende indistintamente `/api/tipos-producto` y `/api/product-types`. | `200 OK` / `201 Created` |

------------------------------------------------------------------------

## 3. Especificación del Seeder Idempotente (`DatabaseSeederService`)

El servicio `DatabaseSeederService` incorpora la siembra automatizada e idempotente de tipos de producto en `src/infrastructure/database/seeders/database-seeder.service.ts`.

### 3.1 Dataset Base de Tipos de Producto Sembrados (`INITIAL_PRODUCT_TYPES`)

| # | Nombre del Tipo | Descripción | Estado (`status`) | Propósito de Prueba |
|:---:|:---|:---|:---:|:---|
| **1** | `Apartamento Residencial` | Vivienda multifamiliar urbana para arriendo de vivienda | `active` | Inmueble residencial estándar |
| **2** | `Casa Campestre` | Inmueble unifamiliar campestre con zonas verdes | `active` | Inmueble unifamiliar suburbano |
| **3** | `Local Comercial` | Espacio para comercio minorista o servicios en centro comercial/calle | `active` | Inmueble comercial |
| **4** | `Oficina Corporativa` | Espacio empresarial para actividades administrativas y servicios profesionales | `active` | Inmueble empresarial |
| **5** | `Bodega Industrial Inactiva` | Espacio de almacenamiento logístico en desuso para pruebas de estado inactivo | `inactive` | **Caso de control inactivo para pruebas** |

### 3.2 Lógica de Idempotencia y Parametrización CLI

```typescript
// Implementación de findOrCreate para evitar duplicados en reinicios
for (const item of data) {
  const [, created] = await ProductTypeModel.findOrCreate({
    where: { name: item.name },
    defaults: {
      name: item.name,
      description: item.description ?? null,
      status: item.status,
    },
  });
  if (created) createdCount++;
}
```

- **Ejecución vía CLI parametrizada:**
  ```bash
  # Ejecutar con 8 tipos de producto parametrizados
  npm run db:seed -- --product-types=8

  # O mediante variable de entorno
  SEED_PRODUCT_TYPES=10 npm run db:seed
  ```

------------------------------------------------------------------------

## 4. Catálogo de Endpoints REST y Archivos `.http`

Se diseñó la colección interactiva de pruebas en `backend/http/product-types/`:

| Método | Endpoint | Alias en Inglés | Descripción | Códigos HTTP |
|:---|:---|:---|:---|:---:|
| `GET` | `/api/tipos-producto` | `/api/product-types` | Listar tipos de producto con filtros (`status`, `search`, `page`, `limit`) | `200 OK` |
| `GET` | `/api/tipos-producto/:id` | `/api/product-types/:id` | Consultar detalle de un tipo de producto por ID | `200 OK`, `404 Not Found` |
| `POST` | `/api/tipos-producto` | `/api/product-types` | Crear nuevo tipo de producto (valida nombre único) | `201 Created`, `409 Conflict`, `400 Bad Request` |
| `PUT` | `/api/tipos-producto/:id` | `/api/product-types/:id` | Actualización total de campos | `200 OK`, `404 Not Found`, `409 Conflict` |
| `PATCH` | `/api/tipos-producto/:id` | `/api/product-types/:id` | Actualización parcial de campos | `200 OK`, `404 Not Found`, `409 Conflict` |
| `PATCH` | `/api/tipos-producto/:id/deactivate` | `/api/product-types/:id/deactivate` | Eliminación lógica / Desactivación (`status = 'inactive'`) | `200 OK`, `404 Not Found` |
| `PATCH` | `/api/tipos-producto/:id/activate` | `/api/product-types/:id/activate` | Reactivación lógica (`status = 'active'`) | `200 OK`, `404 Not Found` |
| `DELETE` | `/api/tipos-producto/:id` | `/api/product-types/:id` | Eliminación física permanente | `204 No Content`, `404 Not Found` |

------------------------------------------------------------------------

## 5. Salida Literal de la Suite de Pruebas Automatizadas (Vitest)

Ejecución de la suite completa de pruebas unitarias y de integración (`npm test`):

```text
> backend@0.0.1 test
> vitest run

 RUN  v4.1.11 /home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/backend

 ✓ test/distribucion-pago.entity.spec.ts (5 tests) 8ms
 ✓ test/rbac.guard.spec.ts (5 tests) 9ms
 ✓ src/app.controller.spec.ts (2 tests) 164ms
 ✓ test/product-types.spec.ts (19 tests) 207ms
       ✓ 1. Entidad de Dominio ProductType y Reglas de Estado
             ✓ debe crearse con estado active por defecto y normalizar el nombre
             ✓ debe permitir transiciones de estado entre active e inactive
             ✓ debe lanzar error de dominio si el nombre está vacío
             ✓ debe lanzar error de dominio si el status no es active ni inactive
       ✓ 2. Casos de Uso y Reglas de Negocio (CRUD)
             ✓ CreateProductTypeUseCase: Creación exitosa y sanitización de espacios
             ✓ CreateProductTypeUseCase: Rechazo con ConflictException (409) si el nombre ya existe
             ✓ ListProductTypesUseCase: Retorna lista paginada y permite filtrar por status
             ✓ GetProductTypeUseCase: Retorna detalle para ID existente o NotFoundException (404)
             ✓ UpdateProductTypeUseCase: Actualización exitosa y prevención de colisión de nombre
             ✓ DeleteProductTypeUseCase: Eliminación física exitosa o NotFoundException si no existe
       ✓ 3. Seeder de ProductTypes (DatabaseSeederService & counts.ts)
             ✓ debe contener la definición de 5 tipos de producto iniciales
             ✓ debe simular siembra idempotente sin duplicar registros en ejecuciones repetidas
             ✓ resolveSeedCounts: resuelve conteos de product_types desde CLI, env y defaults
             ✓ DatabaseSeederService: seedProductTypes maneja conteos 0 y negativos
       ✓ 4. Endpoints HTTP y Rutas Alias (/api/tipos-producto y /api/product-types)
             ✓ GET /api/tipos-producto y GET /api/product-types responden HTTP 200 con formato estándar
             ✓ POST /api/tipos-producto crea registro (201) y rechaza duplicado (409)
             ✓ PUT y PATCH /api/tipos-producto/:id actualizan datos del registro
             ✓ PATCH /api/tipos-producto/:id/deactivate y /activate alternan el ciclo de vida lógico
             ✓ DELETE /api/tipos-producto/:id elimina físicamente el registro (204)
 ✓ test/clients.spec.ts (21 tests) 229ms
 ✓ test/auth.spec.ts (12 tests) 1770ms

 Test Files  6 passed (6)
      Tests  64 passed (64)
   Duration  3.03s (transform 1.03s, setup 0ms, import 5.32s, tests 2.39s, environment 1ms)
```

------------------------------------------------------------------------

## 6. Verificación de Compilación y Runner CLI

### 6.1 Compilación TypeScript
```bash
$ npm run build
> backend@0.0.1 build
> nest build
[OK - Compilación limpia sin errores]
```

### 6.2 Ejecución de Seeder Runner CLI
```bash
$ npm run db:seed -- --product-types=8
🌱 [Arrendo360 SeedersRunner] Iniciando siembra de base de datos...
📊 Conteos configurados: { clients: 5, product_types: 8 }
[Nest] LOG [NestFactory] Starting Nest application...
[Nest] LOG [InstanceLoader] ProductTypesModule dependencies initialized
...
✅ [Arrendo360 SeedersRunner] Siembra finalizada exitosamente.
```

------------------------------------------------------------------------

## 7. Conclusiones y Cumplimiento de Calidad (DoD)

1. **Cumplimiento Funcional:** Se verificaron las reglas de negocio de ProductTypes (`RN-PT-01` a `RN-PT-06`), garantizando unicidad de nombre, sanitización, ciclo de vida lógico atómico y persistencia en Sequelize.
2. **Idempotencia y Parametrización:** `DatabaseSeederService` permite siembras reproducibles con conteos dinámicos (`--product-types=N`) sin riesgo de colisiones.
3. **Multi-enrutamiento Estandarizado:** Se habilitaron los endpoints `/api/tipos-producto` y `/api/product-types`.
4. **Cobertura Automatizada:** El 100% de las 64 pruebas automatizadas del proyecto (6 suites) pasan satisfactoriamente en Vitest.
5. **Políticas DoD y Kanban (WIP = 1):** La tarjeta cumple con los criterios de aceptación y está lista para revisión y merge.

