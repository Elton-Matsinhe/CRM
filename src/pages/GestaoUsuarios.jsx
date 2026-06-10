import React, { useState, useEffect } from 'react';
import {
  Users, UserPlus, Search, Edit, Key, Shield, User, Eye, Trash2,
  X, Loader2, CheckCircle, XCircle, Mail, Building
} from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { usuarioService } from '../services/api';
import { useNavigate } from 'react-router-dom';

const ROLES = [
  { value: 'admin', label: 'Administrador', color: 'bg-purple-100 text-purple-800 border-purple-200' },
  { value: 'agente', label: 'Agente', color: 'bg-blue-100 text-blue-800 border-blue-200' },
  { value: 'subscritor', label: 'Subscritor', color: 'bg-emerald-100 text-emerald-800 border-emerald-200' }
];

const formInicial = {
  nome: '',
  email: '',
  senha: '',
  role: 'agente',
  departamento: ''
};

function GestaoUsuarios() {
  const { usuario } = useAuth();
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [busca, setBusca] = useState('');
  const [filtroRole, setFiltroRole] = useState('all');
  const [modalCriar, setModalCriar] = useState(false);
  const [modalEditar, setModalEditar] = useState(null);
  const [modalSenha, setModalSenha] = useState(null);
  const [formCriar, setFormCriar] = useState(formInicial);
  const [formEditar, setFormEditar] = useState({ nome: '', email: '', role: 'agente', departamento: '', ativo: true });
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
  }, [usuario]);

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

  const usuariosFiltrados = usuarios.filter((u) => {
    const matchBusca =
      u.nome?.toLowerCase().includes(busca.toLowerCase()) ||
      u.email?.toLowerCase().includes(busca.toLowerCase()) ||
      u.departamento?.toLowerCase().includes(busca.toLowerCase());
    const matchRole = filtroRole === 'all' || u.role === filtroRole;
    return matchBusca && matchRole;
  });

  const handleCriar = async (e) => {
    e.preventDefault();
    if (!formCriar.nome || !formCriar.email || !formCriar.senha) {
      alert('Preencha nome, email e senha.');
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
    setFormEditar({
      nome: u.nome || '',
      email: u.email || '',
      role: u.role || 'agente',
      departamento: u.departamento || '',
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
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-6 mb-6">
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
              onClick={() => setModalCriar(true)}
              className="flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition-colors font-medium shadow-sm"
            >
              <UserPlus className="h-5 w-5" />
              Novo Utilizador
            </button>
          </div>
        </div>

        {/* Filtros */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm p-4 mb-6">
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
              <input
                type="text"
                placeholder="Pesquisar por nome, email ou departamento..."
                value={busca}
                onChange={(e) => setBusca(e.target.value)}
                className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <select
              value={filtroRole}
              onChange={(e) => setFiltroRole(e.target.value)}
              className="px-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">Todos os perfis</option>
              <option value="admin">Administradores</option>
              <option value="agente">Agentes</option>
              <option value="subscritor">Subscritores</option>
            </select>
          </div>
        </div>

        {/* Tabela */}
        <div className="bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden">
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-50 border-b border-gray-200">
                  <tr>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Utilizador</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Perfil</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Departamento</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Estado</th>
                    <th className="text-left px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Criado em</th>
                    <th className="text-right px-6 py-3 text-xs font-semibold text-gray-600 uppercase">Ações</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-100">
                  {usuariosFiltrados.map((u) => {
                    const roleInfo = getRoleInfo(u.role);
                    const ativo = u.ativo === 1 || u.ativo === true;
                    return (
                      <tr key={u.id} className="hover:bg-gray-50 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className="h-10 w-10 rounded-full bg-emerald-100 flex items-center justify-center">
                              <User className="h-5 w-5 text-emerald-600" />
                            </div>
                            <div>
                              <p className="font-medium text-gray-900">{u.nome}</p>
                              <p className="text-sm text-gray-500 flex items-center gap-1">
                                <Mail className="h-3 w-3" />
                                {u.email}
                              </p>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border ${roleInfo.color}`}>
                            {u.role === 'admin' && <Shield className="h-3 w-3" />}
                            {u.role === 'subscritor' && <Eye className="h-3 w-3" />}
                            {roleInfo.label}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {u.departamento ? (
                            <span className="flex items-center gap-1">
                              <Building className="h-3 w-3" />
                              {u.departamento}
                            </span>
                          ) : (
                            <span className="text-gray-400">—</span>
                          )}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => toggleAtivo(u)}
                            disabled={u.id === usuario?.id}
                            className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium border transition-colors ${
                              ativo
                                ? 'bg-green-100 text-green-800 border-green-200 hover:bg-green-200'
                                : 'bg-red-100 text-red-800 border-red-200 hover:bg-red-200'
                            } ${u.id === usuario?.id ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`}
                            title={u.id === usuario?.id ? 'Não pode alterar o seu próprio estado' : 'Clique para alternar'}
                          >
                            {ativo ? <CheckCircle className="h-3 w-3" /> : <XCircle className="h-3 w-3" />}
                            {ativo ? 'Ativo' : 'Inativo'}
                          </button>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {u.created_at ? new Date(u.created_at).toLocaleDateString('pt-MZ') : '—'}
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex items-center justify-end gap-2">
                            <button
                              onClick={() => abrirEditar(u)}
                              className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg transition-colors"
                              title="Editar"
                            >
                              <Edit className="h-4 w-4" />
                            </button>
                            <button
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
                              onClick={() => handleExcluir(u)}
                              disabled={u.id === usuario?.id}
                              className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              title={u.id === usuario?.id ? 'Não pode eliminar a sua própria conta' : 'Eliminar utilizador'}
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
            </div>
          )}
        </div>

        <p className="text-sm text-gray-500 mt-4 text-center">
          Total: {usuariosFiltrados.length} de {usuarios.length} utilizador(es)
        </p>
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
