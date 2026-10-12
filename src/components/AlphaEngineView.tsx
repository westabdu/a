import React, { useState } from 'react';
import { Activity, Search, RefreshCw, Cpu, Layers } from 'lucide-react';
import { useAlphaIndicators } from '../hooks/useQuantQueries';

interface AlphaEngineViewProps {
  currentSymbol: string;
}

export const AlphaEngineView: React.FC<AlphaEngineViewProps> = ({ currentSymbol }) => {
  const { data, isLoading: loading, refetch: fetchFeatures } = useAlphaIndicators(currentSymbol);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [activeCategory, setActiveCategory] = useState<string>('Tümü');

  const categories: Record<string, string[]> = {
    Momentum: [
      'rsi_14',
      'rsi_7',
      'rsi_21',
      'rsi_lag1',
      'rsi_lag3',
      'rsi_delta',
      'macd_line',
      'macd_signal',
      'macd_hist',
      'macd_hist_slope',
      'stoch_k',
      'stoch_d',
      'stoch_diff',
      'roc_3d',
      'roc_5d',
      'roc_10d',
      'roc_20d',
      'williams_r',
    ],
    'Volatilite & Bantlar': [
      'bollinger_upper',
      'bollinger_lower',
      'bollinger_pct_b',
      'bollinger_bandwidth',
      'bollinger_squeeze',
      'atr_14',
      'atr_pct',
      'realized_vol_5d',
      'realized_vol_10d',
      'realized_vol_20d',
    ],
    'Trend & Rejim': [
      'choppiness_index',
      'adx_14',
      'plus_di',
      'minus_di',
      'ema_9',
      'ema_21',
      'ema_50',
      'ema_200',
      'price_to_ema9',
      'price_to_ema21',
      'price_to_ema50',
      'price_to_ema200',
      'ema9_ema21_cross',
      'golden_cross',
    ],
    'Hacim Analizi': [
      'volume_ratio',
      'volume_trend_5d',
      'obv_value',
      'mfi_14',
    ],
    'Gecikmeli Getiriler': [
      'ret_1d',
      'ret_3d',
      'ret_5d',
      'ret_10d',
      'ret_20d',
      'ret_lag1',
      'ret_lag2',
      'ret_lag3',
    ],
    'Multi-Timeframe Teyit': [
      'weekly_rsi_smoothed',
      'weekly_trend_confirm',
      'regime_sideways_flag',
    ],
  };

  const getCategoryOf = (key: string): string => {
    for (const [cat, keys] of Object.entries(categories)) {
      if (keys.includes(key)) return cat;
    }
    return 'Diğer';
  };

  const features = data?.features || {};
  const featureEntries = Object.entries(features);

  const filteredEntries = featureEntries.filter(([k]) => {
    const cat = getCategoryOf(k);
    const matchesCategory = activeCategory === 'Tümü' || cat === activeCategory;
    const matchesSearch = k.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Header Bar */}
      <div className="glass-panel p-5 rounded-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Cpu className="w-5 h-5 text-[#00e5ff]" />
            <h1 className="text-lg font-bold text-white font-display">
              60+ Alpha Özellikli Feature Engineering & İndikatör Motoru
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Seçili Varlık: <span className="text-[#00e5ff] font-semibold">{currentSymbol}</span> · Günlük & Çoklu Zaman
            Dilimi (Multi-Timeframe) Alpha Faktörleri
          </p>
        </div>

        <button
          onClick={() => fetchFeatures()}
          className="cursor-pointer flex items-center gap-2 px-3 py-1.5 text-xs font-mono text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#00e5ff]' : ''}`} />
          Özellikleri Yeniden Hesapla
        </button>
      </div>

      {/* Filter and Category Pills */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-1">
          {['Tümü', ...Object.keys(categories)].map((cat) => (
            <button
              key={cat}
              onClick={() => setActiveCategory(cat)}
              className={`cursor-pointer px-3 py-1 text-xs font-mono rounded-md whitespace-nowrap transition-colors ${
                activeCategory === cat
                  ? 'bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/30 font-semibold'
                  : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="relative w-full sm:w-60">
          <input
            type="text"
            placeholder="Özellik ara (rsi, chop, ema)..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full glass-input px-3.5 py-1.5 pl-8 text-xs font-mono rounded-lg"
          />
          <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
        </div>
      </div>

      {/* Features Table */}
      <div className="glass-panel rounded-xl border border-slate-800 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-xs text-left font-mono">
            <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 text-[11px]">
              <tr>
                <th className="px-5 py-3 w-1/4">Özellik Adı (Alpha Feature)</th>
                <th className="px-5 py-3 w-1/5">Kategori</th>
                <th className="px-5 py-3 text-right w-1/4">Hesaplanan Değer</th>
                <th className="px-5 py-3 text-slate-400">Rejim / Sinyal İpucu</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredEntries.map(([key, val]: [string, any]) => {
                const cat = getCategoryOf(key);
                let note = '---';
                let valColor = 'text-white';

                if (key === 'rsi_14') {
                  if (val > 70) {
                    note = 'Aşırı Alım Bölgesi';
                    valColor = 'text-rose-400';
                  } else if (val < 30) {
                    note = 'Aşırı Satım Bölgesi (Tepki İhtimali)';
                    valColor = 'text-emerald-400';
                  } else {
                    note = 'Nötr Momentum Bandı';
                  }
                } else if (key === 'choppiness_index') {
                  if (val > 61.8) {
                    note = 'TESTERE / YATAY PİYASA (CHOP) - İşlemden Kaçın!';
                    valColor = 'text-amber-400 font-bold';
                  } else if (val < 38.2) {
                    note = 'Güçlü Trend Rejimi';
                    valColor = 'text-emerald-400 font-bold';
                  }
                } else if (key === 'adx_14') {
                  if (val > 25) {
                    note = 'Trend Gücü Yüksek';
                    valColor = 'text-emerald-400';
                  } else {
                    note = 'Zayıf Trend / Testere Riski';
                    valColor = 'text-amber-400';
                  }
                } else if (key === 'bollinger_squeeze') {
                  note = val === 1 ? 'Bant Sıkışması (Patlama Beklentisi)' : 'Normal Bant Genişliği';
                  if (val === 1) valColor = 'text-[#00e5ff] font-bold';
                } else if (key === 'golden_cross') {
                  note = val === 1 ? 'EMA 50 > EMA 200 (Boğa Rejimi)' : 'EMA 50 < EMA 200 (Ayı Rejimi)';
                  valColor = val === 1 ? 'text-emerald-400' : 'text-rose-400';
                } else if (key.startsWith('ret_')) {
                  valColor = val >= 0 ? 'text-emerald-400' : 'text-rose-400';
                  note = `${val >= 0 ? '+' : ''}${val}% Getiri`;
                }

                return (
                  <tr key={key} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3 font-semibold text-slate-200">{key}</td>
                    <td className="px-5 py-3 text-slate-400">{cat}</td>
                    <td className={`px-5 py-3 text-right font-bold tabular-nums ${valColor}`}>
                      {typeof val === 'number' ? val.toLocaleString('tr-TR', { maximumFractionDigits: 4 }) : String(val)}
                    </td>
                    <td className="px-5 py-3 text-slate-400 text-[11px]">{note}</td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};
