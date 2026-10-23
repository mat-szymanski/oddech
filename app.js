'use strict';

/* ---------- Stałe ---------- */

const KEY = 'oddech:v1';
const MIN = 6e4, H = 36e5, D = 864e5, Y = 365.25 * D;
// Szacunek UCL (2025): jeden papieros skraca życie średnio o ok. 20 minut.
const LIFE_MIN_PER_CIG = 20;
const SOS_DURATION = 3 * MIN;

const MILESTONES = [
  { t: 20 * MIN, when: '20 minut', title: 'Tętno i ciśnienie', text: 'Tętno i ciśnienie krwi zaczynają wracać do normy.' },
  { t: 8 * H, when: '8 godzin', title: 'Więcej tlenu', text: 'Poziom nikotyny i tlenku węgla we krwi spada o ponad połowę, natlenienie organizmu wraca do normy.' },
  { t: 24 * H, when: '1 dzień', title: 'Pierwsza doba', text: 'Organizm intensywnie pozbywa się tlenku węgla. Głód bywa teraz najsilniejszy – to znak, że ciało się oczyszcza.' },
  { t: 48 * H, when: '2 dni', title: 'Smak i węch', text: 'Tlenek węgla jest usunięty z organizmu. Płuca zaczynają oczyszczać się ze śluzu, wracają smak i węch.' },
  { t: 72 * H, when: '3 dni', title: 'Łatwiej oddychać', text: 'Oskrzela się rozluźniają, oddycha się łatwiej i przybywa energii. Nikotyny praktycznie nie ma już w organizmie.' },
  { t: 14 * D, when: '2 tygodnie', title: 'Lepsze krążenie', text: 'Między 2. a 12. tygodniem poprawia się krążenie – spacer, schody czy trening idą wyraźnie lżej.' },
  { t: 30 * D, when: '1 miesiąc', title: 'Miesiąc wolności', text: 'Objawy odstawienia zwykle wyraźnie słabną. Łatwiej o dobry sen i koncentrację.' },
  { t: 90 * D, when: '3 miesiące', title: 'Sprawniejsze płuca', text: 'Kaszel i świszczący oddech słabną. W ciągu 3–9 miesięcy wydolność płuc może wzrosnąć nawet o 10%.' },
  { t: 365 * D, when: '1 rok', title: 'Zdrowsze serce', text: 'Ryzyko choroby wieńcowej spada mniej więcej o połowę w porównaniu z osobą palącą.' },
  { t: 5 * Y, when: '5 lat', title: 'Mniejsze ryzyko udaru', text: 'Ryzyko udaru mózgu wyraźnie spada – u wielu osób z czasem do poziomu osoby niepalącej.' },
  { t: 10 * Y, when: '10 lat', title: 'Płuca', text: 'Ryzyko raka płuca jest mniej więcej o połowę niższe niż u osoby, która dalej pali.' },
  { t: 15 * Y, when: '15 lat', title: 'Jak u niepalącego', text: 'Ryzyko choroby serca jest zbliżone do ryzyka osoby, która nigdy nie paliła.' },
];

const BADGES = [
  { id: 'd1', icon: '🌱', name: 'Pierwsza doba', desc: '24 h bez dymu', test: s => s.days >= 1 },
  { id: 'd3', icon: '💨', name: 'Nikotyna out', desc: '3 dni', test: s => s.days >= 3 },
  { id: 'w1', icon: '⭐', name: 'Tydzień', desc: '7 dni', test: s => s.days >= 7 },
  { id: 'w2', icon: '🏃', name: 'Dwa tygodnie', desc: '14 dni', test: s => s.days >= 14 },
  { id: 'm1', icon: '🏅', name: 'Miesiąc', desc: '30 dni', test: s => s.days >= 30 },
  { id: 'm3', icon: '🫁', name: 'Kwartał', desc: '90 dni', test: s => s.days >= 90 },
  { id: 'm6', icon: '💎', name: 'Pół roku', desc: '182 dni', test: s => s.days >= 182 },
  { id: 'y1', icon: '🏆', name: 'Rok wolności', desc: '365 dni', test: s => s.days >= 365 },
  { id: 'c100', icon: '🚭', name: 'Setka', desc: '100 niewypalonych', test: s => s.avoided >= 100 },
  { id: 'c1000', icon: '🧱', name: 'Tysiąc', desc: '1000 niewypalonych', test: s => s.avoided >= 1000 },
  { id: 'z100', icon: '💰', name: 'Pierwsza stówka', desc: '100 zł w kieszeni', test: s => s.money >= 100 },
  { id: 'z1000', icon: '🤑', name: 'Tysiączek', desc: '1000 zł w kieszeni', test: s => s.money >= 1000 },
  { id: 'k1', icon: '🛡️', name: 'Pierwsza wygrana', desc: 'pokonana zachcianka', test: s => s.resisted >= 1 },
  { id: 'k10', icon: '⚔️', name: 'Wojownik', desc: '10 pokonanych', test: s => s.resisted >= 10 },
  { id: 'k50', icon: '🧘', name: 'Mistrz spokoju', desc: '50 pokonanych', test: s => s.resisted >= 50 },
];

const QUOTES = [
  'Każda zachcianka mija – nawet jeśli jej nie spełnisz.',
  'Nie musisz rzucać na zawsze. Wystarczy, że nie zapalisz dzisiaj.',
  'Głód nikotynowy trwa minuty. Satysfakcja zostaje na dłużej.',
  'Twoje ciało już ci dziękuje – nawet jeśli jeszcze tego nie czujesz.',
  'Jeden papieros to prawie nigdy nie jest jeden.',
  'Masz w sobie więcej siły, niż ci się wydaje.',
  'Trudne chwile to dowód, że organizm się zmienia.',
  'Każdy dzień bez dymu to inwestycja – w zdrowie i w portfel.',
  'Nie walczysz z papierosem. Odzyskujesz wolność.',
  'Za tydzień podziękujesz sobie za dzisiejszy wysiłek.',
  'Nawyk to tylko ścieżka w mózgu. Właśnie wydeptujesz nową.',
];

const TIPS = [
  'Wypij duszkiem szklankę zimnej wody.',
  'Zrób 15 przysiadów albo 10 pompek.',
  'Umyj zęby – miętowy smak skutecznie zniechęca do dymu.',
  'Wyjdź na 5-minutowy spacer, najlepiej w nowe miejsce.',
  'Napisz albo zadzwoń do kogoś bliskiego.',
  'Żuj gumę bez cukru, marchewkę albo pestki słonecznika.',
  'Zajmij czymś ręce: długopis, gniotek, telefon w drugiej dłoni.',
  'Policz w myślach wstecz od 100, odejmując po 7.',
  'Opłucz twarz zimną wodą.',
  'Wstań i przejdź do innego pomieszczenia.',
  'Pomyśl, na co wydasz zaoszczędzone pieniądze.',
  'Włącz ulubioną piosenkę i przeczekaj ją do końca.',
  'Zrób 10 powolnych, głębokich oddechów przez nos.',
];

const REASON_PRESETS = ['Zdrowie', 'Rodzina', 'Pieniądze', 'Kondycja i sport', 'Smak i węch', 'Wolność od nałogu', 'Cera i zęby', 'Przykład dla dzieci'];
const TRIGGERS = ['Stres', 'Kawa', 'Alkohol', 'Po jedzeniu', 'Nuda', 'Towarzystwo', 'Praca', 'Rano', 'Inne'];

/* ---------- Pomocnicze ---------- */

const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const pick = arr => arr.length ? arr[Math.floor(Math.random() * arr.length)] : null;
const pad = n => String(n).padStart(2, '0');
const clamp01 = x => Math.max(0, Math.min(1, x));

const fmtMoney = new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN' });
const fmtMoney0 = new Intl.NumberFormat('pl-PL', { style: 'currency', currency: 'PLN', maximumFractionDigits: 0 });
const fmtInt = new Intl.NumberFormat('pl-PL', { maximumFractionDigits: 0 });
const fmtDate = new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'long', year: 'numeric', hour: '2-digit', minute: '2-digit' });
const fmtShort = new Intl.DateTimeFormat('pl-PL', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });

function plural(n, one, few, many) {
  n = Math.floor(Math.abs(n));
  if (n === 1) return one;
  const m10 = n % 10, m100 = n % 100;
  return m10 >= 2 && m10 <= 4 && (m100 < 12 || m100 > 14) ? few : many;
}

function splitDur(ms) {
  const s = Math.floor(Math.max(0, ms) / 1000);
  return { d: Math.floor(s / 86400), h: Math.floor((s % 86400) / 3600), m: Math.floor((s % 3600) / 60), s: s % 60 };
}

function humanDur(ms) {
  const { d, h, m } = splitDur(ms);
  if (d >= 1) return `${d} ${plural(d, 'dzień', 'dni', 'dni')}${h && d < 30 ? ` ${h} godz.` : ''}`;
  if (h >= 1) return `${h} godz.${m ? ` ${m} min` : ''}`;
  return `${Math.max(1, m)} min`;
}

function toLocalInput(d) {
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

/* ---------- Stan ---------- */

function normalize(s) {
  return {
    name: '', perDay: 20, packPrice: 20, perPack: 20, reasons: [], goal: null,
    cravings: [], slips: [], badges: [], theme: 'auto', ...s,
  };
}

function load() {
  try {
    const s = JSON.parse(localStorage.getItem(KEY));
    return s && s.quitAt ? normalize(s) : null;
  } catch { return null; }
}

function save() {
  try { localStorage.setItem(KEY, JSON.stringify(state)); }
  catch { toast('Nie udało się zapisać danych na urządzeniu.'); }
}

let state = load();

function stats(now = Date.now()) {
  const quit = new Date(state.quitAt).getTime();
  const elapsed = now - quit;
  const started = elapsed >= 0;
  const ms = Math.max(0, elapsed);
  const slipped = state.slips.filter(x => x.t >= quit).reduce((a, x) => a + x.count, 0);
  const avoided = Math.max(0, (ms / D) * state.perDay - slipped);
  const perCig = state.packPrice / state.perPack;
  return {
    quit, started, ms, untilStart: -elapsed, slipped,
    days: ms / D,
    avoided,
    money: avoided * perCig,
    dailyMoney: state.perDay * perCig,
    lifeMin: avoided * LIFE_MIN_PER_CIG,
    resisted: state.cravings.length,
  };
}

function milestoneIndex(ms) {
  const i = MILESTONES.findIndex(m => m.t > ms);
  return i === -1 ? MILESTONES.length : i;
}

/* ---------- Router ---------- */

const ROUTES = { start: viewStart, zdrowie: viewHealth, sos: viewSos, postepy: viewProgress, ja: viewMe };
let tick = null, cleanup = null;

function currentRoute() {
  const r = location.hash.slice(1);
  return ROUTES[r] ? r : 'start';
}

function render(keepScroll = false) {
  cleanup?.();
  cleanup = tick = null;
  const main = $('#view');
  applyTheme();

  if (!state) {
    document.body.classList.add('onboarding');
    viewOnboarding(main);
    return;
  }
  document.body.classList.remove('onboarding');

  const route = currentRoute();
  $$('.tabbar a').forEach(a => a.classList.toggle('active', a.dataset.route === route));
  const y = window.scrollY;
  ROUTES[route](main);
  window.scrollTo(0, keepScroll ? y : 0);
  tick?.();
  checkBadges();
}

window.addEventListener('hashchange', () => render());

let tickCount = 0;
setInterval(() => {
  tick?.();
  if (state && ++tickCount % 15 === 0) checkBadges();
}, 1000);

document.addEventListener('visibilitychange', () => {
  if (!document.hidden && state) tick?.();
});

/* ---------- Onboarding / dane ---------- */

function profileFields(p) {
  return `
    <label class="field"><span>Jak masz na imię? <small>(opcjonalnie)</small></span>
      <input name="name" maxlength="30" autocomplete="given-name" value="${esc(p.name)}"></label>
    <label class="field"><span>Data i godzina ostatniego papierosa <small>(może być w przyszłości)</small></span>
      <input type="datetime-local" name="quitAt" required value="${toLocalInput(new Date(p.quitAt))}"></label>
    <div class="row3">
      <label class="field"><span>Papierosów dziennie</span>
        <input type="number" name="perDay" min="1" max="100" step="1" inputmode="numeric" required value="${p.perDay}"></label>
      <label class="field"><span>Cena paczki (zł)</span>
        <input type="number" name="packPrice" min="0.5" max="500" step="0.01" inputmode="decimal" required value="${p.packPrice}"></label>
      <label class="field"><span>Sztuk w paczce</span>
        <input type="number" name="perPack" min="1" max="100" step="1" inputmode="numeric" required value="${p.perPack}"></label>
    </div>`;
}

function readProfile(form) {
  const f = new FormData(form);
  const quit = new Date(f.get('quitAt'));
  return {
    name: String(f.get('name') || '').trim(),
    quitAt: isNaN(quit) ? new Date().toISOString() : quit.toISOString(),
    perDay: Math.max(1, Number(f.get('perDay')) || 20),
    packPrice: Math.max(0.5, Number(f.get('packPrice')) || 20),
    perPack: Math.max(1, Number(f.get('perPack')) || 20),
  };
}

function viewOnboarding(main) {
  const p = normalize({ quitAt: new Date().toISOString() });
  main.innerHTML = `
    <section class="welcome">
      <img src="icons/icon.svg" alt="">
      <h1>Oddech</h1>
      <p class="muted">Twój kieszonkowy sprzymierzeniec w rzucaniu palenia. Kilka pytań i startujemy.</p>
    </section>
    <form id="profile" class="card stack">
      ${profileFields(p)}
      <fieldset class="field">
        <legend>Dlaczego rzucasz? <small>(przypomnę ci w trudnej chwili)</small></legend>
        <div class="chips">
          ${REASON_PRESETS.map(r => `<label class="chip"><input type="checkbox" name="reason" value="${esc(r)}"><span>${esc(r)}</span></label>`).join('')}
        </div>
        <input name="customReason" maxlength="80" placeholder="Własny powód, np. „Chcę wbiec na 4. piętro”">
      </fieldset>
      <button class="btn primary big" type="submit">Zaczynamy 🌱</button>
    </form>
    <p class="fineprint">Dane zostają wyłącznie na tym urządzeniu. Aplikacja nie zastępuje porady lekarza.</p>`;

  $('#profile').addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const reasons = f.getAll('reason').map(String);
    const custom = String(f.get('customReason') || '').trim();
    if (custom) reasons.unshift(custom);
    state = normalize({ ...readProfile(e.target), reasons, createdAt: Date.now() });
    save();
    location.hash = '#start';
    render();
    toast('Powodzenia! Jestem przy tobie 💚');
  });
}

/* ---------- Start ---------- */

function quoteOfDay() {
  return QUOTES[Math.floor(Date.now() / D) % QUOTES.length];
}

function phaseTip(s) {
  if (!s.started) return ['Przygotuj się', 'Wyrzuć zapalniczki i popielniczki, powiedz bliskim o swoim planie i zastanów się, co zrobisz w momentach, w których zwykle palisz. Warto też porozmawiać z lekarzem lub farmaceutą o wsparciu (np. NRT, cytyzyna).'];
  if (s.days < 3) return ['Pierwsze dni są najtrudniejsze', 'Nikotyna opuszcza organizm – rozdrażnienie, głód i problemy ze snem są normalne i miną. Pij dużo wody, ogranicz kawę i alkohol, a gdy przyjdzie głód – wciśnij SOS.'];
  if (s.days < 14) return ['Głód fizyczny słabnie', 'Teraz walczysz głównie z nawykami. Zmieniaj rutyny: kawa w innym miejscu, krótki spacer po posiłku, coś do zajęcia rąk.'];
  if (s.days < 90) return ['Uwaga na „tylko jednego”', 'Myśl „jeden nie zaszkodzi” to najczęstsza pułapka. Jeden papieros zwykle prowadzi do kolejnych – nie warto sprawdzać.'];
  return ['Jesteś osobą niepalącą', 'Większa część drogi za tobą. Zachowaj czujność w stresie i przy alkoholu – wtedy nawyk lubi wrócić.'];
}

function installCard() {
  if (isStandalone() || dismissed('install')) return '';
  if (installEvt) {
    return `<div class="card tip-card">
      <h2>📲 Zainstaluj aplikację</h2>
      <p class="small">Dodaj Oddech do ekranu głównego – będzie zawsze pod ręką, także offline.</p>
      <div class="row"><button class="btn primary" data-install>Zainstaluj</button><button class="link-btn" data-dismiss="install">Nie teraz</button></div>
    </div>`;
  }
  if (isIOS()) {
    return `<div class="card tip-card">
      <h2>📲 Dodaj do ekranu głównego</h2>
      <p class="small">W Safari stuknij <b>Udostępnij</b> (kwadrat ze strzałką), a potem <b>Do ekranu początkowego</b>.</p>
      <div class="row"><button class="link-btn" data-dismiss="install">Ukryj</button></div>
    </div>`;
  }
  return '';
}

function statCard(ico, label, valueHtml, hint) {
  return `<div class="card stat"><span class="ico" aria-hidden="true">${ico}</span><span class="label">${label}</span><span class="value">${valueHtml}</span><span class="hint">${hint}</span></div>`;
}

function viewStart(main) {
  const s = stats();
  const mi = milestoneIndex(s.ms);
  const next = MILESTONES[mi];
  const [tipTitle, tipText] = phaseTip(s);
  const goal = state.goal;

  main.innerHTML = `
    <section class="greet">
      <h1>${state.name ? `Cześć, ${esc(state.name)}!` : 'Cześć!'}</h1>
      <p class="muted">${quoteOfDay()}</p>
    </section>

    ${installCard()}

    <section class="card hero">
      <div class="hero-label">${s.started ? 'Nie palisz od' : 'Start za'}</div>
      <div class="hero-days num"><span data-live="days">0</span><small data-live="daysLabel">dni</small></div>
      <div class="hero-clock" data-live="clock">00:00:00</div>
      <div class="hero-sub">${s.started ? 'od' : 'start'} ${fmtDate.format(s.quit)}</div>
    </section>

    <section class="grid2">
      ${statCard('🚭', 'Niewypalone', '<span data-live="avoided">0</span>', 'papierosów')}
      ${statCard('💰', 'Zaoszczędzone', '<span data-live="money">0 zł</span>', `${fmtMoney.format(s.dailyMoney)} dziennie`)}
      ${statCard('⏳', 'Odzyskany czas', '<span data-live="life">0 min</span>', 'życia (szacunkowo)')}
      ${statCard('🛡️', 'Pokonane', String(s.resisted), plural(s.resisted, 'zachcianka', 'zachcianki', 'zachcianek'))}
    </section>

    ${next ? `
    <a class="card" href="#zdrowie">
      <div class="row between"><h2>🫀 Następny krok zdrowia</h2><span class="pill">za <span data-live="msLeft"></span></span></div>
      <strong>${next.title}</strong>
      <p class="small muted">${next.text}</p>
      <div class="bar"><i data-live="msBar"></i></div>
    </a>` : `
    <a class="card" href="#zdrowie"><h2>🏆 Wszystkie kamienie milowe za tobą!</h2><p class="small muted">Twoje ryzyko chorób serca jest jak u osoby niepalącej.</p></a>`}

    ${goal ? `
    <a class="card" href="#ja">
      <div class="row between"><h2>🎯 ${esc(goal.name)}</h2><span class="pill gold">${fmtMoney0.format(goal.price)}</span></div>
      <div class="bar gold"><i data-live="goalBar"></i></div>
      <p class="small muted" data-live="goalText"></p>
    </a>` : `
    <a class="card" href="#ja">
      <h2>🎯 Na co zbierasz?</h2>
      <p class="small muted">Wyznacz nagrodę z zaoszczędzonych pieniędzy – motywuje bardziej, niż myślisz.</p>
    </a>`}

    <section class="card tip-card">
      <h2>💡 ${tipTitle}</h2>
      <p class="small">${tipText}</p>
    </section>

    <section class="card">
      <h2>📈 Jeśli wytrwasz</h2>
      <div class="grid2">
        <div><div class="small muted">za miesiąc</div><strong>${fmtMoney0.format(s.dailyMoney * 30)}</strong></div>
        <div><div class="small muted">za rok</div><strong>${fmtMoney0.format(s.dailyMoney * 365)}</strong></div>
        <div><div class="small muted">papierosów rocznie</div><strong>${fmtInt.format(state.perDay * 365)}</strong></div>
        <div><div class="small muted">czasu życia rocznie</div><strong>~${fmtInt.format(state.perDay * 365 * LIFE_MIN_PER_CIG / 60 / 24)} dni</strong></div>
      </div>
    </section>

    <button class="btn ghost block" id="share">Pochwal się postępem</button>`;

  $('#share').addEventListener('click', shareProgress);
  bindInstall(main);

  const wasStarted = s.started;
  const live = Object.fromEntries($$('[data-live]', main).map(el => [el.dataset.live, el]));
  tick = () => {
    const s = stats();
    if (milestoneIndex(s.ms) !== mi || s.started !== wasStarted) return render(true);
    const { d, h, m, s: sec } = splitDur(s.started ? s.ms : s.untilStart);
    live.days.textContent = fmtInt.format(d);
    live.daysLabel.textContent = plural(d, 'dzień', 'dni', 'dni');
    live.clock.textContent = `${pad(h)}:${pad(m)}:${pad(sec)}`;
    live.avoided.textContent = fmtInt.format(Math.floor(s.avoided));
    live.money.textContent = fmtMoney.format(s.money);
    live.life.textContent = humanDur(s.lifeMin * MIN);
    if (next) {
      const prev = mi > 0 ? MILESTONES[mi - 1].t : 0;
      live.msLeft.textContent = humanDur(next.t - s.ms);
      live.msBar.style.width = `${clamp01((s.ms - prev) / (next.t - prev)) * 100}%`;
    }
    if (goal) {
      const p = clamp01(s.money / goal.price);
      live.goalBar.style.width = `${p * 100}%`;
      live.goalText.textContent = p >= 1
        ? 'Uzbierane! Możesz sobie to sprawić 🎉'
        : `${Math.floor(p * 100)}% · brakuje ${fmtMoney0.format(goal.price - s.money)} (ok. ${humanDur((goal.price - s.money) / s.dailyMoney * D)})`;
    }
  };
}

async function shareProgress() {
  const s = stats();
  const text = s.started
    ? `Już ${humanDur(s.ms)} bez papierosa 🚭 ${fmtInt.format(Math.floor(s.avoided))} niewypalonych i ${fmtMoney0.format(s.money)} w kieszeni!`
    : `Rzucam palenie ${fmtDate.format(s.quit)}. Trzymaj kciuki! 🚭`;
  try {
    if (navigator.share) await navigator.share({ title: 'Oddech', text });
    else { await navigator.clipboard.writeText(text); toast('Skopiowano do schowka'); }
  } catch { /* anulowano */ }
}

/* ---------- Zdrowie ---------- */

function viewHealth(main) {
  main.innerHTML = `
    <section class="greet">
      <h1>Zdrowie</h1>
      <p class="muted">Tak organizm regeneruje się po ostatnim papierosie. Czasy są orientacyjne i u każdego trochę inne.</p>
    </section>
    <ol class="timeline">
      ${MILESTONES.map((m, i) => `
        <li class="tl-item" data-i="${i}">
          <div class="tl-dot"></div>
          <div class="card">
            <div class="row between"><span class="tl-when">${m.when}</span><span class="pill" data-pill></span></div>
            <strong>${m.title}</strong>
            <p class="small muted">${m.text}</p>
            <div class="bar"><i data-bar></i></div>
          </div>
        </li>`).join('')}
    </ol>
    <p class="fineprint">Na podstawie materiałów m.in. NHS, WHO i CDC. To informacje ogólne, nie porada medyczna.</p>`;

  const items = $$('.tl-item', main);
  tick = () => {
    const { ms } = stats();
    const cur = milestoneIndex(ms);
    items.forEach((li, i) => {
      const m = MILESTONES[i];
      const done = ms >= m.t;
      li.classList.toggle('done', done);
      li.classList.toggle('current', i === cur);
      const pill = $('[data-pill]', li);
      pill.textContent = done ? 'osiągnięte' : `za ${humanDur(m.t - ms)}`;
      pill.classList.toggle('done', done);
      $('[data-bar]', li).style.width = `${clamp01(ms / m.t) * 100}%`;
    });
  };
}

/* ---------- SOS ---------- */

function viewSos(main) {
  const reason = pick(state.reasons);
  main.innerHTML = `
    <section class="sos-head">
      <h1>Spokojnie. To minie.</h1>
      <p class="muted">Głód nikotynowy zwykle słabnie po 3–5 minutach. Oddychaj razem z kołem.</p>
    </section>
    <div class="breath" aria-hidden="true">
      <div class="breath-ring"></div>
      <div class="breath-circle" id="circle"></div>
      <div class="breath-label"><span id="phase">Gotowość</span><small id="phaseSec"></small></div>
    </div>
    <div class="sos-timer">
      <strong id="timer">3:00</strong>
      <div class="bar"><i id="timerBar"></i></div>
    </div>
    ${reason ? `<div class="card reason-card"><small>Pamiętasz, dlaczego to robisz?</small><strong>${esc(reason)}</strong></div>` : ''}
    <div class="card">
      <small class="muted">Zrób to teraz:</small>
      <div class="tip-row"><p id="tip">${pick(TIPS)}</p><button class="icon-btn" id="nextTip" aria-label="Inny pomysł" title="Inny pomysł">↻</button></div>
    </div>
    <div class="sos-actions">
      <button class="btn primary big" id="won">Głód minął 💪</button>
      <button class="btn ghost" id="slip">Zdarzyła się wpadka</button>
    </div>`;

  let tip = $('#tip').textContent;
  $('#nextTip').addEventListener('click', () => {
    let t; do { t = pick(TIPS); } while (t === tip);
    $('#tip').textContent = tip = t;
  });
  $('#won').addEventListener('click', () => cravingDialog(true));
  $('#slip').addEventListener('click', slipDialog);

  // Oddech 4–4–6: wdech, zatrzymanie, wolny wydech
  const PHASES = [['Wdech', 4, 1], ['Zatrzymaj', 4, 1], ['Wydech', 6, 0.55]];
  const circle = $('#circle'), label = $('#phase'), secEl = $('#phaseSec');
  let pi = 0, phaseEnd = 0, timeout;
  const step = () => {
    const [name, sec, scale] = PHASES[pi];
    label.textContent = name;
    circle.style.transitionDuration = `${sec}s`;
    circle.style.transform = `scale(${scale})`;
    phaseEnd = Date.now() + sec * 1000;
    pi = (pi + 1) % PHASES.length;
    timeout = setTimeout(step, sec * 1000);
  };
  timeout = setTimeout(step, 600);

  const start = Date.now();
  const timerEl = $('#timer'), barEl = $('#timerBar');
  const secTimer = setInterval(() => {
    secEl.textContent = phaseEnd ? Math.max(1, Math.ceil((phaseEnd - Date.now()) / 1000)) : '';
  }, 200);
  let finished = false;
  tick = () => {
    if (finished) return;
    const left = Math.max(0, SOS_DURATION - (Date.now() - start));
    const secs = Math.ceil(left / 1000);
    timerEl.textContent = `${Math.floor(secs / 60)}:${pad(secs % 60)}`;
    barEl.style.width = `${(1 - left / SOS_DURATION) * 100}%`;
    if (!left) {
      finished = true;
      timerEl.textContent = 'Udało się przetrwać 3 minuty!';
      navigator.vibrate?.(200);
    }
  };
  cleanup = () => { clearTimeout(timeout); clearInterval(secTimer); };
}

function cravingDialog(fromSos) {
  openDialog(`
    <form class="dlg" id="cf">
      <div class="big-emoji">💪</div>
      <h2>${fromSos ? 'Brawo! Zachcianka pokonana' : 'Zapisz zachciankę'}</h2>
      <p class="small muted">Zapisywanie pomaga wychwycić, co najczęściej wywołuje głód.</p>
      <fieldset class="field"><legend>Jak silna była?</legend>
        <div class="seg">${[1, 2, 3, 4, 5].map(n => `<label><input type="radio" name="int" value="${n}" ${n === 3 ? 'checked' : ''}><span>${n}</span></label>`).join('')}</div>
        <div class="row between tiny muted"><span>słaba</span><span>bardzo silna</span></div>
      </fieldset>
      <fieldset class="field"><legend>Co ją wywołało?</legend>
        <div class="chips">${TRIGGERS.map(t => `<label class="chip"><input type="radio" name="trig" value="${t}"><span>${t}</span></label>`).join('')}</div>
      </fieldset>
      <div class="dlg-actions">
        <button type="button" class="btn ghost" data-close>Anuluj</button>
        <button class="btn primary">Zapisz</button>
      </div>
    </form>`, d => {
    $('#cf', d).addEventListener('submit', e => {
      e.preventDefault();
      const f = new FormData(e.target);
      state.cravings.push({ t: Date.now(), intensity: Number(f.get('int')) || 3, trigger: String(f.get('trig') || 'Inne') });
      save();
      d.close();
      toast(pick(['Brawo! Kolejna wygrana 💪', 'Tak trzymać! 🌱', 'Jesteś coraz bliżej celu 💚']));
      if (fromSos) location.hash = '#start';
      render(!fromSos);
    });
  });
}

function slipDialog() {
  openDialog(`
    <form class="dlg" id="sf">
      <div class="big-emoji">🫂</div>
      <h2>Wpadka to nie porażka</h2>
      <p class="small">Większość osób, które rzuciły na dobre, miała po drodze potknięcia. Liczy się to, co zrobisz teraz – nie musisz zaczynać od zera.</p>
      <label class="field"><span>Ile papierosów?</span>
        <input type="number" name="count" min="1" max="100" value="1" inputmode="numeric" required></label>
      <div class="dlg-actions">
        <button class="btn primary" value="keep">Zapisz i działam dalej</button>
        <button class="btn ghost" value="reset">Licz od nowa od teraz</button>
      </div>
      <button type="button" class="link-btn" data-close>Anuluj</button>
    </form>`, d => {
    $('#sf', d).addEventListener('submit', e => {
      e.preventDefault();
      const count = Math.max(1, Math.round(Number(new FormData(e.target).get('count')) || 1));
      state.slips.push({ t: Date.now(), count });
      if (e.submitter?.value === 'reset') state.quitAt = new Date().toISOString();
      save();
      d.close();
      toast('Zapisane. Wracamy do gry 💚');
      location.hash = '#start';
      render();
    });
  });
}

/* ---------- Postępy ---------- */

function viewProgress(main) {
  const s = stats();
  const earned = new Set(state.badges);
  const cravings = [...state.cravings].sort((a, b) => b.t - a.t);
  const byTrigger = TRIGGERS.map(t => [t, cravings.filter(c => c.trigger === t).length]).filter(([, n]) => n).sort((a, b) => b[1] - a[1]);
  const maxT = byTrigger[0]?.[1] || 1;
  const avg = cravings.length ? cravings.reduce((a, c) => a + c.intensity, 0) / cravings.length : 0;
  const slipsSince = state.slips.filter(x => x.t >= s.quit);

  main.innerHTML = `
    <section class="greet">
      <h1>Postępy</h1>
      <p class="muted">Odznaki: ${earned.size} z ${BADGES.length}</p>
    </section>

    <section class="badges">
      ${BADGES.map(b => `
        <div class="badge ${earned.has(b.id) ? 'earned' : 'locked'}">
          <span class="b-ico" aria-hidden="true">${b.icon}</span>
          <span class="b-name">${b.name}</span>
          <span class="b-desc">${b.desc}</span>
        </div>`).join('')}
    </section>

    <h3 class="section-title">Zachcianki</h3>
    <section class="card">
      <div class="grid2">
        <div><div class="small muted">pokonane</div><strong style="font-size:1.4rem">${cravings.length}</strong></div>
        <div><div class="small muted">średnia siła</div><strong style="font-size:1.4rem">${avg ? avg.toFixed(1) : '–'}<span class="small muted"> / 5</span></strong></div>
      </div>
      ${byTrigger.length ? `
        <h2 style="margin-top:8px">Najczęstsze wyzwalacze</h2>
        ${byTrigger.map(([t, n]) => `<div class="hbar"><span>${t}</span><div class="bar"><i style="width:${n / maxT * 100}%"></i></div><b>${n}</b></div>`).join('')}
        <p class="small muted">Wiedząc, co cię kusi, możesz zaplanować zamiennik – np. spacer zamiast papierosa do kawy.</p>`
      : '<p class="small muted">Gdy pokonasz zachciankę w trybie SOS, zapisz ją – tu zobaczysz, co najczęściej wywołuje głód.</p>'}
      <button class="btn block" id="addCraving">+ Zapisz zachciankę</button>
    </section>

    ${cravings.length ? `
    <section class="card">
      <h2>Ostatnie wpisy</h2>
      <ul class="list">
        ${cravings.slice(0, 15).map(c => `
          <li><span class="grow"><b>${esc(c.trigger)}</b> <span class="small muted">· siła ${c.intensity}/5</span><br><span class="tiny muted">${fmtShort.format(c.t)}</span></span>
          <button class="x-btn" data-del="${c.t}" aria-label="Usuń wpis">×</button></li>`).join('')}
      </ul>
    </section>` : ''}

    ${slipsSince.length ? `
    <section class="card">
      <h2>🫂 Wpadki od startu: ${slipsSince.reduce((a, x) => a + x.count, 0)}</h2>
      <p class="small muted">Są odliczone od niewypalonych papierosów. Każda kolejna godzina bez dymu nadal się liczy.</p>
    </section>` : ''}`;

  $('#addCraving').addEventListener('click', () => cravingDialog(false));
  $$('[data-del]', main).forEach(b => b.addEventListener('click', () => {
    state.cravings = state.cravings.filter(c => c.t !== Number(b.dataset.del));
    save();
    render(true);
  }));
}

/* ---------- Ja ---------- */

function viewMe(main) {
  const g = state.goal;
  main.innerHTML = `
    <section class="greet"><h1>${state.name ? esc(state.name) : 'Ja'}</h1></section>

    <section class="card">
      <h2>💚 Moje powody</h2>
      ${state.reasons.length ? `<ul class="list">${state.reasons.map((r, i) => `<li><span class="grow">${esc(r)}</span><button class="x-btn" data-rm="${i}" aria-label="Usuń powód">×</button></li>`).join('')}</ul>`
        : '<p class="small muted">Dodaj powody – pokażę je, gdy wciśniesz SOS.</p>'}
      <form id="reasonForm" class="row">
        <input name="r" maxlength="80" placeholder="Np. „Chcę grać w piłkę z synem”" aria-label="Nowy powód">
        <button class="btn primary">Dodaj</button>
      </form>
    </section>

    <section class="card">
      <h2>🎯 Cel oszczędzania</h2>
      <form id="goalForm" class="stack">
        <div class="row">
          <input name="name" maxlength="40" placeholder="Np. nowe słuchawki" value="${esc(g?.name)}" aria-label="Na co zbierasz" style="flex:2">
          <input name="price" type="number" min="1" step="1" inputmode="numeric" placeholder="Kwota zł" value="${g?.price ?? ''}" aria-label="Kwota w zł" style="flex:1">
        </div>
        <div class="row"><button class="btn primary">Zapisz cel</button>${g ? '<button type="button" class="link-btn" id="goalRm">Usuń cel</button>' : ''}</div>
      </form>
    </section>

    <section class="card">
      <h2>⚙️ Moje dane</h2>
      <form id="profile" class="stack">
        ${profileFields(state)}
        <button class="btn primary">Zapisz zmiany</button>
      </form>
    </section>

    <section class="card">
      <h2>🎨 Wygląd</h2>
      <div class="seg seg3" id="theme">
        ${[['auto', 'Systemowy'], ['light', 'Jasny'], ['dark', 'Ciemny']].map(([v, l]) => `<label><input type="radio" name="theme" value="${v}" ${state.theme === v ? 'checked' : ''}><span>${l}</span></label>`).join('')}
      </div>
    </section>

    <section class="card help">
      <h2>☎️ Profesjonalna pomoc</h2>
      <p class="small">Telefoniczna Poradnia Pomocy Palącym – bezpłatne wsparcie specjalistów:</p>
      <a href="tel:801108108">801 108 108</a>
      <a href="tel:+48222118015">22 211 80 15 <span class="small muted">(z komórki)</span></a>
      <a href="https://jakrzucicpalenie.pl" target="_blank" rel="noopener">jakrzucicpalenie.pl ↗</a>
      <p class="small muted">Leki (np. nikotynowa terapia zastępcza, cytyzyna, wareniklina) wyraźnie zwiększają szanse – zapytaj lekarza lub farmaceutę.</p>
    </section>

    <section class="card">
      <h2>📦 Aplikacja</h2>
      ${installEvt && !isStandalone() ? '<button class="btn primary" data-install>📲 Zainstaluj na urządzeniu</button>' : ''}
      ${isIOS() && !isStandalone() ? '<p class="small muted">iPhone: w Safari stuknij Udostępnij → Do ekranu początkowego.</p>' : ''}
      <div class="row">
        <button class="btn" id="export" style="flex:1">Eksportuj kopię</button>
        <button class="btn" id="import" style="flex:1">Importuj</button>
      </div>
      <input type="file" id="importFile" accept="application/json,.json" hidden>
      <button class="btn ghost danger" id="reset">Usuń wszystkie dane</button>
    </section>
    <p class="fineprint">Oddech · dane zapisane tylko na tym urządzeniu</p>`;

  bindInstall(main);

  $('#reasonForm').addEventListener('submit', e => {
    e.preventDefault();
    const r = String(new FormData(e.target).get('r') || '').trim();
    if (!r) return;
    state.reasons.push(r);
    save();
    render(true);
  });
  $$('[data-rm]', main).forEach(b => b.addEventListener('click', () => {
    state.reasons.splice(Number(b.dataset.rm), 1);
    save();
    render(true);
  }));

  $('#goalForm').addEventListener('submit', e => {
    e.preventDefault();
    const f = new FormData(e.target);
    const name = String(f.get('name') || '').trim(), price = Number(f.get('price'));
    if (!name || !(price > 0)) return toast('Podaj nazwę i kwotę celu');
    state.goal = { name, price };
    save();
    toast('Cel zapisany 🎯');
    render(true);
  });
  $('#goalRm')?.addEventListener('click', () => { state.goal = null; save(); render(true); });

  $('#profile').addEventListener('submit', e => {
    e.preventDefault();
    Object.assign(state, readProfile(e.target));
    save();
    toast('Zapisano');
    render(true);
  });

  $('#theme').addEventListener('change', e => {
    state.theme = e.target.value;
    save();
    applyTheme();
  });

  $('#export').addEventListener('click', () => {
    const blob = new Blob([JSON.stringify(state, null, 2)], { type: 'application/json' });
    const a = Object.assign(document.createElement('a'), { href: URL.createObjectURL(blob), download: `oddech-kopia-${new Date().toISOString().slice(0, 10)}.json` });
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  });
  $('#import').addEventListener('click', () => $('#importFile').click());
  $('#importFile').addEventListener('change', async e => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      const data = JSON.parse(await file.text());
      if (!data.quitAt || isNaN(new Date(data.quitAt))) throw new Error();
      state = normalize(data);
      save();
      toast('Dane zaimportowane');
      render();
    } catch { toast('To nie wygląda na kopię z Oddechu'); }
  });

  $('#reset').addEventListener('click', () => openDialog(`
    <div class="dlg">
      <h2>Usunąć wszystkie dane?</h2>
      <p class="small muted">Licznik, powody, zachcianki i odznaki zostaną skasowane z tego urządzenia. Tego nie da się cofnąć.</p>
      <div class="dlg-actions"><button class="btn ghost" data-close>Anuluj</button><button class="btn sos" id="confirmReset">Usuń</button></div>
    </div>`, d => $('#confirmReset', d).addEventListener('click', () => {
    try { localStorage.removeItem(KEY); } catch { }
    state = null;
    d.close();
    location.hash = '';
    render();
  })));
}

/* ---------- Odznaki, motyw, dialogi, toast ---------- */

function checkBadges() {
  if (!state) return;
  const s = stats();
  const fresh = BADGES.filter(b => !state.badges.includes(b.id) && b.test(s));
  if (!fresh.length) return;
  state.badges.push(...fresh.map(b => b.id));
  save();
  toast(fresh.length === 1
    ? `${fresh[0].icon} Nowa odznaka: ${fresh[0].name}!`
    : `🎉 ${fresh.length} ${plural(fresh.length, 'nowa odznaka', 'nowe odznaki', 'nowych odznak')}!`);
  if (navigator.userActivation?.hasBeenActive) navigator.vibrate?.([60, 40, 60]);
  if (currentRoute() === 'postepy') render(true);
}

function applyTheme() {
  const t = state?.theme || 'auto';
  if (t === 'auto') delete document.documentElement.dataset.theme;
  else document.documentElement.dataset.theme = t;
  const bg = getComputedStyle(document.documentElement).getPropertyValue('--bg').trim();
  $$('meta[name="theme-color"]').forEach(m => {
    m.content = t === 'auto' ? (m.media.includes('dark') ? '#0c1311' : '#f3f6f4') : bg;
  });
}

function openDialog(html, bind) {
  const d = $('#modal');
  d.innerHTML = html;
  $$('[data-close]', d).forEach(b => b.addEventListener('click', () => d.close()));
  bind?.(d);
  d.showModal();
}

$('#modal').addEventListener('click', e => { if (e.target === e.currentTarget) e.currentTarget.close(); });

let toastTimer;
function toast(msg) {
  const t = $('#toast');
  t.textContent = msg;
  t.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => t.classList.remove('show'), 3500);
}

/* ---------- Instalacja PWA ---------- */

let installEvt = null;

const isStandalone = () => matchMedia('(display-mode: standalone)').matches || navigator.standalone === true;
const isIOS = () => /iphone|ipad|ipod/i.test(navigator.userAgent);

function dismissed(key) {
  try { return localStorage.getItem(`oddech:dismiss:${key}`) === '1'; } catch { return false; }
}

function bindInstall(root) {
  $$('[data-install]', root).forEach(b => b.addEventListener('click', async () => {
    if (!installEvt) return;
    installEvt.prompt();
    await installEvt.userChoice.catch(() => null);
    installEvt = null;
    render(true);
  }));
  $$('[data-dismiss]', root).forEach(b => b.addEventListener('click', () => {
    try { localStorage.setItem(`oddech:dismiss:${b.dataset.dismiss}`, '1'); } catch { }
    render(true);
  }));
}

window.addEventListener('beforeinstallprompt', e => {
  e.preventDefault();
  installEvt = e;
  if (state && ['start', 'ja'].includes(currentRoute())) render(true);
});
window.addEventListener('appinstalled', () => { installEvt = null; toast('Zainstalowano! 🎉'); });

if ('serviceWorker' in navigator) {
  window.addEventListener('load', () => navigator.serviceWorker.register('sw.js').catch(() => { }));
}

render();
