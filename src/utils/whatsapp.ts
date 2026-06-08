// src/utils/whatsapp.ts

/**
 * Função para enviar resumo de gastos de uma pessoa específica via WhatsApp.
 * Captura tanto lançamentos simples quanto parcelados.
 */
export const enviarGastosPorPessoa = (transacoes: any[], nomePessoa: string) => {
  if (!nomePessoa || !nomePessoa.trim()) {
    alert("Por favor, digite o nome da pessoa.");
    return;
  }

  // 1. Normalização para busca precisa
  // Usamos toLowerCase() e trim() para garantir que "Gisele" 
  // encontre "gisele" ou "Gisele (1/2)"
  const nomeBusca = nomePessoa.trim().toLowerCase();

  // 2. Filtro:
  // - Apenas tipo 'saida'
  // - A descrição começa com o nome da pessoa (pegando tanto "Gisele" quanto "Gisele (1/2)")
  const gastosDaPessoa = transacoes.filter((t) => {
    const descricao = (t.descricao || '').toLowerCase();
    return t.tipo === 'saida' && descricao.startsWith(nomeBusca);
  });

  if (gastosDaPessoa.length === 0) {
    alert(`Nenhum gasto encontrado para "${nomePessoa}"`);
    return;
  }

  // 3. Cálculo do Total
  const total = gastosDaPessoa.reduce((acc, t) => acc + Number(t.valor), 0);
  
  // 4. Montagem da Mensagem
  // Usamos \n para quebras de linha e montamos o texto base
  let mensagem = `*RESUMO DE GASTOS: ${nomePessoa.toUpperCase()}*\n\n`;
  
  gastosDaPessoa.forEach(g => {
    const partesData = g.data_transacao.split('-');
    const dataFormatada = `${partesData[2]}/${partesData[1]}/${partesData[0]}`;
    const valorFormatado = Number(g.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    
    mensagem += `• ${dataFormatada} | *${g.descricao}*: ${valorFormatado}\n`;
  });
  
  const totalFormatado = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  mensagem += `\n---------------------------\n`;
  mensagem += `*TOTAL A PAGAR: ${totalFormatado}*\n`;
  mensagem += `---------------------------\n`;
  mensagem += `_Enviado via Finanças na Mão_`;
  
  // 5. Codificação segura para a URL do WhatsApp
  // encodeURIComponent trata todos os caracteres especiais (acentos, R$, \n)
  const url = `https://wa.me/?text=${encodeURIComponent(mensagem)}`;
  
  // Abre o link em uma nova aba
  window.open(url, '_blank');
};