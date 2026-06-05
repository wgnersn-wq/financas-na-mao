'use client';

import React from 'react';
import { BarChart3, Download, TrendingDown } from 'lucide-react';

interface ReportTabProps {
  transacoes: any[];
  categorias: any[];
  saidas: number;
  entradas: number;
  dataFiltro: Date;
}

export default function ReportTab({ transacoes, categorias, saidas, entradas, dataFiltro }: ReportTabProps) {
  // 1. Agrupamento dinâmico dos gastos por categorias
  const relatorioCategorias = categorias
    .map((cat) => {
      const totalGasto = transacoes
        .filter((t) => t.categoria_id === cat.id && t.tipo === 'saida')
        .reduce((acc, t) => acc + Number(t.valor), 0);
      return { ...cat, total: totalGasto };
    })
    .filter((c) => c.total > 0)
    .sort((a, b) => b.total - a.total);

  // 2. Descobrir qual foi o maior gasto para gerar o Insight
  const categoriaMaiorGasto = relatorioCategorias.length > 0 ? relatorioCategorias[0] : null;
  const percentualMaiorGasto = categoriaMaiorGasto && saidas > 0 
    ? ((categoriaMaiorGasto.total / saidas) * 100).toFixed(0) 
    : 0;

  // 3. Função de Exportar CSV (Excel) - Método Blob (Corrigido para colunas)
  function exportarRelatorioCSV() {
    if (transacoes.length === 0) {
      alert('Não há transações neste mês para exportar.');
      return;
    }

    const separador = ';'; // Padrão recomendado para Excel Brasil
    const cabecalhos = ['Data', 'Nome', 'Categoria', 'Tipo', 'Valor'];
    
    const linhas = transacoes.map(t => {
      const partesData = t.data_transacao.split('-');
      const dataFormatada = `${partesData[2]}/${partesData[1]}/${partesData[0]}`;
      const categoriaNome = categorias.find(c => c.id === t.categoria_id)?.nome || 'Sem Categoria';
      const tipo = t.tipo === 'entrada' ? 'Entrada' : 'Saída';
      const valor = Number(t.valor).toFixed(2).replace('.', ',');
      
      return [dataFormatada, t.descricao || 'Lançamento', categoriaNome, tipo, `R$ ${valor}`].join(separador);
    });

    // Adiciona o BOM (\uFEFF) para forçar o Excel a reconhecer acentos (UTF-8)
    const conteudoCSV = "\uFEFF" + [cabecalhos.join(separador), ...linhas].join('\n');
    const blob = new Blob([conteudoCSV], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    
    const link = document.createElement("a");
    link.setAttribute("href", url);
    link.setAttribute("download", `Relatorio_Financas_${String(dataFiltro.getMonth() + 1).padStart(2, '0')}_${dataFiltro.getFullYear()}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-3xl p-5 space-y-4 shadow-xl animate-in fade-in duration-200">
      
      {/* CABEÇALHO DO RELATÓRIO COM BOTÃO DE EXPORTAR */}
      <div className="flex items-center justify-between border-b border-slate-800 pb-3">
        <div className="flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-emerald-400" />
          <h3 className="text-sm font-bold text-slate-100">Distribuição Mensal</h3>
        </div>
        <button 
          onClick={exportarRelatorioCSV}
          className="flex items-center gap-1.5 bg-slate-800 hover:bg-slate-700 text-slate-300 py-1.5 px-3 rounded-lg text-xs font-semibold transition-colors border border-slate-700 hover:border-slate-600"
        >
          <Download className="w-3.5 h-3.5" />
          Exportar
        </button>
      </div>

      {/* CARD DE INSIGHT AUTOMÁTICO */}
      {categoriaMaiorGasto && (
        <div className="bg-slate-950/50 p-3 rounded-xl border border-slate-800/60 flex items-start gap-3">
          <div className="bg-slate-800 p-2 rounded-lg mt-0.5">
            <TrendingDown className="w-4 h-4 text-rose-400" />
          </div>
          <div>
            <p className="text-xs text-slate-300 leading-relaxed">
              Atenção: <strong>{percentualMaiorGasto}%</strong> das suas saídas neste mês foram com <strong style={{ color: categoriaMaiorGasto.cor }}>{categoriaMaiorGasto.nome}</strong>.
            </p>
          </div>
        </div>
      )}

      {/* BARRAS DE PROGRESSO */}
      {relatorioCategorias.length === 0 ? (
        <p className="text-xs text-slate-400 text-center py-6">Nenhum gasto registrado neste mês.</p>
      ) : (
        <div className="space-y-4 pt-2">
          {relatorioCategorias.map((cat) => {
            const percentual = saidas > 0 ? (cat.total / saidas) * 100 : 0;
            return (
              <div key={cat.id} className="space-y-1.5">
                <div className="flex justify-between text-xs font-semibold">
                  <span className="text-slate-300 flex items-center gap-2">
                    <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: cat.cor || '#6b7280' }} />
                    {cat.nome}
                  </span>
                  <span className="text-slate-100">
                    R$ {cat.total.toLocaleString('pt-BR', { minimumFractionDigits: 2 })} 
                    <span className="text-slate-500 font-normal ml-1.5">({percentual.toFixed(0)}%)</span>
                  </span>
                </div>
                <div className="w-full bg-slate-950 h-2 rounded-full overflow-hidden border border-slate-850">
                  <div className="h-full rounded-full transition-all duration-500" style={{ width: `${percentual}%`, backgroundColor: cat.cor || '#6b7280' }} />
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}