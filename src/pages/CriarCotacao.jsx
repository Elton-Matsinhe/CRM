import React, { useState, useEffect } from 'react';
import { 
  Save, 
  User, 
  Building, 
  ChevronDown, 
  Calendar, 
  Phone, 
  FileText,
  Globe,
  Mail,
  Car,
  Shield,
  Calculator,
  DollarSign,
  Type,
  Hash,
  Calendar as CalendarIcon,
  Cog,
  Barcode,
  Users,
  Percent,
  CreditCard,
  Smartphone,
  Wallet
} from 'lucide-react';

function CriarCliente() {
  const [tipoCliente, setTipoCliente] = useState('Particular');
  const [isSwitching, setIsSwitching] = useState(false);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [mostrarPagamento, setMostrarPagamento] = useState(false);

  // Estados para o formulário da viatura
  const [tipoCobertura, setTipoCobertura] = useState('');
  const [veiculos, setVeiculos] = useState([]);
  const [veiculoAtual, setVeiculoAtual] = useState({
    marcaModelo: '',
    matricula: '',
    ano: '',
    motor: '',
    chassis: '',
    lotacao: '',
    tipoViatura: '',
    capitalSeguro: '',
    taxa: '',
    taxaSelecionada: '',
    premioAnnual: ''
  });

  // Estados para pagamento
  const [formaPagamento, setFormaPagamento] = useState('');
  const [contactoMPesa, setContactoMPesa] = useState('');
  const [contactoEMola, setContactoEMola] = useState('');
  const [pinPagamento, setPinPagamento] = useState('');
  const [processandoPagamento, setProcessandoPagamento] = useState(false);

  const [formData, setFormData] = useState({
    nacionalidade: 'MZ',
    tituloContato: '',
    primeiroNome: '',
    sobrenome: '',
    telefone: '+258',
    email: '',
    numeroDocumento: '',
    dataNascimento: '',
    nomeEmpresa: '',
    numeroReferenciaFiscal: ''
  });

  // Configurações das coberturas baseadas no Excel
  const configCoberturas = {
    'DP_NORMAL': {
      nome: 'DP NORMAL - Danos Próprios com Franquia',
      taxas: {
        'Ligeiro': 0.035,
        'Pesado': 0.05
      },
      taxasOpcoes: {
        'Ligeiro': [0.035, 0.040, 0.045],
        'Pesado': [0.05, 0.055, 0.06, 0.065]
      },
      premioMinimo: {
        'Ligeiro': 12000,
        'Pesado': 15000
      },
      coberturas: {
        responsabilidadeCivil: 5000000,
        morteInvalidez: 100000,
        despesasMedicas: 20000,
        despesasFuneral: 5000,
        perdaChaves: 35000,
        remocaoSalvados: 52500
      }
    },
    'DP_SEM_FRANQUIA': {
      nome: 'DP SEM FRANQUIA - Danos Próprios sem Franquia',
      taxas: {
        'Ligeiro': 0.035,
        'Pesado': 0.05
      },
      taxasOpcoes: {
        'Ligeiro': [0.035, 0.040, 0.045],
        'Pesado': [0.05, 0.055, 0.06, 0.065]
      },
      premioMinimo: {
        'Ligeiro': 12000,
        'Pesado': 15000
      },
      coberturas: {
        responsabilidadeCivil: 10000000,
        morteInvalidez: 250000,
        despesasMedicas: 85000,
        despesasFuneral: 25000,
        perdaChaves: 55000,
        remocaoSalvados: 65000
      }
    },
    'RC_NORMAL': {
      nome: 'RC NORMAL - Apenas Responsabilidade Civil',
      taxas: {
        'Ligeiro': 0.045,
        'Pesado': 0.05
      },
      taxasOpcoes: {
        'Ligeiro': [0.045, 0.050, 0.055],
        'Pesado': [0.05, 0.055, 0.06, 0.065]
      },
      premioMinimo: {
        'Ligeiro': 2999,
        'Pesado': 5999
      },
      coberturas: {
        responsabilidadeCivil: 4000000,
        morteInvalidez: 0,
        despesasMedicas: 0,
        despesasFuneral: 0
      }
    },
    'RC_OCUPANTES': {
      nome: 'RC & OCUPANTES - RC + Cobertura para Ocupantes',
      taxas: {
        'Ligeiro': 0.035,
        'Pesado': 0.05
      },
      taxasOpcoes: {
        'Ligeiro': [0.035, 0.040, 0.045],
        'Pesado': [0.05, 0.055, 0.06, 0.065]
      },
      premioMinimo: {
        'Ligeiro': 3500,
        'Pesado': 8000
      },
      coberturas: {
        responsabilidadeCivil: 4000000,
        morteInvalidez: 100000,
        despesasMedicas: 20000,
        despesasFuneral: 5000
      }
    }
  };

  const titulosContato = [
    'Sr.', 'Sra.', 'Dr.', 'Dra.', 'Eng.', 'Arq.'
  ];

  const paises = [
    { code: 'MZ', name: 'Moçambique', flag: '🇲🇿' },
    { code: 'AO', name: 'Angola', flag: '🇦🇴' },
    { code: 'PT', name: 'Portugal', flag: '🇵🇹' },
    { code: 'BR', name: 'Brasil', flag: '🇧🇷' },
    { code: 'CV', name: 'Cabo Verde', flag: '🇨🇻' },
  ];

  // Função para calcular o prémio baseado na fórmula do Excel
  const calcularPremio = (capitalSeguro, tipoViatura, cobertura, taxaSelecionada) => {
    const config = configCoberturas[cobertura];
    if (!config || !tipoViatura) return { taxa: 0, premioAnnual: '0.00' };
    
    const capital = parseFloat(capitalSeguro) || 0;
    if (capital === 0) return { taxa: 0, premioAnnual: '0.00' };
    
    // Usar taxa selecionada ou taxa padrão
    let taxa;
    if (taxaSelecionada && taxaSelecionada !== '' && taxaSelecionada !== null && taxaSelecionada !== undefined) {
      taxa = parseFloat(taxaSelecionada);
    } else {
      taxa = config.taxas[tipoViatura] || 0;
    }
    
    if (taxa === 0) return { taxa: 0, premioAnnual: '0.00' };
    
    // Cálculo: Capital Seguro × Taxa
    const premioCalculado = capital * taxa;
    
    // Aplicar prémio mínimo conforme Excel
    const premioMinimo = config.premioMinimo[tipoViatura] || 0;
    const premioFinal = Math.max(premioCalculado, premioMinimo);

    return {
      taxa: taxa,
      premioAnnual: premioFinal.toFixed(2),
      premioCalculado: premioCalculado.toFixed(2),
      premioMinimo: premioMinimo
    };
  };

  // Efeito para calcular prémio quando capital, tipo ou taxa mudam
  useEffect(() => {
    if (veiculoAtual.capitalSeguro && veiculoAtual.tipoViatura && tipoCobertura) {
      const resultado = calcularPremio(
        veiculoAtual.capitalSeguro,
        veiculoAtual.tipoViatura,
        tipoCobertura,
        veiculoAtual.taxaSelecionada
      );
      
      setVeiculoAtual(prev => ({
        ...prev,
        taxa: resultado.taxa,
        premioAnnual: resultado.premioAnnual
      }));
    }
  }, [veiculoAtual.capitalSeguro, veiculoAtual.tipoViatura, tipoCobertura, veiculoAtual.taxaSelecionada]);

  // Efeito para resetar taxa selecionada quando muda o tipo de viatura
  useEffect(() => {
    if (veiculoAtual.tipoViatura && tipoCobertura) {
      setVeiculoAtual(prev => ({
        ...prev,
        taxaSelecionada: ''
      }));
    }
  }, [veiculoAtual.tipoViatura, tipoCobertura]);

  const handleTipoClienteChange = (novoTipo) => {
    if (novoTipo !== tipoCliente) {
      setIsSwitching(true);
      setTimeout(() => {
        setTipoCliente(novoTipo);
        setIsSwitching(false);
      }, 300);
    }
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log('Dados do cliente:', { tipoCliente, ...formData });
    alert(tipoCliente === 'Particular' ? 'Cliente adicionado com sucesso!' : 'Empresa adicionada com sucesso!');
  };

  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handleVeiculoChange = (field, value) => {
    setVeiculoAtual(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const adicionarVeiculo = () => {
    if (!veiculoAtual.marcaModelo || !veiculoAtual.tipoViatura || !veiculoAtual.capitalSeguro) {
      alert('Preencha os campos obrigatórios do veículo!');
      return;
    }

    setVeiculos(prev => [...prev, { 
      ...veiculoAtual, 
      id: Date.now(),
      taxaUsada: veiculoAtual.taxaSelecionada || getConfigCobertura()?.taxas[veiculoAtual.tipoViatura]
    }]);
    setVeiculoAtual({
      marcaModelo: '',
      matricula: '',
      ano: '',
      motor: '',
      chassis: '',
      lotacao: '',
      tipoViatura: '',
      capitalSeguro: '',
      taxa: '',
      taxaSelecionada: '',
      premioAnnual: ''
    });
  };

  const removerVeiculo = (id) => {
    setVeiculos(prev => prev.filter(v => v.id !== id));
  };

  const calcularTotalPremio = () => {
    return veiculos.reduce((total, veiculo) => total + (parseFloat(veiculo.premioAnnual) || 0), 0);
  };

  const getPaisSelecionado = () => {
    return paises.find(pais => pais.code === formData.nacionalidade) || paises[0];
  };

  const getConfigCobertura = () => {
    return tipoCobertura ? configCoberturas[tipoCobertura] : null;
  };

  const getTaxasDisponiveis = () => {
    if (!tipoCobertura || !veiculoAtual.tipoViatura) return [];
    return getConfigCobertura()?.taxasOpcoes[veiculoAtual.tipoViatura] || [];
  };

  const formatarTaxa = (taxa) => {
    return `${(taxa * 100).toFixed(1)}%`;
  };

  const formatarMoeda = (valor) => {
    return `MZN ${parseFloat(valor).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })}`;
  };

  // Função para processar pagamento
  const processarPagamento = async () => {
    if (!formaPagamento) {
      alert('Selecione uma forma de pagamento!');
      return;
    }

    if ((formaPagamento === 'M-PESA' && !contactoMPesa) || 
        (formaPagamento === 'E-MOLA' && !contactoEMola)) {
      alert('Preencha o contacto para a forma de pagamento selecionada!');
      return;
    }

    if (!pinPagamento) {
      alert('Digite o PIN de autorização!');
      return;
    }

    setProcessandoPagamento(true);

    try {
      // Simular processamento do pagamento
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Aqui iria a integração real com as APIs de pagamento
      alert('Pagamento processado com sucesso!');
      setMostrarPagamento(false);
      setFormaPagamento('');
      setContactoMPesa('');
      setContactoEMola('');
      setPinPagamento('');
      
    } catch (error) {
      alert('Erro no processamento do pagamento. Tente novamente.');
    } finally {
      setProcessandoPagamento(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-black p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header com Animação */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-white mb-3">
            {tipoCliente === 'Particular' ? 'Adicionar Novo Cliente' : 'Adicionar Nova Empresa'}
          </h1>
          <div className="flex items-center justify-center gap-2 text-[#106a37]">
            <div className="w-8 h-px bg-[#106a37]" />
            <p className="text-sm font-medium">
              Os campos assinalados com * são obrigatórios
            </p>
            <div className="w-8 h-px bg-[#106a37]" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Container Principal - Dados do Cliente */}
          <div 
            className="rounded-2xl border-2 transition-all duration-500 hover:shadow-2xl overflow-hidden"
            style={{
              background: 'linear-gradient(135deg, rgba(16, 106, 55, 0.05) 0%, rgba(99, 102, 108, 0.1) 100%)',
              borderColor: 'rgba(16, 106, 55, 0.2)',
              backdropFilter: 'blur(20px)'
            }}
          >
            {/* Seletor de Tipo de Cliente com Animação */}
            <div className="p-6 border-b" style={{ borderColor: 'rgba(16, 106, 55, 0.2)' }}>
              <div className="flex gap-4 justify-center">
                <button
                  type="button"
                  onClick={() => handleTipoClienteChange('Particular')}
                  className={`flex items-center gap-3 px-6 py-4 rounded-xl transition-all duration-500 transform hover:scale-105 ${
                    tipoCliente === 'Particular' 
                      ? 'bg-[#106a37] text-white shadow-2xl scale-105' 
                      : 'bg-[#63666c] text-gray-300 hover:bg-[#106a37] hover:bg-opacity-30'
                  } ${isSwitching ? 'animate-pulse' : ''}`}
                >
                  <User className="h-5 w-5" />
                  <span className="font-semibold">Particular</span>
                </button>
                
                <button
                  type="button"
                  onClick={() => handleTipoClienteChange('Empresarial')}
                  className={`flex items-center gap-3 px-6 py-4 rounded-xl transition-all duration-500 transform hover:scale-105 ${
                    tipoCliente === 'Empresarial' 
                      ? 'bg-[#106a37] text-white shadow-2xl scale-105' 
                      : 'bg-[#63666c] text-gray-300 hover:bg-[#106a37] hover:bg-opacity-30'
                  } ${isSwitching ? 'animate-pulse' : ''}`}
                >
                  <Building className="h-5 w-5" />
                  <span className="font-semibold">Empresarial</span>
                </button>
              </div>
            </div>

            <div className="p-6">
              {/* Conteúdo com Transição */}
              <div className={`transition-all duration-500 ${isSwitching ? 'opacity-0 scale-95' : 'opacity-100 scale-100'}`}>
                
                {/* Dados Comuns - Apenas Nacionalidade para Particular */}
                {tipoCliente === 'Particular' && (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
                    {/* Campo Nacionalidade */}
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-white">
                        Nacionalidade *
                      </label>
                      <div className="relative group">
                        <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#106a37] h-4 w-4 z-10" />
                        <select
                          required
                          className="w-full pl-10 pr-10 py-3 rounded-xl text-white transition-all duration-300 focus:outline-none focus:scale-[1.02] focus:ring-2 focus:ring-[#106a37] appearance-none cursor-pointer"
                          style={{
                            background: 'rgba(99, 102, 108, 0.5)',
                            border: '1px solid rgba(255, 255, 255, 0.2)'
                          }}
                          value={formData.nacionalidade}
                          onChange={(e) => handleInputChange('nacionalidade', e.target.value)}
                        >
                          {paises.map((pais, index) => (
                            <option 
                              key={index} 
                              value={pais.code}
                              style={{
                                background: '#2d3748',
                                color: 'white',
                                padding: '8px'
                              }}
                            >
                              {pais.flag} {pais.name}
                            </option>
                          ))}
                        </select>
                        <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2 z-10">
                          <span className="text-lg">{getPaisSelecionado().flag}</span>
                          <ChevronDown className="text-[#106a37] h-4 w-4" />
                        </div>
                      </div>
                    </div>
                    <div></div>
                  </div>
                )}

                {/* Dados Específicos */}
                {tipoCliente === 'Particular' ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-1 h-8 bg-[#106a37] rounded-full" />
                      <h3 className="text-xl font-bold text-white">Dados Pessoais</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Título de Contato */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-white">
                          Título de Contato
                        </label>
                        <div className="relative group">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#106a37] h-4 w-4 z-10" />
                          <select
                            className="w-full pl-10 pr-10 py-3 rounded-xl text-white transition-all duration-300 focus:outline-none focus:scale-[1.02] focus:ring-2 focus:ring-[#106a37] appearance-none cursor-pointer"
                            style={{
                              background: 'rgba(99, 102, 108, 0.5)',
                              border: '1px solid rgba(255, 255, 255, 0.2)'
                            }}
                            value={formData.tituloContato}
                            onChange={(e) => handleInputChange('tituloContato', e.target.value)}
                          >
                            <option value="">- Selecionar -</option>
                            {titulosContato.map((titulo, index) => (
                              <option 
                                key={index} 
                                value={titulo}
                                style={{
                                  background: '#2d3748',
                                  color: 'white'
                                }}
                              >
                                {titulo}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-[#106a37] h-4 w-4 z-10" />
                        </div>
                      </div>
                      
                      <div className="lg:col-span-2"></div>
                      
                      {/* Primeiro Nome */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-white">
                          Primeiro Nome *
                        </label>
                        <div className="relative group">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#106a37] h-4 w-4" />
                          <input
                            type="text"
                            required
                            className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder-gray-400 transition-all duration-300 focus:outline-none focus:scale-[1.02] focus:ring-2 focus:ring-[#106a37]"
                            style={{
                              background: 'rgba(99, 102, 108, 0.3)',
                              border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}
                            placeholder="Primeiro nome"
                            value={formData.primeiroNome}
                            onChange={(e) => handleInputChange('primeiroNome', e.target.value)}
                          />
                        </div>
                      </div>
                      
                      {/* Sobrenome */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-white">
                          Sobrenome *
                        </label>
                        <div className="relative group">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#106a37] h-4 w-4" />
                          <input
                            type="text"
                            required
                            className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder-gray-400 transition-all duration-300 focus:outline-none focus:scale-[1.02] focus:ring-2 focus:ring-[#106a37]"
                            style={{
                              background: 'rgba(99, 102, 108, 0.3)',
                              border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}
                            placeholder="Sobrenome"
                            value={formData.sobrenome}
                            onChange={(e) => handleInputChange('sobrenome', e.target.value)}
                          />
                        </div>
                      </div>
                      
                      {/* Telefone */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-white">
                          Telefone Móvel *
                        </label>
                        <div className="relative group">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#106a37] h-4 w-4" />
                          <input
                            type="tel"
                            required
                            className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder-gray-400 transition-all duration-300 focus:outline-none focus:scale-[1.02] focus:ring-2 focus:ring-[#106a37]"
                            style={{
                              background: 'rgba(99, 102, 108, 0.3)',
                              border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}
                            placeholder="+258"
                            value={formData.telefone}
                            onChange={(e) => handleInputChange('telefone', e.target.value)}
                          />
                        </div>
                      </div>
                      
                      {/* Email */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-white">
                          Email *
                        </label>
                        <div className="relative group">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#106a37] h-4 w-4" />
                          <input
                            type="email"
                            required
                            className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder-gray-400 transition-all duration-300 focus:outline-none focus:scale-[1.02] focus:ring-2 focus:ring-[#106a37]"
                            style={{
                              background: 'rgba(99, 102, 108, 0.3)',
                              border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}
                            placeholder="seu@email.com"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                          />
                        </div>
                      </div>
                      
                      {/* Documento */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-white">
                          Nº Documento *
                        </label>
                        <div className="relative group">
                          <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#106a37] h-4 w-4" />
                          <input
                            type="text"
                            required
                            className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder-gray-400 transition-all duration-300 focus:outline-none focus:scale-[1.02] focus:ring-2 focus:ring-[#106a37]"
                            style={{
                              background: 'rgba(99, 102, 108, 0.3)',
                              border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}
                            placeholder="BI/Passaporte"
                            value={formData.numeroDocumento}
                            onChange={(e) => handleInputChange('numeroDocumento', e.target.value)}
                          />
                        </div>
                      </div>
                      
                      {/* Data Nascimento */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-white">
                          Data de Nascimento *
                        </label>
                        <div className="relative group">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#106a37] h-4 w-4" />
                          <input
                            type="date"
                            required
                            className="w-full pl-10 pr-4 py-3 rounded-xl text-white transition-all duration-300 focus:outline-none focus:scale-[1.02] focus:ring-2 focus:ring-[#106a37]"
                            style={{
                              background: 'rgba(99, 102, 108, 0.3)',
                              border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}
                            value={formData.dataNascimento}
                            onChange={(e) => handleInputChange('dataNascimento', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-1 h-8 bg-[#106a37] rounded-full" />
                      <h3 className="text-xl font-bold text-white">Dados da Empresa</h3>
                    </div>
                    
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Nacionalidade para Empresa */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-white">
                          Nacionalidade *
                        </label>
                        <div className="relative group">
                          <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#106a37] h-4 w-4 z-10" />
                          <select
                            required
                            className="w-full pl-10 pr-10 py-3 rounded-xl text-white transition-all duration-300 focus:outline-none focus:scale-[1.02] focus:ring-2 focus:ring-[#106a37] appearance-none cursor-pointer"
                            style={{
                              background: 'rgba(99, 102, 108, 0.5)',
                              border: '1px solid rgba(255, 255, 255, 0.2)'
                            }}
                            value={formData.nacionalidade}
                            onChange={(e) => handleInputChange('nacionalidade', e.target.value)}
                          >
                            {paises.map((pais, index) => (
                              <option 
                                key={index} 
                                value={pais.code}
                                style={{
                                  background: '#2d3748',
                                  color: 'white',
                                  padding: '8px'
                                }}
                              >
                                {pais.flag} {pais.name}
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2 z-10">
                            <span className="text-lg">{getPaisSelecionado().flag}</span>
                            <ChevronDown className="text-[#106a37] h-4 w-4" />
                          </div>
                        </div>
                      </div>

                      {/* Nome Empresa */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-white">
                          Nome da Empresa *
                        </label>
                        <div className="relative group">
                          <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#106a37] h-4 w-4" />
                          <input
                            type="text"
                            required
                            className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder-gray-400 transition-all duration-300 focus:outline-none focus:scale-[1.02] focus:ring-2 focus:ring-[#106a37]"
                            style={{
                              background: 'rgba(99, 102, 108, 0.3)',
                              border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}
                            placeholder="Nome da empresa"
                            value={formData.nomeEmpresa}
                            onChange={(e) => handleInputChange('nomeEmpresa', e.target.value)}
                          />
                        </div>
                      </div>
                      
                      {/* Número de Referência Fiscal */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-white">
                          Número de Referência Fiscal *
                        </label>
                        <div className="relative group">
                          <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#106a37] h-4 w-4" />
                          <input
                            type="text"
                            required
                            className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder-gray-400 transition-all duration-300 focus:outline-none focus:scale-[1.02] focus:ring-2 focus:ring-[#106a37]"
                            style={{
                              background: 'rgba(99, 102, 108, 0.3)',
                              border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}
                            placeholder="Número de referência fiscal"
                            value={formData.numeroReferenciaFiscal}
                            onChange={(e) => handleInputChange('numeroReferenciaFiscal', e.target.value)}
                          />
                        </div>
                      </div>

                      {/* Email */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-white">
                          Email *
                        </label>
                        <div className="relative group">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-[#106a37] h-4 w-4" />
                          <input
                            type="email"
                            required
                            className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder-gray-400 transition-all duration-300 focus:outline-none focus:scale-[1.02] focus:ring-2 focus:ring-[#106a37]"
                            style={{
                              background: 'rgba(99, 102, 108, 0.3)',
                              border: '1px solid rgba(255, 255, 255, 0.1)'
                            }}
                            placeholder="empresa@email.com"
                            value={formData.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="p-6 border-t" style={{ borderColor: 'rgba(16, 106, 55, 0.2)' }}>
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  className="px-8 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 border-2 font-semibold"
                  style={{
                    borderColor: '#63666c',
                    color: '#63666c',
                    background: 'rgba(99, 102, 108, 0.1)'
                  }}
                >
                  Cancelar
                </button>
                
                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowVehicleForm(true)}
                    className="px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center gap-3 group"
                    style={{
                      background: 'linear-gradient(135deg, #63666c, #4a4d52)',
                      color: 'white'
                    }}
                  >
                    <Car className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                    <span>Adicionar Veículo</span>
                  </button>
                  
                  <button
                    type="submit"
                    className="px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center gap-3 group"
                    style={{
                      background: 'linear-gradient(135deg, #106a37, #0d5a2d)',
                      color: 'white'
                    }}
                  >
                    <Save className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                    <span>{tipoCliente === 'Particular' ? 'Adicionar Cliente' : 'Adicionar Empresa'}</span>
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* FORMULÁRIO DE DADOS DA VIATURA */}
          {showVehicleForm && (
            <div 
              className="rounded-2xl border-2 transition-all duration-500 hover:shadow-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.05) 0%, rgba(99, 102, 108, 0.1) 100%)',
                borderColor: 'rgba(59, 130, 246, 0.2)',
                backdropFilter: 'blur(20px)'
              }}
            >
              <div className="p-6 border-b" style={{ borderColor: 'rgba(59, 130, 246, 0.2)' }}>
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-8 bg-blue-500 rounded-full" />
                  <h3 className="text-xl font-bold text-white">Dados da Viatura</h3>
                </div>
                
                {/* Seleção do Tipo de Cobertura */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white">
                      Tipo de Cobertura *
                    </label>
                    <div className="relative group">
                      <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 h-4 w-4 z-10" />
                      <select
                        required
                        className="w-full pl-10 pr-10 py-3 rounded-xl text-white transition-all duration-300 focus:outline-none focus:scale-[1.02] focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                        style={{
                          background: 'rgba(99, 102, 108, 0.5)',
                          border: '1px solid rgba(255, 255, 255, 0.2)'
                        }}
                        value={tipoCobertura}
                        onChange={(e) => setTipoCobertura(e.target.value)}
                      >
                        <option value="">- Selecionar Cobertura -</option>
                        <option value="DP_NORMAL">DP NORMAL - Danos Próprios com Franquia</option>
                        <option value="DP_SEM_FRANQUIA">DP SEM FRANQUIA - Danos Próprios sem Franquia</option>
                        <option value="RC_NORMAL">RC NORMAL - Apenas Responsabilidade Civil</option>
                        <option value="RC_OCUPANTES">RC & OCUPANTES - RC + Cobertura para Ocupantes</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 h-4 w-4 z-10" />
                    </div>
                  </div>

                  {/* Resumo da Cobertura Selecionada */}
                  {tipoCobertura && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-white">
                        Resumo da Cobertura
                      </label>
                      <div className="p-3 rounded-xl text-sm text-white"
                        style={{
                          background: 'rgba(59, 130, 246, 0.1)',
                          border: '1px solid rgba(59, 130, 246, 0.3)'
                        }}
                      >
                        <div className="font-semibold">{getConfigCobertura()?.nome}</div>
                        <div className="text-xs text-gray-300 mt-1">
                          Taxas Padrão: Ligeiro {getConfigCobertura()?.taxas.Ligeiro * 100}% | Pesado {getConfigCobertura()?.taxas.Pesado * 100}%
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Formulário de Dados do Veículo */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                  {/* Marca/Modelo */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white">
                      Marca / Modelo *
                    </label>
                    <div className="relative group">
                      <Type className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 h-4 w-4" />
                      <input
                        type="text"
                        required
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder-gray-400 transition-all duration-300 focus:outline-none focus:scale-[1.02] focus:ring-2 focus:ring-blue-500"
                        style={{
                          background: 'rgba(99, 102, 108, 0.3)',
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}
                        placeholder="Ex: Toyota Corolla"
                        value={veiculoAtual.marcaModelo}
                        onChange={(e) => handleVeiculoChange('marcaModelo', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Matrícula */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white">
                      Matrícula
                    </label>
                    <div className="relative group">
                      <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 h-4 w-4" />
                      <input
                        type="text"
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder-gray-400 transition-all duration-300 focus:outline-none focus:scale-[1.02] focus:ring-2 focus:ring-blue-500"
                        style={{
                          background: 'rgba(99, 102, 108, 0.3)',
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}
                        placeholder="Ex: AB-123-CD"
                        value={veiculoAtual.matricula}
                        onChange={(e) => handleVeiculoChange('matricula', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Ano */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white">
                      Ano
                    </label>
                    <div className="relative group">
                      <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 h-4 w-4" />
                      <input
                        type="number"
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder-gray-400 transition-all duration-300 focus:outline-none focus:scale-[1.02] focus:ring-2 focus:ring-blue-500"
                        style={{
                          background: 'rgba(99, 102, 108, 0.3)',
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}
                        placeholder="Ex: 2023"
                        value={veiculoAtual.ano}
                        onChange={(e) => handleVeiculoChange('ano', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Motor */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white">
                      Motor
                    </label>
                    <div className="relative group">
                      <Cog className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 h-4 w-4" />
                      <input
                        type="text"
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder-gray-400 transition-all duration-300 focus:outline-none focus:scale-[1.02] focus:ring-2 focus:ring-blue-500"
                        style={{
                          background: 'rgba(99, 102, 108, 0.3)',
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}
                        placeholder="Ex: 1.6L"
                        value={veiculoAtual.motor}
                        onChange={(e) => handleVeiculoChange('motor', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Chassis */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white">
                      Chassis
                    </label>
                    <div className="relative group">
                      <Barcode className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 h-4 w-4" />
                      <input
                        type="text"
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder-gray-400 transition-all duration-300 focus:outline-none focus:scale-[1.02] focus:ring-2 focus:ring-blue-500"
                        style={{
                          background: 'rgba(99, 102, 108, 0.3)',
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}
                        placeholder="Número do chassis"
                        value={veiculoAtual.chassis}
                        onChange={(e) => handleVeiculoChange('chassis', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Lotação */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white">
                      Lotação
                    </label>
                    <div className="relative group">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 h-4 w-4" />
                      <input
                        type="number"
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder-gray-400 transition-all duration-300 focus:outline-none focus:scale-[1.02] focus:ring-2 focus:ring-blue-500"
                        style={{
                          background: 'rgba(99, 102, 108, 0.3)',
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}
                        placeholder="Nº de passageiros"
                        value={veiculoAtual.lotacao}
                        onChange={(e) => handleVeiculoChange('lotacao', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Tipo de Viatura */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white">
                      Tipo de Viatura *
                    </label>
                    <div className="relative group">
                      <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 h-4 w-4 z-10" />
                      <select
                        required
                        className="w-full pl-10 pr-10 py-3 rounded-xl text-white transition-all duration-300 focus:outline-none focus:scale-[1.02] focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                        style={{
                          background: 'rgba(99, 102, 108, 0.5)',
                          border: '1px solid rgba(255, 255, 255, 0.2)'
                        }}
                        value={veiculoAtual.tipoViatura}
                        onChange={(e) => handleVeiculoChange('tipoViatura', e.target.value)}
                      >
                        <option value="">- Selecionar -</option>
                        <option value="Ligeiro">Ligeiro</option>
                        <option value="Pesado">Pesado</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 h-4 w-4 z-10" />
                    </div>
                  </div>

                  {/* Capital Seguro */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white">
                      Capital Seguro (MZN) *
                    </label>
                    <div className="relative group">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 h-4 w-4" />
                      <input
                        type="number"
                        required
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder-gray-400 transition-all duration-300 focus:outline-none focus:scale-[1.02] focus:ring-2 focus:ring-blue-500"
                        style={{
                          background: 'rgba(99, 102, 108, 0.3)',
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}
                        placeholder="Valor em MZN"
                        value={veiculoAtual.capitalSeguro}
                        onChange={(e) => handleVeiculoChange('capitalSeguro', e.target.value)}
                      />
                    </div>
                  </div>

                  {/* Seleção de Taxa */}
                  {veiculoAtual.tipoViatura && tipoCobertura && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-white">
                        Selecionar Taxa
                      </label>
                      <div className="relative group">
                        <Percent className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 h-4 w-4 z-10" />
                        <select
                          className="w-full pl-10 pr-10 py-3 rounded-xl text-white transition-all duration-300 focus:outline-none focus:scale-[1.02] focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer"
                          style={{
                            background: 'rgba(99, 102, 108, 0.5)',
                            border: '1px solid rgba(255, 255, 255, 0.2)'
                          }}
                          value={veiculoAtual.taxaSelecionada}
                          onChange={(e) => {
                            const novaTaxa = e.target.value;
                            
                            // Atualizar a taxa selecionada e recalcular imediatamente
                            setVeiculoAtual(prev => {
                              const novoEstado = { ...prev, taxaSelecionada: novaTaxa };
                              
                              // Recalcular prêmio imediatamente com a nova taxa
                              if (novoEstado.capitalSeguro && novoEstado.tipoViatura && tipoCobertura) {
                                const resultado = calcularPremio(
                                  novoEstado.capitalSeguro,
                                  novoEstado.tipoViatura,
                                  tipoCobertura,
                                  novaTaxa === '' ? null : novaTaxa
                                );
                                
                                return {
                                  ...novoEstado,
                                  taxa: resultado.taxa,
                                  premioAnnual: resultado.premioAnnual
                                };
                              }
                              
                              return novoEstado;
                            });
                          }}
                        >
                          <option value="">
                            Padrão ({formatarTaxa(getConfigCobertura()?.taxas[veiculoAtual.tipoViatura])})
                          </option>
                          {getTaxasDisponiveis().map((taxa, index) => (
                            <option 
                              key={index} 
                              value={taxa}
                              style={{
                                background: '#2d3748',
                                color: 'white'
                              }}
                            >
                              {formatarTaxa(taxa)}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-500 h-4 w-4 z-10" />
                      </div>
                      <div className="text-xs text-gray-400">
                        {veiculoAtual.taxaSelecionada ? 
                          `Taxa personalizada selecionada: ${formatarTaxa(veiculoAtual.taxaSelecionada)}` : 
                          `Usando taxa padrão: ${formatarTaxa(getConfigCobertura()?.taxas[veiculoAtual.tipoViatura])}`
                        }
                      </div>
                    </div>
                  )}

                  {/* Taxa Atual (Calculada Automaticamente) */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white">
                      Taxa Aplicada
                    </label>
                    <div className="relative group">
                      <Calculator className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 h-4 w-4" />
                      <input
                        type="text"
                        readOnly
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-white bg-gray-700 font-semibold"
                        style={{
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}
                        value={veiculoAtual.taxa ? `${(veiculoAtual.taxa * 100).toFixed(1)}%` : ''}
                      />
                    </div>
                  </div>

                  {/* Prémio Annual (Calculado Automaticamente) */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white">
                      Prémio Annual (MZN)
                    </label>
                    <div className="relative group">
                      <Calculator className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-500 h-4 w-4" />
                      <input
                        type="text"
                        readOnly
                        className="w-full pl-10 pr-4 py-3 rounded-xl text-white bg-gray-700 font-semibold"
                        style={{
                          border: '1px solid rgba(255, 255, 255, 0.1)'
                        }}
                        value={veiculoAtual.premioAnnual ? formatarMoeda(veiculoAtual.premioAnnual) : ''}
                      />
                    </div>
                    {veiculoAtual.premioAnnual && veiculoAtual.capitalSeguro && veiculoAtual.tipoViatura && tipoCobertura && (() => {
                      const config = getConfigCobertura();
                      const capital = parseFloat(veiculoAtual.capitalSeguro) || 0;
                      const taxa = veiculoAtual.taxa || config?.taxas[veiculoAtual.tipoViatura] || 0;
                      const premioCalculado = capital * taxa;
                      const premioMinimo = config?.premioMinimo[veiculoAtual.tipoViatura] || 0;
                      const premioFinal = parseFloat(veiculoAtual.premioAnnual);
                      
                      return (
                        <div className="text-xs text-gray-400">
                          {premioFinal === premioMinimo && premioCalculado < premioMinimo ? 
                            `* Aplicado prémio mínimo (Calculado: ${formatarMoeda(premioCalculado)})` : 
                            `Calculado: ${formatarMoeda(capital)} × ${(taxa * 100).toFixed(1)}% = ${formatarMoeda(premioCalculado)}`
                          }
                        </div>
                      );
                    })()}
                  </div>
                </div>

                {/* Botão para Adicionar Veículo */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={adicionarVeiculo}
                    className="px-6 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center gap-3 group"
                    style={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: 'white'
                    }}
                  >
                    <Car className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                    <span>Adicionar Veículo à Lista</span>
                  </button>
                </div>
              </div>

              {/* Lista de Veículos Adicionados */}
              {veiculos.length > 0 && (
                <div className="p-6 border-t" style={{ borderColor: 'rgba(59, 130, 246, 0.2)' }}>
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-1 h-6 bg-green-500 rounded-full" />
                    <h4 className="text-lg font-bold text-white">Veículos Adicionados</h4>
                    <span className="px-2 py-1 bg-green-500 text-white text-sm rounded-full">
                      {veiculos.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {veiculos.map((veiculo) => (
                      <div
                        key={veiculo.id}
                        className="p-4 rounded-xl flex justify-between items-center transition-all duration-300 hover:scale-[1.02]"
                        style={{
                          background: 'rgba(16, 185, 129, 0.1)',
                          border: '1px solid rgba(16, 185, 129, 0.3)'
                        }}
                      >
                        <div>
                          <div className="font-semibold text-white">
                            {veiculo.marcaModelo} • {veiculo.tipoViatura}
                          </div>
                          <div className="text-sm text-gray-300">
                            Capital: MZN {parseFloat(veiculo.capitalSeguro).toLocaleString('pt-MZ')} • 
                            Taxa: {(veiculo.taxaUsada * 100).toFixed(1)}% • 
                            Prémio: MZN {parseFloat(veiculo.premioAnnual).toLocaleString('pt-MZ', { minimumFractionDigits: 2 })}
                          </div>
                        </div>
                        <button
                          type="button"
                          onClick={() => removerVeiculo(veiculo.id)}
                          className="px-3 py-1 rounded-lg text-red-400 hover:text-red-300 transition-colors duration-300"
                          style={{
                            background: 'rgba(239, 68, 68, 0.1)',
                            border: '1px solid rgba(239, 68, 68, 0.3)'
                          }}
                        >
                          Remover
                        </button>
                      </div>
                    ))}
                  </div>

                  {/* Total do Prémio */}
                  <div className="mt-6 p-4 rounded-xl text-center"
                    style={{
                      background: 'rgba(59, 130, 246, 0.1)',
                      border: '1px solid rgba(59, 130, 246, 0.3)'
                    }}
                  >
                    <div className="text-lg font-bold text-white">
                      Total do Prémio Anual: {formatarMoeda(calcularTotalPremio())}
                    </div>
                    <div className="text-sm text-gray-300 mt-1">
                      {veiculos.length} veículo(s) adicionado(s)
                    </div>
                  </div>

                  {/* Botão para Processar Pagamento */}
                  <div className="mt-6 flex justify-center">
                    <button
                      type="button"
                      onClick={() => setMostrarPagamento(true)}
                      className="px-8 py-4 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center gap-3 group"
                      style={{
                        background: 'linear-gradient(135deg, #8b5cf6, #7c3aed)',
                        color: 'white'
                      }}
                    >
                      <CreditCard className="h-6 w-6 transition-transform duration-300 group-hover:scale-110" />
                      <span className="text-lg">Processar Pagamento</span>
                    </button>
                  </div>
                </div>
              )}

              {/* Botões de Ação do Formulário da Viatura */}
              <div className="p-6 border-t" style={{ borderColor: 'rgba(59, 130, 246, 0.2)' }}>
                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setShowVehicleForm(false)}
                    className="px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 border-2 font-semibold"
                    style={{
                      borderColor: '#63666c',
                      color: '#63666c',
                      background: 'rgba(99, 102, 108, 0.1)'
                    }}
                  >
                    Fechar Formulário
                  </button>
                  
                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setVeiculos([]);
                        setVeiculoAtual({
                          marcaModelo: '',
                          matricula: '',
                          ano: '',
                          motor: '',
                          chassis: '',
                          lotacao: '',
                          tipoViatura: '',
                          capitalSeguro: '',
                          taxa: '',
                          taxaSelecionada: '',
                          premioAnnual: ''
                        });
                        setTipoCobertura('');
                      }}
                      className="px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 border-2 font-semibold"
                      style={{
                        borderColor: '#ef4444',
                        color: '#ef4444',
                        background: 'rgba(239, 68, 68, 0.1)'
                      }}
                    >
                      Limpar Tudo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FORMULÁRIO DE PAGAMENTO */}
          {mostrarPagamento && veiculos.length > 0 && (
            <div 
              className="rounded-2xl border-2 transition-all duration-500 hover:shadow-2xl overflow-hidden"
              style={{
                background: 'linear-gradient(135deg, rgba(139, 92, 246, 0.05) 0%, rgba(99, 102, 108, 0.1) 100%)',
                borderColor: 'rgba(139, 92, 246, 0.2)',
                backdropFilter: 'blur(20px)'
              }}
            >
              <div className="p-6 border-b" style={{ borderColor: 'rgba(139, 92, 246, 0.2)' }}>
                <div className="flex items-center gap-3 mb-6">
                  <div className="w-1 h-8 bg-purple-500 rounded-full" />
                  <h3 className="text-xl font-bold text-white">Processar Pagamento</h3>
                </div>

                {/* Resumo do Valor */}
                <div className="mb-6 p-4 rounded-xl text-center"
                  style={{
                    background: 'rgba(139, 92, 246, 0.1)',
                    border: '1px solid rgba(139, 92, 246, 0.3)'
                  }}
                >
                  <div className="text-2xl font-bold text-white mb-2">
                    {formatarMoeda(calcularTotalPremio())}
                  </div>
                  <div className="text-sm text-gray-300">
                    Total a pagar por {veiculos.length} veículo(s)
                  </div>
                </div>

                {/* Forma de Pagamento */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-white">
                      Forma de Pagamento *
                    </label>
                    <div className="relative group">
                      <CreditCard className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500 h-4 w-4 z-10" />
                      <select
                        required
                        className="w-full pl-10 pr-10 py-3 rounded-xl text-white transition-all duration-300 focus:outline-none focus:scale-[1.02] focus:ring-2 focus:ring-purple-500 appearance-none cursor-pointer"
                        style={{
                          background: 'rgba(99, 102, 108, 0.5)',
                          border: '1px solid rgba(255, 255, 255, 0.2)'
                        }}
                        value={formaPagamento}
                        onChange={(e) => setFormaPagamento(e.target.value)}
                      >
                        <option value="">- Selecionar -</option>
                        <option value="M-PESA">M-PESA (Vodacom)</option>
                        <option value="E-MOLA">E-MOLA (Movitel)</option>
                        <option value="NUMERARIO">Numerário</option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-purple-500 h-4 w-4 z-10" />
                    </div>
                  </div>

                  {/* Campo de Contacto para M-PESA */}
                  {formaPagamento === 'M-PESA' && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-white">
                        Contacto Vodacom *
                      </label>
                      <div className="relative group">
                        <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500 h-4 w-4" />
                        <input
                          type="tel"
                          required
                          className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder-gray-400 transition-all duration-300 focus:outline-none focus:scale-[1.02] focus:ring-2 focus:ring-purple-500"
                          style={{
                            background: 'rgba(99, 102, 108, 0.3)',
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                          }}
                          placeholder="+258 8X XXX XXXX"
                          value={contactoMPesa}
                          onChange={(e) => setContactoMPesa(e.target.value)}
                        />
                      </div>
                    </div>
                  )}

                  {/* Campo de Contacto para E-MOLA */}
                  {formaPagamento === 'E-MOLA' && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-white">
                        Contacto Movitel *
                      </label>
                      <div className="relative group">
                        <Smartphone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500 h-4 w-4" />
                        <input
                          type="tel"
                          required
                          className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder-gray-400 transition-all duration-300 focus:outline-none focus:scale-[1.02] focus:ring-2 focus:ring-purple-500"
                          style={{
                            background: 'rgba(99, 102, 108, 0.3)',
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                          }}
                          placeholder="+258 8X XXX XXXX"
                          value={contactoEMola}
                          onChange={(e) => setContactoEMola(e.target.value)}
                        />
                      </div>
                    </div>
                  )}
                </div>

                {/* Campo PIN para M-PESA e E-MOLA */}
                {(formaPagamento === 'M-PESA' || formaPagamento === 'E-MOLA') && (
                  <div className="mb-6">
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-white">
                        PIN de Autorização *
                      </label>
                      <div className="relative group">
                        <Wallet className="absolute left-3 top-1/2 transform -translate-y-1/2 text-purple-500 h-4 w-4" />
                        <input
                          type="password"
                          required
                          className="w-full pl-10 pr-4 py-3 rounded-xl text-white placeholder-gray-400 transition-all duration-300 focus:outline-none focus:scale-[1.02] focus:ring-2 focus:ring-purple-500"
                          style={{
                            background: 'rgba(99, 102, 108, 0.3)',
                            border: '1px solid rgba(255, 255, 255, 0.1)'
                          }}
                          placeholder="Digite o PIN"
                          value={pinPagamento}
                          onChange={(e) => setPinPagamento(e.target.value)}
                          maxLength={4}
                        />
                      </div>
                      <div className="text-xs text-gray-400">
                        Digite o PIN do seu {formaPagamento === 'M-PESA' ? 'M-PESA' : 'E-MOLA'}
                      </div>
                    </div>
                  </div>
                )}

                {/* Botões de Ação do Pagamento */}
                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setMostrarPagamento(false)}
                    className="px-6 py-3 rounded-xl transition-all duration-300 transform hover:scale-105 border-2 font-semibold"
                    style={{
                      borderColor: '#63666c',
                      color: '#63666c',
                      background: 'rgba(99, 102, 108, 0.1)'
                    }}
                  >
                    Voltar
                  </button>
                  
                  <button
                    type="button"
                    onClick={processarPagamento}
                    disabled={processandoPagamento}
                    className="px-8 py-3 rounded-xl font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-2xl flex items-center gap-3 group disabled:opacity-50 disabled:cursor-not-allowed"
                    style={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      color: 'white'
                    }}
                  >
                    {processandoPagamento ? (
                      <>
                        <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                        <span>Processando...</span>
                      </>
                    ) : (
                      <>
                        <CreditCard className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                        <span>Confirmar Pagamento</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          )}
        </form>
      </div>
    </div>
  );
}

export default CriarCliente;