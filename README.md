# Colegio Verde - Base web escolar moderada

Proyecto base en HTML, CSS y JavaScript con Supabase como backend.

## Estructura
- `index.html`: inicio.
- `login.html` y `register.html`: acceso y alta.
- `dashboard.html`: panel central.
- `noticias.html`, `publicaciones.html`, `foro.html`, `anuncios.html`: secciones principales.
- `perfil.html`: perfil de usuario.
- `staff.html`, `mod.html`, `admin.html`: paneles por rol.
- `assets/css/styles.css`: estilos globales.
- `assets/js/*.js`: lógica común, auth, componentes y datos.
- `supabase/schema.sql`: base de datos y RLS inicial.

## Cómo arrancarlo
1. Crea un proyecto en Supabase.
2. Ejecuta `supabase/schema.sql` en el editor SQL.
3. Crea los buckets de Storage:
   - `profile-images`
   - `post-images`
   - `news-images`
4. Cambia `assets/js/config.js` con tu URL y tu `anon key`.
5. Abre el proyecto con un servidor local, no con doble clic.
   - Por ejemplo: `python -m http.server 8000`
6. Entra a `http://localhost:8000`

## Nota
La base ya trae componentes reutilizables, datos de ejemplo y navegación por rol. La lógica real de permisos debe reforzarse con RLS y funciones en Supabase.
