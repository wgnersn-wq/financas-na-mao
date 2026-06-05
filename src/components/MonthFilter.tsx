'use client';

import React from 'react';
import { ChevronLeft, ChevronRight } from 'lucide-react';

interface MonthFilterProps {
  dataFiltro: Date;
  onChangeMes: (direcao: 'anterior' | 'proximo') => void;
}

export default function MonthFilter({ dataFiltro, onChangeMes }: MonthFilterProps) {
  function obterNomeMesAno(date: Date) {
    return date.toLocaleDateString('pt-BR', { month: 'long', year: 'numeric' })
               .replace(/^\w/, (c) => c.toUpperCase());
  }

  return (
    <div className="flex items-center justify-between bg-slate-900 border border-slate-800 rounded-2xl p-2 shadow-inner">
      <button 
        type="button"
        onClick={() => onChangeMes('anterior')}
        className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-emerald-400 transition-colors"
      >
        <ChevronLeft className="w-5 h-5" />
      </button>
      
      <span className="text-xs font-bold tracking-wide text-slate-200">
        {obterNomeMesAno(dataFiltro)}
      </span>

      <button 
        type="button"
        onClick={() => onChangeMes('proximo')}
        className="p-2 hover:bg-slate-800 rounded-xl text-slate-400 hover:text-emerald-400 transition-colors"
      >
        <ChevronRight className="w-5 h-5" />
      </button>
    </div>
  );
}