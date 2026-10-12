"""
QuantStack Terminal - Walk-Forward Strategy Backtest Laboratory
Simulates AI signals or rule-based strategies with Stop-Loss, Take-Profit, Trailing Stop, Slippage, and Commission.
"""
import numpy as np
import pandas as pd
from typing import Dict, Any, List

class StrategyBacktester:
    @staticmethod
    def run_backtest(
        df: pd.DataFrame,
        strategy_type: str = "ai_stacking",
        stop_loss_pct: float = 3.0,
        take_profit_pct: float = 6.0,
        trailing_stop: bool = True,
        commission_pct: float = 0.1,
        slippage_pct: float = 0.05,
        initial_capital: float = 100000.0,
    ) -> Dict[str, Any]:
        """
        Walk-Forward backtest simülasyonu.
        Döner: Kümülatif Getiri Eğrisi, Drawdown, Sharpe, Sortino, Win Rate, Trade Log.
        """
        if len(df) < 30:
            return {"error": "Backtest için yetersiz veri"}

        df = df.copy().reset_index(drop=True)
        n = len(df)
        
        # Sinyal Üretimi
        signals = np.zeros(n)  # 1 = Al, -1 = Sat, 0 = Tut
        if strategy_type == "rsi_reversal":
            rsi = df["rsi_14"].values if "rsi_14" in df else np.zeros(n)
            for i in range(1, n):
                if rsi[i-1] < 30 and rsi[i] >= 30:
                    signals[i] = 1
                elif rsi[i-1] > 70 and rsi[i] <= 70:
                    signals[i] = -1
        elif strategy_type == "ema_cross":
            ema_fast = df["ema_9"].values if "ema_9" in df else df["Close"].rolling(9).mean().values
            ema_slow = df["ema_21"].values if "ema_21" in df else df["Close"].rolling(21).mean().values
            for i in range(1, n):
                if ema_fast[i-1] <= ema_slow[i-1] and ema_fast[i] > ema_slow[i]:
                    signals[i] = 1
                elif ema_fast[i-1] >= ema_slow[i-1] and ema_fast[i] < ema_slow[i]:
                    signals[i] = -1
        else: # AI Stacking / Multi-factor Sinyali
            # Simüle edilmiş veya türetilmiş ML sinyali
            c = df["Close"].values
            ema50 = df["ema_50"].values if "ema_50" in df else c
            rsi = df["rsi_14"].values if "rsi_14" in df else np.full(n, 50.0)
            macd_h = df["macd_hist"].values if "macd_hist" in df else np.zeros(n)
            chop = df["choppiness_index"].values if "choppiness_index" in df else np.full(n, 50.0)

            for i in range(2, n):
                # Testere rejiminde işlemden kaçın, trendde momentum kırılımı ara
                is_chop = chop[i] > 61.8
                bull_condition = (c[i] > ema50[i]) and (macd_h[i] > 0) and (rsi[i] > 48) and (not is_chop)
                bear_condition = (c[i] < ema50[i]) or (macd_h[i] < 0) or (rsi[i] < 42)
                if bull_condition and signals[i-1] <= 0:
                    signals[i] = 1
                elif bear_condition and signals[i-1] > 0:
                    signals[i] = -1

        # Simülasyon Durum Değişkenleri
        capital = initial_capital
        position = 0.0  # adet
        entry_price = 0.0
        peak_price = 0.0
        in_trade = False
        trades: List[Dict[str, Any]] = []
        equity_curve: List[float] = [initial_capital]
        benchmark_curve: List[float] = [initial_capital]
        initial_price = float(df["Close"].iloc[0])

        for i in range(1, n):
            current_date = str(df["date"].iloc[i] if "date" in df else i)
            price = float(df["Close"].iloc[i])
            benchmark_curve.append(initial_capital * (price / initial_price))

            if in_trade:
                if price > peak_price:
                    peak_price = price
                
                # Çıkış Kuralları Kontrolü
                exit_reason = None
                pnl_pct = ((price - entry_price) / entry_price) * 100.0

                # 1. Stop-Loss
                if pnl_pct <= -stop_loss_pct:
                    exit_reason = "Stop-Loss"
                # 2. Take-Profit
                elif pnl_pct >= take_profit_pct:
                    exit_reason = "Take-Profit"
                # 3. Trailing Stop (Zirveden çekilme)
                elif trailing_stop and ((peak_price - price) / peak_price) * 100.0 >= (stop_loss_pct * 0.8) and pnl_pct > 1.0:
                    exit_reason = "Trailing Stop"
                # 4. Sat Sinyali
                elif signals[i] == -1:
                    exit_reason = "Sinyal Çıkışı"

                if exit_reason:
                    # Satış Emri Gerçekleştir
                    effective_exit = price * (1.0 - (slippage_pct / 100.0))
                    gross_revenue = position * effective_exit
                    commission = gross_revenue * (commission_pct / 100.0)
                    capital += (gross_revenue - commission)
                    realized_pnl = gross_revenue - commission - (position * entry_price)
                    realized_pnl_pct = ((effective_exit - entry_price) / entry_price) * 100.0

                    trades.append({
                        "id": len(trades) + 1,
                        "entry_date": entry_date,
                        "exit_date": current_date,
                        "entry_price": round(entry_price, 2),
                        "exit_price": round(effective_exit, 2),
                        "pnl": round(realized_pnl, 2),
                        "pnl_pct": round(realized_pnl_pct, 2),
                        "reason": exit_reason,
                    })

                    position = 0.0
                    in_trade = False
            else:
                # Alış Sinyali Kontrolü
                if signals[i] == 1:
                    effective_entry = price * (1.0 + (slippage_pct / 100.0))
                    commission = capital * (commission_pct / 100.0)
                    available = capital - commission
                    position = available / effective_entry
                    entry_price = effective_entry
                    peak_price = effective_entry
                    entry_date = current_date
                    capital = 0.0
                    in_trade = True

            # Gün sonu portföy değeri
            current_val = capital + (position * price if in_trade else 0.0)
            equity_curve.append(current_val)

        # Metrik Hesaplamaları
        equity_series = pd.Series(equity_curve)
        daily_returns = equity_series.pct_change().dropna()
        total_return_pct = ((equity_curve[-1] - initial_capital) / initial_capital) * 100.0
        final_price = float(df["Close"].iloc[-1])
        bh_return_pct = ((final_price - initial_price) / initial_price) * 100.0

        # Sharpe & Sortino Oranları
        ann_mean = daily_returns.mean() * 252
        ann_std = daily_returns.std() * np.sqrt(252) + 1e-9
        sharpe = round(float(ann_mean / ann_std), 2)

        downside_std = daily_returns[daily_returns < 0].std() * np.sqrt(252) + 1e-9
        sortino = round(float(ann_mean / downside_std), 2)

        # Max Drawdown
        running_max = np.maximum.accumulate(equity_series)
        drawdowns = (equity_series - running_max) / (running_max + 1e-9) * 100.0
        max_drawdown = round(float(drawdowns.min()), 2)

        # İşlem İstatistikleri
        winning_trades = [t for t in trades if t["pnl"] > 0]
        losing_trades = [t for t in trades if t["pnl"] <= 0]
        win_rate = round((len(winning_trades) / len(trades) * 100.0) if trades else 0.0, 1)

        gross_profit = sum(t["pnl"] for t in winning_trades)
        gross_loss = abs(sum(t["pnl"] for t in losing_trades))
        profit_factor = round(gross_profit / (gross_loss + 1e-9), 2) if gross_loss > 0 else 9.99

        dates = [str(df["date"].iloc[i] if "date" in df else f"G{i}") for i in range(len(equity_curve))]

        return {
            "total_return_pct": round(total_return_pct, 2),
            "benchmark_return_pct": round(bh_return_pct, 2),
            "sharpe_ratio": sharpe,
            "sortino_ratio": sortino,
            "max_drawdown_pct": max_drawdown,
            "win_rate_pct": win_rate,
            "profit_factor": profit_factor,
            "total_trades": len(trades),
            "winning_trades": len(winning_trades),
            "losing_trades": len(losing_trades),
            "equity_curve": [round(x, 2) for x in equity_curve],
            "benchmark_curve": [round(x, 2) for x in benchmark_curve],
            "drawdown_curve": [round(x, 2) for x in drawdowns.tolist()],
            "dates": dates,
            "trades": trades[-25:],  # Son 25 işlem
        }
