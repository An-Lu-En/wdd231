/* script.js — Directory behaviors */
fetch("data/members.json")
  .then(response => {
    if (!response.ok) {
      throw new Error("Network response was not ok");
    }
    return response.json();
  })
  .then(data => displayMembers(data))
  .catch(error => {
    document.querySelector("#members").innerHTML = 
      "Sorry — could not load members data.";
    console.error("Error loading JSON:", error);
  });

const DATA_URL = 'data/members.json';

document.addEventListener('DOMContentLoaded', () => {
  const directory = document.getElementById('directory');
  const gridBtn = document.getElementById('gridBtn');
  const listBtn = document.getElementById('listBtn');
  const membershipFilter = document.getElementById('membershipFilter');
  const menuToggle = document.getElementById('menuToggle');
  const mainNav = document.getElementById('mainNav');

  let members = [];

  // Navigation toggle for small screens
  menuToggle.addEventListener('click', () => {
    const expanded = menuToggle.getAttribute('aria-expanded') === 'true';
    menuToggle.setAttribute('aria-expanded', String(!expanded));
    if (mainNav.style.display === 'block') {
      mainNav.style.display = '';
    } else {
      mainNav.style.display = 'block';
    }
  });

  // View toggles
  gridBtn.addEventListener('click', () => {
    setView('grid');
    gridBtn.setAttribute('aria-pressed', 'true');
    listBtn.setAttribute('aria-pressed', 'false');
  });
  listBtn.addEventListener('click', () => {
    setView('list');
    listBtn.setAttribute('aria-pressed', 'true');
    gridBtn.setAttribute('aria-pressed', 'false');
  });

  membershipFilter.addEventListener('change', () => {
    renderMembers(members);
  });

  function setView(view){
    if (view === 'list') {
      directory.classList.remove('grid');
      directory.classList.add('list');
    } else {
      directory.classList.remove('list');
      directory.classList.add('grid');
    }
  }

  // Fetch members.json using async/await
  async function loadMembers() {
    try {
      const res = await fetch(DATA_URL);
      if (!res.ok) throw new Error(`Could not load ${DATA_URL}: ${res.status}`);
      members = await res.json();
      renderMembers(members);
    } catch (err) {
      console.error(err);
      directory.innerHTML = `<p role="alert">Sorry — could not load members data.</p>`;
    }
  }

  function membershipLabel(level) {
    switch(Number(level)){
      case 3: return 'Gold';
      case 2: return 'Silver';
      default: return 'Member';
    }
  }

  function renderMembers(data) {
    const filter = membershipFilter.value;
    const filtered = (filter === 'all') ? data : data.filter(d => String(d.membershipLevel) === filter);

    if (!filtered.length) {
      directory.innerHTML = `<p>No members to show.</p>`;
      return;
    }

    directory.innerHTML = ''; // clear

    filtered.forEach(member => {
      const card = document.createElement('article');
      card.className = 'member-card';
      card.innerHTML = `
        <div class="thumb" aria-hidden="true">
          <img src="${member.image}" alt="${member.name} logo" onerror="this.onerror=null;this.src='https://via.placeholder.com/160x160?text=No+Image'">
        </div>
        <div class="member-info">
          <h3>${member.name}</h3>
          <div class="meta">${member.address} • <a href="tel:${member.phone.replace(/\s+/g,'')}">${member.phone}</a></div>
          <p>${member.description || ''}</p>
          <div class="member-actions">
            <a class="control-btn" href="${member.website}" target="_blank" rel="noopener">Visit website</a>
            <span class="badge level-${member.membershipLevel}">${membershipLabel(member.membershipLevel)}</span>
            <small class="meta" style="margin-left:auto">Since: ${member.membershipSince || '—'}</small>
          </div>
        </div>
      `;

      directory.appendChild(card);
    });
  }

  // Set last modified & copyright
  const lastModifiedEl = document.getElementById('lastModified');
  const copyYearEl = document.getElementById('copyYear');
  if (lastModifiedEl) {
    // Use document.lastModified if the server provides it.
    const lastMod = document.lastModified ? new Date(document.lastModified) : null;
    lastModifiedEl.textContent = lastMod ? lastMod.toLocaleString() : 'Unknown';
  }
  if (copyYearEl) {
    copyYearEl.textContent = new Date().getFullYear();
  }

  // initial view and load
  setView('grid');
  gridBtn.setAttribute('aria-pressed','true');
  loadMembers();
});