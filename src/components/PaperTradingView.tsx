import React, { useState, useEffect } from 'react';
import {
  Wallet,
  ShoppingBag,
  TrendingUp,
  TrendingDown,
  RotateCcw,
  PlusCircle,
  XCircle,
  CheckCircle2,
  Clock,
} from 'lucide-react';
import { PaperPortfolio } from '../types';
import {
  usePaperPortfolio,
  useOrderMutation,
  useClosePositionMutation,
  useResetPortfolioMutation,
} from '../hooks/useQuantQueries';

interface PaperTradingViewProps {
  currentSymbol: string;
  defaultPrice?: number;
  onTradeSuccess?: () => void;
}

export const PaperTradingView: React.FC<PaperTradingViewProps> = ({
  currentSymbol,
  defaultPrice = 300,
  onTradeSuccess,
}) => {
  const { data: portfolio, isLoading: loading } = usePaperPortfolio();
  const orderMutation = useOrderMutation();
  const closeMutation = useClosePositionMutation();
  const resetMutation = useResetPortfolioMutation();

  // Order form state
  const [orderSymbol, setOrderSymbol] = useState<string>(currentSymbol);
  const [orderSide, setOrderSide] = useState<'BUY' | 'SELL'>('BUY');
  const [orderQty, setOrderQty] = useState<number>(20);
  const [orderPrice, setOrderPrice] = useState<number>(defaultPrice);
  const [stopLoss, setStopLoss] = useState<string>('');
  const [takeProfit, setTakeProfit] = useState<string>('');
  const [orderError, setOrderError] = useState<string | null>(null);

  useEffect(() => {
    setOrderSymbol(currentSymbol);
    if (defaultPrice) setOrderPrice(defaultPrice);
  }, [currentSymbol, defaultPrice]);

  const handleExecuteOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderError(null);

    orderMutation.mutate(
      {
        symbol: orderSymbol,
        side: orderSide,
        qty: orderQty,
        price: orderPrice,
        stop_loss: stopLoss ? parseFloat(stopLoss) : null,
        take_profit: takeProfit ? parseFloat(takeProfit) : null,
      },
      {
        onSuccess: (resData) => {
          if (onTradeSuccess) onTradeSuccess();
        },
        onError: (err: any) => {
          setOrderError(err.message || 'Emir iletilemedi');
        },
      }
    );
  };

  const handleClosePosition = (posId: string, currentPrice: number) => {
    closeMutation.mutate(
      {
        position_id: posId,
        current_price: currentPrice,
      },
      {
        onSuccess: () => {
          if (onTradeSuccess) onTradeSuccess();
        },
      }
    );
  };

  const handleResetAccount = () => {
    if (confirm('Sanal işlem hesabını 250.000 ₺ başlangıç bakiyesine sıfırlamak istediğinize emin misiniz?')) {
      resetMutation.mutate();
    }
  };

  const investedAmount =
    portfolio?.positions?.reduce((sum, p) => sum + p.qty * p.entry_price, 0) || 0;
  const currentPositionsValue =
    portfolio?.positions?.reduce((sum, p) => sum + p.qty * (p.current_price || p.entry_price), 0) || 0;
  const totalEquity = (portfolio?.balance || 0) + currentPositionsValue;
  const unrealizedPnL = currentPositionsValue - investedAmount;
  const unrealizedPnLPct = investedAmount > 0 ? (unrealizedPnL / investedAmount) * 100 : 0;

  return (
    <div className="space-y-6">
      {/* Portfolio Overview Cards */}
      <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-4">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-slate-800/80 pb-3">
          <div className="flex items-center gap-2">
            <Wallet className="w-5 h-5 text-[#00e5ff]" />
            <h1 className="text-lg font-bold text-white font-display">
              Sanal İşlemler (Paper Trading) & Portföy Defteri
            </h1>
          </div>

          <button
            onClick={handleResetAccount}
            className="cursor-pointer flex items-center gap-1.5 px-3 py-1.5 text-xs font-mono text-slate-400 hover:text-rose-400 bg-slate-900 hover:bg-slate-800 border border-slate-800 rounded-lg transition-colors"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            Hesabı Sıfırla (250.000 ₺)
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
          <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 block">Nakit Bakiye (Serbest)</span>
            <span className="text-xl font-bold font-mono text-white tabular-nums mt-1 block">
              ₺{portfolio?.balance ? portfolio.balance.toLocaleString('tr-TR', { minimumFractionDigits: 2 }) : '250.000,00'}
            </span>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 block">Toplam Portföy Değeri (Varlık)</span>
            <span className="text-xl font-bold font-mono text-[#00e5ff] tabular-nums mt-1 block">
              ₺{totalEquity.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 block">Açık Pozisyonlar Büyüklüğü</span>
            <span className="text-xl font-bold font-mono text-slate-200 tabular-nums mt-1 block">
              ₺{investedAmount.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          <div className="bg-slate-900/80 p-3.5 rounded-lg border border-slate-800">
            <span className="text-[11px] font-mono text-slate-400 block">Gerçekleşmemiş Kar/Zarar</span>
            <span
              className={`text-xl font-bold font-mono tabular-nums mt-1 block ${
                unrealizedPnL >= 0 ? 'text-[#00ff88]' : 'text-rose-400'
              }`}
            >
              {unrealizedPnL >= 0 ? '+' : ''}₺
              {unrealizedPnL.toLocaleString('tr-TR', { minimumFractionDigits: 2 })} (%
              {unrealizedPnLPct.toFixed(2)})
            </span>
          </div>
        </div>
      </div>

      {/* Main Grid: Order Entry Form + Open Positions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Order Form */}
        <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-4">
          <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
            <h2 className="text-sm font-bold text-white font-mono flex items-center gap-1.5">
              <ShoppingBag className="w-4 h-4 text-amber-400" />
              Sanal Emir Girişi
            </h2>
            <div className="flex items-center gap-1 bg-slate-900 p-0.5 rounded-lg border border-slate-800">
              <button
                type="button"
                onClick={() => setOrderSide('BUY')}
                className={`cursor-pointer px-3 py-1 text-xs font-mono font-semibold rounded ${
                  orderSide === 'BUY'
                    ? 'bg-emerald-500 text-black shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                ALIŞ
              </button>
              <button
                type="button"
                onClick={() => setOrderSide('SELL')}
                className={`cursor-pointer px-3 py-1 text-xs font-mono font-semibold rounded ${
                  orderSide === 'SELL'
                    ? 'bg-rose-500 text-white shadow-sm'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                SATIŞ
              </button>
            </div>
          </div>

          <form onSubmit={handleExecuteOrder} className="space-y-3.5 text-xs font-mono">
            <div>
              <label className="text-slate-400 block mb-1">Sembol / Varlık Kodu</label>
              <input
                type="text"
                value={orderSymbol}
                onChange={(e) => setOrderSymbol(e.target.value.toUpperCase())}
                className="w-full glass-input px-3 py-2 rounded-lg"
                placeholder="THYAO.IS, BTC-USD..."
                required
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Adet / Miktar</label>
                <input
                  type="number"
                  step="1"
                  min="1"
                  value={orderQty}
                  onChange={(e) => setOrderQty(parseFloat(e.target.value) || 1)}
                  className="w-full glass-input px-3 py-2 rounded-lg"
                  required
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Fiyat (Birim)</label>
                <input
                  type="number"
                  step="0.05"
                  value={orderPrice}
                  onChange={(e) => setOrderPrice(parseFloat(e.target.value) || 0)}
                  className="w-full glass-input px-3 py-2 rounded-lg"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="text-slate-400 block mb-1">Stop-Loss (Fiyat)</label>
                <input
                  type="number"
                  step="0.05"
                  value={stopLoss}
                  onChange={(e) => setStopLoss(e.target.value)}
                  placeholder="İsteğe bağlı"
                  className="w-full glass-input px-3 py-2 rounded-lg"
                />
              </div>

              <div>
                <label className="text-slate-400 block mb-1">Take-Profit (Fiyat)</label>
                <input
                  type="number"
                  step="0.05"
                  value={takeProfit}
                  onChange={(e) => setTakeProfit(e.target.value)}
                  placeholder="İsteğe bağlı"
                  className="w-full glass-input px-3 py-2 rounded-lg"
                />
              </div>
            </div>

            <div className="p-3 bg-slate-900/80 rounded-lg border border-slate-800 space-y-1">
              <div className="flex justify-between text-slate-400">
                <span>Tahmini Tutar:</span>
                <span className="text-white font-bold tabular-nums">
                  ₺{(orderQty * orderPrice).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
                </span>
              </div>
            </div>

            {orderError && (
              <div className="p-2.5 rounded bg-rose-500/10 border border-rose-500/30 text-rose-400 text-xs">
                {orderError}
              </div>
            )}

            <button
              type="submit"
              className={`cursor-pointer w-full py-2.5 px-4 text-xs font-bold rounded-lg transition-all shadow-md ${
                orderSide === 'BUY'
                  ? 'bg-gradient-to-r from-emerald-500 to-[#00ff88] text-black hover:opacity-95'
                  : 'bg-gradient-to-r from-rose-600 to-rose-500 text-white hover:opacity-95'
              }`}
            >
              {orderSide === 'BUY' ? 'Sanal Alış Emrini Gerçekleştir' : 'Sanal Satış Emrini Gerçekleştir'}
            </button>
          </form>
        </div>

        {/* Open Positions Table */}
        <div className="lg:col-span-2 glass-panel rounded-xl border border-slate-800 overflow-hidden flex flex-col justify-between">
          <div>
            <div className="px-5 py-3.5 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
              <h2 className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
                <CheckCircle2 className="w-4 h-4 text-[#00ff88]" />
                Açık Pozisyonlar ({portfolio?.positions?.length || 0})
              </h2>
              <span className="text-[11px] font-mono text-slate-400">Canlı PnL Takibi</span>
            </div>

            <div className="overflow-x-auto max-h-[360px] overflow-y-auto">
              {portfolio?.positions && portfolio.positions.length > 0 ? (
                <table className="w-full text-xs text-left font-mono">
                  <thead className="bg-slate-950/80 text-slate-400 text-[11px] sticky top-0">
                    <tr>
                      <th className="px-4 py-2.5">Sembol</th>
                      <th className="px-4 py-2.5 text-right">Adet</th>
                      <th className="px-4 py-2.5 text-right">Giriş Fiyatı</th>
                      <th className="px-4 py-2.5 text-right">Güncel Fiyat</th>
                      <th className="px-4 py-2.5 text-right">PnL (₺)</th>
                      <th className="px-4 py-2.5 text-right">PnL (%)</th>
                      <th className="px-4 py-2.5 text-center">Aksiyon</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-slate-800/60">
                    {portfolio.positions.map((pos) => {
                      const cur = pos.current_price || pos.entry_price;
                      const pnl = (cur - pos.entry_price) * pos.qty;
                      const pnlPct = ((cur - pos.entry_price) / pos.entry_price) * 100;

                      return (
                        <tr key={pos.id} className="hover:bg-slate-800/40 transition-colors">
                          <td className="px-4 py-3 font-bold text-[#00e5ff]">{pos.symbol}</td>
                          <td className="px-4 py-3 text-right tabular-nums">{pos.qty}</td>
                          <td className="px-4 py-3 text-right tabular-nums">₺{pos.entry_price.toFixed(2)}</td>
                          <td className="px-4 py-3 text-right tabular-nums">₺{cur.toFixed(2)}</td>
                          <td
                            className={`px-4 py-3 text-right font-bold tabular-nums ${
                              pnl >= 0 ? 'text-[#00ff88]' : 'text-rose-400'
                            }`}
                          >
                            {pnl >= 0 ? '+' : ''}₺{pnl.toFixed(2)}
                          </td>
                          <td
                            className={`px-4 py-3 text-right font-semibold tabular-nums ${
                              pnlPct >= 0 ? 'text-[#00ff88]' : 'text-rose-400'
                            }`}
                          >
                            %{pnlPct.toFixed(2)}
                          </td>
                          <td className="px-4 py-3 text-center">
                            <button
                              onClick={() => handleClosePosition(pos.id, cur)}
                              className="cursor-pointer text-[11px] px-2 py-0.5 rounded bg-rose-500/15 text-rose-400 hover:bg-rose-500/25 border border-rose-500/30 transition-colors"
                            >
                              Kapat
                            </button>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-xs font-mono text-slate-500">
                  Henüz açık sanal pozisyon bulunmuyor. Soldaki formdan alış veya satış emri girin.
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Closed Trades History */}
      {portfolio?.history && portfolio.history.length > 0 && (
        <div className="glass-panel rounded-xl border border-slate-800 overflow-hidden">
          <div className="px-5 py-3 bg-slate-900/90 border-b border-slate-800 flex items-center justify-between">
            <h2 className="text-xs font-bold text-white font-mono flex items-center gap-1.5">
              <Clock className="w-4 h-4 text-slate-400" />
              Kapanan İşlemler Defteri (Realized History)
            </h2>
            <span className="text-[11px] font-mono text-slate-400">Yerel kalıcı (paper_trades.json)</span>
          </div>

          <div className="overflow-x-auto max-h-56 overflow-y-auto">
            <table className="w-full text-xs text-left font-mono">
              <thead className="bg-slate-950/80 text-slate-400 text-[11px] sticky top-0">
                <tr>
                  <th className="px-4 py-2.5">Kapanış Zamanı</th>
                  <th className="px-4 py-2.5">Sembol</th>
                  <th className="px-4 py-2.5">Yön</th>
                  <th className="px-4 py-2.5 text-right">Miktar</th>
                  <th className="px-4 py-2.5 text-right">Giriş Fiyatı</th>
                  <th className="px-4 py-2.5 text-right">Çıkış Fiyatı</th>
                  <th className="px-4 py-2.5 text-right">Gerçekleşen Kar/Zarar (₺)</th>
                  <th className="px-4 py-2.5 text-right">Getiri (%)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-800/60">
                {portfolio.history.map((h) => (
                  <tr key={h.id} className="hover:bg-slate-800/40 transition-colors">
                    <td className="px-4 py-2.5 text-slate-400">{h.closed_at}</td>
                    <td className="px-4 py-2.5 font-bold text-white">{h.symbol}</td>
                    <td className="px-4 py-2.5 text-slate-400">{h.side}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">{h.qty}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">₺{h.entry_price.toFixed(2)}</td>
                    <td className="px-4 py-2.5 text-right tabular-nums">₺{h.exit_price.toFixed(2)}</td>
                    <td
                      className={`px-4 py-2.5 text-right font-bold tabular-nums ${
                        h.pnl >= 0 ? 'text-[#00ff88]' : 'text-rose-400'
                      }`}
                    >
                      {h.pnl >= 0 ? '+' : ''}₺{h.pnl.toFixed(2)}
                    </td>
                    <td
                      className={`px-4 py-2.5 text-right font-semibold tabular-nums ${
                        h.pnl_pct >= 0 ? 'text-[#00ff88]' : 'text-rose-400'
                      }`}
                    >
                      %{h.pnl_pct.toFixed(2)}
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
