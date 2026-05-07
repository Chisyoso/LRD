const DB = {
  client: null,
  async init() {
    try {
      if (!window.supabase || !window.APP_CONFIG?.supabaseUrl || !window.APP_CONFIG?.supabaseAnonKey) return null;
      this.client = supabase.createClient(window.APP_CONFIG.supabaseUrl, window.APP_CONFIG.supabaseAnonKey);
      return this.client;
    } catch (error) {
      console.warn('Supabase init error:', error);
      this.client = null;
      return null;
    }
  },
  ready() {
    return !!this.client;
  },
  async session() {
    if (!this.ready()) return null;
    const { data } = await this.client.auth.getSession();
    return data?.session || null;
  },
  async user() {
    if (!this.ready()) return null;
    const { data } = await this.client.auth.getUser();
    return data?.user || null;
  },
  async profile(userId) {
    if (!this.ready() || !userId) return null;
    const { data, error } = await this.client
      .from('users')
      .select('*')
      .eq('id', userId)
      .maybeSingle();
    if (error) {
      console.warn(error);
      return null;
    }
    return data || null;
  },
  async currentProfile() {
    const user = await this.user();
    if (!user) return null;
    return this.profile(user.id);
  },
  async role() {
    const profile = await this.currentProfile();
    return profile?.role || 'visitante';
  },
  async uploadImage(bucket, file, prefix = 'img') {
    if (!this.ready() || !file) return '';
    const safeName = `${prefix}-${Date.now()}-${file.name}`.replace(/\s+/g, '-');
    const path = safeName;
    const { error } = await this.client.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: false
    });
    if (error) throw error;
    const { data } = this.client.storage.from(bucket).getPublicUrl(path);
    return data?.publicUrl || '';
  },
  async list(table, queryBuilder = null) {
    if (!this.ready()) return [];
    let query = this.client.from(table).select('*').order('created_at', { ascending: false });
    if (typeof queryBuilder === 'function') query = queryBuilder(query);
    const { data, error } = await query;
    if (error) {
      console.warn(`Error loading ${table}:`, error);
      return [];
    }
    return data || [];
  },
  async insert(table, payload) {
    if (!this.ready()) return { data: null, error: new Error('Supabase no está listo') };
    return await this.client.from(table).insert(payload).select().single();
  },
  async update(table, payload, idField, idValue) {
    if (!this.ready()) return { data: null, error: new Error('Supabase no está listo') };
    return await this.client.from(table).update(payload).eq(idField, idValue).select().single();
  },
  async remove(table, idField, idValue) {
    if (!this.ready()) return { data: null, error: new Error('Supabase no está listo') };
    return await this.client.from(table).delete().eq(idField, idValue);
  }
};

async function getAppState() {
  const session = await DB.session();
  const profile = await DB.currentProfile();
  const role = profile?.role || 'visitante';
  return {
    session,
    user: session?.user || null,
    profile,
    role
  };
}

function isAuthorized(role, allowed = []) {
  return allowed.includes(role);
}

function fmtDate(value) {
  if (!value) return '';
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) return String(value);
  return d.toLocaleString('es-ES', {
    year: 'numeric',
    month: 'short',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit'
  });
}

function escapeText(text = '') {
  return String(text)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;')
    .replaceAll("'", '&#039;');
}

function cleanTags(raw = '') {
  return raw.split(',').map(x => x.trim()).filter(Boolean);
}
