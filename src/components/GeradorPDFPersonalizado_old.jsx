// src/components/GeradorPDFPersonalizado.jsx
import React from 'react';

/**
 * Função para converter imagem para base64
 */
const imageToBase64 = (imagePath) => {
  // Retornar o caminho da imagem - será carregado pelo navegador
  // Em produção, você pode pré-converter para base64 ou usar um servidor
  return imagePath;
};

/**
 * Componente para gerar PDF personalizado com papel timbrado
 * Este componente gera HTML que pode ser convertido para PDF usando a função de impressão do navegador
 */
export const gerarHTMLCotacaoPersonalizado = (cotacao) => {
  // Validar cotação
  if (!cotacao) {
    throw new Error('Cotação não fornecida');
  }

  // Validar cliente
  if (!cotacao.cliente) {
    cotacao.cliente = {
      primeiroNome: '',
      sobrenome: '',
      email: '',
      telefone: '',
      tipo: 'Particular',
      numeroDocumento: '',
      morada: ''
    };
  }

  // Validar e processar data de criação
  let dataInicio;
  try {
    dataInicio = cotacao.dataCriacao ? new Date(cotacao.dataCriacao) : new Date();
    if (isNaN(dataInicio.getTime())) {
      dataInicio = new Date();
    }
  } catch (e) {
    dataInicio = new Date();
  }
  
  const dataFim = new Date(dataInicio);
  dataFim.setFullYear(dataFim.getFullYear() + 1);
  
  // Validar veículos
  const veiculos = Array.isArray(cotacao.veiculos) ? cotacao.veiculos : [];
  const veiculo = veiculos[0] || {};
  
  // Validar valores numéricos
  const totalPremio = parseFloat(cotacao.totalPremio) || 0;
  const premioBase = totalPremio * 0.84;
  const custosAdmin = totalPremio * 0.12;
  const sobreTaxa = totalPremio * 0.02;
  const impostoSelo = totalPremio * 0.02;

  // Validar ID da cotação
  const cotacaoId = cotacao.numero_cotacao || cotacao.id || 'N/A';

  // Caminho da imagem do papel timbrado (será carregado pelo navegador)
  // Em produção, você pode usar uma URL absoluta ou base64
  const timbradoPath = '/src/assets/timbrado.png'; // Caminho relativo

  // Dados bancários
  const bancos = [
    {
      nome: "ACCESS BANK",
      contaMZN: "3805960110",
      nibMZN: "0066000603805 96011071",
      contaUSD: "3805960211",
      nibUSD: "0013000603805 96021136",
      contaZAR: "3805960313",
      nibZAR: "0013000603805 96031321"
    },
    {
      nome: "BCI",
      contaMZN: "1430858651000 1",
      nibMZN: "0008000043085 86510195",
      contaUSD: "1430858651000 2",
      nibUSD: "0008000043085 86510292",
      contaZAR: "1430858651000 3",
      nibZAR: "0008000043085 86510389"
    },
    {
      nome: "Ecobank",
      contaMZN: "5575000017081",
      nibMZN: "0023001557500 01708191"
    },
    {
      nome: "MILLENNIUM BIM",
      contaMZN: "330446409",
      nibMZN: "0001000000330 44640957",
      contaUSD: "330503930",
      nibUSD: "0001000000330 50393057",
      contaZAR: "330449610",
      nibZAR: "0001000000330 44961057"
    },
    {
      nome: "MOZABANCO",
      contaMZN: "820478810001",
      nibMZN: "0034000008204 78810165",
      contaUSD: "820478815001",
      nibUSD: "0034000008204 78815112",
      contaZAR: "820478815209",
      nibZAR: "0034000008204 78815209"
    },
    {
      nome: "MPESA",
      contaMZN: "905000",
      nibMZN: "905000",
      contaUSD: "905000",
      nibUSD: "905000",
      contaZAR: "905000",
      nibZAR: "905000"
    },
    {
      nome: "STANDARD BANK",
      contaMZN: "1256457681001",
      nibMZN: "0003012506457 68100167",
      contaUSD: "1256457681017",
      nibUSD: "0003012506457 68101719",
      contaZAR: "1256457681028",
      nibZAR: "0003012506457 68102883"
    }
  ];

  return `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Cotacao ${cotacaoId} - Imperial Seguros</title>
    <style>
        @page {
            size: A4;
            margin: 0;
        }
        
        * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
        }
        
        body {
            font-family: 'Arial', 'Helvetica', sans-serif;
            font-size: 11px;
            line-height: 1.4;
            color: #000;
            background: #fff;
        }
        
        .page {
            position: relative;
            width: 210mm;
            min-height: 297mm;
            padding: 0;
            margin: 0;
            page-break-after: always;
            background: white;
        }
        
        /* Papel timbrado como fundo */
        .page::before {
            content: '';
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            height: 100%;
            background-image: url('${timbradoPath}');
            background-size: cover;
            background-position: center top;
            background-repeat: no-repeat;
            opacity: 0.95;
            z-index: 0;
        }
        
        /* Fallback caso a imagem não carregue */
        .page {
            background-image: url('${timbradoPath}');
            background-size: cover;
            background-position: center top;
            background-repeat: no-repeat;
        }
        
        /* Conteúdo sobreposto ao papel timbrado */
        .content {
            position: relative;
            z-index: 10;
            padding: 25mm 20mm 30mm 20mm;
            background: transparent;
        }
        
        .header {
            text-align: center;
            margin-bottom: 20px;
        }
        
        .titulo-principal {
            font-size: 16px;
            font-weight: bold;
            margin-bottom: 5px;
            color: #166534;
        }
        
        .titulo-cotacao {
            font-size: 20px;
            font-weight: bold;
            margin-bottom: 10px;
            color: #000;
        }
        
        .validade {
            font-size: 10px;
            font-weight: bold;
            margin-bottom: 15px;
            color: #d00;
            background: #fff3cd;
            padding: 5px;
            border: 1px solid #ffc107;
            display: inline-block;
        }
        
        .tabela-segurado {
            width: 100%;
            border-collapse: collapse;
            margin-bottom: 15px;
            font-size: 10px;
            background: rgba(255, 255, 255, 0.95);
        }
        
        .tabela-segurado th {
            background-color: #166534;
            color: white;
            padding: 8px;
            text-align: left;
            font-weight: bold;
            border: 1px solid #0a4f2e;
        }
        
        .tabela-segurado td {
            padding: 8px;
            border: 1px solid #ddd;
            background: rgba(255, 255, 255, 0.98);
        }
        
        .tabela-segurado tr:nth-child(even) td {
            background-color: rgba(249, 249, 249, 0.98);
        }
        
        .tabela-premios {
            width: 100%;
            border-collapse: collapse;
            margin: 20px 0;
            font-size: 10px;
            background: rgba(255, 255, 255, 0.95);
        }
        
        .tabela-premios th,
        .tabela-premios td {
            border: 1px solid #000;
            padding: 6px;
            background: rgba(255, 255, 255, 0.98);
        }
        
        .tabela-premios th {
            background-color: #f0f0f0;
            font-weight: bold;
        }
        
        .tabela-bancos {
            width: 100%;
            border-collapse: collapse;
            margin: 10px 0;
            font-size: 8px;
            background: rgba(255, 255, 255, 0.95);
        }
        
        .tabela-bancos th,
        .tabela-bancos td {
            border: 1px solid #ddd;
            padding: 4px;
            background: rgba(255, 255, 255, 0.98);
        }
        
        .tabela-bancos th {
            background-color: #166534;
            color: white;
            font-weight: bold;
            padding: 6px;
        }
        
        .tabela-bancos tr:nth-child(even) td {
            background-color: rgba(249, 249, 249, 0.98);
        }
        
        .bold {
            font-weight: bold;
        }
        
        .text-center {
            text-align: center;
        }
        
        .text-right {
            text-align: right;
        }
        
        .mt-10 {
            margin-top: 10px;
        }
        
        .mt-20 {
            margin-top: 20px;
        }
        
        .mb-10 {
            margin-bottom: 10px;
        }
        
        .mb-20 {
            margin-bottom: 20px;
        }
        
        .linha-divisoria {
            border-top: 1px solid #000;
            margin: 10px 0;
        }
        
        .assinatura {
            margin-top: 40px;
            border-top: 1px solid #000;
            padding-top: 10px;
            width: 200px;
        }
        
        .pagina-numero {
            position: absolute;
            bottom: 15mm;
            right: 20mm;
            font-size: 9px;
            color: #666;
            z-index: 20;
        }
        
        .condicoes {
            font-size: 9px;
            line-height: 1.3;
            background: rgba(255, 255, 255, 0.95);
            padding: 10px;
        }
        
        .condicoes ul {
            padding-left: 20px;
            margin: 5px 0;
        }
        
        .condicoes li {
            margin-bottom: 3px;
        }
        
        .exclusoes {
            column-count: 2;
            column-gap: 20px;
            font-size: 8px;
            margin: 10px 0;
        }
        
        .eficacia-contrato {
            background: rgba(255, 255, 255, 0.95);
            padding: 10px;
            border: 1px solid #ddd;
            margin: 15px 0;
        }
        
        @media print {
            .page {
                page-break-after: always;
            }
            .page:last-child {
                page-break-after: auto;
            }
        }
    </style>
</head>
<body>
    <!-- PÁGINA 1 -->
    <div class="page">
        <div class="content">
            <div class="header">
                <div class="titulo-principal">Seguros Gerais</div>
                <div class="titulo-cotacao">Cotação</div>
                <div class="validade">Esta cotação será válida apenas por 30 dias</div>
            </div>
            
            <table class="tabela-segurado">
                <thead>
                    <tr>
                        <th colspan="2">Informações do Segurado</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td width="50%"><strong>Segurado:</strong> ${cotacao.cliente.primeiroNome || ''} ${cotacao.cliente.sobrenome || ''}</td>
                        <td width="50%"><strong>Número da cotação:</strong> ${cotacaoId}</td>
                    </tr>
                    <tr>
                        <td><strong>NUIT:</strong> ${cotacao.cliente.numeroDocumento || '128704132'}</td>
                        <td><strong>Número da Apólice:</strong> ${String(cotacaoId).substring(0, 6)}</td>
                    </tr>
                    <tr>
                        <td><strong>Morada Postal:</strong> ${cotacao.cliente.morada || 'Q.01 Vila de Sede, Marracuene'}</td>
                        <td><strong>Versão da Apólice:</strong> 1</td>
                    </tr>
                    <tr>
                        <td><strong>Data Efectiva:</strong> ${dataInicio.toLocaleDateString('pt-MZ')}</td>
                        <td><strong>Data de Vencimento:</strong> ${dataFim.toLocaleDateString('pt-MZ')} (data inclusas)</td>
                    </tr>
                    <tr>
                        <td colspan="2"><strong>Província:</strong> Maputo, Moçambique</td>
                    </tr>
                </tbody>
            </table>
            
            <div class="mb-20">
                <div class="bold">Período de Seguro:</div>
                <div>(a) Desde ${dataInicio.toLocaleDateString('pt-MZ')} até ${dataFim.toLocaleDateString('pt-MZ')} (ambas as datas inclusas)</div>
                <div>(b) Qualquer período posterior para o qual o segurador aceite ou concorde aceitar pagamento para renovação da apólice.</div>
            </div>
            
            <div class="mb-20">
                <div><strong>Âmbito Territorial:</strong> Moçambique</div>
                <div><strong>Actividade Empresarial:</strong> ${cotacao.cliente.tipo === 'Empresarial' ? 'Empresa' : 'Particular'}</div>
                <div><strong>Agência:</strong> MAPUTO</div>
                <div><strong>Agente / Agente:</strong> DIRECT - MAPUTO</div>
            </div>
            
            <div class="mt-20">
                <div><strong>Data:</strong> ${new Date().toLocaleDateString('pt-MZ')}</div>
                <div class="assinatura">Assinado: ...... em nome da Companhia</div>
            </div>
            
            <div class="text-center mt-20 bold">
                Esta cotação é renovada Anualmente. O prémio é pago numa base Anual.
            </div>
        </div>
        <div class="pagina-numero">Página 1 de 5</div>
    </div>
    
    <!-- PÁGINA 2 -->
    <div class="page">
        <div class="content">
            <div class="header">
                <div class="titulo-cotacao">Cotação</div>
            </div>
            
            <div class="mb-20">
                <table width="100%" style="font-size: 10px; background: rgba(255,255,255,0.95);">
                    <tr>
                        <td><strong>Número da cotação:</strong> ${cotacaoId}</td>
                        <td class="text-right"><strong>Secção:</strong> Tabela de Prémios</td>
                    </tr>
                    <tr>
                        <td><strong>Número da Versão:</strong> 1</td>
                        <td class="text-right"><strong>Data de Impressão:</strong> ${new Date().toLocaleDateString('pt-MZ')}</td>
                    </tr>
                    <tr>
                        <td><strong>Válida a Partir de:</strong> ${dataInicio.toLocaleDateString('pt-MZ')}</td>
                        <td class="text-right"><strong>Válida Até:</strong> ${dataFim.toLocaleDateString('pt-MZ')} (data inclusas)</td>
                    </tr>
                </table>
            </div>
            
            <table class="tabela-premios">
                <thead>
                    <tr>
                        <th width="40%">Secções da Apólice</th>
                        <th width="20%">Subscritas</th>
                        <th width="20%">Prémio Anual</th>
                        <th width="20%">Prémio Adicional / de Reembolso</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>Automóvel</td>
                        <td class="text-center">Sim</td>
                        <td class="text-right">MT ${premioBase.toFixed(2)}</td>
                        <td class="text-right">MT 0.00</td>
                    </tr>
                    <tr>
                        <td colspan="2" class="bold">Total</td>
                        <td class="text-right bold">MT ${premioBase.toFixed(2)}</td>
                        <td class="text-right bold">MT 0.00</td>
                    </tr>
                    <tr>
                        <td>Custos Administrativos</td>
                        <td></td>
                        <td class="text-right">MT ${custosAdmin.toFixed(2)}</td>
                        <td class="text-right">MT 0.00</td>
                    </tr>
                    <tr>
                        <td>Sobre Taxa</td>
                        <td></td>
                        <td class="text-right">MT ${sobreTaxa.toFixed(2)}</td>
                        <td class="text-right">MT 0.00</td>
                    </tr>
                    <tr>
                        <td>Imposto de Selo</td>
                        <td></td>
                        <td class="text-right">MT ${impostoSelo.toFixed(2)}</td>
                        <td class="text-right">MT 0.00</td>
                    </tr>
                    <tr class="bold">
                        <td colspan="2">Prémio Total</td>
                        <td class="text-right">MT ${totalPremio.toFixed(2)}</td>
                        <td class="text-right">MT 0.00</td>
                    </tr>
                </tbody>
            </table>
            
            <div class="eficacia-contrato mt-20">
                <div class="bold" style="font-size: 11px;">PAGAMENTO DO PRÉMIO</div>
                <div class="bold" style="font-size: 10px;">EFICÁCIA DO CONTRATO E CONSEQUÊNCIA DA FALTA DO PAGAMENTO DO PRÉMIO</div>
                <div class="mt-10" style="font-size: 9px;">
                    A cobertura efectiva dos riscos apenas se verifica a partir do momento em que é feito o pagamento do prémio do
                    seguro ou fracção;
                </div>
                <div class="mt-10" style="font-size: 9px;">
                    A falta de pagamento do prémio da anuidade subsequente ou da primeira fracção deste, impede a renovação do
                    contrato e o não pagamento de qualquer fracção do prémio do decurso de uma anuidade determina a resolução
                    automática e imediata do contrato, na data em que o pagamento dessa fracção é devido.
                </div>
            </div>
            
            <div class="mt-20">
                <div class="bold">Bank Details Imperial Insurance Moçambique, S.A.</div>
                <table class="tabela-bancos">
                    <thead>
                        <tr>
                            <th>Nome Banco</th>
                            <th>Número de Conta MZN</th>
                            <th>NIB MZN</th>
                            <th>Número de Conta USD</th>
                            <th>NIB USD</th>
                            <th>Número de Conta ZAR</th>
                            <th>NIB ZAR</th>
                        </tr>
                    </thead>
                    <tbody>
                        ${bancos.map(banco => `
                        <tr>
                            <td>${banco.nome}</td>
                            <td>${banco.contaMZN || ''}</td>
                            <td>${banco.nibMZN || ''}</td>
                            <td>${banco.contaUSD || ''}</td>
                            <td>${banco.nibUSD || ''}</td>
                            <td>${banco.contaZAR || ''}</td>
                            <td>${banco.nibZAR || ''}</td>
                        </tr>
                        `).join('')}
                    </tbody>
                </table>
            </div>
        </div>
        <div class="pagina-numero">Página 2 de 5</div>
    </div>
    
    <!-- PÁGINA 3 -->
    <div class="page">
        <div class="content">
            <div class="header">
                <div class="titulo-cotacao">Cotação</div>
            </div>
            
            <div class="mb-20">
                <table width="100%" style="font-size: 10px; background: rgba(255,255,255,0.95);">
                    <tr>
                        <td><strong>Número da Apólice:</strong> ${String(cotacaoId).substring(0, 6)}</td>
                        <td class="text-right"><strong>Secção:</strong> ${String(cotacaoId).substring(0, 6)}</td>
                    </tr>
                    <tr>
                        <td><strong>Número da Versão:</strong> 1</td>
                        <td class="text-right"><strong>Data de Impressão:</strong> ${new Date().toLocaleDateString('pt-MZ')}</td>
                    </tr>
                    <tr>
                        <td><strong>Válida a Partir de:</strong> ${dataInicio.toLocaleDateString('pt-MZ')}</td>
                        <td class="text-right"><strong>Válida Até:</strong> ${dataFim.toLocaleDateString('pt-MZ')} (data inclusas)</td>
                    </tr>
                </table>
            </div>
            
            <div class="mb-20" style="background: rgba(255,255,255,0.95); padding: 10px;">
                <div class="bold">Descrição</div>
                <div>${veiculo.matricula || "Por atribuir"}</div>
            </div>
            
            <div class="mb-20" style="background: rgba(255,255,255,0.95); padding: 10px;">
                <div class="bold">Instalações</div>
                <div>MATOLA</div>
                <div>MAPUTO</div>
                <div>Moçambique</div>
            </div>
            
            <div class="mb-20" style="background: rgba(255,255,255,0.95); padding: 10px;">
                <div class="bold">Características:</div>
                <div><strong>Ano:</strong> ${veiculo.ano || "2000"}</div>
                <div><strong>N°. do Chassi:</strong> ${veiculo.numeroChassi || "12345678"}</div>
                <div><strong>N°. do Motor:</strong> ${veiculo.numeroMotor || "98765"}</div>
                <div><strong>Marca:</strong> ${(veiculo.marca || veiculo.marca_modelo || veiculo.marcaModelo || "TOYOTA").split(' ')[0]}</div>
                <div><strong>Modelo:</strong> ${(veiculo.modelo || (veiculo.marca_modelo || veiculo.marcaModelo || "ALLION").split(' ').slice(1).join(' ')) || "ALLION"}</div>
                <div><strong>Matrícula:</strong> ${veiculo.matricula || veiculo.matricula_completa || "Por atribuir"}</div>
                <div><strong>Classe do Veículo:</strong> ${veiculo.tipo_cobertura || veiculo.tipoViatura || 'Particular'}</div>
            </div>
            
            <div class="mb-20" style="background: rgba(255,255,255,0.95); padding: 10px;">
                <table width="100%" style="font-size: 10px;">
                    <tr>
                        <td class="bold">Elementos da Cobertura</td>
                        <td class="bold text-right">Valor Seguro / Limite da Indemnização</td>
                    </tr>
                    <tr>
                        <td>Responsabilidade Civil a Terceiros</td>
                        <td class="text-right">MT 4,000,000.00</td>
                    </tr>
                </table>
            </div>
            
            <div class="mb-20" style="background: rgba(255,255,255,0.95); padding: 10px;">
                <table width="100%" style="font-size: 10px;">
                    <tr>
                        <td class="bold">Extensões</td>
                        <td class="bold text-right">Valor Seguro / Limite da Indemnização</td>
                    </tr>
                    <tr>
                        <td>Responsabilidade Contra Passageiros</td>
                        <td class="text-right">MT 125,000.00</td>
                    </tr>
                    <tr>
                        <td>Morte ou invalidez Permanente:</td>
                        <td class="text-right">MZN 100,000.00 / USD 1,600.00 / ZAR 2,000.00</td>
                    </tr>
                    <tr>
                        <td>Despesas Médicas:</td>
                        <td class="text-right">MZN 20,000.00 / USD 320.00 / ZAR 4,000.00</td>
                    </tr>
                    <tr>
                        <td>Despesas de Funeral:</td>
                        <td class="text-right">MZN 5,000.00 / USD 80.00 / ZAR 1,000.00</td>
                    </tr>
                    <tr>
                        <td>Limite de Ocupantes:</td>
                        <td class="text-right">05</td>
                    </tr>
                </table>
            </div>
            
            <div class="mt-20" style="background: rgba(255,255,255,0.95); padding: 10px;">
                <div class="bold">Franquias</div>
                <div>Nao aplicavel</div>
            </div>
        </div>
        <div class="pagina-numero">Página 3 de 5</div>
    </div>
    
    <!-- PÁGINA 4 -->
    <div class="page">
        <div class="content">
            <div class="condicoes">
                <div class="bold" style="font-size: 11px;">Condições especiais / Garantias / Extensões / Exclusões / Termos e condições / Observações:</div>
                
                <div class="mt-10">
                    <div class="bold">CONDICIONANTES OBRIGATÓRIAS DA COBERTURA AUTOMÓVEL</div>
                    <div>Os veículos abrangidos pela presente apólice deverão cumprir integralmente os requisitos legais de circulação e segurança em vigor.</div>
                    <div>O condutor do veículo, no momento do sinistro, deve:</div>
                    <ul>
                        <li>Ser titular de carta de condução válida;</li>
                    </ul>
                    <div>O veículo deve apresentar:</div>
                    <ul>
                        <li>Inspeção legal periódica válida;</li>
                        <li>Inspeção técnica interna prévia à emissão da apólice, com verificação do estado geral (pneus, motor, travões, entre outros);</li>
                        <li>O veículo deverá ser mantido em boas condições de funcionamento e conservação;</li>
                        <li>O veículo não poderá ser utilizado para finalidades diversas daquelas declaradas na proposta de Seguro;</li>
                        <li>O tomador do seguro deverá comunicar à seguradora, de forma imediata e por escrito, qualquer alteração relevante que possa impactar o risco segurado;</li>
                        <li>O veículo não poderá ser utilizado para finalidades de competições ou atividades de risco elevado: Corridas, competições ou provas desportivas, testes de velocidade, treinamentos, exibições públicas ou eventos similares, salvo mediante contratação de cobertura específica.</li>
                    </ul>
                </div>
                
                <div class="mt-10">
                    <div class="bold">CONDICIONANTES FACULTATIVAS – APLICÁVEIS À COBERTURA DE DANOS PRÓPRIOS</div>
                    <div>Para efeitos de reforço da proteção contra riscos de furto, roubo ou desaparecimento, especialmente no âmbito da cobertura de danos próprios, recomenda-se que o tomador do seguro adopte os seguintes dispositivos adicionais:</div>
                    <ul>
                        <li>Instalação de dispositivo de rastreamento e contratação de serviço de localização e recuperação do veículo em caso de roubo e/ou furto;</li>
                        <li>Instalação de imobilizadores eletrônicos, travas antifurto ou outros mecanismos que dificultem o acesso, movimentação ou remoção não autorizada do veículo;</li>
                        <li>O veículo deverá estar equipado com sistema de alarme antifurto funcional, instalado e activo durante todo o período de vigência da apólice;</li>
                        <li>Durante o período nocturno, o veículo deverá ser estacionado em local seguro e adequado, de forma a minimizar riscos de furto, roubo ou danos;</li>
                        <li>Salvo autorização expressa em cláusula adicional, o veículo não poderá ser utilizado para o transporte de materiais perigosos ou inflamáveis.</li>
                    </ul>
                    <div class="bold mt-5">A inobservância das obrigações acima referidas poderá acarretar a perda do direito à indenização, total ou parcial, consoante a gravidade da infração e sua relação com o sinistro.</div>
                </div>
                
                <div class="mt-10">
                    <div class="bold">VISTÓRIA OBRIGATÓRIA DA VIATURA</div>
                    <div>A viatura segurada deverá ser submetida a inspeção obrigatória no prazo de até 5 (Cínco) dias úteis, contados a partir da data de emissão da apólice (${new Date().toLocaleDateString('pt-MZ')}). Nos casos em que a viatura se encontre fora de Maputo, é da inteira responsabilidade do segurado apresentar o veículo à instalação da seguradora mais próxima antes do início da cobertura ou, no máximo, dentro do prazo de 5 (Cínco) dias úteis a contar da data de início da apólice. O não cumprimento desta obrigação resultará na perda do direito à indenização.</div>
                </div>
            </div>
        </div>
        <div class="pagina-numero">Página 4 de 5</div>
    </div>
    
    <!-- PÁGINA 5 -->
    <div class="page">
        <div class="content">
            <div class="condicoes">
                <div class="bold" style="font-size: 11px;">EXCLUSÕES GERAIS</div>
                <div class="exclusoes">
                    <div>Bens sob os cuidados, custódia e controle do segurado</div>
                    <div>Abuso e molestamento</div>
                    <div>Amianto</div>
                    <div>Actos de Terrorismo</div>
                    <div>Violência Política e Terrorismo e riscos associados</div>
                    <div>Riscos nucleares</div>
                    <div>Guerra e guerra civil ou motim, greve e riscos semelhantes</div>
                    <div>Danos em obras, propriedade em construção</div>
                    <div>Perda Financeira Pura</div>
                    <div>Explosão, Combustão Spontânea</div>
                    <div>Danos Maliciosos</div>
                    <div>Comoção Civil</div>
                    <div>Sabotagem</div>
                    <div>Vandalização</div>
                    <div>Insurreição</div>
                    <div>Saques</div>
                    <div>Poluição Ambiental</div>
                    <div>Avarias mecânicas</div>
                    <div>Negligência do condutor</div>
                    <div>Condução sem habilitação legal válida</div>
                    <div>Condução sob efeito de álcool, drogas ou substâncias entorpecentes</div>
                    <div>Exclui-se o uso do veículo em corridas, testes, exibições ou eventos similares, salvo se contratada cobertura adicional específica e expressamente prevista na apólice</div>
                    <div>Perda ou dano resultante do abandono, entrega voluntária ou da falta de diligência razoável na proteção do veículo segurado</div>
                </div>
                
                <div class="mt-10">
                    <div class="bold">CLÁUSULA ADICIONAL DE EXCLUSÃO – VIATURAS COM MATRÍCULA ESTRANGEIRA</div>
                    <div>Para além das exclusões gerais previstas na apólice, ficam expressamente excluídas da cobertura as seguintes situações, quando se trate de viaturas com matrícula estrangeira:</div>
                    <ul>
                        <li>Roubo ou furto total da viatura ocorrido fora do território da República de Moçambique;</li>
                        <li>Roubo ou furto de acessórios da viatura ocorrido fora do território da República de Moçambique.</li>
                    </ul>
                </div>
                
                <div class="mt-10">
                    <div class="bold">EFICÁCIA DO CONTRATO E CONSEQUÊNCIA NA FALTA DO PAGAMENTO DO PRÉMIO</div>
                    <div>O prémio total para o período de cobertura é devido e pagável antes ou na data do seu início ou data de renovação, conforme o caso, e continua a ser da exclusiva responsabilidade do segurado garantir que o prémio seja atempadamente pago. A Seguradora não é obrigada a aceitar o prémio que lhe foi endereçado após a data de emissão ou data de renovação.</div>
                    <div>Esta apólice é um contrato anual para o qual a Seguradora pode aceitar o pagamento de prémio em prestações, mediante acordo prévio. A Seguradora se reserva o direito de deduzir o prémio total anual relativamente ao objecto sobre o qual um sinistro foi ou está a ser pago.</div>
                </div>
                
                <div class="mt-10">
                    <div class="bold">DIVULGAÇÃO DE FACTOS RELEVANTES</div>
                    <div>É dever do cliente divulgar todos os factores materiais antes do início da apólice ou renovação e durante o curso da apólice. Isso envolve o seguinte:</div>
                    <ol>
                        <li>Divulgando todo o histórico de perdas pagas ou não pagas, seguradas ou não;</li>
                        <li>Factores ou ameaças que podem causar perda ou dar lugar ao sinistro do bem segurado. Isso pode representar ameaças passadas;</li>
                        <li>Quaisquer mudanças nos factores durante o curso da apólice.</li>
                    </ol>
                    <div>A não divulgação dos fatores materiais ou a má interpretação dos fatores materiais tornará a apólice automaticamente nula, ou seja, a apólice não será válida desde o início. A seguradora reembolsará todos os prémios e se isso for descoberto no momento do sinistro, o sinistro não será pago e o prémio será devolvido ao cliente.</div>
                </div>
            </div>
            
            <div class="text-center mt-20" style="font-size: 9px; color: #666; background: rgba(255,255,255,0.95); padding: 10px;">
                www.imperialseguros.co.mz
            </div>
        </div>
        <div class="pagina-numero">Página 5 de 5</div>
    </div>
</body>
</html>
    `;
};

/**
 * Função para gerar e gerenciar PDF
 */
export const gerarPDFPersonalizado = (cotacao, acao = 'download') => {
  try {
    // Validar cotação
    if (!cotacao) {
      console.error('Cotação não fornecida');
      alert('❌ Erro: Cotação não encontrada.');
      return false;
    }

    // Validar dados mínimos necessários
    if (!cotacao.cliente || (!cotacao.cliente.primeiroNome && !cotacao.cliente.sobrenome)) {
      console.error('Dados do cliente incompletos:', cotacao);
      alert('❌ Erro: Dados do cliente incompletos.');
      return false;
    }

    const htmlContent = gerarHTMLCotacaoPersonalizado(cotacao);
    
    if (!htmlContent || htmlContent.trim().length === 0) {
      console.error('HTML vazio gerado');
      alert('❌ Erro ao gerar conteúdo do documento.');
      return false;
    }
    
    // Criar blob do HTML
    const blob = new Blob([htmlContent], { type: 'text/html;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    
    if (acao === 'download') {
      // Criar link para download
      const a = document.createElement('a');
      a.href = url;
      a.download = `cotacao-${cotacao.numero_cotacao || cotacao.id || 'cotacao'}.html`;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      
      // Também tentar abrir impressão para conversão automática para PDF
      setTimeout(() => {
        const win = window.open(url, '_blank');
        if (win) {
          win.onload = () => {
            setTimeout(() => {
              win.print();
            }, 500);
          };
        }
      }, 500);
      
    } else if (acao === 'visualizar') {
      // Abrir em nova aba
      const win = window.open(url, '_blank');
      if (!win) {
        alert('❌ Por favor, permita pop-ups para visualizar o documento.');
        return false;
      }
      
    } else if (acao === 'imprimir') {
      // Abrir e imprimir
      const win = window.open(url, '_blank');
      if (!win) {
        alert('❌ Por favor, permita pop-ups para imprimir o documento.');
        return false;
      }
      if (win) {
        win.onload = () => {
          setTimeout(() => {
            win.print();
          }, 500);
        };
      }
    }
    
    // Liberar memória após algum tempo
    setTimeout(() => {
      try {
        URL.revokeObjectURL(url);
      } catch (e) {
        console.warn('Erro ao revogar URL:', e);
      }
    }, 10000);
    
    return true;
  } catch (error) {
    console.error('Erro ao gerar documento:', error);
    console.error('Cotação recebida:', cotacao);
    alert(`❌ Erro ao gerar documento: ${error.message || 'Erro desconhecido'}. Por favor, tente novamente.`);
    return false;
  }
};

export default gerarPDFPersonalizado;
