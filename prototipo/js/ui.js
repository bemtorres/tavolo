import { Events } from "./events.js";
import { Filters } from "./filters.js";

const CLASS_BTN_PRIMARY =
  "inline-flex items-center gap-2 rounded-lg bg-indigo-500 hover:bg-indigo-400 text-slate-950 font-semibold px-4 py-2 text-sm";
const CLASS_BTN_SECONDARY =
  "inline-flex items-center gap-2 rounded-lg border border-slate-700 bg-slate-900 hover:bg-slate-800 px-4 py-2 text-sm";
const CLASS_BTN_OUTLINE =
  "inline-flex items-center gap-2 rounded-lg border border-indigo-500/40 text-indigo-300 hover:bg-indigo-500/10 px-4 py-2 text-sm";

const modalLayer = () => document.getElementById("modal-layer");
const modalContent = () => document.getElementById("modal-content");
const modalFooter = () => document.getElementById("modal-footer");
const modalTitle = () => document.getElementById("modal-title");

const formatDateRange = (start, end) => {
  const startDate = new Date(start);
  const endDate = new Date(end);
  const short = new Intl.DateTimeFormat("es-AR", {
    dateStyle: "medium",
    timeStyle: "short",
  });
  return `${short.format(startDate)} — ${short.format(endDate)}`;
};

const statusBadge = (status) => {
  const classes = {
    published: "bg-emerald-500/20 text-emerald-300 border border-emerald-500/30",
    draft: "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30",
    cancelled: "bg-rose-500/20 text-rose-300 border border-rose-500/30",
  };
  return classes[status] ?? classes.published;
};

const createTagElement = (tag) => {
  const span = document.createElement("span");
  span.className = "pill";
  span.textContent = `#${tag}`;
  return span;
};

export const UI = {
  renderEventsList(events, { rsvps = [], onAction } = {}) {
    const container = document.getElementById("events-list");
    container.innerHTML = "";
    const template = document.getElementById("event-card-template");

    events.forEach((event) => {
      const clone = template.content.firstElementChild.cloneNode(true);
      clone.querySelector("[data-role='event-title']").textContent = event.title;
      clone.querySelector("[data-role='event-description']").textContent = event.description;
      clone.querySelector("[data-role='event-category']").textContent = event.category;
      clone.querySelector("[data-role='event-location']").textContent =
        event.locationType === "virtual" ? "Virtual" : event.location?.address ?? "";
      clone.querySelector("[data-role='event-datetime']").textContent = formatDateRange(
        event.startAt,
        event.endAt
      );
      clone.querySelector("[data-role='event-status']").textContent = event.status;
      clone.querySelector("[data-role='event-status']").className = `px-2 py-0.5 rounded-full text-xs font-medium ${statusBadge(event.status)}`;
      const goingCount = rsvps.filter(
        (rsvp) => rsvp.eventId === event.id && rsvp.status === "going"
      ).length;
      const capacityText = goingCount >= event.capacity ? "Completo" : `${event.capacity - goingCount} lugares libres`;
      clone.querySelector(
        "[data-role='event-capacity']"
      ).textContent = `Capacidad: ${goingCount}/${event.capacity} (${capacityText})`;
      clone.querySelector("[data-role='event-rounds']").textContent = `${
        event.rounds.length
      } ronda(s)`;

      const img = clone.querySelector("[data-role='event-image']");
      img.src = event.images?.[0] ?? "https://images.unsplash.com/photo-1489515217757-5fd1be406fef?auto=format&fit=crop&w=800&q=80";
      img.alt = event.title;

      const tagsContainer = clone.querySelector("[data-role='event-tags']");
      event.tags.forEach((tag) => tagsContainer.appendChild(createTagElement(tag)));

      clone.dataset.eventId = event.id;
      clone.querySelectorAll("button[data-action]").forEach((btn) => {
        btn.addEventListener("click", (evt) => {
          evt.stopPropagation();
          onAction?.({
            type: btn.dataset.action,
            event,
            element: btn,
          });
        });
      });

      container.appendChild(clone);
    });

    document.getElementById("events-count").textContent = `${events.length} evento(s)`;
  },

  renderParties(parties, users) {
    const container = document.getElementById("my-parties");
    container.innerHTML = "";
    if (!parties.length) {
      container.innerHTML = `<p class="text-slate-500 text-sm">Aún no tienes parties. Crea una desde cualquier evento.</p>`;
      return;
    }
    parties
      .sort((a, b) => b.createdAt - a.createdAt)
      .forEach((party) => {
        const members = party.members
          .map((id) => users.find((u) => u.id === id)?.name ?? "Anon")
          .join(", ");
        const event = Events.getById(party.eventId);
        const div = document.createElement("div");
        div.className = "border border-slate-800 rounded-xl p-3 bg-slate-950/60";
        div.innerHTML = `
          <div class="flex justify-between items-center">
            <span class="text-xs uppercase tracking-wide text-slate-400">Código</span>
            <button data-code="${party.code}" class="copy-code text-indigo-300 text-xs">Copiar</button>
          </div>
          <div class="text-lg font-semibold">${party.code}</div>
          <p class="text-xs text-slate-400 mt-1">${party.members.length} miembro(s)</p>
          <p class="text-xs text-slate-500 mt-2">${members}</p>
          ${
            event
              ? `<p class="mt-2 text-xs text-slate-400">Evento asociado: <strong>${event.title}</strong></p>`
              : ""
          }
        `;
        div.querySelector(".copy-code").addEventListener("click", async (ev) => {
          ev.preventDefault();
          await navigator.clipboard.writeText(party.code);
          ev.target.textContent = "Copiado";
          setTimeout(() => (ev.target.textContent = "Copiar"), 2000);
        });
        container.appendChild(div);
      });
  },

  renderActivity(logEntries) {
    const container = document.getElementById("activity-log");
    container.innerHTML = "";
    if (!logEntries.length) {
      container.innerHTML = `<li>No hay actividad.</li>`;
      return;
    }
    logEntries
      .slice(0, 30)
      .sort((a, b) => b.createdAt - a.createdAt)
      .forEach((entry) => {
        const li = document.createElement("li");
        const time = new Date(entry.createdAt).toLocaleString("es-AR", {
          hour: "2-digit",
          minute: "2-digit",
          day: "2-digit",
          month: "short",
        });
        li.innerHTML = `<span class="text-slate-500">${time}</span> — ${entry.message}`;
        container.appendChild(li);
      });
  },

  populateFilters(selectedCategory = "") {
    const categorySelect = document.querySelector("select[name='category']");
    Array.from(categorySelect.options)
      .slice(1)
      .forEach((option) => option.remove());
    const categories = Filters.availableCategories();
    categories.forEach((category) => {
      const option = document.createElement("option");
      option.value = category;
      option.textContent = category;
      categorySelect.appendChild(option);
    });
    categorySelect.value = selectedCategory ?? "";
  },

  renderTagPool({ tags, onToggle, activeTags }) {
    const container = document.getElementById("active-tags");
    container.innerHTML = "";
    if (!tags.length) return;
    tags.forEach((tag) => {
      const chip = document.createElement("span");
      chip.className = "tag-chip";
      chip.dataset.tag = tag;
      chip.innerHTML = `#${tag} <button aria-label="Toggle tag">${
        activeTags.includes(tag) ? "✕" : "+"
      }</button>`;
      chip.addEventListener("click", () => onToggle(tag));
      if (activeTags.includes(tag)) {
        chip.classList.add("border-indigo-500", "text-indigo-200");
      }
      container.appendChild(chip);
    });
  },

  showModal({ title, content, actions = [] }) {
    modalTitle().textContent = title;
    modalContent().innerHTML = "";
    if (typeof content === "string") {
      modalContent().innerHTML = content;
    } else if (content instanceof HTMLElement) {
      modalContent().appendChild(content);
    }
    modalFooter().innerHTML = "";
    actions.forEach(({ label, variant = "primary", onClick, type = "button" }) => {
      const button = document.createElement("button");
      button.type = type;
      button.textContent = label;
      button.className =
        variant === "primary"
          ? CLASS_BTN_PRIMARY
          : variant === "outline"
          ? CLASS_BTN_OUTLINE
          : CLASS_BTN_SECONDARY;
      button.addEventListener("click", onClick);
      modalFooter().appendChild(button);
    });
    modalLayer().classList.remove("hidden");
  },

  closeModal() {
    modalLayer().classList.add("hidden");
  },

  buildEventForm({ event, onSubmit }) {
    const form = document.createElement("form");
    form.className = "space-y-4";
    form.innerHTML = `
      <div class="grid sm:grid-cols-2 gap-4">
        <label class="flex flex-col gap-1 text-sm">
          <span class="text-slate-300">Título</span>
          <input required name="title" value="${event?.title ?? ""}" class="rounded-lg bg-slate-950 border border-slate-800 px-3 py-2" />
        </label>
        <label class="flex flex-col gap-1 text-sm">
          <span class="text-slate-300">Categoría</span>
          <input required name="category" value="${event?.category ?? ""}" class="rounded-lg bg-slate-950 border border-slate-800 px-3 py-2" />
        </label>
      </div>
      <label class="flex flex-col gap-1 text-sm">
        <span class="text-slate-300">Descripción</span>
        <textarea required name="description" rows="3" class="rounded-lg bg-slate-950 border border-slate-800 px-3 py-2">${
          event?.description ?? ""
        }</textarea>
      </label>
      <label class="flex flex-col gap-1 text-sm">
        <span class="text-slate-300">Tags (separados por comas)</span>
        <input name="tags" value="${event?.tags?.join(", ") ?? ""}" class="rounded-lg bg-slate-950 border border-slate-800 px-3 py-2" />
      </label>
      <div class="grid sm:grid-cols-2 gap-4">
        <label class="flex flex-col gap-1 text-sm">
          <span class="text-slate-300">Tipo de ubicación</span>
          <select name="locationType" class="rounded-lg bg-slate-950 border border-slate-800 px-3 py-2">
            <option value="physical" ${event?.locationType === "physical" ? "selected" : ""}>Presencial</option>
            <option value="virtual" ${event?.locationType === "virtual" ? "selected" : ""}>Virtual</option>
          </select>
        </label>
        <label class="flex flex-col gap-1 text-sm">
          <span class="text-slate-300">Dirección / link</span>
          <input name="address" value="${event?.location?.address ?? ""}" class="rounded-lg bg-slate-950 border border-slate-800 px-3 py-2" />
        </label>
      </div>
      <div class="grid sm:grid-cols-2 gap-4">
        <label class="flex flex-col gap-1 text-sm">
          <span class="text-slate-300">Inicio</span>
          <input required type="datetime-local" name="startAt" value="${event ? event.startAt.slice(0, 16) : ""}" class="rounded-lg bg-slate-950 border border-slate-800 px-3 py-2" />
        </label>
        <label class="flex flex-col gap-1 text-sm">
          <span class="text-slate-300">Fin</span>
          <input required type="datetime-local" name="endAt" value="${event ? event.endAt.slice(0, 16) : ""}" class="rounded-lg bg-slate-950 border border-slate-800 px-3 py-2" />
        </label>
      </div>
      <label class="flex flex-col gap-1 text-sm">
        <span class="text-slate-300">Capacidad</span>
        <input required type="number" min="1" name="capacity" value="${event?.capacity ?? 50}" class="rounded-lg bg-slate-950 border border-slate-800 px-3 py-2" />
      </label>
      <label class="flex flex-col gap-1 text-sm">
        <span class="text-slate-300">Imagen principal (URL)</span>
        <input name="image" value="${event?.images?.[0] ?? ""}" class="rounded-lg bg-slate-950 border border-slate-800 px-3 py-2" />
      </label>
      <fieldset class="border border-slate-800 rounded-xl p-3 space-y-3">
        <legend class="px-2 text-sm text-slate-400">Rondas (máx 3)</legend>
        <div class="space-y-3" data-rounds></div>
        <button type="button" class="add-round ${CLASS_BTN_OUTLINE}">Agregar ronda</button>
      </fieldset>
    `;

    const roundsContainer = form.querySelector("[data-rounds]");
    const rounds = event?.rounds ?? [];

    const appendRoundRow = (round) => {
      const wrapper = document.createElement("div");
      wrapper.className = "grid sm:grid-cols-[1fr_1fr_auto] gap-3 items-end";
      wrapper.innerHTML = `
        <label class="flex flex-col gap-1 text-sm">
          <span class="text-slate-300">Título</span>
          <input required name="round-title" value="${round?.title ?? ""}" class="rounded-lg bg-slate-950 border border-slate-800 px-3 py-2" />
        </label>
        <div class="grid grid-cols-2 gap-2">
          <label class="flex flex-col gap-1 text-xs">
            <span class="text-slate-400">Inicio</span>
            <input required type="datetime-local" name="round-start" value="${
              round ? round.startAt.slice(0, 16) : ""
            }" class="rounded-lg bg-slate-950 border border-slate-800 px-3 py-2" />
          </label>
          <label class="flex flex-col gap-1 text-xs">
            <span class="text-slate-400">Fin</span>
            <input required type="datetime-local" name="round-end" value="${
              round ? round.endAt.slice(0, 16) : ""
            }" class="rounded-lg bg-slate-950 border border-slate-800 px-3 py-2" />
          </label>
        </div>
        <button type="button" class="remove-round ${CLASS_BTN_SECONDARY}">Eliminar</button>
      `;
      wrapper.querySelector(".remove-round").addEventListener("click", () => {
        wrapper.remove();
      });
      roundsContainer.appendChild(wrapper);
    };

    rounds.forEach((round) => appendRoundRow(round));

    form.querySelector(".add-round").addEventListener("click", () => {
      if (roundsContainer.children.length >= 3) return;
      appendRoundRow();
    });

    form.addEventListener("submit", (eventSubmit) => {
      eventSubmit.preventDefault();
      const formData = new FormData(form);
      const baseEvent = {
        title: formData.get("title"),
        description: formData.get("description"),
        category: formData.get("category"),
        tags: formData
          .get("tags")
          .split(",")
          .map((tag) => tag.trim().toLowerCase())
          .filter(Boolean),
        locationType: formData.get("locationType"),
        location: {
          address: formData.get("address"),
          lat: null,
          lng: null,
        },
        startAt: new Date(formData.get("startAt")).toISOString(),
        endAt: new Date(formData.get("endAt")).toISOString(),
        capacity: Number(formData.get("capacity")),
        images: [formData.get("image")].filter(Boolean),
      };

      const roundRows = Array.from(roundsContainer.children);
      baseEvent.rounds = roundRows.map((row) => {
        const title = row.querySelector("input[name='round-title']").value;
        const startAt = new Date(row.querySelector("input[name='round-start']").value).toISOString();
        const endAt = new Date(row.querySelector("input[name='round-end']").value).toISOString();
        return {
          id: crypto.randomUUID(),
          title,
          startAt,
          endAt,
        };
      });

      onSubmit?.(baseEvent);
    });

    return form;
  },

  buildPartyForm({ onSubmit }) {
    const form = document.createElement("form");
    form.className = "space-y-4";
    form.innerHTML = `
      <label class="flex flex-col gap-1 text-sm">
        <span class="text-slate-300">Asociar a evento (opcional)</span>
        <select name="eventId" class="rounded-lg bg-slate-950 border border-slate-800 px-3 py-2">
          <option value="">Sin evento</option>
          ${Events.all()
            .map((evt) => `<option value="${evt.id}">${evt.title}</option>`)
            .join("")}
        </select>
      </label>
      <label class="flex flex-col gap-1 text-sm">
        <span class="text-slate-300">Privacidad</span>
        <select name="privacy" class="rounded-lg bg-slate-950 border border-slate-800 px-3 py-2">
          <option value="open">Abierta</option>
          <option value="invite">Con invitación</option>
        </select>
      </label>
    `;

    form.addEventListener("submit", (eventSubmit) => {
      eventSubmit.preventDefault();
      const formData = new FormData(form);
      const eventId = formData.get("eventId") || null;
      const privacy = formData.get("privacy");
      onSubmit?.({ eventId, privacy });
    });

    return form;
  },

  buildPartyJoinForm({ onSubmit }) {
    const form = document.createElement("form");
    form.className = "space-y-4";
    form.innerHTML = `
      <label class="flex flex-col gap-1 text-sm">
        <span class="text-slate-300">Código de party</span>
        <input required name="code" placeholder="Ej: AB12" class="uppercase rounded-lg bg-slate-950 border border-slate-800 px-3 py-2" />
      </label>
    `;
    form.addEventListener("submit", (eventSubmit) => {
      eventSubmit.preventDefault();
      const code = form.querySelector("input[name='code']").value.trim();
      onSubmit?.({ code });
    });
    return form;
  },
};

document.getElementById("modal-close").addEventListener("click", () => UI.closeModal());
modalLayer().addEventListener("click", (event) => {
  if (event.target === modalLayer()) {
    UI.closeModal();
  }
});

