"""
QuantStack Terminal - Quantitative Analysis & AI API Router
"""
from fastapi import APIRouter, Query, Body
import pandas as pd
from typing import Dict, Any, List
import yfinance as yf
from ..engines.indicators import IndicatorEngine
from ..engines.ml_engine import StackingEnsembleEngine
from ..engines.backtester import StrategyBacktester
from ..engines.optuna_optimizer import OptunaOptimizer
from ..engines.portfolio_risk_parity import RiskParityEngine

router = APIRouter(prefix="/api/analysis", tags=["Analysis"])

def _fetch_df(symbol: str, period: str = "1y") -> pd.DataFrame:
    ticker = yf.Ticker(symbol)
    hist = ticker.history(period=period)
    if hist.empty:
        raise ValueError("Veri bulunamadı")
    hist = hist.reset_index()
    hist.rename(columns={"Date": "date"}, inplace=True)
    return hist

@router.get("/indicators")
def get_indicators(symbol: str = Query("THYAO.IS")):
    """60+ Alpha özelliği ve teknik göstergeler"""
    try:
        df = _fetch_df(symbol)
        df_feat = IndicatorEngine.calculate_all_features(df)
        last_row = df_feat.iloc[-1].to_dict()
        # JSON serialize edilebilir hale getir
        clean_row = {k: round(float(v), 4) if isinstance(v, (int, float)) else str(v) for k, v in last_row.items()}
        return {"symbol": symbol, "features": clean_row}
    except Exception as e:
        return {"error": str(e), "symbol": symbol}

@router.get("/ml-stacking")
def get_ml_stacking(symbol: str = Query("THYAO.IS")):
    """Stacking Ensemble ML tahmini & kalibre olasılıklar"""
    try:
        df = _fetch_df(symbol)
        df_feat = IndicatorEngine.calculate_all_features(df)
        res = StackingEnsembleEngine.train_and_predict(df_feat)
        res["symbol"] = symbol
        return res
    except Exception as e:
        return {"error": str(e), "symbol": symbol}

@router.post("/backtest")
def run_backtest(payload: Dict[str, Any] = Body(...)):
    """Walk-Forward Backtest Laboratuvarı"""
    symbol = payload.get("symbol", "THYAO.IS")
    strategy = payload.get("strategy", "ai_stacking")
    sl = float(payload.get("stop_loss_pct", 3.0))
    tp = float(payload.get("take_profit_pct", 6.0))
    trailing = bool(payload.get("trailing_stop", True))
    comm = float(payload.get("commission_pct", 0.1))
    slippage = float(payload.get("slippage_pct", 0.05))
    capital = float(payload.get("initial_capital", 100000.0))

    try:
        df = _fetch_df(symbol)
        df_feat = IndicatorEngine.calculate_all_features(df)
        res = StrategyBacktester.run_backtest(
            df=df_feat,
            strategy_type=strategy,
            stop_loss_pct=sl,
            take_profit_pct=tp,
            trailing_stop=trailing,
            commission_pct=comm,
            slippage_pct=slippage,
            initial_capital=capital,
        )
        return res
    except Exception as e:
        return {"error": str(e)}

@router.post("/optuna-optimize")
def run_optuna_optimization(payload: Dict[str, Any] = Body(...)):
    """Optuna Bayesian hiperparametre optimizasyonu"""
    symbol = payload.get("symbol", "THYAO.IS")
    trials = int(payload.get("n_trials", 35))
    try:
        df = _fetch_df(symbol)
        df_feat = IndicatorEngine.calculate_all_features(df)
        return OptunaOptimizer.optimize_parameters(df_feat, n_trials=trials)
    except Exception as e:
        return {"error": str(e)}

@router.post("/risk-parity")
def calculate_risk_parity(payload: Dict[str, Any] = Body(...)):
    """Çoklu Varlık Risk Paritesi (ERC) & Korelasyon Matrisi"""
    symbols = payload.get("symbols", ["THYAO.IS", "EREGL.IS", "BTC-USD", "GC=F"])
    try:
        dfs = {}
        for s in symbols:
            ticker = yf.Ticker(s)
            h = ticker.history(period="1y")["Close"]
            dfs[s] = h.pct_change().dropna()
        
        returns_df = pd.DataFrame(dfs).dropna()
        return RiskParityEngine.calculate_erc_portfolio(returns_df)
    except Exception as e:
        return {"error": str(e)}
