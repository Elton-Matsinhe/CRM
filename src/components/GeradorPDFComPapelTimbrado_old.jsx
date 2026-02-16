// src/components/GeradorPDFComPapelTimbrado.jsx
import React, { useState, useRef } from 'react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

function GeradorPDFComPapelTimbrado({ cotacao }) {
  const [gerandoPDF, setGerandoPDF] = useState(false);
  const pdfRef = useRef(null);

  // Dados da cotação (do seu código React)
  const dataInicio = new Date(cotacao.dataCriacao);
  const dataFim = new Date(dataInicio);
  dataFim.setFullYear(dataFim.getFullYear() + 1);
  
  const veiculo = cotacao.veiculos[0] || {};
  const premioBase = cotacao.totalPremio * 0.84;
  const custosAdmin = cotacao.totalPremio * 0.12;
  const sobreTaxa = cotacao.totalPremio * 0.02;
  const impostoSelo = cotacao.totalPremio * 0.02;

  // Dados bancários (do PDF fornecido)
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

  // Função para gerar PDF com papel timbrado
  const gerarPDFComTimbrado = async () => {
    try {
      setGerandoPDF(true);

      // Criar canvas para o conteúdo
      const contentElement = document.createElement('div');
      contentElement.style.width = '210mm';
      contentElement.style.minHeight = '297mm';
      contentElement.style.padding = '0';
      contentElement.style.margin = '0';
      contentElement.style.backgroundColor = 'transparent';
      
      // Adicionar conteúdo ao elemento
      contentElement.innerHTML = `
        <div style="
          position: relative;
          width: 100%;
          min-height: 297mm;
          background: transparent;
        ">
          <!-- Conteúdo que será sobreposto ao papel timbrado -->
          <div style="
            position: absolute;
            top: 0;
            left: 0;
            width: 100%;
            z-index: 10;
            font-family: Arial, sans-serif;
            color: #000;
            padding: 40mm 20mm 20mm 20mm;
          ">
            ${gerarConteudoCotacao()}
          </div>
        </div>
      `;

      // Adicionar ao DOM temporariamente
      document.body.appendChild(contentElement);

      // Gerar canvas do conteúdo
      const canvas = await html2canvas(contentElement, {
        scale: 2,
        useCORS: true,
        logging: false,
        backgroundColor: null
      });

      // Remover elemento temporário
      document.body.removeChild(contentElement);

      // Criar PDF
      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Adicionar imagem do papel timbrado (você precisa ter a imagem)
      // IMPORTANTE: Substitua 'papel_timbrado_base64' pela imagem real do seu papel timbrado
      const papelTimbradoImg = await carregarImagemPapelTimbrado();
      
      if (papelTimbradoImg) {
        // Adicionar papel timbrado como fundo em cada página
        pdf.addImage(papelTimbradoImg, 'PNG', 0, 0, 210, 297);
      }

      // Adicionar conteúdo da primeira página
      const imgData = canvas.toDataURL('image/png');
      pdf.addImage(imgData, 'PNG', 0, 0, 210, 297);

      // Adicionar páginas adicionais se necessário
      // (você pode adicionar lógica para múltiplas páginas aqui)

      // Salvar PDF
      pdf.save(`cotacao_${cotacao.id}.pdf`);
      
    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setGerandoPDF(false);
    }
  };

  // Função para carregar imagem do papel timbrado
  const carregarImagemPapelTimbrado = () => {
    return new Promise((resolve) => {
      // Aqui você deve carregar a imagem real do papel timbrado
      // Pode ser uma URL ou base64
      const img = new Image();
      img.crossOrigin = 'anonymous';
      
      // Se você tem a imagem como arquivo, use:
      // img.src = '/caminho/para/papel-timbrado.jpg';
      
      // OU se tem como base64 (recomendado para evitar problemas CORS):
      // img.src = 'data:image/png;base64,SEU_BASE64_AQUI';
      
      img.onload = () => resolve(img);
      img.onerror = () => {
        console.warn('Não foi possível carregar papel timbrado, usando fundo branco');
        resolve(null);
      };
      
      // Por enquanto, criamos um papel timbrado básico em código
      // Substitua isso pela sua imagem real
      const canvas = document.createElement('canvas');
      canvas.width = 210 * 4; // 4x para alta resolução
      canvas.height = 297 * 4;
      const ctx = canvas.getContext('2d');
      
      // Cor de fundo
      ctx.fillStyle = '#ffffff';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      
      // Cabeçalho simulando papel timbrado
      ctx.fillStyle = '#166534';
      ctx.fillRect(0, 0, canvas.width, 40 * 4);
      
      // Texto do cabeçalho
      ctx.fillStyle = '#ffffff';
      ctx.font = 'bold 48px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('IMPERIAL SEGUROS', canvas.width / 2, 25 * 4);
      
      ctx.font = '24px Arial';
      ctx.fillText('Moçambique, S.A.', canvas.width / 2, 35 * 4);
      
      // Rodapé
      ctx.fillStyle = '#f8f9fa';
      ctx.fillRect(0, canvas.height - 20 * 4, canvas.width, 20 * 4);
      
      ctx.fillStyle = '#666666';
      ctx.font = '16px Arial';
      ctx.textAlign = 'center';
      ctx.fillText('www.imperialseguros.co.mz | contacto@imperialseguros.co.mz | +258 84 123 4567', 
                   canvas.width / 2, canvas.height - 10 * 4);
      
      // Linha decorativa
      ctx.strokeStyle = '#166534';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.moveTo(20 * 4, 50 * 4);
      ctx.lineTo(canvas.width - 20 * 4, 50 * 4);
      ctx.stroke();
      
      img.src = canvas.toDataURL('image/png');
    });
  };

  // Função que gera o conteúdo HTML da cotação
  const gerarConteudoCotacao = () => {
    return `
      <!-- PÁGINA 1 - INFORMAÇÕES DO SEGURADO -->
      <div style="margin-bottom: 20px;">
        <h1 style="text-align: center; color: #166534; margin-bottom: 5px;">SEGUROS GERAIS</h1>
        <h2 style="text-align: center; color: #d00; margin-bottom: 10px;">COTACÃO</h2>
        <p style="text-align: center; font-weight: bold; color: #d00; background: #fff3cd; padding: 5px; border: 1px solid #ffc107;">
          Esta cotação será válida apenas por 30 dias
        </p>
      </div>

      <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 9pt;">
        <thead>
          <tr style="background-color: #166534; color: white;">
            <th colspan="2" style="padding: 8px; text-align: left;">INFORMAÇÕES DO SEGURADO</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td style="padding: 6px; border: 1px solid #ddd; width: 50%;">
              <strong>Segurado:</strong><br>
              ${cotacao.cliente.primeiroNome} ${cotacao.cliente.sobrenome}
            </td>
            <td style="padding: 6px; border: 1px solid #ddd; width: 50%;">
              <strong>Número da cotação:</strong><br>
              ${cotacao.id}
            </td>
          </tr>
          <tr>
            <td style="padding: 6px; border: 1px solid #ddd;">
              <strong>NUIT:</strong><br>
              ${cotacao.cliente.numeroDocumento || '128704132'}
            </td>
            <td style="padding: 6px; border: 1px solid #ddd;">
              <strong>Número da Apólice Anterior:</strong><br>
              Novo Negócio
            </td>
          </tr>
          <tr>
            <td style="padding: 6px; border: 1px solid #ddd;">
              <strong>Morada Postal:</strong><br>
              ${cotacao.cliente.morada || 'Q.01 Vila de Sede, Marracuene'}
            </td>
            <td style="padding: 6px; border: 1px solid #ddd;">
              <strong>Versão da Apólice:</strong><br>
              1
            </td>
          </tr>
          <tr>
            <td style="padding: 6px; border: 1px solid #ddd;">
              <strong>Data Efectiva:</strong><br>
              ${dataInicio.toLocaleDateString('pt-MZ')}
            </td>
            <td style="padding: 6px; border: 1px solid #ddd;">
              <strong>Data de Vencimento:</strong><br>
              ${dataFim.toLocaleDateString('pt-MZ')} (data inclusas)
            </td>
          </tr>
          <tr>
            <td colspan="2" style="padding: 6px; border: 1px solid #ddd;">
              <strong>Província:</strong><br>
              Maputo, Moçambique
            </td>
          </tr>
        </tbody>
      </table>

      <div style="margin-bottom: 20px;">
        <p><strong>Âmbito Territorial:</strong> Moçambique</p>
        <p><strong>Actividade Empresarial:</strong> ${cotacao.cliente.tipo === 'Empresarial' ? 'Empresa' : 'Particular'}</p>
        <p><strong>Agência:</strong> MAPUTO</p>
        <p><strong>Agente:</strong> DIRECT - MAPUTO</p>
      </div>

      <div style="background: #f8f9fa; padding: 10px; border: 1px solid #dee2e6; margin-bottom: 20px;">
        <p><strong>Esta cotação é renovada Anualmente. O prémio é pago numa base Anual.</strong></p>
      </div>

      <div style="margin-top: 50px;">
        <div style="float: right; text-align: center;">
          <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-MZ')}</p>
          <div style="border-top: 1px solid #000; padding-top: 10px; width: 200px;">
            Assinado: ......<br>
            <em>em nome da Companhia</em>
          </div>
        </div>
        <div style="clear: both;"></div>
      </div>

      <!-- Mais conteúdo seria adicionado aqui para outras páginas -->
    `;
  };

  // Versão alternativa mais simples (sem papel timbrado como imagem)
  const gerarPDFSimples = async () => {
    try {
      setGerandoPDF(true);

      const pdf = new jsPDF({
        orientation: 'portrait',
        unit: 'mm',
        format: 'a4'
      });

      // Configurar fonte e tamanho
      pdf.setFontSize(10);
      pdf.setFont('helvetica', 'normal');

      // Adicionar conteúdo
      adicionarPagina1(pdf);
      pdf.addPage();
      adicionarPagina2(pdf);
      pdf.addPage();
      adicionarPagina3(pdf);
      pdf.addPage();
      adicionarPagina4(pdf);
      pdf.addPage();
      adicionarPagina5(pdf);

      // Salvar PDF
      pdf.save(`cotacao_${cotacao.id}.pdf`);

    } catch (error) {
      console.error('Erro ao gerar PDF:', error);
      alert('Erro ao gerar PDF. Tente novamente.');
    } finally {
      setGerandoPDF(false);
    }
  };

  // Funções para adicionar cada página
  const adicionarPagina1 = (pdf) => {
    // Cabeçalho
    pdf.setFontSize(16);
    pdf.setTextColor(22, 101, 52);
    pdf.text('IMPERIAL SEGUROS', 105, 20, { align: 'center' });
    pdf.setFontSize(12);
    pdf.text('Moçambique, S.A.', 105, 27, { align: 'center' });
    
    pdf.setDrawColor(22, 101, 52);
    pdf.setLineWidth(0.5);
    pdf.line(20, 35, 190, 35);
    
    // Título
    pdf.setFontSize(14);
    pdf.setTextColor(0, 0, 0);
    pdf.text('SEGUROS GERAIS', 105, 45, { align: 'center' });
    pdf.setFontSize(18);
    pdf.text('COTAÇÃO', 105, 52, { align: 'center' });
    
    // Validade
    pdf.setFontSize(10);
    pdf.setTextColor(208, 0, 0);
    pdf.text('Esta cotação será válida apenas por 30 dias', 105, 60, { align: 'center' });
    
    // Informações do Segurado
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    
    let y = 70;
    pdf.text(`Segurado: ${cotacao.cliente.primeiroNome} ${cotacao.cliente.sobrenome}`, 20, y);
    pdf.text(`Número da cotação: ${cotacao.id}`, 110, y);
    
    y += 8;
    pdf.text(`NUIT: ${cotacao.cliente.numeroDocumento || '128704132'}`, 20, y);
    pdf.text(`Número da Apólice Anterior: Novo Negócio`, 110, y);
    
    y += 8;
    pdf.text(`Morada Postal: ${cotacao.cliente.morada || 'Q.01 Vila de Sede, Marracuene'}`, 20, y);
    pdf.text(`Versão da Apólice: 1`, 110, y);
    
    y += 8;
    pdf.text(`Data Efectiva: ${dataInicio.toLocaleDateString('pt-MZ')}`, 20, y);
    pdf.text(`Data de Vencimento: ${dataFim.toLocaleDateString('pt-MZ')} (data inclusas)`, 110, y);
    
    y += 8;
    pdf.text(`Província: Maputo, Moçambique`, 20, y);
    
    // Período de Seguro
    y += 15;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Período de Seguro:', 20, y);
    pdf.setFont('helvetica', 'normal');
    
    y += 7;
    pdf.text(`(a) Desde ${dataInicio.toLocaleDateString('pt-MZ')} até ${dataFim.toLocaleDateString('pt-MZ')} (ambas as datas inclusas)`, 25, y);
    
    y += 7;
    pdf.text(`(b) Qualquer período posterior para o qual o segurador aceite ou concorde aceitar`, 25, y);
    y += 4;
    pdf.text(`pagamento para renovação da apólice.`, 25, y);
    
    // Outras informações
    y += 10;
    pdf.text(`Âmbito Territorial: Moçambique`, 20, y);
    y += 5;
    pdf.text(`Actividade Empresarial: ${cotacao.cliente.tipo === 'Empresarial' ? 'Empresa' : 'Particular'}`, 20, y);
    y += 5;
    pdf.text(`Agência: MAPUTO`, 20, y);
    y += 5;
    pdf.text(`Agente: DIRECT - MAPUTO`, 20, y);
    
    // Nota renovação
    y += 10;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Esta cotação é renovada Anualmente. O prémio é pago numa base Anual.', 105, y, { align: 'center' });
    
    // Assinatura
    y = 250;
    pdf.text('Data:', 150, y);
    pdf.text(new Date().toLocaleDateString('pt-MZ'), 170, y);
    
    y += 20;
    pdf.line(150, y, 190, y);
    pdf.text('Assinado: ......', 155, y + 5);
    pdf.setFontSize(8);
    pdf.text('em nome da Companhia', 155, y + 10);
    
    // Número da página
    pdf.setFontSize(8);
    pdf.setTextColor(102, 102, 102);
    pdf.text('Página 1 de 5', 190, 290, { align: 'right' });
  };

  const adicionarPagina2 = (pdf) => {
    // Cabeçalho
    pdf.setFontSize(16);
    pdf.setTextColor(22, 101, 52);
    pdf.text('IMPERIAL SEGUROS', 105, 20, { align: 'center' });
    pdf.setFontSize(14);
    pdf.text('TABELA DE PRÉMIOS', 105, 30, { align: 'center' });
    
    // Dados da cotação
    pdf.setFontSize(10);
    pdf.setTextColor(0, 0, 0);
    
    pdf.text(`Número da cotação: ${cotacao.id}`, 20, 45);
    pdf.text(`Número da Versão: 1`, 20, 50);
    pdf.text(`Válida a Partir de: ${dataInicio.toLocaleDateString('pt-MZ')}`, 20, 55);
    
    pdf.text(`Data de Impressão: ${new Date().toLocaleDateString('pt-MZ')}`, 110, 45);
    pdf.text(`Válida Até: ${dataFim.toLocaleDateString('pt-MZ')} (data inclusas)`, 110, 55);
    
    // Tabela de Prémios
    let y = 65;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Secções da Apólice', 20, y);
    pdf.text('Subscritas', 90, y);
    pdf.text('Prémio Anual', 130, y);
    pdf.text('Prémio Adicional', 170, y);
    
    pdf.setDrawColor(0, 0, 0);
    pdf.line(20, y + 1, 190, y + 1);
    
    y += 10;
    pdf.setFont('helvetica', 'normal');
    pdf.text('Automóvel', 20, y);
    pdf.text('Sim', 90, y);
    pdf.text(`MT ${premioBase.toFixed(2)}`, 130, y);
    pdf.text('MT 0.00', 170, y);
    
    y += 8;
    pdf.setFont('helvetica', 'bold');
    pdf.text('Total', 20, y);
    pdf.text(`MT ${premioBase.toFixed(2)}`, 130, y);
    pdf.text('MT 0.00', 170, y);
    
    y += 8;
    pdf.setFont('helvetica', 'normal');
    pdf.text('Custos Administrativos', 20, y);
    pdf.text(`MT ${custosAdmin.toFixed(2)}`, 130, y);
    pdf.text('MT 0.00', 170, y);
    
    y += 8;
    pdf.text('Sobre Taxa', 20, y);
    pdf.text(`MT ${sobreTaxa.toFixed(2)}`, 130, y);
    pdf.text('MT 0.00', 170, y);
    
    y += 8;
    pdf.text('Imposto de Selo', 20, y);
    pdf.text(`MT ${impostoSelo.toFixed(2)}`, 130, y);
    pdf.text('MT 0.00', 170, y);
    
    y += 10;
    pdf.setFont('helvetica', 'bold');
    pdf.setFillColor(232, 245, 233);
    pdf.rect(20, y - 5, 170, 8, 'F');
    pdf.text('PRÉMIO TOTAL', 20, y);
    pdf.text(`MT ${cotacao.totalPremio.toFixed(2)}`, 130, y);
    
    // Pagamento do Prémio
    y += 15;
    pdf.setFont('helvetica', 'bold');
    pdf.text('PAGAMENTO DO PRÉMIO', 20, y);
    
    y += 8;
    pdf.setFontSize(9);
    pdf.text('EFICÁCIA DO CONTRATO E CONSEQUÊNCIA DA FALTA DO PAGAMENTO DO PRÉMIO', 20, y);
    
    y += 8;
    pdf.setFont('helvetica', 'normal');
    pdf.text('1. A cobertura efectiva dos riscos apenas se verifica a partir do momento em que é feito o', 25, y);
    y += 4;
    pdf.text('pagamento do prémio do seguro ou fracção;', 25, y);
    
    y += 8;
    pdf.text('2. A falta de pagamento do prémio da anuidade subsequente ou da primeira fracção deste,', 25, y);
    y += 4;
    pdf.text('impede a renovação do contrato e o não pagamento de qualquer fracção do prémio do', 25, y);
    y += 4;
    pdf.text('decurso de uma anuidade determina a resolução automática e imediata do contrato,', 25, y);
    y += 4;
    pdf.text('na data em que o pagamento dessa fracção é devido.', 25, y);
    
    // Dados Bancários
    y += 15;
    pdf.setFont('helvetica', 'bold');
    pdf.setFontSize(10);
    pdf.text('Bank Details Imperial Insurance Moçambique, S.A.', 20, y);
    
    // Adicionar tabela de bancos (simplificada)
    y += 8;
    pdf.setFontSize(8);
    pdf.setFont('helvetica', 'bold');
    pdf.text('Nome Banco', 20, y);
    pdf.text('Conta MZN', 60, y);
    pdf.text('NIB MZN', 90, y);
    
    y += 5;
    pdf.line(20, y, 190, y);
    
    pdf.setFont('helvetica', 'normal');
    bancos.forEach((banco, index) => {
      if (y > 280) {
        pdf.addPage();
        y = 20;
      }
      
      pdf.text(banco.nome, 20, y);
      pdf.text(banco.contaMZN || '', 60, y);
      pdf.text(banco.nibMZN || '', 90, y);
      y += 5;
    });
    
    // Número da página
    pdf.setFontSize(8);
    pdf.setTextColor(102, 102, 102);
    pdf.text('Página 2 de 5', 190, 290, { align: 'right' });
  };

  // ... continuar com adicionarPagina3, 4, 5 para adicionar as condições, exclusões, etc.

  return (
    <div>
      <button 
        onClick={gerarPDFSimples}
        disabled={gerandoPDF}
        style={{
          backgroundColor: '#166534',
          color: 'white',
          border: 'none',
          padding: '10px 20px',
          borderRadius: '5px',
          cursor: 'pointer',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        {gerandoPDF ? (
          <>
            <span style={{display: 'inline-block', width: '16px', height: '16px', border: '2px solid white', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 1s linear infinite'}}></span>
            Gerando PDF...
          </>
        ) : (
          '📄 Gerar Cotação PDF'
        )}
      </button>

      <style>{`
        @keyframes spin {
          0% { transform: rotate(0deg); }
          100% { transform: rotate(360deg); }
        }
      `}</style>

      {/* Elemento oculto para referência */}
      <div ref={pdfRef} style={{ display: 'none' }}>
        {gerarConteudoCotacao()}
      </div>
    </div>
  );
}

export default GeradorPDFComPapelTimbrado;