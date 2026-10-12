import React, { useState, useEffect } from 'react';
import { TopBar } from './components/TopBar';
import { TickerRibbon } from './components/TickerRibbon';
import { MarketTerminal } from './components/MarketTerminal';
import { AlphaEngineView } from './components/AlphaEngineView';
import { MLEngineView } from './components/MLEngineView';
import { BacktestLabView } from './components/BacktestLabView';
import { OptunaView } from './components/OptunaView';
import { RiskParityView } from './components/RiskParityView';
import { PaperTradingView } from './components/PaperTradingView';
import { CommandPalette } from './components/CommandPalette';
import { OrderModal } from './components/OrderModal';
import { RibbonItem } from './types';
import { useTickerRibbon } from './hooks/useQuantQueries';
import { CheckCircle2, AlertCircle, Info } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState<string>('market');
  const [currentSymbol, setCurrentSymbol] = useState<string>('THYAO.IS');
  const { data: ribbonItems = [] } = useTickerRibbon();
  const [commandPaletteOpen, setCommandPaletteOpen] = useState<boolean>(false);
  const [orderModalOpen, setOrderModalOpen] = useState<boolean>(false);
  const [orderModalPrice, setOrderModalPrice] = useState<number>(300);

  // Toast feedback
  const [toast, setToast] = useState<{ message: string; type: 'success' | 'info' | 'error' } | null>(null);

  const showToast = (message: string, type: 'success' | 'info' | 'error' = 'success') => {
    setToast({ message, type });
    setTimeout(() => {
      setToast(null);
    }, 3500);
  };

  // Global Ctrl+K / Cmd+K listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        setCommandPaletteOpen((prev) => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  const handleSelectSymbol = (sym: string) => {
    setCurrentSymbol(sym);
    showToast(`Seçili varlık güncellendi: ${sym}`, 'info');
  };

  const handleNavigateToML = (sym: string) => {
    setCurrentSymbol(sym);
    setActiveTab('ml');
    showToast(`${sym} Stacking Ensemble analizine aktarıldı`, 'info');
  };

  const handleNavigateToBacktest = (sym: string) => {
    setCurrentSymbol(sym);
    setActiveTab('backtest');
    showToast(`${sym} Walk-Forward Backtest laboratuvarına aktarıldı`, 'info');
  };

  const handleOpenOrder = (sym?: string, price?: number) => {
    if (sym) setCurrentSymbol(sym);
    if (price) setOrderModalPrice(price);
    setOrderModalOpen(true);
  };

  const handleApplyOptunaParams = (params: any) => {
    setActiveTab('backtest');
    showToast('En iyi hiperparametreler Backtest laboratuvarına aktarıldı!', 'success');
  };

  return (
    <div className="min-h-screen bg-[#080b11] text-slate-100 flex flex-col font-sans">
      {/* 1. Strict Top Bar Contract */}
      <TopBar
        activeTab={activeTab}
        setActiveTab={setActiveTab}
        onOpenCommandPalette={() => setCommandPaletteOpen(true)}
      />

      {/* 2. Live Market Ticker Ribbon */}
      <TickerRibbon
        items={ribbonItems}
        onSelectSymbol={(sym) => {
          if (sym !== 'GRAM_ALTIN') {
            handleSelectSymbol(sym);
          } else {
            setActiveTab('market');
          }
        }}
      />

      {/* 3. Main Workspace Container */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {activeTab === 'market' && (
          <MarketTerminal
            currentSymbol={currentSymbol}
            onSymbolChange={handleSelectSymbol}
            onNavigateToML={handleNavigateToML}
            onNavigateToBacktest={handleNavigateToBacktest}
            onOpenOrderModal={handleOpenOrder}
          />
        )}

        {activeTab === 'alpha' && (
          <AlphaEngineView currentSymbol={currentSymbol} />
        )}

        {activeTab === 'ml' && (
          <MLEngineView
            currentSymbol={currentSymbol}
            onOpenOrderModal={handleOpenOrder}
          />
        )}

        {activeTab === 'backtest' && (
          <BacktestLabView currentSymbol={currentSymbol} />
        )}

        {activeTab === 'optuna' && (
          <OptunaView
            currentSymbol={currentSymbol}
            onApplyBestParamsToBacktest={handleApplyOptunaParams}
          />
        )}

        {activeTab === 'risk_parity' && (
          <RiskParityView />
        )}

        {activeTab === 'paper' && (
          <PaperTradingView
            currentSymbol={currentSymbol}
            defaultPrice={orderModalPrice}
            onTradeSuccess={() => showToast('Sanal emir başarıyla gerçekleşti', 'success')}
          />
        )}
      </main>

      {/* 4. Footer */}
      <footer className="border-t border-slate-900 bg-[#06080d] py-4 px-6 text-xs text-slate-500 font-mono flex flex-col sm:flex-row items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <span className="w-2 h-2 rounded-full bg-[#00ff88]" />
          <span>QuantStack Terminal · BIST, Kripto, ABD & TEFAS Kantitatif Finans İstasyonu</span>
        </div>
        <div className="flex items-center gap-4 text-slate-400">
          <span>Obsidian Glassmorphic UI</span>
          <span>·</span>
          <span>Stacking Ensemble & Risk Parity Engine</span>
        </div>
      </footer>

      {/* Spotlight Command Palette (Ctrl+K) */}
      <CommandPalette
        isOpen={commandPaletteOpen}
        onClose={() => setCommandPaletteOpen(false)}
        onSelectSymbol={handleSelectSymbol}
        onSelectTab={setActiveTab}
        onOpenOrderModal={handleOpenOrder}
      />

      {/* Quick Order Modal */}
      <OrderModal
        isOpen={orderModalOpen}
        onClose={() => setOrderModalOpen(false)}
        defaultSymbol={currentSymbol}
        defaultPrice={orderModalPrice}
        onOrderSuccess={() => showToast('Sanal emir başarıyla iletildi ve portföye kaydedildi.', 'success')}
      />

      {/* Toast Notification */}
      {toast && (
        <div className="fixed bottom-6 right-6 z-50 animate-in slide-in-from-bottom-3 duration-200">
          <div
            className={`flex items-center gap-2.5 px-4 py-2.5 rounded-xl text-xs font-mono shadow-2xl border ${
              toast.type === 'success'
                ? 'bg-emerald-950/90 border-emerald-500/40 text-emerald-300'
                : toast.type === 'error'
                ? 'bg-rose-950/90 border-rose-500/40 text-rose-300'
                : 'bg-slate-900/95 border-[#00e5ff]/40 text-[#00e5ff]'
            }`}
          >
            {toast.type === 'success' && <CheckCircle2 className="w-4 h-4 text-emerald-400" />}
            {toast.type === 'error' && <AlertCircle className="w-4 h-4 text-rose-400" />}
            {toast.type === 'info' && <Info className="w-4 h-4 text-[#00e5ff]" />}
            <span>{toast.message}</span>
          </div>
        </div>
      )}
    </div>
  );
}
