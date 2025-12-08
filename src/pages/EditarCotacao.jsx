// src/pages/EditarCotacao.jsx
import React, { useState, useEffect } from 'react';
import { Save, Search, Edit3, User, Car, Calendar } from 'lucide-react';
import CotacoesLayout from '../components/CotacoesLayout';

function EditarCotacao() {
  const [cotacaoId, setCotacaoId] = useState('');
  const [formData, setFormData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Simulação de dados existentes
  const cotaçõesExemplo = {
    'CT001': {
      id: 'CT001',
      cliente: 'João Santos',
      tipoSeguro: 'Automóvel',
      veiculo: 'Toyota Corolla',
      valorVeiculo: '85000',
      dataInicio: '2024-01-15',
      coberturas: ['Responsabilidade Civil', 'Danos Próprios', 'Roubo/Furto'],
      observacoes: 'Cliente preferencial'
    },
    'CT002': {
      id: 'CT002', 
      cliente: 'Maria Costa',
      tipoSeguro: 'Saúde',
      veiculo: '',
      valorVeiculo: '50000',
      dataInicio: '2024-01-20',
      coberturas: ['Assistência em Viagem', 'Proteção Jurídica'],
      observacoes: 'Plano familiar'
    }
  };

  const buscarCotacao = () => {
    if (!cotacaoId) return;
    
    setIsLoading(true);
    // Simulação de busca
    setTimeout(() => {
      const cotacao = cotaçõesExemplo[cotacaoId];
      if (cotacao) {
        setFormData(cotacao);
      } else {
        alert('Cotação não encontrada!');
        setFormData(null);
      }
      setIsLoading(false);
    }, 1000);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Cotação atualizada:', formData);
    alert('Cotação atualizada com sucesso!');
  };

  return (
    <CotacoesLayout
      title="Editar Cotação"
      subtitle="Busque e edite cotações existentes no sistema"
    >
      <div className="p-8">
        {/* Busca de Cotação */}
        <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/30 mb-8">
          <div className="flex items-center mb-4">
            <Search className="h-6 w-6 text-green-400 mr-3" />
            <h3 className="text-xl font-semibold text-white">Buscar Cotação</h3>
          </div>
          <div className="flex space-x-4">
            <input
              type="text"
              placeholder="Digite o ID da cotação (ex: CT001)"
              className="flex-1 px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300"
              value={cotacaoId}
              onChange={(e) => setCotacaoId(e.target.value.toUpperCase())}
            />
            <button
              onClick={buscarCotacao}
              disabled={isLoading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg font-semibold hover:bg-green-700 transition-all duration-300 hover:scale-105 flex items-center space-x-2 disabled:opacity-50"
            >
              <Search className="h-5 w-5" />
              <span>{isLoading ? 'Buscando...' : 'Buscar'}</span>
            </button>
          </div>
        </div>

        {/* Formulário de Edição */}
        {formData && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-gray-700/30 rounded-xl p-6 border border-gray-600/30">
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center">
                  <Edit3 className="h-6 w-6 text-green-400 mr-3" />
                  <h3 className="text-xl font-semibold text-white">
                    Editando: {formData.id}
                  </h3>
                </div>
                <span className="px-3 py-1 bg-green-500/20 text-green-400 rounded-full text-sm font-medium">
                  Ativa
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Cliente
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300"
                    value={formData.cliente}
                    onChange={(e) => setFormData({...formData, cliente: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Tipo Seguro
                  </label>
                  <input
                    type="text"
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300"
                    value={formData.tipoSeguro}
                    onChange={(e) => setFormData({...formData, tipoSeguro: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Valor
                  </label>
                  <input
                    type="number"
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300"
                    value={formData.valorVeiculo}
                    onChange={(e) => setFormData({...formData, valorVeiculo: e.target.value})}
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">
                    Data Início
                  </label>
                  <input
                    type="date"
                    className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300"
                    value={formData.dataInicio}
                    onChange={(e) => setFormData({...formData, dataInicio: e.target.value})}
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Observações
                </label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-3 bg-gray-700/50 border border-gray-600 rounded-lg text-white focus:border-green-500 focus:ring-2 focus:ring-green-500/20 transition-all duration-300"
                  value={formData.observacoes}
                  onChange={(e) => setFormData({...formData, observacoes: e.target.value})}
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setFormData(null)}
                className="px-6 py-3 border border-gray-600 text-gray-300 rounded-lg hover:bg-gray-700/50 transition-all duration-300 hover:scale-105"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-gradient-to-r from-green-600 to-green-700 text-white rounded-lg font-semibold hover:from-green-700 hover:to-green-800 transition-all duration-300 hover:scale-105 flex items-center space-x-2 shadow-lg shadow-green-600/20"
              >
                <Save className="h-5 w-5" />
                <span>Atualizar Cotação</span>
              </button>
            </div>
          </form>
        )}
      </div>
    </CotacoesLayout>
  );
}

export default EditarCotacao;