import { Storage, selectState, generateId } from "./storage.js";

const normalizeEvent = (event) => ({
  ...event,
  tags: event.tags?.map((t) => t.trim().toLowerCase()).filter(Boolean) ?? [],
  rounds: event.rounds ?? [],
});

export const Events = {
  all() {
    return selectState((s) => s.events).map((evt) => ({ ...evt }));
  },
  getById(id) {
    return selectState((s) => s.events.find((evt) => evt.id === id));
  },
  upsert(event) {
    const state = Storage.load();
    let nextEvents;
    const candidate = normalizeEvent(event);
    if (state.events.some((evt) => evt.id === candidate.id)) {
      nextEvents = state.events.map((evt) => (evt.id === candidate.id ? candidate : evt));
      Storage.log(`Evento actualizado: ${candidate.title}`);
    } else {
      nextEvents = [...state.events, candidate];
      Storage.log(`Evento creado: ${candidate.title}`);
    }
    Storage.patch({ events: nextEvents });
    return candidate;
  },
  remove(id) {
    const state = Storage.load();
    const toDelete = state.events.find((evt) => evt.id === id);
    if (!toDelete) return;
    const nextEvents = state.events.filter((evt) => evt.id !== id);
    const nextRsvps = state.rsvps.filter((rsvp) => rsvp.eventId !== id);
    const nextParties = state.parties.map((party) =>
      party.eventId === id ? { ...party, eventId: null } : party
    );
    Storage.patch({ events: nextEvents, rsvps: nextRsvps, parties: nextParties });
    Storage.log(`Evento eliminado: ${toDelete.title}`);
  },
  create(payload) {
    const event = {
      id: generateId("evt"),
      createdAt: Date.now(),
      status: "published",
      rounds: [],
      ...payload,
    };
    return this.upsert(event);
  },
  capacityStatus(event, rsvps) {
    const goingCount = rsvps.filter((r) => r.eventId === event.id && r.status === "going").length;
    return {
      goingCount,
      remaining: Math.max(event.capacity - goingCount, 0),
      full: goingCount >= event.capacity,
    };
  },
  categories() {
    const events = this.all();
    return Array.from(new Set(events.map((evt) => evt.category))).filter(Boolean);
  },
  tags() {
    const events = this.all();
    return Array.from(new Set(events.flatMap((evt) => evt.tags))).filter(Boolean);
  },
};

