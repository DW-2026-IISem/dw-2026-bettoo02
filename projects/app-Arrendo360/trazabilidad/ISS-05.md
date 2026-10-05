> **Workspace:** `backend-nest-ia` · **Pista:** solo Business (7 issues) · **Guion:** `docs/Guion_IA_Desarrollo_Software.md` · **Metodología:** `docs/Metodologia_Desarrollo_Software_SDD_Kanban.md` · **Arquitectura:** `docs/Prompt.md`

# ISS-05 — Feature products CA

**Naturaleza:** práctico (desarrollo de software backend)  
**Issue GitHub:** `backend-nest-ia #__` (número que asigna GitHub al crear el Issue; anótalo aquí y en el cuerpo del Issue)  
**Responsable (desarrollador):**  
**Revisor humano:**  
**Dependencias:** ISS-04 en **Hecho** (Products necesita ProductTypes)  
**Commit esperado:** `feat(iss-05): feature products CA` con `Refs #__`

> El estado del issue **vive en el tablero Kanban**, no en este archivo. Cada sección indica en qué estado se diligencia; hasta entonces se deja como está.

---

## 1. SDD — se escribe en **Preparado**

**OBJ:** Al finalizar, cualquier consumidor HTTP podrá registrar y consultar productos persistidos, ligados a un tipo de producto existente y con su stock (`quantity`), para que el issue de ventas pueda descontarlo.

**SPEC (qué debe quedar):**
- Feature `src/features/business/products/` con el patrón de Clients.
- **Dominio:** entidad `Product` pura (`id`, `name`, `brand`, `price`, `minStock`, `quantity`, `productTypeId`, `status`) con método `reduceStock(n)` que lanza `InsufficientStockException` si `quantity − n < 0` (se **usa** en ISS-06, pero la regla **vive** aquí, en la entidad); `IProductRepository`; excepciones `ProductNotFoundException` (404) y `ProductTypeInactiveException` (409; tipo existente pero inactivo).
- **Aplicación:** `CreateProductDto` (`name` requerido; `price` > 0; `quantity` ≥ 0 y `minStock` ≥ 0, por defecto 0; `productTypeId` requerido), mapper, use-cases `CreateProduct` (verifica que el `productTypeId` exista **y esté activo** a través de `IProductTypeRepository` —rechaza inexistente o inactivo—, no del model), `ListProducts`, `GetProductById`.
- **Infraestructura:** `ProductModel` (tabla `products`) con `@ForeignKey(() => ProductTypeModel)` y `@BelongsTo`; en `ALL_MODELS`; repositorio; seeder idempotente que crea al menos 1 producto **con un tipo existente** (el seeder consulta el tipo vía `IProductTypeRepository`, no asume orden en memoria; ISS-07 formaliza el orden `clients → product-types → products` para BD vacía).
- **Presentación:** `GET /api/products`, `GET /api/products/:id`, `POST /api/products`; la respuesta incluye `quantity`.

**REQ (restricciones):**
- La **relación** (FK, `BelongsTo`) vive en el **model de infraestructura**; la entidad de dominio solo tiene `productTypeId: number`.
- Códigos HTTP según `docs/Prompt.md` §5: FK inexistente → `404`.
- Sin JWT Token ni Auth. No adelantar ISS-06 (Sales).

**AC (Dado → Cuando → Entonces; deciden el Gate):**
- [ ] **AC-1** Dado la app arrancada con al menos un tipo de producto; cuando corre el seeder; entonces `GET /api/products` responde `200` con al menos 1 producto cuyo `productTypeId` existe, y arrancar de nuevo no duplica.
- [ ] **AC-2** Dado un payload válido `{ "name": "...", "brand": "...", "price": 10.5, "quantity": 5, "minStock": 1, "productTypeId": <id existente> }`; cuando `POST /api/products`; entonces responde `201` y la fila existe con `quantity = 5`.
- [ ] **AC-3** Dado un payload con `productTypeId` inexistente **o inactivo**; cuando `POST /api/products`; entonces responde `404` (inexistente) o `409` (inactivo) y **no** crea fila.
- [ ] **AC-4** Dado un payload con `price: 0` (o negativo) o sin `name`; cuando `POST /api/products`; entonces responde `400` y no crea fila.
- [ ] **AC-5** Dado `domain/entities/product.entity.ts`; cuando se inspecciona; entonces es TypeScript puro y contiene `reduceStock` con su invariante.

**Checklist interno (IA, En curso):**
- [ ] Entidad con `reduceStock`, interface, excepciones
- [ ] DTO con validaciones numéricas, mapper, use-cases (`CreateProduct` verifica tipo existente y activo)
- [ ] Model con FK/BelongsTo, repositorio, seeder (orden tras ProductTypes) + `ALL_MODELS`
- [ ] Controller + Swagger
- [ ] Módulo en `BusinessModule` (importa `ProductTypesModule` para el repositorio)

---

## 2. Revisión de AC — autoriza **En curso** (la escribe el revisor al final de Preparado)

| Fecha | Revisor | Actuación | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------|--------------|----------------------|----------|----------|
|       |         |           | OBJ, SPEC, REQ, AC | este archivo   |          | pendiente |

Decisión posible: `AC aprobados — puede En curso` · `Ajustar AC` (indicar cuál y por qué).

---

## 3. IA usada — se diligencia en **En curso**, después de enviar el prompt

**Herramienta / modelo:** (pendiente)  
**Fecha:** (pendiente)  
**Prompt enviado** (copiado **tal cual** de la ficha ISS-05 del Guion, sección «Prompt por issue»):

```text
(pendiente — pegar aquí el prompt exacto)
```

**Ajustes o correcciones que hiciste a lo generado:** (pendiente)

---

## 4. EVI — se diligencia en **Verificación** (después de ejecutar tú mismo)

| Fecha | Tipo | AC que demuestra | Enlace o ruta | Cómo reproducir |
|-------|------|------------------|---------------|-----------------|
|       | log + conteo | AC-1 | | `npm run start:dev` ×2 + `SELECT COUNT(*) FROM products` |
|       | HTTP 201 | AC-2 | | `curl -i -X POST localhost:3002/api/products -H 'Content-Type: application/json' -d '{"name":"Agua 600ml","brand":"Cristal","price":2500,"quantity":5,"minStock":1,"productTypeId":1}'` |
|       | HTTP 404 / 409 | AC-3 | | mismo POST con `"productTypeId": 999999` (404); y con un tipo inactivo (`UPDATE product_types SET status='inactive' WHERE id=<id>;`) → 409 |
|       | HTTP 400 | AC-4 | | mismo POST con `"price": 0` |
|       | archivo fuente | AC-5 | `src/features/business/products/domain/entities/product.entity.ts` | `rg -n "sequelize|@nestjs|extends Model" <ruta>` → sin resultados; `rg -n "reduceStock" <ruta>` → 1 resultado |

**Commit (hash):** pendiente — `feat(iss-05): feature products CA` · `Refs #__` · hecho `git push`  
**Autoevaluación de AC:** pendiente (AC-1 … AC-5: sí/no)

---

## 5. Revisión humana del resultado — la escribe el revisor en **Revisión humana**

Pregunta guía: «¿Dónde vive la relación con ProductType: en el dominio o en el model? ¿Por qué?» «¿Quién comprueba que el tipo existe: el controller, el use-case o la BD?»

| Fecha | Revisor | Actuación (aporte · revisión conforme · devolución) | AC revisados | Evidencia consultada | Hallazgo | Decisión |
|-------|---------|-----------------------------------------------------|--------------|----------------------|----------|----------|
|       |         |           |              |                      |          |          |

**Respuesta del autor (ajuste o justificación):**

---

## 6. Gate — decide **Hecho** (solo el revisor)

**Estado:** pendiente (`aprobado` · `aprobado con observación` · `devuelto` · `cancelado`)  
**Conclusión:**  
**Trazabilidad final:** (hash del commit definitivo + enlace al Issue)
