import React, { useState, useEffect } from 'react';
import {
  Search,
  Sparkles,
  Play,
  ShoppingBag,
  Coins,
  Briefcase,
  Layers,
  Calendar,
  ArrowUpRight,
  ArrowDownRight,
  Percent,
} from 'lucide-react';
import { SymbolDetails, GoldCommoditiesResponse, TefasFund } from '../types';
import { useSymbolData, useGoldCommodities, useTefasFunds } from '../hooks/useQuantQueries';
import { CandleChart } from './CandleChart';
import { MarketEvents } from './MarketEvents';
import Plotly from 'plotly.js-dist-min';

interface MarketTerminalProps {
  currentSymbol: string;
  onSymbolChange: (symbol: string) => void;
  onNavigateToML: (symbol: string) => void;
  onNavigateToBacktest: (symbol: string) => void;
  onOpenOrderModal: (symbol: string, currentPrice: number) => void;
}

export const MarketTerminal: React.FC<MarketTerminalProps> = ({
  currentSymbol,
  onSymbolChange,
  onNavigateToML,
  onNavigateToBacktest,
  onOpenOrderModal,
}) => {
  const [searchInput, setSearchInput] = useState(currentSymbol);
  const [selectedTefasCategory, setSelectedTefasCategory] = useState<string>('Tümü');
  const [tefasSearch, setTefasSearch] = useState<string>('');
  const [activeMarketSection, setActiveMarketSection] = useState<'stocks' | 'gold' | 'tefas' | 'events'>('stocks');

  // React Query cached data hooks (prevents redundant fetches across tab switches)
  const { data: symbolData, isLoading: loading } = useSymbolData(currentSymbol);
  const { data: goldData } = useGoldCommodities();
  const { data: tefasFunds = [] } = useTefasFunds();

  const quickWatchlist = [
    { s: 'THYAO.IS', label: 'THYAO' },
    { s: 'EREGL.IS', label: 'EREGL' },
    { s: 'ASELS.IS', label: 'ASELS' },
    { s: 'SISE.IS', label: 'SISE' },
    { s: 'TUPRS.IS', label: 'TUPRS' },
    { s: 'GARAN.IS', label: 'GARAN' },
    { s: 'AAPL', label: 'AAPL' },
    { s: 'NVDA', label: 'NVDA' },
    { s: 'BTC-USD', label: 'BTC' },
    { s: 'GC=F', label: 'ALTIN' },
  ];

  // 1-Year Gold Chart ref
  const goldChartRef = React.useRef<HTMLDivElement>(null);
  useEffect(() => {
    if (activeMarketSection === 'gold' && goldData?.gold_history && goldChartRef.current) {
      const dates = goldData.gold_history.map((g) => g.date);
      const prices = goldData.gold_history.map((g) => g.price);

      const trace: Plotly.Data = {
        type: 'scatter',
        mode: 'lines',
        x: dates,
        y: prices,
        name: 'Gram Altın (TL)',
        line: { color: '#ffb800', width: 2 },
        fill: 'tozeroy',
        fillcolor: 'rgba(255, 184, 0, 0.08)',
      };

      const layout: Partial<Plotly.Layout> = {
        title: {
          text: '1 Yıllık Gram Altın / TL Geçmiş Fiyat Seyri',
          font: { color: '#cbd5e1', size: 12, family: 'JetBrains Mono, monospace' },
          x: 0.02,
        },
        margin: { l: 45, r: 25, t: 35, b: 30 },
        paper_bgcolor: 'transparent',
        plot_bgcolor: 'transparent',
        xaxis: {
          type: 'date',
          gridcolor: 'rgba(255, 255, 255, 0.05)',
          tickfont: { color: '#64748b', size: 10, family: 'JetBrains Mono, monospace' },
        },
        yaxis: {
          gridcolor: 'rgba(255, 255, 255, 0.05)',
          tickfont: { color: '#64748b', size: 10, family: 'JetBrains Mono, monospace' },
        },
      };

      Plotly.newPlot(goldChartRef.current, [trace], layout, { responsive: true, displayModeBar: false });
    }
  }, [activeMarketSection, goldData]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchInput.trim()) {
      onSymbolChange(searchInput.trim().toUpperCase());
    }
  };

  const lastCandle = symbolData?.candles?.[symbolData.candles.length - 1];
  const prevCandle = symbolData?.candles?.[symbolData.candles.length - 2];
  const priceChange = lastCandle && prevCandle ? lastCandle.close - prevCandle.close : 0;
  const priceChangePct =
    lastCandle && prevCandle ? ((lastCandle.close - prevCandle.close) / prevCandle.close) * 100 : 0;

  const filteredFunds = tefasFunds.filter((fund) => {
    const matchesCategory = selectedTefasCategory === 'Tümü' || fund.category === selectedTefasCategory;
    const matchesSearch =
      fund.code.toLowerCase().includes(tefasSearch.toLowerCase()) ||
      fund.name.toLowerCase().includes(tefasSearch.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  return (
    <div className="space-y-6">
      {/* Sub-Navigation for Market Sections */}
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-slate-800/80 pb-3">
        <div className="flex items-center gap-1 p-1 bg-slate-900/80 rounded-lg border border-slate-800">
          <button
            onClick={() => setActiveMarketSection('stocks')}
            className={`cursor-pointer px-3.5 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
              activeMarketSection === 'stocks'
                ? 'bg-[#00e5ff]/15 text-[#00e5ff] shadow-sm border border-[#00e5ff]/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Hisseler & Kripto
          </button>
          <button
            onClick={() => setActiveMarketSection('gold')}
            className={`cursor-pointer px-3.5 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
              activeMarketSection === 'gold'
                ? 'bg-[#ffb800]/15 text-[#ffb800] shadow-sm border border-[#ffb800]/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Coins className="w-3.5 h-3.5" />
            Altın & Emtia Paneli
          </button>
          <button
            onClick={() => setActiveMarketSection('tefas')}
            className={`cursor-pointer px-3.5 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
              activeMarketSection === 'tefas'
                ? 'bg-[#00ff88]/15 text-[#00ff88] shadow-sm border border-[#00ff88]/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Briefcase className="w-3.5 h-3.5" />
            TEFAS Fon Takipçisi
          </button>
          <button
            onClick={() => setActiveMarketSection('events')}
            className={`cursor-pointer px-3.5 py-1.5 text-xs font-medium rounded-md transition-all flex items-center gap-1.5 ${
              activeMarketSection === 'events'
                ? 'bg-[#c084fc]/15 text-[#c084fc] shadow-sm border border-[#c084fc]/30 font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Piyasa Takvimi & Olaylar
          </button>
        </div>

        {/* Watchlist Quick Pills */}
        {activeMarketSection === 'stocks' && (
          <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-mono text-slate-500 mr-1">İzleme:</span>
            {quickWatchlist.map((item) => (
              <button
                key={item.s}
                onClick={() => {
                  setSearchInput(item.s);
                  onSymbolChange(item.s);
                }}
                className={`cursor-pointer text-xs font-mono px-2.5 py-1 rounded transition-colors ${
                  currentSymbol === item.s
                    ? 'bg-slate-800 text-[#00e5ff] border border-[#00e5ff]/40'
                    : 'bg-slate-900/60 text-slate-400 hover:bg-slate-800 hover:text-slate-200 border border-slate-800/80'
                }`}
              >
                {item.label}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* SECTION 1: STOCKS & CRYPTO TERMINAL */}
      {activeMarketSection === 'stocks' && (
        <div className="space-y-6">
          {/* Header Row: Symbol Search, Live Price, Action Triggers */}
          <div className="glass-panel p-5 rounded-xl border border-slate-800 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
            <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 w-full lg:w-auto">
              <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-64">
                <input
                  type="text"
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  placeholder="Sembol (THYAO.IS, AAPL)..."
                  className="w-full glass-input px-3.5 py-2 pl-9 text-xs font-mono rounded-lg"
                />
                <Search className="w-4 h-4 text-slate-400 absolute left-3 top-2.5" />
              </form>

              <div>
                <div className="flex items-baseline gap-3">
                  <h1 className="text-xl font-bold tracking-tight text-white font-display">
                    {symbolData?.name || currentSymbol}
                  </h1>
                  <span className="text-xs font-mono text-slate-400">{currentSymbol}</span>
                </div>
                <div className="flex items-center gap-3 mt-0.5">
                  <span className="text-2xl font-bold font-mono text-white tabular-nums">
                    {lastCandle ? lastCandle.close.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) : '---'}
                  </span>
                  <span className="text-xs text-slate-400 font-mono">
                    {symbolData?.fundamentals.currency || 'TRY'}
                  </span>
                  {lastCandle && (
                    <span
                      className={`text-xs font-mono font-semibold flex items-center ${
                        priceChangePct >= 0 ? 'text-emerald-400' : 'text-rose-400'
                      }`}
                    >
                      {priceChangePct >= 0 ? (
                        <ArrowUpRight className="w-3.5 h-3.5 inline mr-0.5" />
                      ) : (
                        <ArrowDownRight className="w-3.5 h-3.5 inline mr-0.5" />
                      )}
                      {priceChange >= 0 ? '+' : ''}
                      {priceChange.toFixed(2)} ({priceChangePct.toFixed(2)}%)
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Direct Workflow Triggers */}
            <div className="flex items-center gap-2.5 w-full lg:w-auto justify-end">
              <button
                onClick={() => onNavigateToML(currentSymbol)}
                className="cursor-pointer flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-[#00e5ff] bg-[#00e5ff]/10 hover:bg-[#00e5ff]/20 border border-[#00e5ff]/30 rounded-lg transition-all shadow-[0_0_12px_rgba(0,229,255,0.15)]"
              >
                <Sparkles className="w-3.5 h-3.5 text-[#00e5ff]" />
                AI Analizine Gönder
              </button>
              <button
                onClick={() => onNavigateToBacktest(currentSymbol)}
                className="cursor-pointer flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-emerald-400 bg-emerald-500/10 hover:bg-emerald-500/20 border border-emerald-500/30 rounded-lg transition-all"
              >
                <Play className="w-3.5 h-3.5 text-emerald-400" />
                Backtest Başlat
              </button>
              <button
                onClick={() => lastCandle && onOpenOrderModal(currentSymbol, lastCandle.close)}
                className="cursor-pointer flex items-center gap-1.5 px-3.5 py-2 text-xs font-medium text-white bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg transition-all"
              >
                <ShoppingBag className="w-3.5 h-3.5 text-amber-400" />
                Emir Ver
              </button>
            </div>
          </div>

          {/* Fundamental Analysis Matrix */}
          <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
            <div className="glass-panel p-3 rounded-lg border border-slate-800/80">
              <span className="text-[11px] font-mono text-slate-400 block mb-1">Fiyat / Kazanç (F/K)</span>
              <span className="text-base font-bold font-mono text-white tabular-nums">
                {symbolData?.fundamentals.pe_ratio != null ? symbolData.fundamentals.pe_ratio.toFixed(2) : 'A/D'}
              </span>
            </div>
            <div className="glass-panel p-3 rounded-lg border border-slate-800/80">
              <span className="text-[11px] font-mono text-slate-400 block mb-1">Piyasa / Defter (PD/DD)</span>
              <span className="text-base font-bold font-mono text-white tabular-nums">
                {symbolData?.fundamentals.pb_ratio != null ? symbolData.fundamentals.pb_ratio.toFixed(2) : 'A/D'}
              </span>
            </div>
            <div className="glass-panel p-3 rounded-lg border border-slate-800/80">
              <span className="text-[11px] font-mono text-slate-400 block mb-1">Temettü Verimi</span>
              <span className="text-base font-bold font-mono text-emerald-400 tabular-nums">
                %{symbolData?.fundamentals.dividend_yield != null ? symbolData.fundamentals.dividend_yield.toFixed(2) : '0.00'}
              </span>
            </div>
            <div className="glass-panel p-3 rounded-lg border border-slate-800/80">
              <span className="text-[11px] font-mono text-slate-400 block mb-1">Piyasa Değeri</span>
              <span className="text-base font-bold font-mono text-white tabular-nums">
                {symbolData?.fundamentals.market_cap
                  ? `${(symbolData.fundamentals.market_cap / 1_000_000_000).toFixed(1)} Mrd`
                  : '---'}
              </span>
            </div>
            <div className="glass-panel p-3 rounded-lg border border-slate-800/80">
              <span className="text-[11px] font-mono text-slate-400 block mb-1">52H Zirve</span>
              <span className="text-base font-bold font-mono text-emerald-400 tabular-nums">
                {symbolData?.fundamentals.fifty_two_week_high != null
                  ? symbolData.fundamentals.fifty_two_week_high.toLocaleString('tr-TR', { minimumFractionDigits: 2 })
                  : '---'}
              </span>
            </div>
            <div className="glass-panel p-3 rounded-lg border border-slate-800/80">
              <span className="text-[11px] font-mono text-slate-400 block mb-1">52H Dip</span>
              <span className="text-base font-bold font-mono text-rose-400 tabular-nums">
                {symbolData?.fundamentals.fifty_two_week_low != null
                  ? symbolData.fundamentals.fifty_two_week_low.toLocaleString('tr-TR', { minimumFractionDigits: 2 })
                  : '---'}
              </span>
            </div>
            <div className="glass-panel p-3 rounded-lg border border-slate-800/80 col-span-2 sm:col-span-1">
              <span className="text-[11px] font-mono text-slate-400 block mb-1">Son Hacim</span>
              <span className="text-base font-bold font-mono text-white tabular-nums">
                {lastCandle ? (lastCandle.volume / 1_000_000).toFixed(2) + ' M' : '---'}
              </span>
            </div>
          </div>

          {/* Interactive Candlestick Chart */}
          {loading ? (
            <div className="h-[400px] glass-panel rounded-xl flex items-center justify-center text-slate-400 font-mono text-xs">
              Piyasa verileri yükleniyor...
            </div>
          ) : (
            symbolData && (
              <CandleChart
                candles={symbolData.candles}
                title={`${symbolData.name} (${currentSymbol}) - 1 Yıllık Fiyat & EMA 20/50 / Hacim`}
              />
            )
          )}
        </div>
      )}

      {/* SECTION 2: GOLD & COMMODITIES PANEL */}
      {activeMarketSection === 'gold' && (
        <div className="space-y-6">
          <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-wrap items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white font-display">
                Kıymetli Madenler (Spot & Kapalıçarşı Fiziki Altın / Gümüş / Petrol)
              </h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                Spot ons fiyatları, dolar kuru ve serbest piyasa kuyumcu alış-satış makasları
              </p>
            </div>
            <div className="flex items-center gap-4 text-xs font-mono">
              <div className="bg-slate-900/80 px-3 py-1.5 rounded border border-slate-800">
                <span className="text-slate-400 mr-1.5">Ons Altın:</span>
                <span className="font-bold text-amber-400 tabular-nums">${goldData?.gold_ounce_usd || 2655}</span>
              </div>
              <div className="bg-slate-900/80 px-3 py-1.5 rounded border border-slate-800">
                <span className="text-slate-400 mr-1.5">USD/TRY:</span>
                <span className="font-bold text-white tabular-nums">₺{goldData?.usd_try || 34.85}</span>
              </div>
              <div className="bg-slate-900/80 px-3 py-1.5 rounded border border-slate-800">
                <span className="text-slate-400 mr-1.5">Spot Gram:</span>
                <span className="font-bold text-[#00ff88] tabular-nums">₺{goldData?.spot_gram_gold_try || 2975}</span>
              </div>
            </div>
          </div>

          {/* Physical Gold Spread Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {goldData?.items?.map((item) => (
              <div
                key={item.id}
                className="glass-panel p-4 rounded-xl border border-slate-800/90 hover:border-slate-700 transition-all flex flex-col justify-between"
              >
                <div>
                  <div className="flex items-start justify-between">
                    <div>
                      <h3 className="text-sm font-semibold text-white">{item.name}</h3>
                      <span className="text-[11px] font-mono text-slate-400">
                        {item.weight_g > 0 ? `${item.weight_g} gr · ` : ''}
                        {item.purity < 1 ? `%${(item.purity * 100).toFixed(0)} Saflık` : 'Has / Spot'}
                      </span>
                    </div>
                    <span className="text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 text-slate-300">
                      Makas: %{item.spread_pct.toFixed(2)}
                    </span>
                  </div>

                  <div className="grid grid-cols-2 gap-3 mt-4 pt-3 border-t border-slate-800/60 font-mono">
                    <div>
                      <span className="text-[10px] text-slate-400 block">Alış Fiyatı</span>
                      <span className="text-base font-bold text-slate-200 tabular-nums">
                        {item.currency === 'TRY' ? '₺' : '$'}
                        {item.buy_price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                    <div>
                      <span className="text-[10px] text-slate-400 block">Satış Fiyatı</span>
                      <span className="text-base font-bold text-emerald-400 tabular-nums">
                        {item.currency === 'TRY' ? '₺' : '$'}
                        {item.sell_price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="mt-3 pt-2 flex items-center justify-between text-[11px] font-mono text-slate-500 border-t border-slate-800/30">
                  <span>Fark: {item.spread.toFixed(2)} {item.currency}</span>
                  <button
                    onClick={() => onOpenOrderModal(item.name, item.sell_price)}
                    className="cursor-pointer text-xs text-[#00e5ff] hover:underline"
                  >
                    Sanal Al
                  </button>
                </div>
              </div>
            ))}
          </div>

          {/* 1-Year Historical Gold Chart */}
          <div className="w-full h-[320px] rounded-xl overflow-hidden glass-panel border border-slate-800 p-2">
            <div ref={goldChartRef} className="w-full h-full" />
          </div>
        </div>
      )}

      {/* SECTION 3: TEFAS MUTUAL FUNDS */}
      {activeMarketSection === 'tefas' && (
        <div className="space-y-4">
          <div className="glass-panel p-4 rounded-xl border border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-bold text-white font-display">TEFAS Yatırım Fonları Takipçisi</h2>
              <p className="text-xs text-slate-400 font-mono mt-0.5">
                BIST hisse yoğun, altın, teknoloji, değişken ve eurobond fon getirileri
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-2">
              <input
                type="text"
                placeholder="Fon ara (TCD, AFT)..."
                value={tefasSearch}
                onChange={(e) => setTefasSearch(e.target.value)}
                className="glass-input px-3 py-1.5 text-xs font-mono rounded-lg w-44"
              />
              <div className="flex items-center gap-1 bg-slate-900/80 p-1 rounded-lg border border-slate-800 text-xs">
                {['Tümü', 'Hisse Yoğun', 'Altın / Kıymetli Madenler', 'Değişken', 'Yabancı Teknoloji', 'Eurobond'].map(
                  (cat) => (
                    <button
                      key={cat}
                      onClick={() => setSelectedTefasCategory(cat)}
                      className={`cursor-pointer px-2.5 py-1 rounded transition-colors whitespace-nowrap ${
                        selectedTefasCategory === cat
                          ? 'bg-[#00ff88]/20 text-[#00ff88] font-semibold'
                          : 'text-slate-400 hover:text-slate-200'
                      }`}
                    >
                      {cat}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>

          {/* TEFAS Fund Table */}
          <div className="glass-panel rounded-xl border border-slate-800 overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-xs text-left font-mono">
                <thead className="bg-slate-900/90 text-slate-400 border-b border-slate-800 text-[11px]">
                  <tr>
                    <th className="px-4 py-3">Fon Kodu</th>
                    <th className="px-4 py-3">Fon Adı</th>
                    <th className="px-4 py-3">Kategori</th>
                    <th className="px-4 py-3 text-right">Fiyat (TL)</th>
                    <th className="px-4 py-3 text-right">Günlük %</th>
                    <th className="px-4 py-3 text-right">1 Aylık %</th>
                    <th className="px-4 py-3 text-right">Yılbaşı (YTD) %</th>
                    <th className="px-4 py-3 text-right">1 Yıllık %</th>
                    <th className="px-4 py-3 text-right">Portföy (Milyon ₺)</th>
                    <th className="px-4 py-3 text-right">Yatırımcı</th>
                    <th className="px-4 py-3 text-center">Risk (1-7)</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-800/60">
                  {filteredFunds.map((fund) => {
                    const is1YUp = fund.yearly_return >= 0;
                    return (
                      <tr key={fund.code} className="hover:bg-slate-800/40 transition-colors">
                        <td className="px-4 py-3 font-bold text-[#00e5ff]">{fund.code}</td>
                        <td className="px-4 py-3 text-slate-200 max-w-xs truncate" title={fund.name}>
                          {fund.name}
                        </td>
                        <td className="px-4 py-3 text-slate-400">{fund.category}</td>
                        <td className="px-4 py-3 text-right font-bold tabular-nums">₺{fund.price.toFixed(4)}</td>
                        <td
                          className={`px-4 py-3 text-right font-semibold tabular-nums ${
                            fund.daily_return >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          {fund.daily_return >= 0 ? '+' : ''}
                          {fund.daily_return.toFixed(2)}%
                        </td>
                        <td
                          className={`px-4 py-3 text-right tabular-nums ${
                            fund.monthly_return >= 0 ? 'text-emerald-400' : 'text-rose-400'
                          }`}
                        >
                          %{fund.monthly_return.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right text-emerald-400 font-semibold tabular-nums">
                          %{fund.ytd_return.toFixed(2)}
                        </td>
                        <td
                          className={`px-4 py-3 text-right font-bold tabular-nums ${
                            is1YUp ? 'text-[#00ff88]' : 'text-rose-400'
                          }`}
                        >
                          %{fund.yearly_return.toFixed(2)}
                        </td>
                        <td className="px-4 py-3 text-right text-slate-300 tabular-nums">
                          ₺{fund.portfolio_size_m.toLocaleString('tr-TR')} M
                        </td>
                        <td className="px-4 py-3 text-right text-slate-300 tabular-nums">
                          {fund.investors.toLocaleString('tr-TR')}
                        </td>
                        <td className="px-4 py-3 text-center">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold ${
                              fund.risk_level >= 6
                                ? 'bg-rose-500/20 text-rose-400'
                                : fund.risk_level >= 4
                                ? 'bg-amber-500/20 text-amber-400'
                                : 'bg-emerald-500/20 text-emerald-400'
                            }`}
                          >
                            {fund.risk_level} / 7
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      )}

      {/* SECTION 4: MARKET EVENTS CALENDAR & AGENDA */}
      {activeMarketSection === 'events' && (
        <MarketEvents
          onSelectSymbol={(sym) => {
            onSymbolChange(sym);
            setActiveMarketSection('stocks');
          }}
        />
      )}
    </div>
  );
};
