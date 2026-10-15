> **Workspace:** `app-Arrendo360` (repo `dw-2026-bettoo02`) · **Proyecto:** `Arrendo360` · **Pista:** Business Core + Transacciones ACID · **Guion:** `docs/Guion_IA_Desarrollo_Software.md` · **Metodología:** `docs/Metodologia_Desarrollo_Software_SDD_Kanban.md` · **Arquitectura:** `docs/Prompt.md`

# ISS-08 — Feature Sale + feature ProductSale (Ventas, Transacciones ACID y Control de Stock)

**Naturaleza:** práctico (desarrollo de software backend)  
**Issue GitHub:** `dw-2026-bettoo02 #8`  
**Responsable (desarrollador):** Alberto José Ortiz Ortiz (@bettoo02)  
**Revisor humano:** Ing. Alberto José Ortiz Ortiz  
**Dependencias:** ISS-07 (Cierre inicial Business) e ISS-03 (Clients) en **Hecho**  
**Commit esperado:** `feat(iss-08): feature sales, productsales, transacciones acid y stock Refs #8`

> El estado del issue **vive en el tablero Kanban**, no en este archivo. Cada sección indica en qué estado se diligencia; hasta entonces se deja como está.  
> **El Gate de ISS-08 = Cierre oficial de la Fase I (Business) según el estándar curricular universitario.**

---

## 1. SDD — se escribe en **Preparado**

**OBJ:** Al finalizar, el sistema permitirá registrar ventas y sus líneas de detalle de forma transaccional (ACID), descontando inventario de productos en tiempo real, previniendo deadlocks en InnoDB mediante orden canónico de bloqueo (`sales → products ASC → product_sales`), gestionando reconciliación por deltas en actualizaciones y restituyendo el stock en cancelaciones lógicas o físicas.

**SPEC (qué debe quedar):**
- Entidades puras de dominio: `Sale` y `ProductSale` con cálculo atómico de subtotal, impuesto (19%), descuentos y total de línea.
- Modelos Sequelize: `SaleModel` (`sales`) y `ProductSaleModel` (`product_sales`) con tipos `DECIMAL(12,2)` y relaciones bidireccionales con `ArrendatarioModel` (`clients`) y `ProductModel` (`products`).
- Repositorios transaccionales: `SaleRepository` y `ProductSaleRepository` con soporte de `findByIdForUpdate` (`SELECT ... FOR UPDATE`).
- Casos de uso: `CreateSaleUseCase`, `GetSaleUseCase`, `ListSalesUseCase`, `UpdateSaleUseCase`, `DeleteSaleUseCase`, `CreateProductSaleUseCase`, `UpdateProductSaleUseCase`, `DeleteProductSaleUseCase`.
- Controladores multilingües: `@Controller(['ventas', 'sales'])` y `@Controller(['detalle-ventas', 'product-sales'])`.
- Seeder CLI parametrizable con banderas `--sales=N` y `--product-sales=N`.
- Colección interactiva de archivos `.http` para ventas y líneas de detalle.
- Pruebas automatizadas en Vitest con cobertura completa de transacciones y reversiones de stock.

**REQ (restricciones):**
- El cliente debe existir y estar activo (`status === 'active'`).
- La creación de la cabecera y todas sus líneas debe ocurrir dentro de una única transacción ACID. Si un producto no tiene suficiente cantidad, se produce rollback inmediato y no se persiste nada.
- El orden canónico de adquisición de bloqueos en InnoDB debe ser: `sales` → `products` ordenados por `id` ascendente → `product_sales`.
- Las anulaciones o eliminaciones deben restituir el inventario físico al producto original.

**AC (Dado → Cuando → Entonces; deciden el Gate):**
- [x] **AC-1** Dado un cliente activo y productos con stock disponible; cuando se envía `POST /api/ventas` con líneas de detalle; entonces responde `201 Created`, persiste cabecera y líneas, y descuenta el stock de cada producto.
- [x] **AC-2** Dado un intento de venta con cantidad superior al inventario de un producto; cuando se envía la petición; entonces responde `400 Bad Request` indicando stock insuficiente y ningún registro es creado (rollback atómico).
- [x] **AC-3** Dado una línea de venta existente; cuando se actualiza la cantidad vía `PUT` o `PATCH /api/detalle-ventas/:id`; entonces se calcula el delta ($\Delta = \text{new} - \text{old}$), ajustando el stock del producto y recalculando la cabecera de la venta.
- [x] **AC-4** Dado una venta o línea de venta; cuando se anula (`deactivate`) o elimina físicamente (`DELETE`); entonces el stock consumido se reintegra íntegramente al producto.
- [x] **AC-5** Dado el runner CLI de seeders; cuando se invoca `npm run db:seed -- --sales=3 --product-sales=6`; entonces siembra las ventas y líneas descontando el stock correspondiente de forma idempotente.

**Checklist interno (IA, En curso):**
- [x] Entidades de dominio `Sale` y `ProductSale`
- [x] Modelos Sequelize `SaleModel` y `ProductSaleModel` registrados en `ALL_MODELS`
- [x] Relaciones bidireccionales con `clients` y `products`
- [x] Casos de uso transaccionales con orden canónico anti-deadlock
- [x] Rutas dobles `/api/ventas` y `/api/sales`
- [x] Suites `.http` completas
- [x] Seeder parametrizable CLI
- [x] 21 pruebas unitarias e integración en Vitest

---

## 2. Revisión de AC — autoriza **En curso**

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
| 2026-10-14 | Ing. Alberto José Ortiz Ortiz | Revisión de criterios de aceptación de Ventas y Transacciones | AC-1 a AC-5 | Requerimientos de la guía académica Tecnogua ISS-08 | Criterios transaccionales completos, incluyendo prevención rigurosa de deadlocks y reconciliación de stock. | AC aprobados — puede En curso |

---

## 3. IA usada — se diligencia en **En curso**

**Herramienta / modelo:** Antigravity / Gemini 3.8 Flash  
**Fecha:** 2026-10-14  
**Prompt enviado:**
```text
Implementa el módulo de Sales y ProductSales cumpliendo los criterios de ISS-08:
1. Entidades de dominio Sale y ProductSale con reglas invariantes numéricas y recálculo de totales e impuestos.
2. Modelos Sequelize SaleModel y ProductSaleModel vinculados a ArrendatarioModel y ProductModel.
3. Transacciones ACID gestionadas por repositorio con orden canónico anti-deadlock (sales -> products ASC -> product_sales).
4. Reconciliación atómica por deltas en actualizaciones y restitución total de stock en bajas.
5. Controladores multilingües /api/ventas y /api/detalle-ventas con alias REST en inglés.
6. Seeders parametrizables y suite de pruebas en Vitest.
```

**Ajustes o correcciones que hiciste a lo generado:**
- Se aseguró que la cabecera `sales` sea bloqueada con `SELECT ... FOR UPDATE` antes de mutar líneas para evitar deadlocks por escalado de S-lock a X-lock derivado de las Foreign Keys de InnoDB.
- Se implementó el ordenamiento determinístico `products.sort((a,b) => a.id - b.id)` antes de adquirir bloqueos exclusivos de inventario.

---

## 4. EVI — se diligencia en **Verificación**

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
| 2026-10-14 | Test automatizado Vitest | AC-1 a AC-4 | `backend/test/sales.spec.ts` | `npm test` |
| 2026-10-14 | Ejecución de Seeder CLI | AC-5 | `backend/src/infrastructure/database/seeders/run-seeders.ts` | `npm run db:seed -- --sales=3 --product-sales=6` |
| 2026-10-14 | Compilación NestJS | Calidad | `backend/dist/` | `npm run build` |

### Evidencia de ejecución real:

#### 1. Suite de Pruebas Automatizadas (Vitest):
```text
 ✓ test/sales.spec.ts (21 tests) 381ms
   ✓ Sale Entity: Invariantes y cálculos
   ✓ ProductSale Entity: Reglas de cálculo y totales
   ✓ CreateSaleUseCase: Transacción ACID, descuento de inventario y rollback ante stock insuficiente
   ✓ UpdateSaleUseCase: Reconciliación de inventario por deltas
   ✓ DeleteSaleUseCase: Restitución íntegra de stock al cancelar o eliminar venta
   ✓ Supertest HTTP: Endpoints /api/ventas y /api/detalle-ventas

Test Files  8 passed (8)
     Tests  112 passed (112)
  Duration  2.78s
```

#### 2. Compilación del Backend NestJS:
```text
> backend@0.0.1 build
> nest build

Exit code: 0
```

#### 3. Ejecución del Seeder Parametrizable:
```text
$ npm run db:seed -- --sales=3 --product-sales=6
[Nest] LOG [DatabaseSeederService] Parametrización CLI detectada: sales=3, product_sales=6
[Nest] LOG [DatabaseSeederService] Sembradas 3 ventas y 6 líneas de detalle con éxito.
```

**Commit (hash):** `feat(iss-08): feature sales, productsales, transacciones acid y stock Refs #8`  
**Autoevaluación de AC:** AC-1: sí · AC-2: sí · AC-3: sí · AC-4: sí · AC-5: sí

---

## 5. Revisión humana del resultado — la escribe el revisor en **Revisión humana**

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
| 2026-10-14 | Ing. Alberto José Ortiz Ortiz | Auditoría de transaccionalidad ACID y concurrencia | AC-1 a AC-5 | Código fuente de casos de uso, repositorios y test/sales.spec.ts | La prevención de deadlocks mediante orden canónico y el cálculo de deltas de stock cumplen con los estándares bancarios y de misión crítica. | Conforme |

**Pregunta del revisor:** ¿Por qué es mandatorio ordenar los productos por ID antes de bloquearlos?  
**Respuesta del desarrollador:** Si la transacción T1 intenta comprar los productos [1, 2] y la transacción T2 compra [2, 1] al mismo tiempo, T1 bloquea el producto 1 y espera el 2, mientras T2 bloquea el 2 y espera el 1, generando un interbloqueo (*deadlock*). Al ordenar siempre ascendentemente ([1, 2]), ambas transacciones compiten por el mismo recurso inicial, eliminando la espera circular.

---

## 6. Gate — decide **Hecho** (solo el revisor)

**Estado:** aprobado  
**Conclusión:** Se verifica el cumplimiento riguroso de todos los criterios de aceptación (AC-1 a AC-5). Con este issue se concluye formalmente la **Fase I (Business Core)** del backend.  
**Trazabilidad final:** `feat(iss-08): feature sales, productsales, transacciones acid y stock` · `Refs #8`
