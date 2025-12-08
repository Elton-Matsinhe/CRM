// Helper para tradução global
export const translations = {
  pt: {
    dashboard: 'Dashboard',
    cotacoes: 'Cotações',
    criarCotacao: 'Criar Cotação',
    editarCotacao: 'Editar Cotação',
    listarCotacoes: 'Listar Cotações',
    gestaoCotacoes: 'Gestão de Cotações',
    acompanhamento: 'Acompanhamento',
    departamentos: 'Departamentos',
    relatorios: 'Relatórios',
    // ... mais traduções conforme necessário
  },
  en: {
    dashboard: 'Dashboard',
    cotacoes: 'Quotes',
    criarCotacao: 'Create Quote',
    editarCotacao: 'Edit Quote',
    listarCotacoes: 'List Quotes',
    gestaoCotacoes: 'Quote Management',
    acompanhamento: 'Tracking',
    departamentos: 'Departments',
    relatorios: 'Reports',
  },
  fr: {
    dashboard: 'Tableau de bord',
    cotacoes: 'Devis',
    criarCotacao: 'Créer un devis',
    editarCotacao: 'Modifier le devis',
    listarCotacoes: 'Liste des devis',
    gestaoCotacoes: 'Gestion des devis',
    acompanhamento: 'Suivi',
    departamentos: 'Départements',
    relatorios: 'Rapports',
  }
};

export const getTranslation = (language, key) => {
  return translations[language]?.[key] || translations.pt[key] || key;
};

