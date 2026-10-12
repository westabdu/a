"""
QuantStack Terminal - Market Data Service (yfinance fetcher & caching)
"""
import yfinance as yf
import pandas as pd
import numpy as np
from typing import Dict, Any, Optional
from datetime import datetime, timedelta

class MarketDataService:
    @staticmethod
    def get_ticker_ribbon() -> list:
        """Canlı Ticker Şeridi için temel varlıkları döner"""
        symbols = ["XU100.IS", "USDTRY=X", "EURTRY=X", "GC=F", "BZ=F", "BTC-USD", "^GSPC"]
        results = []
        for sym in symbols:
            try:
                ticker = yf.Ticker(sym)
                hist = ticker.history(period="5d")
                if not hist.empty and len(hist) >= 2:
                    last_price = float(hist["Close"].iloc[-1])
                    prev_close = float(hist["Close"].iloc[-2])
                    change_pct = ((last_price - prev_close) / prev_close) * 100.0
                    results.append({
                        "symbol": sym,
                        "price": round(last_price, 2),
                        "change_pct": round(change_pct, 2),
                        "high": round(float(hist["High"].iloc[-1]), 2),
                        "low": round(float(hist["Low"].iloc[-1]), 2),
                    })
            except Exception:
                pass
        return results

    @staticmethod
    def get_symbol_details(symbol: str, period: str = "1y") -> Dict[str, Any]:
        """Sembol geçmiş verisi ve temel analiz oranları"""
        try:
            ticker = yf.Ticker(symbol)
            hist = ticker.history(period=period)
            info = getattr(ticker, "info", {})
            
            candles = []
            for idx, row in hist.iterrows():
                candles.append({
                    "date": idx.strftime("%Y-%m-%d"),
                    "open": round(float(row["Open"]), 2),
                    "high": round(float(row["High"]), 2),
                    "low": round(float(row["Low"]), 2),
                    "close": round(float(row["Close"]), 2),
                    "volume": int(row["Volume"]),
                })

            fundamentals = {
                "pe_ratio": info.get("trailingPE", None),
                "pb_ratio": info.get("priceToBook", None),
                "dividend_yield": round(info.get("dividendYield", 0) * 100, 2) if info.get("dividendYield") else None,
                "market_cap": info.get("marketCap", None),
                "fifty_two_week_high": info.get("fiftyTwoWeekHigh", None),
                "fifty_two_week_low": info.get("fiftyTwoWeekLow", None),
                "volume": info.get("regularMarketVolume", None),
                "name": info.get("shortName", symbol),
                "currency": info.get("currency", "TRY"),
            }

            return {
                "symbol": symbol,
                "candles": candles,
                "fundamentals": fundamentals,
            }
        except Exception as e:
            return {"error": str(e), "symbol": symbol, "candles": [], "fundamentals": {}}
