import { menuItems } from '../data/data';

export const flattenMenuItems = () => {
  const results = [];

  menuItems.forEach((item) => {
    if (item.path) {
      results.push({
        id: item.id,
        label: item.label,
        path: item.path,
        icon: item.icon,
        category: 'Menu',
      });
    }
    if (item.submenu) {
      item.submenu.forEach((sub) => {
        results.push({
          id: sub.id,
          label: sub.label,
          path: sub.path,
          icon: sub.icon,
          category: item.label,
        });
      });
    }
  });

  const extras = [
    { id: 'dash', label: 'Dashboard', path: '/dashboard', category: 'Principal', keywords: 'inicio home painel' },
    { id: 'cot', label: 'Cotações', path: '/cotacoes/listar', category: 'Cotações', keywords: 'cotacao quote' },
    { id: 'gest', label: 'Gestão de Cotações', path: '/crm/gestao-cotacoes', category: 'CRM', keywords: 'gestao gerir' },
    { id: 'acomp', label: 'Acompanhamento', path: '/crm/acompanhamento', category: 'CRM', keywords: 'seguir status' },
    { id: 'aprov', label: 'Aprovação de Taxas', path: '/crm/aprovacao-taxas', category: 'CRM', keywords: 'taxas aprovar' },
    { id: 'rel', label: 'Relatórios', path: '/crm/relatorios', category: 'CRM', keywords: 'relatorio report pdf' },
    { id: 'user', label: 'Utilizadores', path: '/admin/usuarios', category: 'Admin', keywords: 'usuarios users admin' },
  ];

  extras.forEach((e) => {
    if (!results.find((r) => r.path === e.path)) {
      results.push(e);
    }
  });

  return results;
};

export const getSearchIndex = () => flattenMenuItems();
