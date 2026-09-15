import './style.css';
import { Experience } from './experience.js';
import { buildViews, hotspotCopy } from './content.js';
import { currentWeek, formatClock, loadTelAvivWeek, nightnessAt } from './telaviv.js';

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

async function goTo(id) {
  if (!experience) return;
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
    onHover(id, x, y) {
      if (!id) {
        hoverLabel.hidden = true;
        return;
      }
      hoverLabel.hidden = false;
      hoverLabel.textContent = hotspotCopy[id] ?? id;
      hoverLabel.style.left = `${x}px`;
      hoverLabel.style.top = `${y}px`;
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
  await experience.intro();
});

document.querySelector('.panel-close').addEventListener('click', () => {
  goTo('street');
});

dock.addEventListener('click', (event) => {
  const button = event.target.closest('button[data-view]');
  if (button) goTo(button.dataset.view);
});

await document.fonts.ready;
boot();
