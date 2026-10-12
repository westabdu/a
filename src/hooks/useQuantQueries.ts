/**
 * QuantStack Terminal - Unified React Query Hooks
 * Caches API responses across Market, Alpha Indicators, ML Stacking,
 * TEFAS, Gold & Commodities, Events, and Paper Trading to eliminate
 * redundant network requests when switching tabs.
 */
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  RibbonItem,
  SymbolDetails,
  GoldCommoditiesResponse,
  TefasFund,
  MarketEvent,
  MLResult,
  PaperPortfolio,
} from '../types';

// Generic fetcher with error handling
async function fetchJson<T>(url: string, options?: RequestInit): Promise<T> {
  const res = await fetch(url, options);
  if (!res.ok) {
    let msg = `HTTP error ${res.status}`;
    try {
      const err = await res.json();
      if (err.error) msg = err.error;
    } catch {
      // ignore json parse error
    }
    throw new Error(msg);
  }
  return res.json();
}

/**
 * 1. Ticker Ribbon Query: auto-refreshes every 30s, cached so switching tabs never triggers unnecessary fetches
 */
export function useTickerRibbon() {
  return useQuery<RibbonItem[]>({
    queryKey: ['tickerRibbon'],
    queryFn: () => fetchJson<RibbonItem[]>('/api/market/ribbon'),
    staleTime: 30_000,
    refetchInterval: 30_000,
  });
}

/**
 * 2. Symbol Details (Candles & Fundamentals): cached per symbol and period for 2 minutes
 */
export function useSymbolData(symbol: string, period: string = '1y') {
  return useQuery<SymbolDetails>({
    queryKey: ['symbolData', symbol, period],
    queryFn: () => fetchJson<SymbolDetails>(`/api/market/symbol?symbol=${encodeURIComponent(symbol)}&period=${period}`),
    staleTime: 60_000,
    enabled: !!symbol,
  });
}

/**
 * 3. Gold & Commodities: cached for 60 seconds
 */
export function useGoldCommodities() {
  return useQuery<GoldCommoditiesResponse>({
    queryKey: ['goldCommodities'],
    queryFn: () => fetchJson<GoldCommoditiesResponse>('/api/market/gold-commodities'),
    staleTime: 60_000,
  });
}

/**
 * 4. TEFAS Mutual Funds: cached for 2 minutes
 */
export function useTefasFunds() {
  return useQuery<TefasFund[]>({
    queryKey: ['tefasFunds'],
    queryFn: () => fetchJson<TefasFund[]>('/api/market/tefas'),
    staleTime: 120_000,
  });
}

/**
 * 5. Market Events (Earnings, Dividends, Macroeconomic releases): cached for 3 minutes
 */
export function useMarketEvents() {
  return useQuery<MarketEvent[]>({
    queryKey: ['marketEvents'],
    queryFn: () => fetchJson<MarketEvent[]>('/api/market/events'),
    staleTime: 180_000,
  });
}

/**
 * 6. 60+ Alpha Features & Indicators: cached per symbol for 60 seconds
 */
export function useAlphaIndicators(symbol: string) {
  return useQuery<{ symbol: string; features: Record<string, any>; last_candle: any }>({
    queryKey: ['alphaIndicators', symbol],
    queryFn: () => fetchJson(`/api/analysis/indicators?symbol=${encodeURIComponent(symbol)}`),
    staleTime: 60_000,
    enabled: !!symbol,
  });
}

/**
 * 7. Stacking Ensemble ML Predictions: cached per symbol for 60 seconds
 */
export function useMLStacking(symbol: string) {
  return useQuery<MLResult>({
    queryKey: ['mlStacking', symbol],
    queryFn: () => fetchJson<MLResult>(`/api/analysis/ml-stacking?symbol=${encodeURIComponent(symbol)}`),
    staleTime: 60_000,
    enabled: !!symbol,
  });
}

/**
 * 8. Paper Trading Portfolio & Trades: cached for 5 seconds with automatic invalidation on trade actions
 */
export function usePaperPortfolio() {
  return useQuery<PaperPortfolio>({
    queryKey: ['paperPortfolio'],
    queryFn: () => fetchJson<PaperPortfolio>('/api/trading/portfolio'),
    staleTime: 5_000,
  });
}

/**
 * 9. Order Execution Mutation
 */
export function useOrderMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (orderPayload: {
      symbol: string;
      side: 'BUY' | 'SELL';
      qty: number;
      price: number;
      stop_loss?: number | null;
      take_profit?: number | null;
    }) =>
      fetchJson<{ success: boolean; data: PaperPortfolio }>('/api/trading/order', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(orderPayload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paperPortfolio'] });
    },
  });
}

/**
 * 10. Close Position Mutation
 */
export function useClosePositionMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { position_id: string; current_price: number }) =>
      fetchJson<{ success: boolean; data: PaperPortfolio }>('/api/trading/close', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paperPortfolio'] });
    },
  });
}

/**
 * 11. Reset Portfolio Mutation
 */
export function useResetPortfolioMutation() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () =>
      fetchJson<PaperPortfolio>('/api/trading/reset', {
        method: 'POST',
      }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['paperPortfolio'] });
    },
  });
}
