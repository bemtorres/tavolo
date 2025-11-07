# Guía de pruebas rápida

## Preparación

1. Abrir `index.html` en el navegador.
2. Asegurarse de que `localStorage` no tenga el estado previo (`localStorage.removeItem("eventforge::state")` si se desea reiniciar).

## Casos recomendados

1. **Crear evento**
   - Cambiar a modo nombrado y actualizar perfil.
   - Crear un evento con 2 rondas, guardar y validar que aparezca en el feed.
   - Editar el evento y ajustar la capacidad.

2. **Capacidad y RSVP**
   - Marcar `Voy` hasta alcanzar la capacidad (usar party para agregar miembros de ejemplo con el inspector).
   - Verificar que nuevos intentos cambian a `Me interesa` cuando se agota la capacidad.

3. **Parties**
   - Crear party asociada a un evento existente y copiar el código.
   - Unirse con el mismo usuario (ver que evita duplicados) y con otro usuario (modo anónimo).

4. **Filtros y búsqueda**
   - Filtrar por categoría `tech`, añadir tag `ai` y ordenar por relevancia.
   - Probar búsqueda por texto (parte del título o ubicación).

5. **Persistencia**
   - Recargar la página y comprobar que eventos, parties y RSVP se mantienen.

6. **Rondas**
   - Crear evento con rondas solapadas para validar mensaje de error.
   - Ajustar horarios dentro del rango del evento y guardar.

## Reset de datos

```js
localStorage.removeItem("eventforge::state")
location.reload()
```

## Checklist rápido

- [ ] Puedo crear/editar/eliminar eventos.
- [ ] Los filtros muestran coincidencias correctas.
- [ ] Los códigos de party son únicos.
- [ ] La capacidad bloquea RSVP `going` cuando se llena.
- [ ] El modo anónimo/nombrado persiste entre recargas.

