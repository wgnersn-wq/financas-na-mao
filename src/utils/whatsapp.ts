// src/utils/whatsapp.ts

export const enviarGastosPorPessoa = (transacoes: any[], nomePessoa: string) => {
  if (!nomePessoa.trim()) {
    alert("Por favor, digite o nome da pessoa.");
    return;
  }

  // Filtra apenas SAÍDAS e que contenham o nome na descrição
  const gastosDaPessoa = transacoes.filter((t) => 
    t.tipo === 'saida' && 
    t.descricao?.toLowerCase().includes(nomePessoa.toLowerCase())
  );

  if (gastosDaPessoa.length === 0) {
    alert(`Nenhum gasto encontrado para "${nomePessoa}"`);
    return;
  }

  const total = gastosDaPessoa.reduce((acc, t) => acc + Number(t.valor), 0);
  
  // Montagem da mensagem
  let mensagem = `*RESUMO DE GASTOS: ${nomePessoa.toUpperCase()}*%0A%0A`;
  
  gastosDaPessoa.forEach(g => {
    const partesData = g.data_transacao.split('-');
    const dataFormatada = `${partesData[2]}/${partesData[1]}/${partesData[0]}`;
    const valorFormatado = Number(g.valor).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
    
    mensagem += `• ${dataFormatada} | *${g.descricao}*: ${valorFormatado}%0A`;
  });
  
  const totalFormatado = total.toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
  mensagem += `%0A---------------------------%0A`;
  mensagem += `*TOTAL A PAGAR: ${totalFormatado}*%0A`;
  mensagem += `---------------------------%0A`;
  mensagem += `_Enviado via Finanças na Mão_`;
  
  const url = `https://wa.me/?text=${mensagem}`;
  window.open(url, '_blank');
};