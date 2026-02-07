import React, { useState, useEffect, useRef } from "react";
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
  Download,
  Send,
  X,
  Printer,
  Eye,
  Upload,
  File,
  Loader2,
} from "lucide-react";
import { jsPDF } from "jspdf";
import emailjs from "@emailjs/browser";
import { cotacaoService } from "../services/api";

function CriarCliente() {
  const [tipoCliente, setTipoCliente] = useState("Particular");
  const [isSwitching, setIsSwitching] = useState(false);
  const [showVehicleForm, setShowVehicleForm] = useState(false);
  const [mostrarOpcoesPartilha, setMostrarOpcoesPartilha] = useState(false);
  const [cotacaoGerada, setCotacaoGerada] = useState(null);
  const [enviandoEmail, setEnviandoEmail] = useState(false);
  const [salvandoCotacao, setSalvandoCotacao] = useState(false);
  const [debitoDiretoAtivo, setDebitoDiretoAtivo] = useState(false);
  const [showMatriculaOptions, setShowMatriculaOptions] = useState(false);
  const [paisMatricula, setPaisMatricula] = useState("");
  const [formatoMatricula, setFormatoMatricula] = useState("");
  
  // Estados para upload de documentos
  const [docBI, setDocBI] = useState(null);
  const [docLivrete, setDocLivrete] = useState(null);
  const [previewBI, setPreviewBI] = useState(null);
  const [previewLivrete, setPreviewLivrete] = useState(null);

  // Estados para o formulário da viatura
  const [tipoCobertura, setTipoCobertura] = useState("");
  const [classificacao, setClassificacao] = useState("");
  const [veiculos, setVeiculos] = useState([]);
  const [veiculoAtual, setVeiculoAtual] = useState({
    marca: "",
    modelo: "",
    matricula: "",
    matriculaCompleta: "",
    ano: "",
    motor: "",
    chassis: "",
    lotacao: "",
    capitalSeguro: "",
    taxa: "",
    premioAnnual: "",
    premioSemestral: "",
    premioTrimestral: "",
    premioMensal: "",
    premioMinimo: "",
    taxaAplicada: "",
  });

  const [formData, setFormData] = useState({
    nacionalidade: "MZ",
    tituloContato: "",
    primeiroNome: "",
    sobrenome: "",
    telefone: "+258",
    email: "",
    numeroDocumento: "",
    dataNascimento: "",
    nomeEmpresa: "",
    numeroReferenciaFiscal: "",
  });

  // Configuração do EmailJS
  const EMAILJS_CONFIG = {
    SERVICE_ID: "service_i20ww7m",
    TEMPLATE_ID: "template_nv37m8h",
    PUBLIC_KEY: "fDnSvK3wOFUgLLuVK",
  };

  // Configurações das coberturas baseadas na tabela fornecida
  const configCoberturas = {
    "Seguro Automóvel Responsabilidade Civil Apenas": {
      nome: "Seguro Automóvel Responsabilidade Civil Apenas",
      classificacoes: [
        {
          nome: "Ligeiro Peso Bruto Total Até 3.500 kg",
          taxa: 0,
          premioMinimo: 2999
        },
        {
          nome: "Pesado Médio - Peso Bruto Total Entre 3.501 kg a 12.000 kg",
          taxa: 0,
          premioMinimo: 5999
        },
        {
          nome: "Pesado Grande - Peso Bruto Total Entre 12.001 kg a 26.000 kg",
          taxa: 0,
          premioMinimo: 6999
        },
        {
          nome: "Muito Pesado (articulado) - Acima de 26.000 kg (com reboque ou semi-reboque)",
          taxa: 0,
          premioMinimo: 8500
        },
        {
          nome: "Viaturas Especias (Motorizadas)",
          taxa: 0,
          premioMinimo: 2500
        },
        {
          nome: "Viaturas Especias (Atrelados Domesticos)",
          taxa: 0,
          premioMinimo: 2500
        },
        {
          nome: "Viaturas Especias (Atrelados Comerciais)",
          taxa: 0,
          premioMinimo: 3000
        }
      ],
      coberturas: {
        responsabilidadeCivil: 5000000,
        morteInvalidez: 0,
        despesasMedicas: 0,
        despesasFuneral: 0,
      },
    },
    "Seguro Automóvel Responsabilidade Civil & Ocupantes": {
      nome: "Seguro Automóvel Responsabilidade Civil & Ocupantes",
      classificacoes: [
        {
          nome: "Ligeiro Peso Bruto Total Até 3.500 kg",
          taxa: 0,
          premioMinimo: 3500
        },
        {
          nome: "Pesado Médio - Peso Bruto Total Entre 3.501 kg a 12.000 kg",
          taxa: 0,
          premioMinimo: 6750
        },
        {
          nome: "Pesado Grande - Peso Bruto Total Entre 12.001 kg a 26.000 kg",
          taxa: 0,
          premioMinimo: 6999
        },
        {
          nome: "Muito Pesado (articulado) - Acima de 26.000 kg (com reboque ou semi-reboque)",
          taxa: 0,
          premioMinimo: 8500
        }
      ],
      coberturas: {
        responsabilidadeCivil: 5000000,
        morteInvalidez: 100000,
        despesasMedicas: 20000,
        despesasFuneral: 5000,
      },
    },
    "Seguro de Transporte Público": {
      nome: "Seguro de Transporte Público",
      classificacoes: [
        {
          nome: "Lotação até 29 Passageiros (Incluindo Motorista e Cobrador)",
          taxa: 0,
          premioMinimo: 15750
        },
        {
          nome: "Lotação até 15 Passageiros (Incluindo Motorista e Cobrador)",
          taxa: 0,
          premioMinimo: 9250
        },
        {
          nome: "Taxis / Yango",
          taxa: 0,
          premioMinimo: 5000
        }
      ],
      coberturas: {
        responsabilidadeCivil: 10000000,
        morteInvalidez: 150000,
        despesasMedicas: 50000,
        despesasFuneral: 10000,
      },
    },
    "Seguro Automóvel Todos os Riscos": {
      nome: "Seguro Automóvel Todos os Riscos",
      classificacoes: [
        {
          nome: "Ligeiro Peso Bruto Total Até 3.500 kg",
          taxa: 0.04,
          premioMinimo: 12000
        },
        {
          nome: "Pesado Médio - Peso Bruto Total Entre 3.501 kg a 12.000 kg",
          taxa: 0.05,
          premioMinimo: 12000
        },
        {
          nome: "Pesado Grande - Peso Bruto Total Entre 12.001 kg a 26.000 kg",
          taxa: 0.06,
          premioMinimo: 12000
        },
        {
          nome: "Muito Pesado (articulado) - Acima de 26.000 kg (com reboque ou semi-reboque)",
          taxa: 0.075,
          premioMinimo: 15000
        },
        {
          nome: "Ligeiro Matrícula Estrangeira (Ligeiro Peso Bruto Total Até 3.500 kg)",
          taxa: 0.045,
          premioMinimo: 12000
        },
        {
          nome: "Viaturas Especias (Motorizadas)",
          taxa: 0.03,
          premioMinimo: 8000
        },
        {
          nome: "Viaturas Especias (Atrelados Domesticos)",
          taxa: 0.025,
          premioMinimo: 8000
        },
        {
          nome: "Viaturas Especias (Atrelados Comerciais)",
          taxa: 0.03,
          premioMinimo: 8000
        },
        {
          nome: "Txopelas",
          taxa: 0.04,
          premioMinimo: 10000
        }
      ],
      coberturas: {
        responsabilidadeCivil: 10000000,
        morteInvalidez: 250000,
        despesasMedicas: 100000,
        despesasFuneral: 25000,
        perdaChaves: 55000,
        remocaoSalvados: 75000,
        danosProprios: "Cobertura Completa",
      },
    },
  };

  // Configurações de matrículas por país
  const formatosMatricula = {
    "Moçambique": {
      formato: "XXX-000-XX",
      exemplo: "ABC-123-DE",
      regex: /^[A-Z]{3}-[0-9]{3}-[A-Z]{2}$/,
      placeholder: "ABC-123-DE",
      descricao: "3 letras, 3 números, 2 letras",
      mascara: (valor) => {
        let v = valor.replace(/[^A-Z0-9]/gi, '').toUpperCase();
        if (v.length > 8) v = v.substring(0, 8);
        let result = '';
        for (let i = 0; i < v.length; i++) {
          if (i === 3 || i === 6) result += '-';
          if (i < 3) {
            result += /[A-Z]/.test(v[i]) ? v[i] : '';
          } else if (i < 6) {
            result += /[0-9]/.test(v[i]) ? v[i] : '';
          } else {
            result += /[A-Z]/.test(v[i]) ? v[i] : '';
          }
        }
        return result;
      }
    },
    "África do Sul": {
      formato: "XXX-000-GP",
      exemplo: "ABC-123-GP",
      regex: /^[A-Z]{3}-[0-9]{3}-(GP|EC|FS|KZN|MP|NC|NW|WC)$/,
      placeholder: "ABC-123-GP",
      descricao: "3 letras, 3 números, código província",
      mascara: (valor) => {
        let v = valor.replace(/[^A-Z0-9]/gi, '').toUpperCase();
        if (v.length > 9) v = v.substring(0, 9);
        let result = '';
        for (let i = 0; i < v.length; i++) {
          if (i === 3 || i === 6) result += '-';
          if (i < 3) {
            result += /[A-Z]/.test(v[i]) ? v[i] : '';
          } else if (i < 6) {
            result += /[0-9]/.test(v[i]) ? v[i] : '';
          } else {
            result += /[A-Z]/.test(v[i]) ? v[i] : '';
          }
        }
        return result;
      }
    },
    "KZN (KwaZulu-Natal)": {
      formato: "XXX-000-ZN",
      exemplo: "ABC-123-ZN",
      regex: /^[A-Z]{3}-[0-9]{3}-ZN$/,
      placeholder: "ABC-123-ZN",
      descricao: "3 letras, 3 números, ZN",
      mascara: (valor) => {
        let v = valor.replace(/[^A-Z0-9]/gi, '').toUpperCase();
        if (v.length > 8) v = v.substring(0, 8);
        let result = '';
        for (let i = 0; i < v.length; i++) {
          if (i === 3 || i === 6) result += '-';
          if (i < 3) {
            result += /[A-Z]/.test(v[i]) ? v[i] : '';
          } else if (i < 6) {
            result += /[0-9]/.test(v[i]) ? v[i] : '';
          } else {
            result += /[A-Z]/.test(v[i]) ? v[i] : '';
          }
        }
        if (result.length === 8 && !result.endsWith('ZN')) {
          result = result.substring(0, 7) + 'Z';
        }
        return result;
      }
    },
    "Antiga (CA)": {
      formato: "CA-00000",
      exemplo: "CA-12345",
      regex: /^CA-[0-9]{5}$/,
      placeholder: "CA-12345",
      descricao: "CA seguido de 5 números",
      mascara: (valor) => {
        let v = valor.replace(/[^A-Z0-9]/gi, '').toUpperCase();
        if (v.length > 7) v = v.substring(0, 7);
        let result = '';
        if (v.startsWith('CA')) {
          result = 'CA-';
          v = v.substring(2);
        } else if (v.startsWith('C')) {
          result = 'C';
          v = v.substring(1);
        } else {
          result = '';
        }
        for (let i = 0; i < v.length && i < 5; i++) {
          result += /[0-9]/.test(v[i]) ? v[i] : '';
        }
        if (result.startsWith('C') && !result.startsWith('CA-')) {
          result = 'CA-' + result.substring(1);
        } else if (!result.startsWith('CA-')) {
          result = 'CA-' + result;
        }
        return result;
      }
    },
    "Eswatini (Suazilândia)": {
      formato: "XSD-000-YZ",
      exemplo: "XSD-123-YZ",
      regex: /^XSD-[0-9]{3}-[A-Z]{2}$/,
      placeholder: "XSD-123-YZ",
      descricao: "XSD, 3 números, 2 letras",
      mascara: (valor) => {
        let v = valor.replace(/[^A-Z0-9]/gi, '').toUpperCase();
        if (v.length > 8) v = v.substring(0, 8);
        let result = '';
        if (v.startsWith('XSD')) {
          result = 'XSD-';
          v = v.substring(3);
        } else if (v.startsWith('XS')) {
          result = 'XS';
          v = v.substring(2);
        } else if (v.startsWith('X')) {
          result = 'X';
          v = v.substring(1);
        } else {
          result = '';
        }
        for (let i = 0; i < v.length; i++) {
          if (i === 3) result += '-';
          if (i < 3) {
            result += /[0-9]/.test(v[i]) ? v[i] : '';
          } else {
            result += /[A-Z]/.test(v[i]) ? v[i] : '';
          }
        }
        if (result.startsWith('X') && !result.startsWith('XSD-')) {
          result = 'XSD-' + result.substring(1);
        } else if (!result.startsWith('XSD-')) {
          result = 'XSD-' + result;
        }
        return result;
      }
    },
    "Zimbábue": {
      formato: "XXX-0000",
      exemplo: "ABC-1234",
      regex: /^[A-Z]{3}-[0-9]{4}$/,
      placeholder: "ABC-1234",
      descricao: "3 letras, 4 números",
      mascara: (valor) => {
        let v = valor.replace(/[^A-Z0-9]/gi, '').toUpperCase();
        if (v.length > 7) v = v.substring(0, 7);
        let result = '';
        for (let i = 0; i < v.length; i++) {
          if (i === 3) result += '-';
          if (i < 3) {
            result += /[A-Z]/.test(v[i]) ? v[i] : '';
          } else {
            result += /[0-9]/.test(v[i]) ? v[i] : '';
          }
        }
        return result;
      }
    },
    "Malawi": {
      formato: "XX-0000",
      exemplo: "AB-1234",
      regex: /^[A-Z]{2}-[0-9]{4}$/,
      placeholder: "AB-1234",
      descricao: "2 letras, 4 números",
      mascara: (valor) => {
        let v = valor.replace(/[^A-Z0-9]/gi, '').toUpperCase();
        if (v.length > 6) v = v.substring(0, 6);
        let result = '';
        for (let i = 0; i < v.length; i++) {
          if (i === 2) result += '-';
          if (i < 2) {
            result += /[A-Z]/.test(v[i]) ? v[i] : '';
          } else {
            result += /[0-9]/.test(v[i]) ? v[i] : '';
          }
        }
        return result;
      }
    },
    "Zâmbia": {
      formato: "XXX-000",
      exemplo: "ABC-123",
      regex: /^[A-Z]{3}-[0-9]{3}$/,
      placeholder: "ABC-123",
      descricao: "3 letras, 3 números",
      mascara: (valor) => {
        let v = valor.replace(/[^A-Z0-9]/gi, '').toUpperCase();
        if (v.length > 6) v = v.substring(0, 6);
        let result = '';
        for (let i = 0; i < v.length; i++) {
          if (i === 3) result += '-';
          if (i < 3) {
            result += /[A-Z]/.test(v[i]) ? v[i] : '';
          } else {
            result += /[0-9]/.test(v[i]) ? v[i] : '';
          }
        }
        return result;
      }
    },
    "Outros": {
      formato: "Livre",
      exemplo: "Qualquer formato",
      regex: /^.+$/,
      placeholder: "Digite a matrícula",
      descricao: "Formato livre",
      mascara: (valor) => valor.toUpperCase()
    }
  };

  const titulosContato = ["Sr.", "Sra.", "Dr.", "Dra.", "Eng.", "Arq."];

  const paises = [
    { code: "MZ", name: "Moçambique", flag: "🇲🇿" },
    { code: "AO", name: "Angola", flag: "🇦🇴" },
    { code: "PT", name: "Portugal", flag: "🇵🇹" },
    { code: "BR", name: "Brasil", flag: "🇧🇷" },
    { code: "CV", name: "Cabo Verde", flag: "🇨🇻" },
  ];

  // Função para verificar se deve mostrar o campo trimestral (sempre que capital > 12000)
  const deveMostrarTrimestral = (capital) => {
    const capitalNum = parseFloat(capital) || 0;
    return capitalNum > 12000;
  };

  // Função para verificar se deve mostrar o campo mensal (só quando débito direto ativo E capital > 12000)
  const deveMostrarMensal = (capital, debitoDireto) => {
    const capitalNum = parseFloat(capital) || 0;
    return debitoDireto && capitalNum > 12000;
  };

  // Função para selecionar o país da matrícula
  const selecionarPaisMatricula = (pais) => {
    setPaisMatricula(pais);
    setFormatoMatricula(formatosMatricula[pais]);
    setShowMatriculaOptions(false);
    
    // Resetar a matrícula quando mudar de país
    setVeiculoAtual(prev => ({
      ...prev,
      matricula: "",
      matriculaCompleta: ""
    }));
  };

  // Função para formatar a matrícula conforme o país selecionado
  const formatarMatricula = (valor) => {
    if (!paisMatricula || paisMatricula === "Outros") {
      return valor.toUpperCase();
    }
    
    const formato = formatosMatricula[paisMatricula];
    if (!formato || !formato.mascara) {
      return valor.toUpperCase();
    }
    
    return formato.mascara(valor);
  };

  // Handler para mudança na matrícula
  const handleMatriculaChange = (valor) => {
    const formatada = formatarMatricula(valor);
    
    setVeiculoAtual(prev => ({
      ...prev,
      matricula: formatada,
      matriculaCompleta: paisMatricula ? `${paisMatricula} — ${formatada}` : formatada
    }));
  };

  // Validar matrícula
  const validarMatricula = () => {
    if (!veiculoAtual.matricula || !paisMatricula) return true;
    
    if (paisMatricula === "Outros") return true;
    
    const formato = formatosMatricula[paisMatricula];
    if (!formato || !formato.regex) return true;
    
    return formato.regex.test(veiculoAtual.matricula);
  };

  // Obter classificações disponíveis para a cobertura selecionada
  const getClassificacoesDisponiveis = () => {
    if (!tipoCobertura || !configCoberturas[tipoCobertura]) return [];
    return configCoberturas[tipoCobertura].classificacoes;
  };

  // Obter configuração da classificação selecionada
  const getClassificacaoConfig = () => {
    if (!tipoCobertura || !classificacao || !configCoberturas[tipoCobertura]) 
      return null;
    
    return configCoberturas[tipoCobertura].classificacoes.find(
      c => c.nome === classificacao
    );
  };

  // Calcular prêmio baseado na configuração
  const calcularPremio = () => {
    const classificacaoConfig = getClassificacaoConfig();
    const capital = parseFloat(veiculoAtual.capitalSeguro) || 0;
    
    if (!classificacaoConfig || capital === 0) {
      return {
        taxa: 0,
        premioAnnual: "0.00",
        premioSemestral: "0.00",
        premioTrimestral: "0.00",
        premioMensal: "0.00",
        premioMinimo: classificacaoConfig?.premioMinimo || 0,
        taxaAplicada: "0%"
      };
    }

    let taxa = classificacaoConfig.taxa;
    let taxaAplicada = taxa > 0 ? `${(taxa * 100).toFixed(2)}%` : "Taxa Fixa";
    
    // Calcular prêmio base
    let premioCalculado = 0;
    
    if (taxa > 0) {
      // Para coberturas com taxa, calcular baseado no capital seguro
      premioCalculado = capital * taxa;
    } else {
      // Para coberturas sem taxa, usar prêmio mínimo fixo
      premioCalculado = classificacaoConfig.premioMinimo;
    }

    // Aplicar prêmio mínimo se necessário
    const premioMinimo = classificacaoConfig.premioMinimo || 0;
    let premioFinal = Math.max(premioCalculado, premioMinimo);
    let premioSemestral = (premioFinal / 2).toFixed(2);
    
    // Calcular prêmio trimestral sempre quando capital > 12000
    let premioTrimestral = "0.00";
    const capitalNum = parseFloat(veiculoAtual.capitalSeguro) || 0;
    const mostrarTrimestral = capitalNum > 12000;
    
    if (mostrarTrimestral) {
      premioTrimestral = (premioFinal / 4).toFixed(2);
    }
    
    // Calcular prêmio mensal só quando débito direto ativo E capital > 12000
    let premioMensal = "0.00";
    const mostrarMensal = debitoDiretoAtivo && capitalNum > 12000;
    
    if (mostrarMensal) {
      premioMensal = (premioFinal / 12).toFixed(2); // 12 meses no ano
    }
    
    // Aplicar taxa de débito direto se ativo (multiplicar os prêmios por 15%)
    if (debitoDiretoAtivo) {
      premioFinal = premioFinal * 1.15;
      premioSemestral = (premioFinal / 2).toFixed(2);
      
      if (mostrarTrimestral) {
        premioTrimestral = (premioFinal / 4).toFixed(2);
      }
      
      if (mostrarMensal) {
        premioMensal = (premioFinal / 12).toFixed(2);
      }
      
      // Manter a taxa aplicada original da classificação, mas indicar débito direto
      taxaAplicada = `${(taxa * 100).toFixed(2)}% + 15% (Débito Direto)`;
    }

    return {
      taxa: taxa,
      premioAnnual: premioFinal.toFixed(2),
      premioSemestral: premioSemestral,
      premioTrimestral: premioTrimestral,
      premioMensal: premioMensal,
      premioMinimo: premioMinimo,
      taxaAplicada: taxaAplicada
    };
  };

  // Atualizar cálculo do prêmio quando houver mudanças
  useEffect(() => {
    if (veiculoAtual.capitalSeguro && tipoCobertura && classificacao) {
      const resultado = calcularPremio();
      
      setVeiculoAtual((prev) => ({
        ...prev,
        taxa: resultado.taxa,
        premioAnnual: resultado.premioAnnual,
        premioSemestral: resultado.premioSemestral,
        premioTrimestral: resultado.premioTrimestral,
        premioMensal: resultado.premioMensal,
        premioMinimo: resultado.premioMinimo,
        taxaAplicada: resultado.taxaAplicada
      }));
    }
  }, [veiculoAtual.capitalSeguro, tipoCobertura, classificacao, debitoDiretoAtivo]);

  // Resetar classificação quando mudar o tipo de cobertura
  useEffect(() => {
    setClassificacao("");
    setVeiculoAtual(prev => ({
      ...prev,
      taxa: "",
      premioAnnual: "",
      premioSemestral: "",
      premioTrimestral: "",
      premioMensal: "",
      premioMinimo: "",
      taxaAplicada: ""
    }));
  }, [tipoCobertura]);

  // Handlers para upload de documentos
  const handleFileUpload = (file, type) => {
    if (!file) return;
    
    const validTypes = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
    if (!validTypes.includes(file.type)) {
      alert('Por favor, envie apenas arquivos PDF ou imagem (JPG, PNG)');
      return;
    }
    
    const maxSize = 5 * 1024 * 1024; // 5MB
    if (file.size > maxSize) {
      alert('O arquivo é muito grande. Tamanho máximo: 5MB');
      return;
    }
    
    if (type === 'bi') {
      setDocBI(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewBI(reader.result);
      };
      reader.readAsDataURL(file);
    } else if (type === 'livrete') {
      setDocLivrete(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setPreviewLivrete(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const removerDocumento = (type) => {
    if (type === 'bi') {
      setDocBI(null);
      setPreviewBI(null);
    } else if (type === 'livrete') {
      setDocLivrete(null);
      setPreviewLivrete(null);
    }
  };

  // Função para calcular total do prêmio
  const calcularTotalPremio = () => {
    return veiculos.reduce(
      (total, veiculo) => total + (parseFloat(veiculo.premioAnnual) || 0),
      0
    );
  };

  // Função para verificar se deve mostrar opção trimestral e mensal no total
  const deveMostrarCamposEspeciaisNoTotal = () => {
    const total = calcularTotalPremio();
    return total > 15000;
  };

  // Formatar moeda
  const formatarMoeda = (valor) => {
    if (!valor || valor === "0.00") return "MT 0,00";
    return `MT ${parseFloat(valor).toLocaleString("pt-MZ", {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    })}`;
  };

  // FUNÇÃO PARA GERAR PDF (mantida do código original)
  const gerarPDFBlob = () => {
    if (!cotacaoGerada) return null;

    const doc = new jsPDF();

    let yPosition = 20;
    const pageHeight = doc.internal.pageSize.height;
    const margin = 20;
    const lineHeight = 7;

    const checkPageBreak = (heightNeeded) => {
      if (yPosition + heightNeeded > pageHeight - margin) {
        doc.addPage();
        yPosition = margin;
      }
    };

    // Cabeçalho
    doc.setFillColor(0, 82, 155);
    doc.rect(0, 0, 210, 50, "F");

    doc.setFillColor(255, 255, 255);
    doc.rect(margin, 10, 30, 30, "F");
    doc.setTextColor(0, 82, 155);
    doc.setFontSize(8);
    doc.text("LOGO", margin + 15, 25, { align: "center" });

    doc.setFontSize(16);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("IMPERIAL SEGUROS", margin + 40, 20);

    doc.setFontSize(10);
    doc.text("Seguradora Confiável | Serviço de Excelência", margin + 40, 27);
    doc.text(
      "Tel: +258 84 300 0000 | Email: comercial@imperialinsurance-mz.com",
      margin + 40,
      34
    );

    yPosition = 60;

    doc.setFontSize(18);
    doc.setTextColor(0, 82, 155);
    doc.text("COTAÇÃO DE SEGURO AUTOMÓVEL", 105, yPosition, {
      align: "center",
    });

    yPosition += 10;
    doc.setFontSize(9);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Nº: ${cotacaoGerada.id} | Emitida em: ${new Date().toLocaleDateString(
        "pt-MZ"
      )} | Válida por 30 dias`,
      105,
      yPosition,
      { align: "center" }
    );

    yPosition += 15;
    checkPageBreak(40);

    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPosition, 170, 8, "F");
    doc.setFontSize(10);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 82, 155);
    doc.text("INFORMAÇÕES DO SEGURADO", margin + 2, yPosition + 6);

    yPosition += 12;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);

    const col1 = margin;
    const col2 = margin + 90;

    doc.text(
      `Nome: ${cotacaoGerada.cliente.tituloContato || ""} ${
        cotacaoGerada.cliente.primeiroNome
      } ${cotacaoGerada.cliente.sobrenome}`,
      col1,
      yPosition
    );
    doc.text(`Email: ${cotacaoGerada.cliente.email}`, col2, yPosition);
    yPosition += lineHeight;

    doc.text(
      `Documento: ${cotacaoGerada.cliente.numeroDocumento}`,
      col1,
      yPosition
    );
    doc.text(`Telefone: ${cotacaoGerada.cliente.telefone}`, col2, yPosition);
    yPosition += lineHeight;

    doc.text(
      `Tipo: ${
        cotacaoGerada.cliente.tipo === "Particular"
          ? "Cliente Particular"
          : "Cliente Empresarial"
      }`,
      col1,
      yPosition
    );
    yPosition += lineHeight;

    yPosition += 8;
    checkPageBreak(20);

    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPosition, 170, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 82, 155);
    doc.text("PERÍODO DE VIGÊNCIA", margin + 2, yPosition + 6);

    yPosition += 12;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);
    const dataInicio = new Date(cotacaoGerada.dataInicio).toLocaleDateString(
      "pt-MZ"
    );
    const dataFim = new Date(cotacaoGerada.dataFim).toLocaleDateString("pt-MZ");
    doc.text(
      `Início: ${dataInicio} | Término: ${dataFim} | Duração: 12 meses`,
      margin,
      yPosition
    );

    yPosition += 15;
    checkPageBreak(100);

    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPosition, 170, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 82, 155);
    doc.text("COMPOSIÇÃO DO PRÉMIO", margin + 2, yPosition + 6);

    yPosition += 12;

    doc.setFillColor(0, 82, 155);
    doc.rect(margin, yPosition, 170, 8, "F");
    doc.setTextColor(255, 255, 255);
    doc.text("DESCRIÇÃO", margin + 2, yPosition + 6);
    doc.text("VALOR (MT)", 160, yPosition + 6, { align: "right" });

    yPosition += 15;

    const premioBase = parseFloat(cotacaoGerada.totalPremio * 0.84);
    const custosAdmin = parseFloat(cotacaoGerada.totalPremio * 0.126);
    const sobreTaxa = parseFloat(cotacaoGerada.totalPremio * 0.0145);
    const imposto = parseFloat(cotacaoGerada.totalPremio * 0.0195);

    const linhas = [
      { desc: "Prémio Base do Seguro", valor: premioBase.toFixed(2) },
      { desc: "Custos Administrativos (12,6%)", valor: custosAdmin.toFixed(2) },
      { desc: "Sobre Taxa (1,45%)", valor: sobreTaxa.toFixed(2) },
      { desc: "Imposto de Selo (1,95%)", valor: imposto.toFixed(2) },
    ];

    doc.setTextColor(0, 0, 0);
    linhas.forEach((linha, index) => {
      if (index % 2 === 0) {
        doc.setFillColor(250, 250, 250);
        doc.rect(margin, yPosition - 4, 170, 10, "F");
      }
      doc.text(linha.desc, margin + 2, yPosition);
      doc.text(linha.valor, 160, yPosition, { align: "right" });
      yPosition += 10;
    });

    yPosition += 5;
    doc.setFillColor(0, 82, 155);
    doc.rect(margin, yPosition, 170, 10, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.text("TOTAL DO PRÉMIO", margin + 2, yPosition + 7);
    doc.text(
      parseFloat(cotacaoGerada.totalPremio).toLocaleString("pt-MZ", {
        minimumFractionDigits: 2,
      }),
      160,
      yPosition + 7,
      { align: "right" }
    );
    
    yPosition += 12;
    doc.setFontSize(10);
    doc.setTextColor(40, 40, 40);
    doc.text(
      `Prémio Semestral: MT ${parseFloat(cotacaoGerada.totalPremio / 2).toLocaleString("pt-MZ", {
        minimumFractionDigits: 2,
      })}`,
      margin,
      yPosition
    );
    
    // Verificar se deve mostrar prémio trimestral e mensal no PDF
    const mostrarCamposEspeciaisPDF = cotacaoGerada.veiculos.some(veiculo => {
      const capital = parseFloat(veiculo.capitalSeguro) || 0;
      return capital > 12000;
    });
    
    const mostrarMensalPDF = cotacaoGerada.debitoDireto && mostrarCamposEspeciaisPDF;
    
    if (mostrarCamposEspeciaisPDF) {
      doc.text(
        `Prémio Trimestral: MT ${parseFloat(cotacaoGerada.totalPremio / 4).toLocaleString("pt-MZ", {
          minimumFractionDigits: 2,
        })}`,
        margin,
        yPosition + 6
      );
      
      if (mostrarMensalPDF) {
        doc.text(
          `Prémio Mensal: MT ${parseFloat(cotacaoGerada.totalPremio / 12).toLocaleString("pt-MZ", {
            minimumFractionDigits: 2,
          })}`,
          margin,
          yPosition + 12
        );
        yPosition += 12;
      }
      yPosition += 6;
    }

    cotacaoGerada.veiculos.forEach((veiculo, index) => {
      yPosition += 20;
      checkPageBreak(120);

      doc.setFillColor(240, 240, 240);
      doc.rect(margin, yPosition, 170, 8, "F");
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 82, 155);
      doc.text(
        `VIATURA ${index + 1} - ${veiculo.marca} ${veiculo.modelo}`,
        margin + 2,
        yPosition + 6
      );

      yPosition += 12;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);

      const infoCol1 = [
        `Marca: ${veiculo.marca}`,
        `Modelo: ${veiculo.modelo}`,
        `Matrícula: ${veiculo.matriculaCompleta || veiculo.matricula || "Por atribuir"}`,
        `Ano: ${veiculo.ano || "N/A"}`,
      ];

      const infoCol2 = [
        `Motor: ${veiculo.motor || "N/A"}`,
        `Lotação: ${veiculo.lotacao || "N/A"}`,
        `Chassi: ${veiculo.chassis || "N/A"}`,
        `Capital Seguro: MT ${parseFloat(veiculo.capitalSeguro).toLocaleString(
          "pt-MZ"
        )}`,
      ];

      infoCol1.forEach((info, i) => {
        doc.text(info, col1, yPosition);
        if (infoCol2[i]) {
          doc.text(infoCol2[i], col2, yPosition);
        }
        yPosition += lineHeight;
      });

      yPosition += 5;
      doc.setFont("helvetica", "bold");
      doc.text("DETALHES FINANCEIROS:", col1, yPosition);
      yPosition += lineHeight;
      doc.setFont("helvetica", "normal");
      doc.text(
        `Taxa Aplicada: ${veiculo.taxaAplicada || "0%"}`,
        col1,
        yPosition
      );
      doc.text(
        `Prémio Anual: MT ${parseFloat(veiculo.premioAnnual).toLocaleString(
          "pt-MZ",
          { minimumFractionDigits: 2 }
        )}`,
        col2,
        yPosition
      );
      doc.text(
        `Prémio Semestral: MT ${parseFloat(veiculo.premioSemestral).toLocaleString(
          "pt-MZ",
          { minimumFractionDigits: 2 }
        )}`,
        col1,
        yPosition + lineHeight
      );
      
      // Mostrar prémio trimestral sempre quando capital > 12000
      const capital = parseFloat(veiculo.capitalSeguro) || 0;
      if (capital > 12000) {
        doc.text(
          `Prémio Trimestral: MT ${parseFloat(veiculo.premioTrimestral || (parseFloat(veiculo.premioAnnual) / 4)).toLocaleString(
            "pt-MZ",
            { minimumFractionDigits: 2 }
          )}`,
          col2,
          yPosition + lineHeight
        );
        
        // Mostrar prémio mensal só quando débito direto ativo
        if (cotacaoGerada.debitoDireto) {
          doc.text(
            `Prémio Mensal: MT ${parseFloat(veiculo.premioMensal || (parseFloat(veiculo.premioAnnual) / 12)).toLocaleString(
              "pt-MZ",
              { minimumFractionDigits: 2 }
            )}`,
            col1,
            yPosition + (lineHeight * 2)
          );
          yPosition += lineHeight * 3;
        } else {
          yPosition += lineHeight * 2;
        }
      } else {
        yPosition += lineHeight;
      }

      yPosition += 10;
      if (yPosition > pageHeight - 50) {
        doc.addPage();
        yPosition = margin;
      }

      doc.setFillColor(240, 240, 240);
      doc.rect(margin, yPosition, 170, 8, "F");
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 82, 155);
      doc.text("COBERTURAS INCLUÍDAS", margin + 2, yPosition + 6);

      yPosition += 12;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);

      const cobertura = veiculo.configCobertura;
      if (cobertura) {
        let coberturaCount = 0;
        Object.entries(cobertura.coberturas).forEach(([key, value]) => {
          if (value > 0 || value === "Cobertura Completa") {
            const label = key
              .replace(/([A-Z])/g, " $1")
              .replace(/^./, (str) => str.toUpperCase())
              .replace("Rc", "RC")
              .replace("Dp", "DP");

            if (yPosition > pageHeight - 15) {
              doc.addPage();
              yPosition = margin;
            }

            if (coberturaCount % 2 === 0) {
              doc.text(`• ${label}:`, col1, yPosition);
              doc.text(
                value === "Cobertura Completa" ? value : `MT ${value.toLocaleString("pt-MZ")}`,
                col1 + 80,
                yPosition
              );
            } else {
              doc.text(`• ${label}:`, col2, yPosition);
              doc.text(
                value === "Cobertura Completa" ? value : `MT ${value.toLocaleString("pt-MZ")}`,
                col2 + 80,
                yPosition
              );
              yPosition += lineHeight;
            }
            coberturaCount++;
          }
        });
        if (coberturaCount % 2 !== 0) yPosition += lineHeight;
      }
    });

    yPosition += 15;
    checkPageBreak(80);

    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPosition, 170, 8, "F");
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 82, 155);
    doc.text("CONDIÇÕES GERAIS", margin + 2, yPosition + 6);

    yPosition += 12;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);

    const condicoes = [
      "• Esta cotação tem validade de 30 dias a partir da data de emissão",
      "• O prémio é pago anualmente antecipadamente",
      "• Os veículos devem estar em condições legais de circulação",
      "• O condutor deve possuir carta de condução válida",
      "• Vistória prévia obrigatória para veículos com mais de 5 anos",
      "• Franquias aplicáveis conforme tipo de cobertura selecionado",
      "• Cláusulas e condições sujeitas à apólice definitiva",
    ];

    condicoes.forEach((condicao) => {
      if (yPosition > pageHeight - 15) {
        doc.addPage();
        yPosition = margin;
      }
      doc.text(condicao, margin, yPosition, { maxWidth: 170 });
      yPosition += lineHeight * 1.3;
    });

    const ultimaPagina = doc.internal.getNumberOfPages();
    doc.setPage(ultimaPagina);

    yPosition = pageHeight - 40;
    doc.setFillColor(0, 82, 155);
    doc.rect(0, yPosition, 210, 40, "F");

    doc.setFontSize(7);
    doc.setTextColor(255, 255, 255);

    doc.text("IMPERIAL SEGUROS MOÇAMBIQUE, S.A.", margin, yPosition + 8);
    doc.text(
      "Av. 25 de Setembro, 1462 • Maputo • Moçambique",
      margin,
      yPosition + 13
    );
    doc.text(
      "Tel: +258 84 300 0000 • Email: info@imperialinsurance-mz.com",
      margin,
      yPosition + 18
    );
    doc.text(
      "www.imperialinsurance-mz.com • NUIT: 123456789",
      margin,
      yPosition + 23
    );

    doc.setTextColor(255, 255, 255, 0.8);
    doc.text(
      `Documento gerado eletronicamente • ${new Date().toLocaleString(
        "pt-MZ"
      )} • Página ${ultimaPagina} de ${ultimaPagina}`,
      105,
      yPosition + 32,
      { align: "center" }
    );

    return doc.output("blob");
  };

  // FUNÇÃO PARA ENVIAR EMAIL (mantida do código original)
  const enviarEmailCotacao = async (cotacao) => {
    try {
      setEnviandoEmail(true);

      if (!cotacao.cliente.email) {
        alert("❌ É necessário ter um email do cliente para enviar a cotação.");
        setEnviandoEmail(false);
        return;
      }

      const templateParams = {
        to_email: cotacao.cliente.email,
        to_name: `${cotacao.cliente.primeiroNome} ${cotacao.cliente.sobrenome}`,
        from_name: "Imperial Seguros",
        cotacao_id: cotacao.id,
        cliente_nome: `${cotacao.cliente.primeiroNome} ${cotacao.cliente.sobrenome}`,
        total_premio: formatarMoeda(cotacao.totalPremio),
        num_veiculos: cotacao.veiculos.length,
        tipo_cobertura: tipoCobertura,
        data_emissao: new Date().toLocaleDateString("pt-MZ"),
        validade: "30 dias",
        veiculos_lista: cotacao.veiculos
          .map(
            (veiculo, index) =>
              `• ${veiculo.marca} ${veiculo.modelo} - ${formatarMoeda(veiculo.premioAnnual)}`
          )
          .join("\\n"),
        contacto_empresa: "comercial@imperialinsurance-mz.com",
        telefone_empresa: "+258 84 300 0000",
      };

      console.log("Enviando email para:", cotacao.cliente.email);

      const result = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams,
        EMAILJS_CONFIG.PUBLIC_KEY
      );

      console.log(
        "Email enviado com sucesso para:",
        cotacao.cliente.email,
        result
      );
      alert(
        `✅ Cotação ${cotacao.id} enviada por email para ${cotacao.cliente.email} com sucesso!`
      );
      setMostrarOpcoesPartilha(false);
    } catch (error) {
      console.error("Erro detalhado ao enviar email:", error);

      if (
        error.text?.includes("Invalid login") ||
        error.text?.includes("Service not found") ||
        error.text?.includes("Public Key")
      ) {
        console.log("EmailJS não configurado, simulando envio...");
        await new Promise((resolve) => setTimeout(resolve, 2000));
        alert(
          `✅ Cotação ${cotacao.id} enviada por email para ${cotacao.cliente.email} com sucesso! (Simulado)`
        );
        setMostrarOpcoesPartilha(false);
      } else {
        alert("❌ Erro ao enviar email. Por favor, tente novamente.");
      }
    } finally {
      setEnviandoEmail(false);
    }
  };

  // Função para gerar ID único da cotação
  const gerarIdCotacao = () => {
    const timestamp = new Date().getTime();
    const random = Math.floor(Math.random() * 1000);
    return `CT${timestamp}${random}`;
  };

  // Função para salvar cotação no backend
  const salvarCotacao = async () => {
    if (!formData.email || veiculos.length === 0) {
      alert(
        "Preencha todos os dados do cliente e adicione pelo menos um veículo!"
      );
      return;
    }

    // Validar documentos
    if (tipoCliente === "Particular") {
      if (!docBI || !docLivrete) {
        alert("Por favor, faça upload do BI e do livrete!");
        return;
      }
    } else {
      if (!docLivrete) {
        alert("Por favor, faça upload do livrete!");
        return;
      }
    }

    try {
      setSalvandoCotacao(true);

      // Preparar dados para o backend
      const cotacaoData = {
        cliente: {
          tipo: tipoCliente,
          nacionalidade: formData.nacionalidade,
          titulo_contato: formData.tituloContato || null,
          primeiro_nome: formData.primeiroNome,
          sobrenome: formData.sobrenome,
          telefone: formData.telefone,
          email: formData.email,
          numero_documento: formData.numeroDocumento,
          data_nascimento: formData.dataNascimento || null,
          nome_empresa: formData.nomeEmpresa || null,
          numero_referencia_fiscal: formData.numeroReferenciaFiscal || null
        },
        veiculos: veiculos.map((v) => ({
          marca: v.marca,
          modelo: v.modelo,
          matricula: v.matriculaCompleta || v.matricula || null,
          ano: v.ano || null,
          motor: v.motor || null,
          chassis: v.chassis || null,
          lotacao: v.lotacao || null,
          tipo_cobertura: tipoCobertura,
          classificacao: classificacao,
          capital_seguro: parseFloat(v.capitalSeguro) || 0,
          taxa: parseFloat(v.taxaAplicada?.replace('%', '')) || 0,
          premio_anual: parseFloat(v.premioAnnual) || 0,
          premio_semestral: parseFloat(v.premioSemestral) || 0,
          premio_trimestral: parseFloat(v.premioTrimestral) || 0,
          premio_mensal: parseFloat(v.premioMensal) || 0
        })),
        total_premio: calcularTotalPremio(),
        status: "ativa",
        debito_direto: debitoDiretoAtivo
      };

      const result = await cotacaoService.criar(cotacaoData);

      if (result.success) {
        // Formatar cotação para exibição
        const novaCotacao = {
          id: result.data.numero_cotacao || result.data.id,
          numero_cotacao: result.data.numero_cotacao || result.data.id,
          dataCriacao: result.data.data_criacao || new Date().toISOString(),
          cliente: {
            tipo: tipoCliente,
            ...formData,
          },
          documentos: {
            bi: tipoCliente === "Particular" ? docBI?.name : null,
            livrete: docLivrete?.name
          },
          veiculos: veiculos.map((v) => ({
            ...v,
            tipoCobertura: tipoCobertura,
            classificacao: classificacao,
            configCobertura: configCoberturas[tipoCobertura],
            classificacaoConfig: getClassificacaoConfig()
          })),
          totalPremio: calcularTotalPremio(),
          status: "ativa",
          dataInicio: new Date().toISOString(),
          dataFim: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000).toISOString(),
          debitoDireto: debitoDiretoAtivo
        };

        setCotacaoGerada(novaCotacao);
        setMostrarOpcoesPartilha(true);
        
        // Disparar evento customizado para atualizar listas em outras páginas
        window.dispatchEvent(new CustomEvent('cotacaoCriada', {
          detail: { cotacao: novaCotacao }
        }));
        
        alert("✅ Cotação criada com sucesso! ID: " + novaCotacao.id);
      } else {
        alert("❌ Erro ao criar cotação: " + (result.message || "Erro desconhecido"));
      }
    } catch (error) {
      console.error("Erro ao salvar cotação:", error);
      alert("❌ Erro ao criar cotação. Por favor, tente novamente.");
    } finally {
      setSalvandoCotacao(false);
    }
  };

  // Função para enviar cotação por email
  const enviarEmail = async () => {
    if (!cotacaoGerada) return;

    if (!cotacaoGerada.cliente.email) {
      alert("❌ É necessário ter um email do cliente para enviar a cotação.");
      return;
    }

    const confirmarEnvio = window.confirm(
      `Deseja enviar a cotação ${cotacaoGerada.id} para o email ${cotacaoGerada.cliente.email}?`
    );

    if (confirmarEnvio) {
      await enviarEmailCotacao(cotacaoGerada);
    }
  };

  // FUNÇÕES AUXILIARES
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
    salvarCotacao();
  };

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleVeiculoChange = (field, value) => {
    setVeiculoAtual((prev) => ({
      ...prev,
      [field]: value,
    }));
    
    // Se o campo for capitalSeguro, recalcular o prêmio
    if (field === "capitalSeguro") {
      if (value && tipoCobertura && classificacao) {
        const resultado = calcularPremio();
        const capital = parseFloat(value) || 0;
        const mostrarTrimestral = capital > 12000;
        const mostrarMensal = debitoDiretoAtivo && capital > 12000;
        
        setVeiculoAtual((prev) => ({
          ...prev,
          premioAnnual: resultado.premioAnnual,
          premioSemestral: resultado.premioSemestral,
          premioTrimestral: mostrarTrimestral ? resultado.premioTrimestral : "",
          premioMensal: mostrarMensal ? resultado.premioMensal : "",
          taxaAplicada: resultado.taxaAplicada
        }));
      }
    }
  };

  const adicionarVeiculo = () => {
    if (
      !veiculoAtual.marca ||
      !veiculoAtual.modelo ||
      !tipoCobertura ||
      !classificacao ||
      !veiculoAtual.capitalSeguro ||
      !paisMatricula
    ) {
      alert("Preencha todos os campos obrigatórios do veículo!");
      return;
    }

    // Validar matrícula se não for "Outros"
    if (paisMatricula !== "Outros" && !validarMatricula()) {
      alert(`Por favor, insira uma matrícula válida para ${paisMatricula}. Formato: ${formatoMatricula?.exemplo}`);
      return;
    }

    const classificacaoConfig = getClassificacaoConfig();
    const capital = parseFloat(veiculoAtual.capitalSeguro) || 0;
    const mostrarTrimestral = capital > 12000;
    const mostrarMensal = debitoDiretoAtivo && capital > 12000;
    
    // Garantir que os prêmios estão calculados corretamente
    let premioTrimestral = veiculoAtual.premioTrimestral;
    let premioMensal = veiculoAtual.premioMensal;
    
    if (mostrarTrimestral && (!premioTrimestral || premioTrimestral === "0.00")) {
      const premioAnnualNum = parseFloat(veiculoAtual.premioAnnual) || 0;
      premioTrimestral = (premioAnnualNum / 4).toFixed(2);
    }
    
    if (mostrarMensal && (!premioMensal || premioMensal === "0.00")) {
      const premioAnnualNum = parseFloat(veiculoAtual.premioAnnual) || 0;
      premioMensal = (premioAnnualNum / 12).toFixed(2);
    }
    
    setVeiculos((prev) => [
      ...prev,
      {
        ...veiculoAtual,
        id: Date.now(),
        tipoCobertura: tipoCobertura,
        classificacao: classificacao,
        configCobertura: configCoberturas[tipoCobertura],
        classificacaoConfig: classificacaoConfig,
        paisMatricula: paisMatricula,
        formatoMatricula: formatoMatricula?.exemplo,
        premioTrimestral: mostrarTrimestral ? premioTrimestral : "",
        premioMensal: mostrarMensal ? premioMensal : ""
      },
    ]);
    
    // Resetar formulário do veículo
    setVeiculoAtual({
      marca: "",
      modelo: "",
      matricula: "",
      matriculaCompleta: "",
      ano: "",
      motor: "",
      chassis: "",
      lotacao: "",
      capitalSeguro: "",
      taxa: "",
      premioAnnual: "",
      premioSemestral: "",
      premioTrimestral: "",
      premioMensal: "",
      premioMinimo: "",
      taxaAplicada: "",
    });
    
    setClassificacao("");
    setPaisMatricula("");
    setFormatoMatricula(null);
  };

  const removerVeiculo = (id) => {
    setVeiculos((prev) => prev.filter((v) => v.id !== id));
  };

  const getPaisSelecionado = () => {
    return (
      paises.find((pais) => pais.code === formData.nacionalidade) || paises[0]
    );
  };

  // Funções de visualização/download
  const gerarPDF = () => {
    const pdfBlob = gerarPDFBlob();
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `cotacao-${cotacaoGerada.id}.pdf`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  const visualizarPDF = () => {
    const pdfBlob = gerarPDFBlob();
    if (pdfBlob) {
      const url = URL.createObjectURL(pdfBlob);
      window.open(url, "_blank");
      setTimeout(() => URL.revokeObjectURL(url), 10000);
    }
  };

  const imprimirCotacao = () => {
    const conteudo = `
      <!DOCTYPE html>
      <html>
        <head>
          <title>Cotacao ${cotacaoGerada.id}</title>
          <style>
            @import url('https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap');
            
            * {
              margin: 0;
              padding: 0;
              box-sizing: border-box;
            }
            
            body {
              font-family: 'Inter', 'Segoe UI', Arial, sans-serif;
              margin: 0;
              padding: 20px;
              color: #333;
              background: #f8fafc;
              line-height: 1.6;
            }
            
            .container {
              max-width: 800px;
              margin: 0 auto;
              background: white;
              padding: 0;
              border-radius: 12px;
              box-shadow: 0 10px 30px rgba(0,0,0,0.1);
              overflow: hidden;
            }
            
            .header {
              background: linear-gradient(135deg, #00529b 0%, #003366 100%);
              color: white;
              padding: 30px 40px;
              text-align: center;
              position: relative;
            }
            
            .header::before {
              content: '';
              position: absolute;
              top: 0;
              left: 0;
              right: 0;
              height: 4px;
              background: linear-gradient(90deg, #ffd700, #ff6b00);
            }
            
            .logo-area {
              width: 80px;
              height: 80px;
              background: white;
              border-radius: 12px;
              margin: 0 auto 20px;
              display: flex;
              align-items: center;
              justify-content: center;
              color: #00529b;
              font-weight: bold;
              font-size: 12px;
              border: 2px dashed #00529b;
            }
            
            .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: 700;
              letter-spacing: -0.5px;
            }
            
            .header h2 {
              margin: 8px 0 0 0;
              font-size: 16px;
              font-weight: 400;
              opacity: 0.9;
            }
            
            .document-info {
              background: #e3f2fd;
              padding: 15px 40px;
              border-bottom: 1px solid #bbdefb;
              font-size: 12px;
              color: #00529b;
              display: flex;
              justify-content: space-between;
              align-items: center;
            }
            
            .section {
              padding: 25px 40px;
              border-bottom: 1px solid #e2e8f0;
            }
            
            .section:last-child {
              border-bottom: none;
            }
            
            .section-title {
              color: #00529b;
              font-size: 16px;
              font-weight: 600;
              margin-bottom: 20px;
              padding-bottom: 8px;
              border-bottom: 2px solid #00529b;
              display: flex;
              align-items: center;
            }
            
            .section-title::before {
              content: '▶';
              margin-right: 8px;
              font-size: 12px;
            }
            
            .info-grid {
              display: grid;
              grid-template-columns: 1fr 1fr;
              gap: 15px;
              margin-bottom: 15px;
            }
            
            .info-item {
              display: flex;
              flex-direction: column;
            }
            
            .info-label {
              font-size: 12px;
              color: #64748b;
              font-weight: 500;
              margin-bottom: 4px;
            }
            
            .info-value {
              font-size: 14px;
              color: #1e293b;
              font-weight: 500;
            }
            
            .table {
              width: 100%;
              border-collapse: collapse;
              margin: 20px 0;
              background: white;
              border-radius: 8px;
              overflow: hidden;
              box-shadow: 0 2px 10px rgba(0,0,0,0.05);
            }
            
            .table th {
              background: #00529b;
              color: white;
              padding: 12px 15px;
              text-align: left;
              font-weight: 600;
              font-size: 12px;
            }
            
            .table td {
              padding: 12px 15px;
              border-bottom: 1px solid #e2e8f0;
              font-size: 13px;
            }
            
            .table tr:nth-child(even) {
              background: #f8fafc;
            }
            
            .table tr:hover {
              background: #f1f5f9;
            }
            
            .total-row {
              background: #00529b !important;
              color: white;
              font-weight: 600;
              font-size: 14px;
            }
            
            .vehicle-card {
              background: white;
              padding: 20px;
              margin: 15px 0;
              border-radius: 8px;
              border-left: 4px solid #00529b;
              box-shadow: 0 2px 10px rgba(0,0,0,0.05);
              border: 1px solid #e2e8f0;
            }
            
            .vehicle-header {
              display: flex;
              justify-content: space-between;
              align-items: center;
              margin-bottom: 15px;
              padding-bottom: 10px;
              border-bottom: 1px solid #e2e8f0;
            }
            
            .vehicle-title {
              font-size: 16px;
              font-weight: 600;
              color: #00529b;
            }
            
            .vehicle-type {
              background: #e3f2fd;
              color: #00529b;
              padding: 4px 8px;
              border-radius: 4px;
              font-size: 11px;
              font-weight: 500;
            }
            
            .coverage-list {
              list-style: none;
              padding: 0;
              margin: 15px 0 0 0;
            }
            
            .coverage-list li {
              padding: 8px 0;
              border-bottom: 1px solid #f1f5f9;
              display: flex;
              justify-content: space-between;
              align-items: center;
              font-size: 13px;
            }
            
            .coverage-list li:before {
              content: "✓";
              color: #10b981;
              font-weight: bold;
              margin-right: 10px;
            }
            
            .coverage-value {
              color: #00529b;
              font-weight: 600;
              font-size: 12px;
            }
            
            .footer {
              background: #1e293b;
              color: white;
              padding: 25px 40px;
              text-align: center;
              font-size: 11px;
              line-height: 1.5;
            }
            
            .footer p {
              margin: 4px 0;
              opacity: 0.8;
            }
            
            .conditions {
              background: #fff3cd;
              border: 1px solid #ffeaa7;
              border-radius: 6px;
              padding: 15px;
              margin: 20px 0;
              font-size: 12px;
            }
            
            .conditions h4 {
              color: #856404;
              margin-bottom: 10px;
              font-size: 13px;
            }
            
            .conditions ul {
              padding-left: 20px;
              margin: 0;
            }
            
            .conditions li {
              margin-bottom: 5px;
              color: #856404;
            }
            
            @media print {
              body {
                background: white;
                padding: 0;
              }
              
              .container {
                box-shadow: none;
                border-radius: 0;
              }
              
              .no-print {
                display: none;
              }
            }
          </style>
        </head>
        <body>
          <div class="container">
            <div class="header">
              <div class="logo-area">LOGO</div>
              <h1>IMPERIAL SEGUROS</h1>
              <h2>COTAÇÃO DE SEGURO AUTOMÓVEL</h2>
            </div>
            
            <div class="document-info">
              <div><strong>Nº:</strong> ${cotacaoGerada.id}</div>
              <div><strong>Emissão:</strong> ${new Date().toLocaleDateString(
                "pt-MZ"
              )}</div>
              <div><strong>Validade:</strong> 30 dias</div>
            </div>
            
            <div class="section">
              <div class="section-title">INFORMAÇÕES DO SEGURADO</div>
              <div class="info-grid">
                <div class="info-item">
                  <span class="info-label">NOME COMPLETO</span>
                  <span class="info-value">${
                    cotacaoGerada.cliente.tituloContato || ""
                  } ${cotacaoGerada.cliente.primeiroNome} ${
      cotacaoGerada.cliente.sobrenome
    }</span>
                </div>
                <div class="info-item">
                  <span class="info-label">EMAIL</span>
                  <span class="info-value">${cotacaoGerada.cliente.email}</span>
                </div>
                <div class="info-item">
                  <span class="info-label">DOCUMENTO</span>
                  <span class="info-value">${
                    cotacaoGerada.cliente.numeroDocumento
                  }</span>
                </div>
                <div class="info-item">
                  <span class="info-label">TELEFONE</span>
                  <span class="info-value">${
                    cotacaoGerada.cliente.telefone
                  }</span>
                </div>
                <div class="info-item">
                  <span class="info-label">TIPO DE CLIENTE</span>
                  <span class="info-value">${
                    cotacaoGerada.cliente.tipo === "Particular"
                      ? "Cliente Particular"
                      : "Cliente Empresarial"
                  }</span>
                </div>
              </div>
            </div>

            <div class="section">
              <div class="section-title">COMPOSIÇÃO DO PRÉMIO</div>
              <table class="table">
                <tr>
                  <th>DESCRIÇÃO</th>
                  <th style="text-align: right">VALOR (MT)</th>
                </tr>
                <tr>
                  <td>Prémio Base do Seguro</td>
                  <td style="text-align: right">${parseFloat(
                    cotacaoGerada.totalPremio * 0.84
                  ).toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Custos Administrativos (12,6%)</td>
                  <td style="text-align: right">${parseFloat(
                    cotacaoGerada.totalPremio * 0.126
                  ).toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Sobre Taxa (1,45%)</td>
                  <td style="text-align: right">${parseFloat(
                    cotacaoGerada.totalPremio * 0.0145
                  ).toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Imposto de Selo (1,95%)</td>
                  <td style="text-align: right">${parseFloat(
                    cotacaoGerada.totalPremio * 0.0195
                  ).toFixed(2)}</td>
                </tr>
                <tr>
                  <td>Prémio Semestral</td>
                  <td style="text-align: right">${parseFloat(
                    cotacaoGerada.totalPremio / 2
                  ).toLocaleString("pt-MZ", { minimumFractionDigits: 2 })}</td>
                </tr>
                ${
                  cotacaoGerada.veiculos.some(veiculo => {
                    const capital = parseFloat(veiculo.capitalSeguro) || 0;
                    return capital > 12000;
                  })
                    ? `<tr>
                        <td>Prémio Trimestral</td>
                        <td style="text-align: right">${parseFloat(
                          cotacaoGerada.totalPremio / 4
                        ).toLocaleString("pt-MZ", { minimumFractionDigits: 2 })}</td>
                      </tr>`
                    : ""
                }
                ${
                  cotacaoGerada.debitoDireto && cotacaoGerada.veiculos.some(veiculo => {
                    const capital = parseFloat(veiculo.capitalSeguro) || 0;
                    return capital > 12000;
                  })
                    ? `<tr>
                        <td>Prémio Mensal</td>
                        <td style="text-align: right">${parseFloat(
                          cotacaoGerada.totalPremio / 12
                        ).toLocaleString("pt-MZ", { minimumFractionDigits: 2 })}</td>
                      </tr>`
                    : ""
                }
                <tr class="total-row">
                  <td>TOTAL DO PRÉMIO</td>
                  <td style="text-align: right">${parseFloat(
                    cotacaoGerada.totalPremio
                  ).toLocaleString("pt-MZ", { minimumFractionDigits: 2 })}</td>
                </tr>
              </table>
            </div>

            <div class="section">
              <div class="section-title">VEÍCULOS SEGURADOS</div>
              ${cotacaoGerada.veiculos
                .map(
                  (veiculo, index) => `
                <div class="vehicle-card">
                  <div class="vehicle-header">
                    <div class="vehicle-title">Viatura ${index + 1}: ${
                    veiculo.marca
                  } ${veiculo.modelo}</div>
                    <div class="vehicle-type">${veiculo.tipoCobertura}</div>
                  </div>
                  <div class="info-grid">
                    <div class="info-item">
                      <span class="info-label">MARCA</span>
                      <span class="info-value">${veiculo.marca}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">MODELO</span>
                      <span class="info-value">${veiculo.modelo}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">MATRÍCULA</span>
                      <span class="info-value">${
                        veiculo.matriculaCompleta || veiculo.matricula || "Por atribuir"
                      }</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">CLASSIFICAÇÃO</span>
                      <span class="info-value">${veiculo.classificacao}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">ANO</span>
                      <span class="info-value">${veiculo.ano || "N/A"}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">CAPITAL SEGURO</span>
                      <span class="info-value">MT ${parseFloat(
                        veiculo.capitalSeguro
                      ).toLocaleString("pt-MZ")}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">TAXA APLICADA</span>
                      <span class="info-value">${veiculo.taxaAplicada || "0%"}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">PRÉMIO ANUAL</span>
                      <span class="info-value">MT ${parseFloat(
                        veiculo.premioAnnual
                      ).toLocaleString("pt-MZ", {
                        minimumFractionDigits: 2,
                      })}</span>
                    </div>
                    <div class="info-item">
                      <span class="info-label">PRÉMIO SEMESTRAL</span>
                      <span class="info-value">MT ${parseFloat(
                        veiculo.premioSemestral
                      ).toLocaleString("pt-MZ", {
                        minimumFractionDigits: 2,
                      })}</span>
                    </div>
                    ${
                      parseFloat(veiculo.capitalSeguro) > 12000
                        ? `<div class="info-item">
                            <span class="info-label">PRÉMIO TRIMESTRAL</span>
                            <span class="info-value">MT ${parseFloat(
                              veiculo.premioTrimestral || (parseFloat(veiculo.premioAnnual) / 4)
                            ).toLocaleString("pt-MZ", {
                              minimumFractionDigits: 2,
                            })}</span>
                          </div>`
                        : ""
                    }
                    ${
                      cotacaoGerada.debitoDireto && parseFloat(veiculo.capitalSeguro) > 12000
                        ? `<div class="info-item">
                            <span class="info-label">PRÉMIO MENSAL</span>
                            <span class="info-value">MT ${parseFloat(
                              veiculo.premioMensal || (parseFloat(veiculo.premioAnnual) / 12)
                            ).toLocaleString("pt-MZ", {
                              minimumFractionDigits: 2,
                            })}</span>
                          </div>`
                        : ""
                    }
                  </div>
                  
                  <div style="margin-top: 15px;">
                    <strong style="color: #00529b; font-size: 13px;">COBERTURAS INCLUÍDAS:</strong>
                    <ul class="coverage-list">
                      ${
                        veiculo.configCobertura
                          ? Object.entries(veiculo.configCobertura.coberturas)
                              .map(([key, value]) =>
                                value > 0 || value === "Cobertura Completa"
                                  ? `<li>
                          <span>${key
                            .replace(/([A-Z])/g, " $1")
                            .replace(/^./, (str) => str.toUpperCase())
                            .replace("Rc", "RC")
                            .replace("Dp", "DP")}</span>
                          <span class="coverage-value">${
                            value === "Cobertura Completa" 
                              ? value 
                              : `MT ${value.toLocaleString("pt-MZ")}`
                          }</span>
                        </li>`
                                  : ""
                              )
                              .join("")
                          : ""
                      }
                    </ul>
                  </div>
                </div>
              `
                )
                .join("")}
            </div>

            <div class="section">
              <div class="section-title">CONDIÇÕES GERAIS</div>
              <div class="conditions">
                <ul>
                  <li>Esta cotação tem validade de 30 dias a partir da data de emissão</li>
                  <li>O prémio é pago anualmente antecipadamente</li>
                  <li>Os veículos devem estar em condições legais de circulação</li>
                  <li>O condutor deve possuir carta de condução válida</li>
                  <li>Vistória prévia obrigatória para veículos com mais de 5 anos</li>
                  <li>Franquias aplicáveis conforme tipo de cobertura selecionado</li>
                  <li>Cláusulas e condições sujeitas à apólice definitiva</li>
                </ul>
              </div>
            </div>

            <div class="footer">
              <p><strong>IMPERIAL SEGUROS MOÇAMBIQUE, S.A.</strong></p>
              <p>Av. 25 de Setembro, 1462 • Maputo • Moçambique</p>
              <p>Tel: +258 84 300 0000 • Email: info@imperialinsurance-mz.com • www.imperialinsurance-mz.com</p>
              <p style="margin-top: 10px; opacity: 0.6;">Documento gerado eletronicamente em ${new Date().toLocaleString(
                "pt-MZ"
              )}</p>
            </div>
          </div>
          
          <div class="no-print" style="text-align: center; margin-top: 20px; padding: 20px;">
            <button onclick="window.print()" style="background: #00529b; color: white; border: none; padding: 12px 24px; border-radius: 6px; cursor: pointer; font-size: 14px; font-weight: 500;">
              🖨️ Imprimir Cotação
            </button>
          </div>
        </body>
      </html>
    `;

    const janela = window.open("", "_blank");
    janela.document.write(conteudo);
    janela.document.close();
  };

  return (
    <div className="min-h-screen bg-white p-4 md:p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 mb-3">
            {tipoCliente === "Particular"
              ? "Criar Nova Cotação"
              : "Criar Cotação Empresarial"}
          </h1>
          <div className="flex items-center justify-center gap-2 text-emerald-700">
            <div className="w-8 h-px bg-emerald-600" />
            <p className="text-sm font-medium text-gray-700">
              Os campos assinalados com * são obrigatórios
            </p>
            <div className="w-8 h-px bg-emerald-600" />
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Container Principal - Dados do Cliente */}
          <div className="space-y-6">
            {/* Seletor de Tipo de Cliente */}
            <div className="p-6 border-b border-emerald-200">
              <div className="flex gap-4 justify-center">
                <button
                  type="button"
                  onClick={() => handleTipoClienteChange("Particular")}
                  className={`flex items-center gap-3 px-6 py-4 rounded-xl transition-all duration-500 transform hover:scale-105 ${
                    tipoCliente === "Particular"
                      ? "bg-emerald-600 text-white shadow-lg scale-105"
                      : "bg-gray-100 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
                  } ${isSwitching ? "animate-pulse" : ""}`}
                >
                  <User className="h-5 w-5" />
                  <span className="font-semibold">Particular</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleTipoClienteChange("Empresarial")}
                  className={`flex items-center gap-3 px-6 py-4 rounded-xl transition-all duration-500 transform hover:scale-105 ${
                    tipoCliente === "Empresarial"
                      ? "bg-emerald-600 text-white shadow-lg scale-105"
                      : "bg-gray-100 text-gray-700 hover:bg-emerald-50 hover:text-emerald-700"
                  } ${isSwitching ? "animate-pulse" : ""}`}
                >
                  <Building className="h-5 w-5" />
                  <span className="font-semibold">Empresarial</span>
                </button>
              </div>
            </div>

            <div className="p-6">
              <div
                className={`transition-all duration-500 ${
                  isSwitching ? "opacity-0 scale-95" : "opacity-100 scale-100"
                }`}
              >
                {tipoCliente === "Particular" ? (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-1 h-8 bg-emerald-500 rounded-full" />
                      <h3 className="text-xl font-bold text-gray-900">
                        Dados Pessoais
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                      {/* Primeira linha - 3 campos */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-800">
                          Nacionalidade *
                        </label>
                        <div className="relative group">
                          <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600 h-4 w-4 z-10" />
                          <select
                            required
                            className="w-full pl-10 pr-10 py-3 rounded-lg text-gray-800 transition-all duration-300 focus:outline-none focus:scale-[1.02] focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer bg-white border border-gray-300"
                            value={formData.nacionalidade}
                            onChange={(e) =>
                              handleInputChange("nacionalidade", e.target.value)
                            }
                          >
                            {paises.map((pais, index) => (
                              <option key={index} value={pais.code}>
                                {pais.flag} {pais.name}
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2 z-10">
                            <span className="text-lg">
                              {getPaisSelecionado().flag}
                            </span>
                            <ChevronDown className="text-emerald-600 h-4 w-4" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-800">
                          Título de Contato
                        </label>
                        <div className="relative group">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600 h-4 w-4 z-10" />
                          <select
                            className="w-full pl-10 pr-10 py-3 rounded-lg text-gray-800 transition-all duration-300 focus:outline-none focus:scale-[1.02] focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer bg-white border border-gray-300"
                            value={formData.tituloContato}
                            onChange={(e) =>
                              handleInputChange("tituloContato", e.target.value)
                            }
                          >
                            <option value="">- Selecionar -</option>
                            {titulosContato.map((titulo, index) => (
                              <option key={index} value={titulo}>
                                {titulo}
                              </option>
                            ))}
                          </select>
                          <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-emerald-600 h-4 w-4 z-10" />
                        </div>
                      </div>

                      <div className="lg:col-span-1"></div>

                      {/* Segunda linha - 3 campos */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-800">
                          Primeiro Nome *
                        </label>
                        <div className="relative group">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600 h-4 w-4" />
                          <input
                            type="text"
                            required
                            className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-800 placeholder-gray-400 transition-all duration-300 focus:outline-none focus:scale-[1.02] focus:ring-2 focus:ring-emerald-500 bg-white border border-gray-300"
                            placeholder="Primeiro nome"
                            value={formData.primeiroNome}
                            onChange={(e) =>
                              handleInputChange("primeiroNome", e.target.value)
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-800">
                          Sobrenome *
                        </label>
                        <div className="relative group">
                          <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600 h-4 w-4" />
                          <input
                            type="text"
                            required
                            className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-800 placeholder-gray-400 transition-all duration-300 focus:outline-none focus:scale-[1.02] focus:ring-2 focus:ring-emerald-500 bg-white border border-gray-300"
                            placeholder="Sobrenome"
                            value={formData.sobrenome}
                            onChange={(e) =>
                              handleInputChange("sobrenome", e.target.value)
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-800">
                          Telefone Móvel *
                        </label>
                        <div className="relative group">
                          <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600 h-4 w-4" />
                          <input
                            type="tel"
                            required
                            className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-800 placeholder-gray-400 transition-all duration-300 focus:outline-none focus:scale-[1.02] focus:ring-2 focus:ring-emerald-500 bg-white border border-gray-300"
                            placeholder="+258"
                            value={formData.telefone}
                            onChange={(e) =>
                              handleInputChange("telefone", e.target.value)
                            }
                          />
                        </div>
                      </div>

                      {/* Terceira linha - 3 campos */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-800">
                          Email *
                        </label>
                        <div className="relative group">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600 h-4 w-4" />
                          <input
                            type="email"
                            required
                            className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-800 placeholder-gray-400 transition-all duration-300 focus:outline-none focus:scale-[1.02] focus:ring-2 focus:ring-emerald-500 bg-white border border-gray-300"
                            placeholder="seu@email.com"
                            value={formData.email}
                            onChange={(e) =>
                              handleInputChange("email", e.target.value)
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-800">
                          Nº Documento *
                        </label>
                        <div className="relative group">
                          <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600 h-4 w-4" />
                          <input
                            type="text"
                            required
                            className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-800 placeholder-gray-400 transition-all duration-300 focus:outline-none focus:scale-[1.02] focus:ring-2 focus:ring-emerald-500 bg-white border border-gray-300"
                            placeholder="BI/Passaporte"
                            value={formData.numeroDocumento}
                            onChange={(e) =>
                              handleInputChange(
                                "numeroDocumento",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-800">
                          Data de Nascimento *
                        </label>
                        <div className="relative group">
                          <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600 h-4 w-4" />
                          <input
                            type="date"
                            required
                            className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-800 transition-all duration-300 focus:outline-none focus:scale-[1.02] focus:ring-2 focus:ring-emerald-500 bg-white border border-gray-300"
                            value={formData.dataNascimento}
                            onChange={(e) =>
                              handleInputChange(
                                "dataNascimento",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* Upload de documentos para cliente particular */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-1 h-6 bg-blue-500 rounded-full" />
                        <h4 className="text-lg font-bold text-gray-900">
                          Documentos Obrigatórios
                        </h4>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Upload do BI */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-800">
                            Cópia do BI/Passaporte *
                          </label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-emerald-500 transition-colors duration-300">
                            {!docBI ? (
                              <div className="text-center">
                                <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                                <label className="cursor-pointer">
                                  <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    className="hidden"
                                    onChange={(e) => handleFileUpload(e.target.files[0], 'bi')}
                                  />
                                  <span className="text-emerald-600 hover:text-emerald-700">
                                    Clique para fazer upload
                                  </span>
                                </label>
                                <p className="text-xs text-gray-500 mt-1">
                                  PDF, JPG ou PNG (max 5MB)
                                </p>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <File className="h-8 w-8 text-emerald-600" />
                                  <div>
                                    <p className="text-gray-800 text-sm">{docBI.name}</p>
                                    <p className="text-gray-500 text-xs">
                                      {(docBI.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removerDocumento('bi')}
                                  className="text-red-500 hover:text-red-600"
                                >
                                  <X className="h-5 w-5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>

                        {/* Upload do Livrete */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-800">
                            Cópia do Livrete *
                          </label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-emerald-500 transition-colors duration-300">
                            {!docLivrete ? (
                              <div className="text-center">
                                <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                                <label className="cursor-pointer">
                                  <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    className="hidden"
                                    onChange={(e) => handleFileUpload(e.target.files[0], 'livrete')}
                                  />
                                  <span className="text-emerald-600 hover:text-emerald-700">
                                    Clique para fazer upload
                                  </span>
                                </label>
                                <p className="text-xs text-gray-500 mt-1">
                                  PDF, JPG ou PNG (max 5MB)
                                </p>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <File className="h-8 w-8 text-emerald-600" />
                                  <div>
                                    <p className="text-gray-800 text-sm">{docLivrete.name}</p>
                                    <p className="text-gray-500 text-xs">
                                      {(docLivrete.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removerDocumento('livrete')}
                                  className="text-red-500 hover:text-red-600"
                                >
                                  <X className="h-5 w-5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="space-y-6">
                    <div className="flex items-center gap-3 mb-6">
                      <div className="w-1 h-8 bg-emerald-500 rounded-full" />
                      <h3 className="text-xl font-bold text-gray-900">
                        Dados da Empresa
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                      {/* Primeira linha - 2 campos */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-800">
                          Nacionalidade *
                        </label>
                        <div className="relative group">
                          <Globe className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600 h-4 w-4 z-10" />
                          <select
                            required
                            className="w-full pl-10 pr-10 py-3 rounded-lg text-gray-800 transition-all duration-300 focus:outline-none focus:scale-[1.02] focus:ring-2 focus:ring-emerald-500 appearance-none cursor-pointer bg-white border border-gray-300"
                            value={formData.nacionalidade}
                            onChange={(e) =>
                              handleInputChange("nacionalidade", e.target.value)
                            }
                          >
                            {paises.map((pais, index) => (
                              <option key={index} value={pais.code}>
                                {pais.flag} {pais.name}
                              </option>
                            ))}
                          </select>
                          <div className="absolute right-3 top-1/2 transform -translate-y-1/2 flex items-center gap-2 z-10">
                            <span className="text-lg">
                              {getPaisSelecionado().flag}
                            </span>
                            <ChevronDown className="text-emerald-600 h-4 w-4" />
                          </div>
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-800">
                          Nome da Empresa *
                        </label>
                        <div className="relative group">
                          <Building className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600 h-4 w-4" />
                          <input
                            type="text"
                            required
                            className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-800 placeholder-gray-400 transition-all duration-300 focus:outline-none focus:scale-[1.02] focus:ring-2 focus:ring-emerald-500 bg-white border border-gray-300"
                            placeholder="Nome da empresa"
                            value={formData.nomeEmpresa}
                            onChange={(e) =>
                              handleInputChange("nomeEmpresa", e.target.value)
                            }
                          />
                        </div>
                      </div>

                      {/* Segunda linha - 2 campos */}
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-800">
                          NUIT *
                        </label>
                        <div className="relative group">
                          <FileText className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600 h-4 w-4" />
                          <input
                            type="text"
                            required
                            className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-800 placeholder-gray-400 transition-all duration-300 focus:outline-none focus:scale-[1.02] focus:ring-2 focus:ring-emerald-500 bg-white border border-gray-300"
                            placeholder="Número de referência fiscal"
                            value={formData.numeroReferenciaFiscal}
                            onChange={(e) =>
                              handleInputChange(
                                "numeroReferenciaFiscal",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-800">
                          Email / Email Institucional *
                        </label>
                        <div className="relative group">
                          <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600 h-4 w-4" />
                          <input
                            type="email"
                            required
                            className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-800 placeholder-gray-400 transition-all duration-300 focus:outline-none focus:scale-[1.02] focus:ring-2 focus:ring-emerald-500 bg-white border border-gray-300"
                            placeholder="empresa@email.com"
                            value={formData.email}
                            onChange={(e) =>
                              handleInputChange("email", e.target.value)
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* Upload de documentos para cliente empresarial (apenas livrete) */}
                    <div className="mt-8 pt-6 border-t border-gray-200">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="w-1 h-6 bg-blue-500 rounded-full" />
                        <h4 className="text-lg font-bold text-gray-900">
                          Documentos Obrigatórios
                        </h4>
                      </div>
                      
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Upload do Livrete (empresarial) */}
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-800">
                            Cópia do Livrete *
                          </label>
                          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 hover:border-emerald-500 transition-colors duration-300">
                            {!docLivrete ? (
                              <div className="text-center">
                                <Upload className="h-10 w-10 text-gray-400 mx-auto mb-2" />
                                <label className="cursor-pointer">
                                  <input
                                    type="file"
                                    accept=".pdf,.jpg,.jpeg,.png"
                                    className="hidden"
                                    onChange={(e) => handleFileUpload(e.target.files[0], 'livrete')}
                                  />
                                  <span className="text-emerald-600 hover:text-emerald-700">
                                    Clique para fazer upload
                                  </span>
                                </label>
                                <p className="text-xs text-gray-500 mt-1">
                                  PDF, JPG ou PNG (max 5MB)
                                </p>
                              </div>
                            ) : (
                              <div className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                  <File className="h-8 w-8 text-emerald-600" />
                                  <div>
                                    <p className="text-gray-800 text-sm">{docLivrete.name}</p>
                                    <p className="text-gray-500 text-xs">
                                      {(docLivrete.size / 1024 / 1024).toFixed(2)} MB
                                    </p>
                                  </div>
                                </div>
                                <button
                                  type="button"
                                  onClick={() => removerDocumento('livrete')}
                                  className="text-red-500 hover:text-red-600"
                                >
                                  <X className="h-5 w-5" />
                                </button>
                              </div>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Botões de Ação */}
            <div className="p-6 border-t border-emerald-200">
              <div className="flex justify-between items-center">
                <button
                  type="button"
                  className="px-8 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 border-2 font-semibold border-gray-300 text-gray-700 hover:bg-gray-50"
                >
                  Cancelar
                </button>

                <div className="flex gap-4">
                  <button
                    type="button"
                    onClick={() => setShowVehicleForm(true)}
                    className="px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center gap-3 group bg-blue-600 text-white hover:bg-blue-700"
                  >
                    <Car className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                    <span>Adicionar Veículo</span>
                  </button>

                  <button
                    type="submit"
                    disabled={salvandoCotacao}
                    className="px-8 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center gap-3 group bg-emerald-600 text-white hover:bg-emerald-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {salvandoCotacao ? (
                      <>
                        <Loader2 className="h-5 w-5 animate-spin" />
                        <span>Salvando...</span>
                      </>
                    ) : (
                      <>
                        <Save className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                        <span>Gerar Cotação</span>
                      </>
                    )}
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* FORMULÁRIO DE DADOS DA VIATURA */}
          {showVehicleForm && (
            <div className="space-y-6">
              <div className="p-6 border-b border-blue-200">
                <div className="flex items-center gap-3 mb-4">
                  <div className="w-1 h-8 bg-blue-500 rounded-full" />
                  <h3 className="text-xl font-bold text-gray-900">
                    Dados da Viatura
                  </h3>
                </div>

                {/* Seleção do Tipo de Cobertura */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-800">
                      Tipo de Cobertura *
                    </label>
                    <div className="relative group">
                      <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 h-4 w-4 z-10" />
                      <select
                        required
                        className="w-full pl-10 pr-10 py-3 rounded-lg text-gray-800 transition-all duration-300 focus:outline-none focus:scale-[1.02] focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer bg-white border border-gray-300"
                        value={tipoCobertura}
                        onChange={(e) => setTipoCobertura(e.target.value)}
                      >
                        <option value="">- Selecionar Cobertura -</option>
                        <option value="Seguro Automóvel Responsabilidade Civil Apenas">
                          Seguro Automóvel Responsabilidade Civil Apenas
                        </option>
                        <option value="Seguro Automóvel Responsabilidade Civil & Ocupantes">
                          Seguro Automóvel Responsabilidade Civil & Ocupantes
                        </option>
                        <option value="Seguro de Transporte Público">
                          Seguro de Transporte Público
                        </option>
                        <option value="Seguro Automóvel Todos os Riscos">
                          Seguro Automóvel Todos os Riscos
                        </option>
                      </select>
                      <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 h-4 w-4 z-10" />
                    </div>
                  </div>

                  {/* Campo de Classificação (aparece apenas quando cobertura é selecionada) */}
                  {tipoCobertura && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-800">
                        Classificação *
                      </label>
                      <div className="relative group">
                        <Shield className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 h-4 w-4 z-10" />
                        <select
                          required
                          className="w-full pl-10 pr-10 py-3 rounded-lg text-gray-800 transition-all duration-300 focus:outline-none focus:scale-[1.02] focus:ring-2 focus:ring-blue-500 appearance-none cursor-pointer bg-white border border-gray-300"
                          value={classificacao}
                          onChange={(e) => setClassificacao(e.target.value)}
                        >
                          <option value="">- Selecionar Classificação -</option>
                          {getClassificacoesDisponiveis().map((classe, index) => (
                            <option key={index} value={classe.nome}>
                              {classe.nome}
                            </option>
                          ))}
                        </select>
                        <ChevronDown className="absolute right-3 top-1/2 transform -translate-y-1/2 text-blue-600 h-4 w-4 z-10" />
                      </div>
                    </div>
                  )}
                </div>

                {/* Formulário de Dados do Veículo - 3 colunas */}
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-6">
                  {/* Primeira linha - 3 campos */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-800">
                      Marca *
                    </label>
                    <div className="relative group">
                      <Type className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 h-4 w-4" />
                      <input
                        type="text"
                        required
                        className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-800 placeholder-gray-400 transition-all duration-300 focus:outline-none focus:scale-[1.02] focus:ring-2 focus:ring-blue-500 bg-white border border-gray-300"
                        placeholder="Ex: Toyota"
                        value={veiculoAtual.marca}
                        onChange={(e) =>
                          handleVeiculoChange("marca", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-800">
                      Modelo *
                    </label>
                    <div className="relative group">
                      <Car className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 h-4 w-4" />
                      <input
                        type="text"
                        required
                        className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-800 placeholder-gray-400 transition-all duration-300 focus:outline-none focus:scale-[1.02] focus:ring-2 focus:ring-blue-500 bg-white border border-gray-300"
                        placeholder="Ex: Corolla"
                        value={veiculoAtual.modelo}
                        onChange={(e) =>
                          handleVeiculoChange("modelo", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  {/* Campo de Matrícula com seleção de país */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-800">
                      Matrícula *
                    </label>
                    <div className="relative">
                      {/* Botão para selecionar o país da matrícula */}
                      <button
                        type="button"
                        onClick={() => setShowMatriculaOptions(!showMatriculaOptions)}
                        className="w-full flex items-center justify-between pl-10 pr-4 py-3 rounded-lg text-gray-800 transition-all duration-300 bg-white border border-gray-300 hover:bg-gray-50"
                      >
                        <div className="flex items-center">
                          <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 h-4 w-4" />
                          <span>
                            {paisMatricula 
                              ? `${paisMatricula} — ${formatoMatricula?.exemplo || ""}` 
                              : "Selecionar país da matrícula"}
                          </span>
                        </div>
                        <ChevronDown className={`h-4 w-4 transition-transform duration-300 ${showMatriculaOptions ? "rotate-180" : ""}`} />
                      </button>
                      
                      {/* Dropdown de países de matrícula */}
                      {showMatriculaOptions && (
                        <div className="absolute z-50 mt-1 w-full bg-white border border-gray-300 rounded-lg shadow-xl max-h-60 overflow-y-auto">
                          {Object.keys(formatosMatricula).map((pais) => (
                            <button
                              key={pais}
                              type="button"
                              onClick={() => selecionarPaisMatricula(pais)}
                              className="w-full text-left px-4 py-3 hover:bg-gray-50 transition-colors duration-200 border-b border-gray-200 last:border-b-0"
                            >
                              <div className="font-medium text-gray-800">{pais}</div>
                              <div className="text-sm text-gray-600">{formatosMatricula[pais].descricao}</div>
                              <div className="text-xs text-blue-600 mt-1">Ex: {formatosMatricula[pais].exemplo}</div>
                            </button>
                          ))}
                        </div>
                      )}
                      
                      {/* Campo de entrada da matrícula (aparece após selecionar país) */}
                      {paisMatricula && (
                        <div className="mt-3">
                          <div className="relative group">
                            <Hash className="absolute left-3 top-1/2 transform -translate-y-1/2 text-emerald-600 h-4 w-4" />
                            <input
                              type="text"
                              required
                              className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-800 placeholder-gray-400 transition-all duration-300 focus:outline-none focus:scale-[1.02] focus:ring-2 focus:ring-emerald-500 bg-white border border-gray-300"
                              placeholder={formatoMatricula?.placeholder || "Digite a matrícula"}
                              value={veiculoAtual.matricula}
                              onChange={(e) => handleMatriculaChange(e.target.value)}
                              onBlur={(e) => {
                                const formatada = formatarMatricula(e.target.value);
                                handleMatriculaChange(formatada);
                              }}
                            />
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <div className="text-xs text-gray-600">
                              {paisMatricula === "Outros" 
                                ? "Formato livre" 
                                : `Formato: ${formatoMatricula?.formato}`}
                            </div>
                            {paisMatricula !== "Outros" && !validarMatricula() && veiculoAtual.matricula && (
                              <div className="text-xs text-red-600">
                                Formato inválido
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Segunda linha - 3 campos */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-800">
                      Ano
                    </label>
                    <div className="relative group">
                      <CalendarIcon className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 h-4 w-4" />
                      <input
                        type="number"
                        className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-800 placeholder-gray-400 transition-all duration-300 focus:outline-none focus:scale-[1.02] focus:ring-2 focus:ring-blue-500 bg-white border border-gray-300"
                        placeholder="Ex: 2023"
                        value={veiculoAtual.ano}
                        onChange={(e) =>
                          handleVeiculoChange("ano", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-800">
                      Motor
                    </label>
                    <div className="relative group">
                      <Cog className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 h-4 w-4" />
                      <input
                        type="text"
                        className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-800 placeholder-gray-400 transition-all duration-300 focus:outline-none focus:scale-[1.02] focus:ring-2 focus:ring-blue-500 bg-white border border-gray-300"
                        placeholder="Ex: 1.6L"
                        value={veiculoAtual.motor}
                        onChange={(e) =>
                          handleVeiculoChange("motor", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-800">
                      Chassis
                    </label>
                    <div className="relative group">
                      <Barcode className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 h-4 w-4" />
                      <input
                        type="text"
                        className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-800 placeholder-gray-400 transition-all duration-300 focus:outline-none focus:scale-[1.02] focus:ring-2 focus:ring-blue-500 bg-white border border-gray-300"
                        placeholder="Número do chassis"
                        value={veiculoAtual.chassis}
                        onChange={(e) =>
                          handleVeiculoChange("chassis", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  {/* Terceira linha - 3 campos */}
                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-800">
                      Lotação
                    </label>
                    <div className="relative group">
                      <Users className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 h-4 w-4" />
                      <input
                        type="number"
                        className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-800 placeholder-gray-400 transition-all duration-300 focus:outline-none focus:scale-[1.02] focus:ring-2 focus:ring-blue-500 bg-white border border-gray-300"
                        placeholder="Nº de passageiros"
                        value={veiculoAtual.lotacao}
                        onChange={(e) =>
                          handleVeiculoChange("lotacao", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <label className="block text-sm font-medium text-gray-800">
                      Capital Seguro (MT) *
                    </label>
                    <div className="relative group">
                      <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 h-4 w-4" />
                      <input
                        type="number"
                        required
                        className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-800 placeholder-gray-400 transition-all duration-300 focus:outline-none focus:scale-[1.02] focus:ring-2 focus:ring-blue-500 bg-white border border-gray-300"
                        placeholder="Valor em MT"
                        value={veiculoAtual.capitalSeguro}
                        onChange={(e) =>
                          handleVeiculoChange("capitalSeguro", e.target.value)
                        }
                      />
                    </div>
                  </div>

                  {classificacao && (
                    <div className="space-y-2">
                      <label className="block text-sm font-medium text-gray-800">
                        Taxa Aplicada
                      </label>
                      <div className="relative group">
                        <Calculator className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 h-4 w-4" />
                        <input
                          type="text"
                          readOnly
                          className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-800 font-semibold bg-gray-100 border border-gray-300"
                          value={veiculoAtual.taxaAplicada || ""}
                        />
                      </div>
                    </div>
                  )}

                  {/* Quarta linha - Informações de cálculo */}
                  <div className="space-y-2 lg:col-span-3">
                    <div className={`grid ${deveMostrarTrimestral(veiculoAtual.capitalSeguro) ? 
                      (deveMostrarMensal(veiculoAtual.capitalSeguro, debitoDiretoAtivo) ? 'grid-cols-1 md:grid-cols-5' : 'grid-cols-1 md:grid-cols-4') 
                      : 'grid-cols-1 md:grid-cols-3'} gap-4`}>
                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-800">
                          Prémio Annual (MT)
                        </label>
                        <div className="relative group">
                          <Calculator className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 h-4 w-4" />
                          <input
                            type="text"
                            readOnly
                            className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-800 font-semibold bg-gray-100 border border-gray-300"
                            value={
                              veiculoAtual.premioAnnual
                                ? formatarMoeda(veiculoAtual.premioAnnual)
                                : ""
                            }
                          />
                        </div>
                      </div>

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-800">
                          Prémio Semestral (MT)
                        </label>
                        <div className="relative group">
                          <Calculator className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 h-4 w-4" />
                          <input
                            type="text"
                            readOnly
                            className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-800 font-semibold bg-gray-100 border border-gray-300"
                            value={
                              veiculoAtual.premioSemestral
                                ? formatarMoeda(veiculoAtual.premioSemestral)
                                : ""
                            }
                          />
                        </div>
                      </div>

                      {deveMostrarTrimestral(veiculoAtual.capitalSeguro) && (
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-800">
                            Prémio Trimestral (MT)
                          </label>
                          <div className="relative group">
                            <Calculator className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 h-4 w-4" />
                            <input
                              type="text"
                              readOnly
                              className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-800 font-semibold bg-gray-100 border border-gray-300"
                              value={
                                veiculoAtual.premioTrimestral
                                  ? formatarMoeda(veiculoAtual.premioTrimestral)
                                  : ""
                              }
                            />
                          </div>
                        </div>
                      )}

                      {deveMostrarMensal(veiculoAtual.capitalSeguro, debitoDiretoAtivo) && (
                        <div className="space-y-2">
                          <label className="block text-sm font-medium text-gray-800">
                            Prémio Mensal (MT)
                          </label>
                          <div className="relative group">
                            <Calculator className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 h-4 w-4" />
                            <input
                              type="text"
                              readOnly
                              className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-800 font-semibold bg-gray-100 border border-gray-300"
                              value={
                                veiculoAtual.premioMensal
                                  ? formatarMoeda(veiculoAtual.premioMensal)
                                  : ""
                              }
                            />
                          </div>
                        </div>
                      )}

                      <div className="space-y-2">
                        <label className="block text-sm font-medium text-gray-800">
                          Prémio Mínimo (MT)
                        </label>
                        <div className="relative group">
                          <Calculator className="absolute left-3 top-1/2 transform -translate-y-1/2 text-blue-600 h-4 w-4" />
                          <input
                            type="text"
                            readOnly
                            className="w-full pl-10 pr-4 py-3 rounded-lg text-gray-800 font-semibold bg-gray-100 border border-gray-300"
                            value={
                              veiculoAtual.premioMinimo
                                ? formatarMoeda(veiculoAtual.premioMinimo)
                                : ""
                            }
                          />
                        </div>
                      </div>
                    </div>

                    {/* Mensagens informativas sobre os campos */}
                    <div className="mt-2 space-y-1">
                      {deveMostrarTrimestral(veiculoAtual.capitalSeguro) ? (
                        <div className="text-sm text-green-600 bg-green-50 p-2 rounded">
                          ✓ Campo <strong>Prémio Trimestral</strong> visível porque o Capital Seguro é superior a 12.000 MT
                        </div>
                      ) : veiculoAtual.capitalSeguro ? (
                        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          ℹ️ Campo <strong>Prémio Trimestral</strong> oculto porque o Capital Seguro é inferior ou igual a 12.000 MT
                        </div>
                      ) : null}
                      
                      {deveMostrarMensal(veiculoAtual.capitalSeguro, debitoDiretoAtivo) ? (
                        <div className="text-sm text-blue-600 bg-blue-50 p-2 rounded">
                          ✓ Campo <strong>Prémio Mensal</strong> visível porque Débito Direto está ativo E Capital Seguro é superior a 12.000 MT
                        </div>
                      ) : veiculoAtual.capitalSeguro && debitoDiretoAtivo ? (
                        <div className="text-sm text-gray-600 bg-gray-50 p-2 rounded">
                          ℹ️ Campo <strong>Prémio Mensal</strong> oculto porque o Capital Seguro é inferior ou igual a 12.000 MT (Débito Direto ativo)
                        </div>
                      ) : null}
                    </div>

                    {/* Opção de Débito Direto */}
                    <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="text-gray-800 font-medium">Pagamento via Débito Direto</h4>
                          <p className="text-gray-600 text-sm">
                            Ativar para aplicar taxa fixa de 15%
                          </p>
                        </div>
                        <label className="relative inline-flex items-center cursor-pointer">
                          <input
                            type="checkbox"
                            checked={debitoDiretoAtivo}
                            onChange={(e) => setDebitoDiretoAtivo(e.target.checked)}
                            className="sr-only peer"
                          />
                          <div className="w-11 h-6 bg-gray-300 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-blue-600"></div>
                        </label>
                      </div>
                      {debitoDiretoAtivo && (
                        <div className="mt-3 p-3 bg-blue-100 rounded">
                          <p className="text-gray-800 text-sm">
                            <strong>Taxa de 15% aplicada via Débito Direto</strong>
                          </p>
                          <p className="text-gray-700 text-xs mt-1">
                            Os cálculos foram atualizados com a nova taxa
                            {deveMostrarTrimestral(veiculoAtual.capitalSeguro) && " (incluindo Prémio Trimestral)"}
                            {deveMostrarMensal(veiculoAtual.capitalSeguro, debitoDiretoAtivo) && " e Prémio Mensal"}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>

                {/* Botão para Adicionar Veículo */}
                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={adicionarVeiculo}
                    className="px-6 py-3 rounded-lg font-semibold transition-all duration-300 transform hover:scale-105 hover:shadow-lg flex items-center gap-3 group bg-emerald-600 text-white hover:bg-emerald-700"
                  >
                    <Car className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                    <span>Adicionar Veículo à Lista</span>
                  </button>
                </div>
              </div>

              {/* Lista de Veículos Adicionados */}
              {veiculos.length > 0 && (
                <div className="p-6 border-t border-blue-200">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-1 h-6 bg-emerald-500 rounded-full" />
                    <h4 className="text-lg font-bold text-gray-900">
                      Veículos Adicionados
                    </h4>
                    <span className="px-2 py-1 bg-emerald-100 text-emerald-800 text-sm rounded-full">
                      {veiculos.length}
                    </span>
                  </div>

                  <div className="space-y-3">
                    {veiculos.map((veiculo) => {
                      const capital = parseFloat(veiculo.capitalSeguro) || 0;
                      const mostrarTrimestral = capital > 12000;
                      const mostrarMensal = debitoDiretoAtivo && capital > 12000;
                      
                      return (
                        <div
                          key={veiculo.id}
                          className="p-4 rounded-lg flex justify-between items-center transition-all duration-300 hover:scale-[1.02] bg-emerald-50 border border-emerald-200"
                        >
                          <div>
                            <div className="font-semibold text-gray-800">
                              {veiculo.marca} {veiculo.modelo} • {veiculo.tipoCobertura}
                            </div>
                            <div className="text-sm text-gray-700">
                              Classificação: {veiculo.classificacao}
                            </div>
                            <div className="text-sm text-gray-700">
                              Matrícula: {veiculo.matriculaCompleta || veiculo.matricula}
                            </div>
                            <div className="text-sm text-gray-700">
                              Capital: MT{" "}
                              {parseFloat(veiculo.capitalSeguro).toLocaleString(
                                "pt-MZ"
                              )}{" "}
                              • Taxa: {veiculo.taxaAplicada} •
                              Prémio Anual: MT{" "}
                              {parseFloat(veiculo.premioAnnual).toLocaleString(
                                "pt-MZ",
                                { minimumFractionDigits: 2 }
                              )} •
                              Prémio Semestral: MT{" "}
                              {parseFloat(veiculo.premioSemestral).toLocaleString(
                                "pt-MZ",
                                { minimumFractionDigits: 2 }
                              )}
                              {mostrarTrimestral && (
                                <span> • Prémio Trimestral: MT{" "}
                                  {parseFloat(veiculo.premioTrimestral || (parseFloat(veiculo.premioAnnual) / 4)).toLocaleString(
                                    "pt-MZ",
                                    { minimumFractionDigits: 2 }
                                  )}</span>
                              )}
                              {mostrarMensal && (
                                <span> • Prémio Mensal: MT{" "}
                                  {parseFloat(veiculo.premioMensal || (parseFloat(veiculo.premioAnnual) / 12)).toLocaleString(
                                    "pt-MZ",
                                    { minimumFractionDigits: 2 }
                                  )}</span>
                              )}
                            </div>
                          </div>
                          <button
                            type="button"
                            onClick={() => removerVeiculo(veiculo.id)}
                            className="px-3 py-1 rounded text-red-600 hover:text-red-700 transition-colors duration-300 bg-red-50 border border-red-200"
                          >
                            Remover
                          </button>
                        </div>
                      );
                    })}
                  </div>

                  {/* Total do Prémio */}
                  <div className="mt-6 p-4 rounded-lg text-center bg-blue-50 border border-blue-200">
                    <div className="text-lg font-bold text-gray-800">
                      Total do Prémio Anual:{" "}
                      {formatarMoeda(calcularTotalPremio())}
                    </div>
                    <div className="text-sm text-gray-700 mt-1">
                      Semestral: {formatarMoeda(calcularTotalPremio() / 2)}
                      {deveMostrarCamposEspeciaisNoTotal() && (
                        <>
                          <span> • Trimestral: {formatarMoeda(calcularTotalPremio() / 4)}</span>
                          {debitoDiretoAtivo && (
                            <span> • Mensal: {formatarMoeda(calcularTotalPremio() / 12)}</span>
                          )}
                        </>
                      )}
                    </div>
                    <div className="text-sm text-gray-600 mt-1">
                      {veiculos.length} veículo(s) adicionado(s)
                    </div>
                    {debitoDiretoAtivo && (
                      <div className="text-sm text-blue-700 mt-2">
                        * Cálculos com taxa de 15% via Débito Direto
                      </div>
                    )}
                  </div>
                </div>
              )}

              {/* Botões de Ação do Formulário da Viatura */}
              <div className="p-6 border-t border-blue-200">
                <div className="flex justify-between items-center">
                  <button
                    type="button"
                    onClick={() => setShowVehicleForm(false)}
                    className="px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 border-2 font-semibold border-gray-300 text-gray-700 hover:bg-gray-50"
                  >
                    Fechar Formulário
                  </button>

                  <div className="flex gap-4">
                    <button
                      type="button"
                      onClick={() => {
                        setVeiculos([]);
                        setVeiculoAtual({
                          marca: "",
                          modelo: "",
                          matricula: "",
                          matriculaCompleta: "",
                          ano: "",
                          motor: "",
                          chassis: "",
                          lotacao: "",
                          capitalSeguro: "",
                          taxa: "",
                          premioAnnual: "",
                          premioSemestral: "",
                          premioTrimestral: "",
                          premioMensal: "",
                          premioMinimo: "",
                          taxaAplicada: "",
                        });
                        setTipoCobertura("");
                        setClassificacao("");
                        setPaisMatricula("");
                        setFormatoMatricula(null);
                        setDebitoDiretoAtivo(false);
                      }}
                      className="px-6 py-3 rounded-lg transition-all duration-300 transform hover:scale-105 border-2 font-semibold border-red-300 text-red-600 hover:bg-red-50"
                    >
                      Limpar Tudo
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </form>

        {/* MODAL DE PARTILHA DA COTAÇÃO */}
        {mostrarOpcoesPartilha && cotacaoGerada && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="rounded-xl border w-full max-w-2xl bg-white border-emerald-200">
              <div className="p-6 border-b border-emerald-200">
                <div className="flex items-center justify-between mb-4">
                  <div className="flex items-center gap-3">
                    <div className="w-1 h-8 bg-emerald-500 rounded-full" />
                    <h3 className="text-xl font-bold text-gray-900">
                      Partilhar Cotação
                    </h3>
                  </div>
                  <button
                    onClick={() => setMostrarOpcoesPartilha(false)}
                    className="text-gray-500 hover:text-gray-700 transition-colors duration-300"
                  >
                    <X className="h-6 w-6" />
                  </button>
                </div>

                <div className="space-y-4">
                  <div className="p-4 rounded-lg bg-gray-50 border border-gray-200">
                    <div className="text-gray-800 font-semibold">
                      Cotação: {cotacaoGerada.id}
                    </div>
                    <div className="text-gray-600 text-sm">
                      Cliente: {cotacaoGerada.cliente.primeiroNome}{" "}
                      {cotacaoGerada.cliente.sobrenome}
                    </div>
                    <div className="text-gray-600 text-sm">
                      Email: {cotacaoGerada.cliente.email}
                    </div>
                    <div className="text-gray-600 text-sm">
                      Total: {formatarMoeda(cotacaoGerada.totalPremio)}
                    </div>
                    <div className="text-gray-600 text-sm">
                      Veículos: {cotacaoGerada.veiculos.length}
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <button
                      onClick={visualizarPDF}
                      className="p-4 rounded-lg border-2 border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white transition-all duration-300 transform hover:scale-105 flex flex-col items-center justify-center gap-2"
                    >
                      <Eye className="h-8 w-8" />
                      <span className="font-semibold">Visualizar</span>
                      <span className="text-xs text-gray-600">Ver PDF</span>
                    </button>

                    <button
                      onClick={gerarPDF}
                      className="p-4 rounded-lg border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all duration-300 transform hover:scale-105 flex flex-col items-center justify-center gap-2"
                    >
                      <Download className="h-8 w-8" />
                      <span className="font-semibold">Download</span>
                      <span className="text-xs text-gray-600">Baixar PDF</span>
                    </button>

                    <button
                      onClick={imprimirCotacao}
                      className="p-4 rounded-lg border-2 border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white transition-all duration-300 transform hover:scale-105 flex flex-col items-center justify-center gap-2"
                    >
                      <Printer className="h-8 w-8" />
                      <span className="font-semibold">Imprimir</span>
                      <span className="text-xs text-gray-600">Imprimir</span>
                    </button>

                    <button
                      onClick={enviarEmail}
                      disabled={enviandoEmail}
                      className="p-4 rounded-lg border-2 border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white transition-all duration-300 transform hover:scale-105 flex flex-col items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {enviandoEmail ? (
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-orange-500"></div>
                      ) : (
                        <Send className="h-8 w-8" />
                      )}
                      <span className="font-semibold">
                        {enviandoEmail ? "Enviando..." : "Enviar Email"}
                      </span>
                      <span className="text-xs text-gray-600">
                        Para o cliente
                      </span>
                    </button>
                  </div>

                  <div className="text-center text-sm text-gray-500 mt-4">
                    A cotação foi salva com ID: {cotacaoGerada.id}
                  </div>
                </div>
              </div>

              <div className="p-4 border-t border-emerald-200">
                <button
                  onClick={() => setMostrarOpcoesPartilha(false)}
                  className="w-full py-3 rounded-lg bg-gray-100 text-gray-700 hover:bg-gray-200 transition-all duration-300"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default CriarCliente;