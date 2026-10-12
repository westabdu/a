import React, { useState, useEffect } from 'react';
import { X, ShoppingBag } from 'lucide-react';
import { useOrderMutation } from '../hooks/useQuantQueries';

interface OrderModalProps {
  isOpen: boolean;
  onClose: () => void;
  defaultSymbol: string;
  defaultPrice?: number;
  onOrderSuccess: () => void;
}

export const OrderModal: React.FC<OrderModalProps> = ({
  isOpen,
  onClose,
  defaultSymbol,
  defaultPrice = 300,
  onOrderSuccess,
}) => {
  const [symbol, setSymbol] = useState(defaultSymbol);
  const [side, setSide] = useState<'BUY' | 'SELL'>('BUY');
  const [qty, setQty] = useState(25);
  const [price, setPrice] = useState(defaultPrice);
  const [stopLoss, setStopLoss] = useState('');
  const [takeProfit, setTakeProfit] = useState('');
  const [error, setError] = useState<string | null>(null);

  const orderMutation = useOrderMutation();

  useEffect(() => {
    setSymbol(defaultSymbol);
    if (defaultPrice) setPrice(defaultPrice);
  }, [defaultSymbol, defaultPrice]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    orderMutation.mutate(
      {
        symbol,
        side,
        qty,
        price,
        stop_loss: stopLoss ? parseFloat(stopLoss) : null,
        take_profit: takeProfit ? parseFloat(takeProfit) : null,
      },
      {
        onSuccess: () => {
          onOrderSuccess();
          onClose();
        },
        onError: (err: any) => {
          setError(err.message || 'Emir iletilemedi');
        },
      }
    );
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-md glass-panel-elevated rounded-2xl border border-slate-700/80 shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-800">
          <div className="flex items-center gap-2">
            <ShoppingBag className="w-4 h-4 text-[#00e5ff]" />
            <h3 className="text-sm font-bold text-white font-mono">Hızlı Sanal Emir</h3>
          </div>
          <button onClick={onClose} className="cursor-pointer text-slate-400 hover:text-white">
            <X className="w-4 h-4" />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="p-5 space-y-4 text-xs font-mono">
          <div className="grid grid-cols-2 gap-2 p-1 bg-slate-900 rounded-lg border border-slate-800">
            <button
              type="button"
              onClick={() => setSide('BUY')}
              className={`cursor-pointer py-1.5 font-bold rounded ${
                side === 'BUY' ? 'bg-emerald-500 text-black' : 'text-slate-400'
              }`}
            >
              ALIŞ
            </button>
            <button
              type="button"
              onClick={() => setSide('SELL')}
              className={`cursor-pointer py-1.5 font-bold rounded ${
                side === 'SELL' ? 'bg-rose-500 text-white' : 'text-slate-400'
              }`}
            >
              SATIŞ
            </button>
          </div>

          <div>
            <label className="text-slate-400 block mb-1">Sembol</label>
            <input
              type="text"
              value={symbol}
              onChange={(e) => setSymbol(e.target.value.toUpperCase())}
              className="w-full glass-input px-3 py-2 rounded-lg"
              required
            />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">Adet</label>
              <input
                type="number"
                min="1"
                value={qty}
                onChange={(e) => setQty(parseFloat(e.target.value) || 1)}
                className="w-full glass-input px-3 py-2 rounded-lg"
                required
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Fiyat (Birim)</label>
              <input
                type="number"
                step="0.05"
                value={price}
                onChange={(e) => setPrice(parseFloat(e.target.value) || 0)}
                className="w-full glass-input px-3 py-2 rounded-lg"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="text-slate-400 block mb-1">Stop-Loss (₺)</label>
              <input
                type="number"
                step="0.05"
                placeholder="Opsiyonel"
                value={stopLoss}
                onChange={(e) => setStopLoss(e.target.value)}
                className="w-full glass-input px-3 py-2 rounded-lg"
              />
            </div>
            <div>
              <label className="text-slate-400 block mb-1">Take-Profit (₺)</label>
              <input
                type="number"
                step="0.05"
                placeholder="Opsiyonel"
                value={takeProfit}
                onChange={(e) => setTakeProfit(e.target.value)}
                className="w-full glass-input px-3 py-2 rounded-lg"
              />
            </div>
          </div>

          <div className="p-3 bg-slate-900 rounded-lg border border-slate-800 flex justify-between">
            <span className="text-slate-400">Toplam Tutar:</span>
            <span className="font-bold text-white tabular-nums">
              ₺{(qty * price).toLocaleString('tr-TR', { minimumFractionDigits: 2 })}
            </span>
          </div>

          {error && <div className="text-rose-400 text-xs p-2 bg-rose-500/10 rounded">{error}</div>}

          <button
            type="submit"
            disabled={orderMutation.isPending}
            className={`cursor-pointer w-full py-2.5 font-bold rounded-lg transition-all ${
              side === 'BUY'
                ? 'bg-[#00ff88] text-black hover:opacity-90'
                : 'bg-rose-500 text-white hover:opacity-90'
            }`}
          >
            {orderMutation.isPending ? 'Gönderiliyor...' : `${side === 'BUY' ? 'Alış' : 'Satış'} Emrini Onayla`}
          </button>
        </form>
      </div>
    </div>
  );
};
