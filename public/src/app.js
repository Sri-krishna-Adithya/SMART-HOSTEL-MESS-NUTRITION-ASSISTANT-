import { MEALS, calcTargets, toGrams, scaleFood, sumEntries, suggestFoods } from './nutrition.js';
import { FOODS, WEEK_MENU } from '../data/menu.js';
import { daysInMonth } from './calendar.js';
import { load, save } from './storage.js';

const $ = (sel) => document.querySelector(sel);
const r1 = (n) => Math.round(n * 10) / 10;

const state = {
  profile: load('profile', null),
  logs: load('logs', {}),
  date: toISODate(new Date()),
  meal: 'breakfast',
  month: toISODate(new Date()).slice(0, 7),
};

function toISODate(d) {
  return new Date(d - d.getTimezoneOffset() * 60000).toISOString().slice(0, 10);
}

const todaysEntries = () => state.logs[state.date] || [];
const menuFor = (date) => WEEK_MENU[new Date(date + 'T00:00:00').getDay()];

function targets() {
  try { return state.profile ? calcTargets(state.profile) : null; } catch { return null; }
}

function showMessage(id, text) {
  $(id).textContent = text;
}

function el(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// ---- profile ----
function fillProfileForm() {
  if (!state.profile) return;
  for (const [k, v] of Object.entries(state.profile)) {
    const input = $('#profile-form').elements[k];
    if (input) input.value = v;
  }
}

$('#profile-form').addEventListener('submit', (e) => {
  e.preventDefault();
  const f = new FormData(e.target);
  const profile = {
    sex: f.get('sex'),
    age: Number(f.get('age')),
    heightCm: Number(f.get('heightCm')),
    weightKg: Number(f.get('weightKg')),
    activity: f.get('activity'),
    goal: f.get('goal'),
    budget: Number(f.get('budget')) || 0,
  };
  try {
    calcTargets(profile);
  } catch (err) {
    return showMessage('#profile-msg', err.message);
  }
  state.profile = profile;
  save('profile', profile);
  showMessage('#profile-msg', 'Goals saved');
  render();
});

// ---- menu ----
function renderTabs() {
  const tabs = $('#meal-tabs');
  tabs.replaceChildren();
  for (const meal of MEALS) {
    const b = el('button', meal === state.meal ? 'tab active' : 'tab', meal);
    b.type = 'button';
    b.addEventListener('click', () => { state.meal = meal; render(); });
    tabs.append(b);
  }
}

function renderMenu() {
  const list = $('#menu-list');
  list.replaceChildren();
  for (const id of menuFor(state.date)[state.meal]) {
    const food = FOODS[id];
    const n = scaleFood(food, food.serving);
    const row = el('li', 'row');
    const info = el('div', 'info');
    info.append(el('strong', '', food.name), el('span', 'muted', `1 serving = ${food.serving} g, ${Math.round(n.kcal)} kcal, ${r1(n.protein)} g protein`));

    const qty = el('input'); qty.type = 'number'; qty.min = '0'; qty.step = 'any'; qty.value = '1'; qty.ariaLabel = `Quantity of ${food.name}`;
    const unit = el('select');
    for (const u of ['serving', 'grams']) unit.append(new Option(u, u));
    unit.addEventListener('change', () => { qty.value = unit.value === 'grams' ? food.serving : 1; });
    const add = el('button', 'primary', 'Add'); add.type = 'button';
    add.addEventListener('click', () => addEntry(id, qty.value, unit.value));

    row.append(info, qty, unit, add);
    list.append(row);
  }
}

function addEntry(foodId, quantity, unit) {
  try {
    const grams = toGrams(FOODS[foodId], quantity, unit);
    const entry = { id: Date.now() + Math.random(), foodId, grams, meal: state.meal };
    state.logs[state.date] = [...todaysEntries(), entry];
    save('logs', state.logs);
    showMessage('#menu-msg', '');
    render();
  } catch (err) {
    showMessage('#menu-msg', err.message);
  }
}

function removeEntry(id) {
  state.logs[state.date] = todaysEntries().filter((e) => e.id !== id);
  save('logs', state.logs);
  render();
}

// ---- log + totals ----
function renderLog() {
  const list = $('#log-list');
  list.replaceChildren();
  const entries = todaysEntries();
  if (!entries.length) list.append(el('li', 'muted', 'Nothing logged for this day yet.'));
  for (const e of entries) {
    const n = scaleFood(FOODS[e.foodId], e.grams);
    const row = el('li', 'row');
    row.append(el('span', '', `${e.meal}: ${FOODS[e.foodId].name}, ${Math.round(e.grams)} g`), el('span', 'muted', `${Math.round(n.kcal)} kcal, ${r1(n.protein)} g protein`));
    const del = el('button', 'link', 'Remove'); del.type = 'button';
    del.addEventListener('click', () => removeEntry(e.id));
    row.append(del);
    list.append(row);
  }
}

function bar(label, value, target, unit) {
  const wrap = el('div', 'bar');
  const pct = target ? Math.min(100, (value / target) * 100) : 0;
  const fill = el('div', pct >= 100 ? 'fill over' : 'fill');
  fill.style.width = pct + '%';
  const track = el('div', 'track'); track.append(fill);
  wrap.append(el('span', '', `${label}: ${Math.round(value)}${target ? ' / ' + target : ''} ${unit}`), track);
  return wrap;
}

function renderTotals() {
  const box = $('#totals');
  box.replaceChildren();
  const t = sumEntries(todaysEntries(), FOODS);
  const goal = targets();
  box.append(bar('Calories', t.kcal, goal?.calories, 'kcal'), bar('Protein', t.protein, goal?.protein, 'g'), bar('Carbs', t.carbs, goal?.carbs, 'g'), bar('Fats', t.fat, goal?.fat, 'g'));
  if (!goal) box.append(el('p', 'muted', 'Save your details above to see targets.'));
}

// ---- suggestions ----
function renderSuggestions() {
  const box = $('#suggestions');
  box.replaceChildren();
  const goal = targets();
  if (!goal) return box.append(el('p', 'muted', 'Save your details to get recommendations.'));

  const totals = sumEntries(todaysEntries(), FOODS);
  const remaining = { kcal: goal.calories - totals.kcal, protein: goal.protein - totals.protein };
  if (remaining.protein <= 0 || remaining.kcal <= 0) return box.append(el('p', 'muted', 'You have reached today\'s calorie or protein target.'));

  const eaten = new Set(todaysEntries().map((e) => e.meal));
  const menu = menuFor(state.date);
  const pending = MEALS.filter((m) => !eaten.has(m)).flatMap((m) => menu[m]);
  const extras = Object.keys(FOODS).filter((id) => FOODS[id].extra);
  const spent = 0; // add-ons are not tracked as purchases yet
  const picks = suggestFoods({ candidates: [...new Set([...pending, ...extras])], foods: FOODS, remaining, budgetLeft: (state.profile.budget || 0) - spent });

  box.append(el('p', 'muted', `Still to go: ${Math.round(remaining.kcal)} kcal, ${Math.round(remaining.protein)} g protein`));
  for (const p of picks) {
    const where = p.food.extra ? `add-on, Rs ${p.cost}` : 'on the mess menu today';
    box.append(el('p', '', `${p.food.name} (${p.food.serving} g): ${Math.round(p.nutrients.kcal)} kcal, ${r1(p.nutrients.protein)} g protein, ${where}`));
  }
  if (!picks.length) box.append(el('p', 'muted', 'No option fits your remaining calories and budget.'));
}

// ---- monthly menu ----
function renderMonth() {
  $('#month').value = state.month;
  const table = $('#month-table');
  table.replaceChildren();

  const head = el('tr');
  for (const h of ['Date', ...MEALS]) head.append(el('th', '', h));
  const thead = el('thead');
  thead.append(head);
  table.append(thead);

  const body = el('tbody');
  const todayKey = toISODate(new Date());
  for (const date of daysInMonth(state.month)) {
    const menu = menuFor(date);
    const row = el('tr', [date === todayKey && 'today', date === state.date && 'selected'].filter(Boolean).join(' '));
    const label = new Date(date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'short', day: 'numeric' });
    row.append(el('td', '', label));
    for (const meal of MEALS) row.append(el('td', '', menu[meal].map((id) => FOODS[id].name).join(', ')));
    row.addEventListener('click', () => { state.date = date; render(); });
    body.append(row);
  }
  table.append(body);
}

// ---- history ----
function renderHistory() {
  const box = $('#history');
  box.replaceChildren();
  const goal = targets();
  for (let i = 6; i >= 0; i--) {
    const d = new Date(state.date + 'T00:00:00');
    d.setDate(d.getDate() - i);
    const key = toISODate(d);
    const kcal = sumEntries(state.logs[key] || [], FOODS).kcal;
    box.append(bar(key, kcal, goal?.calories, 'kcal'));
  }
}

function render() {
  $('#date').value = state.date;
  renderTabs();
  renderMenu();
  renderLog();
  renderTotals();
  renderSuggestions();
  renderMonth();
  renderHistory();
}

$('#date').addEventListener('change', (e) => {
  if (!e.target.value) return;
  state.date = e.target.value;
  state.month = state.date.slice(0, 7);
  render();
});

$('#month').addEventListener('change', (e) => {
  if (!e.target.value) return;
  state.month = e.target.value;
  render();
});

// ---- ask a question ----
function buildContext() {
  const menu = menuFor(state.date);
  const names = {};
  for (const meal of MEALS) names[meal] = menu[meal].map((id) => FOODS[id].name);
  const t = sumEntries(todaysEntries(), FOODS);
  return {
    weekday: new Date(state.date + 'T00:00:00').toLocaleDateString('en-US', { weekday: 'long' }),
    menu: names,
    eaten: { kcal: Math.round(t.kcal), protein: Math.round(t.protein), carbs: Math.round(t.carbs), fat: Math.round(t.fat) },
    targets: targets(),
    goal: state.profile ? state.profile.goal : null,
    addOnBudget: state.profile ? state.profile.budget : null,
  };
}

async function askQuestion(e) {
  e.preventDefault();
  const question = $('#question').value.trim();
  if (!question) return showMessage('#ask-msg', 'Type a question first');

  const button = $('#ask-button');
  button.disabled = true;
  $('#answer').textContent = '';
  showMessage('#ask-msg', 'Getting an answer...');
  try {
    const res = await fetch('/api/ask', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ question, context: buildContext() }),
    });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Could not get an answer, try again later');
    $('#answer').textContent = data.answer;
    showMessage('#ask-msg', '');
  } catch (err) {
    showMessage('#ask-msg', err.message);
  } finally {
    button.disabled = false;
  }
}

$('#ask-form').addEventListener('submit', askQuestion);

fillProfileForm();
render();
