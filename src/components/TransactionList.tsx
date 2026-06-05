'use client';

import React, { useState } from 'react';
import { History, DollarSign, Trash2, AlertTriangle } from 'lucide-react';
// Importação direta e blindada contra erros de build
import { supabase } from '@/lib/supabase';

interface TransactionListProps {
  transacoes: any[];
  categorias: any[];
  dataFiltro: Date;
  onRefresh: () => void;
}

export default function TransactionList({
  transacoes,
  categorias,
  dataFiltro,
  onRefresh,
}: TransactionListProps) {
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [transacaoAlvo, setTransacaoAlvo] = useState<any | null>(null);
  const [excluirTodoParcelamento, setExcluirTodoParcelamento] = useState(false);

  function acionarExclusao(item: any) {
    setTransacaoAlvo(item);
    setExcluirTodoParcelamento(false);
    setIsDeleteModalOpen(true);
  }

  async function confirmarExclusao() {
    if (!transacaoAlvo) return;

    try {
      if (excluirTodoParcelamento && transacaoAlvo.id_parcelamento) {
        // Deleta a série inteira usando a chave estruturada de forma assíncrona direta
        const { error } = await supabase
          .from('transacoes')
          .delete()
          .eq('id_parcelamento', transacaoAlvo.id_parcelamento);

        if (error) throw error;
      } else {
        // Deleta exclusivamente o item selecionado
        const { error } = await supabase
          .from('transacoes')
          .delete()
          .eq('id', transacaoAlvo.id);

        if (error) throw error;
      }

      // Atualiza a listagem na tela após sucesso
      onRefresh();
    } catch (error: any) {
      alert('Erro ao excluir: ' + error.message);
    } finally {
      // Fecha o modal e limpa os estados auxiliares
      setIsDeleteModalOpen(false);
      setTransacaoAlvo(null);
    }
  }

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2 text-slate-300">
        <History className="w-4 h-4 text-emerald-400" />
        <h2 className="text-sm font-bold">
          Lançamentos de {dataFiltro.toLocaleDateString('pt-BR', { month: 'short' })} ({transacoes.length})
        </h2>
      </div>

      <div className="space-y-2">
        {transacoes.length === 0 ? (
          <div className="text-center py-8 bg-slate-900/20 border border-dashed border-slate-900 rounded-2xl">
            <p className="text-xs text-slate-500">Nenhum gasto ou ganho neste mês.</p>
          </div>
        ) : (
          transacoes.map((item) => {
            const catDoItem = categorias.find((c) => c.id === item.categoria_id);
            return (
              <div 
                key={item.id} 
                className="bg-slate-900/60 border border-slate-900 rounded-xl p-3 flex justify-between items-center"
              >
                <div className="flex items-center gap-3">
                  <div className={`p-2 rounded-lg ${
                    item.tipo === 'entrada' ? 'bg-emerald-500/10 text-emerald-400' : 'bg-rose-500/10 text-rose-400'
                  }`}>
                    <DollarSign className="w-4 h-4" />
                  </div>
                  <div>
                    <p className="text-xs font-semibold text-slate-200">{item.descricao}</p>
                    <p className="text-[10px] text-slate-500">
                      {catDoItem ? catDoItem.nome : 'Geral'} • {item.data_transacao.split('-').reverse().slice(0,2).join('/')}
                    </p>
                  </div>
                </div>
                
                <div className="flex items-center gap-3">
                  <p className={`text-xs font-bold ${
                    item.tipo === 'entrada' ? 'text-emerald-400' : 'text-slate-200'
                  }`}>
                    {item.tipo === 'entrada' ? '+' : '-'} R$ {Number(item.valor).toFixed(2)}
                  </p>
                  
                  <button 
                    type="button"
                    onClick={() => acionarExclusao(item)}
                    className="text-slate-500 hover:text-rose-400 p-1 rounded-lg transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* MODAL CUSTOMIZADO DE EXCLUSÃO INTELIGENTE */}
      {isDeleteModalOpen && (
        <div className="fixed inset-0 bg-slate-950/80 backdrop-blur-sm z-50 flex items-center justify-center px-4">
          <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 max-w-sm w-full text-center space-y-4 shadow-2xl">
            <div className="mx-auto bg-rose-500/10 p-3 rounded-2xl border border-rose-500/20 inline-block">
              <AlertTriangle className="w-6 h-6 text-rose-400" />
            </div>
            <div>
              <h3 className="text-base font-bold text-slate-100">Excluir Registro</h3>
              <p className="text-xs text-slate-400 mt-1 leading-relaxed">
                Tem certeza que deseja apagar o lançamento de <span className="font-bold text-slate-200">"{transacaoAlvo?.descricao}"</span>?
              </p>
            </div>

            {/* SE FOR PARCELADO, EXIBE OPÇÕES ADICIONAIS */}
            {transacaoAlvo?.id_parcelamento && (
              <div className="bg-slate-950 p-3 rounded-xl border border-slate-800 text-left space-y-2">
                <p className="text-[10px] uppercase font-black text-amber-400 tracking-wider">⚠️ Lançamento Parcelado Detectado</p>
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input 
                    type="radio" 
                    name="tipoExclusao"
                    checked={!excluirTodoParcelamento} 
                    onChange={() => setExcluirTodoParcelamento(false)} 
                    className="text-emerald-500 focus:ring-0 bg-slate-900 border-slate-700"
                  />
                  Apagar apenas esta parcela
                </label>
                <label className="flex items-center gap-2 text-xs text-slate-300 cursor-pointer">
                  <input 
                    type="radio" 
                    name="tipoExclusao"
                    checked={excluirTodoParcelamento} 
                    onChange={() => setExcluirTodoParcelamento(true)} 
                    className="text-emerald-500 focus:ring-0 bg-slate-900 border-slate-700"
                  />
                  Apagar todas as parcelas do fluxo
                </label>
              </div>
            )}

            <div className="grid grid-cols-2 gap-3 pt-2">
              <button 
                type="button"
                onClick={() => { setIsDeleteModalOpen(false); setTransacaoAlvo(null); }}
                className="bg-slate-950 hover:bg-slate-850 border border-slate-800 text-slate-300 font-bold py-2.5 rounded-xl text-xs transition-colors"
              >
                Cancelar
              </button>
              <button 
                type="button"
                onClick={confirmarExclusao}
                className="bg-rose-500 hover:bg-rose-600 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-lg"
              >
                Confirmar
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}