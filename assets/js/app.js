function pageName() {
  return (document.body.dataset.page || location.pathname.split('/').pop().replace('.html', '') || 'index').toLowerCase();
}

async function loadDemoState() {
  const demoProfile = JSON.parse(localStorage.getItem('lrd_demo_profile') || 'null');
  if (demoProfile) {
    return { session: null, user: null, profile: demoProfile, role: demoProfile.role || 'usuario' };
  }
  return { session: null, user: null, profile: null, role: 'visitante' };
}

async function bootstrap() {
  await DB.init();
  const state = DB.ready() ? await getAppState() : await loadDemoState();
  window.APP_STATE = state;

  const header = document.getElementById('appHeader');
  const footer = document.getElementById('appFooter');
  if (header) header.innerHTML = renderHeader(state.role, state.profile);
  if (footer) footer.innerHTML = renderFooter();

  bindAuthButtons();
  bindPageEvents();
  await initPage(pageName(), state);
}

function bindPageEvents() {
  document.addEventListener('click', async (e) => {
    const btn = e.target.closest('[data-close]');
    if (btn) {
      const id = btn.dataset.close;
      document.getElementById(id)?.classList.remove('open');
    }
  });
}

async function initPage(page, state) {
  if (page === 'index') return initIndex(state);
  if (page === 'login') return initLogin();
  if (page === 'register') return initRegister();
  if (page === 'dashboard') return initDashboard(state);
  if (page === 'noticias') return initNoticias(state);
  if (page === 'publicaciones') return initPublicaciones(state);
  if (page === 'foro') return initForo(state);
  if (page === 'anuncios') return initAnuncios(state);
  if (page === 'perfil') return initPerfil(state);
  if (page === 'admin') return initAdmin(state);
  if (page === 'mod') return initMod(state);
  if (page === 'staff') return initStaff(state);
}

function useSampleOr(rows, sampleKey) {
  return rows && rows.length ? rows : (window.SAMPLE_DATA[sampleKey] || []);
}

function initIndex(state) {
  const newsEl = document.getElementById('featuredNews');
  const postsEl = document.getElementById('featuredPosts');
  const adsEl = document.getElementById('featuredAds');

  const news = (window.SAMPLE_DATA.news || []).slice(0, 2);
  const posts = (window.SAMPLE_DATA.posts || []).slice(0, 2);
  const ads = (window.SAMPLE_DATA.announcements || []).slice(0, 2);

  if (newsEl) newsEl.innerHTML = news.map(n => card({
    title: n.title,
    text: n.content,
    meta: `${n.author} · ${n.date}`,
    image: n.image,
    tags: n.tags
  })).join('');

  if (postsEl) postsEl.innerHTML = posts.map(p => card({
    title: `${p.type.toUpperCase()} · ${p.title}`,
    text: p.content,
    meta: `${p.author} · ${p.date} · ${p.status}`,
    image: p.image,
    tags: p.tags,
    badge: 'Comunidad'
  })).join('');

  if (adsEl) adsEl.innerHTML = ads.map(a => card({
    title: a.title,
    text: a.content,
    meta: `${a.author} · ${a.date}`,
    badge: 'Oficial'
  })).join('');
}

function initLogin() {
  const form = document.getElementById('loginForm');
  form?.addEventListener('submit', handleLogin);
}

function initRegister() {
  const form = document.getElementById('registerForm');
  form?.addEventListener('submit', handleRegister);
}

async function initDashboard(state) {
  const role = state.role || 'visitante';
  document.getElementById('dashboardStats').innerHTML = [
    statBox('Rol', role, 'Permisos según perfil'),
    statBox('Noticias', '2+', 'Ejemplos precargados'),
    statBox('Moderación', 'Activa', 'Con cola previa'),
    statBox('Logs', 'Sí', 'Registro de acciones')
  ].join('');

  document.getElementById('dashboardContent').innerHTML = `
    <div class="grid two">
      <section class="panel">
        <h2>Acceso disponible</h2>
        <div class="tag-row">
          ${(window.APP_CONFIG.roles || []).map(r => `<span class="tag">${escapeText(r)}</span>`).join('')}
        </div>
        <p class="muted">Los roles especiales quedan pendientes hasta revisión.</p>
      </section>
      <section class="panel">
        <h2>Flujo del sistema</h2>
        <ol class="steps">
          <li>Usuario publica o reporta.</li>
          <li>Contenido de imagen entra en cola.</li>
          <li>Staff o moderador revisa.</li>
          <li>Se guarda log con razón y fecha.</li>
        </ol>
      </section>
    </div>
  `;
}

async function initNoticias(state) {
  const list = document.getElementById('newsList');
  const search = document.getElementById('newsSearch');
  const filter = document.getElementById('newsFilter');
  const formWrap = document.getElementById('newsFormWrap');

  const all = DB.ready() ? await DB.list('news') : window.SAMPLE_DATA.news;
  const rows = all.filter(x => (x.status || 'aprobado') !== 'rechazado');

  const canCreate = ['reportero', 'staff', 'moderador', 'admin'].includes(state.role);
  if (formWrap) {
    formWrap.innerHTML = canCreate ? renderNewsForm() : '';
    const form = document.getElementById('newsForm');
    form?.addEventListener('submit', handleNewsSubmit);
  }

  function render() {
    const q = (search?.value || '').toLowerCase();
    const f = filter?.value || 'todas';
    const filtered = rows.filter(n => {
      const matchText = [n.title, n.content, n.author, (n.tag_list || []).join(' ')].join(' ').toLowerCase().includes(q);
      const matchCat = f === 'todas' ? true : ((n.category || '').toLowerCase() === f.toLowerCase());
      return matchText && matchCat && ((n.status || 'aprobado') === 'aprobado' || canCreate);
    });
    list.innerHTML = filtered.length ? filtered.map(n => card({
      title: n.title,
      text: n.content,
      meta: `${n.author || 'Sin autor'} · ${fmtDate(n.created_at || n.date)} · ${n.category || 'General'}`,
      image: n.image_url || n.image || '',
      tags: n.tag_list || n.tags || [],
      badge: n.status || 'aprobado'
    })).join('') : emptyState('Sin noticias', 'No hay noticias que coincidan con tu búsqueda.');
  }
  search?.addEventListener('input', render);
  filter?.addEventListener('change', render);
  render();
}

function renderNewsForm() {
  return `
    <form class="form panel" id="newsForm">
      <h2>Crear noticia</h2>
      ${formField('Título', '<input id="newsTitle" required maxlength="120">')}
      ${formField('Contenido', '<textarea id="newsContent" rows="4" required></textarea>')}
      ${formField('Categoría', '<input id="newsCategory" placeholder="Académico, Deportes...">')}
      ${formField('Etiquetas', '<input id="newsTags" placeholder="colegio, evento, aviso">')}
      ${formField('Imagen', '<input id="newsImage" type="file" accept="image/*">', 'Se sube a Supabase Storage.')}
      <button class="btn btn-green" type="submit">Publicar noticia</button>
    </form>
  `;
}

async function handleNewsSubmit(event) {
  event.preventDefault();
  const title = document.getElementById('newsTitle').value.trim();
  const content = document.getElementById('newsContent').value.trim();
  const category = document.getElementById('newsCategory').value.trim() || 'General';
  const tag_list = cleanTags(document.getElementById('newsTags').value);
  const file = document.getElementById('newsImage').files[0];
  const state = window.APP_STATE;
  const profile = state.profile;
  if (!profile) return alert('Debes tener sesión.');

  let image_url = '';
  if (file && DB.ready()) {
    image_url = await DB.uploadImage(window.APP_CONFIG.storageBuckets.news, file, 'news');
  }

  const payload = {
    title,
    content,
    category,
    tag_list,
    image_url,
    author_id: profile.id,
    author: profile.full_name || profile.username,
    status: ['reportero', 'staff', 'moderador', 'admin'].includes(profile.role) ? 'aprobado' : 'pendiente'
  };

  const { error } = await DB.insert('news', payload);
  if (error) return alert(error.message);
  alert('Noticia guardada.');
  location.reload();
}

async function initPublicaciones(state) {
  const list = document.getElementById('postList');
  const queue = document.getElementById('approvalQueue');
  const formWrap = document.getElementById('postFormWrap');

  const approved = DB.ready() ? await DB.list('posts', q => q.eq('status', 'aprobado').eq('section', 'publicaciones')) : window.SAMPLE_DATA.posts.filter(p => p.status === 'aprobado');
  const pending = DB.ready() ? await DB.list('pending_approvals', q => q.eq('target_type', 'post')) : [];

  if (formWrap) formWrap.innerHTML = state.user ? renderPostForm() : `<div class="panel">Inicia sesión para publicar imágenes y texto corto.</div>`;
  document.getElementById('postForm')?.addEventListener('submit', handlePostSubmit);

  if (queue) {
    queue.innerHTML = ['staff','moderador','admin'].includes(state.role)
      ? (pending.length ? pending.map(item => card({
          title: `Pendiente: ${item.target_id || item.id}`,
          text: item.reason || 'Revisión pendiente',
          meta: `${item.status || 'pendiente'} · ${fmtDate(item.created_at)}`
        })).join('') : emptyState('Sin pendientes', 'La cola está vacía.'))
      : '';
  }

  function render() {
    list.innerHTML = approved.length ? approved.map(p => postCard(p, state.role)).join('') : emptyState('Sin publicaciones', 'No hay publicaciones aprobadas aún.');
    bindPostActions();
  }
  render();
}

function renderPostForm() {
  return `
    <form class="form panel" id="postForm">
      <h2>Nueva publicación</h2>
      ${formField('Texto corto', '<textarea id="postContent" rows="4" required maxlength="300"></textarea>')}
      ${formField('Imagen', '<input id="postImage" type="file" accept="image/*" required>')}
      <button class="btn btn-green" type="submit">Enviar a moderación</button>
    </form>
  `;
}

function postCard(post, role) {
  const isForum = post.section === 'foro';
  const canInteract = role !== 'visitante';
  return `
    <article class="card">
      ${post.image_url ? `<div class="card-image"><img src="${post.image_url}" alt=""></div>` : ''}
      <div class="card-body">
        <div class="card-topline">
          <h3>${escapeText(post.title || post.type || 'Publicación')}</h3>
          <span class="badge">${escapeText(post.status || 'aprobado')}</span>
        </div>
        <p class="meta">${escapeText(post.author || 'Anónimo')} · ${fmtDate(post.created_at || post.date)}</p>
        <p>${escapeText(post.content || '')}</p>
        <div class="tag-row">${(post.tag_list || post.tags || []).map(t => `<span class="tag">${escapeText(t)}</span>`).join('')}</div>
        <div class="card-actions">
          ${canInteract ? `<button class="btn btn-dark" data-like="${post.id}">❤️ ${post.likes_count || post.likes || 0}</button>` : ''}
          ${canInteract ? `<button class="btn btn-dark" data-save="${post.id}">🔖 Guardar</button>` : ''}
          ${canInteract ? `<button class="btn btn-dark" data-report="${post.id}">🚩 Reportar</button>` : ''}
          ${role !== 'visitante' && isForum ? `<button class="btn btn-green" data-comment="${post.id}">💬 Comentar</button>` : ''}
        </div>
      </div>
    </article>
  `;
}

async function handlePostSubmit(event) {
  event.preventDefault();
  const state = window.APP_STATE;
  const profile = state.profile;
  if (!profile) return alert('Debes iniciar sesión.');

  const content = document.getElementById('postContent').value.trim();
  const file = document.getElementById('postImage').files[0];
  let image_url = '';
  if (file && DB.ready()) {
    image_url = await DB.uploadImage(window.APP_CONFIG.storageBuckets.posts, file, 'post');
  }

  const row = {
    section: 'publicaciones',
    title: 'Publicación',
    content,
    image_url,
    author_id: profile.id,
    author: profile.full_name || profile.username,
    status: 'pendiente',
    tag_list: []
  };

  const inserted = await DB.insert('posts', row);
  if (inserted.error) return alert(inserted.error.message);

  if (DB.ready()) {
    await DB.insert('pending_approvals', {
      target_type: 'post',
      target_id: inserted.data.id,
      requested_by: profile.id,
      status: 'pendiente',
      reason: 'Publicación con imagen enviada a revisión'
    });
    await DB.insert('images', {
      owner_id: profile.id,
      bucket: window.APP_CONFIG.storageBuckets.posts,
      path: image_url,
      alt_text: 'Imagen de publicación'
    });
  }

  alert('Enviado a moderación.');
  location.reload();
}

function bindPostActions() {
  document.querySelectorAll('[data-like]').forEach(btn => btn.addEventListener('click', async () => {
    const postId = btn.dataset.like;
    const state = window.APP_STATE;
    if (!state.user && !state.profile) return alert('Inicia sesión.');
    if (DB.ready() && state.profile) {
      await DB.insert('likes', { post_id: postId, user_id: state.profile.id });
      await DB.insert('moderation_logs', {
        actor_id: state.profile.id,
        action: 'like',
        target_type: 'post',
        target_id: postId,
        reason: 'Interacción de usuario'
      }).catch(()=>{});
    }
    alert('Like registrado.');
  }));

  document.querySelectorAll('[data-save]').forEach(btn => btn.addEventListener('click', async () => {
    const postId = btn.dataset.save;
    const state = window.APP_STATE;
    if (!state.profile) return alert('Inicia sesión.');
    if (DB.ready()) await DB.insert('saves', { post_id: postId, user_id: state.profile.id });
    alert('Guardado.');
  }));

  document.querySelectorAll('[data-report]').forEach(btn => btn.addEventListener('click', async () => {
    const postId = btn.dataset.report;
    const reason = prompt('Motivo del reporte:');
    if (!reason) return;
    const state = window.APP_STATE;
    if (DB.ready() && state.profile) {
      await DB.insert('reports', {
        target_type: 'post',
        target_id: postId,
        reporter_id: state.profile.id,
        reason,
        status: 'abierto'
      });
    }
    alert('Reporte enviado.');
  }));

  document.querySelectorAll('[data-comment]').forEach(btn => btn.addEventListener('click', async () => {
    const postId = btn.dataset.comment;
    const text = prompt('Comentario:');
    if (!text) return;
    const state = window.APP_STATE;
    if (DB.ready() && state.profile) {
      await DB.insert('comments', {
        post_id: postId,
        author_id: state.profile.id,
        author: state.profile.full_name || state.profile.username,
        content: text,
        kind: 'comment'
      });
    }
    alert('Comentario publicado.');
  }));
}

async function initForo(state) {
  const list = document.getElementById('forumList');
  const search = document.getElementById('forumSearch');
  const formWrap = document.getElementById('forumFormWrap');
  const commentsWrap = document.getElementById('forumComments');

  const rows = DB.ready() ? await DB.list('posts', q => q.eq('section', 'foro').eq('status', 'aprobado')) : window.SAMPLE_DATA.posts;
  if (formWrap) formWrap.innerHTML = state.profile ? renderForumForm() : `<div class="panel">Inicia sesión para participar en el foro.</div>`;
  document.getElementById('forumForm')?.addEventListener('submit', handleForumSubmit);

  function render() {
    const q = (search?.value || '').toLowerCase();
    const filtered = rows.filter(p => {
      return [p.title, p.content, p.author, (p.tag_list || []).join(' ')].join(' ').toLowerCase().includes(q);
    });
    list.innerHTML = filtered.length ? filtered.map(p => postCard(p, state.role)).join('') : emptyState('Sin publicaciones en foro', 'Prueba otra búsqueda.');
    bindPostActions();
    renderForumComments(filtered);
  }
  search?.addEventListener('input', render);
  render();
}

function renderForumForm() {
  return `
    <form class="form panel" id="forumForm">
      <h2>Crear publicación de foro</h2>
      ${formField('Tipo', `
        <select id="forumType">
          <option value="pregunta">Pregunta</option>
          <option value="opinion">Opinión</option>
          <option value="mensaje">Mensaje</option>
        </select>
      `)}
      ${formField('Título', '<input id="forumTitle" required maxlength="120">')}
      ${formField('Contenido', '<textarea id="forumContent" rows="4" required></textarea>')}
      ${formField('Etiquetas', '<input id="forumTags" placeholder="tema, ayuda, debate">')}
      <button class="btn btn-green" type="submit">Publicar en foro</button>
    </form>
  `;
}

async function handleForumSubmit(event) {
  event.preventDefault();
  const state = window.APP_STATE;
  const profile = state.profile;
  if (!profile) return alert('Debes iniciar sesión.');

  const payload = {
    section: 'foro',
    type: document.getElementById('forumType').value,
    title: document.getElementById('forumTitle').value.trim(),
    content: document.getElementById('forumContent').value.trim(),
    tag_list: cleanTags(document.getElementById('forumTags').value),
    author_id: profile.id,
    author: profile.full_name || profile.username,
    status: 'aprobado',
    likes_count: 0
  };

  const result = await DB.insert('posts', payload);
  if (result.error) return alert(result.error.message);
  alert('Publicación del foro creada.');
  location.reload();
}

function renderForumComments(posts) {
  const el = document.getElementById('forumComments');
  if (!el) return;
  const comments = window.SAMPLE_DATA.comments || [];
  el.innerHTML = posts.map(p => {
    const related = comments.filter(c => c.post_id === p.id);
    return `
      <section class="panel">
        <h3>Comentarios · ${escapeText(p.title || p.id)}</h3>
        ${related.length ? related.map(c => `<div class="comment"><strong>${escapeText(c.author)}</strong><p>${escapeText(c.content)}</p><small>${escapeText(c.date)}</small></div>`).join('') : '<p class="muted">Sin comentarios.</p>'}
      </section>
    `;
  }).join('');
}

async function initAnuncios(state) {
  const list = document.getElementById('announcementList');
  const formWrap = document.getElementById('announcementFormWrap');
  const items = DB.ready() ? await DB.list('announcements') : window.SAMPLE_DATA.announcements;

  const canCreate = ['staff','moderador','admin'].includes(state.role);
  if (formWrap) formWrap.innerHTML = canCreate ? renderAnnouncementForm() : '';
  document.getElementById('announcementForm')?.addEventListener('submit', handleAnnouncementSubmit);

  list.innerHTML = items.length ? items.map(a => card({
    title: a.title,
    text: a.content,
    meta: `${a.author} · ${fmtDate(a.created_at || a.date)}`,
    badge: a.status || 'publico'
  })).join('') : emptyState('Sin anuncios', 'Todavía no hay anuncios oficiales.');
}

function renderAnnouncementForm() {
  return `
    <form class="form panel" id="announcementForm">
      <h2>Crear anuncio oficial</h2>
      ${formField('Título', '<input id="announcementTitle" required>')}
      ${formField('Contenido', '<textarea id="announcementContent" rows="4" required></textarea>')}
      <button class="btn btn-green" type="submit">Publicar anuncio</button>
    </form>
  `;
}

async function handleAnnouncementSubmit(event) {
  event.preventDefault();
  const state = window.APP_STATE;
  const profile = state.profile;
  if (!profile) return alert('Debes iniciar sesión.');
  const result = await DB.insert('announcements', {
    title: document.getElementById('announcementTitle').value.trim(),
    content: document.getElementById('announcementContent').value.trim(),
    author_id: profile.id,
    author: profile.full_name || profile.username,
    status: 'publico'
  });
  if (result.error) return alert(result.error.message);
  alert('Anuncio publicado.');
  location.reload();
}

async function initPerfil(state) {
  const profile = state.profile;
  const box = document.getElementById('profileBox');
  if (!profile) {
    box.innerHTML = emptyState('Sin sesión', 'Inicia sesión para ver tu perfil.');
    return;
  }

  box.innerHTML = `
    <section class="panel profile-card">
      <div class="profile-head">
        ${profile.avatar_url ? `<img src="${profile.avatar_url}" alt="">` : `<div class="avatar-fallback">${escapeText((profile.full_name || 'U')[0])}</div>`}
        <div>
          <h2>${escapeText(profile.full_name || '')}</h2>
          <p>@${escapeText(profile.username || '')}</p>
          <span class="badge">${escapeText(profile.role || 'usuario')}</span>
        </div>
      </div>
      <div class="grid two">
        <div><strong>Contacto</strong><p>${escapeText(profile.contact || '')}</p></div>
        <div><strong>Estado</strong><p>${escapeText(profile.status || 'activo')}</p></div>
      </div>
    </section>
  `;
}

async function initAdmin(state) {
  const usersEl = document.getElementById('adminUsers');
  const logsEl = document.getElementById('adminLogs');
  const users = DB.ready() ? await DB.list('users') : window.SAMPLE_DATA.users;
  const logs = DB.ready() ? await DB.list('moderation_logs') : window.SAMPLE_DATA.logs;

  usersEl.innerHTML = users.length ? `
    <table class="table">
      <thead><tr><th>Nombre</th><th>Usuario</th><th>Rol</th><th>Estado</th></tr></thead>
      <tbody>${users.map(u => `<tr><td>${escapeText(u.full_name)}</td><td>@${escapeText(u.username)}</td><td>${escapeText(u.role)}</td><td>${escapeText(u.status)}</td></tr>`).join('')}</tbody>
    </table>` : emptyState('Sin usuarios', 'No hay datos.');

  logsEl.innerHTML = logs.length ? `
    <table class="table">
      <thead><tr><th>Acción</th><th>Actor</th><th>Objetivo</th><th>Razón</th><th>Fecha</th></tr></thead>
      <tbody>${logs.map(l => `<tr><td>${escapeText(l.action)}</td><td>${escapeText(l.actor_id || l.actor || '')}</td><td>${escapeText(l.target_id || l.target || '')}</td><td>${escapeText(l.reason || '')}</td><td>${escapeText(fmtDate(l.created_at || l.date))}</td></tr>`).join('')}</tbody>
    </table>` : emptyState('Sin logs', 'No hay acciones registradas.');
}

async function initMod(state) {
  const queueEl = document.getElementById('modQueue');
  const appealsEl = document.getElementById('modAppeals');
  const reportsEl = document.getElementById('modReports');

  const queue = DB.ready() ? await DB.list('pending_approvals') : [];
  queueEl.innerHTML = queue.length ? queue.map(item => card({
    title: `${item.target_type} · ${item.target_id}`,
    text: item.reason || '',
    meta: `${item.status} · ${fmtDate(item.created_at)}`
  })).join('') : emptyState('Sin cola', 'No hay contenido pendiente.');

  appealsEl.innerHTML = (window.SAMPLE_DATA.appeals || []).map(a => card({
    title: `Apelación ${a.id}`,
    text: a.reason,
    meta: `${a.author} · ${a.status} · ${a.date}`
  })).join('');

  reportsEl.innerHTML = (window.SAMPLE_DATA.reports || []).map(r => card({
    title: `Reporte ${r.id}`,
    text: r.reason,
    meta: `${r.author} · ${r.status} · ${r.date}`
  })).join('');
}

async function initStaff(state) {
  const queueEl = document.getElementById('staffQueue');
  const strikesEl = document.getElementById('staffStrikes');
  const queue = DB.ready() ? await DB.list('pending_approvals') : [];
  queueEl.innerHTML = queue.length ? queue.map(item => card({
    title: `${item.target_type} · ${item.target_id}`,
    text: item.reason || '',
    meta: `${item.status} · ${fmtDate(item.created_at)}`
  })).join('') : emptyState('Sin pendientes', 'No hay contenido para revisar.');

  strikesEl.innerHTML = (window.SAMPLE_DATA.strikes || []).map(s => card({
    title: `Strike a ${s.user}`,
    text: s.reason,
    meta: `Cantidad: ${s.count} · ${s.date}`,
    badge: 'Sanción'
  })).join('');
}

document.addEventListener('DOMContentLoaded', bootstrap);
