import './style.css';
import { Experience } from './experience.js';
import { buildViews, hotspotCopy } from './content.js';
import { currentWeek, formatClock, loadTelAvivWeek, nightnessAt } from './telaviv.js';

let touchUi =
  new URLSearchParams(location.search).has('touch') ||
  navigator.maxTouchPoints > 0 ||
  window.matchMedia('(any-pointer: coarse)').matches;
if (touchUi) document.documentElement.classList.add('is-touch');

function setTouchHint() {
  const hint = document.querySelector('#hint');
  if (hint) {
    hint.textContent =
      'Slide to move · Two fingers to look around · Tap the roof, bike, door, car, or trash';
  }
}

function activateTouchUi() {
  touchUi = true;
  document.documentElement.classList.add('is-touch');
  experience?.enableTouchNav();
  if (hud && !hud.hidden) setTouchHint();
}

const loader = document.querySelector('#loader');
const status = document.querySelector('#loader-status');
const pctEl = document.querySelector('#loader-pct');
const start = document.querySelector('#start');
const hud = document.querySelector('#hud');
const panel = document.querySelector('#panel');
const panelKicker = document.querySelector('#panel-kicker');
const panelTitle = document.querySelector('#panel-title');
const panelBody = document.querySelector('#panel-body');
const hoverLabel = document.querySelector('#hover-label');
const menu = document.querySelector('.explore-menu');
const menuToggle = document.querySelector('.menu-toggle');
const dock = document.querySelector('.dock');
const weekLabel = document.querySelector('#week-label');
const cycleLabel = document.querySelector('#cycle-label');

let experience;
let displayPct = 0;
let targetPct = 0;
let views = buildViews({ week: currentWeek(), holidays: [] });
let openView = 'street';

function setProgress(value) {
  targetPct = Math.round(value * 100);
}

function tickPct() {
  displayPct += (targetPct - displayPct) * 0.12;
  if (displayPct < targetPct) displayPct += 0.4;
  const shown = Math.min(100, Math.round(displayPct));
  pctEl.textContent = `${shown}%`;
  if (shown < 100 || displayPct < 99.5) {
    requestAnimationFrame(tickPct);
  } else {
    pctEl.textContent = '100%';
    status.hidden = true;
    start.hidden = false;
  }
}

function openPanel(id) {
  openView = id;
  if (id === 'street') {
    closePanel();
    return;
  }
  const data = views[id];
  if (!data) return;
  panelKicker.textContent = data.kicker;
  panelTitle.textContent = data.title;
  panelBody.innerHTML = data.html ?? '';
  panel.hidden = false;
  dock.querySelectorAll('button').forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.view === id);
  });
}

function closePanel() {
  openView = 'street';
  panel.hidden = true;
  dock.querySelectorAll('button').forEach((btn) => {
    btn.classList.toggle('is-active', btn.dataset.view === 'street');
  });
}

function closeMenu() {
  menu.classList.remove('is-open');
  document.documentElement.classList.remove('explore-open');
  menuToggle.setAttribute('aria-expanded', 'false');
  menuToggle.setAttribute('aria-label', 'Open menu');
}

function toggleMenu() {
  const open = !menu.classList.contains('is-open');
  menu.classList.toggle('is-open', open);
  document.documentElement.classList.toggle('explore-open', open);
  menuToggle.setAttribute('aria-expanded', String(open));
  menuToggle.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
}

async function goTo(id) {
  if (!experience) return;
  closeMenu();
  openPanel(id);
  await experience.flyTo(id);
}

function applyLive(ctx) {
  views = buildViews(ctx);
  weekLabel.textContent = ctx.week.label;
  const night = nightnessAt(new Date(), ctx.sunrise, ctx.sunset);
  const phase = night >= 0.55 ? 'Night' : night >= 0.12 ? 'Dusk' : 'Day';
  cycleLabel.textContent = ctx.clock ? `${ctx.clock} · ${phase} in Tel Aviv` : `${phase} in Tel Aviv`;
  experience?.setCycle(night);
  if (openView !== 'street' && !panel.hidden) {
    openPanel(openView);
  }
}

async function refreshTelAviv() {
  try {
    const ctx = await loadTelAvivWeek();
    applyLive(ctx);
  } catch (error) {
    console.warn('Tel Aviv live data unavailable', error);
    const week = currentWeek();
    applyLive({ week, holidays: [], sunrise: null, sunset: null, clock: formatClock() });
  }
}

function boot() {
  tickPct();
  applyLive({ week: currentWeek(), holidays: [], sunrise: null, sunset: null, clock: formatClock() });
  experience = new Experience(document.querySelector('#scene'), {
    onProgress: setProgress,
    touchNav: touchUi,
    onHover(id, x, y) {
      if (!id) {
        hoverLabel.hidden = true;
        return;
      }
      hoverLabel.hidden = false;
      hoverLabel.textContent = hotspotCopy[id] ?? id;
      const pad = 24;
      hoverLabel.style.left = `${Math.min(window.innerWidth - pad, Math.max(pad, x))}px`;
      hoverLabel.style.top = `${Math.min(window.innerHeight - 72, Math.max(36, y))}px`;
    },
    onSelect(id) {
      goTo(id);
    },
  });
  refreshTelAviv();
  setInterval(refreshTelAviv, 20000);
}

start.addEventListener('click', async () => {
  await experience.ready;
  loader.classList.add('is-gone');
  hud.hidden = false;
  if (document.documentElement.classList.contains('is-touch')) {
    setTouchHint();
  }
  await experience.intro();
});

const CLICK_SLOP = 8;
let hudPress = null;
let draggedGesture = false;
let pointerHeld = false;
let gestureOrigin = { x: 0, y: 0 };

window.addEventListener(
  'pointerdown',
  (event) => {
    if (event.pointerType === 'touch') activateTouchUi();
    pointerHeld = true;
    draggedGesture = false;
    gestureOrigin = { x: event.clientX, y: event.clientY };
  },
  true
);

window.addEventListener(
  'pointermove',
  (event) => {
    if (!pointerHeld || draggedGesture) return;
    const dx = event.clientX - gestureOrigin.x;
    const dy = event.clientY - gestureOrigin.y;
    if (dx * dx + dy * dy > CLICK_SLOP * CLICK_SLOP) draggedGesture = true;
  },
  true
);

window.addEventListener(
  'pointerup',
  () => {
    pointerHeld = false;
    requestAnimationFrame(() => {
      draggedGesture = false;
    });
  },
  true
);

window.addEventListener(
  'click',
  (event) => {
    if (!draggedGesture) return;
    if (event.target.closest('.dock, .panel-close, .menu-toggle')) {
      event.preventDefault();
      event.stopPropagation();
    }
  },
  true
);

function isIntentionalClick(event, target) {
  if (draggedGesture) return false;
  if (!hudPress || (target && hudPress.target !== target)) {
    hudPress = null;
    return false;
  }
  const dx = event.clientX - hudPress.x;
  const dy = event.clientY - hudPress.y;
  hudPress = null;
  return dx * dx + dy * dy <= CLICK_SLOP * CLICK_SLOP;
}

const panelClose = document.querySelector('.panel-close');
panelClose.addEventListener('pointerdown', (event) => {
  hudPress = { x: event.clientX, y: event.clientY, target: panelClose };
});
panelClose.addEventListener('click', (event) => {
  if (!isIntentionalClick(event, panelClose)) return;
  goTo('street');
});

menuToggle.addEventListener('pointerdown', (event) => {
  event.stopPropagation();
  hudPress = { x: event.clientX, y: event.clientY, target: menuToggle };
});

menuToggle.addEventListener('click', (event) => {
  event.stopPropagation();
  if (!isIntentionalClick(event, menuToggle)) return;
  toggleMenu();
});

document.addEventListener('pointerdown', (event) => {
  if (!menu.classList.contains('is-open')) return;
  if (!menu.contains(event.target)) closeMenu();
});

dock.addEventListener('pointerdown', (event) => {
  const button = event.target.closest('button[data-view]');
  if (!button) return;
  hudPress = { x: event.clientX, y: event.clientY, target: button };
});

dock.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-view]');
  if (!button || !isIntentionalClick(event, button)) return;
  goTo(button.dataset.view);
});

await document.fonts.ready;
boot();
