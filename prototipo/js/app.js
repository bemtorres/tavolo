import { Storage, selectState, generateId } from "./storage.js";
import { Auth } from "./auth.js";
import { Events } from "./events.js";
import { Parties } from "./parties.js";
import { Filters } from "./filters.js";
import { UI } from "./ui.js";

const THEME_STORAGE_KEY = "eventforge:theme";

const state = {
  filters: {
    query: "",
    category: "",
    locationType: "",
    dateFrom: "",
    dateTo: "",
    sort: "date",
    tags: [],
  },
};

const snap = () => Storage.load();

const updateThemeToggle = (theme) => {
  const toggle = document.getElementById("theme-toggle");
  const label = document.getElementById("theme-toggle-label");
  const icon = toggle?.querySelector("[data-theme-icon]");
  if (!toggle || !label || !icon) return;
  const isDark = theme === "dark";
  toggle.setAttribute("aria-pressed", String(isDark));
  icon.textContent = isDark ? "🌙" : "☀️";
  label.textContent = isDark ? "Modo claro" : "Modo oscuro";
  toggle.title = isDark ? "Cambiar a modo claro" : "Cambiar a modo oscuro";
};

const applyTheme = (theme, { persist = true } = {}) => {
  const normalized = theme === "light" ? "light" : "dark";
  document.documentElement.dataset.theme = normalized;
  document.documentElement.classList.toggle("dark", normalized === "dark");
  if (persist) {
    try {
      localStorage.setItem(THEME_STORAGE_KEY, normalized);
    } catch (error) {
      // Ignorar si el almacenamiento no está disponible.
    }
  }
  updateThemeToggle(normalized);
};

const monitorSystemPreference = () => {
  if (typeof window.matchMedia !== "function") {
    return;
  }
  const mediaQuery = window.matchMedia("(prefers-color-scheme: light)");
  const handler = (event) => {
    try {
      if (localStorage.getItem(THEME_STORAGE_KEY)) {
        return;
      }
    } catch (error) {
      // Ignorar si no es posible leer la preferencia almacenada.
    }
    applyTheme(event.matches ? "light" : "dark", { persist: false });
  };

  if (typeof mediaQuery.addEventListener === "function") {
    mediaQuery.addEventListener("change", handler);
  } else if (typeof mediaQuery.addListener === "function") {
    mediaQuery.addListener(handler);
  }
};

const syncUserHeader = () => {
  const user = Auth.getCurrentUser();
  document.getElementById("user-name-label").textContent = user.name;
  document.getElementById("user-mode-label").textContent =
    user.mode === "anonymous" ? "Anon" : "Named";
};

const validateEvent = (event) => {
  const start = new Date(event.startAt);
  const end = new Date(event.endAt);
  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    throw new Error("Fechas inválidas");
  }
  if (end <= start) {
    throw new Error("La fecha de fin debe ser posterior al inicio");
  }
  if (!Number.isFinite(event.capacity) || event.capacity <= 0) {
    throw new Error("La capacidad debe ser mayor a 0");
  }
  if (event.rounds?.length) {
    const sorted = [...event.rounds].sort(
      (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
    );
    for (let i = 1; i < sorted.length; i += 1) {
      const prevEnd = new Date(sorted[i - 1].endAt).getTime();
      const currentStart = new Date(sorted[i].startAt).getTime();
      if (currentStart < prevEnd) {
        throw new Error("Las rondas no pueden solaparse");
      }
    }
    event.rounds.forEach((round) => {
      const rs = new Date(round.startAt);
      const re = new Date(round.endAt);
      if (rs < start || re > end) {
        throw new Error(`La ronda ${round.title} debe estar dentro del rango del evento`);
      }
      if (re <= rs) {
        throw new Error(`La ronda ${round.title} tiene un rango inválido`);
      }
    });
  }
};

const renderAll = () => {
  const snapshot = snap();
  const user = Auth.getCurrentUser();
  UI.populateFilters(state.filters.category);
  const events = Filters.apply(Events.all(), state.filters, {
    preferences: user.preferences,
  });
  UI.renderEventsList(events, {
    rsvps: snapshot.rsvps,
    onAction: handleEventAction,
  });
  UI.renderParties(Parties.listByUser(user.id), snapshot.users);
  UI.renderActivity(snapshot.activity);
  UI.renderTagPool({
    tags: Filters.availableTags(),
    activeTags: state.filters.tags,
    onToggle: toggleTag,
  });
  syncUserHeader();
};

const toggleTag = (tag) => {
  if (state.filters.tags.includes(tag)) {
    state.filters.tags = state.filters.tags.filter((t) => t !== tag);
  } else {
    state.filters.tags = [...state.filters.tags, tag];
  }
  renderAll();
};

const upsertRsvp = ({ eventId, status, partyId = null }) => {
  const snapshot = snap();
  const user = Auth.getCurrentUser();
  const existing = snapshot.rsvps.find((r) => r.eventId === eventId && r.userId === user.id);
  const event = Events.getById(eventId);
  if (!event) return;

  if (status === "going") {
    const { full } = Events.capacityStatus(event, snapshot.rsvps);
    if (full) {
      alert("Capacidad completa. Te agregaremos como interesado.");
      status = "interested";
    }
  }

  let nextRsvps;
  if (existing) {
    nextRsvps = snapshot.rsvps.map((r) =>
      r.id === existing.id ? { ...existing, status, partyId } : r
    );
    Storage.log(`RSVP actualizado (${status})`);
  } else {
    const rsvp = {
      id: generateId("rsvp"),
      userId: user.id,
      eventId,
      partyId,
      status,
      createdAt: Date.now(),
    };
    nextRsvps = [...snapshot.rsvps, rsvp];
    Storage.log(`RSVP creado (${status})`);
  }
  Storage.patch({ rsvps: nextRsvps });
};

const openEventModal = (event) => {
  const form = UI.buildEventForm({
    event,
    onSubmit: (payload) => {
      try {
        const user = Auth.getCurrentUser();
        const newEvent = {
          ...event,
          ...payload,
          organizerId: user.id,
        };
        validateEvent(newEvent);
        if (!event) {
          Events.create(newEvent);
        } else {
          Events.upsert(newEvent);
        }
        UI.closeModal();
        renderAll();
      } catch (error) {
        alert(error.message);
      }
    },
  });

  UI.showModal({
    title: event ? "Editar evento" : "Crear evento",
    content: form,
    actions: [
      {
        label: "Guardar",
        variant: "primary",
        onClick: () => form.requestSubmit(),
      },
      {
        label: "Cancelar",
        variant: "secondary",
        onClick: () => UI.closeModal(),
      },
    ],
  });
};

const openPartyModal = () => {
  const form = UI.buildPartyForm({
    onSubmit: ({ eventId, privacy }) => {
      try {
        const user = Auth.getCurrentUser();
        const party = Parties.create({ ownerId: user.id, eventId, privacy });
        UI.closeModal();
        alert(`Party creada. Código: ${party.code}`);
        renderAll();
      } catch (error) {
        alert(error.message);
      }
    },
  });

  UI.showModal({
    title: "Crear party",
    content: form,
    actions: [
      {
        label: "Crear",
        onClick: () => form.requestSubmit(),
      },
      {
        label: "Cancelar",
        variant: "secondary",
        onClick: () => UI.closeModal(),
      },
    ],
  });
};

const openJoinPartyModal = () => {
  const form = UI.buildPartyJoinForm({
    onSubmit: ({ code }) => {
      try {
        const user = Auth.getCurrentUser();
        Parties.joinByCode({ userId: user.id, code });
        UI.closeModal();
        renderAll();
      } catch (error) {
        alert(error.message);
      }
    },
  });

  UI.showModal({
    title: "Unirme a una party",
    content: form,
    actions: [
      { label: "Unirme", onClick: () => form.requestSubmit() },
      {
        label: "Cancelar",
        variant: "secondary",
        onClick: () => UI.closeModal(),
      },
    ],
  });
};

const handleEventAction = ({ type, event }) => {
  switch (type) {
    case "view-event":
      showEventDetail(event);
      break;
    case "rsvp-going":
      upsertRsvp({ eventId: event.id, status: "going" });
      renderAll();
      break;
    case "rsvp-interested":
      upsertRsvp({ eventId: event.id, status: "interested" });
      renderAll();
      break;
    case "rsvp-declined":
      upsertRsvp({ eventId: event.id, status: "declined" });
      renderAll();
      break;
    default:
      break;
  }
};

const showEventDetail = (event) => {
  const snapshot = snap();
  const parties = Parties.partiesByEvent(event.id);
  const rsvps = snapshot.rsvps.filter((r) => r.eventId === event.id);
  const going = rsvps.filter((r) => r.status === "going");

  const container = document.createElement("div");
  container.className = "space-y-4 text-sm";
  container.innerHTML = `
    <div>
      <h3 class="text-lg font-semibold">${event.title}</h3>
      <p class="text-slate-400 mt-1">${event.description}</p>
    </div>
    <div class="flex flex-wrap gap-2">
      ${event.tags.map((tag) => `<span class="pill">#${tag}</span>`).join("")}
    </div>
    <div class="grid sm:grid-cols-2 gap-4">
      <div class="bg-slate-950/50 border border-slate-800 rounded-xl p-3">
        <h4 class="text-xs uppercase text-slate-400">Detalles</h4>
        <p>${formatDate(event.startAt)} – ${formatDate(event.endAt)}</p>
        <p class="text-slate-400 mt-1">${event.locationType === "virtual" ? "Virtual" : event.location?.address ?? "Sin dirección"}</p>
        <p class="text-slate-400 mt-1">Capacidad: ${going.length}/${event.capacity}</p>
      </div>
      <div class="bg-slate-950/50 border border-slate-800 rounded-xl p-3">
        <h4 class="text-xs uppercase text-slate-400">Organizador</h4>
        <p>${snapshot.users.find((u) => u.id === event.organizerId)?.name ?? "Desconocido"}</p>
      </div>
    </div>
    <div class="space-y-2">
      <h4 class="text-xs uppercase text-slate-400">Rondas</h4>
      <ul class="space-y-2">
        ${event.rounds
          .map(
            (round) => `
            <li class="border border-slate-800 rounded-lg p-3">
              <p class="font-medium">${round.title}</p>
              <p class="text-xs text-slate-400">${formatDate(round.startAt)} — ${formatDate(
              round.endAt
            )}</p>
            </li>`
          )
          .join("")}
      </ul>
    </div>
    <div class="space-y-2">
      <h4 class="text-xs uppercase text-slate-400">Parties asociadas</h4>
      <ul class="space-y-2">
        ${
          parties.length
            ? parties
                .map(
                  (party) => `
              <li class="border border-slate-800 rounded-lg p-3">
                <div class="flex justify-between items-center text-xs text-slate-400">
                  <span>Código</span>
                  <span class="font-semibold text-indigo-300">${party.code}</span>
                </div>
                <p class="mt-1 text-xs text-slate-400">Miembros: ${party.members.length}</p>
              </li>
            `
                )
                .join("")
            : `<li class="text-xs text-slate-500">Aún no hay parties. Crea una ahora.</li>`
        }
      </ul>
    </div>
  `;

  UI.showModal({
    title: "Detalle del evento",
    content: container,
    actions: [
      {
        label: "Eliminar",
        variant: "secondary",
        onClick: () => {
          if (confirm("¿Eliminar este evento?")) {
            Events.remove(event.id);
            UI.closeModal();
            renderAll();
          }
        },
      },
      {
        label: "Editar",
        onClick: () => {
          UI.closeModal();
          openEventModal(event);
        },
      },
      {
        label: "Cerrar",
        variant: "secondary",
        onClick: () => UI.closeModal(),
      },
    ],
  });
};

const formatDate = (value) =>
  new Date(value).toLocaleString("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  });

const handleFiltersSubmit = (event) => {
  event.preventDefault();
  const formData = new FormData(event.target);
  state.filters = {
    ...state.filters,
    query: formData.get("query") ?? "",
    category: formData.get("category") ?? "",
    locationType: formData.get("locationType") ?? "",
    dateFrom: formData.get("dateFrom") ?? "",
    dateTo: formData.get("dateTo") ?? "",
    sort: formData.get("sort") ?? "date",
  };
  renderAll();
};

const handleResetFilters = () => {
  state.filters = {
    query: "",
    category: "",
    locationType: "",
    dateFrom: "",
    dateTo: "",
    sort: "date",
    tags: [],
  };
  document.getElementById("filters-form").reset();
  renderAll();
};

const handleUserToggle = () => {
  const current = Auth.getCurrentUser();
  if (current.mode === "anonymous") {
    Auth.switchMode();
    promptForProfile();
  } else {
    Auth.switchMode();
  }
  renderAll();
};

const promptForProfile = () => {
  const user = Auth.getCurrentUser();
  const form = document.createElement("form");
  form.className = "space-y-4";
  form.innerHTML = `
    <label class="flex flex-col gap-1 text-sm">
      <span class="text-slate-300">Nombre</span>
      <input required name="name" value="${user.name}" class="rounded-lg bg-slate-950 border border-slate-800 px-3 py-2" />
    </label>
    <label class="flex flex-col gap-1 text-sm">
      <span class="text-slate-300">Preferencias (tags separados por comas)</span>
      <input name="preferences" value="${user.preferences.join(", ")}" class="rounded-lg bg-slate-950 border border-slate-800 px-3 py-2" />
    </label>
  `;

  form.addEventListener("submit", (ev) => {
    ev.preventDefault();
    const formData = new FormData(form);
    const name = formData.get("name");
    const preferences = formData
      .get("preferences")
      .split(",")
      .map((tag) => tag.trim().toLowerCase())
      .filter(Boolean);
    Auth.updateUser({ name, preferences });
    UI.closeModal();
    renderAll();
  });

  UI.showModal({
    title: "Editar perfil",
    content: form,
    actions: [
      { label: "Guardar", onClick: () => form.requestSubmit() },
      { label: "Cancelar", variant: "secondary", onClick: () => UI.closeModal() },
    ],
  });
};

const handleGlobalShortcuts = (event) => {
  if (event.key === "n" && (event.metaKey || event.ctrlKey)) {
    event.preventDefault();
    openEventModal();
  }
};

const init = () => {
  Auth.ensureUser();
  applyTheme(document.documentElement.dataset.theme || "dark", { persist: false });
  UI.populateFilters(state.filters.category);
  document.getElementById("filters-form").addEventListener("submit", handleFiltersSubmit);
  document.getElementById("reset-filters").addEventListener("click", handleResetFilters);
  document.getElementById("user-toggle").addEventListener("click", handleUserToggle);
  document.getElementById("create-event-btn").addEventListener("click", () => openEventModal());
  document
    .getElementById("create-party-btn")
    .addEventListener("click", () => openPartyModal());

  const themeToggle = document.getElementById("theme-toggle");
  themeToggle?.addEventListener("click", () => {
    const current = document.documentElement.dataset.theme === "light" ? "light" : "dark";
    const next = current === "dark" ? "light" : "dark";
    applyTheme(next);
  });

  monitorSystemPreference();

  const joinShortcut = document.createElement("button");
  joinShortcut.textContent = "Unirme con código";
  joinShortcut.className = "rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 px-4 py-2 text-xs";
  joinShortcut.addEventListener("click", () => openJoinPartyModal());
  document.getElementById("filters").appendChild(joinShortcut);

  document.addEventListener("keydown", handleGlobalShortcuts);

  renderAll();
};

document.addEventListener("DOMContentLoaded", init);

document.addEventListener("storage:sync", renderAll);

