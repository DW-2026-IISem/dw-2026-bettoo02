# Arquitectura y Prompt Base — Arrendo360

## 1. Visión del Proyecto
**Arrendo360** (o Arrenda360) es una plataforma integral de administración inmobiliaria diseñada bajo los principios de **Clean Architecture (Arquitectura Limpia)** y **Domain-Driven Design (DDD)** sobre el framework **NestJS**, utilizando persistencia multi-motor con **Sequelize TypeScript** (MySQL, PostgreSQL, SQL Server, Oracle) y control de acceso basado en roles (**RBAC**).

## 2. Principios Arquitectónicos
1. **Independencia de Frameworks y Persistencia:** El dominio (`domain/`) no depende de la infraestructura (`infrastructure/`). Las entidades de negocio son POJOs/clases puras de TypeScript sin decoradores `@Table` ni `@Column` de Sequelize.
2. **Inversión de Dependencias (DIP):** Las capas internas definen interfaces/contratos (ej. `IInmuebleRepository`) que son implementados en la capa de persistencia (`InmuebleRepository`).
3. **Casos de Uso Aislados (Application):** Cada caso de uso representa una intención única del negocio (`CreateInmuebleUseCase`, `ListContratosUseCase`), orquestando entidades y repositorios.
4. **Presentación Controlada (Presentation):** Los controladores HTTP reciben DTOs con validación estricta (`class-validator`), invocan los casos de uso y devuelven respuestas estandarizadas vía `ResponseInterceptor`.

## 3. Estructura de Directorios (Clean Architecture)

```text
src/
├── config/                  # Configuraciones modulares (app, database, env, logger, swagger)
├── common/                  # Elementos transversales (constantes, filtros, interceptores, pipes, guards)
├── infrastructure/          # Adaptadores externos y técnicos
│   └── database/            # Fábrica de base de datos Sequelize, migraciones, seeders
└── features/                # Bounded Contexts de la aplicación
    └── business/            # Dominios de negocio inmobiliario
        ├── properties/      # Inmuebles, tipos de predio y propietarios
        ├── leases/          # Inquilinos/arrendatarios y contratos de arrendamiento
        ├── receivables/     # Cánones mensuales y recibos de pago
        ├── owner-settlements/ # Liquidación y dispersión de recursos a propietarios
        ├── maintenance/     # Tickets de incidencias, proveedores y órdenes de trabajo
        └── business.module.ts # Módulo agregador de features
```

### Estructura interna de cada Bounded Context:
```text
<context>/
├── domain/                  # Capa de Dominio (Entidades puras, Interfaces de repositorio, Enums, Excepciones)
├── application/             # Capa de Aplicación (Casos de uso, DTOs de entrada/salida, Mappers)
├── infrastructure/          # Capa de Infraestructura (Modelos @Table Sequelize, Repositorios concretos)
├── presentation/            # Capa de Presentación (Controladores REST @Controller, Documentación Swagger)
└── <context>.module.ts      # Módulo NestJS del bounded context
```

## 4. Prompt Estandarizado para Generación y Acoplamiento

```text
Configura y acopla el proyecto NestJS en app-Arrendo360 cumpliendo la especificación de ISS-01 para la Plataforma Inmobiliaria Arrendo360:
1. Árbol Clean Architecture con src/config/, src/common/, src/infrastructure/database/, src/features/business/ (con subdominios properties, leases, receivables, owner-settlements, maintenance; sin features/auth/).
2. main.ts con prefijo global /api, habilitación de CORS para http://localhost:4200 con credentials: true, ValidationPipe global con whitelist, forbidNonWhitelisted y transform activados, y listen en puerto 3002.
3. Endpoint de salud GET /api/health que responda HTTP 200 con { "status": "ok" } sin requerir conexión obligatoria a base de datos.
4. Script free:port (scripts/free-port.js) integrado en start:dev y start:debug para evitar EADDRINUSE en puerto 3002.
5. Archivos .gitignore con node_modules/, dist/, .env.
```
