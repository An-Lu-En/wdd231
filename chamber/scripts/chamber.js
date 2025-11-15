/* script.js — Directory behaviors */
// fetch("data/members.json")
//   .then(response => {
//     if (!response.ok) {
//       throw new Error("Network response was not ok");
//     }
//     return response.json();
//   })
//   .then(data => displayMembers(data))
//   .catch(error => {
//     document.querySelector("#members").innerHTML =
//       "Sorry — could not load members data.";
//     console.error("Error loading JSON:", error);
//   });

// const DATA_URL = 'data/members.json';

// document.addEventListener('DOMContentLoaded', () => {
//   const directory = document.getElementById('directory');
//   const gridBtn = document.getElementById('gridBtn');
//   const listBtn = document.getElementById('listBtn');
//   const membershipFilter = document.getElementById('membershipFilter');
//   const menuToggle = document.getElementById('menuToggle');
//   const mainNav = document.getElementById('mainNav');

//   let members = [];

  // Navigation toggle for small screens
  // menuToggle.addEventListener('click', () => {
  //   const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
  //   menuToggle.setAttribute('aria-expanded', String(!expanded));
  //   if (mainNav.style.display === 'block') {
  //     mainNav.style.display = '';
  //   } else {
  //     mainNav.style.display = 'block';
  //   }
  // });

  // View toggles
  // gridBtn.addEventListener('click', () => {
  //   setView('grid');
  //   gridBtn.setAttribute('aria-pressed', 'true');
  //   listBtn.setAttribute('aria-pressed', 'false');
  // });
  // listBtn.addEventListener('click', () => {
  //   setView('list');
  //   listBtn.setAttribute('aria-pressed', 'true');
  //   gridBtn.setAttribute('aria-pressed', 'false');
  // });

  // membershipFilter.addEventListener('change', () => {
  //   renderMembers(members);
  // });

  // function setView(view){
  //   if (view === 'list') {
  //     directory.classList.remove('grid');
  //     directory.classList.add('list');
  //   } else {
  //     directory.classList.remove('list');
  //     directory.classList.add('grid');
  //   }
  // }

  // Fetch members.json using async/await
  // async function loadMembers() {
  //   try {
  //     const res = await fetch(DATA_URL);
  //     if (!res.ok) throw new Error(`Could not load ${DATA_URL}: ${res.status}`);
  //     members = await res.json();
  //     renderMembers(members);
  //   } catch (err) {
  //     console.error(err);
  //     directory.innerHTML = `<p role="alert">Sorry — could not load members data.</p>`;
  //   }
  // }

  // function membershipLabel(level) {
  //   switch(Number(level)){
  //     case 3: return 'Gold';
  //     case 2: return 'Silver';
  //     default: return 'Member';
  //   }
  // }

  // function renderMembers(data) {
  //   const filter = membershipFilter.value;
  //   const filtered = (filter === 'all') ? data : data.filter(d => String(d.membershipLevel) === filter);

  //   if (!filtered.length) {
  //     directory.innerHTML = `<p>No members to show.</p>`;
  //     return;
  //   }

  //   directory.innerHTML = ''; // clear

  //   filtered.forEach(member => {
  //     const card = document.createElement('article');
  //     card.className = 'member-card';
  //     card.innerHTML = `
  //       <div class="thumb" aria-hidden="true">
  //         <img src="${member.image}" alt="${member.name} logo" onerror="this.onerror=null;this.src='https://via.placeholder.com/160x160?text=No+Image'">
  //       </div>
  //       <div class="member-info">
  //         <h3>${member.name}</h3>
  //         <div class="meta">${member.address} • <a href="tel:${member.phone.replace(/\s+/g,'')}">${member.phone}</a></div>
  //         <p>${member.description || ''}</p>
  //         <div class="member-actions">
  //           <a class="control-btn" href="${member.website}" target="_blank" rel="noopener">Visit website</a>
  //           <span class="badge level-${member.membershipLevel}">${membershipLabel(member.membershipLevel)}</span>
  //           <small class="meta" style="margin-left:auto">Since: ${member.membershipSince || '—'}</small>
  //         </div>
  //       </div>
  //     `;

  //     directory.appendChild(card);
  //   });
  // }

//   // Set last modified & copyright
//   const lastModifiedEl = document.getElementById('lastModified');
//   const copyYearEl = document.getElementById('copyYear');
//   if (lastModifiedEl) {
//     // Use document.lastModified if the server provides it.
//     const lastMod = document.lastModified ? new Date(document.lastModified) : null;
//     lastModifiedEl.textContent = lastMod ? lastMod.toLocaleString() : 'Unknown';
//   }
//   if (copyYearEl) {
//     copyYearEl.textContent = new Date().getFullYear();
//   }

//   // initial view and load
//   setView('grid');
//   gridBtn.setAttribute('aria-pressed','true');
//   loadMembers();
// });

/* chamber.js
   Shared JavaScript for index.html and directory.html
   - loads members from data/members.json
   - toggles grid/list view
   - filters by membership level
   - injects member cards into the directory
   - sets footer last-modified and copyright
   - supports spotlight selection on index.html (random gold/silver)
   - loads weather (OpenWeatherMap) if API key provided
*/

const membersJsonPath = 'data/members.json';

document.addEventListener('DOMContentLoaded', () => {
  initMenuToggle();
  setFooterDates();
  loadMembersAndRender();
  setupViewControls();
  initWeather(); // will quietly fail if you don't set API key
});

/* ---------------------------
   MENU TOGGLE (mobile)
   --------------------------- */
function initMenuToggle() {
  const toggle = document.getElementById('menuToggle');
  const nav = document.getElementById('mainNav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    // simple show/hide
    if (!expanded) {
      nav.style.display = 'block';
    } else {
      nav.style.display = '';
    }
  });
}

/* ---------------------------
   FOOTER DATES
   --------------------------- */
function setFooterDates() {
  const lastModifiedEl = document.getElementById('lastModified');
  const copyYearEl = document.getElementById('copyYear');

  if (lastModifiedEl) {
    // document.lastModified sometimes empty in local file; format it
    const lm = document.lastModified ? new Date(document.lastModified) : new Date();
    lastModifiedEl.textContent = lm.toLocaleString();
  }
  if (copyYearEl) {
    copyYearEl.textContent = new Date().getFullYear();
  }
}

/* ---------------------------
   FETCH MEMBERS AND RENDER
   --------------------------- */
async function loadMembersAndRender() {
  try {
    const resp = await fetch(membersJsonPath);
    if (!resp.ok) throw new Error(`Failed to fetch ${membersJsonPath}: ${resp.statusText}`);
    const members = await resp.json();

    // keep members in memory for filtering / spotlight
    window.__chamberMembers = members;

    renderDirectory(members);
    renderSpotlightsIfNeeded(members);
  } catch (err) {
    console.error('Error loading members JSON:', err);
    const dir = document.getElementById('directory');
    if (dir) dir.innerHTML = `<p>Sorry — could not load members data. See console for details.</p>`;
  }
}

/* Build member card HTML (used for both grid and list) */
function buildMemberCard(member) {
  const wrapper = document.createElement('article');
  wrapper.className = 'member-card';
  wrapper.setAttribute('data-membership', String(member.membershipLevel || 1));

  // image (if present)
  const img = document.createElement('img');
  img.className = 'logo-thumb';
  img.alt = `${member.name} logo`;
  img.loading = 'lazy';
  img.src = member.image || 'images/placeholder.jpg';

  const info = document.createElement('div');
  info.className = 'member-info';

  const h3 = document.createElement('h3');
  h3.textContent = member.name;

  const addr = document.createElement('p');
  addr.textContent = member.address;

  const phone = document.createElement('p');
  phone.innerHTML = `<a href="tel:${member.phone}">${member.phone}</a>`;

  const site = document.createElement('p');
  site.innerHTML = `<a href="${member.website}" target="_blank" rel="noopener">${stripHostname(member.website)}</a>`;

  const desc = document.createElement('p');
  desc.textContent = member.description || '';

  const actions = document.createElement('div');
  actions.className = 'member-actions';
  const visitBtn = document.createElement('a');
  visitBtn.href = member.website;
  visitBtn.target = '_blank';
  visitBtn.rel = 'noopener';
  visitBtn.textContent = 'Visit';

  const levelSpan = document.createElement('span');
  levelSpan.textContent = membershipLabel(member.membershipLevel);
  levelSpan.style.fontSize = '.82rem';
  levelSpan.style.padding = '.25rem .4rem';
  levelSpan.style.borderRadius = '6px';
  levelSpan.style.border = '1px solid rgba(0,0,0,0.06)';
  levelSpan.style.background = '#fff';

  actions.appendChild(visitBtn);
  actions.appendChild(levelSpan);

  info.appendChild(h3);
  info.appendChild(addr);
  info.appendChild(phone);
  info.appendChild(site);
  info.appendChild(desc);
  info.appendChild(actions);

  // composition: image + info
  wrapper.appendChild(img);
  wrapper.appendChild(info);

  return wrapper;
}

function membershipLabel(level) {
  switch (Number(level)) {
    case 3: return 'Gold Member';
    case 2: return 'Silver Member';
    default: return 'Member';
  }
}

function stripHostname(url) {
  try {
    const u = new URL(url);
    return u.hostname.replace('www.', '');
  } catch (e) {
    return url;
  }
}

/* RENDER DIRECTORY with optional membership filter */
function renderDirectory(members, membershipFilter = 'all') {
  const directory = document.getElementById('directory');
  if (!directory) return;

  // clear
  directory.innerHTML = '';

  const filtered = (membershipFilter === 'all')
    ? members
    : members.filter(m => String(m.membershipLevel) === String(membershipFilter));

  if (!filtered.length) {
    const p = document.createElement('p');
    p.textContent = 'No members found for the selected filter.';
    directory.appendChild(p);
    return;
  }

  filtered.forEach(member => {
    const card = buildMemberCard(member);
    directory.appendChild(card);
  });
}

/* ---------------------------
   VIEW CONTROLS (grid/list) + membership filter
   --------------------------- */
function setupViewControls() {
  const gridBtn = document.getElementById('gridBtn');
  const listBtn = document.getElementById('listBtn');
  const membershipSelect = document.getElementById('membershipFilter');
  const directory = document.getElementById('directory');

  if (!directory) return;

  // initial state: grid (directory has .grid by default in HTML)
  const setGrid = () => {
    directory.classList.remove('list');
    directory.classList.add('grid');
    gridBtn && gridBtn.setAttribute('aria-pressed', 'true');
    listBtn && listBtn.setAttribute('aria-pressed', 'false');
  };
  const setList = () => {
    directory.classList.remove('grid');
    directory.classList.add('list');
    gridBtn && gridBtn.setAttribute('aria-pressed', 'false');
    listBtn && listBtn.setAttribute('aria-pressed', 'true');
  };

  if (gridBtn) gridBtn.addEventListener('click', setGrid);
  if (listBtn) listBtn.addEventListener('click', setList);

  if (membershipSelect) {
    membershipSelect.addEventListener('change', (e) => {
      const val = e.target.value;
      const members = window.__chamberMembers || [];
      renderDirectory(members, val);
    });
  }
}

/* ---------------------------
   SPOTLIGHT CARDS for index.html
   - choose 2 or 3 random members that are gold (3) or silver (2)
   --------------------------- */
function renderSpotlightsIfNeeded(allMembers) {
  const container = document.getElementById('spotlight-container');
  if (!container) return; // not on index page

  // pick 2 or 3 random gold/silver members
  const pool = allMembers.filter(m => Number(m.membershipLevel) >= 2);
  if (!pool.length) {
    container.innerHTML = '<p>No spotlight members found.</p>';
    return;
  }

  // shuffle
  const shuffled = pool.sort(() => Math.random() - 0.5);
  const count = Math.min(3, Math.max(2, Math.floor(Math.random() * 3) + 2)); // choose 2 or 3
  const chosen = shuffled.slice(0, count);

  // build cards
  const wrapper = document.createElement('div');
  wrapper.className = 'spotlight-cards';

  chosen.forEach(member => {
    const card = document.createElement('article');
    card.className = 'member-card';

    const img = document.createElement('img');
    img.className = 'logo-thumb';
    img.src = member.image || 'images/placeholder.jpg';
    img.alt = `${member.name} logo`;
    img.loading = 'lazy';

    const info = document.createElement('div');
    info.className = 'member-info';
    info.innerHTML = `
      <h3>${member.name}</h3>
      <p>${member.description || ''}</p>
      <p><a href="${member.website}" target="_blank" rel="noopener">${stripHostname(member.website)}</a></p>
      <p>${member.address} &nbsp; <a href="tel:${member.phone}">${member.phone}</a></p>
      <p><strong>${membershipLabel(member.membershipLevel)}</strong></p>
    `;

    card.appendChild(img);
    card.appendChild(info);
    wrapper.appendChild(card);
  });

  container.appendChild(wrapper);
}

/* ---------------------------
   WEATHER (OpenWeatherMap) - optional
   - To enable: sign up at openweathermap.org and replace API_KEY below.
   - This code uses "One Call" or current + daily endpoints depending on availability.
   --------------------------- */
async function initWeather() {
  const tempEl = document.getElementById('current-temp');
  const descEl = document.getElementById('weather-desc');
  const forecastEl = document.getElementById('forecast');

  if (!tempEl && !descEl && !forecastEl) return; // no weather UI on this page

  // DEFAULTS - change location as required
  const lat = 40.7128; // example coordinates (set to your chamber location)
  const lon = -74.0060;
  const API_KEY = 'YOUR_OPENWEATHERMAP_API_KEY_HERE'; // <<--- replace with your API key

  if (!API_KEY || API_KEY.includes('YOUR_OPENWEATHERMAP')) {
    // show friendly message for students
    if (tempEl) tempEl.textContent = 'Weather not configured. Add OpenWeatherMap API key in scripts/chamber.js';
    return;
  }

  const units = 'metric'; // or 'imperial'
  const url = `https://api.openweathermap.org/data/2.5/onecall?lat=${lat}&lon=${lon}&units=${units}&exclude=minutely,hourly,alerts&appid=${API_KEY}`;

  try {
    const r = await fetch(url);
    if (!r.ok) throw new Error('Weather API error: ' + r.statusText);
    const data = await r.json();

    // current
    if (data.current) {
      const t = Math.round(data.current.temp);
      const desc = (data.current.weather && data.current.weather[0] && data.current.weather[0].description) || '';
      if (tempEl) tempEl.textContent = `Current: ${t}° ${units === 'metric' ? 'C' : 'F'}`;
      if (descEl) descEl.textContent = (desc && desc[0].toUpperCase() + desc.slice(1)) || '';
    }

    // 3-day forecast (daily[1..3])
    if (Array.isArray(data.daily) && forecastEl) {
      const days = data.daily.slice(1, 4); // next 3 days
      forecastEl.innerHTML = '';
      days.forEach((d) => {
        const date = new Date(d.dt * 1000);
        const item = document.createElement('div');
        item.style.marginBottom = '.4rem';
        const hi = Math.round(d.temp.max);
        const lo = Math.round(d.temp.min);
        const description = (d.weather && d.weather[0] && d.weather[0].main) || '';
        item.textContent = `${date.toLocaleDateString(undefined,{weekday:'short'})}: ${hi}° / ${lo}° — ${description}`;
        forecastEl.appendChild(item);
      });
    }

  } catch (err) {
    console.error('Weather fetch error:', err);
    if (tempEl) tempEl.textContent = 'Weather unavailable';
    if (descEl) descEl.textContent = '';
  }
}
