# Evidencia de Verificación: Products (Productos / Inmuebles), Relación ProductType, Reglas de Negocio y Seeder

> **Proyecto:** Arrendo360 (`dw-2026-bettoo02`)\
> **Módulo:** Products (`ProductsController`, `ProductsModule`, `ProductModel`)\
> **Arquitectura:** Clean Architecture & Domain-Driven Design (DDD)\
> **Fecha de ejecución:** 2026-10-06\
> **Entorno de ejecución:** Node.js v22 / NestJS v11 / Vitest v4 / TypeScript / Sequelize

------------------------------------------------------------------------

## 1. Resumen Ejecutivo

En la plataforma inmobiliaria **Arrendo360**, el bounded context **Products (Productos / Inmuebles)** representa los activos gestionados (unidades de inventario o predios tangibles) y sus características comerciales: nombre, marca o fabricante, precio de alquiler/venta (`price`), stock mínimo (`min_stock`), cantidad disponible (`quantity`) y su tipología vinculada mediante clave foránea obligatoria (`product_type_id`).

Se completó la especificación, diseño, codificación y verificación integral del módulo **Products** bajo Clean Architecture y DDD, incorporando:
1. **Relación Bidireccional ProductType ↔ Product:**
   - En base de datos Sequelize: `Product.belongsTo(ProductType, { foreignKey: 'product_type_id', as: 'product_type' })` y `ProductType.hasMany(Product, { foreignKey: 'product_type_id', as: 'products' })`.
2. **Reglas de Negocio Estrictas:**
   - **RN-PROD-01 (Validación de Tipo de Producto Activo):** Tanto en creación (`POST`) como en actualización (`PUT` / `PATCH`), se verifica que el tipo de producto referenciado exista (HTTP 404 si no existe) y se encuentre en estado activo (`status === 'active'`). Si el tipo está inactivo, se cancela la operación con `BadRequestException` (HTTP 400 "Product type must be active").
   - **RN-PROD-02 (Normalización y Sanitización):** Aplicación automática de `trim()` en campos de texto (`name`, `brand`).
   - **RN-PROD-03 (Validación de Rangos Numéricos):** Regla de negocio en entidad: `price > 0`, `min_stock >= 0`, `quantity >= 0`, arrojando `BusinessRuleException` o errores de validación.
   - **RN-PROD-04 (Actualización Completa y Parcial):** Soporte total para `PUT` (reemplazo completo) y `PATCH` (modificación selectiva con revalidación del tipo de producto si cambia).
   - **RN-PROD-05 (Ciclo de Vida Lógico):** Endpoints dedicados `PATCH /api/productos/:id/deactivate` y `PATCH /api/productos/:id/activate`.
   - **RN-PROD-06 (Baja Permanente):** Eliminación física `DELETE /api/productos/:id` con código de estado HTTP 204 No Content.
3. **Multi-enrutamiento Dual:**
   - Controlador decorado con `@Controller(['productos', 'products'])`, permitiendo llamadas a `/api/productos` (estándar del manual del laboratorio) y `/api/products` (estándar REST internacional).
4. **Seeder Idempotente y Parametrizable:**
   - Integrado en `DatabaseSeederService` con `INITIAL_PRODUCTS` (10 ítems iniciales) y enlace aleatorio/cíclico a tipos de producto activos.
   - Parámetros por CLI (`--products=N` / `--products_count=N`) y variable de entorno `SEED_PRODUCTS=N`.
5. **Colección Interactiva REST Client (.http):**
   - Archivos `products.get.http`, `products.create.http`, `products.update.http`, `products.delete.http` ubicados en `http/products/`.
6. **Validación Automatizada Integral:**
   - **88 de 88 pruebas aprobadas al 100%** en Vitest, incluyendo 24 pruebas dedicadas a Products en `test/products.spec.ts`.
   - Compilación limpia con `npm run build` (`nest build`) finalizada con código 0.

------------------------------------------------------------------------

## 2. Especificación Arquitectónica y Relación con ProductType

### 2.1 Diagrama de Capas y Relaciones

```mermaid
flowchart TD
    subgraph Presentation["Capa de Presentación (HTTP)"]
        PC["ProductsController<br/>['/productos', '/products']"]
        VP["ValidationPipe (Whitelist, Transform)"]
        DOC["Swagger / OpenAPI"]
    end

    subgraph Application["Capa de Aplicación (Use Cases & DTOs)"]
        UC1["CreateProductUseCase (Valida tipo activo)"]
        UC2["UpdateProductUseCase (PUT / PATCH)"]
        UC3["DeleteProductUseCase (Físico / Lógico)"]
        UC4["ListProductsUseCase (Paginación / Filtros)"]
        UC5["GetProductUseCase (Búsqueda por ID)"]
        MAP["ProductMapper"]
    end

    subgraph Domain["Capa de Dominio (Entities & Contracts)"]
        ENT_P["Entity: Product<br/>- name, brand, price, minStock, quantity<br/>- productTypeId, status<br/>- activar(), desactivar()<br/>- validarInvariantes()"]
        REP_P["IProductRepository"]
        REP_PT["IProductTypeRepository"]
    end

    subgraph Infrastructure["Capa de Infraestructura (Sequelize & Seeders)"]
        MOD_P["ProductModel<br/>(table: 'products')"]
        MOD_PT["ProductTypeModel<br/>(table: 'product_types')"]
        SEED["DatabaseSeederService<br/>(seedProducts)"]
        RUN["SeedersRunner CLI (--products=N)"]
    end

    PC --> VP --> UC1 & UC2 & UC3 & UC4 & UC5
    UC1 & UC2 --> REP_PT
    UC1 & UC2 & UC3 & UC4 & UC5 --> REP_P
    UC1 & UC2 & UC4 & UC5 --> MAP
    REP_P <|.. MOD_P
    REP_PT <|.. MOD_PT
    MOD_P -.->|belongsTo product_type_id| MOD_PT
    MOD_PT -.->|hasMany products| MOD_P
    SEED --> MOD_P & MOD_PT
    RUN --> SEED
    ENT_P -.->|Reglas de Negocio| Application
```

### 2.2 Matriz de Reglas de Negocio (Business Rules)

| Identificador | Regla de Negocio | Capa | Comportamiento del Sistema | Código HTTP |
|:---|:---|:---|:---|:---:|
| **RN-PROD-01** | Tipo de Producto Activo Obligatorio | Aplicación | En `POST`, `PUT` o `PATCH` con `product_type_id`, verifica que el tipo exista (`404`) y que su estado sea `active`. Si está inactivo, rechaza con `BadRequestException`. | `400 Bad Request` / `404 Not Found` |
| **RN-PROD-02** | Sanitización y Longitud de Texto | Dominio / DTO | Sanitización con `trim()` en `name` y `brand`. Ambos campos deben tener longitud mínima de 2 caracteres. | `201 Created` / `400 Bad Request` |
| **RN-PROD-03** | Invariantes Numéricas | Dominio / DTO | `price > 0`, `min_stock >= 0`, `quantity >= 0`. Previene stocks o precios negativos en el catálogo. | `400 Bad Request` / `409 Conflict` |
| **RN-PROD-04** | Mutación Dual (PUT / PATCH) | Aplicación | `PUT` reemplaza completamente los datos. `PATCH` modifica campos individuales; si se incluye `product_type_id`, se revalida el tipo activo. | `200 OK` |
| **RN-PROD-05** | Ciclo de Vida Lógico | Presentación / Dominio | `PATCH :id/deactivate` asigna `status = 'inactive'`. `PATCH :id/activate` asigna `status = 'active'`. | `200 OK` |
| **RN-PROD-06** | Eliminación Permanente | Presentación / Infra | `DELETE :id` remueve el registro físico de la tabla `products` y responde con `204 No Content`. | `204 No Content` / `404 Not Found` |

------------------------------------------------------------------------

## 3. Especificación del Seeder Idempotente (`DatabaseSeederService`)

El servicio `DatabaseSeederService` incorpora `seedProducts(count)` asegurando que los productos se siembren enlazados a tipos de producto activos existentes:

### 3.1 Catálogo Base de Productos Sembrados (`INITIAL_PRODUCTS`)

| # | Nombre del Producto | Marca | Precio Unitario | Stock Mínimo | Cantidad | Estado |
|:---:|:---|:---|:---:|:---:|:---:|:---:|
| **1** | Laptop Gamer Legion 5 | Lenovo | $1,299.99 | 5 | 35 | `active` |
| **2** | Smart TV 55 Pulgadas 4K Crystal | Samsung | $649.50 | 3 | 20 | `active` |
| **3** | Monitor UltraWide 29 Pulgadas | LG | $289.00 | 4 | 45 | `active` |
| **4** | Teclado Mecánico K70 RGB | Corsair | $119.99 | 8 | 60 | `active` |
| **5** | Silla Ergonómica V1 Pro | Sihoo | $235.00 | 2 | 15 | `active` |
| **6** | Auriculares Inalámbricos WH-1000XM5 | Sony | $349.99 | 5 | 25 | `active` |
| **7** | Tablet iPad Pro 11 Pulgadas | Apple | $899.00 | 3 | 18 | `active` |
| **8** | Escritorio Eléctrico Ajustable | FlexiSpot | $379.50 | 2 | 10 | `active` |
| **9** | Mouse Inalámbrico MX Master 3S | Logitech | $99.00 | 10 | 80 | `active` |
| **10** | Disco SSD NVMe 1TB PCIe 4.0 | Kingston | $79.99 | 10 | 90 | `active` |

------------------------------------------------------------------------

## 4. Evidencias de Ejecución (Salidas Literales de Terminal)

### 4.1 Ejecución Completa de Pruebas Automatizadas (`npm test` — Vitest)

```text
> backend@0.0.1 test
> vitest run

 RUN  v4.1.11 /home/betto_ubuntu/ia-lab/dw-2026-bettoo02/projects/app-Arrendo360/backend

 ✓ test/distribucion-pago.entity.spec.ts (5 tests) 8ms
 ✓ test/rbac.guard.spec.ts (5 tests) 7ms
 ✓ src/app.controller.spec.ts (2 tests) 160ms
 ✓ test/products.spec.ts (24 tests) 267ms
 ✓ test/product-types.spec.ts (19 tests) 287ms
 ✓ test/clients.spec.ts (21 tests) 248ms
 ✓ test/auth.spec.ts (12 tests) 1584ms

 Test Files  7 passed (7)
      Tests  88 passed (88)
   Start at  09:18:33
   Duration  2.86s (transform 1.37s, setup 0ms, import 6.69s, tests 2.56s, environment 1ms)
```

### 4.2 Compilación Limpia del Proyecto (`npm run build` — NestJS Build)

```text
> backend@0.0.1 build
> nest build
```
*(Código de salida: 0 — Compilación TypeScript limpia sin errores).*

### 4.3 Ejecución del Runner CLI de Seeders con Conteo Parametrizable (`npm run db:seed`)

```text
> backend@0.0.1 db:seed
> ts-node -r tsconfig-paths/register src/infrastructure/database/seeders/run-seeders.ts --products=8

🌱 [Arrendo360 SeedersRunner] Iniciando siembra de base de datos...
📊 Conteos configurados: { clients: 5, product_types: 5, products: 8 }
[Nest] 39  - 10/06/2026, 9:18:47 AM     LOG [NestFactory] Starting Nest application...
[Nest] 39  - 10/06/2026, 9:18:47 AM     LOG [InstanceLoader] ConfigHostModule dependencies initialized +21ms
[Nest] 39  - 10/06/2026, 9:18:47 AM     LOG [InstanceLoader] LoggerModule dependencies initialized +0ms
[Nest] 39  - 10/06/2026, 9:18:47 AM     LOG [InstanceLoader] JwtModule dependencies initialized +0ms
[Nest] 39  - 10/06/2026, 9:18:47 AM     LOG [InstanceLoader] AppModule dependencies initialized +88ms
[Nest] 39  - 10/06/2026, 9:18:47 AM     LOG [InstanceLoader] ConfigModule dependencies initialized +0ms
[Nest] 39  - 10/06/2026, 9:18:47 AM     LOG [InstanceLoader] AuthModule dependencies initialized +1ms
[Nest] 39  - 10/06/2026, 9:18:47 AM     LOG [InstanceLoader] ProductTypesModule dependencies initialized +1ms
[Nest] 39  - 10/06/2026, 9:18:47 AM     LOG [InstanceLoader] PropertiesModule dependencies initialized +0ms
[Nest] 39  - 10/06/2026, 9:18:47 AM     LOG [InstanceLoader] LeasesModule dependencies initialized +1ms
[Nest] 39  - 10/06/2026, 9:18:47 AM     LOG [InstanceLoader] ReceivablesModule dependencies initialized +0ms
[Nest] 39  - 10/06/2026, 9:18:47 AM     LOG [InstanceLoader] MaintenanceModule dependencies initialized +0ms
[Nest] 39  - 10/06/2026, 9:18:47 AM     LOG [InstanceLoader] ProductsModule dependencies initialized +0ms
[Nest] 39  - 10/06/2026, 9:18:47 AM     LOG [InstanceLoader] OwnerSettlementsModule dependencies initialized +0ms
```

------------------------------------------------------------------------

## 5. Matriz de Criterios de Aceptación (Quality Gate)

| Criterio | Descripción | Estado | Evidencia / Mecanismo de Validación |
|:---|:---|:---:|:---|
| **AC-1** | Modelo `ProductModel` en tabla `products` con clave foránea `product_type_id` | **Aprobado** | `ProductModel` con decoradores Sequelize-TypeScript `@ForeignKey` y `@BelongsTo`. |
| **AC-2** | Asociación bidireccional ProductType ↔ Product | **Aprobado** | `@BelongsTo` en `ProductModel` y `@HasMany` en `ProductTypeModel`. |
| **AC-3** | Validación estricta de Tipo de Producto activo (RN-PROD-01) | **Aprobado** | Retorna HTTP 400 "Product type must be active" si está inactivo y HTTP 404 si no existe. |
| **AC-4** | Sanitización con trim y validaciones numéricas (RN-PROD-02 / RN-PROD-03) | **Aprobado** | Precios > 0, stock >= 0 y nombres/marcas sin espacios residuales. |
| **AC-5** | Mutación completa (PUT) y granular (PATCH) | **Aprobado** | Use cases `UpdateProductUseCase` y endpoints en `ProductsController`. |
| **AC-6** | Ciclo de vida lógico (`PATCH :id/deactivate`, `:id/activate`) y baja física (`DELETE :id` HTTP 204) | **Aprobado** | Use case `DeleteProductUseCase` con cobertura de pruebas unitarias y HTTP. |
| **AC-7** | Seeder idempotente parametrizable por CLI (`--products=N`) y variables de entorno | **Aprobado** | `DatabaseSeederService.seedProducts` y `counts.ts` probados. |
| **AC-8** | Suite de pruebas al 100% PASS y compilación sin errores | **Aprobado** | 88/88 tests pasando en Vitest (24 específicos de Products) y `nest build` OK. |

------------------------------------------------------------------------

## 6. Dictamen de Aprobación

El feature **Products (Productos / Inmuebles)** cumple rigurosamente con los estándares de **Clean Architecture**, **Domain-Driven Design (DDD)** y las especificaciones del laboratorio. Todos los criterios de aceptación están verificados y documentados.

