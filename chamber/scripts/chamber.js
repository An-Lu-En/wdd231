// === Utility: Set footer dates ===
function setFooterDates() {
  // Get footer elements for last modified and copyright year
  const lastModifiedEl = document.getElementById('lastModified');
  const copyYearEl = document.getElementById('copyYear');

  if (lastModifiedEl) {
    // Set last modified date from document metadata
    const lm = document.lastModified ? new Date(document.lastModified) : new Date();
    lastModifiedEl.textContent = lm.toLocaleString();
  }
  if (copyYearEl) {
    // Set copyright year to current year
    copyYearEl.textContent = new Date().getFullYear();
  }
}

// === DOMContentLoaded: Initialize all page logic ===
document.addEventListener('DOMContentLoaded', () => {
  initMenuToggle(); // Hamburger menu logic
  setFooterDates(); // Footer date logic
  loadMembersAndRender(); // Directory & spotlights
  initWeather(); // Weather widget
  setJoinPageTimestamp(); // Join form timestamp
  initMembershipCardAnimation(); // Animate join cards
  initMembershipModals(); // Modal popups for join page
  showThankYouFormData(); // Thank you page data
});

// === Hamburger Menu Logic ===
function initMenuToggle() {
  const toggle = document.getElementById('menuToggle');
  const nav = document.getElementById('mainNav');
  if (!toggle || !nav) return;

  // Toggle menu open/close on click
  toggle.addEventListener('click', () => {
    const expanded = toggle.getAttribute('aria-expanded') === 'true';
    toggle.setAttribute('aria-expanded', String(!expanded));
    // simple show/hide
    if (!expanded) {
      openMenu();
    } else {
      closeMenu();
    }
  });

  // Close menu on resize to desktop
  window.addEventListener('resize', () => {
    if (window.innerWidth > 720) {
      nav.classList.remove('open');
      nav.style.display = '';
      toggle.setAttribute('aria-expanded', 'false');
    }
  });

  // Optional: close menu when clicking outside
  document.addEventListener('click', (e) => {
    if (window.innerWidth <= 720 && nav.classList.contains('open')) {
      if (!nav.contains(e.target) && e.target !== toggle) {
        closeMenu();
      }
    }
  });
}

function openMenu() {
  // Show mobile nav
  const nav = document.getElementById('mainNav');
  const toggle = document.getElementById('menuToggle');
  if (!nav || !toggle) return;
  nav.classList.add('open');
  nav.style.display = 'block';
  toggle.setAttribute('aria-expanded', 'true');
}

function closeMenu() {
  // Hide mobile nav
  const nav = document.getElementById('mainNav');
  const toggle = document.getElementById('menuToggle');
  if (!nav || !toggle) return;
  nav.classList.remove('open');
  nav.style.display = '';
  toggle.setAttribute('aria-expanded', 'false');
}

const membersJsonPath = 'data/members.json';

// === DIRECTORY PAGE SETUP ===
async function loadDirectory() {
  // Loads member data and renders directory page
  const directory = document.getElementById("directory");
  if (!directory) return;

  try {
    const response = await fetch(membersJsonPath);
    const members = await response.json();

    renderDirectory(members);
    setupFilters(members);
  } catch (err) {
    console.error("Error loading members:", err);
    directory.innerHTML = "<p>Could not load directory data.</p>";
  }
}

function displayMembers(members) {
  // Renders member cards for directory
  const directory = document.getElementById("directory");
  directory.innerHTML = ""; // Clear previous

  members.forEach(member => {
    const card = document.createElement("div");
    card.classList.add("member-card");

    card.innerHTML = `
      <img src="${member.image}" alt="${member.name}">
      <h3>${member.name}</h3>
      <p>${member.address}</p>
      <p>${member.phone}</p>
      <a href="${member.website}" target="_blank">Visit Website</a>
    `;

    directory.appendChild(card);
  });
}

function setupFilters(allMembers) {
  // Setup filter and view toggle controls for directory
  const filterSelect = document.getElementById("membershipFilter");
  const gridBtn = document.getElementById("gridBtn");
  const listBtn = document.getElementById("listBtn");
  const directory = document.getElementById("directory");

  // Filter by membership
  filterSelect.addEventListener("change", () => {
    const level = filterSelect.value;
    const filtered =
      level === "all"
        ? allMembers
        : allMembers.filter(m => m.membershipLevel == level);

    renderDirectory(filtered);
  });

  // Toggle grid view
  gridBtn.addEventListener("click", () => {
    directory.classList.add("grid");
    directory.classList.remove("list");
  });

  // Toggle list view
  listBtn.addEventListener("click", () => {
    directory.classList.add("list");
    directory.classList.remove("grid");
  });
}

// Loads and renders member directory and spotlights
async function loadMembersAndRender() {
  // Loads members and renders directory & spotlights
  try {
    const resp = await fetch(membersJsonPath);
    if (!resp.ok) throw new Error(`Failed to fetch ${membersJsonPath}: ${resp.statusText}`);
    const members = await resp.json();

    window.__chamberMembers = members;

    renderDirectory(members);
    renderSpotlightsIfNeeded(members);
    setupFilters(members);
  } catch (err) {
    console.error('Error loading members JSON:', err);
    const dir = document.getElementById('directory');
    if (dir) dir.innerHTML = `<p>Sorry — could not load members data. See console for details.</p>`;
  }
}

// Build a member card for directory
function buildMemberCard(member) {
  // Builds a member card element for directory
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

// Get membership label for card
function membershipLabel(level) {
  // Returns membership label string
  switch (Number(level)) {
    case 3: return 'Gold Member';
    case 2: return 'Silver Member';
    default: return 'Member';
  }
}

// Strip www from URLs for display
function stripHostname(url) {
  // Utility: strips www. from hostname for display
  try {
    const u = new URL(url);
    return u.hostname.replace('www.', '');
  } catch (e) {
    return url;
  }
}

// Render all member cards
function renderDirectory(members, membershipFilter = 'all') {
  // Renders member cards for directory, with optional filter
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
  // Setup grid/list toggle buttons for directory
  const gridBtn = document.getElementById('gridBtn');
  const listBtn = document.getElementById('listBtn');
  const directory = document.getElementById('directory');
  if (!gridBtn || !listBtn || !directory) return;

  gridBtn.addEventListener('click', function() {
    directory.classList.add('grid');
    directory.classList.remove('list');
    gridBtn.setAttribute('aria-pressed', 'true');
    listBtn.setAttribute('aria-pressed', 'false');
  });

  listBtn.addEventListener('click', function() {
    directory.classList.add('list');
    directory.classList.remove('grid');
    listBtn.setAttribute('aria-pressed', 'true');
    gridBtn.setAttribute('aria-pressed', 'false');
  });
}

// Render spotlights for directory page
function renderSpotlightsIfNeeded(allMembers) {
  // Renders spotlight cards for gold/silver members on homepage
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

// === WEATHER WIDGET ===
async function initWeather() {
  // Loads weather and forecast using OpenWeather API
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

      // Group forecast by day, show next 3 days
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

// --- Join & Thank You Page JS ---
function setJoinPageTimestamp() {
  // Sets hidden timestamp field on join form
  const ts = document.getElementById('timestamp');
  if (ts) ts.value = new Date().toISOString();
}

function initMembershipCardAnimation() {
  // Animates membership cards on join page
  const cards = document.querySelectorAll('.card');
  cards.forEach((card, i) => {
    card.style.opacity = 0;
    setTimeout(() => {
      card.style.transition = 'opacity 1s, transform 1s';
      card.style.opacity = 1;
      card.style.transform = 'translateY(0)';
    }, 300 + i * 200);
  });
}

function initMembershipModals() {
  // Handles opening/closing info modals on join page
  document.querySelectorAll('.info-link').forEach(link => {
    link.addEventListener('click', function(e) {
      e.preventDefault();
      const modalId = this.getAttribute('data-modal');
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.style.display = 'block';
        modal.setAttribute('aria-hidden', 'false');
      }
    });
  });
  document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', function() {
      const modalId = this.getAttribute('data-close');
      const modal = document.getElementById(modalId);
      if (modal) {
        modal.style.display = 'none';
        modal.setAttribute('aria-hidden', 'true');
      }
    });
  });
}

function showThankYouFormData() {
  // Populates thank you page with submitted form data
  function getParam(name) {
    const url = new URL(window.location.href);
    return url.searchParams.get(name) || '';
  }
  document.addEventListener('DOMContentLoaded', function() {
    const fields = ['firstName','lastName','email','phone','orgName','timestamp'];
    fields.forEach(f => {
      const el = document.getElementById(f);
      if (el) el.textContent = getParam(f);
    });
  });
}

// === DISCOVER PAGE SETUP ===
// Only import pointsOfInterest if on discover.html
let pointsOfInterest;
if (document.getElementById('discoverGrid')) {
  import('../data/discover.mjs').then(module => {
    pointsOfInterest = module.pointsOfInterest;
    loadDiscoverPage();
  });
}

function loadDiscoverPage() {
  // Loads discover page visitor message and points of interest cards
  const visitorMessage = document.getElementById('visitorMessage');
  if (visitorMessage) {
    // Show message based on last visit (stored in localStorage)
    const lastVisit = localStorage.getItem('chamberLastVisit');
    const now = Date.now();
    let message = '';
    if (!lastVisit) {
      message = 'Welcome! Let us know if you have any questions.';
    } else {
      const days = Math.floor((now - Number(lastVisit)) / (1000 * 60 * 60 * 24));
      if (days < 1) {
        message = 'Back so soon! Awesome!';
      } else if (days === 1) {
        message = 'You last visited 1 day ago.';
      } else {
        message = `You last visited ${days} days ago.`;
      }
    }
    visitorMessage.textContent = message;
    localStorage.setItem('chamberLastVisit', now);
  }

  // Render points of interest cards
  const grid = document.getElementById('discoverGrid');
  if (grid && pointsOfInterest) {
    grid.innerHTML = '';
    pointsOfInterest.forEach((poi, i) => {
      const card = document.createElement('section');
      card.className = 'discover-card';
      card.innerHTML = `
        <h2>${poi.title}</h2>
        <figure><img src="${poi.image}" alt="${poi.title}" loading="lazy"></figure>
        <address>${poi.address}</address>
        <p>${poi.description}</p>
        <button>Learn More</button>
      `;
      grid.appendChild(card);
    });
  }
}

// === DOMContentLoaded: Discover page logic ===
document.addEventListener('DOMContentLoaded', () => {
  initMenuToggle();
  setFooterDates();
  loadMembersAndRender();
  initWeather();
  setJoinPageTimestamp();
  initMembershipCardAnimation();
  initMembershipModals();
  showThankYouFormData();

  if (document.getElementById('discoverGrid')) {
    loadDiscoverPage(); // Only run on discover.html
  }
});
