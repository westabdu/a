import React, { useState, useEffect, useRef } from 'react';
import { Play, RotateCcw, TrendingUp, Shield, BarChart3, Clock, DollarSign } from 'lucide-react';
import { BacktestResult } from '../types';
import Plotly from 'plotly.js-dist-min';

interface BacktestLabViewProps {
  currentSymbol: string;
}

export const BacktestLabView: React.FC<BacktestLabViewProps> = ({ currentSymbol }) => {
  const [strategy, setStrategy] = useState<string>('ai_stacking');
  const [stopLoss, setStopLoss] = useState<number>(3.0);
  const [takeProfit, setTakeProfit] = useState<number>(6.0);
  const [trailingStop, setTrailingStop] = useState<boolean>(true);
  const [commission, setCommission] = useState<number>(0.1);
  const [slippage, setSlippage] = useState<number>(0.05);
  const [capital, setCapital] = useState<number>(100000);

  const [result, setResult] = useState<BacktestResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const equityChartRef = useRef<HTMLDivElement>(null);
  const drawdownChartRef = useRef<HTMLDivElement>(null);

  const runBacktest = () => {
    setLoading(true);
    fetch('/api/analysis/backtest', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        symbol: currentSymbol,
        strategy,
        stop_loss_pct: stopLoss,
        take_profit_pct: takeProfit,
        trailing_stop: trailingStop,
        commission_pct: commission,
        slippage_pct: slippage,
        initial_capital: capital,
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
    runBacktest();
  }, [currentSymbol]);

  // Render Charts when result arrives
  useEffect(() => {
    if (!result || !result.equity_curve || !equityChartRef.current) return;

    // Equity Curve Plot
    const equityTrace: Plotly.Data = {
      type: 'scatter',
      mode: 'lines',
      x: result.dates,
      y: result.equity_curve,
      name: 'Yapay Zeka Stratejisi',
      line: { color: '#00ff88', width: 2 },
    };

    const benchmarkTrace: Plotly.Data = {
      type: 'scatter',
      mode: 'lines',
      x: result.dates,
      y: result.benchmark_curve,
      name: 'Al & Tut (Benchmark)',
      line: { color: '#64748b', width: 1.5, dash: 'dot' },
    };

    const equityLayout: Partial<Plotly.Layout> = {
      title: {
        text: 'Kümülatif Portföy Büyüme Eğrisi (Strateji vs Benchmark)',
        font: { color: '#cbd5e1', size: 12, family: 'JetBrains Mono, monospace' },
        x: 0.02,
      },
      margin: { l: 55, r: 25, t: 35, b: 35 },
      paper_bgcolor: 'transparent',
      plot_bgcolor: 'transparent',
      showlegend: true,
      legend: { orientation: 'h', x: 0.02, y: 1.05, font: { color: '#94a3b8', size: 10 } },
      xaxis: {
        type: 'date',
        gridcolor: 'rgba(255, 255, 255, 0.05)',
        tickfont: { color: '#64748b', size: 10 },
      },
      yaxis: {
        gridcolor: 'rgba(255, 255, 255, 0.05)',
        tickfont: { color: '#64748b', size: 10 },
      },
    };

    Plotly.newPlot(equityChartRef.current, [equityTrace, benchmarkTrace], equityLayout, {
      responsive: true,
      displayModeBar: false,
    });

    // Drawdown (Underwater) Plot
    if (drawdownChartRef.current && result.drawdown_curve) {
      const ddTrace: Plotly.Data = {
        type: 'scatter',
        mode: 'lines',
        x: result.dates,
        y: result.drawdown_curve,
        name: 'Drawdown %',
        line: { color: '#ff3366', width: 1.5 },
        fill: 'tozeroy',
        fillcolor: 'rgba(255, 51, 102, 0.12)',
      };

      const ddLayout: Partial<Plotly.Layout> = {
        title: {
          text: 'Drawdown (Su Altı / Değer Kaybı) Grafiği (%)',
          font: { color: '#cbd5e1', size: 12, family: 'JetBrains Mono, monospace' },
          x: 0.02,
        },
        margin: { l: 45, r: 25, t: 35, b: 30 },
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        xaxis: {
          type: 'date',
          gridcolor: 'rgba(255, 255, 255, 0.05)',
          tickfont: { color: '#64748b', size: 10 },
        },
        yaxis: {
          gridcolor: 'rgba(255, 255, 255, 0.05)',
          tickfont: { color: '#64748b', size: 10 },
        },
      };

      Plotly.newPlot(drawdownChartRef.current, [ddTrace], ddLayout, {
        responsive: true,
        displayModeBar: false,
      });
    }
  }, [result]);

  return (
    <div className="space-y-6">
      {/* Parameters Control Panel */}
      <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-3">
          <div>
            <h1 className="text-lg font-bold text-white font-display">
              Walk-Forward Strateji Backtest Laboratuvarı
            </h1>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              Varlık: <span className="text-[#00e5ff] font-semibold">{currentSymbol}</span> · Komisyon ve Slippage Dahil Gerçekçi Simülasyon
            </p>
          </div>

          <button
            onClick={runBacktest}
            disabled={loading}
            className="cursor-pointer flex items-center gap-2 px-4 py-2 text-xs font-semibold rounded-lg bg-gradient-to-r from-emerald-500 to-[#00ff88] text-black hover:opacity-95 transition-opacity font-mono shadow-[0_0_15px_rgba(0,255,136,0.3)]"
          >
            <Play className={`w-3.5 h-3.5 fill-black ${loading ? 'animate-spin' : ''}`} />
            {loading ? 'Simülasyon Çalışıyor...' : 'Backtesti Çalıştır'}
          </button>
        </div>

        {/* Inputs Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 text-xs font-mono">
          <div>
            <label className="text-slate-400 block mb-1">Strateji Modeli</label>
            <select
              value={strategy}
              onChange={(e) => setStrategy(e.target.value)}
              className="w-full glass-input px-2.5 py-1.5 rounded-lg text-xs"
            >
              <option value="ai_stacking" className="bg-slate-900">AI Stacking Ensemble</option>
              <option value="rsi_reversal" className="bg-slate-900">RSI Breakout</option>
              <option value="ema_cross" className="bg-slate-900">EMA Trend Cross</option>
            </select>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Stop-Loss (%)</label>
            <input
              type="number"
              step="0.5"
              value={stopLoss}
              onChange={(e) => setStopLoss(parseFloat(e.target.value) || 0)}
              className="w-full glass-input px-2.5 py-1.5 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Take-Profit (%)</label>
            <input
              type="number"
              step="0.5"
              value={takeProfit}
              onChange={(e) => setTakeProfit(parseFloat(e.target.value) || 0)}
              className="w-full glass-input px-2.5 py-1.5 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Komisyon (%)</label>
            <input
              type="number"
              step="0.05"
              value={commission}
              onChange={(e) => setCommission(parseFloat(e.target.value) || 0)}
              className="w-full glass-input px-2.5 py-1.5 rounded-lg text-xs"
            />
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Slippage (%)</label>
            <input
              type="number"
              step="0.01"
              value={slippage}
              onChange={(e) => setSlippage(parseFloat(e.target.value) || 0)}
              className="w-full glass-input px-2.5 py-1.5 rounded-lg text-xs"
            />
          </div>

          <div className="flex flex-col justify-end">
            <label className="flex items-center gap-2 cursor-pointer pb-2 text-slate-300">
              <input
                type="checkbox"
                checked={trailingStop}
                onChange={(e) => setTrailingStop(e.target.checked)}
                className="rounded accent-[#00e5ff]"
              />
              Trailing Stop
            </label>
          </div>
        </div>
      </div>

      {/* Performance Scorecard */}
      {result && (
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <div className="glass-panel p-3.5 rounded-lg border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 block">Strateji Getirisi</span>
            <span
              className={`text-lg font-bold font-mono tabular-nums block mt-1 ${
                result.total_return_pct >= 0 ? 'text-[#00ff88]' : 'text-rose-400'
              }`}
            >
              %{result.total_return_pct}
            </span>
          </div>

          <div className="glass-panel p-3.5 rounded-lg border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 block">Al-Tut (B&H)</span>
            <span className="text-lg font-bold font-mono text-slate-300 tabular-nums block mt-1">
              %{result.benchmark_return_pct}
            </span>
          </div>

          <div className="glass-panel p-3.5 rounded-lg border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 block">Sharpe Oranı</span>
            <span className="text-lg font-bold font-mono text-[#00e5ff] tabular-nums block mt-1">
              {result.sharpe_ratio}
            </span>
          </div>

          <div className="glass-panel p-3.5 rounded-lg border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 block">Sortino Oranı</span>
            <span className="text-lg font-bold font-mono text-[#00e5ff] tabular-nums block mt-1">
              {result.sortino_ratio}
            </span>
          </div>

          <div className="glass-panel p-3.5 rounded-lg border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 block">Max Drawdown</span>
            <span className="text-lg font-bold font-mono text-rose-400 tabular-nums block mt-1">
              %{result.max_drawdown_pct}
            </span>
          </div>

          <div className="glass-panel p-3.5 rounded-lg border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 block">Kazanma Oranı</span>
            <span className="text-lg font-bold font-mono text-emerald-400 tabular-nums block mt-1">
              %{result.win_rate_pct}
            </span>
          </div>

          <div className="glass-panel p-3.5 rounded-lg border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 block">Kar Faktörü</span>
            <span className="text-lg font-bold font-mono text-amber-400 tabular-nums block mt-1">
              {result.profit_factor}
            </span>
          </div>

          <div className="glass-panel p-3.5 rounded-lg border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 block">Toplam İşlem</span>
            <span className="text-lg font-bold font-mono text-white tabular-nums block mt-1">
              {result.total_trades}
            </span>
          </div>
        </div>
      )}

      {/* Equity & Drawdown Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <div className="lg:col-span-2 glass-panel p-3 rounded-xl border border-slate-800 h-[360px]">
          <div ref={equityChartRef} className="w-full h-full" />
        </div>
        <div className="glass-panel p-3 rounded-xl border border-slate-800 h-[360px]">
          <div ref={drawdownChartRef} className="w-full h-full" />
        </div>
      </div>

      {/* Detailed Trade History Log */}
      {result && result.trades && result.trades.length > 0 && (
        <div className="glass-panel rounded-xl border border-slate-800 overflow-hidden">
          <div className="px-5 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-xs font-bold text-white font-mono">Gerçekleşen İşlem Kayıtları (Trade Log)</h2>
            <span className="text-[11px] font-mono text-slate-400">Son 25 İşlem</span>
          </div>

          <div className="overflow-x-auto max-h-64 overflow-y-auto">
            <table className="w-full text-xs text-left font-mono">
              <thead className="bg-slate-950/80 text-slate-400 text-[11px] sticky top-0">
                <tr>
                  <th className="px-4 py-2.5">#</th>
                  <th className="px-4 py-2.5">Giriş Tarihi</th>
                  <th className="px-4 py-2.5">Çıkış Tarihi</th>
                  <th className="px-4 py-2.5 text-right">Giriş Fiyatı</th>
                  <th className="px-4 py-2.5 text-right">Çıkış Fiyatı</th>
                  <th className="px-4 py-2.5 text-right">Net PnL (₺)</th>
                  <th className="px-4 py-2.5 text-right">PnL (%)</th>
                  <th className="px-4 py-2.5">Kapanış Nedeni</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {result.trades.map((t) => (
                  <tr key={t.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-2 text-slate-500">{t.id}</td>
                    <td className="px-4 py-2 text-slate-300">{t.entry_date}</td>
                    <td className="px-4 py-2 text-slate-300">{t.exit_date}</td>
                    <td className="px-4 py-2 text-right tabular-nums">₺{t.entry_price.toFixed(2)}</td>
                    <td className="px-4 py-2 text-right tabular-nums">₺{t.exit_price.toFixed(2)}</td>
                    <td
                      className={`px-4 py-2 text-right font-bold tabular-nums ${
                        t.pnl >= 0 ? 'text-[#00ff88]' : 'text-rose-400'
                      }`}
                    >
                      {t.pnl >= 0 ? '+' : ''}₺{t.pnl.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                    </td>
                    <td
                      className={`px-4 py-2 text-right font-semibold tabular-nums ${
                        t.pnl_pct >= 0 ? 'text-[#00ff88]' : 'text-rose-400'
                      }`}
                    >
                      %{t.pnl_pct.toFixed(2)}
                    </td>
                    <td className="px-4 py-2">
                      <span
                        className={`text-[10px] px-2 py-0.5 rounded font-mono ${
                          t.reason === 'Take-Profit'
                            ? 'bg-emerald-500/20 text-emerald-400'
                            : t.reason === 'Stop-Loss'
                            ? 'bg-rose-500/20 text-rose-400'
                            : 'bg-slate-800 text-slate-300'
                        }`}
                      >
                        {t.reason}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};
