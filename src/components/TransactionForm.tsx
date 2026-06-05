'use client';

import React, { useState, useEffect } from 'react';
import { X, Tag, Calendar, CheckCircle2 } from 'lucide-react';
// Importação direta e blindada contra erros de build
import { supabase } from '@/lib/supabase';

interface TransactionFormProps {
  isOpen: boolean;
  onClose: () => void;
  categorias: any[];
  user: any;
  dataFiltro: Date;
  onSuccess: () => void;
}

export default function TransactionForm({
  isOpen,
  onClose,
  categorias,
  user,
  dataFiltro,
  onSuccess,
}: TransactionFormProps) {
  const [descricao, setDescricao] = useState('');
  const [valor, setValor] = useState('');
  const [tipo, setTipo] = useState<'entrada' | 'saida'>('saida');
  const [categoriaId, setCategoriaId] = useState('');
  const [parcelas, setParcelas] = useState('1');
  const [sucesso, setSucesso] = useState(false);

  const categoriasFiltradas = categorias.filter((cat) => cat.tipo === tipo);

  useEffect(() => {
    if (categoriasFiltradas.length > 0) {
      setCategoriaId(categoriasFiltradas[0].id);
    } else {
      setCategoriaId('');
    }
  }, [tipo, categorias]);

  function formatarMoeda(valores: string) {
    const apenasNumeros = valores.replace(/\D/g, '');
    const opcao = { minimumFractionDigits: 2, maximumFractionDigits: 2 };
    const valorFormatado = new Intl.NumberFormat('pt-BR', opcao).format(
      parseFloat(apenasNumeros) / 100
    );
    return 'R$ ' + (isNaN(parseFloat(apenasNumeros)) ? '0,00' : valorFormatado);
  }

  function handleValorChange(e: React.ChangeEvent<HTMLInputElement>) {
    setValor(formatarMoeda(e.target.value));
  }

  function converterMascaraParaNumero(valorMascara: string) {
    const limpo = valorMascara.replace('R$', '').replace(/\./g, '').replace(',', '.').trim();
    return parseFloat(limpo) || 0;
  }

  async function handleAdicionarTransacao(e: React.FormEvent) {
    e.preventDefault();
    if (!valor || !user) return;

    const valorTotal = converterMascaraParaNumero(valor);
    if (valorTotal <= 0) {
      alert('Por favor, digite um valor válido.');
      return;
    }

    const qtdParcelas = tipo === 'saida' ? parseInt(parcelas) || 1 : 1;
    const valorDaParcela = parseFloat((valorTotal / qtdParcelas).toFixed(2));

    let descricaoFinal = descricao.trim();
    if (!descricaoFinal) {
      const categoriaAtual = categorias.find((c) => c.id === categoriaId);
      descricaoFinal = categoriaAtual ? categoriaAtual.nome : (tipo === 'entrada' ? 'Entrada' : 'Saída');
    }

    const idParcelamento = qtdParcelas > 1 ? `parc_${Date.now()}_${user.id.slice(0, 5)}` : null;
    const novasTransacoes = [];
    const dataBase = new Date(dataFiltro);

    for (let i = 0; i < qtdParcelas; i++) {
      const dataParcela = new Date(dataBase.getFullYear(), dataBase.getMonth() + i, dataBase.getDate());
      const dataFormatada = `${dataParcela.getFullYear()}-${String(dataParcela.getMonth() + 1).padStart(2, '0')}-${String(dataParcela.getDate()).padStart(2, '0')}`;
      const descricaoParcela = qtdParcelas > 1 ? `${descricaoFinal} (${i + 1}/${qtdParcelas})` : descricaoFinal;

      novasTransacoes.push({
        user_id: user.id,
        descricao: descricaoParcela,
        valor: valorDaParcela,
        tipo,
        categoria_id: categoriaId || null,
        data_transacao: dataFormatada,
        id_parcelamento: idParcelamento,
        pago: true,
      });
    }

    const { error } = await supabase.from('transacoes').insert(novasTransacoes);

    if (error) {
      alert('Erro ao salvar lançamento: ' + error.message);
    } else {
      // Dispara a animação visual de sucesso na tela
      setSucesso(true);

      // Espera 1.5 segundos mostrando a tela de sucesso antes de resetar e fechar o formulário
      setTimeout(() => {
        setSucesso(false);
        setDescricao('');
        setValor('');
        setParcelas('1');
        onClose();
        onSuccess();
      }, 1500);
    }
  }

  if (!isOpen) return null;

  return (
    <div className="absolute inset-0 bg-slate-950/80 backdrop-blur-sm z-30 flex flex-col justify-end">
      <div className="bg-slate-900 border-t border-slate-800 rounded-t-3xl p-6 space-y-4 animate-in slide-in-from-bottom duration-200 max-w-md mx-auto w-full relative overflow-hidden">
        
        {/* TELA FLUTUANTE DE SUCESSO INTEGRADA */}
        {sucesso && (
          <div className="absolute inset-0 bg-slate-900/95 flex flex-col items-center justify-center space-y-3 z-40 animate-in fade-in duration-200">
            <CheckCircle2 className="w-16 h-16 text-emerald-400 animate-bounce" />
            <p className="text-emerald-400 font-bold text-lg">Lançamento Salvo!</p>
            <p className="text-xs text-slate-400">Seus dados foram processados com sucesso.</p>
          </div>
        )}

        <div className="flex justify-between items-center border-b border-slate-800 pb-3">
          <h3 className="text-sm font-bold text-slate-200">Adicionar Transação</h3>
          <button type="button" onClick={onClose} className="text-slate-400 hover:text-slate-200">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleAdicionarTransacao} className="space-y-4">
          <div className="grid grid-cols-2 gap-2 bg-slate-950 p-1 rounded-xl border border-slate-800">
            <button 
              type="button"
              onClick={() => setTipo('entrada')}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${tipo === 'entrada' ? 'bg-emerald-500 text-slate-950' : 'text-slate-400'}`}
            >
              Entrada
            </button>
            <button 
              type="button"
              onClick={() => setTipo('saida')}
              className={`py-2 text-xs font-bold rounded-lg transition-all ${tipo === 'saida' ? 'bg-rose-500 text-white' : 'text-slate-400'}`}
            >
              Saída
            </button>
          </div>

          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1">Categoria</label>
            <div className="relative">
              <Tag className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
              <select
                value={categoriaId}
                onChange={(e) => setCategoriaId(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 pl-10 pr-4 text-xs text-slate-100 focus:outline-none focus:border-emerald-500 appearance-none transition-colors"
                required
              >
                {categoriasFiltradas.map((cat) => (
                  <option key={cat.id} value={cat.id} className="bg-slate-900 text-slate-100">
                    {cat.nome}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1">Valor</label>
            <input 
              type="text" 
              inputMode="numeric" 
              placeholder="R$ 0,00" 
              required
              value={valor}
              onChange={handleValorChange}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-base font-bold text-slate-100 focus:outline-none focus:border-emerald-500 text-right"
            />
          </div>

          {tipo === 'saida' && (
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1 flex items-center gap-1">
                <Calendar className="w-3.5 h-3.5 text-slate-500" /> Parcelar lançamento?
              </label>
              <select 
                value={parcelas} 
                onChange={(e) => setParcelas(e.target.value)}
                className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2.5 px-4 text-xs text-slate-100 focus:outline-none focus:border-emerald-500"
              >
                <option value="1">À vista (1x)</option>
                <option value="2">2 vezes</option>
                <option value="3">3 vezes</option>
                <option value="4">4 vezes</option>
                <option value="5">5 vezes</option>
                <option value="6">6 vezes</option>
                <option value="12">12 vezes</option>
              </select>
              {parcelas !== '1' && valor && (
                <p className="text-[10px] text-emerald-400 mt-1 px-1">
                  Projeção: {parcelas}x de R$ {(converterMascaraParaNumero(valor) / parseInt(parcelas)).toLocaleString('pt-BR', {minimumFractionDigits: 2})} nos próximos meses.
                </p>
              )}
            </div>
          )}

          <div>
            <label className="text-xs text-slate-400 font-medium block mb-1">Descrição / Nome (Opcional)</label>
            <input 
              type="text" 
              placeholder="Nome personalizado do lançamento" 
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 px-4 text-sm text-slate-100 focus:outline-none focus:border-emerald-500"
            />
          </div>

          <button type="submit" className={`w-full py-3 rounded-xl text-sm font-bold shadow-lg mt-2 transition-colors ${
            tipo === 'entrada' ? 'bg-emerald-500 text-slate-950 hover:bg-emerald-600' : 'bg-rose-500 text-white hover:bg-rose-600'
          }`}>
            Confirmar Lançamento
          </button>
        </form>
      </div>
    </div>
  );
}