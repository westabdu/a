export interface RibbonItem {
  symbol: string;
  name: string;
  price: number;
  change_pct: number;
  high: number;
  low: number;
}

export interface Candle {
  date: string;
  open: number;
  high: number;
  low: number;
  close: number;
  volume: number;
}

export interface Fundamentals {
  pe_ratio: number | null;
  pb_ratio: number | null;
  dividend_yield: number | null;
  market_cap: number | null;
  fifty_two_week_high: number | null;
  fifty_two_week_low: number | null;
  volume: number | null;
  currency: string;
}

export interface SymbolDetails {
  symbol: string;
  name: string;
  candles: Candle[];
  fundamentals: Fundamentals;
}

export interface GoldItem {
  id: string;
  name: string;
  weight_g: number;
  purity: number;
  buy_price: number;
  sell_price: number;
  currency: string;
  spread: number;
  spread_pct: number;
}

export interface GoldCommoditiesResponse {
  gold_ounce_usd: number;
  usd_try: number;
  spot_gram_gold_try: number;
  items: GoldItem[];
  gold_history: { date: string; price: number }[];
}

export interface TefasFund {
  code: string;
  name: string;
  category: string;
  price: number;
  daily_return: number;
  monthly_return: number;
  ytd_return: number;
  yearly_return: number;
  portfolio_size_m: number;
  investors: number;
  risk_level: number;
}

export interface MLResult {
  symbol: string;
  name: string;
  signal: 'GÜÇLÜ AL' | 'AL' | 'NÖTR' | 'SAT' | 'GÜÇLÜ SAT';
  bull_probability: number;
  confidence: number;
  is_sideways_regime: boolean;
  chop_index: number;
  adx_14: number;
  regime_warning: string;
  base_learners: {
    XGBoost: number;
    LightGBM: number;
    RandomForest: number;
    ExtraTrees: number;
    HistGradientBoost: number;
    MetaLearner: number;
  };
  top_features: { feature: string; importance: number }[];
}

export interface BacktestTrade {
  id: number;
  entry_date: string;
  exit_date: string;
  entry_price: number;
  exit_price: number;
  pnl: number;
  pnl_pct: number;
  reason: string;
}

export interface BacktestResult {
  symbol: string;
  name: string;
  total_return_pct: number;
  benchmark_return_pct: number;
  sharpe_ratio: number;
  sortino_ratio: number;
  max_drawdown_pct: number;
  win_rate_pct: number;
  profit_factor: number;
  total_trades: number;
  winning_trades: number;
  losing_trades: number;
  equity_curve: number[];
  benchmark_curve: number[];
  drawdown_curve: number[];
  dates: string[];
  trades: BacktestTrade[];
}

export interface OptunaTrial {
  trial: number;
  sharpe: number;
  return_pct: number;
  sl_pct: number;
  tp_pct: number;
  rsi_buy: number;
  rsi_sell: number;
  fast_ema: number;
  slow_ema: number;
}

export interface OptunaResult {
  n_trials: number;
  best_params: {
    stop_loss_pct: number;
    take_profit_pct: number;
    rsi_buy_level: number;
    rsi_sell_level: number;
    fast_ema_period: number;
    slow_ema_period: number;
    sharpe_ratio: number;
    total_return_pct: number;
  };
  best_sharpe: number;
  best_return_pct: number;
  trial_history: OptunaTrial[];
  param_importance: { param: string; importance: number }[];
}

export interface RiskParityAllocation {
  asset: string;
  erc_weight: number;
  equal_weight: number;
  min_var_weight: number;
  asset_volatility: number;
}

export interface RiskParityResult {
  assets: string[];
  allocations: RiskParityAllocation[];
  erc_portfolio_volatility: number;
  equal_weight_volatility: number;
  min_var_volatility: number;
  correlation: {
    assets: string[];
    matrix: number[][];
  };
}

export interface PaperPosition {
  id: string;
  symbol: string;
  qty: number;
  entry_price: number;
  current_price: number;
  stop_loss: number | null;
  take_profit: number | null;
  opened_at: string;
}

export interface PaperTradeHistoryItem {
  id: string;
  symbol: string;
  side: string;
  qty: number;
  entry_price: number;
  exit_price: number;
  pnl: number;
  pnl_pct: number;
  closed_at: string;
}

export interface PaperPortfolio {
  balance: number;
  initial_balance: number;
  positions: PaperPosition[];
  history: PaperTradeHistoryItem[];
  updated_at: string;
}

export type EventCategory = 'earnings' | 'dividend' | 'macro';
export type EventImpact = 'high' | 'medium' | 'low';

export interface MarketEvent {
  id: string;
  date: string; // YYYY-MM-DD
  time?: string; // e.g. "14:00", "BMO" (Before Market Open), "AMC" (After Market Close)
  category: EventCategory;
  title: string;
  symbol?: string; // e.g. "THYAO.IS", "AAPL"
  impact: EventImpact;
  country?: string; // "TR", "US", "EU", "GLOBAL"
  
  // Earnings-specific details
  quarter?: string; // "Q3 2026"
  eps_forecast?: number;
  eps_actual?: number;
  revenue_forecast?: string; // e.g. "94.5 Mrd ₺"
  
  // Dividend-specific details
  dividend_amount?: number; // e.g. 5.40 ₺
  dividend_yield?: number; // e.g. 6.8%
  payment_date?: string;
  
  // Macro-specific details
  previous?: string;
  forecast?: string;
  actual?: string;
  unit?: string;
  description: string;
}

