import { Storage, selectState, generateId } from "./storage.js";

const uniqueCode = () => Math.random().toString(36).slice(-4).toUpperCase();

export const Parties = {
  all() {
    return selectState((s) => s.parties);
  },
  getById(id) {
    return selectState((s) => s.parties.find((pty) => pty.id === id));
  },
  create({ ownerId, eventId = null, privacy = "open" }) {
    const state = Storage.load();
    let code;
    do {
      code = uniqueCode();
    } while (state.parties.some((pty) => pty.code === code));

    const party = {
      id: generateId("party"),
      ownerId,
      code,
      eventId,
      privacy,
      members: [ownerId],
      createdAt: Date.now(),
    };
    Storage.patch({ parties: [...state.parties, party] });
    Storage.log(`Party creada (${code})`);
    return party;
  },
  joinByCode({ userId, code }) {
    const state = Storage.load();
    const party = state.parties.find((pty) => pty.code.toUpperCase() === code.toUpperCase());
    if (!party) {
      throw new Error("Código no encontrado");
    }
    if (!party.members.includes(userId)) {
      const updated = { ...party, members: [...party.members, userId] };
      Storage.patch({
        parties: state.parties.map((pty) => (pty.id === party.id ? updated : pty)),
      });
      Storage.log(`Usuario unido a party ${code}`);
      return updated;
    }
    return party;
  },
  listByUser(userId) {
    return this.all().filter((pty) => pty.members.includes(userId));
  },
  partiesByEvent(eventId) {
    return this.all().filter((pty) => pty.eventId === eventId);
  },
};

