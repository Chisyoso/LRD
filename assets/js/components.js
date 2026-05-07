function navLink(href, label, active) {
  const current = location.pathname.split('/').pop() || 'index.html';
  const isActive = current === href || (!current && href === 'index.html') || (current === '' && href === 'index.html');
  return `<a href="${href}" class="nav-link ${isActive ? 'active' : ''}">${label}</a>`;
}

function renderHeader(role = 'visitante', profile = null) {
  return `
  <header class="topbar">
    <div class="container topbar-inner">
      <a class="brand" href="index.html">
        <span class="brand-mark">L</span>
        <span class="brand-text">
          <strong>${escapeText(window.APP_CONFIG.siteName)}</strong>
          <small>Red escolar moderada</small>
        </span>
      </a>
      <nav class="nav">
        ${navLink('index.html', 'Inicio')}
        ${navLink('noticias.html', 'Noticias')}
        ${navLink('publicaciones.html', 'Publicaciones')}
        ${navLink('foro.html', 'Foro')}
        ${navLink('anuncios.html', 'Anuncios')}
        ${role !== 'visitante' ? navLink('dashboard.html', 'Dashboard') : ''}
        ${role !== 'visitante' ? navLink('perfil.html', 'Perfil') : ''}
        ${['staff','moderador','admin'].includes(role) ? navLink('staff.html', 'Staff') : ''}
        ${['moderador','admin'].includes(role) ? navLink('mod.html', 'Moderación') : ''}
        ${role === 'admin' ? navLink('admin.html', 'Admin') : ''}
      </nav>
      <div class="topbar-actions">
        <span class="role-pill">${escapeText(role)}</span>
        ${profile ? `
          <div class="user-chip">
            ${profile.avatar_url ? `<img src="${profile.avatar_url}" alt="avatar">` : `<span>${escapeText((profile.full_name || 'U')[0])}</span>`}
            <div>
              <strong>${escapeText(profile.full_name || profile.username || 'Usuario')}</strong>
              <small>${escapeText(profile.username || '')}</small>
            </div>
          </div>
          <button class="btn btn-dark" id="logoutBtn">Salir</button>
        ` : `
          <a class="btn btn-dark" href="login.html">Entrar</a>
          <a class="btn btn-green" href="register.html">Registro</a>
        `}
      </div>
    </div>
  </header>`;
}

function renderFooter() {
  return `
  <footer class="footer">
    <div class="container footer-inner">
      <div>
        <strong>${escapeText(window.APP_CONFIG.siteName)}</strong>
        <p>Base escolar en HTML, CSS, JavaScript y Supabase.</p>
      </div>
      <p class="muted">Verde + negro, limpia y lista para crecer.</p>
    </div>
  </footer>`;
}

function sectionHeader(title, text = '', actions = '') {
  return `
    <div class="section-head">
      <div>
        <h1>${escapeText(title)}</h1>
        ${text ? `<p>${escapeText(text)}</p>` : ''}
      </div>
      <div class="section-actions">${actions}</div>
    </div>
  `;
}

function card({ title = '', text = '', meta = '', image = '', tags = [], actions = '', footer = '', badge = '' }) {
  return `
    <article class="card">
      ${image ? `<div class="card-image"><img src="${image}" alt="${escapeText(title)}"></div>` : ''}
      <div class="card-body">
        <div class="card-topline">
          <h3>${escapeText(title)}</h3>
          ${badge ? `<span class="badge">${escapeText(badge)}</span>` : ''}
        </div>
        ${meta ? `<p class="meta">${escapeText(meta)}</p>` : ''}
        ${text ? `<p class="card-text">${escapeText(text)}</p>` : ''}
        ${tags?.length ? `<div class="tag-row">${tags.map(tag => `<span class="tag">${escapeText(tag)}</span>`).join('')}</div>` : ''}
        ${actions ? `<div class="card-actions">${actions}</div>` : ''}
        ${footer ? `<div class="card-footer">${footer}</div>` : ''}
      </div>
    </article>
  `;
}

function statBox(label, value, hint = '') {
  return `
    <div class="stat-box">
      <span>${escapeText(label)}</span>
      <strong>${escapeText(value)}</strong>
      ${hint ? `<small>${escapeText(hint)}</small>` : ''}
    </div>
  `;
}

function emptyState(title, text) {
  return `<div class="empty-state"><h3>${escapeText(title)}</h3><p>${escapeText(text)}</p></div>`;
}

function modal(id, title, content = '') {
  return `
    <div class="modal" id="${id}" aria-hidden="true">
      <div class="modal-backdrop" data-close="${id}"></div>
      <div class="modal-panel">
        <div class="modal-head">
          <h3>${escapeText(title)}</h3>
          <button class="btn btn-dark" data-close="${id}">Cerrar</button>
        </div>
        <div class="modal-content">${content}</div>
      </div>
    </div>
  `;
}

function formField(label, inputHtml, help = '') {
  return `
    <label class="field">
      <span>${escapeText(label)}</span>
      ${inputHtml}
      ${help ? `<small>${escapeText(help)}</small>` : ''}
    </label>
  `;
}
