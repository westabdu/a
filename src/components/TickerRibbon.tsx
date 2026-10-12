import React from 'react';
import { TrendingUp, TrendingDown } from 'lucide-react';
import { RibbonItem } from '../types';

interface TickerRibbonProps {
  items: RibbonItem[];
  onSelectSymbol: (symbol: string) => void;
}

export const TickerRibbon: React.FC<TickerRibbonProps> = ({ items, onSelectSymbol }) => {
  if (!items || items.length === 0) {
    return (
      <div className="h-9 bg-[#0b0e14] border-b border-slate-800/60 flex items-center px-4 text-xs font-mono text-slate-500">
        Piyasa verileri yükleniyor...
      </div>
    );
  }

  return (
    <div className="h-9 bg-[#090d14] border-b border-slate-800/80 overflow-x-auto flex items-center px-3 gap-6 no-scrollbar text-xs font-mono select-none">
      <div className="flex items-center gap-6 whitespace-nowrap">
        {items.map((item) => {
          const isUp = item.change_pct >= 0;
          return (
            <button
              key={item.symbol}
              onClick={() => onSelectSymbol(item.symbol)}
              className="cursor-pointer flex items-center gap-2 hover:bg-slate-800/50 px-2 py-1 rounded transition-colors group text-left"
            >
              <span className="font-semibold text-slate-300 group-hover:text-white transition-colors">
                {item.name || item.symbol}
              </span>
              <span className="text-slate-100 tabular-nums">
                {item.price.toLocaleString('tr-TR', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <span
                className={`flex items-center text-[11px] tabular-nums font-semibold ${
                  isUp ? 'text-emerald-400' : 'text-rose-400'
                }`}
              >
                {isUp ? (
                  <TrendingUp className="w-3 h-3 mr-0.5 inline" />
                ) : (
                  <TrendingDown className="w-3 h-3 mr-0.5 inline" />
                )}
                {isUp ? '+' : ''}
                {item.change_pct.toFixed(2)}%
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
};
