import { Storage, selectState, generateId } from "./storage.js";

const ensureInitials = (name) => name?.trim()?.[0]?.toUpperCase() || "A";

export const Auth = {
  getCurrentUser() {
    const { currentUserId, users } = Storage.load();
    return users.find((u) => u.id === currentUserId) ?? users[0];
  },
  switchMode() {
    const state = Storage.load();
    const current = this.getCurrentUser();
    let nextUser;
    if (current.mode === "anonymous") {
      nextUser = {
        id: generateId("user"),
        name: "Nuevo usuario",
        avatar: "N",
        mode: "named",
        preferences: current.preferences,
        createdAt: Date.now(),
      };
      Storage.patch({
        currentUserId: nextUser.id,
        users: [...state.users, nextUser],
      });
      Storage.log("Modo nombrado activado");
    } else {
      Storage.patch({ currentUserId: "user-anon" });
      Storage.log("Modo anónimo activado");
    }
    return this.getCurrentUser();
  },
  updateUser(update) {
    const state = Storage.load();
    const user = this.getCurrentUser();
    const updated = { ...user, ...update, avatar: ensureInitials(update.name ?? user.name) };
    Storage.patch({
      users: state.users.map((u) => (u.id === user.id ? updated : u)),
    });
    Storage.log(`Perfil actualizado: ${updated.name}`);
    return updated;
  },
  ensureUser() {
    const state = Storage.load();
    if (!state.currentUserId) {
      Storage.patch({ currentUserId: state.users[0]?.id ?? "user-anon" });
    }
    return this.getCurrentUser();
  },
  setPreferences(preferences) {
    return this.updateUser({ preferences });
  },
  listUsers() {
    return selectState((s) => s.users);
  },
};

