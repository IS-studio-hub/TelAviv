const TZ = 'Asia/Jerusalem';
const LAT = 32.0853;
const LNG = 34.7818;
const WEEKDAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function taParts(date = new Date()) {
  const map = {};
  for (const { type, value } of new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    weekday: 'short',
    hour12: false,
  }).formatToParts(date)) {
    if (type !== 'literal') map[type] = value;
  }
  return map;
}

export function telAvivISODate(date = new Date()) {
  return new Intl.DateTimeFormat('en-CA', {
    timeZone: TZ,
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
  }).format(date);
}

function addDays(iso, n) {
  const [y, m, d] = iso.split('-').map(Number);
  const next = new Date(Date.UTC(y, m - 1, d + n));
  return next.toISOString().slice(0, 10);
}

function formatPretty(iso) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ,
    day: 'numeric',
    month: 'short',
  }).format(new Date(`${iso}T12:00:00Z`));
}

function formatWeekLabel(start, end) {
  const year = start.slice(0, 4);
  const a = formatPretty(start);
  const b = formatPretty(end);
  return `${a} – ${b} ${year}`;
}

export function formatClock(date = new Date()) {
  return new Intl.DateTimeFormat('en-GB', {
    timeZone: TZ,
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).format(date);
}

function weekdayName(iso) {
  return new Intl.DateTimeFormat('en-US', {
    timeZone: TZ,
    weekday: 'short',
  }).format(new Date(`${iso}T12:00:00Z`));
}

export function currentWeek(date = new Date()) {
  const iso = telAvivISODate(date);
  const parts = taParts(date);
  const back = WEEKDAYS.indexOf(parts.weekday);
  const start = addDays(iso, -Math.max(back, 0));
  const days = Array.from({ length: 7 }, (_, i) => {
    const day = addDays(start, i);
    return { iso: day, weekday: weekdayName(day), label: formatPretty(day) };
  });
  return {
    key: start,
    start,
    end: days[6].iso,
    label: formatWeekLabel(start, days[6].iso),
    shortLabel: `${formatPretty(start)} – ${formatPretty(days[6].iso)}`,
    days,
    today: iso,
  };
}

function parseHebcal(items = []) {
  const holidays = [];
  let candles = null;
  let havdalah = null;
  items.forEach((item) => {
    if (item.category === 'candles') candles = item;
    if (item.category === 'havdalah') havdalah = item;
    if (item.category === 'holiday' && (item.subcat === 'major' || /kippur|sukkot|rosh|pesach|shavuot|purim/i.test(item.title))) {
      holidays.push({
        title: item.title.replace(/:\s*\d.*/, ''),
        date: item.date?.slice(0, 10),
        memo: item.memo ?? '',
      });
    }
  });
  return { holidays, candles, havdalah };
}

async function fetchJSON(url) {
  const response = await fetch(url);
  if (!response.ok) throw new Error(`Failed ${url}`);
  return response.json();
}

export async function loadTelAvivWeek(date = new Date()) {
  const week = currentWeek(date);
  let holidays = [];
  let candles = null;
  let havdalah = null;
  let sunrise = null;
  let sunset = null;

  try {
    const hebcal = await fetchJSON(
      `https://www.hebcal.com/hebcal?cfg=json&v=1&maj=1&min=1&mod=1&ss=on&mf=on&c=on&geo=geoname&geonameid=293397&M=on&s=on&start=${week.start}&end=${week.end}`
    );
    const parsed = parseHebcal(hebcal.items);
    holidays = parsed.holidays;
    candles = parsed.candles;
    havdalah = parsed.havdalah;
  } catch (error) {
    console.warn('Hebcal unavailable', error);
  }

  try {
    const sun = await fetchJSON(
      `https://api.open-meteo.com/v1/forecast?latitude=${LAT}&longitude=${LNG}&daily=sunrise,sunset&timezone=Asia%2FJerusalem&forecast_days=2&timeformat=unixtime`
    );
    const toDate = (value) => (value == null ? null : new Date(value * 1000));
    sunrise = toDate(sun.daily?.sunrise?.[0]);
    sunset = toDate(sun.daily?.sunset?.[0]);
    const todayIso = telAvivISODate(date);
    const i = (sun.daily?.time ?? []).findIndex((stamp) => telAvivISODate(new Date(stamp * 1000)) === todayIso);
    if (i >= 0 && sun.daily?.sunrise?.[i] != null) {
      sunrise = toDate(sun.daily.sunrise[i]);
      sunset = toDate(sun.daily.sunset[i]);
    }
  } catch (error) {
    console.warn('Sun times unavailable', error);
  }

  const closedTitles = holidays.map((h) => h.title);
  const yomKippur = holidays.find((h) => /kippur/i.test(h.title));
  const shabbatDay = week.days.find((d) => d.weekday === 'Sat');

  return {
    week,
    holidays,
    candles,
    havdalah,
    sunrise,
    sunset,
    clock: formatClock(date),
    yomKippur,
    shabbatDay,
    closedTitles,
  };
}

export function nightnessAt(date, sunrise, sunset) {
  const now = date.getTime();
  const dusk = 32 * 60 * 1000;
  if (!sunrise || !sunset) {
    const hour = Number(taParts(date).hour);
    if (hour >= 19 || hour < 6) return 1;
    if (hour >= 18) return 0.55;
    if (hour < 7) return 0.4;
    return 0;
  }
  const up = sunrise.getTime();
  const down = sunset.getTime();
  if (now < up - dusk) return 1;
  if (now < up) return (up - now) / dusk;
  if (now < down) return 0;
  if (now < down + dusk) return (now - down) / dusk;
  return 1;
}

export function isNight(date, sunrise, sunset) {
  return nightnessAt(date, sunrise, sunset) >= 0.5;
}
