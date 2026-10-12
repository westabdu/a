import React, { useState, useEffect } from 'react';
import {
  Search,
  Layers,
  Brain,
  Play,
  Target,
  PieChart,
  ShoppingBag,
  Coins,
  Briefcase,
  X,
  ArrowRight,
} from 'lucide-react';

interface CommandPaletteProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectSymbol: (symbol: string) => void;
  onSelectTab: (tab: string) => void;
  onOpenOrderModal: (symbol: string) => void;
}

interface CommandItem {
  id: string;
  category: 'Sayfa' | 'Hisse & Varlık' | 'Altın & Emtia' | 'TEFAS Fonu' | 'Aksiyon';
  label: string;
  description: string;
  action: () => void;
}

export const CommandPalette: React.FC<CommandPaletteProps> = ({
  isOpen,
  onClose,
  onSelectSymbol,
  onSelectTab,
  onOpenOrderModal,
}) => {
  const [query, setQuery] = useState('');
  const [selectedIndex, setSelectedIndex] = useState(0);

  const allItems: CommandItem[] = [
    // Sayfalar
    {
      id: 'tab-market',
      category: 'Sayfa',
      label: 'Canlı Piyasa & Varlık Evreni',
      description: 'Hisse, kripto, altın ve TEFAS fiyat terminali',
      action: () => {
        onSelectTab('market');
        onClose();
      },
    },
    {
      id: 'tab-alpha',
      category: 'Sayfa',
      label: '60+ Alpha Feature & İndikatör Motoru',
      description: 'Momentum, volatilite, rejim ve çoklu zaman dilimi özellikleri',
      action: () => {
        onSelectTab('alpha');
        onClose();
      },
    },
    {
      id: 'tab-ml',
      category: 'Sayfa',
      label: 'Stacking Ensemble ML Motoru',
      description: 'XGBoost, LightGBM, RF ve Lojistik Meta-Learner boğa tahmini',
      action: () => {
        onSelectTab('ml');
        onClose();
      },
    },
    {
      id: 'tab-backtest',
      category: 'Sayfa',
      label: 'Walk-Forward Backtest Laboratuvarı',
      description: 'Strateji testleri, Sharpe, Sortino ve Drawdown analizleri',
      action: () => {
        onSelectTab('backtest');
        onClose();
      },
    },
    {
      id: 'tab-optuna',
      category: 'Sayfa',
      label: 'Optuna Bayesian Optimizasyon',
      description: 'TPESampler ile en karlı hiperparametre keşfi',
      action: () => {
        onSelectTab('optuna');
        onClose();
      },
    },
    {
      id: 'tab-risk_parity',
      category: 'Sayfa',
      label: 'Çoklu Varlık Risk Paritesi (ERC)',
      description: 'Scipy SLSQP ile eşit risk katkılı optimal portföy',
      action: () => {
        onSelectTab('risk_parity');
        onClose();
      },
    },
    {
      id: 'tab-paper',
      category: 'Sayfa',
      label: 'Sanal İşlemler (Paper Trading)',
      description: '250.000 ₺ sanal bakiye ile canlı pozisyon takibi',
      action: () => {
        onSelectTab('paper');
        onClose();
      },
    },
    {
      id: 'tab-events',
      category: 'Sayfa',
      label: 'Piyasa Olayları, Bilanço & Temettü Takvimi',
      description: 'Bilanço açıklamaları, temettü günleri ve FOMC/TCMB makro takvimi',
      action: () => {
        onSelectTab('market');
        onClose();
      },
    },

    // Varlıklar
    {
      id: 'sym-thyao',
      category: 'Hisse & Varlık',
      label: 'THYAO.IS · Türk Hava Yolları',
      description: 'BIST 30 Havacılık Devleti',
      action: () => {
        onSelectSymbol('THYAO.IS');
        onClose();
      },
    },
    {
      id: 'sym-eregl',
      category: 'Hisse & Varlık',
      label: 'EREGL.IS · Ereğli Demir Çelik',
      description: 'BIST 30 Demir Çelik & Temettü',
      action: () => {
        onSelectSymbol('EREGL.IS');
        onClose();
      },
    },
    {
      id: 'sym-asels',
      category: 'Hisse & Varlık',
      label: 'ASELS.IS · Aselsan Elektronik',
      description: 'BIST 30 Savunma Sanayii',
      action: () => {
        onSelectSymbol('ASELS.IS');
        onClose();
      },
    },
    {
      id: 'sym-sise',
      category: 'Hisse & Varlık',
      label: 'SISE.IS · Türkiye Şişe ve Cam',
      description: 'BIST 30 Küresel Cam Üreticisi',
      action: () => {
        onSelectSymbol('SISE.IS');
        onClose();
      },
    },
    {
      id: 'sym-aapl',
      category: 'Hisse & Varlık',
      label: 'AAPL · Apple Inc.',
      description: 'ABD Nasdaq Teknoloji Devi',
      action: () => {
        onSelectSymbol('AAPL');
        onClose();
      },
    },
    {
      id: 'sym-nvda',
      category: 'Hisse & Varlık',
      label: 'NVDA · NVIDIA Corporation',
      description: 'Yapay Zeka & GPU Lideri',
      action: () => {
        onSelectSymbol('NVDA');
        onClose();
      },
    },
    {
      id: 'sym-btc',
      category: 'Hisse & Varlık',
      label: 'BTC-USD · Bitcoin',
      description: 'Kripto Para Lideri',
      action: () => {
        onSelectSymbol('BTC-USD');
        onClose();
      },
    },

    // Altın & Emtia
    {
      id: 'sym-gram-altin',
      category: 'Altın & Emtia',
      label: 'Gram Altın (24 Ayar Has)',
      description: 'Spot & Kapalıçarşı Fiziki Fiyat',
      action: () => {
        onSelectSymbol('GC=F');
        onSelectTab('market');
        onClose();
      },
    },
    {
      id: 'sym-ceyrek',
      category: 'Altın & Emtia',
      label: 'Çeyrek Altın / Ata Lira',
      description: 'Kuyumcu Alış-Satış Makasları',
      action: () => {
        onSelectTab('market');
        onClose();
      },
    },

    // TEFAS Fonları
    {
      id: 'tefas-tcd',
      category: 'TEFAS Fonu',
      label: 'TCD · Tacirler Portföy Değişken',
      description: 'Hisse Yoğun Agresif Fon',
      action: () => {
        onSelectTab('market');
        onClose();
      },
    },
    {
      id: 'tefas-tta',
      category: 'TEFAS Fonu',
      label: 'TTA · İş Portföy Altın Fonu',
      description: 'Kıymetli Madenler Sepeti',
      action: () => {
        onSelectTab('market');
        onClose();
      },
    },
    {
      id: 'tefas-aft',
      category: 'TEFAS Fonu',
      label: 'AFT · Ak Portföy Yeni Teknolojiler',
      description: 'Yabancı Teknoloji Hisseleri',
      action: () => {
        onSelectTab('market');
        onClose();
      },
    },

    // Hızlı Aksiyonlar
    {
      id: 'act-order',
      category: 'Aksiyon',
      label: 'Yeni Sanal Emir Gir',
      description: 'Seçili hisse için anında alım/satım penceresi aç',
      action: () => {
        onOpenOrderModal('');
        onClose();
      },
    },
  ];

  const filtered = allItems.filter(
    (item) =>
      item.label.toLowerCase().includes(query.toLowerCase()) ||
      item.description.toLowerCase().includes(query.toLowerCase()) ||
      item.category.toLowerCase().includes(query.toLowerCase())
  );

  useEffect(() => {
    setSelectedIndex(0);
  }, [query]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!isOpen) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev < filtered.length - 1 ? prev + 1 : prev));
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setSelectedIndex((prev) => (prev > 0 ? prev - 1 : prev));
      } else if (e.key === 'Enter') {
        e.preventDefault();
        if (filtered[selectedIndex]) {
          filtered[selectedIndex].action();
        }
      } else if (e.key === 'Escape') {
        e.preventDefault();
        onClose();
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, filtered, selectedIndex, onClose]);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center pt-20 px-4 bg-black/75 backdrop-blur-sm animate-in fade-in duration-150">
      <div
        className="w-full max-w-2xl glass-panel-elevated rounded-2xl border border-slate-700/80 shadow-2xl overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Search Input Bar */}
        <div className="flex items-center px-4 py-3 border-b border-slate-800 gap-3">
          <Search className="w-5 h-5 text-[#00e5ff]" />
          <input
            autoFocus
            type="text"
            placeholder="Hisse, fon, altın, strateji veya sayfa ara (ör. THYAO, Backtest, TCD)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full bg-transparent text-sm text-white focus:outline-none font-mono"
          />
          <button
            onClick={onClose}
            className="cursor-pointer text-slate-400 hover:text-white p-1 rounded-lg hover:bg-slate-800"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Results List */}
        <div className="max-h-96 overflow-y-auto p-2 divide-y divide-slate-800/40">
          {filtered.length > 0 ? (
            filtered.map((item, idx) => {
              const isSelected = idx === selectedIndex;
              return (
                <div
                  key={item.id}
                  onClick={item.action}
                  onMouseEnter={() => setSelectedIndex(idx)}
                  className={`cursor-pointer px-3 py-2.5 rounded-lg flex items-center justify-between text-xs transition-colors ${
                    isSelected ? 'bg-[#00e5ff]/15 text-[#00e5ff]' : 'text-slate-300 hover:bg-slate-800/60'
                  }`}
                >
                  <div className="flex flex-col">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold font-mono text-white">{item.label}</span>
                      <span className="text-[10px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                        {item.category}
                      </span>
                    </div>
                    <span className="text-[11px] text-slate-400 font-mono mt-0.5">{item.description}</span>
                  </div>

                  <ArrowRight
                    className={`w-3.5 h-3.5 transition-transform ${
                      isSelected ? 'translate-x-1 text-[#00e5ff]' : 'text-slate-600'
                    }`}
                  />
                </div>
              );
            })
          ) : (
            <div className="p-8 text-center text-xs font-mono text-slate-500">
              "{query}" ile eşleşen bir araç veya sembol bulunamadı.
            </div>
          )}
        </div>

        {/* Footer shortcuts */}
        <div className="px-4 py-2.5 bg-slate-950/80 border-t border-slate-800/80 flex items-center justify-between text-[11px] font-mono text-slate-500">
          <div className="flex items-center gap-3">
            <span>
              <kbd className="bg-slate-800 text-slate-300 px-1 py-0.5 rounded border border-slate-700">↑↓</kbd> Gezin
            </span>
            <span>
              <kbd className="bg-slate-800 text-slate-300 px-1 py-0.5 rounded border border-slate-700">Enter</kbd> Seç
            </span>
            <span>
              <kbd className="bg-slate-800 text-slate-300 px-1 py-0.5 rounded border border-slate-700">Esc</kbd> Kapat
            </span>
          </div>
          <span>QuantStack Spotlight Engine</span>
        </div>
      </div>
    </div>
  );
};
