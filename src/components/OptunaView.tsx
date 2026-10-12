import React, { useState, useEffect, useRef } from 'react';
import { Target, Zap, CheckCircle2, TrendingUp, BarChart2, ArrowRight } from 'lucide-react';
import { OptunaResult } from '../types';
import Plotly from 'plotly.js-dist-min';

interface OptunaViewProps {
  currentSymbol: string;
  onApplyBestParamsToBacktest: (params: any) => void;
}

export const OptunaView: React.FC<OptunaViewProps> = ({
  currentSymbol,
  onApplyBestParamsToBacktest,
}) => {
  const [trialsCount, setTrialsCount] = useState<number>(35);
  const [result, setResult] = useState<OptunaResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [applied, setApplied] = useState<boolean>(false);

  const historyChartRef = useRef<HTMLDivElement>(null);

  const runOptimization = () => {
    setLoading(true);
    setApplied(false);
    fetch('/api/analysis/optuna-optimize', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        symbol: currentSymbol,
        n_trials: trialsCount,
      }),
    })
      .then((res) => res.json())
      .then((data) => {
        setResult(data);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    runOptimization();
  }, [currentSymbol]);

  useEffect(() => {
    if (!result || !historyChartRef.current) return;

    const trials = result.trial_history.map((t) => t.trial);
    const sharpes = result.trial_history.map((t) => t.sharpe);

    const trace: Plotly.Data = {
      type: 'scatter',
      mode: 'lines+markers',
      x: trials,
      y: sharpes,
      name: 'Trial Sharpe Oranı',
      marker: {
        color: '#00e5ff',
        size: 7,
        line: { color: '#ffffff', width: 1 },
      },
      line: { color: 'rgba(0, 229, 255, 0.4)', width: 1.5 },
    };

    const layout: Partial<Plotly.Layout> = {
      title: {
        text: 'Optuna TPE Deneme Geçmişi (Objective: Maximize Sharpe)',
        font: { color: '#cbd5e1', size: 12, family: 'JetBrains Mono, monospace' },
        x: 0.02,
      },
      margin: { l: 45, r: 25, t: 35, b: 35 },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      xaxis: {
        title: { text: 'Trial No', font: { color: '#64748b', size: 10 } },
        gridcolor: 'rgba(255, 255, 255, 0.05)',
        tickfont: { color: '#64748b', size: 10 },
      },
      yaxis: {
        title: { text: 'Sharpe Oranı', font: { color: '#64748b', size: 10 } },
        gridcolor: 'rgba(255, 255, 255, 0.05)',
        tickfont: { color: '#64748b', size: 10 },
      },
    };

    Plotly.newPlot(historyChartRef.current, [trace], layout, { responsive: true, displayModeBar: false });
  }, [result]);

  const handleApply = () => {
    if (result?.best_params) {
      onApplyBestParamsToBacktest(result.best_params);
      setApplied(true);
      setTimeout(() => setApplied(false), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-5 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-[#00e5ff]" />
            <h1 className="text-lg font-bold text-white font-display">
              Optuna Bayesian Parametre Optimizasyonu (TPESampler)
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Seçili Varlık: <span className="text-[#00e5ff] font-semibold">{currentSymbol}</span> · Sharpe Oranını
            Maksimize Eden Bayesyen Hiperparametre Keşfi
          </p>
        </div>

        <div className="flex items-center gap-3 w-full sm:w-auto">
          <select
            value={trialsCount}
            onChange={(e) => setTrialsCount(parseInt(e.target.value, 10))}
            className="glass-input px-3 py-1.5 rounded-lg text-xs font-mono"
          >
            <option value="25" className="bg-slate-900">25 Deneme (Hızlı)</option>
            <option value="40" className="bg-slate-900">40 Deneme (Dengeli)</option>
            <option value="60" className="bg-slate-900">60 Deneme (Derin)</option>
          </select>

          <button
            onClick={runOptimization}
            disabled={loading}
            className="cursor-pointer flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-[#00e5ff] to-[#0077ff] text-black hover:opacity-95 transition-opacity font-mono shadow-[0_0_15px_rgba(0,229,255,0.3)] shrink-0"
          >
            <Zap className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Optimizasyon Sürüyor...' : 'Optimizasyonu Başlat'}
          </button>
        </div>
      </div>

      {loading ? (
        <div className="h-64 glass-panel rounded-xl flex items-center justify-center text-xs font-mono text-slate-400">
          Optuna TPE Sampler parametre uzayını tarıyor & en yüksek Sharpe noktasını modelliyor...
        </div>
      ) : result ? (
        <>
          {/* Best Parameters Trophy Card */}
          <div className="glass-panel p-5 rounded-xl border border-slate-800 bg-gradient-to-br from-slate-900/90 to-[#00e5ff]/5 space-y-4">
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-slate-800/80 pb-3">
              <div>
                <span className="text-xs font-mono text-[#00e5ff] font-semibold">
                  Bayesyen Keşif Sonucu: En Karlı Parametre Seti
                </span>
                <div className="flex items-baseline gap-4 mt-1">
                  <span className="text-2xl font-bold font-mono text-white">
                    Sharpe: <span className="text-[#00ff88]">{result.best_sharpe}</span>
                  </span>
                  <span className="text-sm font-mono text-slate-300">
                    Getiri: <span className="text-emerald-400 font-bold">%{result.best_return_pct}</span>
                  </span>
                </div>
              </div>

              <button
                onClick={handleApply}
                className="cursor-pointer flex items-center gap-2 px-4 py-2 text-xs font-semibold font-mono rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 hover:bg-emerald-500/30 transition-all"
              >
                {applied ? (
                  <>
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                    Backtest'e Aktarıldı!
                  </>
                ) : (
                  <>
                    <ArrowRight className="w-3.5 h-3.5" />
                    En İyi Parametreleri Backtest'e Aktar
                  </>
                )}
              </button>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-mono">
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Stop-Loss Eşiği</span>
                <span className="text-base font-bold text-rose-400 mt-1 block">
                  %{result.best_params.stop_loss_pct}
                </span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Take-Profit Eşiği</span>
                <span className="text-base font-bold text-emerald-400 mt-1 block">
                  %{result.best_params.take_profit_pct}
                </span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[11px]">RSI Alış Seviyesi</span>
                <span className="text-base font-bold text-[#00e5ff] mt-1 block">
                  {result.best_params.rsi_buy_level}
                </span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[11px]">RSI Satış Seviyesi</span>
                <span className="text-base font-bold text-[#00e5ff] mt-1 block">
                  {result.best_params.rsi_sell_level}
                </span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Hızlı EMA (Gün)</span>
                <span className="text-base font-bold text-amber-400 mt-1 block">
                  {result.best_params.fast_ema_period}
                </span>
              </div>
              <div className="bg-slate-900/80 p-3 rounded-lg border border-slate-800">
                <span className="text-slate-400 block text-[11px]">Yavaş EMA (Gün)</span>
                <span className="text-base font-bold text-amber-400 mt-1 block">
                  {result.best_params.slow_ema_period}
                </span>
              </div>
            </div>
          </div>

          {/* Trials History Chart & Importance Split */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 glass-panel p-3 rounded-xl border border-slate-800 h-[340px]">
              <div ref={historyChartRef} className="w-full h-full" />
            </div>

            <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-4">
              <h2 className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                <BarChart2 className="w-4 h-4 text-[#00e5ff]" />
                Parametre Duyarlılık & Önem Sıralaması
              </h2>
              <p className="text-[11px] text-slate-400 font-mono">
                Sharpe oranını en çok etkileyen hiperparametrelerin etki ağırlığı:
              </p>

              <div className="space-y-3 pt-1">
                {result.param_importance.map((p) => (
                  <div key={p.param} className="space-y-1">
                    <div className="flex items-center justify-between text-xs font-mono">
                      <span className="text-slate-300">{p.param}</span>
                      <span className="text-[#00e5ff] font-semibold">%{p.importance}</span>
                    </div>
                    <div className="w-full bg-slate-900 h-2 rounded-full overflow-hidden border border-slate-800">
                      <div
                        className="h-full bg-gradient-to-r from-emerald-500 to-[#00e5ff] rounded-full"
                        style={{ width: `${p.importance * 2.5}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </>
      ) : null}
    </div>
  );
};
