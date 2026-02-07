import React, { useState, useEffect } from "react";
import {
  Save,
  Search,
  Edit3,
  User,
  Car,
  Calendar,
  Download,
  Send,
  Printer,
  Eye,
  X,
  Plus,
  Trash2,
} from "lucide-react";
import CotacoesLayout from "../components/CotacoesLayout";
import { jsPDF } from "jspdf";
import logo from "../assets/logo.png";
import { cotacaoService } from "../services/api";

const loadLogo = (src) =>
  new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = src;
  });

function EditarCotacao() {
  const [cotacaoId, setCotacaoId] = useState("");
  const [formData, setFormData] = useState(null);
  const [isLoading, setIsLoading] = useState(false);
  const [mostrarOpcoesPartilha, setMostrarOpcoesPartilha] = useState(false);
  const [processandoEmail, setProcessandoEmail] = useState(false);

  // Configurações das coberturas (mesmas do CriarCliente)
  const configCoberturas = {
    DP_NORMAL: {
      nome: "DP NORMAL - Danos Próprios com Franquia",
      taxas: {
        Ligeiro: 0.035,
        Pesado: 0.05,
      },
      coberturas: {
        responsabilidadeCivil: 5000000,
        morteInvalidez: 100000,
        despesasMedicas: 20000,
        despesasFuneral: 5000,
        perdaChaves: 35000,
        remocaoSalvados: 52500,
      },
    },
    DP_SEM_FRANQUIA: {
      nome: "DP SEM FRANQUIA - Danos Próprios sem Franquia",
      taxas: {
        Ligeiro: 0.035,
        Pesado: 0.05,
      },
      coberturas: {
        responsabilidadeCivil: 10000000,
        morteInvalidez: 250000,
        despesasMedicas: 85000,
        despesasFuneral: 25000,
        perdaChaves: 55000,
        remocaoSalvados: 65000,
      },
    },
    RC_NORMAL: {
      nome: "RC NORMAL - Apenas Responsabilidade Civil",
      taxas: {
        Ligeiro: 0.045,
        Pesado: 0.05,
      },
      coberturas: {
        responsabilidadeCivil: 4000000,
        morteInvalidez: 0,
        despesasMedicas: 0,
        despesasFuneral: 0,
      },
    },
    RC_OCUPANTES: {
      nome: "RC & OCUPANTES - RC + Cobertura para Ocupantes",
      taxas: {
        Ligeiro: 0.035,
        Pesado: 0.05,
      },
      coberturas: {
        responsabilidadeCivil: 4000000,
        morteInvalidez: 100000,
        despesasMedicas: 20000,
        despesasFuneral: 5000,
      },
    },
  };

  // Buscar cotação do backend por ID ou número de cotação
  const buscarCotacao = async () => {
    if (!cotacaoId) {
      alert("Por favor, digite o ID ou número da cotação.");
      return;
    }

    setIsLoading(true);

    try {
      // Tentar buscar por ID numérico primeiro
      let cotacaoIdNumero = parseInt(cotacaoId);
      let result;

      if (!isNaN(cotacaoIdNumero)) {
        // Se for um número, buscar por ID
        result = await cotacaoService.buscarPorId(cotacaoIdNumero);
      } else {
        // Se não for número, buscar por número de cotação
        // Primeiro listar todas e filtrar
        const listResult = await cotacaoService.listar({ limit: 1000, search: cotacaoId });
        if (listResult.success && listResult.data.length > 0) {
          const cotacaoEncontrada = listResult.data.find(
            c => c.numero_cotacao === cotacaoId || c.numero_cotacao?.toUpperCase() === cotacaoId.toUpperCase()
          );
          if (cotacaoEncontrada) {
            result = await cotacaoService.buscarPorId(cotacaoEncontrada.id);
          } else {
            result = { success: false, message: "Cotação não encontrada" };
          }
        } else {
          result = { success: false, message: "Cotação não encontrada" };
        }
      }

      if (result.success && result.data) {
        const cotacao = result.data;
        
        // Mapear dados do backend para o formato esperado pelo formulário
        setFormData({
          id: cotacao.id,
          numero_cotacao: cotacao.numero_cotacao,
          cliente: {
            tipo: cotacao.cliente?.tipo || 'Particular',
            primeiroNome: cotacao.primeiro_nome || cotacao.cliente?.primeiro_nome || '',
            sobrenome: cotacao.sobrenome || cotacao.cliente?.sobrenome || '',
            email: cotacao.cliente_email || cotacao.cliente?.email || '',
            telefone: cotacao.cliente_telefone || cotacao.cliente?.telefone || '',
            numeroDocumento: cotacao.cliente?.numero_documento || '',
            dataNascimento: cotacao.cliente?.data_nascimento || '',
            nomeEmpresa: cotacao.cliente?.nome_empresa || '',
            numeroReferenciaFiscal: cotacao.cliente?.numero_referencia_fiscal || '',
            nacionalidade: cotacao.cliente?.nacionalidade || 'MZ',
            tituloContato: cotacao.cliente?.titulo_contato || ''
          },
          veiculos: (cotacao.veiculos || []).map((veiculo) => ({
            id: veiculo.id || Date.now() + Math.random(),
            marca: veiculo.marca || '',
            modelo: veiculo.modelo || '',
            marcaModelo: `${veiculo.marca || ''} ${veiculo.modelo || ''}`.trim(),
            matricula: veiculo.matricula || '',
            matriculaCompleta: veiculo.matricula_completa || veiculo.matricula || '',
            ano: veiculo.ano || '',
            motor: veiculo.numero_motor || '',
            chassis: veiculo.numero_chassi || '',
            lotacao: veiculo.lotacao || '',
            tipoViatura: veiculo.tipo_viatura || "Ligeiro",
            capitalSeguro: veiculo.capital_seguro || '',
            taxa: veiculo.taxa || '',
            premioAnnual: veiculo.premio_anual || '',
            premioSemestral: veiculo.premio_semestral || '',
            premioTrimestral: veiculo.premio_trimestral || '',
            premioMensal: veiculo.premio_mensal || '',
            tipoCobertura: veiculo.tipo_cobertura || "DP_NORMAL",
            ...veiculo,
          })),
          totalPremio: parseFloat(cotacao.total_premio) || 0,
          status: cotacao.status || 'pendente',
          dataCriacao: cotacao.data_criacao || cotacao.created_at,
          dataValidade: cotacao.data_validade
        });
      } else {
        alert(`❌ ${result.message || "Cotação não encontrada!"}`);
        setFormData(null);
      }
    } catch (error) {
      console.error("Erro ao buscar cotação:", error);
      alert(`❌ Erro ao buscar cotação: ${error.response?.data?.message || error.message || 'Erro desconhecido'}`);
      setFormData(null);
    } finally {
      setIsLoading(false);
    }
  };

  // Função para calcular prémio
  const calcularPremio = (veiculo) => {
    const config = configCoberturas[veiculo.tipoCobertura];
    if (!config || !veiculo.tipoViatura || !veiculo.capitalSeguro) {
      return "0.00";
    }

    const capital = parseFloat(veiculo.capitalSeguro) || 0;
    const taxa = config.taxas[veiculo.tipoViatura] || 0;

    if (capital === 0 || taxa === 0) return "0.00";

    const premioCalculado = capital * taxa;
    return premioCalculado.toFixed(2);
  };

  // Atualizar prémio quando os campos mudarem
  useEffect(() => {
    if (formData && formData.veiculos) {
      const veiculosAtualizados = formData.veiculos.map((veiculo) => ({
        ...veiculo,
        premioAnnual: calcularPremio(veiculo),
        taxa:
          configCoberturas[veiculo.tipoCobertura]?.taxas[veiculo.tipoViatura] ||
          0,
      }));

      // Atualizar total
      const totalPremio = veiculosAtualizados.reduce(
        (total, veiculo) => total + (parseFloat(veiculo.premioAnnual) || 0),
        0
      );

      setFormData((prev) => ({
        ...prev,
        veiculos: veiculosAtualizados,
        totalPremio,
      }));
    }
  }, [formData?.veiculos]);

  const handleSubmit = (e) => {
    e.preventDefault();

    // Atualizar cotação no localStorage
    const cotacoes = carregarCotacoes();
    const index = cotacoes.findIndex((c) => c.id === formData.id);

    if (index !== -1) {
      cotacoes[index] = {
        ...formData,
        dataAtualizacao: new Date().toISOString(),
      };
      localStorage.setItem("cotacoes", JSON.stringify(cotacoes));
      alert("Cotação atualizada com sucesso!");
      setMostrarOpcoesPartilha(true);
    }
  };

  // Funções para manipular veículos
  const adicionarVeiculo = () => {
    const novoVeiculo = {
      id: Date.now() + Math.random(),
      marcaModelo: "",
      matricula: "",
      ano: "",
      motor: "",
      chassis: "",
      lotacao: "",
      tipoViatura: "Ligeiro",
      capitalSeguro: "",
      taxa: 0,
      premioAnnual: "0.00",
      tipoCobertura: "DP_NORMAL",
    };

    setFormData((prev) => ({
      ...prev,
      veiculos: [...prev.veiculos, novoVeiculo],
    }));
  };

  const removerVeiculo = (id) => {
    setFormData((prev) => ({
      ...prev,
      veiculos: prev.veiculos.filter((v) => v.id !== id),
    }));
  };

  const atualizarVeiculo = (id, campo, valor) => {
    setFormData((prev) => ({
      ...prev,
      veiculos: prev.veiculos.map((veiculo) =>
        veiculo.id === id ? { ...veiculo, [campo]: valor } : veiculo
      ),
    }));
  };

  // Função para gerar PDF da cotação atualizada
  const gerarPDF = async () => {
    if (!formData) return;

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
    doc.setFillColor(255, 255, 255);
    doc.rect(0, 0, 210, 40, "F");

    try {
      const img = await loadLogo(logo);
      doc.addImage(img, "PNG", margin, 8, 26, 26);
    } catch (e) {
      // fallback sem imagem
    }

    doc.setFontSize(20);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(0, 0, 0);
    doc.text("Imperial Seguros", margin + 32, 20);

    doc.setFontSize(12);
    doc.setTextColor(0, 0, 0);
    doc.text("Cotação Atualizada", margin + 32, 32);

    yPosition = 50;

    // Título
    doc.setFontSize(16);
    doc.setTextColor(22, 101, 52);
    doc.text("COTAÇÃO DE SEGURO - ATUALIZADA", margin, yPosition);

    yPosition += 10;
    doc.setFontSize(10);
    doc.setTextColor(100, 100, 100);
    doc.text(
      `Nº: ${formData.id} | Atualizada em: ${new Date().toLocaleDateString(
        "pt-MZ"
      )}`,
      margin,
      yPosition
    );

    // Informações do Segurado
    yPosition += 15;
    checkPageBreak(30);

    doc.setFillColor(240, 240, 240);
    doc.rect(margin, yPosition, 170, 8, "F");
    doc.setFontSize(11);
    doc.setFont("helvetica", "bold");
    doc.setTextColor(22, 101, 52);
    doc.text("INFORMAÇÕES DO SEGURADO", margin + 2, yPosition + 6);

    yPosition += 15;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(0, 0, 0);

    const infoCliente = [
      `Nome: ${formData.cliente.tituloContato || ""} ${
        formData.cliente.primeiroNome
      } ${formData.cliente.sobrenome}`,
      `Email: ${formData.cliente.email}`,
      `Telefone: ${formData.cliente.telefone}`,
      `Documento: ${formData.cliente.numeroDocumento}`,
      `Tipo: ${formData.cliente.tipo}`,
      `Status: ${formData.status}`,
    ];

    infoCliente.forEach((info) => {
      doc.text(info, margin, yPosition);
      yPosition += lineHeight;
    });

    // Detalhes dos Veículos Atualizados
    formData.veiculos.forEach((veiculo, index) => {
      yPosition += 20;
      checkPageBreak(100);

      doc.setFillColor(240, 240, 240);
      doc.rect(margin, yPosition, 170, 8, "F");
      doc.setFont("helvetica", "bold");
      doc.setTextColor(22, 101, 52);
      doc.text(`VIATURA ${index + 1} - ATUALIZADA`, margin + 2, yPosition + 6);

      yPosition += 15;
      doc.setFont("helvetica", "normal");
      doc.setTextColor(0, 0, 0);

      const infoVeiculo = [
        `Marca/Modelo: ${veiculo.marcaModelo}`,
        `Matrícula: ${veiculo.matricula || "Por atribuir"}`,
        `Ano: ${veiculo.ano || "N/A"}`,
        `Motor: ${veiculo.motor || "N/A"}`,
        `Chassis: ${veiculo.chassis || "N/A"}`,
        `Lotação: ${veiculo.lotacao || "N/A"}`,
        `Tipo: ${veiculo.tipoViatura}`,
        `Cobertura: ${configCoberturas[veiculo.tipoCobertura]?.nome || "N/A"}`,
        `Capital Seguro: MT ${parseFloat(veiculo.capitalSeguro).toLocaleString(
          "pt-MZ"
        )}`,
        `Taxa: ${(veiculo.taxa * 100).toFixed(1)}%`,
        `Prémio Annual: MT ${parseFloat(veiculo.premioAnnual).toLocaleString(
          "pt-MZ",
          { minimumFractionDigits: 2 }
        )}`,
      ];

      infoVeiculo.forEach((info) => {
        if (yPosition > pageHeight - 20) {
          doc.addPage();
          yPosition = margin;
        }
        doc.text(info, margin, yPosition);
        yPosition += lineHeight;
      });
    });

    // Total Atualizado
    yPosition += 15;
    checkPageBreak(20);

    doc.setFillColor(22, 101, 52);
    doc.rect(margin, yPosition, 170, 10, "F");
    doc.setFont("helvetica", "bold");
    doc.setTextColor(255, 255, 255);
    doc.text("TOTAL ATUALIZADO", margin + 2, yPosition + 7);
    doc.text(
      `MT ${parseFloat(formData.totalPremio).toLocaleString("pt-MZ", {
        minimumFractionDigits: 2,
      })}`,
      150,
      yPosition + 7
    );
    yPosition += 14;
    doc.setFont("helvetica", "normal");
    doc.setTextColor(60, 60, 60);
    doc.text(
      `Prémio Semestral: MT ${parseFloat(formData.totalPremio / 2).toLocaleString("pt-MZ", {
        minimumFractionDigits: 2,
      })}`,
      margin,
      yPosition
    );
    doc.text(
      `Prémio Trimestral: MT ${parseFloat(formData.totalPremio / 4).toLocaleString("pt-MZ", {
        minimumFractionDigits: 2,
      })}`,
      margin,
      yPosition + 6
    );

    // Rodapé
    const ultimaPagina = doc.internal.getNumberOfPages();
    doc.setPage(ultimaPagina);

    yPosition = pageHeight - 30;
    doc.setFillColor(22, 101, 52);
    doc.rect(0, yPosition, 210, 30, "F");

    doc.setFontSize(8);
    doc.setTextColor(255, 255, 255);
    doc.text(
      "Imperial Seguros Moçambique, S.A. | www.imperialinsurance-mz.com",
      margin,
      yPosition + 8
    );
    doc.text(
      `Documento atualizado em ${new Date().toLocaleString("pt-MZ")}`,
      margin,
      yPosition + 16
    );

    doc.save(`cotacao-atualizada-${formData.id}.pdf`);
  };

  // Função para visualizar PDF
  const visualizarPDF = async () => {
    await gerarPDF();
  };

  // Função para imprimir
  const imprimirCotacao = () => {
    const conteudo = `
      <html>
        <head>
          <title>Cotacao Atualizada ${formData.id}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            .header { text-align: center; margin-bottom: 30px; border-bottom: 2px solid #333; padding-bottom: 20px; }
            .section { margin-bottom: 20px; padding: 15px; border: 1px solid #ddd; border-radius: 5px; }
            .table { width: 100%; border-collapse: collapse; margin: 10px 0; }
            .table th, .table td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            .table th { background-color: #f5f5f5; }
            .total { font-weight: bold; font-size: 1.2em; color: #2d3748; background-color: #e2e8f0; padding: 10px; }
            .update-info { background-color: #fff3cd; padding: 10px; border-radius: 5px; margin: 10px 0; }
            .vehicle-card { background: #f8f9fa; padding: 15px; margin: 10px 0; border-radius: 5px; border-left: 4px solid #007bff; }
          </style>
        </head>
        <body>
          <div class="header">
            <h1>Imperial Seguros</h1>
            <h2>COTAÇÃO DE SEGURO - ATUALIZADA</h2>
            <div class="update-info">
              <strong>Atualizada em:</strong> ${new Date().toLocaleDateString(
                "pt-MZ"
              )}
            </div>
          </div>
          
          <div class="section">
            <h3>INFORMAÇÕES DO SEGURADO</h3>
            <p><strong>Nome:</strong> ${formData.cliente.tituloContato || ""} ${
      formData.cliente.primeiroNome
    } ${formData.cliente.sobrenome}</p>
            <p><strong>Email:</strong> ${formData.cliente.email}</p>
            <p><strong>Telefone:</strong> ${formData.cliente.telefone}</p>
            <p><strong>Documento:</strong> ${
              formData.cliente.numeroDocumento
            }</p>
            <p><strong>Status:</strong> ${formData.status}</p>
          </div>

          <div class="section">
            <h3>VEÍCULOS SEGURADOS - ATUALIZADOS</h3>
            ${formData.veiculos
              .map(
                (veiculo, index) => `
              <div class="vehicle-card">
                <h4>Viatura ${index + 1}: ${veiculo.marcaModelo}</h4>
                <p><strong>Matrícula:</strong> ${
                  veiculo.matricula || "Por atribuir"
                }</p>
                <p><strong>Ano:</strong> ${veiculo.ano || "N/A"}</p>
                <p><strong>Motor:</strong> ${veiculo.motor || "N/A"}</p>
                <p><strong>Chassis:</strong> ${veiculo.chassis || "N/A"}</p>
                <p><strong>Lotacao:</strong> ${veiculo.lotacao || "N/A"}</p>
                <p><strong>Tipo:</strong> ${veiculo.tipoViatura}</p>
                <p><strong>Cobertura:</strong> ${
                  configCoberturas[veiculo.tipoCobertura]?.nome || "N/A"
                }</p>
                <p><strong>Capital Seguro:</strong> MT ${parseFloat(
                  veiculo.capitalSeguro
                ).toLocaleString("pt-MZ")}</p>
                <p><strong>Prémio:</strong> MT ${parseFloat(
                  veiculo.premioAnnual
                ).toLocaleString("pt-MZ", { minimumFractionDigits: 2 })}</p>
              </div>
            `
              )
              .join("")}
          </div>

          <div class="total">
            TOTAL ATUALIZADO: MT ${parseFloat(
              formData.totalPremio
            ).toLocaleString("pt-MZ", { minimumFractionDigits: 2 })}
          </div>
        </body>
      </html>
    `;

    const janela = window.open("", "_blank");
    janela.document.write(conteudo);
    janela.document.close();
    janela.print();
  };

  // Função para enviar email
  const enviarEmail = async () => {
    if (!formData) return;

    if (!formData.cliente?.email) {
      alert("❌ O cliente não tem email cadastrado.");
      return;
    }

    const confirmarEnvio = window.confirm(
      `Deseja enviar a cotação ${formData.numero_cotacao || formData.id} por email para ${formData.cliente.email}?`
    );
    
    if (!confirmarEnvio) {
      return;
    }

    try {
      setProcessandoEmail(true);

      const result = await cotacaoService.enviarEmail(formData.id);
      
      if (result.success) {
        alert(`✅ Email enviado com sucesso para ${formData.cliente.email}!`);
        setMostrarOpcoesPartilha(false);
      } else {
        alert(`❌ Erro ao enviar email: ${result.message || 'Erro desconhecido'}`);
      }
    } catch (error) {
      console.error("Erro ao enviar email:", error);
      alert(`❌ Erro ao enviar email: ${error.response?.data?.message || error.message || 'Erro desconhecido'}`);
    } finally {
      setProcessandoEmail(false);
    }
  };

  return (
    <CotacoesLayout
      title="Editar Cotação"
      subtitle="Busque e edite cotações existentes no sistema"
    >
      <div className="p-8 bg-white min-h-screen">
        {/* Busca de Cotação */}
        <div className="bg-white rounded-lg p-6 mb-8">
          <div className="flex items-center mb-4">
            <Search className="h-6 w-6 text-emerald-600 mr-3" />
            <h3 className="text-xl font-semibold text-gray-900">Buscar Cotação</h3>
          </div>
          <div className="flex space-x-4">
            <input
              type="text"
              placeholder="Digite o ID da cotação (ex: CT001)"
              className="flex-1 px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 placeholder-gray-500 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300"
              value={cotacaoId}
              onChange={(e) => setCotacaoId(e.target.value.toUpperCase())}
            />
            <button
              onClick={buscarCotacao}
              disabled={isLoading}
              className="px-6 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-all duration-300 hover:scale-105 flex items-center space-x-2 disabled:opacity-50"
            >
              <Search className="h-5 w-5" />
              <span>{isLoading ? "Buscando..." : "Buscar"}</span>
            </button>
          </div>
        </div>

        {/* Formulário de Edição */}
        {formData && (
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="bg-white rounded-lg p-6">
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center">
                  <Edit3 className="h-6 w-6 text-emerald-600 mr-3" />
                  <h3 className="text-xl font-semibold text-gray-900">
                    Editando: {formData.id}
                  </h3>
                </div>
                <span className="px-3 py-1 bg-emerald-100 text-emerald-800 rounded-full text-sm font-medium border border-emerald-200">
                  {formData.status}
                </span>
              </div>

              {/* Dados do Cliente */}
              <div className="mb-8">
                <h4 className="text-lg font-semibold text-gray-900 mb-4 border-b border-gray-200 pb-2">
                  Dados do Cliente
                </h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      Primeiro Nome *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300"
                      value={formData.cliente.primeiroNome}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cliente: {
                            ...formData.cliente,
                            primeiroNome: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      Sobrenome *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300"
                      value={formData.cliente.sobrenome}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cliente: {
                            ...formData.cliente,
                            sobrenome: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      Email *
                    </label>
                    <input
                      type="email"
                      required
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300"
                      value={formData.cliente.email}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cliente: {
                            ...formData.cliente,
                            email: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      Telefone *
                    </label>
                    <input
                      type="tel"
                      required
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300"
                      value={formData.cliente.telefone}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cliente: {
                            ...formData.cliente,
                            telefone: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      Nº Documento *
                    </label>
                    <input
                      type="text"
                      required
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300"
                      value={formData.cliente.numeroDocumento}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cliente: {
                            ...formData.cliente,
                            numeroDocumento: e.target.value,
                          },
                        })
                      }
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-800 mb-2">
                      Tipo de Cliente
                    </label>
                    <select
                      className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300"
                      value={formData.cliente.tipo}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          cliente: {
                            ...formData.cliente,
                            tipo: e.target.value,
                          },
                        })
                      }
                    >
                      <option value="Particular">Particular</option>
                      <option value="Empresarial">Empresarial</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* Dados dos Veículos */}
              <div className="mb-6">
                <div className="flex items-center justify-between mb-4">
                  <h4 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Veículos Segurados
                  </h4>
                  <button
                    type="button"
                    onClick={adicionarVeiculo}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-all duration-300 flex items-center space-x-2"
                  >
                    <Plus className="h-4 w-4" />
                    <span>Adicionar Veículo</span>
                  </button>
                </div>

                <div className="space-y-6">
                  {formData.veiculos.map((veiculo, index) => (
                    <div
                      key={veiculo.id}
                      className="p-6 bg-gray-50 rounded-lg"
                    >
                      <div className="flex items-center justify-between mb-4">
                        <h5 className="text-lg font-semibold text-gray-800">
                          Viatura {index + 1}
                        </h5>
                        <button
                          type="button"
                          onClick={() => removerVeiculo(veiculo.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors duration-200"
                          title="Remover veículo"
                        >
                          <Trash2 className="h-4 w-4" />
                        </button>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-4">
                        {/* Marca/Modelo */}
                        <div>
                          <label className="block text-sm font-medium text-gray-800 mb-2">
                            Marca/Modelo *
                          </label>
                          <input
                            type="text"
                            required
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all duration-300"
                            value={veiculo.marcaModelo}
                            onChange={(e) =>
                              atualizarVeiculo(
                                veiculo.id,
                                "marcaModelo",
                                e.target.value
                              )
                            }
                            placeholder="Ex: Toyota Corolla"
                          />
                        </div>

                        {/* Matrícula */}
                        <div>
                          <label className="block text-sm font-medium text-gray-800 mb-2">
                            Matrícula
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all duration-300"
                            value={veiculo.matricula}
                            onChange={(e) =>
                              atualizarVeiculo(
                                veiculo.id,
                                "matricula",
                                e.target.value
                              )
                            }
                            placeholder="Ex: AB-123-CD"
                          />
                        </div>

                        {/* Ano */}
                        <div>
                          <label className="block text-sm font-medium text-gray-800 mb-2">
                            Ano
                          </label>
                          <input
                            type="number"
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all duration-300"
                            value={veiculo.ano}
                            onChange={(e) =>
                              atualizarVeiculo(
                                veiculo.id,
                                "ano",
                                e.target.value
                              )
                            }
                            placeholder="Ex: 2023"
                          />
                        </div>

                        {/* Motor */}
                        <div>
                          <label className="block text-sm font-medium text-gray-800 mb-2">
                            Motor
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all duration-300"
                            value={veiculo.motor}
                            onChange={(e) =>
                              atualizarVeiculo(
                                veiculo.id,
                                "motor",
                                e.target.value
                              )
                            }
                            placeholder="Ex: 1.6L"
                          />
                        </div>

                        {/* Chassis */}
                        <div>
                          <label className="block text-sm font-medium text-gray-800 mb-2">
                            Chassis
                          </label>
                          <input
                            type="text"
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all duration-300"
                            value={veiculo.chassis}
                            onChange={(e) =>
                              atualizarVeiculo(
                                veiculo.id,
                                "chassis",
                                e.target.value
                              )
                            }
                            placeholder="Número do chassis"
                          />
                        </div>

                        {/* Lotação */}
                        <div>
                          <label className="block text-sm font-medium text-gray-800 mb-2">
                            Lotação
                          </label>
                          <input
                            type="number"
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all duration-300"
                            value={veiculo.lotacao}
                            onChange={(e) =>
                              atualizarVeiculo(
                                veiculo.id,
                                "lotacao",
                                e.target.value
                              )
                            }
                            placeholder="Nº de passageiros"
                          />
                        </div>

                        {/* Tipo de Viatura */}
                        <div>
                          <label className="block text-sm font-medium text-gray-800 mb-2">
                            Tipo de Viatura *
                          </label>
                          <select
                            required
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all duration-300"
                            value={veiculo.tipoViatura}
                            onChange={(e) =>
                              atualizarVeiculo(
                                veiculo.id,
                                "tipoViatura",
                                e.target.value
                              )
                            }
                          >
                            <option value="Ligeiro">Ligeiro</option>
                            <option value="Pesado">Pesado</option>
                          </select>
                        </div>

                        {/* Tipo de Cobertura */}
                        <div>
                          <label className="block text-sm font-medium text-gray-800 mb-2">
                            Tipo de Cobertura *
                          </label>
                          <select
                            required
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all duration-300"
                            value={veiculo.tipoCobertura}
                            onChange={(e) =>
                              atualizarVeiculo(
                                veiculo.id,
                                "tipoCobertura",
                                e.target.value
                              )
                            }
                          >
                            <option value="DP_NORMAL">
                              DP NORMAL - Danos Próprios com Franquia
                            </option>
                            <option value="DP_SEM_FRANQUIA">
                              DP SEM FRANQUIA - Danos Próprios sem Franquia
                            </option>
                            <option value="RC_NORMAL">
                              RC NORMAL - Apenas Responsabilidade Civil
                            </option>
                            <option value="RC_OCUPANTES">
                              RC & OCUPANTES - RC + Cobertura para Ocupantes
                            </option>
                          </select>
                        </div>

                        {/* Capital Seguro */}
                        <div>
                          <label className="block text-sm font-medium text-gray-800 mb-2">
                            Capital Seguro (MT) *
                          </label>
                          <input
                            type="number"
                            required
                            className="w-full px-3 py-2 bg-white border border-gray-300 rounded text-gray-800 focus:border-blue-500 focus:ring-1 focus:ring-blue-500/20 transition-all duration-300"
                            value={veiculo.capitalSeguro}
                            onChange={(e) =>
                              atualizarVeiculo(
                                veiculo.id,
                                "capitalSeguro",
                                e.target.value
                              )
                            }
                            placeholder="Valor em MT"
                          />
                        </div>

                        {/* Taxa (readonly) */}
                        <div>
                          <label className="block text-sm font-medium text-gray-800 mb-2">
                            Taxa Aplicada
                          </label>
                          <input
                            type="text"
                            readOnly
                            className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded text-gray-800 font-semibold"
                            value={
                              veiculo.taxa
                                ? `${(veiculo.taxa * 100).toFixed(1)}%`
                                : "0%"
                            }
                          />
                        </div>

                        {/* Prémio Annual (readonly) */}
                        <div>
                          <label className="block text-sm font-medium text-gray-800 mb-2">
                            Prémio Annual (MT)
                          </label>
                          <input
                            type="text"
                            readOnly
                            className="w-full px-3 py-2 bg-gray-100 border border-gray-300 rounded text-gray-800 font-semibold"
                            value={
                              veiculo.premioAnnual
                                ? `MT ${parseFloat(
                                    veiculo.premioAnnual
                                  ).toLocaleString("pt-MZ", {
                                    minimumFractionDigits: 2,
                                  })}`
                                : "MT 0.00"
                            }
                          />
                        </div>
                      </div>

                      {/* Resumo da Cobertura */}
                      {veiculo.tipoCobertura && (
                        <div className="mt-4 p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <div className="text-sm text-blue-800 font-semibold mb-2">
                            {configCoberturas[veiculo.tipoCobertura]?.nome}
                          </div>
                          <div className="text-xs text-gray-600">
                            Taxa {veiculo.tipoViatura}:{" "}
                            {(
                              configCoberturas[veiculo.tipoCobertura]?.taxas[
                                veiculo.tipoViatura
                              ] * 100
                            ).toFixed(1)}
                            %
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>

              {/* Total */}
              <div className="mt-6 p-4 bg-emerald-50 rounded-lg">
                <div className="text-center">
                  <div className="text-2xl font-bold text-gray-800 mb-2">
                    Total: MT{" "}
                    {parseFloat(formData.totalPremio).toLocaleString("pt-MZ", {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                  <div className="text-sm text-gray-600">
                    {formData.veiculos.length} veículo(s) | Atualizado em{" "}
                    {new Date().toLocaleDateString("pt-MZ")}
                  </div>
                </div>
              </div>

              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-800 mb-2">
                  Observações
                </label>
                <textarea
                  rows={3}
                  className="w-full px-4 py-3 bg-white border border-gray-300 rounded-lg text-gray-800 focus:border-emerald-500 focus:ring-2 focus:ring-emerald-500/20 transition-all duration-300"
                  value={formData.observacoes || ""}
                  onChange={(e) =>
                    setFormData({ ...formData, observacoes: e.target.value })
                  }
                  placeholder="Adicione observações sobre a cotação..."
                />
              </div>
            </div>

            <div className="flex justify-end space-x-4">
              <button
                type="button"
                onClick={() => setFormData(null)}
                className="px-6 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-all duration-300 hover:scale-105"
              >
                Cancelar
              </button>
              <button
                type="submit"
                className="px-8 py-3 bg-emerald-600 text-white rounded-lg font-semibold hover:bg-emerald-700 transition-all duration-300 hover:scale-105 flex items-center space-x-2"
              >
                <Save className="h-5 w-5" />
                <span>Atualizar Cotação</span>
              </button>
            </div>
          </form>
        )}

        {/* MODAL DE PARTILHA APÓS EDIÇÃO */}
        {mostrarOpcoesPartilha && formData && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-xl p-6 w-full max-w-2xl">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-semibold text-gray-900">
                  Partilhar Cotação Atualizada
                </h3>
                <button
                  onClick={() => setMostrarOpcoesPartilha(false)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  <X className="h-6 w-6" />
                </button>
              </div>

              <div className="space-y-4">
                <div className="p-4 bg-gray-50 rounded-lg">
                  <div className="text-gray-800 font-semibold">
                    Cotação: {formData.id}
                  </div>
                  <div className="text-gray-600 text-sm">
                    Cliente: {formData.cliente.primeiroNome}{" "}
                    {formData.cliente.sobrenome}
                  </div>
                  <div className="text-gray-600 text-sm">
                    Total: MT{" "}
                    {parseFloat(formData.totalPremio).toLocaleString("pt-MZ", {
                      minimumFractionDigits: 2,
                    })}
                  </div>
                  <div className="text-emerald-600 text-sm font-semibold">
                    ✓ Atualizada em {new Date().toLocaleDateString("pt-MZ")}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <button
                    onClick={visualizarPDF}
                    className="p-4 rounded-lg border-2 border-blue-500 text-blue-600 hover:bg-blue-500 hover:text-white transition-all duration-300 flex flex-col items-center justify-center gap-2"
                  >
                    <Eye className="h-6 w-6" />
                    <span className="font-semibold">Visualizar PDF</span>
                    <span className="text-xs text-gray-600">Ver cotação</span>
                  </button>

                  <button
                    onClick={gerarPDF}
                    className="p-4 rounded-lg border-2 border-emerald-500 text-emerald-600 hover:bg-emerald-500 hover:text-white transition-all duration-300 flex flex-col items-center justify-center gap-2"
                  >
                    <Download className="h-6 w-6" />
                    <span className="font-semibold">Download PDF</span>
                    <span className="text-xs text-gray-600">
                      Baixar cotação
                    </span>
                  </button>

                  <button
                    onClick={imprimirCotacao}
                    className="p-4 rounded-lg border-2 border-purple-500 text-purple-600 hover:bg-purple-500 hover:text-white transition-all duration-300 flex flex-col items-center justify-center gap-2"
                  >
                    <Printer className="h-6 w-6" />
                    <span className="font-semibold">Imprimir</span>
                    <span className="text-xs text-gray-600">
                      Imprimir cotação
                    </span>
                  </button>

                  <button
                    onClick={enviarEmail}
                    disabled={processandoEmail}
                    className="p-4 rounded-lg border-2 border-orange-500 text-orange-600 hover:bg-orange-500 hover:text-white transition-all duration-300 flex flex-col items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {processandoEmail ? (
                      <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-orange-500"></div>
                    ) : (
                      <Send className="h-6 w-6" />
                    )}
                    <span className="font-semibold">
                      {processandoEmail ? "Enviando..." : "Enviar Email"}
                    </span>
                    <span className="text-xs text-gray-600">
                      Para administradores
                    </span>
                  </button>
                </div>
              </div>

              <div className="mt-6">
                <button
                  onClick={() => setMostrarOpcoesPartilha(false)}
                  className="w-full py-3 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors duration-300"
                >
                  Fechar
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </CotacoesLayout>
  );
}

export default EditarCotacao;