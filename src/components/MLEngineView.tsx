import React, { useState, useEffect } from 'react';
import {
  Brain,
  ShieldAlert,
  ShieldCheck,
  TrendingUp,
  RefreshCw,
  BarChart2,
  Sliders,
  CheckCircle2,
} from 'lucide-react';
import { MLResult } from '../types';
import { useMLStacking } from '../hooks/useQuantQueries';

interface MLEngineViewProps {
  currentSymbol: string;
  onOpenOrderModal: (symbol: string, currentPrice?: number) => void;
}

export const MLEngineView: React.FC<MLEngineViewProps> = ({ currentSymbol, onOpenOrderModal }) => {
  const { data: mlData, isLoading: loading, refetch: fetchML } = useMLStacking(currentSymbol);

  const getSignalBadgeColor = (sig: string) => {
    switch (sig) {
      case 'GÜÇLÜ AL':
        return 'bg-emerald-500/20 text-[#00ff88] border-emerald-500/40 shadow-[0_0_15px_rgba(0,255,136,0.25)]';
      case 'AL':
        return 'bg-emerald-500/15 text-emerald-400 border-emerald-500/30';
      case 'NÖTR':
        return 'bg-slate-700/30 text-slate-300 border-slate-600';
      case 'SAT':
        return 'bg-rose-500/15 text-rose-400 border-rose-500/30';
      case 'GÜÇLÜ SAT':
        return 'bg-rose-500/25 text-rose-300 border-rose-500/50 shadow-[0_0_15px_rgba(255,51,102,0.25)]';
      default:
        return 'bg-slate-800 text-slate-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-5 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Brain className="w-5 h-5 text-[#00e5ff]" />
            <h1 className="text-lg font-bold text-white font-display">
              Stacking Ensemble Yapay Zeka Motoru
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Seçili Varlık: <span className="text-[#00e5ff] font-semibold">{currentSymbol}</span> · Seviye-1 Temel Öğreniciler (XGBoost/LightGBM/RF) + Seviye-2 Lojistik Meta-Learner
          </p>
        </div>

        <button
          onClick={() => fetchML()}
          className="cursor-pointer flex items-center gap-2 px-3 py-1.5 text-xs font-mono text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#00e5ff]' : ''}`} />
          Modelleri Yeniden Eğit
        </button>
      </div>

      {loading ? (
        <div className="h-64 glass-panel rounded-xl flex items-center justify-center text-xs font-mono text-slate-400">
          Stacking Ensemble modelleri eğitiliyor & olasılıklar kalibre ediliyor...
        </div>
      ) : mlData ? (
        <>
          {/* Sideways / Chop Protection Alert */}
          {mlData.is_sideways_regime && (
            <div className="p-4 rounded-xl bg-amber-500/10 border border-amber-500/30 flex items-start gap-3">
              <ShieldAlert className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
              <div>
                <h2 className="text-sm font-bold text-amber-300 font-mono">
                  DİKKAT: TESTERE (SIDEWAYS/CHOP) PİYASASI REJİMİ TESPİT EDİLDİ
                </h2>
                <p className="text-xs text-slate-300 mt-1">
                  Choppiness Index ({mlData.chop_index}) &gt; 61.8 veya ADX ({mlData.adx_14}) &lt; 20 eşiğinde.
                  Piyasada net bir trend bulunmadığından yanlış kırılımları (fake-out) önlemek için alım/satım güven
                  eşiği dinamik olarak <span className="font-semibold text-white">%65+</span> seviyesine yükseltilmiştir.
                </p>
              </div>
            </div>
          )}

          {/* Primary Signal & Probability Dashboard */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Signal Card */}
            <div className="glass-panel p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
              <span className="text-xs font-mono text-slate-400">Ensemble Karar Sinyali</span>
              <div className="my-4">
                <span
                  className={`inline-block px-4 py-2 rounded-lg text-lg font-bold font-mono border ${getSignalBadgeColor(
                    mlData.signal
                  )}`}
                >
                  {mlData.signal}
                </span>
              </div>
              <div className="text-xs font-mono text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-3">
                <span>Model Güven Seviyesi:</span>
                <span className="font-bold text-white tabular-nums">%{mlData.confidence}</span>
              </div>
            </div>

            {/* Calibrated Bull Probability */}
            <div className="glass-panel p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div className="flex items-center justify-between">
                <span className="text-xs font-mono text-slate-400">Kalibre Boğa Olasılığı</span>
                <span className="text-xs font-mono text-emerald-400">Sigmoid / Platt</span>
              </div>
              <div className="my-3">
                <div className="flex items-baseline gap-2">
                  <span className="text-3xl font-bold font-mono text-[#00ff88] tabular-nums">
                    %{mlData.bull_probability}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">Boğa Eğilimi</span>
                </div>
                {/* Progress Bar */}
                <div className="w-full bg-slate-800 h-2.5 rounded-full overflow-hidden mt-3 border border-slate-700/50">
                  <div
                    className="h-full bg-gradient-to-r from-rose-500 via-amber-400 to-[#00ff88] transition-all duration-500"
                    style={{ width: `${mlData.bull_probability}%` }}
                  />
                </div>
              </div>
              <div className="text-[11px] font-mono text-slate-400 flex items-center justify-between border-t border-slate-800/80 pt-2">
                <span>Ayı Olasılığı: %{(100 - mlData.bull_probability).toFixed(1)}</span>
                <span className="text-[#00e5ff]">5-Günlük Ufuk</span>
              </div>
            </div>

            {/* Quick Action / Execution */}
            <div className="glass-panel p-5 rounded-xl border border-slate-800 flex flex-col justify-between">
              <div>
                <span className="text-xs font-mono text-slate-400">Yapay Zeka Emri Aç</span>
                <p className="text-xs text-slate-300 mt-2 font-mono">
                  Sinyal doğrultusunda Sanal İşlemler (Paper Trading) defterine tek tıkla pozisyon girin.
                </p>
              </div>
              <button
                onClick={() => onOpenOrderModal(currentSymbol)}
                className="cursor-pointer w-full mt-4 py-2.5 px-4 text-xs font-semibold rounded-lg bg-gradient-to-r from-[#00e5ff] to-[#0077ff] text-black hover:opacity-90 transition-opacity font-mono shadow-[0_0_12px_rgba(0,229,255,0.3)]"
              >
                Sanal Alım-Satım Emri Gir
              </button>
            </div>
          </div>

          {/* Level-1 Base Learners Votes */}
          <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <Sliders className="w-4 h-4 text-[#00e5ff]" />
                Seviye-1 Temel Öğreniciler (Base Learners) & Meta-Learner Tahminleri
              </h2>
              <span className="text-xs font-mono text-slate-400">TimeSeriesSplit CV (3-Fold)</span>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {Object.entries(mlData.base_learners).map(([model, score]) => (
                <div key={model} className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                  <span className="text-[11px] font-mono text-slate-400 block truncate">{model}</span>
                  <span
                    className={`text-lg font-bold font-mono tabular-nums block mt-1 ${
                      score >= 55 ? 'text-emerald-400' : score <= 45 ? 'text-rose-400' : 'text-slate-300'
                    }`}
                  >
                    %{score}
                  </span>
                  <span className="text-[10px] text-slate-500 font-mono">
                    {score >= 50 ? 'Boğa Eğilimi' : 'Ayı Eğilimi'}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* Top 10 Feature Importance Bar Chart */}
          <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-bold text-white font-mono flex items-center gap-2">
                <BarChart2 className="w-4 h-4 text-[#00ff88]" />
                En Önemli 10 Özellik (Top 10 Feature Importance)
              </h2>
              <span className="text-xs font-mono text-slate-400">MDI / GBDT Kazanç Katkısı</span>
            </div>

            <div className="space-y-2.5">
              {mlData.top_features.map((item, idx) => (
                <div key={item.feature} className="space-y-1">
                  <div className="flex items-center justify-between text-xs font-mono">
                    <span className="text-slate-300">
                      {idx + 1}. {item.feature}
                    </span>
                    <span className="text-[#00e5ff] font-semibold tabular-nums">%{item.importance}</span>
                  </div>
                  <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                    <div
                      className="h-full bg-gradient-to-r from-[#0077ff] to-[#00e5ff] rounded-full"
                      style={{ width: `${Math.min(100, item.importance * 4.5)}%` }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
