function getCurrentPage() {
  const file = location.pathname.split('/').pop() || 'index.html';
  return file;
}

function getStoredUser() {
  try {
    return JSON.parse(localStorage.getItem('cg_user') || 'null');
  } catch {
    return null;
  }
}

function setStoredUser(user) {
  localStorage.setItem('cg_user', JSON.stringify(user));
}

function escapeHtml(str = '') {
  return String(str)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function navbar(active = getCurrentPage()) {
  const user = getStoredUser();
  const role = user?.role || 'visitante';

  const link = (href, label) => `
    <a href="${href}" class="${active === href.split('/').pop() ? 'active' : ''}">${label}</a>`;

  const privateLinks = role !== 'visitante' ? `
    ${link('dashboard.html', 'Dashboard')}
    ${link('perfil.html', 'Perfil')}
  ` : '';

  const adminLinks = ['staff', 'moderador', 'admin'].includes(role) ? `
    ${link('staff.html', 'Staff')}
    ${link('mod.html', 'Moderación')}
    ${link('admin.html', 'Admin')}
  ` : '';

  return `
    <header class="site-header">
      <div class="navbar">
        <a class="brand" href="index.html">
          <span class="brand-badge">V</span>
          <span>
            <div>${APP_CONFIG.siteName}</div>
            <div class="small">Red social escolar moderada</div>
          </span>
        </a>

        <nav class="nav-links">
          ${link('noticias.html', 'Noticias')}
          ${link('publicaciones.html', 'Publicaciones')}
          ${link('foro.html', 'Foro')}
          ${link('anuncios.html', 'Anuncios')}
          ${privateLinks}
          ${adminLinks}
        </nav>

        <div class="header-actions">
          <span class="pill">Rol: ${escapeHtml(role)}</span>
          ${user ? `
            <div class="dropdown" id="userMenu">
              <button class="btn ghost" data-toggle="dropdown">${escapeHtml(user.name || user.username || 'Mi cuenta')}</button>
              <div class="dropdown-menu">
                <a href="perfil.html">Ver perfil</a>
                <button data-logout>Salir</button>
              </div>
            </div>
          ` : `
            <a class="btn ghost" href="login.html">Entrar</a>
            <a class="btn primary" href="register.html">Registro</a>
          `}
        </div>
      </div>
    </header>`;
}

function footer() {
  return `
    <footer class="footer">
      <div class="container">
        <div class="notice">
          Base lista para conectar con Supabase Auth, Storage, RLS y paneles por rol.
        </div>
        <p style="margin-top:1rem">© ${new Date().getFullYear()} ${APP_CONFIG.siteName}. Proyecto base escolar con estética verde y negro.</p>
      </div>
    </footer>`;
}

function card({ title, text, meta, image, tags = [], footerActions = '' }) {
  const tagHtml = tags.map(t => `<span class="tag">${escapeHtml(t)}</span>`).join('');
  return `
    <article class="card">
      ${image ? `<img class="cover" src="${escapeHtml(image)}" alt="${escapeHtml(title)}">` : ''}
      <h3 class="card-title">${escapeHtml(title)}</h3>
      ${meta ? `<div class="card-meta">${escapeHtml(meta)}</div>` : ''}
      <p>${escapeHtml(text)}</p>
      ${tagHtml ? `<div>${tagHtml}</div>` : ''}
      ${footerActions ? `<div class="row-actions" style="margin-top:.9rem">${footerActions}</div>` : ''}
    </article>`;
}

function stat(title, value, desc = '') {
  return `<div class="stat"><div class="small">${escapeHtml(title)}</div><div class="num">${escapeHtml(value)}</div><div class="small">${escapeHtml(desc)}</div></div>`;
}

function modal(id, title, body, actions = '') {
  return `
    <div class="modal-backdrop" id="${id}">
      <div class="modal-card">
        <div class="section-head">
          <h3>${escapeHtml(title)}</h3>
          <button class="btn ghost" data-close-modal="${id}">Cerrar</button>
        </div>
        <div>${body}</div>
        ${actions ? `<div class="form-actions" style="margin-top:1rem">${actions}</div>` : ''}
      </div>
    </div>`;
}

function renderShell() {
  const shell = document.querySelector('[data-shell]');
  if (shell) shell.innerHTML = navbar() + `<main>${shell.innerHTML}</main>` + footer();
}

function bindGlobalUI() {
  document.addEventListener('click', (e) => {
    const toggle = e.target.closest('[data-toggle="dropdown"]');
    if (toggle) {
      const dd = toggle.closest('.dropdown');
      document.querySelectorAll('.dropdown.open').forEach(el => { if (el !== dd) el.classList.remove('open'); });
      dd.classList.toggle('open');
      return;
    }
    if (!e.target.closest('.dropdown')) document.querySelectorAll('.dropdown.open').forEach(el => el.classList.remove('open'));

    const logout = e.target.closest('[data-logout]');
    if (logout) {
      localStorage.removeItem('cg_user');
      location.href = 'index.html';
      return;
    }

    const close = e.target.closest('[data-close-modal]');
    if (close) document.getElementById(close.dataset.closeModal)?.classList.remove('open');
  });
}

function openModal(id) { document.getElementById(id)?.classList.add('open'); }
function closeModal(id) { document.getElementById(id)?.classList.remove('open'); }

window.UI = { escapeHtml, card, stat, modal, openModal, closeModal, renderShell, bindGlobalUI, getStoredUser, setStoredUser };
