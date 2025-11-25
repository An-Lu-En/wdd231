const membersJsonPath = 'data/members.json';

document.addEventListener('DOMContentLoaded', () => {
  initMenuToggle();
  setFooterDates();
  loadMembersAndRender();
  setupViewControls();
  initWeather();

});
function initMenuToggle() {
  const toggle = document.getElementById('menuToggle');
  const nav = document.getElementById('mainNav');
  if (!toggle || !nav) return;

  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    // simple show/hide
    if (!expanded) {
      openMenu();
    } else {
      nav.style.display = '';
    }
  });
}


function setFooterDates() {
  const lastModifiedEl = document.getElementById('lastModified');
  const copyYearEl = document.getElementById('copyYear');

  if (lastModifiedEl) {
    
    const lm = document.lastModified ? new Date(document.lastModified) : new Date();
    lastModifiedEl.textContent = lm.toLocaleString();
  }
  if (copyYearEl) {
    copyYearEl.textContent = new Date().getFullYear();
  }
}


async function loadMembersAndRender() {
  try {
    const resp = await fetch(membersJsonPath);
    if (!resp.ok) throw new Error(`Failed to fetch ${membersJsonPath}: ${resp.statusText}`);
    const members = await resp.json();

    
    window.__chamberMembers = members;

    renderDirectory(members);
    renderSpotlightsIfNeeded(members);
  } catch (err) {
    console.error('Error loading members JSON:', err);
    const dir = document.getElementById('directory');
    if (dir) dir.innerHTML = `<p>Sorry — could not load members data. See console for details.</p>`;
  }
}


function buildMemberCard(member) {
  const wrapper = document.createElement('article');
  wrapper.className = 'member-card';
  wrapper.setAttribute('data-membership', String(member.membershipLevel || 1));

  
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


function renderDirectory(members, membershipFilter = 'all') {
  const directory = document.getElementById('directory');
  if (!directory) return;

  
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


function setupViewControls() {
  const gridBtn = document.getElementById('gridBtn');
  const listBtn = document.getElementById('listBtn');
  const membershipSelect = document.getElementById('membershipFilter');
  const directory = document.getElementById('directory');

  if (!directory) return;

  
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


function renderSpotlightsIfNeeded(allMembers) {
  const container = document.getElementById('spotlight-container');
  if (!container) return; 

  
  const pool = allMembers.filter(m => Number(m.membershipLevel) >= 2);
  if (!pool.length) {
    container.innerHTML = '<p>No spotlight members found.</p>';
    return;
  }

  
  const shuffled = pool.sort(() => Math.random() - 0.5);
  const count = Math.min(3, Math.max(2, Math.floor(Math.random() * 3) + 2)); // choose 2 or 3
  const chosen = shuffled.slice(0, count);

  
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

async function initWeather() {
  const tempEl = document.getElementById('current-temp');
  const descEl = document.getElementById('weather-desc');
  const forecastEl = document.getElementById('forecast');

  if (!tempEl && !descEl && !forecastEl) return;

  const API_KEY = 'eb0f5b31eb5c61a2616b6f14dc935404';

  if (!API_KEY) {
    tempEl.textContent = 'No OpenWeather API key found';
    return;
  }

  navigator.geolocation.getCurrentPosition(async (position) => {
    const lat = position.coords.latitude;
    const lon = position.coords.longitude;

    try {
      // ---- CURRENT WEATHER ----
      const currentUrl =
        `https://api.openweathermap.org/data/2.5/weather?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;

      const currentRes = await fetch(currentUrl);
      const currentData = await currentRes.json();

      if (currentData.cod !== 200) {
        tempEl.textContent = 'Weather unavailable';
        console.error(currentData);
        return;
      }

      tempEl.textContent = `${Math.round(currentData.main.temp)}°C`;
      descEl.textContent = currentData.weather[0].description;


      // ---- FORECAST ----
      const forecastUrl =
        `https://api.openweathermap.org/data/2.5/forecast?lat=${lat}&lon=${lon}&units=metric&appid=${API_KEY}`;

      const forecastRes = await fetch(forecastUrl);
      const forecastData = await forecastRes.json();

      if (forecastData.cod !== "200") {
        forecastEl.textContent = 'Forecast unavailable';
        console.error(forecastData);
        return;
      }

      const daily = {};
      forecastData.list.forEach(item => {
        const date = item.dt_txt.split(" ")[0];
        if (!daily[date]) daily[date] = item;
      });

      const entries = Object.values(daily).slice(1, 4);

      forecastEl.innerHTML = entries.map(day => `
        <div class="forecast-item">
          <strong>${new Date(day.dt_txt).toLocaleDateString()}</strong>
          <div>${Math.round(day.main.temp)}°C</div>
          <div>${day.weather[0].main}</div>
        </div>
      `).join('');

    } catch (err) {
      console.error("Weather fetch error:", err);
      tempEl.textContent = 'Error loading weather';
    }

  }, () => {
    tempEl.textContent = 'Location permission denied';
  });
}