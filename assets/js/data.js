window.SAMPLE_DATA = {
  categories: ['General', 'Académico', 'Deportes', 'Cultura', 'Tecnología', 'Convocatoria'],
  tags: ['urgente', 'evento', 'aviso', 'pregunta', 'opinión', 'logro', 'club'],
  news: [
    {
      id: 1,
      title: 'Jornada de orientación para nuevo ciclo',
      content: 'El colegio organizó una jornada para explicar horarios, normas y rutas de apoyo estudiantil.',
      image: 'https://picsum.photos/seed/news1/900/500',
      author: 'Reportero Escolar',
      date: '2026-05-06',
      category: 'Académico',
      tags: ['aviso', 'evento']
    },
    {
      id: 2,
      title: 'Equipo de fútbol clasifica a semifinales',
      content: 'La selección escolar avanzó tras una victoria sólida en la última fecha del torneo.',
      image: 'https://picsum.photos/seed/news2/900/500',
      author: 'Redacción Deportiva',
      date: '2026-05-05',
      category: 'Deportes',
      tags: ['logro']
    }
  ],
  posts: [
    {
      id: 11,
      type: 'publicacion',
      status: 'pendiente',
      text: 'Nueva foto de la feria científica.',
      image: 'https://picsum.photos/seed/post1/900/600',
      author: 'usuario12',
      date: '2026-05-07',
      likes: 12,
      saves: 4,
      comments: 3,
      tags: ['evento'],
      visibility: 'cola'
    },
    {
      id: 12,
      type: 'pregunta',
      status: 'publico',
      text: '¿Alguien sabe cuándo entregan las notas finales?',
      image: '',
      author: 'estudiante07',
      date: '2026-05-07',
      likes: 5,
      saves: 2,
      comments: 8,
      tags: ['pregunta', 'académico'],
      visibility: 'publico'
    }
  ],
  announcements: [
    {
      id: 21,
      title: 'Mantenimiento de laboratorio',
      text: 'El laboratorio de ciencias permanecerá cerrado mañana por revisión técnica.',
      author: 'Dirección',
      date: '2026-05-07',
      priority: 'alta'
    }
  ],
  moderationQueue: [
    {
      id: 31,
      author: 'usuario12',
      reason: 'Revisión obligatoria de imagen',
      status: 'pendiente',
      submitted: '2026-05-07'
    }
  ],
  logs: [
    {
      id: 41,
      actor: 'moderador1',
      action: 'Aprobó publicación',
      target: '@usuario12',
      reason: 'Cumple normas y contenido correcto',
      date: '2026-05-07 08:10'
    }
  ]
};
