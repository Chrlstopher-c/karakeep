const MINUTE = 60_000;
const HOUR = 60 * MINUTE;
const DAY = 24 * HOUR;

const DATE_FMT = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "short",
});
const TIME_FMT = new Intl.DateTimeFormat("fr-FR", {
  hour: "2-digit",
  minute: "2-digit",
});
const WEEKDAY_FMT = new Intl.DateTimeFormat("fr-FR", { weekday: "long" });
const LONG_FMT = new Intl.DateTimeFormat("fr-FR", {
  weekday: "long",
  day: "numeric",
  month: "long",
});

export function relativeTime(date: Date, now = Date.now()): string {
  const diff = now - date.getTime();
  if (diff < MINUTE) return "à l'instant";
  if (diff < HOUR) return `il y a ${Math.floor(diff / MINUTE)} min`;
  if (diff < DAY) return `il y a ${Math.floor(diff / HOUR)} h`;
  if (diff < 2 * DAY) return "hier";
  return DATE_FMT.format(date);
}

export function shortDate(date: Date): string {
  return DATE_FMT.format(date);
}

export function clockTime(date: Date): string {
  return TIME_FMT.format(date);
}

export function dayLabel(date: Date, now = new Date()): string {
  const start = new Date(
    now.getFullYear(),
    now.getMonth(),
    now.getDate(),
  ).getTime();
  const t = date.getTime();
  if (t >= start) return "AUJOURD'HUI";
  if (t >= start - DAY) return "HIER";
  if (t >= start - 6 * DAY) return WEEKDAY_FMT.format(date).toUpperCase();
  return DATE_FMT.format(date).toUpperCase();
}

export function longToday(now = new Date()): string {
  return LONG_FMT.format(now);
}
