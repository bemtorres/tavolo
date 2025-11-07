# Propuesta de desarrollo — **Generador de Eventos Masivos (Tailwind + HTML + JS — prototipo local)**

Perfecto — aquí tienes una **propuesta detallada y lista para ejecutar** orientada a un prototipo puro en **Tailwind (CDN) + HTML + JavaScript** (sin backend) para probar la funcionalidad: creación/exploración de eventos, modo anónimo, parties, rondas y filtros. Está pensada para validación rápida usando `localStorage` y lógica en el cliente; más abajo incluyo estructura de archivos, modelos de datos, flujos de UX, checklist de pruebas y roadmap de evolución.

---

## 1) Objetivo del prototipo

Construir una **app web estática** que permita:

* Crear, listar y editar eventos (localmente).
* Modo **anónimo** y modo **nombrado** (simulado).
* Crear **parties** (códigos/invitaciones) y unirse.
* Filtrar y buscar por categoría, etiquetas, fecha y ubicación (virtual/physical).
* Gestionar rondas/fases (pre-evento / evento / after-party).
* Gestionar capacidades y RSVP (going / interested / decline).
* Persistencia local en `localStorage` para mantener datos entre recargas.

Propósito: validar UX, lógica de negocio y reglas antes de pasar a backend real.

---

## 2) Alcance funcional (qué implementamos ahora)

**Funcionalidades core (MVP del prototipo)**

1. Simulación de login:

   * `Anon` (guest) y `User` simple (nombre + avatar inicial).
2. CRUD eventos:

   * Crear evento (title, descripcion, categoría, tags, ubicación virtual/physical, start/end, capacity, imágenes por URL).
   * Editar / eliminar / publicar.
3. Rondas:

   * Añadir 1–3 rondas con título y rango horario.
4. RSVP:

   * Usuarios pueden marcar `going`, `interested` o `declined`.
   * Capacidad bloquea `going` cuando está lleno.
5. Parties:

   * Crear party (owner), generar código corto, unirse por código.
   * Ver miembros de party y RSVP asociados al party.
6. Buscador y filtros:

   * Filtrar por categoría, tags (multi-select), fecha, ubicación (virtual/physical).
   * Orden por relevancia (tags coincidencia) o fecha.
7. Feed / Explorer:

   * Lista principal con tarjetas de evento y controles rápidos (RSVP, join party).
8. Persistencia:

   * `localStorage` para usuarios, events, parties, rsvps.
9. UI:

   * Diseño responsivo con Tailwind; modales para crear/editar; componentes reutilizables (cards, badges).
10. Logs de actividad (simple): últimas acciones para debugging.

**No incluido en prototipo**

* Autenticación real (Google OAuth).
* Backend/DB real ni sincronización multiusuario.
* Pagos / tickets.
* Recomendador ML.

---

## 3) Modelo de datos (objetos JS para localStorage)

```js
// Ejemplos de esquemas (JSON)
User {
  id: "user_uuid",
  name: "Anon" | "Nombre",
  avatar: "A", // inicial o url
  preferences: ["techno","networking"],
  mode: "anonymous" | "named",
  createdAt: 169xxx
}

Event {
  id: "evt_uuid",
  title: "After office",
  description: "...",
  category: "music",
  tags: ["techno","after office"],
  locationType: "virtual" | "physical",
  location: { address: "...", lat: null, lng: null },
  startAt: "2025-11-20T20:00:00",
  endAt: "...",
  capacity: 200,
  images: ["https://..."],
  rounds: [{ id, title, startAt, endAt }],
  organizerId: "user_uuid",
  status: "published" | "draft" | "cancelled",
  createdAt: ...
}

Party {
  id: "party_uuid",
  ownerId: "user_uuid",
  code: "AB12",
  eventId: "evt_uuid" | null,
  privacy: "open" | "invite",
  members: ["user_uuid", ...],
  createdAt: ...
}

RSVP {
  id: "rsvp_uuid",
  userId: "user_uuid",
  eventId: "evt_uuid",
  partyId: "party_uuid" | null,
  status: "going" | "interested" | "declined",
  createdAt: ...
}
```

---

## 4) Estructura de archivos sugerida (simple)

```
/prototipo/
  index.html           <-- SPA estática (HTML + Tailwind CDN + JS)
  /assets/
    logo.svg
  /js/
    app.js             <-- punto de entrada (UI + router simple)
    storage.js         <-- wrapper localStorage (get/set/seed)
    ui.js              <-- funciones de DOM (render cards, modals)
    events.js          <-- lógica CRUD eventos
    parties.js         <-- lógica parties
    auth.js            <-- manejo user (guest / named)
    filters.js         <-- búsqueda y ranking simple
  /css/
    styles.css         <-- pequeñas reglas si hace falta
```

Si quieres todo en un único archivo (más simple para pruebas), se puede combinar `index.html` con `<script>` embebidos.

---

## 5) UX / Flujos principales (pantallas y comportamiento)

1. **Landing / Feed**

   * Muestra feed de eventos (cards). Barra de filtros arriba.
   * CTA para Crear Evento y Crear Party.
2. **Crear Evento (Modal)**

   * Form con validaciones mínimas.
   * Añadir 0..3 rondas.
   * Guardar (publicar/draft).
3. **Vista Evento**

   * Detalle, lista de rondas, botones RSVP, ver parties asociadas o crear party para ese evento.
4. **Party View**

   * Código de invitación, lista de miembros, botón “Invitar” (copia link).
   * Si el owner inicia party -> puede iniciar “ronda”.
5. **Perfil / Usuario**

   * Cambiar modo (anon/named), editar preferencias (tags).
   * Ver mis eventos / mis parties / mis RSVPs.
6. **Filtros / Search**

   * Query + tag chips + category select + date picker.
   * Resultados reflejan coincidencia simple: (#tags coincidentes) * peso + proximity si hay ubicación.

---

## 6) Lógica clave y reglas de negocio

* **Capacidad**: cuando `going_count >= capacity`, bloquear más `going` (mostrar lista de espera como `interested`).
* **Party & RSVP**: al unirse a una party y confirmar `going`, RSVP se asocia a la party.
* **Anon vs Named**: Anónimos pueden crear events y parties pero su `name` es “Anon-XXXX”. Se almacena en localStorage.
* **Rondas**: al crear una ronda, validación de solapamiento y que ronde esté dentro del tiempo del evento.
* **Orden feed**: por defecto fecha ascendente; si user tiene preferencias, ordenar por coincidencia de tags primero.

---

## 7) Checklist de pruebas (qué validar)

* Crear, editar, eliminar evento → persiste tras recarga.
* Crear party → código único → otro user local puede unirse por código.
* RSVP → capacidad bloquea cuando se alcanza el límite.
* Filtros: buscar por tag, categoría, fecha, ubicación.
* Rondas: crear varias y mostrar en vista evento.
* Cambio de usuario (anon ↔ named) → persistencia y relacionamiento correcto.
* UI responsiva en móvil y desktop.
* Manejo de errores: inputs vacíos, fechas inválidas, codes duplicados.

---

## 8) Entregables (qué recibirás del prototipo)

* Código fuente (single-file o carpeta) listo para abrir en el navegador.
* Seed de datos (10 eventos de ejemplo) para probar búsquedas.
* Documento breve de “Cómo probar” con casos de uso y cómo resetear `localStorage`.
* Lista de mejoras recomendadas para pasar a backend real.

---

## 9) Roadmap de evolución (próximos pasos después del prototipo)

1. Integración backend (APIs REST/GraphQL) y migración de `localStorage` a PostgreSQL.
2. Autenticación real con Google OAuth y guest tokens.
3. Realtime: WebSockets para presencia en parties y chat.
4. Search: añadir Meilisearch/Elasticsearch para facetas y ranking.
5. Recomendaciones: motor simple con tag-weight o colaboración.
6. Pago/tickets y control de acceso por QR.
7. Dashboard organizador y analytics.

---

## 10) Recomendaciones técnicas y decisiones que propongo

* Mantener el prototipo en **vanilla JS** para validar la lógica de negocio sin overhead de frameworks.
* Usar **Tailwind CDN** para iterar rápido y mantener consistencia visual.
* Diseñar la estructura de datos pensando en migración a backend (usar `id` tipo UUID en vez de índices numéricos).
* Diseñar el UI con componentes reutilizables (cards, modals, chips) — facilita pasarlos a frameworks como React/Next.js más adelante.

---

## 11) Siguientes pasos concretos (qué puedo hacer ahora)

* A: Generar el prototipo **single-file** (index.html) con Tailwind + JS + seed de datos y las funcionalidades descritas.
* B: Entregar el paquete fuente y la guía de pruebas.
* C: Si lo validas, preparar plan de migración a backend (endpoints y esquema SQL).

Dime cuál prefieres (A, B o C) y lo creo **ahora mismo** como archivo listo para abrir en el navegador.
