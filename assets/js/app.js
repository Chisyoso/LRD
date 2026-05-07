function pageClass() {
  return location.pathname.split('/').pop().replace('.html', '');
}

function ensureDemoUser() {
  if (!UI.getStoredUser() && pageClass() !== 'login') {
    UI.setStoredUser({
      id: 'demo',
      name: 'Usuario Demo',
      username: 'usuario_demo',
      email: 'demo@colegio.com',
      role: 'usuario',
      status: 'activo',
      avatar: 'https://picsum.photos/seed/demo/200/200'
    });
  }
}

function initDashboard() {
  const user = UI.getStoredUser();
  const role = user?.role || 'visitante';
  document.getElementById('dashboard-stats').innerHTML = [
    UI.stat('Contenido público', '124', 'Visible para visitantes'),
    UI.stat('Publicaciones en cola', '18', 'Moderación previa activa'),
    UI.stat('Reportes abiertos', '6', 'Sin favoritismos'),
    UI.stat('Logs guardados', '1.2k', 'Acciones auditables')
  ].join('');

  const access = {
    visitante: ['Solo lectura'],
    usuario: ['Publicar', 'Comentar', 'Like', 'Guardar', 'Reportar'],
    reportero: ['Crear noticias', 'Publicar contenido especial'],
    staff: ['Revisar', 'Rechazar con motivo', 'Aplicar strikes'],
    moderador: ['Supervisar', 'Ver logs', 'Gestionar apelaciones'],
    admin: ['Acceso total']
  };

  document.getElementById('dashboard-access').innerHTML = `
    <div class="panel">
      <h3>Sesión actual</h3>
      <p class="small">Rol detectado: <strong>${UI.escapeHtml(role)}</strong></p>
      <p>Este prototipo deja separadas las funciones por perfil para conectar luego la lógica real con Supabase RLS.</p>
      <div>${(access[role] || access.visitante).map(x => `<span class="tag">${UI.escapeHtml(x)}</span>`).join('')}</div>
    </div>`;
}

function initNews() {
  const data = SAMPLE_DATA.news;
  const root = document.getElementById('news-list');
  const search = document.getElementById('news-search');
  const filter = document.getElementById('news-filter');

  function render() {
    const q = search.value.toLowerCase();
    const f = filter.value;
    root.innerHTML = data.filter(n =>
      (!f || f === 'all' || n.category === f) &&
      (n.title.toLowerCase().includes(q) || n.content.toLowerCase().includes(q) || n.tags.some(t => t.includes(q)))
    ).map(n => UI.card({
      title: n.title,
      text: n.content,
      meta: `${n.author} · ${n.date} · ${n.category}`,
      image: n.image,
      tags: n.tags
    })).join('');
  }
  search?.addEventListener('input', render);
  filter?.addEventListener('change', render);
  render();
}

function initPosts() {
  const root = document.getElementById('post-list');
  const queue = document.getElementById('moderation-queue');
  root.innerHTML = SAMPLE_DATA.posts.map(p => UI.card({
    title: p.type.toUpperCase(),
    text: p.text,
    meta: `${p.author} · ${p.date} · Estado: ${p.status}`,
    image: p.image,
    tags: p.tags,
    footerActions: `
      <button class="btn ghost">❤️ ${p.likes}</button>
      <button class="btn ghost">🔖 ${p.saves}</button>
      <button class="btn danger">Reportar</button>
    `
  })).join('');
  queue.innerHTML = SAMPLE_DATA.moderationQueue.map(q => `
    <div class="row">
      <div class="row-main">
        <strong>${UI.escapeHtml(q.author)}</strong>
        <div class="small">${UI.escapeHtml(q.reason)}</div>
        <div class="small">${UI.escapeHtml(q.submitted)} · ${UI.escapeHtml(q.status)}</div>
      </div>
      <div class="row-actions">
        <button class="btn primary">Aprobar</button>
        <button class="btn danger">Rechazar con motivo</button>
      </div>
    </div>
  `).join('');
}

function initForum() {
  const root = document.getElementById('forum-list');
  root.innerHTML = SAMPLE_DATA.posts.map(p => `
    <article class="card">
      <div class="row" style="padding:0;border:0;background:transparent">
        <div class="row-main">
          <span class="badge ${p.status === 'publico' ? 'ok' : 'wait'}">${UI.escapeHtml(p.status)}</span>
          <h3 class="card-title">${UI.escapeHtml(p.type)}</h3>
          <p>${UI.escapeHtml(p.text)}</p>
          <div class="small">${UI.escapeHtml(p.author)} · ${UI.escapeHtml(p.date)}</div>
          <div>${p.tags.map(t => `<span class="tag">${UI.escapeHtml(t)}</span>`).join('')}</div>
        </div>
        <div class="row-actions">
          <button class="btn ghost">👍 ${p.likes}</button>
          <button class="btn ghost">💾 ${p.saves}</button>
        </div>
      </div>
      <div class="panel" style="margin-top:1rem">
        <strong>Comentarios</strong>
        <p class="small">Aquí iría el listado real conectado a la tabla comments.</p>
      </div>
    </article>
  `).join('');
}

function initAnnouncements() {
  const user = UI.getStoredUser();
  const role = user?.role || 'visitante';
  document.getElementById('announcements-list').innerHTML = SAMPLE_DATA.announcements.map(a => `
    <div class="card">
      <span class="badge ${a.priority === 'alta' ? 'warn' : 'ok'}">Oficial</span>
      <h3 class="card-title">${UI.escapeHtml(a.title)}</h3>
      <p>${UI.escapeHtml(a.text)}</p>
      <div class="small">${UI.escapeHtml(a.author)} · ${UI.escapeHtml(a.date)}</div>
    </div>
  `).join('');
  const adminBox = document.getElementById('announcements-admin');
  if (adminBox) adminBox.classList.toggle('hidden', !['staff','moderador','admin'].includes(role));
}

function initAdminPanels() {
  const role = UI.getStoredUser()?.role || 'visitante';
  const allowed = ['staff','moderador','admin'];
  document.querySelectorAll('[data-role-panel]').forEach(el => {
    el.classList.toggle('hidden', !allowed.includes(role) && el.dataset.rolePanel !== role);
  });
  document.getElementById('logs-list').innerHTML = SAMPLE_DATA.logs.map(l => `
    <tr>
      <td>${UI.escapeHtml(l.actor)}</td>
      <td>${UI.escapeHtml(l.action)}</td>
      <td>${UI.escapeHtml(l.target)}</td>
      <td>${UI.escapeHtml(l.reason)}</td>
      <td>${UI.escapeHtml(l.date)}</td>
    </tr>
  `).join('');
}

function initProfile() {
  const user = UI.getStoredUser() || {
    name: 'Invitado',
    username: 'sin_usuario',
    role: 'visitante',
    email: '—',
    avatar: 'https://picsum.photos/seed/profile/200/200'
  };
  document.getElementById('profile-card').innerHTML = `
    <div class="profile-top">
      <img class="avatar" src="${UI.escapeHtml(user.avatar)}" alt="perfil">
      <div>
        <h2 style="margin:0">${UI.escapeHtml(user.name)}</h2>
        <div class="small">@${UI.escapeHtml(user.username)} · ${UI.escapeHtml(user.role)}</div>
        <div class="small">${UI.escapeHtml(user.email)}</div>
      </div>
    </div>
    <p style="margin-top:1rem">Perfil base preparado para Supabase Auth, edición de datos y avatar en Storage.</p>
  `;
}

function initRegister() {
  const role = document.getElementById('role-request');
  const phone = document.getElementById('phone');
  const status = document.getElementById('role-status');
  function update() {
    const special = ['reportero', 'staff', 'moderador', 'admin'].includes(role.value);
    phone.required = special;
    status.textContent = special ? 'pendiente' : 'activo';
  }
  role?.addEventListener('change', update);
  update();
}

function initLogin() {
  const form = document.getElementById('login-form');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = form.email.value;
    const password = form.password.value;
    try {
      await Auth.loginWithPassword(email, password);
      await Auth.syncLocalProfile();
      location.href = 'dashboard.html';
    } catch (err) {
      alert(err.message || 'No se pudo iniciar sesión');
    }
  });
}

function initRegisterForm() {
  const form = document.getElementById('register-form');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const data = Object.fromEntries(new FormData(form).entries());
    const metadata = {
      name: data.name,
      username: data.username,
      role: data.role_request,
      status: ['reportero','staff','moderador','admin'].includes(data.role_request) ? 'pendiente' : 'activo',
      avatar: data.avatar || 'https://picsum.photos/seed/newuser/200/200'
    };
    try {
      await Auth.registerWithPassword({
        email: data.contact,
        password: data.password,
        metadata
      });
      alert('Registro enviado. Revisa tu correo y la validación de rol si aplica.');
      location.href = 'login.html';
    } catch (err) {
      alert(err.message || 'Error al registrar');
    }
  });
}

function initPage() {
  ensureDemoUser();
  UI.renderShell();
  UI.bindGlobalUI();

  const page = pageClass();
  if (page === 'dashboard') initDashboard();
  if (page === 'noticias') initNews();
  if (page === 'publicaciones') initPosts();
  if (page === 'foro') initForum();
  if (page === 'anuncios') initAnnouncements();
  if (page === 'perfil') initProfile();
  if (page === 'register') initRegister();
  if (page === 'login') initLogin();
  if (page === 'register') initRegisterForm();
  if (['admin','mod','staff'].includes(page)) initAdminPanels();
}

document.addEventListener('DOMContentLoaded', initPage);
