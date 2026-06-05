'use client';

import React, { useState, useEffect } from 'react';
import { Wallet, LogOut, Mail, Lock, PlusCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

// IMPORTAÇÃO DOS COMPONENTES ESTRUTURADOS
import MonthFilter from '../components/MonthFilter';
import DashboardCards from '../components/DashboardCards';
import TransactionForm from '../components/TransactionForm';
import TransactionList from '../components/TransactionList';

export default function Home() {
  // Estados de Sessão e Carregamento
  const [user, setUser] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [isLogin, setIsLogin] = useState(true);

  // Estados dos Formulários de Autenticação
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [authError, setAuthError] = useState('');
  const [authSuccess, setAuthSuccess] = useState('');
  
  // Criação de instância de data local segura para evitar fuso horário UTC incorreto
  const [dataFiltro, setDataFiltro] = useState<Date>(new Date());
  
  // Sincroniza a data do dispositivo do usuário uma vez ao montar o componente
  useEffect(() => {
    setDataFiltro(new Date());
  }, []);

  // Estados do Modal e Dados Financeiros
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [saldo, setSaldo] = useState(0);
  const [entraces, setEntraces] = useState(0);
  const [saidas, setSaidas] = useState(0);
  const [transacoes, setTransacoes] = useState<any[]>([]);
  const [categorias, setCategorias] = useState<any[]>([]);

  // 1. Verificar autenticação inicial e monitorar mudanças de sessão
  useEffect(() => {
    async function checkUser() {
      const { data: { user } } = await supabase.auth.getUser();
      setUser(user);
      if (user) {
        await gerenciarCategoriasPadrao(user.id);
        carregarDadosFinanceiros(user.id, new Date());
      }
      setLoading(false);
    }
    checkUser();

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (_event, session) => {
      setUser(session?.user ?? null);
      if (session?.user) {
        await gerenciarCategoriasPadrao(session.user.id);
        carregarDadosFinanceiros(session.user.id, new Date());
      } else {
        setTransacoes([]);
        setCategorias([]);
        setSaldo(0);
        setEntraces(0);
        setSaidas(0);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  // Recarregar os dados automaticamente quando o usuário mudar o mês do filtro
  useEffect(() => {
    if (user) carregarDadosFinanceiros(user.id, dataFiltro);
  }, [dataFiltro, user]);

  // Gerenciamento de categorias automáticas
  async function gerenciarCategoriasPadrao(userId: string) {
    const { data: existentes } = await supabase.from('categorias').select('*').eq('user_id', userId);
    if (!existentes || existentes.length === 0) {
      const padrao = [
        { user_id: userId, nome: 'Alimentação', tipo: 'saida', cor: '#ef4444' },
        { user_id: userId, nome: 'Transporte', tipo: 'saida', cor: '#3b82f6' },
        { user_id: userId, nome: 'Lazer', tipo: 'saida', cor: '#10b981' },
        { user_id: userId, nome: 'Salário', tipo: 'entrada', cor: '#10b981' },
        { user_id: userId, nome: 'Outros Ganhos', tipo: 'entrada', cor: '#f59e0b' },
        { user_id: userId, nome: 'Outros Gastos', tipo: 'saida', cor: '#6b7280' },
      ];
      await supabase.from('categorias').insert(padrao);
      const { data: atualizadas } = await supabase.from('categorias').select('*').eq('user_id', userId);
      if (atualizadas) setCategorias(atualizadas);
    } else {
      setCategorias(existentes);
    }
  }

  // Buscar dados reais baseados estritamente nas datas locais
  async function carregarDadosFinanceiros(userId: string, dataAlvo: Date) {
    const ano = dataAlvo.getFullYear();
    const mes = dataAlvo.getMonth();
    
    // Tratamento estrito de string de data local prevenindo quebra de fuso horário
    const primeiroDia = `${ano}-${String(mes + 1).padStart(2, '0')}-01`;
    const ultimoDia = `${ano}-${String(mes + 1).padStart(2, '0')}-${String(new Date(ano, mes + 1, 0).getDate()).padStart(2, '0')}`;

    const { data } = await supabase
      .from('transacoes')
      .select('*')
      .eq('user_id', userId)
      .gte('data_transacao', primeiroDia)
      .lte('data_transacao', ultimoDia)
      .order('data_transacao', { ascending: false });

    if (data) {
      setTransacoes(data);
      let totalEntradas = 0;
      let totalSaidas = 0;
      data.forEach((t) => {
        const val = Number(t.valor);
        if (t.tipo === 'entrada') totalEntradas += val;
        else totalSaidas += val;
      });
      setEntraces(totalEntradas);
      setSaidas(totalSaidas);
      setSaldo(totalEntradas - totalSaidas);
    }
  }

  // Alteração manual de meses (Avançar / Voltar)
  function alterarMes(direcao: 'anterior' | 'proximo') {
    setDataFiltro(prev => {
      const novaData = new Date(prev);
      direcao === 'anterior' ? novaData.setMonth(novaData.getMonth() - 1) : novaData.setMonth(novaData.getMonth() + 1);
      return novaData;
    });
  }

  // Autenticação do Supabase
  async function handleAuth(e: React.FormEvent) {
    e.preventDefault();
    setAuthError(''); setAuthSuccess('');
    if (isLogin) {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) setAuthError('E-mail ou senha incorretos.');
    } else {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) setAuthError('Erro ao cadastrar.');
      else setAuthSuccess(`Conta criada com sucesso! Valide no e-mail ${email}.`);
    }
  }

  if (loading) {
    return <div className="min-h-screen bg-slate-950 flex items-center justify-center text-emerald-400 font-bold">Carregando seu controle...</div>;
  }

  // Formulário de Autenticação / Login Inicial
  if (!user) {
    return (
      <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col justify-center px-6 max-w-md mx-auto shadow-2xl border-x border-slate-900">
        <div className="text-center mb-8">
          <div className="bg-emerald-500/10 p-4 rounded-2xl border border-emerald-500/20 inline-block mb-3">
            <Wallet className="w-10 h-10 text-emerald-400" />
          </div>
          <h2 className="text-2xl font-black tracking-tight">Finanças na Mão</h2>
          <p className="text-sm text-slate-400 mt-1">Seu controle financeiro pessoal de qualquer lugar</p>
        </div>
        <div className="bg-slate-900 border border-slate-800 p-6 rounded-3xl space-y-4 shadow-xl">
          <h3 className="text-lg font-bold text-slate-100">{isLogin ? 'Faça seu Login' : 'Criar Nova Conta'}</h3>
          <form onSubmit={handleAuth} className="space-y-4">
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">E-mail</label>
              <div className="relative"><Mail className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input type="email" required placeholder="seu@email.com" value={email} onChange={(e) => setEmail(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors" />
              </div>
            </div>
            <div>
              <label className="text-xs text-slate-400 font-medium block mb-1">Senha</label>
              <div className="relative"><Lock className="w-4 h-4 text-slate-500 absolute left-3 top-3" />
                <input type="password" required placeholder="••••••••" value={password} onChange={(e) => setPassword(e.target.value)} className="w-full bg-slate-950 border border-slate-800 rounded-xl py-2 pl-10 pr-4 text-sm text-slate-100 focus:outline-none focus:border-emerald-500 transition-colors" />
              </div>
            </div>
            {authError && <p className="text-xs text-rose-400 font-medium bg-rose-500/10 p-3 rounded-xl border border-rose-500/20">{authError}</p>}
            {authSuccess && <p className="text-xs text-emerald-400 font-medium bg-emerald-500/10 p-3 rounded-xl border border-emerald-500/20">{authSuccess}</p>}
            <button type="submit" className="w-full bg-emerald-500 hover:bg-emerald-600 text-slate-950 font-bold py-3 rounded-xl text-sm shadow-lg shadow-emerald-950/20 transition-colors">{isLogin ? 'Entrar' : 'Cadastrar Conta'}</button>
          </form>
          <div className="text-center pt-2">
            <button onClick={() => { setIsLogin(!isLogin); setAuthError(''); setAuthSuccess(''); }} className="text-xs text-emerald-400 font-semibold hover:underline">{isLogin ? 'Não tem conta? Cadastre-se' : 'Já tem uma conta? Entre aqui'}</button>
          </div>
        </div>
      </div>
    );
  }

  // Interface Principal com Componentização Estruturada
  return (
    <div className="min-h-screen bg-slate-950 text-slate-50 flex flex-col justify-between max-w-md mx-auto shadow-2xl border-x border-slate-900 pb-24 relative">
      <header className="px-6 pt-8 pb-4 flex justify-between items-center bg-slate-900/50 backdrop-blur border-b border-b-slate-900 sticky top-0 z-10">
        <div className="flex items-center gap-2">
          <div className="bg-emerald-500/20 p-2 rounded-xl border border-emerald-500/30"><Wallet className="w-6 h-6 text-emerald-400" /></div>
          <div><p className="text-xs text-slate-400">Painel de Controle</p><h1 className="text-sm font-bold text-slate-100 truncate max-w-[180px]">{user.email}</h1></div>
        </div>
        <button type="button" onClick={() => supabase.auth.signOut()} className="w-8 h-8 rounded-full bg-slate-900 border border-slate-800 flex items-center justify-center text-rose-400 hover:bg-slate-800 transition-colors"><LogOut className="w-4 h-4" /></button>
      </header>

      <main className="flex-1 px-6 pt-6 overflow-y-auto space-y-6">
        {/* 1. FILTRO DE MÊS */}
        <MonthFilter dataFiltro={dataFiltro} onChangeMes={alterarMes} />

        {/* 2. CARDS DO DASHBOARD */}
        <DashboardCards saldo={saldo} entraces={entraces} saidas={saidas} />

        {/* BOTÃO ADICIONAR LANÇAMENTO (Foco Mobile) */}
        <button 
          type="button"
          onClick={() => setIsModalOpen(true)} 
          className="w-full bg-slate-900 hover:bg-slate-850 border border-dashed border-slate-700 hover:border-emerald-500/50 rounded-2xl p-4 flex items-center justify-center gap-3 transition-all text-slate-300 hover:text-emerald-400 group"
        >
          <PlusCircle className="w-5 h-5 text-slate-400 group-hover:text-emerald-400 transition-colors" />
          <span className="text-sm font-semibold">Novo Lançamento Rápido</span>
        </button>

        {/* 3. LISTA HISTÓRICA E MODAL DE DELEÇÃO */}
        <TransactionList 
          transacoes={transacoes} 
          categorias={categorias} 
          dataFiltro={dataFiltro} 
          onRefresh={() => carregarDadosFinanceiros(user.id, dataFiltro)} 
        />
      </main>

      {/* 4. MODAL / FORMULÁRIO DE INSERÇÃO */}
      <TransactionForm 
        isOpen={isModalOpen} 
        onClose={() => setIsModalOpen(false)} 
        categorias={categorias} 
        user={user} 
        dataFiltro={dataFiltro} 
        onSuccess={() => carregarDadosFinanceiros(user.id, dataFiltro)} 
      />

      {/* NAVBAR INFERIOR (Mantido fixado e idêntico na base) */}
      <nav className="fixed bottom-0 left-0 right-0 max-w-md mx-auto bg-slate-900/90 backdrop-blur-md border-t border-slate-800/80 px-8 py-3 flex justify-around items-center z-20">
        <button type="button" className="flex flex-col items-center gap-1 text-emerald-400">
          <Wallet className="w-5 h-5" />
          <span className="text-[10px] font-medium">Início</span>
        </button>
        <button type="button" onClick={() => setIsModalOpen(true)} className="flex flex-col items-center gap-1 text-slate-400 hover:text-emerald-400 transition-colors">
          <PlusCircle className="w-5 h-5" />
          <span className="text-[10px] font-medium">Lançar</span>
        </button>
      </nav>
    </div>
  );
}