import React, { useState, useEffect } from 'react';
import {
  Calendar as CalendarIcon,
  ListFilter,
  DollarSign,
  TrendingUp,
  Globe2,
  ChevronLeft,
  ChevronRight,
  Flame,
  Zap,
  Search,
  ExternalLink,
  Clock,
  Building2,
  AlertCircle,
} from 'lucide-react';
import { MarketEvent, EventCategory, EventImpact } from '../types';
import { useMarketEvents } from '../hooks/useQuantQueries';

interface MarketEventsProps {
  onSelectSymbol: (symbol: string) => void;
}

export const MarketEvents: React.FC<MarketEventsProps> = ({ onSelectSymbol }) => {
  const { data: events = [], isLoading: loading } = useMarketEvents();
  const [viewMode, setViewMode] = useState<'calendar' | 'agenda'>('calendar');
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [selectedImpact, setSelectedImpact] = useState<string>('all');
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedDate, setSelectedDate] = useState<string | null>('2026-10-22');
  const [selectedEvent, setSelectedEvent] = useState<MarketEvent | null>(null);

  // Calendar Month State (Defaults to October 2026 based on mock context)
  const [currentYear, setCurrentYear] = useState<number>(2026);
  const [currentMonth, setCurrentMonth] = useState<number>(9); // 0-indexed: 9 = October

  const monthNames = [
    'Ocak',
    'Şubat',
    'Mart',
    'Nisan',
    'Mayıs',
    'Haziran',
    'Temmuz',
    'Ağustos',
    'Eylül',
    'Ekim',
    'Kasım',
    'Aralık',
  ];

  const weekDayNames = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

  useEffect(() => {
    if (events.length > 0 && !selectedEvent) {
      setSelectedEvent(events[0]);
    }
  }, [events, selectedEvent]);

  const handlePrevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const handleNextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  // Filter events
  const filteredEvents = events.filter((ev) => {
    const matchesCategory = selectedCategory === 'all' || ev.category === selectedCategory;
    const matchesImpact = selectedImpact === 'all' || ev.impact === selectedImpact;
    const matchesSearch =
      ev.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      (ev.symbol && ev.symbol.toLowerCase().includes(searchQuery.toLowerCase())) ||
      ev.description.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesImpact && matchesSearch;
  });

  // Calendar Day Generation
  const getDaysInMonth = (year: number, month: number) => {
    return new Date(year, month + 1, 0).getDate();
  };

  const getFirstDayOffset = (year: number, month: number) => {
    // 0 = Sunday, 1 = Monday... We want Monday = 0
    const day = new Date(year, month, 1).getDay();
    return (day + 6) % 7;
  };

  const daysInMonth = getDaysInMonth(currentYear, currentMonth);
  const firstDayOffset = getFirstDayOffset(currentYear, currentMonth);

  const getEventsForDay = (year: number, month: number, day: number) => {
    const monthStr = String(month + 1).padStart(2, '0');
    const dayStr = String(day).padStart(2, '0');
    const dateStr = `${year}-${monthStr}-${dayStr}`;
    return filteredEvents.filter((e) => e.date === dateStr);
  };

  const getCategoryColor = (cat: EventCategory) => {
    switch (cat) {
      case 'earnings':
        return 'text-[#00e5ff] border-[#00e5ff]/30 bg-[#00e5ff]/10';
      case 'dividend':
        return 'text-[#00ff88] border-[#00ff88]/30 bg-[#00ff88]/10';
      case 'macro':
        return 'text-amber-400 border-amber-400/30 bg-amber-400/10';
      default:
        return 'text-slate-300 border-slate-700 bg-slate-800';
    }
  };

  const getCategoryDot = (cat: EventCategory) => {
    switch (cat) {
      case 'earnings':
        return 'bg-[#00e5ff]';
      case 'dividend':
        return 'bg-[#00ff88]';
      case 'macro':
        return 'bg-amber-400';
      default:
        return 'bg-slate-400';
    }
  };

  const selectedDateEvents = selectedDate
    ? filteredEvents.filter((e) => e.date === selectedDate)
    : filteredEvents;

  return (
    <div className="space-y-6">
      {/* Top Header & Filtering Toolbar */}
      <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-4">
        <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2">
              <CalendarIcon className="w-5 h-5 text-[#00e5ff]" />
              <h1 className="text-base font-bold text-white font-display">
                Piyasa Olayları, Bilanço & Temettü Takvimi (MarketEvents)
              </h1>
            </div>
            <p className="text-xs text-slate-400 font-mono mt-0.5">
              BIST ve ABD bilanço tarihleri, nakit temettü hak edişleri ve Fed (FOMC) / TCMB makroekonomik veri takvimi
            </p>
          </div>

          {/* View Mode Toggle */}
          <div className="flex items-center gap-1 bg-slate-900/90 p-1 rounded-lg border border-slate-800">
            <button
              onClick={() => setViewMode('calendar')}
              className={`cursor-pointer px-3 py-1.5 text-xs font-mono rounded flex items-center gap-1.5 transition-colors ${
                viewMode === 'calendar'
                  ? 'bg-[#00e5ff]/20 text-[#00e5ff] font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              Takvim Görünümü
            </button>
            <button
              onClick={() => setViewMode('agenda')}
              className={`cursor-pointer px-3 py-1.5 text-xs font-mono rounded flex items-center gap-1.5 transition-colors ${
                viewMode === 'agenda'
                  ? 'bg-[#00e5ff]/20 text-[#00e5ff] font-semibold'
                  : 'text-slate-400 hover:text-white'
              }`}
            >
              <ListFilter className="w-3.5 h-3.5" />
              Gündem & Liste
            </button>
          </div>
        </div>

        {/* Filter Controls Row */}
        <div className="flex flex-wrap items-center justify-between gap-3 pt-2 border-t border-slate-800/80">
          <div className="flex flex-wrap items-center gap-2">
            {/* Category Filter */}
            <div className="flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-lg border border-slate-800 text-xs font-mono">
              <button
                onClick={() => setSelectedCategory('all')}
                className={`cursor-pointer px-2.5 py-1 rounded transition-colors ${
                  selectedCategory === 'all'
                    ? 'bg-slate-800 text-white font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                Tümü ({events.length})
              </button>
              <button
                onClick={() => setSelectedCategory('earnings')}
                className={`cursor-pointer px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                  selectedCategory === 'earnings'
                    ? 'bg-[#00e5ff]/20 text-[#00e5ff] font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <TrendingUp className="w-3 h-3 text-[#00e5ff]" />
                Bilançolar
              </button>
              <button
                onClick={() => setSelectedCategory('dividend')}
                className={`cursor-pointer px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                  selectedCategory === 'dividend'
                    ? 'bg-[#00ff88]/20 text-[#00ff88] font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <DollarSign className="w-3 h-3 text-[#00ff88]" />
                Temettüler
              </button>
              <button
                onClick={() => setSelectedCategory('macro')}
                className={`cursor-pointer px-2.5 py-1 rounded transition-colors flex items-center gap-1 ${
                  selectedCategory === 'macro'
                    ? 'bg-amber-400/20 text-amber-400 font-semibold'
                    : 'text-slate-400 hover:text-slate-200'
                }`}
              >
                <Globe2 className="w-3 h-3 text-amber-400" />
                Makro Veriler
              </button>
            </div>

            {/* Impact Filter */}
            <div className="flex items-center gap-1 bg-slate-900/80 p-0.5 rounded-lg border border-slate-800 text-xs font-mono">
              <button
                onClick={() => setSelectedImpact('all')}
                className={`cursor-pointer px-2 py-1 rounded transition-colors ${
                  selectedImpact === 'all' ? 'bg-slate-800 text-white font-semibold' : 'text-slate-400'
                }`}
              >
                Tüm Etkiler
              </button>
              <button
                onClick={() => setSelectedImpact('high')}
                className={`cursor-pointer px-2 py-1 rounded transition-colors flex items-center gap-1 ${
                  selectedImpact === 'high'
                    ? 'bg-rose-500/20 text-rose-400 font-semibold'
                    : 'text-slate-400'
                }`}
              >
                <Flame className="w-3 h-3 text-rose-400" />
                Yüksek Etki
              </button>
            </div>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <input
              type="text"
              placeholder="Olay, hisse veya kurum ara (FOMC, THYAO)..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full glass-input px-3.5 py-1.5 pl-8 text-xs font-mono rounded-lg"
            />
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2.5 top-2.5" />
          </div>
        </div>
      </div>

      {loading ? (
        <div className="h-64 glass-panel rounded-xl flex items-center justify-center text-xs font-mono text-slate-400">
          Takvim verileri yükleniyor...
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Calendar View / Agenda View (2 Columns) */}
          <div className="lg:col-span-2 space-y-4">
            {viewMode === 'calendar' ? (
              <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-4">
                {/* Month Navigator Bar */}
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <div className="flex items-center gap-3">
                    <h2 className="text-base font-bold font-mono text-white">
                      {monthNames[currentMonth]} {currentYear}
                    </h2>
                    <button
                      onClick={() => {
                        setCurrentYear(2026);
                        setCurrentMonth(9); // October
                        setSelectedDate('2026-10-22');
                      }}
                      className="cursor-pointer text-[11px] font-mono px-2 py-0.5 rounded bg-slate-800 hover:bg-slate-700 text-slate-300 transition-colors"
                    >
                      Bugün
                    </button>
                  </div>

                  <div className="flex items-center gap-1">
                    <button
                      onClick={handlePrevMonth}
                      className="cursor-pointer p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors border border-slate-800"
                    >
                      <ChevronLeft className="w-4 h-4" />
                    </button>
                    <button
                      onClick={handleNextMonth}
                      className="cursor-pointer p-1.5 rounded-lg bg-slate-900 hover:bg-slate-800 text-slate-300 transition-colors border border-slate-800"
                    >
                      <ChevronRight className="w-4 h-4" />
                    </button>
                  </div>
                </div>

                {/* Day of week headers */}
                <div className="grid grid-cols-7 gap-1 text-center font-mono text-xs text-slate-500 font-semibold py-1">
                  {weekDayNames.map((d) => (
                    <div key={d} className="py-1">
                      {d}
                    </div>
                  ))}
                </div>

                {/* Calendar Days Grid */}
                <div className="grid grid-cols-7 gap-1.5 font-mono text-xs">
                  {/* Empty offset padding */}
                  {Array.from({ length: firstDayOffset }).map((_, i) => (
                    <div key={`offset-${i}`} className="min-h-[84px] p-1.5 rounded-lg bg-slate-950/20 border border-transparent opacity-30" />
                  ))}

                  {/* Days of current month */}
                  {Array.from({ length: daysInMonth }).map((_, i) => {
                    const dayNum = i + 1;
                    const monthStr = String(currentMonth + 1).padStart(2, '0');
                    const dayStr = String(dayNum).padStart(2, '0');
                    const dateStr = `${currentYear}-${monthStr}-${dayStr}`;
                    const dayEvents = getEventsForDay(currentYear, currentMonth, dayNum);
                    const isSelected = selectedDate === dateStr;
                    const isToday = currentYear === 2026 && currentMonth === 9 && dayNum === 12;

                    return (
                      <div
                        key={dateStr}
                        onClick={() => {
                          setSelectedDate(dateStr);
                          if (dayEvents.length > 0) {
                            setSelectedEvent(dayEvents[0]);
                          }
                        }}
                        className={`min-h-[88px] p-2 rounded-lg border transition-all cursor-pointer flex flex-col justify-between ${
                          isSelected
                            ? 'bg-[#00e5ff]/10 border-[#00e5ff] shadow-[0_0_12px_rgba(0,229,255,0.2)]'
                            : isToday
                            ? 'bg-slate-900/90 border-slate-600'
                            : dayEvents.length > 0
                            ? 'bg-slate-900/60 border-slate-800 hover:border-slate-700'
                            : 'bg-slate-950/40 border-slate-900/60 hover:bg-slate-900/30'
                        }`}
                      >
                        <div className="flex items-center justify-between">
                          <span
                            className={`font-semibold text-xs tabular-nums ${
                              isToday
                                ? 'text-[#00e5ff] font-bold'
                                : isSelected
                                ? 'text-white font-bold'
                                : 'text-slate-400'
                            }`}
                          >
                            {dayNum}
                          </span>
                          {isToday && (
                            <span className="text-[9px] px-1 py-0.2 rounded bg-[#00e5ff]/20 text-[#00e5ff] font-bold">
                              Bugün
                            </span>
                          )}
                        </div>

                        {/* Events list within cell */}
                        <div className="space-y-1 mt-1 overflow-hidden">
                          {dayEvents.slice(0, 2).map((ev) => (
                            <div
                              key={ev.id}
                              onClick={(e) => {
                                e.stopPropagation();
                                setSelectedDate(dateStr);
                                setSelectedEvent(ev);
                              }}
                              className={`truncate text-[10px] px-1.5 py-0.5 rounded border transition-colors ${getCategoryColor(
                                ev.category
                              )}`}
                              title={ev.title}
                            >
                              <span className="font-semibold">{ev.symbol ? ev.symbol.replace('.IS', '') : ev.title.split(' ')[0]}</span>
                            </div>
                          ))}
                          {dayEvents.length > 2 && (
                            <span className="text-[9px] text-slate-500 block text-right font-mono">
                              +{dayEvents.length - 2} daha
                            </span>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            ) : (
              /* Agenda Timeline View */
              <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-center justify-between border-b border-slate-800/80 pb-3">
                  <h2 className="text-sm font-bold font-mono text-white">Kronolojik Olay Akışı (Gündem)</h2>
                  <span className="text-xs font-mono text-slate-400">{filteredEvents.length} Kayıtlı Olay</span>
                </div>

                <div className="space-y-3 max-h-[560px] overflow-y-auto pr-1">
                  {filteredEvents.map((ev) => {
                    const isSelected = selectedEvent?.id === ev.id;
                    return (
                      <div
                        key={ev.id}
                        onClick={() => {
                          setSelectedEvent(ev);
                          setSelectedDate(ev.date);
                        }}
                        className={`p-3.5 rounded-xl border transition-all cursor-pointer flex flex-col sm:flex-row sm:items-center justify-between gap-3 ${
                          isSelected
                            ? 'bg-[#00e5ff]/10 border-[#00e5ff] shadow-md'
                            : 'bg-slate-900/60 border-slate-800/80 hover:border-slate-700'
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <div
                            className={`w-2.5 h-2.5 rounded-full mt-1.5 shrink-0 ${getCategoryDot(ev.category)}`}
                          />
                          <div>
                            <div className="flex items-center gap-2">
                              <span className="text-xs font-bold text-white font-mono">{ev.title}</span>
                              {ev.symbol && (
                                <span className="text-[11px] font-mono px-1.5 py-0.2 rounded bg-slate-800 text-[#00e5ff] font-semibold">
                                  {ev.symbol}
                                </span>
                              )}
                              {ev.impact === 'high' && (
                                <span className="flex items-center text-[10px] font-mono text-rose-400 font-semibold">
                                  <Flame className="w-3 h-3 mr-0.5 inline" />
                                  Yüksek Etki
                                </span>
                              )}
                            </div>
                            <p className="text-xs text-slate-400 font-mono mt-1 line-clamp-1">{ev.description}</p>
                          </div>
                        </div>

                        <div className="flex sm:flex-col items-center sm:items-end justify-between text-xs font-mono text-slate-300 shrink-0">
                          <span className="font-semibold text-white">{ev.date}</span>
                          <span className="text-[11px] text-slate-400">{ev.time || 'Gün Boyu'}</span>
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Event Detail & Action Panel (1 Column) */}
          <div className="space-y-4">
            {selectedEvent ? (
              <div className="glass-panel p-5 rounded-xl border border-slate-800 space-y-4">
                <div className="flex items-start justify-between border-b border-slate-800/80 pb-3">
                  <div>
                    <span
                      className={`text-[10px] font-mono px-2 py-0.5 rounded border uppercase font-semibold ${getCategoryColor(
                        selectedEvent.category
                      )}`}
                    >
                      {selectedEvent.category === 'earnings'
                        ? 'Bilanço & Finansal Sonuç'
                        : selectedEvent.category === 'dividend'
                        ? 'Nakit Kar Payı (Temettü)'
                        : 'Makroekonomik Veri'}
                    </span>
                    <h3 className="text-base font-bold text-white font-display mt-2 leading-snug">
                      {selectedEvent.title}
                    </h3>
                  </div>

                  {selectedEvent.impact === 'high' && (
                    <span className="px-2 py-0.5 rounded bg-rose-500/20 text-rose-400 text-[10px] font-mono font-bold flex items-center shrink-0">
                      <Flame className="w-3 h-3 mr-1" />
                      Kritik
                    </span>
                  )}
                </div>

                {/* Event Schedule Info */}
                <div className="grid grid-cols-2 gap-3 text-xs font-mono">
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Tarih</span>
                    <span className="text-white font-bold mt-0.5 block">{selectedEvent.date}</span>
                  </div>
                  <div className="bg-slate-900/80 p-2.5 rounded-lg border border-slate-800">
                    <span className="text-slate-400 block text-[10px]">Açıklanma Zamanı</span>
                    <span className="text-[#00e5ff] font-bold mt-0.5 block">
                      {selectedEvent.time === 'AMC'
                        ? 'Piyasa Kapanışı Sonrası (AMC)'
                        : selectedEvent.time === 'BMO'
                        ? 'Piyasa Açılışı Öncesi (BMO)'
                        : selectedEvent.time || 'Gün Boyu'}
                    </span>
                  </div>
                </div>

                {/* Detailed Metric Box Based on Category */}
                {selectedEvent.category === 'earnings' && (
                  <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
                    <div className="flex items-center justify-between text-slate-300">
                      <span>Dönem:</span>
                      <span className="font-bold text-white">{selectedEvent.quarter || 'Q3 2026'}</span>
                    </div>
                    {selectedEvent.eps_forecast != null && (
                      <div className="flex items-center justify-between text-slate-300">
                        <span>Konsensüs EPS Beklentisi:</span>
                        <span className="font-bold text-[#00ff88]">
                          {selectedEvent.eps_forecast.toFixed(2)} {selectedEvent.country === 'US' ? '$' : '₺'}
                        </span>
                      </div>
                    )}
                    {selectedEvent.revenue_forecast && (
                      <div className="flex items-center justify-between text-slate-300">
                        <span>Beklenen Gelir / Hasılat:</span>
                        <span className="font-bold text-white">{selectedEvent.revenue_forecast}</span>
                      </div>
                    )}
                  </div>
                )}

                {selectedEvent.category === 'dividend' && (
                  <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
                    {selectedEvent.dividend_amount != null && (
                      <div className="flex items-center justify-between text-slate-300">
                        <span>Hisse Başına Brüt Temettü:</span>
                        <span className="font-bold text-[#00ff88]">
                          {selectedEvent.dividend_amount.toFixed(2)} {selectedEvent.country === 'US' ? '$' : '₺'}
                        </span>
                      </div>
                    )}
                    {selectedEvent.dividend_yield != null && (
                      <div className="flex items-center justify-between text-slate-300">
                        <span>Temettü Verimi:</span>
                        <span className="font-bold text-[#00e5ff]">%{selectedEvent.dividend_yield.toFixed(2)}</span>
                      </div>
                    )}
                    {selectedEvent.payment_date && (
                      <div className="flex items-center justify-between text-slate-300">
                        <span>Hesaba Geçiş Tarihi:</span>
                        <span className="font-bold text-white">{selectedEvent.payment_date}</span>
                      </div>
                    )}
                  </div>
                )}

                {selectedEvent.category === 'macro' && (
                  <div className="bg-slate-900/80 p-3.5 rounded-xl border border-slate-800 space-y-2 text-xs font-mono">
                    {selectedEvent.forecast && (
                      <div className="flex items-center justify-between text-slate-300">
                        <span>Piyasa Konsensüsü (Beklenti):</span>
                        <span className="font-bold text-[#00e5ff]">{selectedEvent.forecast}</span>
                      </div>
                    )}
                    {selectedEvent.previous && (
                      <div className="flex items-center justify-between text-slate-300">
                        <span>Önceki Dönem Değeri:</span>
                        <span className="font-bold text-slate-300">{selectedEvent.previous}</span>
                      </div>
                    )}
                    {selectedEvent.unit && (
                      <div className="flex items-center justify-between text-slate-400 text-[11px]">
                        <span>Gösterge Türü:</span>
                        <span>{selectedEvent.unit}</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Description Text */}
                <div className="text-xs text-slate-300 font-mono leading-relaxed bg-slate-950/60 p-3 rounded-lg border border-slate-800/60">
                  {selectedEvent.description}
                </div>

                {/* Direct Terminal Integration Action */}
                {selectedEvent.symbol && (
                  <button
                    onClick={() => onSelectSymbol(selectedEvent.symbol!)}
                    className="cursor-pointer w-full py-2.5 px-4 text-xs font-bold rounded-lg bg-gradient-to-r from-[#00e5ff] to-[#0077ff] text-black hover:opacity-90 transition-opacity font-mono flex items-center justify-center gap-2 shadow-[0_0_12px_rgba(0,229,255,0.25)]"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Bu Sembolü Terminalde İncele ({selectedEvent.symbol})
                  </button>
                )}
              </div>
            ) : (
              <div className="glass-panel p-8 rounded-xl border border-slate-800 text-center text-xs font-mono text-slate-500">
                Detayları görüntülemek için takvimden veya listeden bir olay seçin.
              </div>
            )}

            {/* Selected Date Day Summary */}
            {selectedDate && (
              <div className="glass-panel p-4 rounded-xl border border-slate-800 space-y-2">
                <span className="text-[11px] font-mono text-slate-400 block">
                  Seçili Günün Olayları ({selectedDate}):
                </span>
                {selectedDateEvents.length > 0 ? (
                  <div className="space-y-1.5">
                    {selectedDateEvents.map((ev) => (
                      <div
                        key={ev.id}
                        onClick={() => setSelectedEvent(ev)}
                        className={`p-2 rounded-lg border text-xs font-mono transition-colors cursor-pointer flex items-center justify-between ${
                          selectedEvent?.id === ev.id
                            ? 'bg-[#00e5ff]/15 border-[#00e5ff] text-white'
                            : 'bg-slate-900/60 border-slate-800/80 text-slate-300 hover:bg-slate-800'
                        }`}
                      >
                        <span className="truncate max-w-[180px]">{ev.title}</span>
                        <span className="text-[10px] text-slate-400 shrink-0">{ev.time || 'Gün Boyu'}</span>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p className="text-xs font-mono text-slate-500 py-2">
                    Bu tarihte planlanmış bir olay bulunmuyor.
                  </p>
                )}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
