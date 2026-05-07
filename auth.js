async function getSessionUser() {
  try {
    const { data } = await sb.auth.getUser();
    return data?.user || null;
  } catch {
    return null;
  }
}

async function loginWithPassword(email, password) {
  const { data, error } = await sb.auth.signInWithPassword({ email, password });
  if (error) throw error;
  return data.user;
}

async function registerWithPassword({ email, password, metadata }) {
  const { data, error } = await sb.auth.signUp({
    email,
    password,
    options: { data: metadata }
  });
  if (error) throw error;
  return data.user;
}

async function logout() {
  await sb.auth.signOut();
  localStorage.removeItem('cg_user');
}

async function syncLocalProfile() {
  const user = await getSessionUser();
  if (!user) return null;
  const meta = user.user_metadata || {};
  const local = {
    id: user.id,
    email: user.email,
    name: meta.name || meta.nombre || '',
    username: meta.username || meta.usuario || user.email?.split('@')[0] || '',
    role: meta.role || 'visitante',
    status: meta.status || 'pendiente',
    avatar: meta.avatar || 'https://picsum.photos/seed/avatar/200/200'
  };
  UI.setStoredUser(local);
  return local;
}

window.Auth = { getSessionUser, loginWithPassword, registerWithPassword, logout, syncLocalProfile };
