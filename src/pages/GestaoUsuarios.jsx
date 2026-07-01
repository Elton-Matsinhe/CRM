import React, { useState, useEffect, useMemo } from 'react';
import {
  Users, UserPlus, Search, Edit, Key, Shield, Eye, Trash2,
  X, Loader2, CheckCircle, XCircle, Mail, Building, MapPin, Filter, Calendar, Briefcase
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usuarioService, balcaoService } from '../services/api';
import { useNavigate } from 'react-router-dom';
import AnimatedPagination from '../components/ui/AnimatedPagination';
import DataTableWrapper from '../components/ui/DataTableWrapper';
import UserAvatar from '../components/ui/UserAvatar';

const ROLES = [
  { value: 'admin', label: 'Administrador', color: 'bg-purple-100 text-purple-800 border-purple-300 ring-1 ring-purple-200' },
  { value: 'agente', label: 'Agente', color: 'bg-teal-100 text-teal-800 border-teal-300 ring-1 ring-teal-200' },
  { value: 'subscritor', label: 'Subscritor', color: 'bg-emerald-100 text-emerald-800 border-emerald-300 ring-1 ring-emerald-200' }
];

const ITENS_POR_PAGINA = 10;

const exigeBalcao = (role) => role === 'admin' || role === 'agente';

const formInicial = {
  nome: '',
  email: '',
  senha: '',
  role: 'agente',
  departamento: '',
  balcao: ''
};

function GestaoUsuarios() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [busca, setBusca] = useState('');
  const [filtroRole, setFiltroRole] = useState('all');
  const [filtroBalcao, setFiltroBalcao] = useState('all');
  const [filtroEstado, setFiltroEstado] = useState('all');
  const [filtroDepartamento, setFiltroDepartamento] = useState('all');
  const [paginaAtual, setPaginaAtual] = useState(1);
  const [modalCriar, setModalCriar] = useState(false);
  const [modalEditar, setModalEditar] = useState(null);
  const [modalSenha, setModalSenha] = useState(null);
  const [formCriar, setFormCriar] = useState(formInicial);
  const [formEditar, setFormEditar] = useState({ nome: '', email: '', role: 'agente', departamento: '', ativo: true });
  const [balcoes, setBalcoes] = useState([]);
  const [novaSenha, setNovaSenha] = useState('');
  const [confirmarSenha, setConfirmarSenha] = useState('');

  useEffect(() => {
    if (usuario && usuario.role !== 'admin') {
      alert('❌ Acesso negado. Apenas administradores podem gerir utilizadores.');
      navigate('/dashboard');
    }
  }, [usuario, navigate]);

  useEffect(() => {
    if (usuario?.role === 'admin') {
      carregarUsuarios();
    }
    carregarBalcoes();
  }, [usuario]);

  const carregarBalcoes = async () => {
    try {
      const r = await balcaoService.listar();
      if (r.success && r.data?.length > 0) {
        setBalcoes(r.data);
      } else if (!r.success) {
        console.error('Erro ao carregar balcões:', r.message);
      }
    } catch (e) {
      console.error('Erro ao carregar balcões:', e);
    }
  };

  const carregarUsuarios = async () => {
    try {
      setLoading(true);
      const result = await usuarioService.findAll();
      if (result.success) {
        setUsuarios(result.data);
      } else {
        alert(`❌ ${result.message}`);
      }
    } catch (error) {
      console.error('Erro ao carregar utilizadores:', error);
    } finally {
      setLoading(false);
    }
  };

  const getRoleInfo = (role) => ROLES.find(r => r.value === role) || ROLES[1];

  const departamentosUnicos = useMemo(() => {
    const set = new Set(
      usuarios.map((u) => u.departamento).filter(Boolean)
    );
    return [...set].sort();
  }, [usuarios]);

  const usuariosFiltrados = usuarios.filter((u) => {
    const matchBusca =
      !busca.trim() ||
      u.nome?.toLowerCase().includes(busca.toLowerCase()) ||
      u.email?.toLowerCase().includes(busca.toLowerCase()) ||
      u.departamento?.toLowerCase().includes(busca.toLowerCase()) ||
      u.balcao?.toLowerCase().includes(busca.toLowerCase());
    const matchRole = filtroRole === 'all' || u.role === filtroRole;
    const matchBalcao = filtroBalcao === 'all' || u.balcao === filtroBalcao;
    const ativo = u.ativo === 1 || u.ativo === true;
    const matchEstado =
      filtroEstado === 'all' ||
      (filtroEstado === 'ativo' && ativo) ||
      (filtroEstado === 'inativo' && !ativo);
    const matchDept =
      filtroDepartamento === 'all' ||
      (filtroDepartamento === '__none__' && !u.departamento) ||
      u.departamento === filtroDepartamento;
    return matchBusca && matchRole && matchBalcao && matchEstado && matchDept;
  });

  const totalPaginas = Math.max(1, Math.ceil(usuariosFiltrados.length / ITENS_POR_PAGINA));
  const usuariosPagina = usuariosFiltrados.slice(
    (paginaAtual - 1) * ITENS_POR_PAGINA,
    paginaAtual * ITENS_POR_PAGINA
  );

  useEffect(() => {
    setPaginaAtual(1);
  }, [busca, filtroRole, filtroBalcao, filtroEstado, filtroDepartamento]);

  const handleCriar = async (e) => {
    e.preventDefault();
    if (!formCriar.nome || !formCriar.email || !formCriar.senha) {
      alert('Preencha nome, email e senha.');
      return;
    }
    if (exigeBalcao(formCriar.role) && !formCriar.balcao) {
      alert('Selecione o balcão/agência (obrigatório para administradores e agentes).');
      return;
    }
    if (formCriar.senha.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres.');
      return;
    }

    try {
      setSalvando(true);
      const result = await usuarioService.criar(formCriar);
      if (result.success) {
        alert('✅ Utilizador criado com sucesso!');
        setModalCriar(false);
        setFormCriar(formInicial);
        carregarUsuarios();
      } else {
        alert(`❌ ${result.message}`);
      }
    } finally {
      setSalvando(false);
    }
  };

  const abrirEditar = (u) => {
    carregarBalcoes();
    setFormEditar({
      nome: u.nome || '',
      email: u.email || '',
      role: u.role || 'agente',
      departamento: u.departamento || '',
      balcao: u.balcao || '' ,
      ativo: u.ativo === 1 || u.ativo === true
    });
    setModalEditar(u);
  };

  const handleEditar = async (e) => {
    e.preventDefault();
    if (!formEditar.nome || !formEditar.email) {
      alert('Preencha nome e email.');
      return;
    }
    if (exigeBalcao(formEditar.role) && !formEditar.balcao) {
      alert('Selecione o balcão/agência (obrigatório para administradores e agentes).');
      return;
    }

    try {
      setSalvando(true);
      const result = await usuarioService.atualizar(modalEditar.id, formEditar);
      if (result.success) {
        alert('✅ Utilizador atualizado com sucesso!');
        setModalEditar(null);
        carregarUsuarios();
      } else {
        alert(`❌ ${result.message}`);
      }
    } finally {
      setSalvando(false);
    }
  };

  const handleAtualizarSenha = async (e) => {
    e.preventDefault();
    if (!novaSenha || novaSenha.length < 6) {
      alert('A senha deve ter pelo menos 6 caracteres.');
      return;
    }
    if (novaSenha !== confirmarSenha) {
      alert('As senhas não coincidem.');
      return;
    }

    try {
      setSalvando(true);
      const result = await usuarioService.atualizarSenha(modalSenha.id, novaSenha);
      if (result.success) {
        alert(`✅ Senha de ${modalSenha.nome} atualizada com sucesso!`);
        setModalSenha(null);
        setNovaSenha('');
        setConfirmarSenha('');
      } else {
        alert(`❌ ${result.message}`);
      }
    } finally {
      setSalvando(false);
    }
  };

  const handleExcluir = async (u) => {
    if (u.id === usuario?.id) {
      alert('Não pode eliminar a sua própria conta.');
      return;
    }

    const confirmar = window.confirm(
      `Tem a certeza que deseja eliminar permanentemente o utilizador "${u.nome}" (${u.email})?\n\nEsta ação não pode ser desfeita.`
    );
    if (!confirmar) return;

    const result = await usuarioService.excluir(u.id);
    if (result.success) {
      alert('✅ Utilizador eliminado com sucesso!');
      carregarUsuarios();
    } else {
      alert(`❌ ${result.message}`);
    }
  };

  const toggleAtivo = async (u) => {
    if (u.id === usuario?.id) {
      alert('Não pode desativar a sua própria conta.');
      return;
    }
    const novoEstado = !(u.ativo === 1 || u.ativo === true);
    const acao = novoEstado ? 'ativar' : 'desativar';
    if (!window.confirm(`Deseja ${acao} o utilizador ${u.nome}?`)) return;

    const result = await usuarioService.atualizar(u.id, { ativo: novoEstado });
    if (result.success) {
      carregarUsuarios();
    } else {
      alert(`❌ ${result.message}`);
    }
  };

  if (usuario?.role !== 'admin') return null;

  return (
    <div className="min-h-screen p-4 md:p-6">
      <div className="w-full max-w-[100%]">
        {/* Header */}
        <div className="mb-6 pb-4 border-b border-gray-200/80">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-3">
                <Users className="h-7 w-7 text-emerald-600" />
                Gestão de Utilizadores
              </h1>
              <p className="text-gray-600 mt-1">
                Adicione, edite e gerencie contas de acesso ao sistema
              </p>
            </div>
            <button
              onClick={() => {
                carregarBalcoes();
                setModalCriar(true);
              }}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-colors font-medium shadow-sm"
            >
              <UserPlus className="h-5 w-5" />
              Novo Utilizador
            </button>
          </div>
        </div>

        {/* Stats */}
        <div className="flex flex-wrap gap-3 mb-6">
          {[
            { label: 'Total', value: usuarios.length, cls: 'bg-emerald-50 border-emerald-200 text-emerald-700' },
            { label: 'Administradores', value: usuarios.filter(u => u.role === 'admin').length, cls: 'bg-purple-50 border-purple-200 text-purple-700' },
            { label: 'Agentes', value: usuarios.filter(u => u.role === 'agente').length, cls: 'bg-teal-50 border-teal-200 text-teal-700' },
            { label: 'Ativos', value: usuarios.filter(u => u.ativo === 1 || u.ativo === true).length, cls: 'bg-green-50 border-green-200 text-green-700' },
          ].map((s) => (
            <div key={s.label} className={`px-4 py-2 rounded-xl border ${s.cls}`}>
              <div className="text-xs font-medium opacity-80">{s.label}</div>
              <div className="text-xl font-bold text-gray-900">{s.value}</div>
            </div>
          ))}
        </div>

        {/* Filtros */}
        <div className="mb-4 pb-4 border-b border-gray-200/60">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
            <div className="lg:col-span-2 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600" />
              <input
                type="text"
                placeholder="Pesquisar nome, email, balcão..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 bg-white/70"
              />
            </div>
            <div className="relative">
              <Filter className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-emerald-600 pointer-events-none" />
              <select
                value={filtroRole}
                onChange={(e) => setFiltroRole(e.target.value)}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-300 rounded-xl bg-white/70 focus:ring-2 focus:ring-emerald-500/20"
              >
                <option value="all">Todos os perfis</option>
                <option value="admin">Administradores</option>
                <option value="agente">Agentes</option>
                <option value="subscritor">Subscritores</option>
              </select>
            </div>
            <select
              value={filtroBalcao}
              onChange={(e) => setFiltroBalcao(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl bg-white/70 focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">Todos os balcões</option>
              {balcoes.map((b) => (
                <option key={b.id} value={b.nome}>{b.nome}</option>
              ))}
            </select>
            <select
              value={filtroEstado}
              onChange={(e) => setFiltroEstado(e.target.value)}
              className="w-full px-3 py-2.5 border border-gray-300 rounded-xl bg-white/70 focus:ring-2 focus:ring-emerald-500/20"
            >
              <option value="all">Todos os estados</option>
              <option value="ativo">Ativos</option>
              <option value="inativo">Inativos</option>
            </select>
          </div>
          {departamentosUnicos.length > 0 && (
            <div className="mt-3 max-w-xs">
              <select
                value={filtroDepartamento}
                onChange={(e) => setFiltroDepartamento(e.target.value)}
                className="w-full px-3 py-2.5 border border-gray-300 rounded-xl bg-white/70 text-sm"
              >
                <option value="all">Todos os departamentos</option>
                <option value="__none__">Sem departamento</option>
                {departamentosUnicos.map((d) => (
                  <option key={d} value={d}>{d}</option>
                ))}
              </select>
            </div>
          )}
        </div>

        {/* Tabela */}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-emerald-600 mr-3" />
            <span className="text-gray-600">Carregando utilizadores...</span>
          </div>
        ) : usuariosFiltrados.length === 0 ? (
          <div className="text-center py-16 text-gray-500">
            <Users className="h-12 w-12 mx-auto mb-3 text-gray-300" />
            <p>Nenhum utilizador encontrado</p>
          </div>
        ) : (
          <>
            <DataTableWrapper>
              <table className="w-full min-w-[1100px] border-collapse">
                <thead>
                  <tr className="border-b-2 border-gray-200 bg-gradient-to-r from-gray-50/90 to-emerald-50/40">
                    <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wide text-gray-600 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5"><Users className="h-4 w-4 text-emerald-600" />Utilizador</span>
                    </th>
                    <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wide text-gray-600 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5"><Shield className="h-4 w-4 text-emerald-600" />Perfil</span>
                    </th>
                    <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wide text-gray-600 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5"><MapPin className="h-4 w-4 text-emerald-600" />Balcão</span>
                    </th>
                    <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wide text-gray-600 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5"><Building className="h-4 w-4 text-emerald-600" />Departamento</span>
                    </th>
                    <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wide text-gray-600 whitespace-nowrap">Estado</th>
                    <th className="text-left px-4 py-3.5 text-xs font-bold uppercase tracking-wide text-gray-600 whitespace-nowrap">
                      <span className="inline-flex items-center gap-1.5"><Calendar className="h-4 w-4 text-emerald-600" />Criado em</span>
                    </th>
                    <th className="text-right px-4 py-3.5 text-xs font-bold uppercase tracking-wide text-gray-600 whitespace-nowrap">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100/80">
                  {usuariosPagina.map((u) => {
                    const roleInfo = getRoleInfo(u.role);
                    const ativo = u.ativo === 1 || u.ativo === true;
                    return (
                      <tr key={u.id} className="hover:bg-emerald-50/50 transition-colors duration-200">
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center gap-3 min-w-[220px]">
                            <UserAvatar size={38} />
                            <div className="min-w-0">
                              <p className="font-medium text-gray-900 truncate">{u.nome}</p>
                              <p className="text-sm text-gray-500 truncate flex items-center gap-1">
                                <Mail className="h-3 w-3 flex-shrink-0" />
                                {u.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${roleInfo.color}`}>
                            {u.role === 'admin' && <Shield className="h-3 w-3" />}
                            {u.role === 'subscritor' && <Eye className="h-3 w-3" />}
                            {u.role === 'agente' && <Briefcase className="h-3 w-3" />}
                            {roleInfo.label}
                          </span>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          {u.balcao ? (
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium bg-teal-100 text-teal-800 border border-teal-200">
                              <MapPin className="h-3 w-3" />
                              {u.balcao}
                            </span>
                          ) : (
                            <span className="text-amber-600 text-xs font-medium">Não definido</span>
                          )}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-700 max-w-[160px] truncate">
                          {u.departamento || '—'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <button
                            type="button"
                            onClick={() => toggleAtivo(u)}
                            disabled={u.id === usuario?.id}
                            className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border transition-colors ${
                              ativo
                                ? 'bg-green-100 text-green-800 border-green-300 hover:bg-green-200/80'
                                : 'bg-red-100 text-red-800 border-red-300 hover:bg-red-200/80'
                            } ${u.id === usuario?.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                          >
                            {ativo ? <CheckCircle className="h-3.5 w-3.5" /> : <XCircle className="h-3.5 w-3.5" />}
                            {ativo ? 'Ativo' : 'Inativo'}
                          </button>
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-600">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString('pt-MZ') : '—'}
                        </td>
                        <td className="px-4 py-3 whitespace-nowrap">
                          <div className="flex items-center justify-end gap-1">
                            <button
                              type="button"
                              onClick={() => abrirEditar(u)}
                              className="p-2 text-teal-600 hover:bg-teal-50 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => {
                                setModalSenha(u);
                                setNovaSenha('');
                                setConfirmarSenha('');
                              }}
                              className="p-2 text-amber-600 hover:bg-amber-50 rounded-lg transition-colors"
                              title="Redefinir senha"
                            >
                              <Key className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleExcluir(u)}
                              disabled={u.id === usuario?.id}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50"
                              title="Eliminar"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </DataTableWrapper>

            {usuariosFiltrados.length > ITENS_POR_PAGINA && (
              <AnimatedPagination
                currentPage={paginaAtual}
                totalPages={totalPaginas}
                totalItems={usuariosFiltrados.length}
                itemsPerPage={ITENS_POR_PAGINA}
                onPageChange={setPaginaAtual}
                itemLabel="utilizadores"
              />
            )}
          </>
        )}
      </div>

      {/* Modal Criar */}
      {modalCriar && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <UserPlus className="h-5 w-5 text-emerald-600" />
                Novo Utilizador
              </h2>
              <button onClick={() => setModalCriar(false)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleCriar} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo *</label>
                <input
                  type="text"
                  value={formCriar.nome}
                  onChange={(e) => setFormCriar({ ...formCriar, nome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={formCriar.email}
                  onChange={(e) => setFormCriar({ ...formCriar, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Senha *</label>
                <input
                  type="password"
                  value={formCriar.senha}
                  onChange={(e) => setFormCriar({ ...formCriar, senha: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Perfil *</label>
                <select
                  value={formCriar.role}
                  onChange={(e) => setFormCriar({ ...formCriar, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Balcão {exigeBalcao(formCriar.role) ? '*' : ''}
                </label>
                <select
                  value={formCriar.balcao}
                  onChange={(e) => setFormCriar({ ...formCriar, balcao: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  required={exigeBalcao(formCriar.role)}
                >
                  <option value="">
                    {balcoes.length === 0 ? 'A carregar balcões...' : '-- Selecionar balcão --'}
                  </option>
                  {balcoes.map((b) => (
                    <option key={b.id} value={b.nome}>{b.nome}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
                <input
                  type="text"
                  value={formCriar.departamento}
                  onChange={(e) => setFormCriar({ ...formCriar, departamento: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  placeholder="Opcional"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalCriar(false)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="flex-1 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {salvando ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
                  Criar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Editar */}
      {modalEditar && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Edit className="h-5 w-5 text-blue-600" />
                Editar Utilizador
              </h2>
              <button onClick={() => setModalEditar(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleEditar} className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nome completo *</label>
                <input
                  type="text"
                  value={formEditar.nome}
                  onChange={(e) => setFormEditar({ ...formEditar, nome: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email *</label>
                <input
                  type="email"
                  value={formEditar.email}
                  onChange={(e) => setFormEditar({ ...formEditar, email: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Perfil *</label>
                <select
                  value={formEditar.role}
                  onChange={(e) => setFormEditar({ ...formEditar, role: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  disabled={modalEditar.id === usuario?.id}
                >
                  {ROLES.map((r) => (
                    <option key={r.value} value={r.value}>{r.label}</option>
                  ))}
                </select>
                {modalEditar.id === usuario?.id && (
                  <p className="text-xs text-gray-500 mt-1">Não pode alterar o seu próprio perfil</p>
                )}
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Balcão {exigeBalcao(formEditar.role) ? '*' : ''}
                </label>
                <select
                  value={formEditar.balcao}
                  onChange={(e) => setFormEditar({ ...formEditar, balcao: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                  required={exigeBalcao(formEditar.role)}
                >
                  <option value="">
                    {balcoes.length === 0 ? 'A carregar balcões...' : '-- Selecionar balcão --'}
                  </option>
                  {balcoes.map((b) => (
                    <option key={b.id} value={b.nome}>{b.nome}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Departamento</label>
                <input
                  type="text"
                  value={formEditar.departamento}
                  onChange={(e) => setFormEditar({ ...formEditar, departamento: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalEditar(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {salvando ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle className="h-4 w-4" />}
                  Guardar
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Modal Redefinir Senha */}
      {modalSenha && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-xl w-full max-w-md shadow-2xl">
            <div className="flex items-center justify-between p-6 border-b">
              <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                <Key className="h-5 w-5 text-amber-600" />
                Redefinir Senha
              </h2>
              <button onClick={() => setModalSenha(null)} className="p-1 hover:bg-gray-100 rounded-lg">
                <X className="h-5 w-5" />
              </button>
            </div>
            <form onSubmit={handleAtualizarSenha} className="p-6 space-y-4">
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 text-sm text-amber-800">
                A redefinir a senha de <strong>{modalSenha.nome}</strong> ({modalSenha.email})
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Nova senha *</label>
                <input
                  type="password"
                  value={novaSenha}
                  onChange={(e) => setNovaSenha(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  placeholder="Mínimo 6 caracteres"
                  required
                  minLength={6}
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Confirmar senha *</label>
                <input
                  type="password"
                  value={confirmarSenha}
                  onChange={(e) => setConfirmarSenha(e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-amber-500"
                  required
                  minLength={6}
                />
              </div>
              <div className="flex gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setModalSenha(null)}
                  className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={salvando}
                  className="flex-1 px-4 py-2 bg-amber-600 text-white rounded-lg hover:bg-amber-700 disabled:opacity-50 flex items-center justify-center gap-2"
                >
                  {salvando ? <Loader2 className="h-4 w-4 animate-spin" /> : <Key className="h-4 w-4" />}
                  Atualizar Senha
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default GestaoUsuarios;
