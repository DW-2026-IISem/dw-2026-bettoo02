# Metodología de Desarrollo de Software — SDD & Kanban

## 1. Fundamentos de la Metodología
Esta metodología combina el **Desarrollo Guiado por Especificación (Spec-Driven Development — SDD)** con la gestión de flujo visual mediante tableros **Kanban** y puntos de control estricto (**Gates de Calidad**).

## 2. Flujo de Estados del Tablero Kanban

```text
[ Preparado ] ──(Revisión AC)──> [ En curso ] ──(Desarrollo/IA)──> [ Verificación ] ──(Pruebas/EVI)──> [ Revisión humana ] ──(Gate)──> [ Hecho ]
```

1. **Preparado (Backlog refinado):**
   - Se redacta la especificación completa del Issue (`ISS-XX.md`): Objetivo (`OBJ`), Especificación detallada (`SPEC`), Restricciones de alcance (`REQ`) y Criterios de Aceptación medibles (`AC`).
   - El revisor técnico o docente revisa los criterios y autoriza el paso al estado *En curso*.
2. **En curso (Desarrollo y Asistencia de IA):**
   - El desarrollador ejecuta el trabajo o envía los prompts estandarizados a la IA.
   - Se registran la herramienta/modelo utilizada, fecha, prompt exacto y las correcciones o adaptaciones técnicas implementadas.
3. **Verificación (Ejecución y Evidencia):**
   - Se ejecutan las comprobaciones reales en el entorno de desarrollo: comandos de arranque, tests unitarios, peticiones HTTP (curl), y verificación de árboles de directorios.
   - Se documenta la evidencia real e inalterable en la tabla `EVI`.
4. **Revisión humana (Validación de Arquitectura y Aporte):**
   - El revisor formula preguntas técnicas clave sobre el diseño arquitectónico y evalúa la idoneidad de la solución.
   - El desarrollador redacta las justificaciones y detalles del aporte técnico.
5. **Hecho (Gate de Cierre):**
   - Solo el revisor decide el estado final: `aprobado`, `aprobado con observación`, `devuelto` o `cancelado`.
   - Se asocia el commit definitivo con la trazabilidad correspondiente (ej. `feat(iss-01): ... Refs #1`).

## 3. Estructura de Documento de Trazabilidad (`trazabilidad/ISS-XX.md`)

Todo issue debe contar con las siguientes 6 secciones obligatorias:
1. **SDD — se escribe en Preparado**: OBJ, SPEC, REQ, AC y Checklist interno.
2. **Revisión de AC — autoriza En curso**: Acta de revisión de criterios de aceptación.
3. **IA usada — se diligencia en En curso**: Herramienta, fecha, prompt enviado y ajustes.
4. **EVI — se diligencia en Verificación**: Matriz de evidencias y fragmentos de ejecución real.
5. **Revisión humana del resultado**: Revisión conceptual y justificación del autor.
6. **Gate — decide Hecho**: Estado, conclusión y trazabilidad final.

## 4. Política de Commits y Trazabilidad en Git
- Mensajes convencionales: `feat(iss-XX): <descripción corta> Refs #<número_issue>`.
- Las carpetas de documentación (`docs/`), evidencias (`evidencias/`) y trazabilidad (`trazabilidad/`) deben conservarse íntegras a lo largo de todos los issues.
