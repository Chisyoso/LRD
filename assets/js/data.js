window.SAMPLE_DATA = {
  categories: [
    { id: 1, name: 'General' },
    { id: 2, name: 'Académico' },
    { id: 3, name: 'Deportes' },
    { id: 4, name: 'Cultura' },
    { id: 5, name: 'Avisos' }
  ],
  tags: ['escuela', 'colegio', 'deportes', 'tareas', 'eventos', 'noticias', 'foro', 'comunidad'],
  news: [
    {
      id: 'n1',
      title: 'Nueva jornada de orientación para estudiantes',
      content: 'La dirección informó nuevas actividades de orientación académica y convivencia escolar.',
      image: 'https://images.unsplash.com/photo-1523240795612-9a054b0db644?auto=format&fit=crop&w=1200&q=80',
      author: 'Reporte Escolar',
      date: '2026-05-06',
      category: 'Académico',
      tags: ['escuela', 'orientación']
    },
    {
      id: 'n2',
      title: 'Se habilita el torneo interclases',
      content: 'El área de deportes abrió inscripciones para participar en las competencias internas.',
      image: 'https://images.unsplash.com/photo-1517649763962-0c623066013b?auto=format&fit=crop&w=1200&q=80',
      author: 'Profe de deportes',
      date: '2026-05-05',
      category: 'Deportes',
      tags: ['deportes', 'eventos']
    }
  ],
  posts: [
    {
      id: 'p1',
      type: 'publicación',
      title: 'Primer día de proyecto',
      content: 'Compartimos la maqueta del proyecto del aula.',
      image: 'https://images.unsplash.com/photo-1524178232363-1fb2b075b655?auto=format&fit=crop&w=1200&q=80',
      author: 'Juan Pérez',
      date: '2026-05-06',
      status: 'aprobado',
      likes: 12,
      saves: 4,
      tags: ['escuela', 'clase']
    },
    {
      id: 'p2',
      type: 'pregunta',
      title: '¿Alguien entiende matemáticas?',
      content: 'Necesito una explicación simple de ecuaciones lineales.',
      image: '',
      author: 'Ana López',
      date: '2026-05-05',
      status: 'aprobado',
      likes: 5,
      saves: 2,
      tags: ['tareas', 'ayuda']
    }
  ],
  announcements: [
    {
      id: 'a1',
      title: 'Mantenimiento del laboratorio',
      content: 'El laboratorio permanecerá cerrado el viernes por mantenimiento preventivo.',
      author: 'Staff escolar',
      date: '2026-05-07',
      status: 'publico'
    }
  ],
  comments: [
    {
      id: 'c1',
      post_id: 'p2',
      author: 'Carlos',
      content: 'Yo también necesito eso.',
      date: '2026-05-06'
    }
  ],
  users: [
    {
      id: 'u1',
      full_name: 'Usuario Demo',
      username: 'usuario_demo',
      contact: 'demo@colegio.com',
      phone: '',
      role: 'usuario',
      status: 'activo'
    },
    {
      id: 'u2',
      full_name: 'Reportero Demo',
      username: 'reportero_demo',
      contact: 'reportero@colegio.com',
      phone: '9999-0000',
      role: 'reportero',
      status: 'activo'
    }
  ],
  logs: [
    { id: 'l1', action: 'Aprobó publicación', actor: 'moderador_demo', target: 'p1', reason: 'Cumple reglas', date: '2026-05-06 10:00' },
    { id: 'l2', action: 'Rechazó publicación', actor: 'staff_demo', target: 'p9', reason: 'Imagen no apta', date: '2026-05-06 12:10' }
  ],
  appeals: [
    { id: 'ap1', target: 'p9', author: 'usuario_demo', reason: 'Solicito revisión', status: 'pendiente', date: '2026-05-07' }
  ],
  reports: [
    { id: 'r1', target: 'p7', author: 'usuario_demo', reason: 'Contenido fuera de lugar', status: 'abierto', date: '2026-05-07' }
  ],
  strikes: [
    { id: 's1', user: 'usuario_demo', reason: 'Reincidencia', count: 1, date: '2026-05-01' }
  ]
};
