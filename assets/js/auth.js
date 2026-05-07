async function handleLogin(event) {
  event.preventDefault();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  const { error } = await DB.client.auth.signInWithPassword({ email, password });
  if (error) return alert(error.message);

  location.href = 'dashboard.html';
}

async function handleRegister(event) {
  event.preventDefault();

  const fullName = document.getElementById('fullName').value.trim();
  const username = document.getElementById('username').value.trim();
  const contact = document.getElementById('contact').value.trim();
  const phone = document.getElementById('phone').value.trim();
  const role = document.getElementById('role').value;
  const validationAnswers = document.getElementById('validationAnswers').value.trim();
  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;
  const avatar = document.getElementById('avatar').files[0];

  const requiredPhoneRoles = ['reportero', 'staff', 'moderador', 'admin'];
  if (requiredPhoneRoles.includes(role) && !phone) {
    return alert('El número de contacto es obligatorio para ese rol.');
  }

  const { data, error } = await DB.client.auth.signUp({ email, password });
  if (error) return alert(error.message);

  let avatarUrl = '';
  if (avatar) {
    try {
      avatarUrl = await DB.uploadImage(window.APP_CONFIG.storageBuckets.profiles, avatar, 'profile');
    } catch (e) {
      alert('No se pudo subir la foto de perfil. Continúo sin ella.');
    }
  }

  const status = role === 'usuario' ? 'activo' : 'pendiente';

  const payload = {
    id: data.user.id,
    full_name: fullName,
    username,
    contact,
    phone: phone || null,
    avatar_url: avatarUrl || null,
    validation_answers: validationAnswers,
    role,
    status
  };

  const insert = await DB.insert('users', payload);
  if (insert.error) return alert(insert.error.message);

  alert(role === 'usuario' ? 'Registro completado.' : 'Registro enviado. Tu rol quedó pendiente de revisión.');
  location.href = 'login.html';
}

async function handleLogout() {
  if (!DB.ready()) {
    localStorage.removeItem('lrd_demo_profile');
    location.href = 'index.html';
    return;
  }
  await DB.client.auth.signOut();
  location.href = 'index.html';
}

function bindAuthButtons() {
  const logoutBtn = document.getElementById('logoutBtn');
  if (logoutBtn) logoutBtn.addEventListener('click', handleLogout);
}
