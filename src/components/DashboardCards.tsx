'use client';

import React from 'react';
import { TrendingUp, ArrowUpCircle, ArrowDownCircle } from 'lucide-react';

interface DashboardCardsProps {
  saldo: number;
  entraces: number;
  saidas: number;
}

export default function DashboardCards({ saldo, entraces, saidas }: DashboardCardsProps) {
  return (
    <div className="space-y-4">
      {/* CARD DO SALDO */}
      <div className="bg-gradient-to-br from-emerald-600 to-teal-800 rounded-3xl p-6 shadow-lg shadow-emerald-950/40 relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-white/5 rounded-full blur-2xl transform translate-x-8 -translate-y-8"></div>
        <p className="text-emerald-100/80 text-xs font-medium tracking-wide uppercase">Balanço do Mês</p>
        <p className="text-3xl font-black tracking-tight mt-1 text-white">
          R$ {saldo.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
        </p>
        <div className="mt-6 flex justify-between items-center text-xs text-emerald-100/90 pt-4 border-t border-white/10">
          <div className="flex items-center gap-1">
            <TrendingUp className="w-4 h-4" />
            <span>{saldo >= 0 ? 'Finanças no azul' : 'Atenção ao orçamento'}</span>
          </div>
          <span className="bg-white/10 px-2 py-0.5 rounded-full text-[10px] uppercase font-bold tracking-wider">Filtrado</span>
        </div>
      </div>

      {/* ENTRADAS E SAÍDAS */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Entradas</span>
            <ArrowUpCircle className="w-5 h-5 text-emerald-400" />
          </div>
          <p className="text-lg font-bold text-emerald-400 mt-2 truncate">
            + R$ {entraces.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>

        <div className="bg-slate-900 border border-slate-800/80 rounded-2xl p-4">
          <div className="flex items-center justify-between">
            <span className="text-xs text-slate-400 font-medium">Saídas</span>
            <ArrowDownCircle className="w-5 h-5 text-rose-400" />
          </div>
          <p className="text-lg font-bold text-rose-400 mt-2 truncate">
            - R$ {saidas.toLocaleString('pt-BR', { minimumFractionDigits: 2 })}
          </p>
        </div>
      </div>
    </div>
  );
}