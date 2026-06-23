// data/data.js
import {
  LayoutDashboard,
  FileText,
  Edit,
  List,
  Filter,
  Shield,
  Eye,
  PieChart,
  UserCog,
  Building2,
  AlertTriangle,
  CreditCard,
  Scale,
  FileCheck,
  DollarSign,
  Briefcase,
  Percent,
} from "lucide-react";

export const menuItems = [
  // === SISTEMA DE COTAÇÕES (PARTE SUPERIOR) ===
  {
    id: 1,
    label: "Dashboard",
    icon: LayoutDashboard,
    path: "/dashboard",
    type: "single",
    color: "from-blue-400 to-cyan-400",
  },
  {
    id: 2,
    label: "Cotações",
    icon: FileText,
    type: "submenu",
    color: "from-indigo-400 to-purple-400",
    submenu: [
      {
        id: 21,
        label: "Criar Cotação",
        icon: FileText,
        path: "/cotacoes/criar",
        color: "from-green-300 to-emerald-300",
      },
      {
        id: 22,
        label: "Editar Cotação",
        icon: Edit,
        path: "/cotacoes/editar",
        color: "from-yellow-300 to-amber-300",
      },
      {
        id: 23,
        label: "Listar Cotações",
        icon: List,
        path: "/cotacoes/listar",
        color: "from-cyan-300 to-blue-300",
      },
    ],
  },

  // === LINHA DIVISÓRIA - SISTEMA CRM ===
  
  // === MENUS DO SISTEMA CRM ===
  {
    id: 3,
    label: "Gestão de Cotações",
    icon: Filter,
    path: "/crm/gestao-cotacoes",
    type: "single",
    color: "from-green-500 to-emerald-500",
    badge: "45"
  },
  {
    id: 5,
    label: "Acompanhamento",
    icon: Eye,
    path: "/crm/acompanhamento",
    type: "single",
    color: "from-orange-500 to-red-500",
    badge: "42"
  },
  {
    id: 9,
    label: "Aprovação de Taxas",
    icon: Percent,
    path: "/crm/aprovacao-taxas",
    type: "single",
    color: "from-amber-500 to-yellow-500",
    approverOnly: true,
    badge: "0",
  },
  {
    id: 7,
    label: "Departamentos",
    icon: Building2,
    type: "submenu",
    color: "from-purple-500 to-pink-500",
    submenu: [
      {
        id: 71,
        label: "Subscricao",
        icon: Shield,
        path: "/departamentos/subscricao",
        color: "from-blue-500 to-cyan-500",
      },
      {
        id: 72,
        label: "Risco e Conformidade",
        icon: AlertTriangle,
        path: "/departamentos/risco-conformidade",
        color: "from-red-500 to-orange-500",
      },
      {
        id: 73,
        label: "Controlo de Credito",
        icon: CreditCard,
        path: "/departamentos/controlo-credito",
        color: "from-yellow-500 to-amber-500",
      },
      {
        id: 74,
        label: "Juridico",
        icon: Scale,
        path: "/departamentos/juridico",
        color: "from-indigo-500 to-purple-500",
      },
      {
        id: 75,
        label: "Sinistros",
        icon: FileCheck,
        path: "/departamentos/sinistros",
        color: "from-red-600 to-pink-600",
      },
      {
        id: 76,
        label: "Contabilidade",
        icon: DollarSign,
        path: "/departamentos/contabilidade",
        color: "from-green-600 to-emerald-600",
      },
      {
        id: 77,
        label: "Comercial",
        icon: Briefcase,
        path: "/departamentos/comercial",
        color: "from-cyan-500 to-blue-500",
      },
    ],
  },
  {
    id: 6,
    label: "Relatórios",
    icon: PieChart,
    path: "/crm/relatorios",
    type: "single",
    color: "from-amber-500 to-orange-500",
    adminOnly: true
  },
  {
    id: 8,
    label: "Utilizadores",
    icon: UserCog,
    path: "/admin/usuarios",
    type: "single",
    color: "from-violet-500 to-purple-500",
    adminOnly: true
  }
];