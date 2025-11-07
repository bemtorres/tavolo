# EventForge — Prototipo local

Prototipo estático en **Tailwind CDN + HTML + JavaScript** inspirado en la propuesta del documento `data.md`. Permite crear, explorar y gestionar eventos con parties, rondas y RSVP persistiendo en `localStorage`.

## Requisitos

- Navegador moderno (Chrome, Edge, Firefox o Safari)
- Acceso a Internet para cargar Tailwind CDN

## Puesta en marcha

1. Abre el archivo `index.html` directamente en el navegador (doble clic o arrastrándolo a la ventana del navegador).
2. El estado inicial se autoseedeará con usuarios, 10 eventos, parties y RSVPs de ejemplo.

## Funcionalidades principales

- Modo usuario anónimo / nombrado con edición rápida de perfil.
- CRUD de eventos con rondas (valida solapamientos básicos) y capacidad.
- Gestión de RSVP (`going`, `interested`, `declined`) con bloqueo automático si la capacidad se llena.
- Creación y unión a parties mediante códigos.
- Buscador y filtros (categoría, tipo de ubicación, rango de fechas, tags y orden por relevancia o fecha).
- Feed de tarjetas con acciones rápidas, detalle modal y actividad reciente.

## Estructura

```
index.html
css/
  styles.css
js/
  app.js
  auth.js
  events.js
  filters.js
  parties.js
  storage.js
  ui.js
assets/
  logo.svg
docs/
  guia-pruebas.md
```

## Reseteo de datos

Desde la consola del navegador ejecuta:

```js
localStorage.removeItem("eventforge::state")
```

Recarga la página para regenerar el estado inicial.

## Próximos pasos sugeridos

- Migrar a backend real (API REST/GraphQL) guardando la estructura de datos actual.
- Añadir autenticación (OAuth / magic links) y sincronización en tiempo real.
- Incorporar tests de integración con Playwright para validar flujos críticos.

