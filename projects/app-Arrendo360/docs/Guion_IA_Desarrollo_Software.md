# Guión de Desarrollo de Software Asistido por Inteligencia Artificial

## 1. Propósito
Este guion establece los pasos secuenciales y disciplinados para interactuar con agentes de Inteligencia Artificial en el desarrollo de software backend para la plataforma **Arrendo360**, garantizando reproducibilidad, verificación rigurosa y trazabilidad total.

## 2. Parte A — Inicialización y Esqueleto Arquitectónico (ISS-01)

### Paso 1: Configuración del Entorno y Preparación
- Validar Node.js (versión 20+ recomendada), npm y herramientas de línea de comandos.
- Configurar el repositorio Git preservando los directorios de control: `.git/`, `docs/`, `evidencias/` y `trazabilidad/`.

### Paso 2: Creación del Documento de Trazabilidad
- Generar el archivo `trazabilidad/ISS-01.md` a partir de la plantilla SDD.
- Definir claramente el alcance: esqueleto NestJS, árbol Clean Architecture, prefijo global `/api`, CORS, `ValidationPipe` y endpoint de salud desacoplado `/api/health`.

### Paso 3: Revisión de Criterios de Aceptación (AC)
- Verificar que los criterios de aceptación sean objetivos, medibles y binarios (cumple / no cumple).
- Registrar la aprobación en la sección 2 del documento.

### Paso 4: Formulación y Envío del Prompt
- Utilizar el prompt canónico especificado en `docs/Prompt.md` sin ambigüedades.
- Especificar el modelo de IA utilizado (ej. Antigravity / Gemini 3.8 Flash).

### Paso 5: Supervisión y Ajustes Manuales
- Ajustar dependencias, tipados y configuraciones del compilador TypeScript (`tsconfig.json`).
- Asegurar que la persistencia Sequelize cuente con manejo de excepciones para permitir el levantamiento del servidor ante bases de datos inactivas.

### Paso 6: Verificación y Captura de Evidencias (EVI)
- Ejecutar el script `npm run free:port` y `npm run start:dev`.
- Consumir el endpoint de salud `GET http://localhost:3002/api/health` mediante `curl`.
- Ejecutar la suite de pruebas unitarias `npm run test`.
- Registrar logs literales y estructurados en la sección 4 de `ISS-01.md`.

### Paso 7: Revisión Humana y Gate de Calidad
- Responder a las preguntas técnicas sobre la separación de capas en Clean Architecture y el acoplamiento a los 5 bounded contexts de Arrendo360.
- Registrar el commit final con la referencia al issue: `feat(iss-01): esqueleto NestJS CA arrancable Refs #1`.
