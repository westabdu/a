import React, { useState, useEffect, useRef } from 'react';
import { PieChart, Sliders, RefreshCw, Layers, ShieldCheck, Activity } from 'lucide-react';
import { RiskParityResult } from '../types';
import Plotly from 'plotly.js-dist-min';

export const RiskParityView: React.FC = () => {
  const availableAssets = [
    { s: 'THYAO.IS', label: 'THYAO (BIST)' },
    { s: 'EREGL.IS', label: 'EREGL (BIST)' },
    { s: 'ASELS.IS', label: 'ASELS (BIST)' },
    { s: 'GC=F', label: 'ALTIN (Ons/Spot)' },
    { s: 'SI=F', label: 'GÜMÜŞ (Ons/Spot)' },
    { s: 'BTC-USD', label: 'Bitcoin (Kripto)' },
    { s: 'AAPL', label: 'Apple (ABD)' },
    { s: 'NVDA', label: 'NVIDIA (ABD)' },
    { s: 'BZ=F', label: 'Brent Petrol' },
  ];

  const [selectedSymbols, setSelectedSymbols] = useState<string[]>([
    'THYAO.IS',
    'EREGL.IS',
    'GC=F',
    'BTC-USD',
  ]);
  const [data, setData] = useState<RiskParityResult | null>(null);
  const [loading, setLoading] = useState<boolean>(false);

  const heatmapRef = useRef<HTMLDivElement>(null);
  const pieChartRef = useRef<HTMLDivElement>(null);

  const calculateERC = () => {
    if (selectedSymbols.length < 2) return;
    setLoading(true);
    fetch('/api/analysis/risk-parity', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ symbols: selectedSymbols }),
    })
      .then((res) => res.json())
      .then((resData) => {
        setData(resData);
        setLoading(false);
      })
      .catch((err) => {
        console.error(err);
        setLoading(false);
      });
  };

  useEffect(() => {
    calculateERC();
  }, [selectedSymbols]);

  const toggleSymbol = (s: string) => {
    if (selectedSymbols.includes(s)) {
      if (selectedSymbols.length > 2) {
        setSelectedSymbols(selectedSymbols.filter((item) => item !== s));
      }
    } else {
      setSelectedSymbols([...selectedSymbols, s]);
    }
  };

  // Render Correlation Heatmap and Weight Pie Chart
  useEffect(() => {
    if (!data) return;

    // Correlation Heatmap
    if (heatmapRef.current && data.correlation) {
      const heatTrace: Plotly.Data = {
        type: 'heatmap',
        z: data.correlation.matrix,
        x: data.correlation.assets,
        y: data.correlation.assets,
        colorscale: [
          [0, '#00e5ff'],
          [0.5, '#1e293b'],
          [1, '#ff3366'],
        ],
        showscale: true,
        colorbar: {
          tickfont: { color: '#94a3b8', size: 9 },
          len: 0.8,
        },
      };

      const heatLayout: Partial<Plotly.Layout> = {
        title: {
          text: 'Varlıklar Arası Korelasyon Isı Haritası (Correlation Heatmap)',
          font: { color: '#cbd5e1', size: 12, family: 'JetBrains Mono, monospace' },
          x: 0.02,
        },
        margin: { l: 70, r: 25, t: 35, b: 65 },
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        xaxis: {
          tickfont: { color: '#94a3b8', size: 10, family: 'JetBrains Mono, monospace' },
        },
        yaxis: {
          tickfont: { color: '#94a3b8', size: 10, family: 'JetBrains Mono, monospace' },
        },
      };

      Plotly.newPlot(heatmapRef.current, [heatTrace], heatLayout, {
        responsive: true,
        displayModeBar: false,
      });
    }

    // Pie Chart of ERC Weights
    if (pieChartRef.current && data.allocations) {
      const pieTrace: Plotly.Data = {
        type: 'pie',
        labels: data.allocations.map((a) => a.asset),
        values: data.allocations.map((a) => a.erc_weight),
        hole: 0.55,
        textinfo: 'label+percent',
        textposition: 'outside',
        textfont: { color: '#cbd5e1', size: 10, family: 'JetBrains Mono, monospace' },
        marker: {
          colors: ['#00e5ff', '#00ff88', '#ffb800', '#ff3366', '#a855f7', '#3b82f6', '#14b8a6'],
        },
      };

      const pieLayout: Partial<Plotly.Layout> = {
        title: {
          text: 'Risk Paritesi (ERC) Optimal Varlık Ağırlıkları (%)',
          font: { color: '#cbd5e1', size: 12, family: 'JetBrains Mono, monospace' },
          x: 0.02,
        },
        margin: { l: 20, r: 20, t: 35, b: 20 },
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        showlegend: false,
      };

      Plotly.newPlot(pieChartRef.current, [pieTrace], pieLayout, {
        responsive: true,
        displayModeBar: false,
      });
    }
  }, [data]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="glass-panel p-5 rounded-xl border border-slate-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <PieChart className="w-5 h-5 text-[#00e5ff]" />
            <h1 className="text-lg font-bold text-white font-display">
              Çoklu Varlık Risk Paritesi Motoru (Equal Risk Contribution - ERC)
            </h1>
          </div>
          <p className="text-xs text-slate-400 font-mono mt-1">
            Scipy SLSQP ile her varlığın portföy riskine marjinal katkısını eşitler (Risk Parity Allocation)
          </p>
        </div>

        <button
          onClick={calculateERC}
          className="cursor-pointer flex items-center gap-2 px-3 py-1.5 text-xs font-mono text-slate-300 bg-slate-900 hover:bg-slate-800 border border-slate-700 rounded-lg transition-colors shrink-0"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin text-[#00e5ff]' : ''}`} />
          Ağırlıkları Yeniden Hesapla
        </button>
      </div>

      {/* Asset Basket Selector */}
      <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-3">
        <span className="text-xs font-mono text-slate-400 block">
          Portföy Varlık Sepeti Seçimi (En az 2 varlık gereklidir):
        </span>
        <div className="flex flex-wrap gap-2">
          {availableAssets.map((item) => {
            const isSelected = selectedSymbols.includes(item.s);
            return (
              <button
                key={item.s}
                onClick={() => toggleSymbol(item.s)}
                className={`cursor-pointer px-3 py-1.5 rounded-lg text-xs font-mono transition-all flex items-center gap-1.5 ${
                  isSelected
                    ? 'bg-[#00e5ff]/20 text-[#00e5ff] border border-[#00e5ff]/40 font-semibold shadow-[0_0_10px_rgba(0,229,255,0.15)]'
                    : 'bg-slate-900/80 text-slate-400 hover:text-slate-200 border border-slate-800'
                }`}
              >
                <span className={`w-2 h-2 rounded-full ${isSelected ? 'bg-[#00e5ff]' : 'bg-slate-600'}`} />
                {item.label}
              </button>
            );
          })}
        </div>
      </div>

      {/* Volatility Comparison Strip */}
      {data && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="glass-panel p-4 rounded-xl border border-slate-800 bg-[#00e5ff]/5">
            <span className="text-[11px] font-mono text-slate-400 block">Risk Paritesi (ERC) Portföy Volatilitesi</span>
            <span className="text-2xl font-bold font-mono text-[#00e5ff] tabular-nums mt-1 block">
              %{data.erc_portfolio_volatility}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Dengeli Marjinal Risk Katkısı</span>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 block">Eşit Ağırlıklı (1/N) Volatilitesi</span>
            <span className="text-2xl font-bold font-mono text-slate-200 tabular-nums mt-1 block">
              %{data.equal_weight_volatility}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">Klasik benchmark</span>
          </div>

          <div className="glass-panel p-4 rounded-xl border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 block">Minimum Varyans (Min-Var) Volatilitesi</span>
            <span className="text-2xl font-bold font-mono text-emerald-400 tabular-nums mt-1 block">
              %{data.min_var_volatility}
            </span>
            <span className="text-[10px] text-slate-500 font-mono">En düşük volatilite</span>
          </div>
        </div>
      )}

      {/* Charts Grid: Heatmap + Pie */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="glass-panel p-3 rounded-xl border border-slate-800 h-[360px]">
          <div ref={heatmapRef} className="w-full h-full" />
        </div>
        <div className="glass-panel p-3 rounded-xl border border-slate-800 h-[360px]">
          <div ref={pieChartRef} className="w-full h-full" />
        </div>
      </div>

      {/* Allocations Table */}
      {data && (
        <div className="glass-panel rounded-xl border border-slate-800 overflow-hidden">
          <div className="px-5 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-xs font-bold text-white font-mono">Optimizasyon Ağırlık Karşılaştırma Matrisi</h2>
            <span className="text-[11px] font-mono text-slate-400">SLSQP Çözümü</span>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-xs text-left font-mono">
              <thead className="bg-slate-950/80 text-slate-400 text-[11px]">
                <tr>
                  <th className="px-5 py-3">Varlık</th>
                  <th className="px-5 py-3 text-right">Yıllık Volatilite (%)</th>
                  <th className="px-5 py-3 text-right">Risk Paritesi (ERC) %</th>
                  <th className="px-5 py-3 text-right">Eşit Ağırlık (1/N) %</th>
                  <th className="px-5 py-3 text-right">Min Varyans %</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {data.allocations.map((alloc) => (
                  <tr key={alloc.asset} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-5 py-3 font-semibold text-white">{alloc.asset}</td>
                    <td className="px-5 py-3 text-right text-slate-300 tabular-nums">
                      %{alloc.asset_volatility.toFixed(1)}
                    </td>
                    <td className="px-5 py-3 text-right font-bold text-[#00e5ff] tabular-nums">
                      %{alloc.erc_weight.toFixed(1)}
                    </td>
                    <td className="px-5 py-3 text-right text-slate-400 tabular-nums">
                      %{alloc.equal_weight.toFixed(1)}
                    </td>
                    <td className="px-5 py-3 text-right text-emerald-400 tabular-nums">
                      %{alloc.min_var_weight.toFixed(1)}
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
