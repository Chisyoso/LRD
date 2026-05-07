const { supabaseUrl, supabaseAnonKey } = window.APP_CONFIG;
if (!supabaseUrl || !supabaseAnonKey || supabaseUrl.includes('YOUR_PROJECT')) {
  console.warn('Configura APP_CONFIG con tus credenciales de Supabase.');
}
window.sb = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
