import React from 'react';
import { Search, Terminal } from 'lucide-react';

interface TopBarProps {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  onOpenCommandPalette: () => void;
}

export const TopBar: React.FC<TopBarProps> = ({
  activeTab,
  setActiveTab,
  onOpenCommandPalette,
}) => {
  const navItems = [
    { id: 'market', label: 'Canlı Piyasa' },
    { id: 'alpha', label: '60+ Alpha' },
    { id: 'ml', label: 'Stacking ML' },
    { id: 'backtest', label: 'Backtest Lab' },
    { id: 'optuna', label: 'Optuna TPE' },
    { id: 'risk_parity', label: 'Risk Paritesi' },
    { id: 'paper', label: 'Sanal İşlemler' },
  ];

  return (
    <header className="sticky top-0 z-50 bg-[#080b11]/90 backdrop-blur-md border-b border-slate-800/80 px-6 py-3 flex items-center justify-between gap-8">
      {/* Zone 1: Single text element wordmark */}
      <div className="flex items-center gap-3 shrink-0">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00e5ff] to-[#0077ff] flex items-center justify-center text-black font-bold shadow-[0_0_15px_rgba(0,229,255,0.4)]">
          <Terminal className="w-4 h-4 text-[#080b11] stroke-[2.5]" />
        </div>
        <span className="text-base font-bold tracking-tight text-white whitespace-nowrap">
          QuantStack <span className="text-[#00e5ff] font-mono text-xs ml-1 font-semibold px-1.5 py-0.5 rounded bg-[#00e5ff]/10 border border-[#00e5ff]/20">AI</span>
        </span>
      </div>

      {/* Zone 2: Concise single-line navigation links */}
      <nav className="hidden lg:flex items-center gap-6 text-xs font-medium text-slate-300">
        {navItems.map((item) => (
          <button
            key={item.id}
            onClick={() => setActiveTab(item.id)}
            className={`cursor-pointer transition-colors whitespace-nowrap py-1 relative ${
              activeTab === item.id
                ? 'text-[#00e5ff] font-semibold'
                : 'text-slate-400 hover:text-slate-200'
            }`}
          >
            {item.label}
            {activeTab === item.id && (
              <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#00e5ff] shadow-[0_0_8px_#00e5ff]" />
            )}
          </button>
        ))}
      </nav>

      {/* Zone 3: 1 primary action (Command Palette search trigger) */}
      <div className="flex items-center gap-3 shrink-0">
        <button
          onClick={onOpenCommandPalette}
          className="cursor-pointer flex items-center gap-2 px-3 py-1.5 text-xs font-mono text-slate-300 bg-slate-900/80 hover:bg-slate-800 border border-slate-700/60 rounded-md transition-all shadow-inner group"
          title="Spotlight Arama (Ctrl+K)"
        >
          <Search className="w-3.5 h-3.5 text-slate-400 group-hover:text-[#00e5ff] transition-colors" />
          <span className="hidden sm:inline text-slate-400">Komut Paleti</span>
          <kbd className="text-[10px] bg-slate-800 text-slate-400 px-1.5 py-0.5 rounded border border-slate-700">
            Ctrl+K
          </kbd>
        </button>
      </div>
    </header>
  );
};
