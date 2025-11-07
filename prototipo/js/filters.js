import { Events } from "./events.js";

const withinRange = (value, from, to) => {
  const ts = new Date(value).getTime();
  if (from && ts < new Date(from).getTime()) return false;
  if (to && ts > new Date(to).getTime()) return false;
  return true;
};

const relevanceScore = (event, { queryTokens, tags, preferences }) => {
  let score = 0;
  if (preferences?.length) {
    const matches = event.tags.filter((tag) => preferences.includes(tag));
    score += matches.length * 2;
  }
  if (tags.length) {
    const matches = event.tags.filter((tag) => tags.includes(tag));
    score += matches.length * 3;
  }
  if (queryTokens.length) {
    const text = `${event.title} ${event.description} ${event.location?.address ?? ""}`.toLowerCase();
    queryTokens.forEach((token) => {
      if (text.includes(token)) score += 1.5;
    });
  }
  return score;
};

export const Filters = {
  availableCategories() {
    return Events.categories();
  },
  availableTags() {
    return Events.tags();
  },
  apply(events, filters, context = {}) {
    const { query, category, locationType, dateFrom, dateTo, tags = [], sort = "date" } = filters;
    const queryTokens = query
      ? query
          .toLowerCase()
          .split(/[\s,]+/)
          .filter(Boolean)
      : [];

    const filtered = events.filter((event) => {
      if (category && event.category !== category) return false;
      if (locationType && event.locationType !== locationType) return false;
      if (!withinRange(event.startAt, dateFrom, dateTo)) return false;
      if (tags.length && !tags.some((tag) => event.tags.includes(tag))) return false;
      if (queryTokens.length) {
        const text = `${event.title} ${event.description} ${event.location?.address ?? ""}`.toLowerCase();
        if (!queryTokens.every((token) => text.includes(token))) return false;
      }
      return true;
    });

    if (sort === "relevance") {
      return filtered
        .map((event) => ({
          event,
          score: relevanceScore(event, {
            queryTokens,
            tags,
            preferences: context.preferences ?? [],
          }),
        }))
        .sort((a, b) => b.score - a.score)
        .map(({ event }) => event);
    }

    return filtered.sort(
      (a, b) => new Date(a.startAt).getTime() - new Date(b.startAt).getTime()
    );
  },
};

