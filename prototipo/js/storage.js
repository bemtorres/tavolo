const STORAGE_VERSION = "v1.0";
const STORAGE_KEY = "eventforge::state";

const defaultUsers = [
  {
    id: "user-anon",
    name: "Anon",
    avatar: "A",
    preferences: ["techno", "networking", "after-party"],
    mode: "anonymous",
    createdAt: Date.now(),
  },
  {
    id: "user-named",
    name: "Sofía",
    avatar: "S",
    preferences: ["tech", "product", "ux"],
    mode: "named",
    createdAt: Date.now(),
  },
];

const now = new Date();
const addDays = (days) => {
  const d = new Date(now);
  d.setDate(d.getDate() + days);
  return d.toISOString();
};

const defaultEvents = [
  {
    id: "evt-after-office",
    title: "After Office Tech House",
    description:
      "Networking relajado con DJs invitados, barra de cocteles y lighting show.",
    category: "music",
    tags: ["techno", "after office", "networking"],
    locationType: "physical",
    location: {
      address: "Av. Libertador 1234, Buenos Aires",
      lat: null,
      lng: null,
    },
    startAt: addDays(3),
    endAt: addDays(3 + 1 / 24 * 4),
    capacity: 180,
    images: [
      "https://images.unsplash.com/photo-1514525253161-7a46d19cd819?auto=format&fit=crop&w=800&q=80",
    ],
    rounds: [
      {
        id: "rnd-after-office-1",
        title: "Warmup & Check-in",
        startAt: addDays(3),
        endAt: addDays(3 + 1 / 24),
      },
      {
        id: "rnd-after-office-2",
        title: "Live DJ Set",
        startAt: addDays(3 + 2 / 24),
        endAt: addDays(3 + 4 / 24),
      },
    ],
    organizerId: "user-named",
    status: "published",
    createdAt: Date.now(),
  },
  {
    id: "evt-hackathon",
    title: "Hack the City 48h",
    description:
      "Hackathon intensivo con retos urbanos, mentoría y premios para las mejores soluciones.",
    category: "tech",
    tags: ["hackathon", "smartcity", "innovation"],
    locationType: "physical",
    location: {
      address: "Distrito Tech, Montevideo",
      lat: null,
      lng: null,
    },
    startAt: addDays(10),
    endAt: addDays(12),
    capacity: 250,
    images: [
      "https://images.unsplash.com/photo-1521737604893-d14cc237f11d?auto=format&fit=crop&w=800&q=80",
    ],
    rounds: [
      {
        id: "rnd-hackathon-1",
        title: "Kickoff & Equipos",
        startAt: addDays(10),
        endAt: addDays(10 + 4 / 24),
      },
      {
        id: "rnd-hackathon-2",
        title: "Demo Day",
        startAt: addDays(12 - 6 / 24),
        endAt: addDays(12),
      },
    ],
    organizerId: "user-named",
    status: "published",
    createdAt: Date.now(),
  },
  {
    id: "evt-metaverse-meetup",
    title: "Metaverse Creators Meetup",
    description:
      "Sesiones inmersivas en VR, showcases de proyectos y networking virtual.",
    category: "tech",
    tags: ["metaverse", "vr", "networking"],
    locationType: "virtual",
    location: {
      address: "Spatial.io",
      lat: null,
      lng: null,
    },
    startAt: addDays(5),
    endAt: addDays(5 + 3 / 24),
    capacity: 500,
    images: [
      "https://images.unsplash.com/photo-1526498460520-4c246339dccb?auto=format&fit=crop&w=800&q=80",
    ],
    rounds: [
      {
        id: "rnd-metaverse-1",
        title: "Welcome & Show and Tell",
        startAt: addDays(5),
        endAt: addDays(5 + 1 / 24),
      },
      {
        id: "rnd-metaverse-2",
        title: "VR Jam",
        startAt: addDays(5 + 1.5 / 24),
        endAt: addDays(5 + 3 / 24),
      },
    ],
    organizerId: "user-named",
    status: "published",
    createdAt: Date.now(),
  },
  {
    id: "evt-pop-up-gallery",
    title: "Pop-up Gallery & NFT drop",
    description:
      "Exhibición híbrida de arte digital y físico con artistas emergentes e instalación inmersiva.",
    category: "art",
    tags: ["nft", "gallery", "immersive"],
    locationType: "physical",
    location: {
      address: "Matadero Design Hub, Madrid",
      lat: null,
      lng: null,
    },
    startAt: addDays(7),
    endAt: addDays(7 + 3 / 24),
    capacity: 120,
    images: [
      "https://images.unsplash.com/photo-1545239351-1141bd82e8a6?auto=format&fit=crop&w=800&q=80",
    ],
    rounds: [
      {
        id: "rnd-gallery-1",
        title: "Opening & Curated Tour",
        startAt: addDays(7),
        endAt: addDays(7 + 1 / 24),
      },
      {
        id: "rnd-gallery-2",
        title: "Live Minting",
        startAt: addDays(7 + 1.5 / 24),
        endAt: addDays(7 + 3 / 24),
      },
    ],
    organizerId: "user-named",
    status: "published",
    createdAt: Date.now(),
  },
  {
    id: "evt-prototyping-sprint",
    title: "Design Prototyping Sprint",
    description:
      "Taller intensivo de 1 día para crear prototipos high-fidelity con feedback de expertos UX.",
    category: "design",
    tags: ["ux", "figma", "design sprint"],
    locationType: "physical",
    location: {
      address: "WeWork Reforma, CDMX",
      lat: null,
      lng: null,
    },
    startAt: addDays(14),
    endAt: addDays(14 + 8 / 24),
    capacity: 60,
    images: [
      "https://images.unsplash.com/photo-1553877522-43269d4ea984?auto=format&fit=crop&w=800&q=80",
    ],
    rounds: [
      {
        id: "rnd-proto-1",
        title: "Ideation & Sketching",
        startAt: addDays(14),
        endAt: addDays(14 + 2 / 24),
      },
      {
        id: "rnd-proto-2",
        title: "Figma Jam",
        startAt: addDays(14 + 3 / 24),
        endAt: addDays(14 + 6 / 24),
      },
      {
        id: "rnd-proto-3",
        title: "User Testing",
        startAt: addDays(14 + 6 / 24),
        endAt: addDays(14 + 8 / 24),
      },
    ],
    organizerId: "user-named",
    status: "published",
    createdAt: Date.now(),
  },
  {
    id: "evt-streaming-festival",
    title: "Streaming Festival LATAM",
    description:
      "Evento virtual con streamers, gaming arenas, sorteos y paneles de monetización.",
    category: "gaming",
    tags: ["streaming", "gaming", "latam"],
    locationType: "virtual",
    location: {
      address: "Twitch Live",
      lat: null,
      lng: null,
    },
    startAt: addDays(2),
    endAt: addDays(2 + 12 / 24),
    capacity: 2000,
    images: [
      "https://images.unsplash.com/photo-1511512578047-dfb367046420?auto=format&fit=crop&w=800&q=80",
    ],
    rounds: [
      {
        id: "rnd-stream-1",
        title: "Open Stage",
        startAt: addDays(2),
        endAt: addDays(2 + 4 / 24),
      },
      {
        id: "rnd-stream-2",
        title: "Battle Royale Finals",
        startAt: addDays(2 + 4 / 24),
        endAt: addDays(2 + 8 / 24),
      },
      {
        id: "rnd-stream-3",
        title: "Creator Economy Panel",
        startAt: addDays(2 + 8 / 24),
        endAt: addDays(2 + 12 / 24),
      },
    ],
    organizerId: "user-anon",
    status: "published",
    createdAt: Date.now(),
  },
  {
    id: "evt-wellness-retreat",
    title: "Wellness & Breathwork Retreat",
    description:
      "Retiro de fin de semana con yoga, respiración consciente y alimentación plant-based.",
    category: "wellness",
    tags: ["yoga", "breathwork", "detox"],
    locationType: "physical",
    location: {
      address: "Casa Silvestre, Valle de Bravo",
      lat: null,
      lng: null,
    },
    startAt: addDays(20),
    endAt: addDays(22),
    capacity: 45,
    images: [
      "https://images.unsplash.com/photo-1528715471579-d1bcf0ba5e83?auto=format&fit=crop&w=800&q=80",
    ],
    rounds: [
      {
        id: "rnd-wellness-1",
        title: "Arrival & Sound Bath",
        startAt: addDays(20 + 2 / 24),
        endAt: addDays(20 + 4 / 24),
      },
      {
        id: "rnd-wellness-2",
        title: "Breathwork Journey",
        startAt: addDays(21),
        endAt: addDays(21 + 2 / 24),
      },
    ],
    organizerId: "user-anon",
    status: "published",
    createdAt: Date.now(),
  },
  {
    id: "evt-ai-salon",
    title: "AI Product Salon",
    description:
      "Conversatorio íntimo para founders construyendo productos con IA generativa.",
    category: "tech",
    tags: ["ai", "product", "founders"],
    locationType: "physical",
    location: {
      address: "The Hub, Santiago de Chile",
      lat: null,
      lng: null,
    },
    startAt: addDays(9),
    endAt: addDays(9 + 3 / 24),
    capacity: 35,
    images: [
      "https://images.unsplash.com/photo-1531297484001-80022131f5a1?auto=format&fit=crop&w=800&q=80",
    ],
    rounds: [
      {
        id: "rnd-ai-1",
        title: "Lightning Talks",
        startAt: addDays(9),
        endAt: addDays(9 + 1 / 24),
      },
      {
        id: "rnd-ai-2",
        title: "Roundtable",
        startAt: addDays(9 + 1.5 / 24),
        endAt: addDays(9 + 3 / 24),
      },
    ],
    organizerId: "user-named",
    status: "published",
    createdAt: Date.now(),
  },
  {
    id: "evt-community-brunch",
    title: "Community Builders Brunch",
    description:
      "Encuentro mensual para líderes de comunidades con dinámicas de co-creación.",
    category: "community",
    tags: ["community", "brunch", "leadership"],
    locationType: "physical",
    location: {
      address: "Terraza Norte, Bogotá",
      lat: null,
      lng: null,
    },
    startAt: addDays(4),
    endAt: addDays(4 + 3 / 24),
    capacity: 80,
    images: [
      "https://images.unsplash.com/photo-1525253086316-d0c936c814f8?auto=format&fit=crop&w=800&q=80",
    ],
    rounds: [
      {
        id: "rnd-community-1",
        title: "Icebreaker Circles",
        startAt: addDays(4),
        endAt: addDays(4 + 1 / 24),
      },
      {
        id: "rnd-community-2",
        title: "Playbook Swap",
        startAt: addDays(4 + 1.5 / 24),
        endAt: addDays(4 + 3 / 24),
      },
    ],
    organizerId: "user-anon",
    status: "published",
    createdAt: Date.now(),
  },
  {
    id: "evt-film-night",
    title: "Indie Film Night",
    description:
      "Proyección de cortos indie con debate y votación del público.",
    category: "film",
    tags: ["cinema", "indie", "screening"],
    locationType: "physical",
    location: {
      address: "Cinema Rooftop, Lima",
      lat: null,
      lng: null,
    },
    startAt: addDays(6),
    endAt: addDays(6 + 4 / 24),
    capacity: 140,
    images: [
      "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=800&q=80",
    ],
    rounds: [
      {
        id: "rnd-film-1",
        title: "Screening",
        startAt: addDays(6),
        endAt: addDays(6 + 3 / 24),
      },
      {
        id: "rnd-film-2",
        title: "Audience Q&A",
        startAt: addDays(6 + 3 / 24),
        endAt: addDays(6 + 4 / 24),
      },
    ],
    organizerId: "user-named",
    status: "published",
    createdAt: Date.now(),
  },
];

const defaultParties = [
  {
    id: "pty-after-office-core",
    ownerId: "user-named",
    code: "AO42",
    eventId: "evt-after-office",
    privacy: "invite",
    members: ["user-named"],
    createdAt: Date.now(),
  },
];

const defaultRsvps = [
  {
    id: "rsvp-1",
    userId: "user-named",
    eventId: "evt-after-office",
    partyId: "pty-after-office-core",
    status: "going",
    createdAt: Date.now(),
  },
];

const defaultActivity = [
  {
    id: "act-seed",
    message: "Base de datos inicial cargada",
    createdAt: Date.now(),
  },
];

const initialState = {
  version: STORAGE_VERSION,
  currentUserId: "user-anon",
  users: defaultUsers,
  events: defaultEvents,
  parties: defaultParties,
  rsvps: defaultRsvps,
  activity: defaultActivity,
};

export const Storage = {
  getState() {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    try {
      const parsed = JSON.parse(raw);
      return parsed;
    } catch (error) {
      console.error("Error leyendo localStorage", error);
      return null;
    }
  },
  setState(state) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  },
  load() {
    const state = this.getState();
    if (!state || state.version !== STORAGE_VERSION) {
      this.setState(initialState);
      return structuredClone(initialState);
    }
    return state;
  },
  replace(state) {
    this.setState({ ...state, version: STORAGE_VERSION });
    document.dispatchEvent(new CustomEvent("storage:sync", { detail: state }));
  },
  patch(partial) {
    const current = this.load();
    const next = { ...current, ...partial };
    this.replace(next);
    return next;
  },
  log(message) {
    const state = this.load();
    const entry = {
      id: `act-${crypto.randomUUID()}`,
      message,
      createdAt: Date.now(),
    };
    const activity = [entry, ...state.activity].slice(0, 40);
    this.patch({ activity });
    return entry;
  },
};

export const generateId = (prefix) => `${prefix}-${crypto.randomUUID()}`;

export const selectState = (selector) => {
  const state = Storage.load();
  return selector(state);
};

